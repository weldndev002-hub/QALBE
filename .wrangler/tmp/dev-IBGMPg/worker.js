var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-jTO4ox/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// src/worker.ts
import { createHmac, createHash } from "node:crypto";
function makeDuitkuSignature(merchantCode, merchantOrderId, paymentAmount, apiKey) {
  const str = merchantCode + merchantOrderId + paymentAmount;
  return createHmac("sha256", apiKey).update(str).digest("hex");
}
__name(makeDuitkuSignature, "makeDuitkuSignature");
function verifyCallbackSignature(merchantCode, amount, merchantOrderId, apiKey, receivedSig) {
  const strMD5 = merchantCode + amount + merchantOrderId + apiKey;
  const expectedMD5 = createHash("md5").update(strMD5).digest("hex");
  const strHMAC = merchantCode + amount + merchantOrderId;
  const expectedHMAC = createHmac("sha256", apiKey).update(strHMAC).digest("hex");
  console.log(`[Duitku Callback] Sig Check - Received: ${receivedSig}, MD5: ${expectedMD5}, HMAC: ${expectedHMAC}`);
  return receivedSig === expectedMD5 || receivedSig === expectedHMAC;
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
    const { packageName, tierId, amount, billing, email, customerName, userId, paymentMethod, phoneNumber } = body;
    if (!amount || !email || !tierId || !paymentMethod) {
      return Response.json({ error: "Parameter tidak lengkap" }, { status: 400, headers: corsHeaders() });
    }
    const isSandbox = env.DUITKU_IS_SANDBOX !== "false";
    const baseUrl = isSandbox ? "https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry" : "https://passport.duitku.com/webapi/api/merchant/v2/inquiry";
    const merchantCode = env.DUITKU_MERCHANT_CODE;
    const apiKey = env.DUITKU_API_KEY;
    const merchantOrderId = `QALBIE-${tierId}-${billing[0].toUpperCase()}-${Date.now()}`;
    const host = new URL(request.url).origin;
    const callbackUrl = `${host}/callback`;
    const returnUrl = `${host}/membership?from_payment=true&orderId=${merchantOrderId}`;
    const signature = makeDuitkuSignature(merchantCode, merchantOrderId, amount, apiKey);
    const duitkuPayload = {
      merchantCode,
      paymentAmount: amount,
      paymentMethod,
      // Gunakan metode pembayaran yang dipilih user
      merchantOrderId,
      productDetails: `Qalbie ${packageName} Membership (${billing === "monthly" ? "Bulanan" : "Tahunan"})`,
      additionalParam: JSON.stringify({ userId, tierId, billing }),
      merchantUserInfo: userId,
      customerVaName: customerName || email.split("@")[0],
      email,
      phoneNumber: phoneNumber || "081234567890",
      // OVO dan LinkAja mewajibkan nomor HP
      itemDetails: [{
        name: `Qalbie ${packageName} Membership`,
        price: amount,
        quantity: 1
      }],
      customerDetail: {
        firstName: customerName || email.split("@")[0],
        lastName: "",
        email,
        phoneNumber: phoneNumber || "081234567890"
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
        { error: `Duitku Error: ${duitkuData.statusMessage || JSON.stringify(duitkuData)}` },
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
      console.error(`[Duitku Callback] Invalid signature for order ${merchantOrderId}`);
      return new Response("Bad Signature", { status: 400 });
    }
    console.log(`[Duitku Callback] Signature OK for order ${merchantOrderId}. ResultCode: ${resultCode}`);
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
        const rpcRes = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/rpc/update_user_membership_webhook`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": env.VITE_SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            p_user_id: userId,
            p_tier_id: tierId,
            p_expires_at: expiresAt,
            p_notes: `Pembayaran via Duitku | Order: ${merchantOrderId}`
          })
        });
        console.log(`[Duitku Callback] RPC Update Response: ${rpcRes.status} ${rpcRes.statusText}`);
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
    return new Response("SUCCESS", { status: 200 });
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
async function handleGetPaymentMethods(request, env) {
  try {
    const { amount } = await request.json();
    if (!amount) {
      return Response.json({ error: "Parameter amount diperlukan" }, { status: 400, headers: corsHeaders() });
    }
    const isSandbox = env.DUITKU_IS_SANDBOX !== "false";
    const baseUrl = isSandbox ? "https://sandbox.duitku.com/webapi/api/merchant/paymentmethod/getpaymentmethod" : "https://passport.duitku.com/webapi/api/merchant/paymentmethod/getpaymentmethod";
    const merchantCode = env.DUITKU_MERCHANT_CODE;
    const apiKey = env.DUITKU_API_KEY;
    const now = /* @__PURE__ */ new Date();
    const localNow = new Date(now.getTime() + 7 * 60 * 60 * 1e3);
    const datetime = localNow.toISOString().replace("T", " ").substring(0, 19);
    const sigStr = `${merchantCode}${amount}${datetime}${apiKey}`;
    const signature = createHmac("sha256", apiKey).update(sigStr).digest("hex");
    const payload = {
      merchantcode: merchantCode,
      amount,
      datetime,
      signature
    };
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.responseCode !== "00") {
      return Response.json(
        { error: data.responseMessage || "Gagal mengambil metode pembayaran" },
        { status: 400, headers: corsHeaders() }
      );
    }
    return Response.json({
      paymentMethods: data.paymentFee || []
    }, { headers: corsHeaders() });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500, headers: corsHeaders() });
  }
}
__name(handleGetPaymentMethods, "handleGetPaymentMethods");
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
    if (pathname === "/api/payment/methods" && method === "POST") {
      return handleGetPaymentMethods(request, env);
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

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-jTO4ox/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-jTO4ox/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
