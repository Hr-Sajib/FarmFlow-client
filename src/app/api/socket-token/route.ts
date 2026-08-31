import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Hands the access token to client-side socket code.
 *
 * The cookie is httpOnly so that page scripts cannot read it — which also
 * means socket.io cannot read it for its handshake. This route is the narrow,
 * same-origin exception: it returns the token only to a request that already
 * carries the cookie, so it grants nothing an attacker did not already have.
 */
export async function GET() {
  const token = (await cookies()).get("accessToken")?.value ?? null;
  return NextResponse.json({ token }, { headers: { "Cache-Control": "no-store" } });
}
