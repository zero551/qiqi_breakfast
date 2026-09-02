import { NextResponse } from "next/server";
import { getRedis, isCloud } from "@/lib/kv";
import { DrawRecord, Breakfast } from "@/lib/types";

export const dynamic = "force-dynamic";

export const runtime = 'edge';

var KEY = "qiqi:history";
var KEEP_DAYS = 7;

function uid(): string {
  return (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)).toLowerCase();
}

function noCloud() {
  return NextResponse.json({ error: "cloud mode not enabled" }, { status: 503 });
}

export async function GET() {
  if (!isCloud()) return noCloud();
  var all = (await getRedis().get<DrawRecord[]>(KEY)) || [];
  var cutoff = Date.now() - KEEP_DAYS * 86400000;
  var recent = all
    .filter(function (r) { return r.at >= cutoff; })
    .sort(function (a, b) { return b.at - a.at; });
  return NextResponse.json(recent);
}

export async function POST(req: Request) {
  if (!isCloud()) return noCloud();
  var body = await req.json();
  var b = body.breakfast as Breakfast;
  var by = String(body.by || "家人").slice(0, 12);
  var all = (await getRedis().get<DrawRecord[]>(KEY)) || [];
  // 同一天只保留最后一次：先删掉今天的旧记录，再写入新记录
  var now = new Date();
  all = all.filter(function (r) {
    var d = new Date(r.at);
    return !(
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  });
  all.push({
    id: uid(),
    breakfastId: b.id,
    name: b.name,
    emoji: b.emoji,
    by: by,
    at: Date.now(),
  });
  await getRedis().set(KEY, all);
  var cutoff = Date.now() - KEEP_DAYS * 86400000;
  var recent = all
    .filter(function (r) { return r.at >= cutoff; })
    .sort(function (a, bb) { return bb.at - a.at; });
  return NextResponse.json(recent);
}
