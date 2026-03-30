import { NextResponse } from "next/server";

export function jsonOk<T>(data: T) {
  return NextResponse.json({ ok: true, data });
}

export function jsonError(
  status: number,
  code: string,
  message: string,
  details?: unknown
) {
  return NextResponse.json(
    { ok: false, error: { code, message, ...(details !== undefined ? { details } : {}) } },
    { status }
  );
}

