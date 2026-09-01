"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import SlotMachine from "@/components/SlotMachine";
import { Breakfast } from "@/lib/types";
import { getStore, getNickname, setNickname, Store } from "@/lib/store";

export default function HomePage() {
  var [store, setStore] = useState<Store | null>(null);
  var [items, setItems] = useState<Breakfast[]>([]);
  var [loading, setLoading] = useState(true);
  var [nickname, setNicknameState] = useState("");
  var [nickInput, setNickInput] = useState("");
  var [askNick, setAskNick] = useState(false);

  var load = useCallback(async function () {
    var s = await getStore();
    setStore(s);
    var list = await s.getBreakfasts();
    setItems(list.filter(function (b) { return b.wantToEat; }));
    setLoading(false);
  }, []);

  useEffect(function () {
    load();
    var n = getNickname();
    if (n) {
      setNicknameState(n);
    } else {
      setAskNick(true);
    }
  }, [load]);

  function saveNick() {
    var v = nickInput.trim();
    if (!v) {
      setAskNick(false);
      return;
    }
    setNickname(v);
    setNicknameState(v);
    setAskNick(false);
  }

  var onRecord = useCallback(async function (b: Breakfast) {
    if (!store) return;
    try {
      await store.recordDraw(b, getNickname() || "家人");
    } catch (e) {
      // 记录失败不影响抽选体验
    }
  }, [store]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-8 pt-6">
      {/* 顶栏 */}
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-cocoa">🍳 奇奇的早餐</h1>
          <p className="mt-0.5 text-xs font-bold text-cocoa/50">
            {store ? (store.isCloud ? "☁️ 全家共享模式" : "📱 本机模式") : "…"}
            {nickname ? " · " + nickname : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/history"
            className="rounded-2xl bg-butter px-3 py-2 text-sm font-extrabold text-cocoa shadow-sm active:translate-y-0.5"
          >
            📜 历史
          </Link>
          <Link
            href="/manage"
            className="rounded-2xl bg-butter px-3 py-2 text-sm font-extrabold text-cocoa shadow-sm active:translate-y-0.5"
          >
            ⚙️ 管理
          </Link>
        </div>
      </header>

      {/* 主体 */}
      <div className="flex flex-1 flex-col justify-center">
        {loading ? (
          <div className="py-20 text-center text-cocoa/50 font-bold">加载早餐中…</div>
        ) : (
          <SlotMachine items={items} nickname={nickname} onRecord={onRecord} />
        )}
      </div>

      {/* 首次填写昵称的弹层 */}
      {askNick ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-cocoa/40 p-4 backdrop-blur-sm">
          <div className="pop-in w-full max-w-sm rounded-4xl bg-cream p-6 shadow-xl">
            <div className="text-center text-3xl">👋</div>
            <h2 className="mt-2 text-center text-xl font-extrabold text-cocoa">
              你叫什么名字呀？
            </h2>
            <p className="mt-1 text-center text-xs font-bold text-cocoa/50">
              这样大家就知道是谁抽中的啦（只存在这台设备上）
            </p>
            <input
              value={nickInput}
              onChange={function (e) { setNickInput(e.target.value); }}
              onKeyDown={function (e) { if (e.key === "Enter") saveNick(); }}
              placeholder="比如：奇奇 / 爸爸 / 妈妈"
              maxLength={12}
              className="mt-4 w-full rounded-3xl border-4 border-butter bg-white px-4 py-3 text-center text-lg font-bold text-cocoa outline-none focus:border-yolk"
            />
            <button
              onClick={saveNick}
              className="mt-4 w-full rounded-3xl border-b-8 border-[#2B6CB0] bg-yolk py-3 text-lg font-extrabold text-cocoa active:translate-y-1 active:border-b-2"
            >
              好的！
            </button>
            <button
              onClick={function () { setAskNick(false); }}
              className="mt-2 w-full py-1 text-xs font-bold text-cocoa/40"
            >
              先不了
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
