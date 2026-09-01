import { NextResponse } from "next/server";
import { getRedis, isCloud } from "@/lib/kv";
import { Breakfast } from "@/lib/types";
import { PRESET_BREAKFASTS } from "@/lib/presets";

export const dynamic = "force-dynamic";

var KEY = "qiqi:breakfasts";

function uid(): string {
  return (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)).toLowerCase();
}

async function readList(): Promise<Breakfast[] | null> {
  var redis = getRedis();
  return (await redis.get<Breakfast[]>(KEY)) || null;
}

async function seedIfEmpty(): Promise<Breakfast[]> {
  var existing = await readList();
  if (existing) return existing;
  var now = Date.now();
  var seeded: Breakfast[] = PRESET_BREAKFASTS.map(function (p, i) {
    return Object.assign({}, p, { id: "preset-" + i + "-" + now.toString(36), createdAt: now });
  });
  await getRedis().set(KEY, seeded);
  return seeded;
}

function noCloud() {
  return NextResponse.json({ error: "cloud mode not enabled" }, { status: 503 });
}

export async function GET() {
  if (!isCloud()) return noCloud();
  var list = await seedIfEmpty();
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  if (!isCloud()) return noCloud();
  var body = await req.json();
  var list = await seedIfEmpty();
  list.push({
    id: uid(),
    name: String(body.name || "").slice(0, 30),
    emoji: String(body.emoji || "🍽️").slice(0, 8),
    wantToEat: true,
    createdAt: Date.now(),
  });
  await getRedis().set(KEY, list);
  return NextResponse.json(list);
}

export async function PATCH(req: Request) {
  if (!isCloud()) return noCloud();
  var body = await req.json();
  var list = await seedIfEmpty();
  var next = list.map(function (b) {
    return b.id === body.id ? Object.assign({}, b, { wantToEat: !b.wantToEat }) : b;
  });
  await getRedis().set(KEY, next);
  return NextResponse.json(next);
}

export async function DELETE(req: Request) {
  if (!isCloud()) return noCloud();
  var url = new URL(req.url);
  var id = url.searchParams.get("id") || "";
  var list = await seedIfEmpty();
  var next = list.filter(function (b) { return b.id !== id; });
  await getRedis().set(KEY, next);
  return NextResponse.json(next);
}
