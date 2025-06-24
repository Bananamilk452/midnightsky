import { NextResponse } from "next/server";

import { getSession } from "@/lib/session";
import { handleApiError } from "@/lib/utils.server";

export async function GET() {
  try {
    const session = await getSession();

    return NextResponse.json(session.user);
  } catch (error) {
    return handleApiError(error);
  }
}
