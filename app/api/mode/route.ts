import { NextResponse } from "next/server";
import { isCloud } from "@/lib/kv";

export const dynamic = "force-dynamic";

export const runtime = 'edge';

export async function GET() {
  return NextResponse.json({ cloud: isCloud() });
}
