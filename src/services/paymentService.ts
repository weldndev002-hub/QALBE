/**
 * Payment Service — QALBIE
 * Menghubungkan frontend ke /api/payment/create
 * yang di-handle oleh Cloudflare Worker (production) atau wrangler dev (local).
 *
 * CORS NOTES:
 * Browser TIDAK BISA call Duitku langsung — Duitku tidak support CORS.
 * Semua request ke Duitku harus melalui server-side (Worker).
 *
 * Dev setup:
 *   Terminal 1: npm run dev         → Vite di port 5173 (proxy /api → 8787)
 *   Terminal 2: npm run dev:worker  → wrangler dev di port 8787
 */

export interface CreatePaymentParams {
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
}

export interface CreatePaymentResult {
  paymentUrl: string;
  merchantOrderId: string;
  reference: string;
}

/**
 * Buat transaksi pembayaran.
 * Selalu melalui /api/payment/create (Worker) — tidak pernah direct ke Duitku dari browser.
 * Di dev mode, Vite proxy meneruskan ke wrangler dev (port 8787).
 */
export async function createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
  const res = await fetch('/api/payment/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  // Handle jika wrangler dev belum berjalan (dev mode)
  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try {
      const data = await res.json() as any;
      errMsg = data.error || errMsg;
    } catch {}

    // Jika di dev mode dan worker tidak berjalan, berikan pesan yang jelas
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      throw new Error(
        'Worker dev server tidak berjalan.\n' +
        'Buka terminal baru dan jalankan:\n\n  npm run dev:worker\n\n' +
        'Lalu coba lagi.'
      );
    }

    throw new Error(errMsg || 'Gagal membuat transaksi pembayaran');
  }

  const data = await res.json() as any;

  if (data.error) {
    throw new Error(data.error);
  }

  return {
    paymentUrl: data.paymentUrl,
    merchantOrderId: data.merchantOrderId,
    reference: data.reference,
  };
}

/**
 * Cek status transaksi via Worker API
 */
export async function checkPaymentStatus(merchantOrderId: string): Promise<'SUCCESS' | 'PENDING' | 'FAILED'> {
  try {
    const res = await fetch('/api/payment/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchantOrderId }),
    });

    if (!res.ok) return 'PENDING';
    const data = await res.json() as any;

    if (data.statusCode === '00') return 'SUCCESS';
    if (data.statusCode === '01') return 'PENDING';
    return 'FAILED';
  } catch {
    return 'PENDING';
  }
}

/**
 * Ambil daftar metode pembayaran dari Duitku via Worker
 */
export async function getPaymentMethods(amount: number): Promise<any[]> {
  try {
    const res = await fetch('/api/payment/methods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });

    if (!res.ok) return [];
    const data = await res.json() as any;
    return data.paymentMethods || [];
  } catch {
    return [];
  }
}
