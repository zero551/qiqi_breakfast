"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Breakfast } from "@/lib/types";
import Confetti from "./Confetti";
import Lever from "./Lever";

// 单个滚轮项高度(px)，需与渲染处一致
var ITEM_H = 84;
// 可视区显示 3 行，中间行为中奖行
var VISIBLE = 3;
var WINDOW_H = ITEM_H * VISIBLE;

interface Props {
  items: Breakfast[]; // 已进入老虎机的早餐（想吃）
  nickname: string;
  onRecord: (b: Breakfast) => void;
}

type Phase = "idle" | "spinning" | "result";

export default function SlotMachine(props: Props) {
  var items = props.items;
  var [phase, setPhase] = useState<Phase>("idle");
  var [offset, setOffset] = useState(0); // 滚轮纵向位移
  var [winner, setWinner] = useState<Breakfast | null>(null);
  var [showConfetti, setShowConfetti] = useState(false);
  // 手动滑动相关
  var [isSwiping, setIsSwiping] = useState(false);
  var [hasSwipedOnce, setHasSwipedOnce] = useState(false);
  var swipeStartY = useRef(0);
  var swipeStartOffset = useRef(0);
  var rafRef = useRef<number | null>(null);

  // 构造一条足够长的滚动带：重复 items 多轮，保证能转出长距离
  var repeats = Math.max(8, Math.ceil(40 / Math.max(items.length, 1)));
  var strip: Breakfast[] = [];
  for (var r = 0; r < repeats; r++) {
    for (var i = 0; i < items.length; i++) strip.push(items[i]);
  }

  var spin = useCallback(function () {
    if (items.length === 0 || phase === "spinning") return;
    setShowConfetti(false);
    setWinner(null);
    setPhase("spinning");

    // 目标：随机选一项，并让滚轮最终停在它（置于中间行）
    var targetIndexInItems = Math.floor(Math.random() * items.length);
    // 让它落在靠后的某一圈，保证滚动距离足够长、有减速过程
    var targetRepeat = repeats - 2; // 停在倒数第二圈，视觉自然
    var targetStripIndex = targetRepeat * items.length + targetIndexInItems;
    // 中间行对齐：窗口顶部对齐到 (targetIndex - 1) 处，使目标行落在正中央
    var finalOffset = (targetStripIndex - 1) * ITEM_H;

    var startOffset = 0;
    var distance = finalOffset - startOffset;
    var duration = 2600 + Math.random() * 800; // 2.6~3.4s
    var start = performance.now();

    // 缓出（先快后慢，物理减速感）：cubic ease-out
    function easeOut(t: number): number {
      return 1 - Math.pow(1 - t, 3);
    }

    function frame(now: number) {
      var t = Math.min(1, (now - start) / duration);
      var eased = easeOut(t);
      setOffset(startOffset + distance * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        var w = items[targetIndexInItems];
        setWinner(w);
        setPhase("result");
        setShowConfetti(true);
        props.onRecord(w);
      }
    }
    rafRef.current = requestAnimationFrame(frame);
  }, [items, phase, repeats, props]);

  useEffect(function () {
    return function () {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ===== 手动滑动微调：抽完后可上下拨动挑选 =====
  // 根据当前 offset 反推中间行对应的早餐
  function breakfastAtOffset(off: number): Breakfast | null {
    if (items.length === 0) return null;
    var centerIndex = Math.round(off / ITEM_H) + 1;
    var idx = ((centerIndex % items.length) + items.length) % items.length;
    return items[idx];
  }

  function swipeStart(clientY: number) {
    if (phase !== "result") return;
    setIsSwiping(true);
    swipeStartY.current = clientY;
    swipeStartOffset.current = offset;
  }

  function swipeMove(clientY: number) {
    if (!isSwiping || phase !== "result") return;
    // 手指往下拖，滚轮内容跟着往下走（offset 减小）
    var delta = clientY - swipeStartY.current;
    var next = swipeStartOffset.current - delta;
    // 限制在滚动带范围内，留出上下各一格余量
    var minOff = 0;
    var maxOff = (strip.length - 2) * ITEM_H;
    if (next < minOff) next = minOff;
    if (next > maxOff) next = maxOff;
    setOffset(next);
    // 实时更新中间选中项
    var b = breakfastAtOffset(next);
    if (b) setWinner(b);
  }

  function swipeEnd() {
    if (!isSwiping) return;
    setIsSwiping(false);
    setHasSwipedOnce(true);
    // 吸附到最近一格
    var snapped = Math.round(offset / ITEM_H) * ITEM_H;
    if (snapped < 0) snapped = 0;
    setOffset(snapped);
    var b = breakfastAtOffset(snapped);
    if (b) {
      setWinner(b);
      props.onRecord(b); // 覆盖历史记录为最终选择
    }
  }

  function onReelTouchStart(e: React.TouchEvent) {
    swipeStart(e.touches[0].clientY);
  }
  function onReelTouchMove(e: React.TouchEvent) {
    swipeMove(e.touches[0].clientY);
  }
  function onReelTouchEnd() {
    swipeEnd();
  }
  function onReelMouseDown(e: React.MouseEvent) {
    swipeStart(e.clientY);
  }

  // 鼠标滑动（电脑端调试用）
  useEffect(function () {
    if (!isSwiping) return;
    function mm(e: MouseEvent) { swipeMove(e.clientY); }
    function mu() { swipeEnd(); }
    window.addEventListener("mousemove", mm);
    window.addEventListener("mouseup", mu);
    return function () {
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("mouseup", mu);
    };
  }, [isSwiping, offset]);

  var spinning = phase === "spinning";

  return (
    <div className="flex w-full flex-col items-center">
      {showConfetti ? <Confetti /> : null}

      {/* 机器主体 */}
      <div className="relative w-full max-w-sm rounded-5xl border-4 border-cocoa/20 bg-butter p-5 shadow-[0_10px_30px_rgba(30,58,92,0.18)]">
        {/* 顶部灯泡装饰 */}
        <div className="mb-3 flex justify-center gap-3">
          {[0, 1, 2, 3, 4, 5].map(function (i) {
            var lit = spinning || (phase === "result" && i % 2 === 0);
            return (
              <span
                key={i}
                className={
                  "h-2.5 w-2.5 rounded-full transition-all " +
                  (lit ? "bg-yolk shadow-[0_0_8px_2px_rgba(74,159,255,0.8)]" : "bg-cocoa/20")
                }
              />
            );
          })}
        </div>

        {/* 滚轮窗口 */}
        <div
          className={
            "reel-mask relative overflow-hidden rounded-4xl border-4 bg-cream " +
            (phase === "result" ? "border-yolk/50 cursor-grab active:cursor-grabbing" : "border-cocoa/25")
          }
          style={{ height: WINDOW_H + "px", touchAction: phase === "result" ? "none" : "auto" }}
          onTouchStart={onReelTouchStart}
          onTouchMove={onReelTouchMove}
          onTouchEnd={onReelTouchEnd}
          onMouseDown={onReelMouseDown}
        >
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="text-4xl">🍽️</div>
              <p className="mt-2 text-sm font-bold text-cocoa/70">
                还没有「想吃」的早餐\n去管理页打开几个开关吧
              </p>
            </div>
          ) : (
            <div
              className="absolute left-0 right-0 top-0"
              style={{
                transform: "translateY(" + -offset + "px)",
                transition: isSwiping ? "none" : (phase === "result" ? "transform 0.25s cubic-bezier(0.2,0.9,0.3,1)" : "none"),
              }}
            >
              {strip.map(function (b, idx) {
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-center gap-3"
                    style={{ height: ITEM_H + "px" }}
                  >
                    <span className="text-4xl">{b.emoji}</span>
                    <span className="text-2xl font-extrabold tracking-wide text-cocoa">
                      {b.name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* 中奖行高亮框 */}
          {items.length > 0 ? (
            <div
              className="pointer-events-none absolute left-2 right-2 rounded-3xl border-4 border-yolk/90"
              style={{ top: ITEM_H + 4 + "px", height: ITEM_H - 8 + "px" }}
            />
          ) : null}
        </div>

        {/* 结果区 */}
        <div className="mt-4 flex min-h-[92px] items-center justify-center">
          {phase === "result" && winner ? (
            <div className="pop-in w-full text-center">
              <div className="text-xs font-bold uppercase tracking-widest text-cocoa/60">
                {props.nickname ? props.nickname + " 抽中了" : "今天吃"}
              </div>
              <div className="mt-1 flex items-center justify-center gap-2">
                <span className="wiggle inline-block text-4xl">{winner.emoji}</span>
                <span className="text-3xl font-extrabold text-cocoa">{winner.name}</span>
              </div>
              {!hasSwipedOnce ? (
                <div className="mt-1.5 text-[10px] font-bold text-yolk/90">
                  👆 滚轮可以上下拨动挑选
                </div>
              ) : null}
            </div>
          ) : (
            <div className="text-center text-sm font-bold text-cocoa/50">
              {spinning ? "滚动中…" : items.length > 0 ? "拉一下，看看今天吃什么！" : ""}
            </div>
          )}
        </div>
      </div>

      {/* 拉杆 / 按钮区 */}
      <div className="mt-6 flex w-full max-w-sm flex-col items-center gap-3">
        {phase === "result" ? (
          <div className="flex w-full flex-col gap-3">
            {/* 再抽 / 确认 */}
            <div className="flex w-full gap-3">
              <button
                onClick={spin}
                className="flex-1 rounded-4xl border-b-8 border-berry/70 bg-berry px-4 py-4 text-lg font-extrabold text-white active:translate-y-1 active:border-b-2"
              >
                🔄 不要，再来一次
              </button>
              <button
                onClick={function () { setPhase("idle"); }}
                className="flex-1 rounded-4xl border-b-8 border-leaf/70 bg-leaf px-4 py-4 text-lg font-extrabold text-white active:translate-y-1 active:border-b-2"
              >
                😋 就吃这个！
              </button>
            </div>
          </div>
        ) : (
          <Lever onPull={spin} disabled={items.length === 0} spinning={spinning} />
        )}
      </div>

    </div>
  );
}
