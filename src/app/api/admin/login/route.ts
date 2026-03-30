import { z } from "zod";
import { NextResponse } from "next/server";
import { createAdminCookieValue, adminCookieName } from "@/lib/auth/adminCookie";

const LoginSchema = z.object({
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: "BAD_REQUEST", message: "Invalid request body", details: parsed.error.flatten() } },
        { status: 400 }
      );
    }

    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) {
      return NextResponse.json(
        { ok: false, error: { code: "SERVER_CONFIG", message: "Admin password not configured" } },
        { status: 500 }
      );
    }

    if (parsed.data.password !== expected) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Incorrect password" } },
        { status: 401 }
      );
    }

    const { value } = await createAdminCookieValue();

    const res = NextResponse.json({ ok: true, data: { success: true } });
    res.cookies.set(adminCookieName(), value, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "Failed to login" } },
      { status: 500 }
    );
  }
}

