import { NextResponse } from "next/server";
import { cache } from "@enpitsu/cache";

async function handler() {
  try {
    const status = await cache.get("login-status");

    return status
      ? NextResponse.json(
          { canLogin: JSON.parse(status) as boolean },
          { status: 200 },
        )
      : NextResponse.json({ canLogin: true }, { status: 200 });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return NextResponse.json({ canLogin: false }, { status: 200 });
  }
}

export { handler as GET, handler as POST };
