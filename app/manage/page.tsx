"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Breakfast } from "@/lib/types";
import { getStore, Store } from "@/lib/store";

// 供新增时选择的常用 emoji
var EMOJI_CHOICES = ["🍜","🥟","🍞","🥛","🍳","🥞","🥐","🥪","🍲","🥣","🌯","🍓","🧇","🥓","🍩","🍙"];

export default function ManagePage() {
  var [store, setStore] = useState<Store | null>(null);
  var [list, setList] = useState<Breakfast[]>([]);
  var [loading, setLoading] = useState(true);
  var [newName, setNewName] = useState("");
  var [newEmoji, setNewEmoji] = useState(EMOJI_CHOICES[0]);
  var [adding, setAdding] = useState(false);
  var [busy, setBusy] = useState(false);

  var reload = useCallback(async function (s?: Store) {
    var st = s || store;
    if (!st) return;
    var l = await st.getBreakfasts();
    setList(l);
  }, [store]);

  useEffect(function () {
    (async function () {
      var s = await getStore();
      setStore(s);
      var l = await s.getBreakfasts();
      setList(l);
      setLoading(false);
    })();
  }, []);

  async function onToggle(id: string) {
    if (!store || busy) return;
    setBusy(true);
    try { setList(await store.toggleWant(id)); } finally { setBusy(false); }
  }

  async function onDelete(id: string) {
    if (!store || busy) return;
    if (typeof window !== "undefined" && !window.confirm("确定删除这个早餐吗？")) return;
    setBusy(true);
    try { setList(await store.deleteBreakfast(id)); } finally { setBusy(false); }
  }

  async function onAdd() {
    if (!store || busy) return;
    var name = newName.trim();
    if (!name) return;
    setBusy(true);
    try {
      setList(await store.addBreakfast(name, newEmoji));
      setNewName("");
      setAdding(false);
    } finally { setBusy(false); }
  }

  var wantCount = list.filter(function (b) { return b.wantToEat; }).length;

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 pb-10 pt-6">
      <header className="mb-4 flex items-center justify-between">
        <Link href="/" className="rounded-2xl bg-butter px-3 py-2 text-sm font-extrabold text-cocoa shadow-sm active:translate-y-0.5">
          ← 返回
        </Link>
        <h1 className="text-xl font-extrabold text-cocoa">⚙️ 早餐管理</h1>
        <div className="w-16" />
      </header>

      <p className="mb-3 rounded-3xl bg-butter/70 px-4 py-2 text-center text-xs font-bold text-cocoa/70">
        共 {list.length} 种 · <span className="text-leaf">{wantCount} 种想吃</span>，想吃的才会进老虎机
      </p>

      {/* 新增 */}
      {adding ? (
        <div className="pop-in mb-4 rounded-4xl border-4 border-yolk bg-white p-4">
          <input
            value={newName}
            onChange={function (e) { setNewName(e.target.value); }}
            placeholder="早餐名字，比如：豆腐脑"
            maxLength={30}
            className="w-full rounded-3xl border-4 border-butter bg-cream px-4 py-3 text-center text-lg font-bold text-cocoa outline-none focus:border-yolk"
          />
          <div className="mt-3 grid grid-cols-8 gap-2">
            {EMOJI_CHOICES.map(function (em) {
              var sel = em === newEmoji;
              return (
                <button
                  key={em}
                  onClick={function () { setNewEmoji(em); }}
                  className={
                    "flex h-9 items-center justify-center rounded-2xl text-xl transition-all " +
                    (sel ? "scale-110 bg-yolk" : "bg-cream")
                  }
                >
                  {em}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={function () { setAdding(false); }}
              className="flex-1 rounded-3xl bg-cream py-3 font-extrabold text-cocoa/60"
            >
              取消
            </button>
            <button
              onClick={onAdd}
              disabled={!newName.trim() || busy}
              className="flex-1 rounded-3xl border-b-4 border-leaf/70 bg-leaf py-3 font-extrabold text-white disabled:opacity-50 active:translate-y-0.5"
            >
              添加
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={function () { setAdding(true); }}
          className="mb-4 w-full rounded-4xl border-4 border-dashed border-cocoa/30 bg-white/60 py-4 text-lg font-extrabold text-cocoa/60 active:scale-[0.98]"
        >
          ＋ 添加新早餐
        </button>
      )}

      {/* 列表 */}
      {loading ? (
        <div className="py-16 text-center font-bold text-cocoa/50">加载中…</div>
      ) : (
        <ul className="space-y-2">
          {list.map(function (b) {
            return (
              <li
                key={b.id}
                className={
                  "flex items-center gap-3 rounded-4xl border-4 p-3 transition-all " +
                  (b.wantToEat ? "border-yolk/60 bg-white" : "border-cocoa/10 bg-cream opacity-70")
                }
              >
                <span className="text-3xl">{b.emoji}</span>
                <span className="flex-1 text-lg font-extrabold text-cocoa">{b.name}</span>

                {/* 想吃开关 */}
                <button
                  onClick={function () { onToggle(b.id); }}
                  disabled={busy}
                  aria-label="想吃开关"
                  className={
                    "relative h-9 w-16 rounded-full transition-colors " +
                    (b.wantToEat ? "bg-leaf" : "bg-cocoa/20")
                  }
                >
                  <span
                    className="absolute top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs shadow transition-all"
                    style={{ left: b.wantToEat ? "2.25rem" : "0.25rem" }}
                  >
                    {b.wantToEat ? "😋" : "😐"}
                  </span>
                </button>

                {/* 删除 */}
                <button
                  onClick={function () { onDelete(b.id); }}
                  disabled={busy}
                  aria-label="删除"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-berry/15 text-berry active:scale-90"
                >
                  🗑️
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
