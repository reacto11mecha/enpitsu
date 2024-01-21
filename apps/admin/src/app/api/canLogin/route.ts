import { NextResponse } from "next/server";
import { cache } from "@enpitsu/cache";

export async function GET() {
  try {
    const status = await cache.get("login-status");

    return status
      ? NextResponse.json(
          { canLogin: JSON.parse(status) as boolean },
          { status: 200 },
        )
      : NextResponse.json({ canLogin: true }, { status: 200 });
  } catch (_) {
    return NextResponse.json({ canLogin: false }, { status: 200 });
  }
}
