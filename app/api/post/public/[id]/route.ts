import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { handleApiError } from "@/lib/utils.server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await getSession();

    const { id } = await params;
    const post = await prisma.publicPost.findFirst({ where: { id } });

    return NextResponse.json(post);
  } catch (error) {
    return handleApiError(error);
  }
}
