/**
 * QALBIE Cloudflare Worker
 * Handles:
 *  - POST /api/payment/create  → buat transaksi Duitku
 *  - POST /callback            → terima notifikasi pembayaran dari Duitku
 *  - GET  /callback            → redirect kembali dari Duitku setelah bayar
 *  - *                         → serve static assets (Vite build)
 */

import { createHmac, createHash } from 'node:crypto';

interface Env {
  ASSETS: Fetcher;
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_API_BASE_URL: string;
  DUITKU_MERCHANT_CODE: string;
  DUITKU_API_KEY: string;
  DUITKU_IS_SANDBOX: string; // "true" | "false"
}

// ─── Helper: HMAC-SHA256 signature Duitku ────────────────────────────────────
function makeDuitkuSignature(merchantCode: string, merchantOrderId: string, paymentAmount: number, apiKey: string): string {
  const str = merchantCode + merchantOrderId + paymentAmount;
  return createHmac('sha256', apiKey).update(str).digest('hex');
}

function verifyCallbackSignature(merchantCode: string, amount: string, merchantOrderId: string, apiKey: string, receivedSig: string): boolean {
  const strMD5 = merchantCode + amount + merchantOrderId + apiKey;
  const expectedMD5 = createHash('md5').update(strMD5).digest('hex');
  
  const strHMAC = merchantCode + amount + merchantOrderId;
  const expectedHMAC = createHmac('sha256', apiKey).update(strHMAC).digest('hex');
  
  console.log(`[Duitku Callback] Sig Check - Received: ${receivedSig}, MD5: ${expectedMD5}, HMAC: ${expectedHMAC}`);
  
  return receivedSig === expectedMD5 || receivedSig === expectedHMAC;
}

// ─── CORS headers ─────────────────────────────────────────────────────────────
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// ─── Handler: Buat Transaksi Duitku ──────────────────────────────────────────
async function handleCreatePayment(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as {
      packageName: string;
      packageSlug: string;
      tierId: number;
      amount: number;
      billing: 'monthly' | 'yearly';
      email: string;
      customerName: string;
      userId: string;
      paymentMethod: string;
      phoneNumber?: string;
    };

    const { packageName, tierId, amount, billing, email, customerName, userId, paymentMethod, phoneNumber } = body;

    if (!amount || !email || !tierId || !paymentMethod) {
      return Response.json({ error: 'Parameter tidak lengkap' }, { status: 400, headers: corsHeaders() });
    }

    const isSandbox = env.DUITKU_IS_SANDBOX !== 'false';
    const baseUrl = isSandbox
      ? 'https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry'
      : 'https://passport.duitku.com/webapi/api/merchant/v2/inquiry';

    const merchantCode = env.DUITKU_MERCHANT_CODE;
    const apiKey = env.DUITKU_API_KEY;
    const merchantOrderId = `QALBIE-${tierId}-${billing[0].toUpperCase()}-${Date.now()}`;
    
    // URL dinamis berdasarkan host request
    const host = new URL(request.url).origin;
    const callbackUrl = `${host}/callback`;
    const returnUrl = `${host}/membership?from_payment=true&orderId=${merchantOrderId}`;

    const signature = makeDuitkuSignature(merchantCode, merchantOrderId, amount, apiKey);

    const duitkuPayload = {
      merchantCode,
      paymentAmount: amount,
      paymentMethod: paymentMethod, // Gunakan metode pembayaran yang dipilih user
      merchantOrderId,
      productDetails: `Qalbie ${packageName} Membership (${billing === 'monthly' ? 'Bulanan' : 'Tahunan'})`,
      additionalParam: JSON.stringify({ userId, tierId, billing }),
      merchantUserInfo: userId,
      customerVaName: customerName || email.split('@')[0],
      email,
      phoneNumber: phoneNumber || '081234567890', // OVO dan LinkAja mewajibkan nomor HP
      itemDetails: [{
        name: `Qalbie ${packageName} Membership`,
        price: amount,
        quantity: 1,
      }],
      customerDetail: {
        firstName: customerName || email.split('@')[0],
        lastName: '',
        email,
        phoneNumber: phoneNumber || '081234567890',
      },
      callbackUrl,
      returnUrl,
      signature,
      expiryPeriod: 60, // 60 menit
    };

    const duitkuRes = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(duitkuPayload),
    });

    const duitkuData = await duitkuRes.json() as any;

    if (!duitkuRes.ok || duitkuData.statusCode !== '00') {
      return Response.json(
        { error: `Duitku Error: ${duitkuData.statusMessage || JSON.stringify(duitkuData)}` },
        { status: 400, headers: corsHeaders() }
      );
    }

    return Response.json({
      paymentUrl: duitkuData.paymentUrl,
      merchantOrderId,
      reference: duitkuData.reference,
    }, { headers: corsHeaders() });

  } catch (err: any) {
    return Response.json({ error: err.message || 'Internal error' }, { status: 500, headers: corsHeaders() });
  }
}

// ─── Handler: Callback dari Duitku (POST x-www-form-urlencoded) ───────────────
async function handleCallback(request: Request, env: Env): Promise<Response> {
  try {
    const formData = await request.formData();
    const merchantCode = formData.get('merchantCode') as string;
    const amount = formData.get('amount') as string;
    const merchantOrderId = formData.get('merchantOrderId') as string;
    const additionalParam = formData.get('additionalParam') as string;
    const resultCode = formData.get('resultCode') as string;
    const signature = formData.get('signature') as string;

    // Verifikasi signature
    if (!verifyCallbackSignature(merchantCode, amount, merchantOrderId, env.DUITKU_API_KEY, signature)) {
      console.error(`[Duitku Callback] Invalid signature for order ${merchantOrderId}`);
      return new Response('Bad Signature', { status: 400 });
    }
    
    console.log(`[Duitku Callback] Signature OK for order ${merchantOrderId}. ResultCode: ${resultCode}`);

    // Hanya proses jika sukses (resultCode === '00')
    if (resultCode === '00') {
      // Parse additionalParam untuk ambil userId & tierId
      let userId = '';
      let tierId = 0;
      let billing = 'monthly';
      
      try {
        const params = JSON.parse(additionalParam || '{}');
        userId = params.userId || '';
        tierId = params.tierId || 0;
        billing = params.billing || 'monthly';
      } catch {}

      // Update membership di Supabase jika userId & tierId ada
      if (userId && tierId && env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY) {
        const durationMonths = billing === 'yearly' ? 12 : 1;
        const expiresAt = new Date(Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000).toISOString();

        // Gunakan RPC (Postgres Function) untuk bypass RLS
        const rpcRes = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/rpc/update_user_membership_webhook`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            p_user_id: userId,
            p_tier_id: tierId,
            p_expires_at: expiresAt,
            p_notes: `Pembayaran via Duitku | Order: ${merchantOrderId}`
          }),
        });
        
        console.log(`[Duitku Callback] RPC Update Response: ${rpcRes.status} ${rpcRes.statusText}`);

        // Catat ke membership_history
        await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/membership_history`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            user_id: userId,
            to_tier_id: tierId,
            change_type: 'renewal',
            reason: `Pembayaran Duitku sukses | Order: ${merchantOrderId}`,
            payment_ref: merchantOrderId,
            created_at: new Date().toISOString(),
          }),
        });
      }
    }

    return new Response('SUCCESS', { status: 200 });
  } catch (err: any) {
    return new Response('Error: ' + err.message, { status: 500 });
  }
}

// ─── Handler: Cek status transaksi ────────────────────────────────────────────
async function handleCheckStatus(request: Request, env: Env): Promise<Response> {
  try {
    const { merchantOrderId } = await request.json() as { merchantOrderId: string };
    const isSandbox = env.DUITKU_IS_SANDBOX !== 'false';
    const baseUrl = isSandbox
      ? 'https://sandbox.duitku.com/webapi/api/merchant/transactionStatus'
      : 'https://passport.duitku.com/webapi/api/merchant/transactionStatus';

    const merchantCode = env.DUITKU_MERCHANT_CODE;
    const apiKey = env.DUITKU_API_KEY;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const sigStr = `${merchantCode}${merchantOrderId}${timestamp}`;
    const signature = createHmac('sha256', apiKey).update(sigStr).digest('hex');

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchantCode, merchantOrderId, signature }),
    });

    const data = await res.json();
    return Response.json(data, { headers: corsHeaders() });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500, headers: corsHeaders() });
  }
}

// ─── Handler: Ambil Metode Pembayaran (getPaymentMethod) ──────────────────────
async function handleGetPaymentMethods(request: Request, env: Env): Promise<Response> {
  try {
    const { amount } = await request.json() as { amount: number };
    
    if (!amount) {
      return Response.json({ error: 'Parameter amount diperlukan' }, { status: 400, headers: corsHeaders() });
    }

    const isSandbox = env.DUITKU_IS_SANDBOX !== 'false';
    const baseUrl = isSandbox
      ? 'https://sandbox.duitku.com/webapi/api/merchant/paymentmethod/getpaymentmethod'
      : 'https://passport.duitku.com/webapi/api/merchant/paymentmethod/getpaymentmethod';

    const merchantCode = env.DUITKU_MERCHANT_CODE;
    const apiKey = env.DUITKU_API_KEY;
    
    // datetime format: YYYY-MM-DD HH:mm:ss
    const now = new Date();
    // Gunakan UTC+7 untuk waktu
    const localNow = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const datetime = localNow.toISOString().replace('T', ' ').substring(0, 19);
    
    // signature = SHA256(merchantcode + amount + datetime + apiKey)
    const sigStr = `${merchantCode}${amount}${datetime}${apiKey}`;
    const signature = createHmac('sha256', apiKey).update(sigStr).digest('hex');

    const payload = {
      merchantcode: merchantCode,
      amount,
      datetime,
      signature
    };

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json() as any;

    if (data.responseCode !== '00') {
      return Response.json(
        { error: data.responseMessage || 'Gagal mengambil metode pembayaran' },
        { status: 400, headers: corsHeaders() }
      );
    }

    return Response.json({
      paymentMethods: data.paymentFee || []
    }, { headers: corsHeaders() });

  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500, headers: corsHeaders() });
  }
}

// ─── Main fetch handler ───────────────────────────────────────────────────────
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { method, pathname } = { method: request.method, pathname: url.pathname };

    // Preflight CORS
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    // API: Buat transaksi pembayaran
    if (pathname === '/api/payment/create' && method === 'POST') {
      return handleCreatePayment(request, env);
    }

    // API: Cek status transaksi
    if (pathname === '/api/payment/status' && method === 'POST') {
      return handleCheckStatus(request, env);
    }

    // API: Ambil metode pembayaran
    if (pathname === '/api/payment/methods' && method === 'POST') {
      return handleGetPaymentMethods(request, env);
    }

    // API: Callback dari Duitku
    if (pathname === '/callback' && method === 'POST') {
      return handleCallback(request, env);
    }

    // GET /callback (redirect setelah bayar) → teruskan ke SPA
    // SPA akan baca query params ?status=success&orderId=...
    if (pathname === '/callback' && method === 'GET') {
      return env.ASSETS.fetch(new Request(new URL('/membership' + url.search, url.origin).toString(), request));
    }

    // Forward semua request lain ke static assets (Vite build)
    return env.ASSETS.fetch(request);
  },
};
