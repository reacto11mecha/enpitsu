import { NextResponse } from "next/server";

import { settings } from "@enpitsu/settings";

function handler() {
  const { canLogin: _, ...exposableData } = settings.getSettings();

  return NextResponse.json(exposableData, { status: 200 });
}

export { handler as GET, handler as POST };
