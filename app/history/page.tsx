"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { DrawRecord } from "@/lib/types";
import { getStore } from "@/lib/store";
import CalendarView from "@/components/CalendarView";

type ViewMode = "calendar" | "list";

function fmtTime(ts: number): string {
  var d = new Date(ts);
  var now = new Date();
  var sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  var yest = new Date(now.getTime() - 86400000);
  var isYest =
    d.getFullYear() === yest.getFullYear() &&
    d.getMonth() === yest.getMonth() &&
    d.getDate() === yest.getDate();

  var hh = String(d.getHours()).padStart(2, "0");
  var mm = String(d.getMinutes()).padStart(2, "0");
  var time = hh + ":" + mm;

  if (sameDay) return "今天 " + time;
  if (isYest) return "昨天 " + time;
  return (d.getMonth() + 1) + "月" + d.getDate() + "日 " + time;
}

export default function HistoryPage() {
  var [records, setRecords] = useState<DrawRecord[]>([]);
  var [loading, setLoading] = useState(true);
  var [viewMode, setViewMode] = useState<ViewMode>("calendar");

  useEffect(function () {
    (async function () {
      var s = await getStore();
      var h = await s.getHistory();
      setRecords(h);
      setLoading(false);
    })();
  }, []);

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 pb-10 pt-6">
      <header className="mb-4 flex items-center justify-between">
        <Link href="/" className="rounded-2xl bg-butter px-3 py-2 text-sm font-extrabold text-cocoa shadow-sm active:translate-y-0.5">
          ← 返回
        </Link>
        <h1 className="text-xl font-extrabold text-cocoa">📜 早餐记录</h1>
        <div className="w-16" />
      </header>

      {/* 视图切换 */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={function () { setViewMode("calendar"); }}
          className={
            "flex-1 rounded-3xl py-2 text-sm font-extrabold transition-all " +
            (viewMode === "calendar"
              ? "bg-yolk text-white shadow-md"
              : "bg-butter text-cocoa/60")
          }
        >
          📅 日历
        </button>
        <button
          onClick={function () { setViewMode("list"); }}
          className={
            "flex-1 rounded-3xl py-2 text-sm font-extrabold transition-all " +
            (viewMode === "list"
              ? "bg-yolk text-white shadow-md"
              : "bg-butter text-cocoa/60")
          }
        >
          📋 列表
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center font-bold text-cocoa/50">加载中…</div>
      ) : viewMode === "calendar" ? (
        <CalendarView records={records} />
      ) : records.length === 0 ? (
        <div className="py-16 text-center">
          <div className="text-5xl">🍽️</div>
          <p className="mt-3 font-bold text-cocoa/50">还没有记录，快去拉一次老虎机吧！</p>
        </div>
      ) : (
        <div>
          <p className="mb-3 text-center text-xs font-bold text-cocoa/50">只保留最近 7 天的记录</p>
          <ul className="space-y-2">
            {records.map(function (r) {
              return (
                <li key={r.id} className="flex items-center gap-3 rounded-4xl border-4 border-cocoa/10 bg-white p-4">
                  <span className="text-3xl">{r.emoji}</span>
                  <div className="flex-1">
                    <div className="text-lg font-extrabold text-cocoa">{r.name}</div>
                    <div className="text-xs font-bold text-cocoa/50">
                      <span className="text-berry">{r.by}</span> 抽中的
                    </div>
                  </div>
                  <span className="text-xs font-bold text-cocoa/40">{fmtTime(r.at)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </main>
  );
}
