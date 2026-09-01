"use client";
import { useState } from "react";
import { DrawRecord } from "@/lib/types";

interface Props {
  records: DrawRecord[];
}

var WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export default function CalendarView(props: Props) {
  var now = new Date();
  var [viewYear, setViewYear] = useState(now.getFullYear());
  var [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-11
  var [selectedDay, setSelectedDay] = useState<number | null>(null);

  // 把记录按「年-月-日」归组，同一天取最后一次（最新的）
  var byDate: Record<string, DrawRecord> = {};
  for (var i = 0; i < props.records.length; i++) {
    var r = props.records[i];
    var d = new Date(r.at);
    var key = d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
    // records 已按时间倒序，第一个遇到的就是最新的
    if (!byDate[key]) byDate[key] = r;
  }

  // 当月第一天是星期几
  var firstDay = new Date(viewYear, viewMonth, 1).getDay();
  // 当月天数
  var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // 构造格子：前面空格 + 日期
  var cells: (number | null)[] = [];
  for (var s = 0; s < firstDay; s++) cells.push(null);
  for (var day = 1; day <= daysInMonth; day++) cells.push(day);

  function prevMonth() {
    setSelectedDay(null);
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function nextMonth() {
    setSelectedDay(null);
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  function goToday() {
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedDay(now.getDate());
  }

  function getRecord(day: number): DrawRecord | null {
    var key = viewYear + "-" + viewMonth + "-" + day;
    return byDate[key] || null;
  }

  function isToday(day: number): boolean {
    return (
      viewYear === now.getFullYear() &&
      viewMonth === now.getMonth() &&
      day === now.getDate()
    );
  }

  var selectedRecord = selectedDay ? getRecord(selectedDay) : null;

  return (
    <div className="w-full">
      {/* 月份切换 */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-butter text-lg font-extrabold text-cocoa active:scale-90"
        >
          ‹
        </button>
        <button
          onClick={goToday}
          className="rounded-2xl px-4 py-2 text-lg font-extrabold text-cocoa active:bg-butter"
        >
          {viewYear} 年 {viewMonth + 1} 月
        </button>
        <button
          onClick={nextMonth}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-butter text-lg font-extrabold text-cocoa active:scale-90"
        >
          ›
        </button>
      </div>

      {/* 星期表头 */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAYS.map(function (w, idx) {
          return (
            <div
              key={w}
              className={
                "py-1 text-center text-xs font-extrabold " +
                (idx === 0 || idx === 6 ? "text-berry/70" : "text-cocoa/50")
              }
            >
              {w}
            </div>
          );
        })}
      </div>

      {/* 日期格子 */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map(function (day, idx) {
          if (day === null) {
            return <div key={"empty-" + idx} className="aspect-square" />;
          }
          var rec = getRecord(day);
          var today = isToday(day);
          var selected = selectedDay === day;

          return (
            <button
              key={day}
              onClick={function () { setSelectedDay(selected ? null : day); }}
              className={
                "relative flex aspect-square flex-col items-center justify-center rounded-2xl border-2 p-0.5 transition-all " +
                (selected
                  ? "border-yolk bg-yolk/20 scale-105"
                  : today
                  ? "border-yolk bg-white"
                  : rec
                  ? "border-cocoa/10 bg-white"
                  : "border-transparent bg-cream")
              }
            >
              <span
                className={
                  "text-[10px] font-bold leading-none " +
                  (today ? "text-yolk" : "text-cocoa/50")
                }
              >
                {day}
              </span>
              {rec ? (
                <span className="mt-0.5 text-lg leading-none">{rec.emoji}</span>
              ) : (
                <span className="mt-0.5 text-lg leading-none opacity-0">·</span>
              )}
            </button>
          );
        })}
      </div>

      {/* 选中某天的详情 */}
      {selectedDay ? (
        <div className="pop-in mt-4 rounded-4xl border-4 border-butter bg-white p-4">
          <div className="text-xs font-extrabold text-cocoa/50">
            {viewMonth + 1} 月 {selectedDay} 日
          </div>
          {selectedRecord ? (
            <div className="mt-2 flex items-center gap-3">
              <span className="text-4xl">{selectedRecord.emoji}</span>
              <div className="flex-1">
                <div className="text-xl font-extrabold text-cocoa">
                  {selectedRecord.name}
                </div>
                <div className="mt-0.5 text-xs font-bold text-cocoa/50">
                  <span className="text-berry">{selectedRecord.by}</span> 抽中 ·{" "}
                  {new Date(selectedRecord.at).getHours()}:
                  {String(new Date(selectedRecord.at).getMinutes()).padStart(2, "0")}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-2 text-center text-sm font-bold text-cocoa/40">
              这天没有记录 🍽️
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
