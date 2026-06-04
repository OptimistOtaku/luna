import React from "react";
import { SymptomLog, RemedyLog } from "../types";
import { Frown, Sparkles, Plus, CheckCircle, Flame, Coffee, Heart, Moon } from "lucide-react";

interface SymptomLoggerProps {
  activeSymptoms: SymptomLog[];
  activeRemedies: RemedyLog[];
  onSymptomSeverityChange: (symptomName: string, severity: number) => void;
  onRemedyToggle: (remedyName: string, dosage?: string) => void;
  moodScore: number;
  onMoodScoreChange: (score: number) => void;
  energyScore: number;
  onEnergyScoreChange: (score: number) => void;
  dailyNotes: string;
  onDailyNotesChange: (notes: string) => void;
}

const PRESET_SYMPTOMS = [
  { name: "Cramps", label: "Cramps (Pelvic/Lower Back)", icon: "🩸" },
  { name: "Bloating", label: "Bloating & Fluid Retention", icon: "🎈" },
  { name: "Mood swings", label: "Mood Swings / Irritability", icon: "🧠" },
  { name: "Fatigue", label: "Fatigue & Muscle Soreness", icon: "🔋" },
  { name: "Insomnia", label: "Insomnia & Restless Sleep", icon: "🌙" },
  { name: "Headache", label: "Hormonal Headaches / Migraine", icon: "⚡" },
];

const PRESET_REMEDIES = [
  { name: "Magnesium Glycinate", dosage: "300mg", desc: "Recommended for muscle tension & cramps", icon: "💊" },
  { name: "Ginger Tea", dosage: "1 warm cup", desc: "For luteal bloating & mild pelvic comfort", icon: "☕" },
  { name: "Chamomile Tea", dosage: "1 warm cup", desc: "Calms mood state & stabilizes sleep onset", icon: "🍵" },
  { name: "Heating Pad", dosage: "20-30 mins", desc: "Implements direct local thermal relief", icon: "🔥" },
  { name: "Ibuprofen", dosage: "200mg", desc: "Direct inhibitor for prostaglandins (pain)", icon: "🧪" },
  { name: "Yoga & Stretching", dosage: "15 mins stretch", desc: "Relieves visceral stiffness", icon: "🧘" },
];

export default function SymptomLogger({
  activeSymptoms,
  activeRemedies,
  onSymptomSeverityChange,
  onRemedyToggle,
  moodScore,
  onMoodScoreChange,
  energyScore,
  onEnergyScoreChange,
  dailyNotes,
  onDailyNotesChange,
}: SymptomLoggerProps) {

  const getSymptomSeverity = (name: string): number => {
    const found = activeSymptoms.find((s) => s.name === name);
    return found ? found.severity : 0;
  };

  const isRemedyActive = (name: string): boolean => {
    return activeRemedies.some((r) => r.name === name);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_4px_24px_rgba(40,40,30,0.03)] flex flex-col gap-6" id="luna-symptom-logger">
      
      {/* Logger Title */}
      <div>
        <span className="text-xs font-mono tracking-widest text-stone-400 font-medium uppercase text-left block">BODY & SOUL TRACKING</span>
        <h3 className="text-xl font-bold font-display text-stone-800 text-left mt-0.5">Daily Bio-Metrics</h3>
      </div>

      {/* Symptoms logs */}
      <div>
        <h4 className="text-xs font-semibold text-stone-400 font-mono tracking-wider uppercase mb-3 flex items-center gap-1">
          <Frown className="w-3.5 h-3.5" /> Physical & Mood Symptoms
        </h4>
        <div className="grid grid-cols-1 gap-3.5">
          {PRESET_SYMPTOMS.map((sym) => {
            const currentSeverity = getSymptomSeverity(sym.name);
            return (
              <div 
                key={sym.name} 
                className={`p-3.5 rounded-2xl border transition-all ${
                  currentSeverity > 0 
                  ? "border-stone-200 bg-stone-50/50" 
                  : "border-stone-100 hover:border-stone-200"
                }`}
                id={`sym-row-${sym.name.toLowerCase().replace(/\s+/, '-')}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-stone-700 flex items-center gap-1.5">
                    <span className="text-lg">{sym.icon}</span> {sym.label}
                  </span>
                  <span className="text-[11px] font-mono font-medium text-stone-400">
                    {currentSeverity === 0 ? "Not logged" : `Severity: ${currentSeverity}/5`}
                  </span>
                </div>
                
                {/* 5-step severity bar selector */}
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onSymptomSeverityChange(sym.name, 0)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg border font-mono transition ${
                      currentSeverity === 0
                        ? "bg-stone-800 text-white border-stone-800"
                        : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    None
                  </button>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => onSymptomSeverityChange(sym.name, level)}
                      className={`flex-1 font-mono text-[11px] py-1 rounded-lg border transition ${
                        currentSeverity === level
                          ? "bg-stone-700 text-white border-stone-700"
                          : "bg-white text-stone-500 border-stone-100 hover:bg-stone-50"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Remedies & Supplements logs */}
      <div>
        <h4 className="text-xs font-semibold text-stone-400 font-mono tracking-wider uppercase mb-3 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> Remedy & Supplement Log
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="remedy-grid">
          {PRESET_REMEDIES.map((rem) => {
            const active = isRemedyActive(rem.name);
            return (
              <button
                key={rem.name}
                onClick={() => onRemedyToggle(rem.name, rem.dosage)}
                className={`p-3 rounded-2xl border text-left transition relative flex items-start gap-2.5 ${
                  active 
                    ? "border-stone-800 bg-stone-50/80 shadow-sm" 
                    : "border-stone-100 bg-white hover:border-stone-200"
                }`}
                id={`remedy-btn-${rem.name.toLowerCase().replace(/\s+/, '-')}`}
              >
                <div className="text-2xl mt-0.5">{rem.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-stone-700">{rem.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 font-mono text-stone-400 bg-stone-100 rounded">
                      {rem.dosage}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-400 leading-normal mt-1">{rem.desc}</p>
                </div>
                {active && (
                  <span className="absolute top-2.5 right-2.5 text-stone-800">
                    <CheckCircle className="w-4 h-4 fill-stone-800 text-white" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mood & Energy Biometrics */}
      <div className="grid grid-cols-2 gap-4">
        {/* Mood Slider */}
        <div className="bg-stone-50/60 p-4 rounded-2xl border border-stone-100">
          <label className="text-xs font-mono font-medium text-stone-400 uppercase tracking-wide block mb-2">
            Mood State ({moodScore}/5)
          </label>
          <div className="flex gap-1.5 justify-between">
            {[1, 2, 3, 4, 5].map((val) => {
              const faces = ["😢", "😔", "😐", "🙂", "✨"];
              return (
                <button
                  key={val}
                  onClick={() => onMoodScoreChange(val)}
                  className={`flex-1 py-1.5 rounded-xl border text-sm transition flex flex-col items-center gap-1 ${
                    moodScore === val
                      ? "bg-white border-stone-600 text-stone-800 font-bold shadow-xs"
                      : "bg-white/40 border-transparent text-stone-400 hover:bg-white"
                  }`}
                >
                  <span className="text-lg">{faces[val - 1]}</span>
                  <span className="text-[10px] font-mono">{val}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Energy Slider */}
        <div className="bg-stone-50/60 p-4 rounded-2xl border border-stone-100">
          <label className="text-xs font-mono font-medium text-stone-400 uppercase tracking-wide block mb-2">
            Energy Level ({energyScore}/5)
          </label>
          <div className="flex gap-1.5 justify-between">
            {[1, 2, 3, 4, 5].map((val) => {
              const batteries = ["🔋", "⚡", "⚡", "⚡", "🔥"]; // representation
              return (
                <button
                  key={val}
                  onClick={() => onEnergyScoreChange(val)}
                  className={`flex-1 py-1.5 rounded-xl border text-sm transition flex flex-col items-center gap-1 ${
                    energyScore === val
                      ? "bg-white border-stone-600 text-stone-800 font-bold shadow-xs"
                      : "bg-white/40 border-transparent text-stone-400 hover:bg-white"
                  }`}
                >
                  <span className="text-stone-700 font-medium font-mono text-[10px]">Lvl {val}</span>
                  <span className="text-[10px] font-mono text-stone-500">
                    {val === 1 ? "Depleted" : val === 5 ? "Radiant" : `Level ${val}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Custom notes check-in log */}
      <div>
        <label className="text-xs font-mono font-medium text-stone-400 uppercase tracking-wide block mb-2 text-left">
          Daily Journal Note (Feeds Companion Context)
        </label>
        <textarea
          rows={3}
          value={dailyNotes}
          onChange={(e) => onDailyNotesChange(e.target.value)}
          placeholder="E.g., Feeling bloated tonight, work was highly demanding..."
          className="w-full text-xs font-sans text-stone-700 bg-stone-50/50 rounded-2xl p-3 border border-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white transition"
          id="notes-textarea"
        />
      </div>

    </div>
  );
}
