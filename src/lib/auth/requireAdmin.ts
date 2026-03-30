import { cookies } from "next/headers";
import { adminCookieName, verifyAdminCookieValue } from "./adminCookie";

export async function requireAdminOrNull() {
  const cookieValue = cookies().get(adminCookieName())?.value;
  if (!cookieValue) return null;
  const authed = await verifyAdminCookieValue(cookieValue);
  return authed ? true : null;
}

