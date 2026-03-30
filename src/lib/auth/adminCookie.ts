const COOKIE_NAME = "admin_session";

export function adminCookieName() {
  return COOKIE_NAME;
}

function getCookieSecret() {
  const secret = process.env.ADMIN_COOKIE_SECRET;
  if (!secret) throw new Error("Missing environment variable ADMIN_COOKIE_SECRET");
  return secret;
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacSha256Hex(secret: string, token: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(token));
  return toHex(new Uint8Array(sig));
}

export async function signAdminToken(token: string) {
  const secret = getCookieSecret();
  return hmacSha256Hex(secret, token);
}

export async function createAdminCookieValue() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const token = toHex(bytes);
  const signature = await signAdminToken(token);
  return { token, value: `${token}.${signature}` };
}

export async function verifyAdminCookieValue(cookieValue: string) {
  try {
    const secret = getCookieSecret();
    const parts = cookieValue.split(".");
    if (parts.length !== 2) return false;
    const [token, signature] = parts;

    const expected = await hmacSha256Hex(secret, token);
    if (expected.length !== signature.length) return false;

    // Constant-time-ish compare for equal-length hex strings.
    let ok = 0;
    for (let i = 0; i < signature.length; i++) {
      ok |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    return ok === 0;
  } catch {
    // If the secret is missing/misconfigured, treat as unauthenticated rather than crashing middleware.
    return false;
  }
}

