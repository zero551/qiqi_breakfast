import { NextResponse } from "next/server";
import { isCloud, getRedis } from "@/lib/kv";

export const runtime = 'edge';
export const dynamic = "force-dynamic";

export async function GET() {
  var info: Record<string, unknown> = {
    isCloud: isCloud(),
    hasUrl: !!process.env.KV_REST_API_URL,
    hasToken: !!process.env.KV_REST_API_TOKEN,
    urlPrefix: (process.env.KV_REST_API_URL || "").slice(0, 20),
  };
  try {
    var redis = getRedis();
    var val = await redis.get("qiqi:breakfasts");
    info.redisOk = true;
    info.hasData = !!val;
    info.dataType = typeof val;
  } catch (e: unknown) {
    info.redisOk = false;
    info.error = e instanceof Error ? e.message : String(e);
    info.errorName = e instanceof Error ? e.name : "unknown";
  }
  return NextResponse.json(info);
}
