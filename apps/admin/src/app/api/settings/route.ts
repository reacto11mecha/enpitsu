import { NextResponse } from "next/server";

import { settings } from "@enpitsu/settings";

import { setCorsHeaders } from "../trpc/[trpc]/route";

export const OPTIONS = () => {
  const response = new Response(null, {
    status: 204,
  });
  setCorsHeaders(response);
  return response;
};

function handler() {
  const { canLogin: _, ...exposableData } = settings.getSettings();

  const response = NextResponse.json(exposableData, { status: 200 });

  setCorsHeaders(response);

  return response;
}

export { handler as GET, handler as POST };
