var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/worker.ts
import crypto from "node:crypto";
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/payment/")) {
      return handlePaymentRoutes(request, env, url);
    }
    return env.ASSETS.fetch(request);
  }
};
async function handlePaymentRoutes(request, env, url) {
  const merchantCode = env.DUITKU_MERCHANT_CODE || env.VITE_DUITKU_MERCHANT_CODE || "";
  const apiKey = env.DUITKU_API_KEY || env.VITE_DUITKU_API_KEY || "";
  const isSandbox = (env.DUITKU_IS_SANDBOX || "true") === "true";
  const baseUrl = isSandbox ? "https://api-sandbox.duitku.com/api/merchant" : "https://api-prod.duitku.com/api/merchant";
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    if (url.pathname === "/api/payment/create") {
      const body = await request.json();
      const { amount, packageName, customerName, email, phoneNumber, userId, tierId } = body;
      const merchantOrderId = `QALBIE-${Date.now()}-${Math.floor(Math.random() * 1e3)}`;
      const paymentAmount = parseInt(amount, 10);
      if (env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY && userId && tierId) {
        try {
          await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/membership_history`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": env.VITE_SUPABASE_ANON_KEY,
              "Authorization": `Bearer ${env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
              user_id: userId,
              to_tier_id: tierId,
              change_type: "pending_payment",
              payment_ref: merchantOrderId,
              reason: "Menunggu Pembayaran Duitku"
            })
          });
        } catch (e) {
          console.error("Gagal mencatat pending transaksi di Supabase", e);
        }
      }
      const timestamp = Date.now().toString();
      const stringToSign = `${merchantCode}${timestamp}`;
      const signature = crypto.createHmac("sha256", apiKey).update(stringToSign).digest("hex");
      const payload = {
        paymentAmount,
        merchantOrderId,
        productDetails: packageName || "Qalbie Membership",
        email: email || "user@qalbie.id",
        customerVaName: customerName || "Qalbie User",
        phoneNumber: phoneNumber || "081234567890",
        itemDetails: [{
          name: packageName || "Qalbie Membership",
          price: paymentAmount,
          quantity: 1
        }],
        customerDetail: {
          firstName: customerName || "Qalbie",
          lastName: "User",
          email: email || "user@qalbie.id",
          phoneNumber: phoneNumber || "081234567890"
        },
        callbackUrl: `${url.origin}/api/payment/webhook`,
        returnUrl: `${url.origin}/membership`,
        expiryPeriod: 1440
      };
      const res = await fetch(`${baseUrl}/createInvoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-duitku-signature": signature,
          "x-duitku-timestamp": timestamp,
          "x-duitku-merchantcode": merchantCode
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.statusCode === "00" && data.paymentUrl) {
        return new Response(JSON.stringify({
          paymentUrl: data.paymentUrl,
          merchantOrderId,
          reference: data.reference
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } else {
        return new Response(JSON.stringify({ error: data.statusMessage || "Gagal generate URL pembayaran Duitku" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    if (url.pathname === "/api/payment/status") {
      const body = await request.json();
      const { merchantOrderId } = body;
      const timestamp = Date.now().toString();
      const stringToSign = `${merchantCode}${timestamp}`;
      const signature = crypto.createHmac("sha256", apiKey).update(stringToSign).digest("hex");
      const payload = {
        merchantOrderId
      };
      const res = await fetch(`${baseUrl}/transactionStatus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-duitku-signature": signature,
          "x-duitku-timestamp": timestamp,
          "x-duitku-merchantcode": merchantCode
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (url.pathname === "/api/payment/methods") {
      const body = await request.json();
      const paymentAmount = parseInt(body.amount, 10);
      return new Response(JSON.stringify({ paymentMethods: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (url.pathname === "/api/payment/webhook") {
      const formData = await request.formData();
      const merchantCodeCb = formData.get("merchantCode");
      const amountCb = formData.get("amount");
      const merchantOrderIdCb = formData.get("merchantOrderId");
      const signatureCb = formData.get("signature");
      const referenceCb = formData.get("reference");
      const resultCodeCb = formData.get("resultCode");
      const expectedSigStr = `${merchantCodeCb}${amountCb}${merchantOrderIdCb}`;
      const expectedSig = crypto.createHmac("sha256", apiKey).update(expectedSigStr).digest("hex");
      if (signatureCb !== expectedSig) {
        return new Response("Bad Signature", { status: 400 });
      }
      if (resultCodeCb === "00" && env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY) {
        const supabaseUrl = env.VITE_SUPABASE_URL;
        const supabaseKey = env.VITE_SUPABASE_ANON_KEY;
        try {
          await fetch(`${supabaseUrl}/rest/v1/rpc/handle_duitku_webhook`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": supabaseKey,
              "Authorization": `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({
              p_merchant_order_id: merchantOrderIdCb,
              p_reference: referenceCb,
              p_status: "SUCCESS"
            })
          });
        } catch (e) {
          console.error("Failed updating Supabase", e);
        }
      }
      return new Response("OK", { status: 200 });
    }
    return new Response(JSON.stringify({ error: "Endpoint not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(handlePaymentRoutes, "handlePaymentRoutes");
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
