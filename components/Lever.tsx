"use client";
import { useRef, useState, useEffect } from "react";

interface Props {
  onPull: () => void;
  disabled: boolean;
  spinning: boolean;
}

export default function Lever(props: Props) {
  var [pullDistance, setPullDistance] = useState(0); // 0~100
  var [isDragging, setIsDragging] = useState(false);
  var startY = useRef(0);
  var leverRef = useRef<HTMLDivElement>(null);

  var MAX_PULL = 100; // 最大拉动距离（px）
  var TRIGGER_THRESHOLD = 60; // 触发阈值

  function handleStart(clientY: number) {
    if (props.disabled || props.spinning) return;
    setIsDragging(true);
    startY.current = clientY;
  }

  function handleMove(clientY: number) {
    if (!isDragging || props.disabled || props.spinning) return;
    var delta = clientY - startY.current;
    var distance = Math.max(0, Math.min(MAX_PULL, delta));
    setPullDistance(distance);
  }

  function handleEnd() {
    if (!isDragging) return;
    setIsDragging(false);

    if (pullDistance >= TRIGGER_THRESHOLD) {
      // 触发抽选
      setPullDistance(MAX_PULL);
      setTimeout(function () {
        setPullDistance(0);
        props.onPull();
      }, 150);
    } else {
      // 回弹
      setPullDistance(0);
    }
  }

  // 触摸事件
  function onTouchStart(e: React.TouchEvent) {
    handleStart(e.touches[0].clientY);
  }
  function onTouchMove(e: React.TouchEvent) {
    handleMove(e.touches[0].clientY);
  }
  function onTouchEnd() {
    handleEnd();
  }

  // 鼠标事件（方便电脑测试）
  function onMouseDown(e: React.MouseEvent) {
    handleStart(e.clientY);
  }
  useEffect(function () {
    if (!isDragging) return;

    function onMouseMove(e: MouseEvent) {
      handleMove(e.clientY);
    }
    function onMouseUp() {
      handleEnd();
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return function () {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, pullDistance]);

  // 点击触发（不拖动，直接点）
  function onClick() {
    if (props.disabled || props.spinning || isDragging) return;
    setPullDistance(MAX_PULL);
    setTimeout(function () {
      setPullDistance(0);
      props.onPull();
    }, 200);
  }

  var pullPercent = pullDistance / MAX_PULL;
  var ballY = pullDistance;
  var rodHeight = 90 + pullDistance * 0.8; // 杆身会伸长（稍缓一些更真实）
  var isPulled = pullPercent > 0.6;

  return (
    <div className="flex flex-col items-center">
      {/* 拉杆区域 */}
      <div
        ref={leverRef}
        className="relative flex h-[240px] w-28 cursor-grab flex-col items-center active:cursor-grabbing"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onClick={onClick}
        style={{ touchAction: "none" }}
      >
        {/* 球头（3D 金属球） */}
        <div
          className="absolute z-10 flex h-20 w-20 items-center justify-center rounded-full transition-all"
          style={{
            top: ballY + "px",
            background: props.disabled || props.spinning
              ? "radial-gradient(circle at 35% 30%, #cbd5e0 0%, #a0aec0 40%, #718096 100%)"
              : isPulled
              ? "radial-gradient(circle at 35% 30%, #90cdf4 0%, #4299e1 40%, #2b6cb0 100%)"
              : "radial-gradient(circle at 35% 30%, #90cdf4 0%, #4A9FFF 40%, #2b6cb0 100%)",
            boxShadow: props.disabled || props.spinning
              ? "0 4px 8px rgba(0,0,0,0.2), inset 0 -2px 6px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.4)"
              : isPulled
              ? "0 6px 20px rgba(74,159,255,0.6), inset 0 -3px 8px rgba(0,0,0,0.3), inset 0 3px 6px rgba(255,255,255,0.5)"
              : "0 6px 16px rgba(74,159,255,0.4), inset 0 -3px 8px rgba(0,0,0,0.25), inset 0 3px 6px rgba(255,255,255,0.4)",
            transition: isDragging ? "none" : "top 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s",
            border: "2px solid rgba(255,255,255,0.3)",
          }}
        >
          {/* 高光点 */}
          <div
            className="absolute rounded-full bg-white"
            style={{
              width: "24px",
              height: "24px",
              top: "14px",
              left: "16px",
              opacity: props.disabled || props.spinning ? 0.4 : 0.7,
              filter: "blur(1px)",
            }}
          />
          {/* emoji */}
          <span className="relative z-10 text-3xl drop-shadow-md">
            {props.spinning ? "🎰" : "🎯"}
          </span>
        </div>

        {/* 杆身（金属渐变 + 阴影） */}
        <div
          className="absolute rounded-full transition-all"
          style={{
            top: "40px",
            width: "14px",
            height: rodHeight + "px",
            background: props.disabled || props.spinning
              ? "linear-gradient(90deg, #a0aec0 0%, #cbd5e0 25%, #e2e8f0 50%, #cbd5e0 75%, #a0aec0 100%)"
              : "linear-gradient(90deg, #2b6cb0 0%, #4A9FFF 25%, #90cdf4 50%, #4A9FFF 75%, #2b6cb0 100%)",
            boxShadow: props.disabled || props.spinning
              ? "inset 2px 0 3px rgba(0,0,0,0.2), inset -2px 0 3px rgba(0,0,0,0.2)"
              : "inset 2px 0 4px rgba(0,0,0,0.3), inset -2px 0 4px rgba(0,0,0,0.2), 0 2px 6px rgba(74,159,255,0.3)",
            transition: isDragging ? "none" : "height 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />

        {/* 底座（金属质感 + 立体） */}
        <div
          className="absolute bottom-0 h-10 w-24 rounded-t-[2rem] transition-all"
          style={{
            background: "linear-gradient(180deg, #e2e8f0 0%, #cbd5e0 50%, #a0aec0 100%)",
            boxShadow: "0 -2px 6px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -2px 3px rgba(0,0,0,0.2)",
            border: "2px solid rgba(160,174,192,0.5)",
            borderBottom: "none",
          }}
        />

        {/* 拉杆轨道指示线 */}
        {!props.disabled && !props.spinning && pullDistance > 0 && (
          <div
            className="absolute left-1/2 w-1 -translate-x-1/2 rounded-full bg-yolk/40"
            style={{
              top: "40px",
              height: pullDistance + "px",
              transition: "none",
            }}
          />
        )}
      </div>

      {/* 提示文字 */}
      <div className="mt-4 text-center">
        <div className="text-xl font-extrabold text-cocoa">
          {props.spinning ? "🎰 滚动中…" : props.disabled ? "先添加想吃的早餐" : "👇 拉杆或点击"}
        </div>
        {!props.disabled && !props.spinning && (
          <div className="mt-2 flex items-center justify-center gap-2">
            <div className="h-2 w-32 overflow-hidden rounded-full bg-cocoa/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-yolk to-[#2B6CB0] transition-all"
                style={{ width: (pullPercent * 100) + "%" }}
              />
            </div>
            <span className="text-xs font-bold text-cocoa/60">
              {Math.round(pullPercent * 100)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
