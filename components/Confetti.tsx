"use client";
import { useEffect, useState } from "react";

interface Piece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
  rotate: number;
}

var COLORS = ["#4A9FFF", "#FF7B89", "#7FB069", "#6FB7FF", "#8FB8E8", "#2B6CB0"];

export default function Confetti({ count = 60 }: { count?: number }) {
  var [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(function () {
    var arr: Piece[] = [];
    for (var i = 0; i < count; i++) {
      arr.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.3,
        duration: 2.2 + Math.random() * 1.6,
        size: 8 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotate: Math.random() * 360,
      });
    }
    setPieces(arr);
    var t = setTimeout(function () { setPieces([]); }, 4500);
    return function () { clearTimeout(t); };
  }, [count]);

  if (pieces.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map(function (p) {
        var style: React.CSSProperties = {
          left: p.left + "vw",
          width: p.size + "px",
          height: p.size * 0.6 + "px",
          backgroundColor: p.color,
          animationDelay: p.delay + "s",
          animationDuration: p.duration + "s",
          transform: "rotate(" + p.rotate + "deg)",
          borderRadius: "2px",
        };
        return <span key={p.id} className="confetti-piece" style={style} />;
      })}
    </div>
  );
}
