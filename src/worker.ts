import crypto from 'node:crypto';

/**
 * QALBIE Cloudflare Worker
 * Handles:
 *  - /api/payment/* → Duitku Gateway Integration
 *  - * → serve static assets (Vite build)
 */

interface Env {
  ASSETS: Fetcher;
  DUITKU_MERCHANT_CODE?: string;
  DUITKU_API_KEY?: string;
  DUITKU_IS_SANDBOX?: string;
  VITE_DUITKU_MERCHANT_CODE?: string;
  VITE_DUITKU_API_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // ─────────────────────────────────────────────────────────
    // ROUTER
    // ─────────────────────────────────────────────────────────
    if (url.pathname.startsWith('/api/payment/')) {
      return handlePaymentRoutes(request, env, url);
    }

    // Serve static assets for anything else
    return env.ASSETS.fetch(request);
  },
};

// ─────────────────────────────────────────────────────────
// PAYMENT ROUTES HANDLER
// ─────────────────────────────────────────────────────────
async function handlePaymentRoutes(request: Request, env: Env, url: URL): Promise<Response> {
  const merchantCode = env.DUITKU_MERCHANT_CODE || env.VITE_DUITKU_MERCHANT_CODE || '';
  const apiKey = env.DUITKU_API_KEY || env.VITE_DUITKU_API_KEY || '';
  const isSandbox = (env.DUITKU_IS_SANDBOX || 'true') === 'true';

  const baseUrl = isSandbox 
    ? 'https://api-sandbox.duitku.com/api/merchant' 
    : 'https://api-prod.duitku.com/api/merchant';

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { 
      status: 405, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  try {
    // 1. CREATE PAYMENT (INQUIRY V2)
    if (url.pathname === '/api/payment/create') {
      const body = await request.json() as any;
      const { amount, packageName, customerName, email, phoneNumber, userId, tierId } = body;

      const merchantOrderId = `QALBIE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const paymentAmount = parseInt(amount, 10);
      
      // Save Pending Transaction to Supabase FIRST
      if (env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY && userId && tierId) {
        try {
          await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/membership_history`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
              user_id: userId,
              to_tier_id: tierId,
              change_type: 'pending_payment',
              payment_ref: merchantOrderId,
              reason: 'Menunggu Pembayaran Duitku'
            })
          });
        } catch (e) {
          console.error('Gagal mencatat pending transaksi di Supabase', e);
        }
      }

      // HMAC-SHA256(merchantCode + timestamp, apiKey)
      const timestamp = Date.now().toString();
      const stringToSign = `${merchantCode}${timestamp}`;
      const signature = crypto.createHmac('sha256', apiKey).update(stringToSign).digest('hex');

      const payload = {
        paymentAmount: paymentAmount,
        merchantOrderId: merchantOrderId,
        productDetails: packageName || 'Qalbie Membership',
        email: email || 'user@qalbie.id',
        customerVaName: customerName || 'Qalbie User',
        phoneNumber: phoneNumber || '081234567890',
        itemDetails: [{
          name: packageName || 'Qalbie Membership',
          price: paymentAmount,
          quantity: 1
        }],
        customerDetail: {
          firstName: customerName || 'Qalbie',
          lastName: 'User',
          email: email || 'user@qalbie.id',
          phoneNumber: phoneNumber || '081234567890'
        },
        callbackUrl: `${url.origin}/api/payment/webhook`,
        returnUrl: `${url.origin}/membership`,
        expiryPeriod: 1440
      };

      const res = await fetch(`${baseUrl}/createInvoice`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-duitku-signature': signature,
          'x-duitku-timestamp': timestamp,
          'x-duitku-merchantcode': merchantCode
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json() as any;
      
      if (data.statusCode === '00' && data.paymentUrl) {
        return new Response(JSON.stringify({
          paymentUrl: data.paymentUrl,
          merchantOrderId: merchantOrderId,
          reference: data.reference
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({ error: data.statusMessage || 'Gagal generate URL pembayaran Duitku' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 2. CHECK PAYMENT STATUS
    if (url.pathname === '/api/payment/status') {
      const body = await request.json() as any;
      const { merchantOrderId } = body;

      // Check transaction status uses basic MD5 on Duitku
      // For status, some endpoints still use MD5 or we can use the same header auth.
      // Duitku API Status might be under /transactionStatus. Let's try the header auth.
      const timestamp = Date.now().toString();
      const stringToSign = `${merchantCode}${timestamp}`;
      const signature = crypto.createHmac('sha256', apiKey).update(stringToSign).digest('hex');

      const payload = {
        merchantOrderId: merchantOrderId
      };

      const res = await fetch(`${baseUrl}/transactionStatus`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-duitku-signature': signature,
          'x-duitku-timestamp': timestamp,
          'x-duitku-merchantcode': merchantCode
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json() as any;
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. GET PAYMENT METHODS (Optional, jika menggunakan Hosted Checkout Core)
    if (url.pathname === '/api/payment/methods') {
      const body = await request.json() as any;
      const paymentAmount = parseInt(body.amount, 10);
      
      // MD5(merchantCode + paymentAmount + datetime + apiKey) 
      // This endpoint is slightly different, usually datetime is required. 
      // But we are using Pop / v2 inquiry, so methods endpoint is not strictly needed for Pop since Pop UI shows all methods.
      // We will just return an empty array if called, because Duitku Pop handles method selection.
      return new Response(JSON.stringify({ paymentMethods: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 4. WEBHOOK CALLBACK FROM DUITKU
    if (url.pathname === '/api/payment/webhook') {
      const formData = await request.formData();
      const merchantCodeCb = formData.get('merchantCode') as string;
      const amountCb = formData.get('amount') as string;
      const merchantOrderIdCb = formData.get('merchantOrderId') as string;
      const signatureCb = formData.get('signature') as string;
      const referenceCb = formData.get('reference') as string;
      const resultCodeCb = formData.get('resultCode') as string;

      // Validasi Signature Callback: HMAC-SHA256(merchantCode + amount + merchantOrderId, apiKey)
      const expectedSigStr = `${merchantCodeCb}${amountCb}${merchantOrderIdCb}`;
      const expectedSig = crypto.createHmac('sha256', apiKey).update(expectedSigStr).digest('hex');

      if (signatureCb !== expectedSig) {
        return new Response('Bad Signature', { status: 400 });
      }

      if (resultCodeCb === '00' && env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY) {
        // Pembayaran berhasil! Update via RPC di Supabase
        const supabaseUrl = env.VITE_SUPABASE_URL;
        const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

        try {
          await fetch(`${supabaseUrl}/rest/v1/rpc/handle_duitku_webhook`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({
              p_merchant_order_id: merchantOrderIdCb,
              p_reference: referenceCb,
              p_status: 'SUCCESS'
            })
          });
        } catch (e) {
          console.error("Failed updating Supabase", e);
        }
      }

      return new Response('OK', { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), { 
      status: 404, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}
