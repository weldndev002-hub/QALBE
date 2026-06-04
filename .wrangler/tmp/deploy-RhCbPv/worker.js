var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/worker.ts
import { createHmac } from "node:crypto";
function makeDuitkuSignature(merchantCode, merchantOrderId, paymentAmount, apiKey) {
  const str = merchantCode + merchantOrderId + paymentAmount;
  return createHmac("sha256", apiKey).update(str).digest("hex");
}
__name(makeDuitkuSignature, "makeDuitkuSignature");
function verifyCallbackSignature(merchantCode, amount, merchantOrderId, apiKey, receivedSig) {
  const str = merchantCode + amount + merchantOrderId;
  const expected = createHmac("sha256", apiKey).update(str).digest("hex");
  return expected === receivedSig;
}
__name(verifyCallbackSignature, "verifyCallbackSignature");
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
}
__name(corsHeaders, "corsHeaders");
async function handleCreatePayment(request, env) {
  try {
    const body = await request.json();
    const { packageName, tierId, amount, billing, email, customerName, userId } = body;
    if (!amount || !email || !tierId) {
      return Response.json({ error: "Parameter tidak lengkap" }, { status: 400, headers: corsHeaders() });
    }
    const isSandbox = env.DUITKU_IS_SANDBOX !== "false";
    const baseUrl = isSandbox ? "https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry" : "https://passport.duitku.com/webapi/api/merchant/v2/inquiry";
    const merchantCode = env.DUITKU_MERCHANT_CODE;
    const apiKey = env.DUITKU_API_KEY;
    const merchantOrderId = `QALBIE-${tierId}-${billing[0].toUpperCase()}-${Date.now()}`;
    const host = new URL(request.url).origin;
    const callbackUrl = `${host}/callback`;
    const returnUrl = `${host}/membership?status=success&orderId=${merchantOrderId}`;
    const signature = makeDuitkuSignature(merchantCode, merchantOrderId, amount, apiKey);
    const duitkuPayload = {
      merchantCode,
      paymentAmount: amount,
      paymentMethod: "ALL",
      // tampilkan semua metode pembayaran
      merchantOrderId,
      productDetails: `Qalbie ${packageName} Membership (${billing === "monthly" ? "Bulanan" : "Tahunan"})`,
      additionalParam: JSON.stringify({ userId, tierId, billing }),
      merchantUserInfo: userId,
      customerVaName: customerName || email.split("@")[0],
      email,
      phoneNumber: "",
      itemDetails: [{
        name: `Qalbie ${packageName} Membership`,
        price: amount,
        quantity: 1
      }],
      customerDetail: {
        firstName: customerName || email.split("@")[0],
        lastName: "",
        email,
        phoneNumber: ""
      },
      callbackUrl,
      returnUrl,
      signature,
      expiryPeriod: 60
      // 60 menit
    };
    const duitkuRes = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(duitkuPayload)
    });
    const duitkuData = await duitkuRes.json();
    if (!duitkuRes.ok || duitkuData.statusCode !== "00") {
      return Response.json(
        { error: duitkuData.statusMessage || "Gagal membuat transaksi" },
        { status: 400, headers: corsHeaders() }
      );
    }
    return Response.json({
      paymentUrl: duitkuData.paymentUrl,
      merchantOrderId,
      reference: duitkuData.reference
    }, { headers: corsHeaders() });
  } catch (err) {
    return Response.json({ error: err.message || "Internal error" }, { status: 500, headers: corsHeaders() });
  }
}
__name(handleCreatePayment, "handleCreatePayment");
async function handleCallback(request, env) {
  try {
    const formData = await request.formData();
    const merchantCode = formData.get("merchantCode");
    const amount = formData.get("amount");
    const merchantOrderId = formData.get("merchantOrderId");
    const additionalParam = formData.get("additionalParam");
    const resultCode = formData.get("resultCode");
    const signature = formData.get("signature");
    if (!verifyCallbackSignature(merchantCode, amount, merchantOrderId, env.DUITKU_API_KEY, signature)) {
      return new Response("Bad Signature", { status: 400 });
    }
    if (resultCode === "00") {
      let userId = "";
      let tierId = 0;
      let billing = "monthly";
      try {
        const params = JSON.parse(additionalParam || "{}");
        userId = params.userId || "";
        tierId = params.tierId || 0;
        billing = params.billing || "monthly";
      } catch {
      }
      if (userId && tierId && env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY) {
        const durationMonths = billing === "yearly" ? 12 : 1;
        const expiresAt = new Date(Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1e3).toISOString();
        await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/user_memberships`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": env.VITE_SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${env.VITE_SUPABASE_ANON_KEY}`,
            "Prefer": "resolution=merge-duplicates"
          },
          body: JSON.stringify({
            user_id: userId,
            tier_id: tierId,
            status: "active",
            started_at: (/* @__PURE__ */ new Date()).toISOString(),
            expires_at: expiresAt,
            notes: `Pembayaran via Duitku | Order: ${merchantOrderId}`,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          })
        });
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
            change_type: "renewal",
            reason: `Pembayaran Duitku sukses | Order: ${merchantOrderId}`,
            payment_ref: merchantOrderId,
            created_at: (/* @__PURE__ */ new Date()).toISOString()
          })
        });
      }
    }
    return new Response("OK", { status: 200 });
  } catch (err) {
    return new Response("Error: " + err.message, { status: 500 });
  }
}
__name(handleCallback, "handleCallback");
async function handleCheckStatus(request, env) {
  try {
    const { merchantOrderId } = await request.json();
    const isSandbox = env.DUITKU_IS_SANDBOX !== "false";
    const baseUrl = isSandbox ? "https://sandbox.duitku.com/webapi/api/merchant/transactionStatus" : "https://passport.duitku.com/webapi/api/merchant/transactionStatus";
    const merchantCode = env.DUITKU_MERCHANT_CODE;
    const apiKey = env.DUITKU_API_KEY;
    const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19);
    const sigStr = `${merchantCode}${merchantOrderId}${timestamp}`;
    const signature = createHmac("sha256", apiKey).update(sigStr).digest("hex");
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merchantCode, merchantOrderId, signature })
    });
    const data = await res.json();
    return Response.json(data, { headers: corsHeaders() });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500, headers: corsHeaders() });
  }
}
__name(handleCheckStatus, "handleCheckStatus");
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { method, pathname } = { method: request.method, pathname: url.pathname };
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }
    if (pathname === "/api/payment/create" && method === "POST") {
      return handleCreatePayment(request, env);
    }
    if (pathname === "/api/payment/status" && method === "POST") {
      return handleCheckStatus(request, env);
    }
    if (pathname === "/callback" && method === "POST") {
      return handleCallback(request, env);
    }
    if (pathname === "/callback" && method === "GET") {
      return env.ASSETS.fetch(new Request(new URL("/membership" + url.search, url.origin).toString(), request));
    }
    return env.ASSETS.fetch(request);
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
