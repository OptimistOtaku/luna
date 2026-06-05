import React, { useRef, useState } from "react";
import { CyclePhase } from "../types";
import { ChevronLeft, ChevronRight, Activity, Calendar } from "lucide-react";

export function getCyclePhase(day: number): {
  name: CyclePhase;
  desc: string;
  color: string;
  lightColor: string;
  badgeClass: string;
  glowClass: string;
} {
  if (day >= 1 && day <= 5) {
    return {
      name: CyclePhase.MENSTRUAL,
      desc: "Shedding phase. Estrogen is low; maximize rest and gentle warmth.",
      color: "#f43f5e", // rose-500
      lightColor: "#ffe4e6", // rose-100
      badgeClass: "bg-rose-50 text-rose-700 border-rose-100",
      glowClass: "shadow-[0_0_20px_rgba(244,63,94,0.15)]"
    };
  } else if (day >= 6 && day <= 13) {
    return {
      name: CyclePhase.FOLLICULAR,
      desc: "Estrogen builds. Memory is sharp; physical stamina is returning.",
      color: "#0d9488", // teal-600
      lightColor: "#ccfbf1", // teal-100
      badgeClass: "bg-teal-50 text-teal-700 border-teal-100",
      glowClass: "shadow-[0_0_20px_rgba(13,148,136,0.15)]"
    };
  } else if (day >= 14 && day <= 15) {
    return {
      name: CyclePhase.OVULATORY,
      desc: "Estrogen and LH peak. Energy is maximum; physical strength peaks.",
      color: "#d97706", // amber-600
      lightColor: "#fef3c7", // amber-100
      badgeClass: "bg-amber-50 text-amber-700 border-amber-100",
      glowClass: "shadow-[0_0_20px_rgba(217,119,6,0.15)]"
    };
  } else {
    return {
      name: CyclePhase.LUTEAL,
      desc: "Progesterone dominates. Bloating, mood sensitivity, and fatigue can trigger near Day 21+.",
      color: "#6366f1", // indigo-500
      lightColor: "#e0e7ff", // indigo-100
      badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-100",
      glowClass: "shadow-[0_0_20px_rgba(99,102,241,0.15)]"
    };
  }
}

interface CycleWheelProps {
  currentDay: number;
  onDayChange: (day: number) => void;
  maxCycleDays?: number;
}

export default function CycleWheel({ currentDay, onDayChange, maxCycleDays = 28 }: CycleWheelProps) {
  const totalDays = maxCycleDays;
  const phaseInfo = getCyclePhase(currentDay);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // SVG parameters for the ring
  const size = 260;
  const radius = 100;
  const strokeWidth = 14;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Render dots for cycle segments
  const cycleDots = Array.from({ length: totalDays }, (_, i) => {
    const dayNum = i + 1;
    const angle = ((dayNum - 1) / totalDays) * 360 - 90; // Start at top center (-90deg)
    const rad = (angle * Math.PI) / 180;
    const x = center + radius * Math.cos(rad);
    const y = center + radius * Math.sin(rad);

    // Get color for that specific day's phase to show visual coloring on the ring
    const dayPhase = getCyclePhase(dayNum);
    const isActive = dayNum === currentDay;

    return {
      dayNum,
      x,
      y,
      color: dayPhase.color,
      isActive,
    };
  });

  const nextDay = () => {
    onDayChange(currentDay === totalDays ? 1 : currentDay + 1);
  };

  const prevDay = () => {
    onDayChange(currentDay === 1 ? totalDays : currentDay - 1);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;

    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    handlePointerUpdate(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    handlePointerUpdate(e);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handlePointerUpdate = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    
    let angleRad = Math.atan2(dy, dx);
    let angleDeg = (angleRad * 180) / Math.PI;
    
    // Align with standard -90 deg starting at top center
    let normalizedAngle = angleDeg + 90;
    if (normalizedAngle < 0) {
      normalizedAngle += 360;
    }
    
    // Map 0-360 degrees to 1-totalDays
    let dayFraction = (normalizedAngle / 360) * totalDays;
    let day = Math.round(dayFraction) + 1;
    if (day > totalDays) day = 1;
    onDayChange(day);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-stone-100 flex flex-col items-center shadow-[0_4px_24px_rgba(40,40,30,0.03)]" id="luna-cycle-wheel">
      <div className="w-full flex justify-between items-center mb-6">
        <div>
          <span className="text-xs font-mono tracking-widest text-stone-400 font-medium uppercase">Active Cycle State</span>
          <h3 className="text-lg font-semibold font-display text-stone-800">Dynamic Wheel</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium font-mono uppercase tracking-wide border ${phaseInfo.badgeClass}`}>
          {phaseInfo.name} Phase
        </div>
      </div>

      {/* Circle Stage */}
      <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-[260px] h-[260px] flex items-center justify-center select-none cursor-grab active:cursor-grabbing"
        id="luna-wheel-stage"
      >
        
        {/* Soft background ambient gradient glow linking to phase color */}
        <div 
          className="absolute inset-8 rounded-full blur-3xl opacity-10 transition-colors duration-500"
          style={{ backgroundColor: phaseInfo.color }}
        />

        {/* SVG Circle visualizer */}
        <svg width={size} height={size} className="transform -rotate-1">
          {/* Subtle base tracks */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#f5f5f4"
            strokeWidth={strokeWidth}
          />
          
          {/* Highlight ring for active phase segment */}
          {/* Render individual phase color segments */}
          {/* Menstrual Phase Section (Days 1 -> 5) */}
          <path
            d={describeArc(center, center, radius, -90, -90 + (5/totalDays)*360)}
            fill="none"
            stroke="#fda4af" // rose-300
            strokeWidth={strokeWidth - 2}
            strokeLinecap="round"
          />
          {/* Follicular Section (Days 6 -> 13) */}
          <path
            d={describeArc(center, center, radius, -90 + (5/totalDays)*360, -90 + (13/totalDays)*360)}
            fill="none"
            stroke="#5eead4" // teal-300
            strokeWidth={strokeWidth - 2}
            strokeLinecap="round"
          />
          {/* Ovulatory Section (Days 14 -> 15) */}
          <path
            d={describeArc(center, center, radius, -90 + (13/totalDays)*360, -90 + (15/totalDays)*360)}
            fill="none"
            stroke="#fcd34d" // amber-300
            strokeWidth={strokeWidth - 2}
            strokeLinecap="round"
          />
          {/* Luteal Section (Days 16 -> totalDays) */}
          <path
            d={describeArc(center, center, radius, -90 + (15/totalDays)*360, 270)}
            fill="none"
            stroke="#c7d2fe" // indigo-300
            strokeWidth={strokeWidth - 2}
            strokeLinecap="round"
          />

          {/* Interactive dots representing each day */}
          {cycleDots.map((dot) => (
            <g key={dot.dayNum} className="cursor-pointer" onClick={() => onDayChange(dot.dayNum)}>
              <circle
                cx={dot.x}
                cy={dot.y}
                r={dot.isActive ? 11 : 5}
                fill={dot.isActive ? dot.color : "#ffffff"}
                stroke={dot.isActive ? "#ffffff" : dot.color}
                strokeWidth={dot.isActive ? 3 : 1.5}
                className="transition-all duration-300 hover:scale-125 hover:stroke-stone-400"
              />
              {dot.isActive && (
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={15}
                  fill="none"
                  stroke={dot.color}
                  strokeWidth={1}
                  className="animate-ping"
                  style={{ opacity: 0.4 }}
                />
              )}
            </g>
          ))}
        </svg>

        {/* Center Display */}
        <div className="absolute inset-16 bg-white rounded-full flex flex-col justify-center items-center shadow-[0_8px_32px_rgba(28,25,23,0.04)] border border-stone-50 text-center p-3">
          <span className="text-stone-400 text-xs font-mono font-medium tracking-wide">CYCLE DAY</span>
          
          <div className="flex items-center gap-1 my-1">
            <button 
              onClick={prevDay} 
              className="p-1 hover:bg-stone-50 rounded-full text-stone-400 hover:text-stone-800 transition"
              id="prev-day-btn"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-4xl font-bold font-display text-stone-800 tabular-nums px-2">
              {currentDay}
            </span>
            <button 
              onClick={nextDay} 
              className="p-1 hover:bg-stone-50 rounded-full text-stone-400 hover:text-stone-800 transition"
              id="next-day-btn"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <span className="text-stone-500 font-medium text-xs font-display flex items-center gap-1">
            <Activity className="w-3 h-3 text-stone-400 animate-pulse" />
            OF {totalDays} DAYS
          </span>
        </div>
      </div>

      {/* Slider Simulation Toolbar */}
      <div className="w-full mt-6 bg-stone-50 rounded-2xl p-4 border border-stone-100">
        <label className="text-stone-500 text-xs font-mono block mb-2 font-medium flex items-center gap-1.5 justify-between">
          <span>Simulation Dial Slider</span>
          <span className="font-mono text-[10px] text-stone-400">(Drag to shift cycles)</span>
        </label>
        <input
          type="range"
          min="1"
          max={totalDays}
          value={currentDay}
          onChange={(e) => onDayChange(parseInt(e.target.value))}
          className="w-full accent-stone-700 cursor-pointer h-1 rounded-lg bg-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-400"
          id="cycle-slider"
        />
        <div className="flex justify-between text-[10px] font-mono text-stone-400 mt-1.5 px-0.5">
          <span>Day 1 (Period)</span>
          <span>Day 14 (Ovulation)</span>
          <span>Day {totalDays} (Luteal Peak)</span>
        </div>
      </div>

      {/* Phase contextual description */}
      <div className="w-full mt-5 border-t border-stone-100 pt-5 text-center">
        <p className="text-xs font-display text-stone-500 font-light leading-relaxed">
          {phaseInfo.desc}
        </p>
      </div>
    </div>
  );
}

// Helpers to draw SVG paths easily
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
}
