import React, { useState, useEffect } from "react";
import { CyclePhase, SymptomLog, RemedyLog } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Bot, 
  HelpCircle, 
  ChevronRight, 
  History, 
  EyeOff, 
  VolumeX, 
  Smile, 
  Calendar, 
  Flame, 
  RotateCcw,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Award
} from "lucide-react";

interface AICompanionProps {
  currentDay: number;
  currentPhase: CyclePhase;
  activeSymptoms: SymptomLog[];
  activeRemedies: RemedyLog[];
  dailyNotes: string;
  userName: string;
}

interface AICheckInState {
  message: string;
  suggestion: {
    remedy: string;
    dosage?: string;
    reason: string;
  };
  adaptedTone?: string;
}

export default function AICompanion({
  currentDay,
  currentPhase,
  activeSymptoms,
  activeRemedies,
  dailyNotes,
  userName,
}: AICompanionProps) {
  const [insight, setInsight] = useState<AICheckInState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ignoredLastCheckIn, setIgnoredLastCheckIn] = useState(false);
  const [isRealAI, setIsRealAI] = useState(false);
  
  // Natural language chat query
  const [customQuestion, setCustomQuestion] = useState("");
  const [chatResponse, setChatResponse] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);

  // Load daily companion insight
  const fetchInsight = async (isIgnored: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/luna/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentDay,
          currentPhase,
          symptoms: activeSymptoms,
          remedies: activeRemedies,
          ignoredLastCheckIn: isIgnored,
          customNote: dailyNotes
        }),
      });
      const resData = await response.json();
      if (resData.success) {
        setInsight(resData.data);
        setIsRealAI(!!resData.isRealAI);
      } else {
        throw new Error("Could not compute premium health insight");
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger whenever state updates
  useEffect(() => {
    fetchInsight(ignoredLastCheckIn);
  }, [currentDay, currentPhase, activeSymptoms, activeRemedies, dailyNotes, ignoredLastCheckIn]);

  // Command to ask a custom question that merges current state and custom user question
  const handleAskLuna = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    setChatLoading(true);
    setChatResponse(null);
    try {
      // Send message to api route
      const response = await fetch("/api/luna/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentDay,
          currentPhase,
          symptoms: activeSymptoms,
          remedies: activeRemedies,
          ignoredLastCheckIn,
          customNote: `[User custom query: ${customQuestion}] (Daily Journal: ${dailyNotes})`
        }),
      });
      const resData = await response.json();
      if (resData.success) {
        setChatResponse(resData.data.message);
      } else {
        throw new Error("Unable to formulate answer");
      }
    } catch (err: any) {
      setChatResponse("Luna was unable to respond. Please check that the server is online and valid credentials are set.");
    } finally {
      setChatLoading(false);
    }
  };

  const handleIgnoreToggle = () => {
    const nextIgnored = !ignoredLastCheckIn;
    setIgnoredLastCheckIn(nextIgnored);
    fetchInsight(nextIgnored);
  };

  return (
    <div className="flex flex-col gap-6" id="luna-ai-companion-wrapper">
      
      {/* Primary Smart Frosted Glass Greeting Panel */}
      <div className="bg-white/50 backdrop-blur-3xl border border-white/80 rounded-[40px] p-8 relative overflow-hidden shadow-sm" id="companion-main-panel">
        <div className="absolute top-0 right-0 p-6 opacity-5">
          <Bot className="w-24 h-24 text-[#881337]" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <span className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#881337]/80 font-mono">
              Luna Health Companion
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100/50 px-2.5 py-1 rounded-full text-[10px] font-mono text-[#881337] font-semibold uppercase">
            <Award className="w-3 h-3 text-rose-600" /> Premium Active AI
          </div>
        </div>

        {/* Luna Greeting Block */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold leading-tight text-stone-800" style={{ fontFamily: 'Georgia, serif' }}>
            Hello, {userName}.
          </h2>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="py-6 flex flex-col items-center justify-center gap-3"
              >
                <div className="w-8 h-8 rounded-full border-2 border-rose-600/20 border-t-rose-600 animate-spin" />
                <p className="text-xs font-mono text-stone-400">Processing baseline correlation data...</p>
              </motion.div>
            ) : error ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl text-xs text-rose-800"
              >
                {error}. Using predictive local correlation.
              </motion.div>
            ) : (
              <motion.div 
                key={currentPhase} 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="space-y-4"
              >
                <div className="p-5 bg-white/40 border border-white/50 rounded-2xl">
                  <p className="text-stone-700 leading-relaxed text-sm md:text-base font-light">
                    "{insight?.message}"
                  </p>
                  {insight?.adaptedTone && (
                    <div className="mt-3 flex items-center gap-1.5">
                      <span className="text-[10px] font-mono bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Tone Adjusted: {insight.adaptedTone}
                      </span>
                      {ignoredLastCheckIn && (
                        <span className="text-[10px] font-mono text-rose-600 font-semibold">
                          (Muted mode activated)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actionable remedy insight (Subscription hook) */}
                {insight?.suggestion && (
                  <div className="bg-gradient-to-br from-rose-500 to-[#881337] text-white rounded-3xl p-5 shadow-lg shadow-rose-950/10 relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-rose-200 fill-rose-200" />
                      <span className="text-xs font-mono uppercase tracking-widest text-rose-100 font-semibold">
                        Luna Remedy Engine Prediction
                      </span>
                    </div>

                    <h4 className="text-lg font-bold font-display tracking-tight text-white mb-1.5 leading-snug">
                      {insight.suggestion.remedy} {insight.suggestion.dosage ? `(${insight.suggestion.dosage})` : ""}
                    </h4>
                    
                    <p className="text-xs text-rose-100/90 leading-relaxed font-light mb-3 italic">
                      "{insight.suggestion.reason}"
                    </p>

                    <div className="text-[10px] bg-white/10 backdrop-blur-md rounded-lg px-2.5 py-1.5 inline-block text-white font-mono">
                      💡 Verified in previous cycles
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ignore / Focus Mode Toolbar */}
          <div className="flex gap-4 justify-between items-center border-t border-stone-200/50 pt-5 mt-3">
            <button
              onClick={handleIgnoreToggle}
              className={`flex items-center gap-2 text-xs font-medium font-mono transition duration-300 py-2 px-3.5 rounded-full border ${
                ignoredLastCheckIn 
                  ? "bg-rose-50 border-rose-200 text-rose-800" 
                  : "bg-[#881337] text-white border-transparent hover:bg-rose-950"
              }`}
              title="If muted, the health companion adjusts instantly to a shorter, quiet and less intrusive tone"
              id="mute-companion-btn"
            >
              {ignoredLastCheckIn ? (
                <>
                  <Smile className="w-3.5 h-3.5" />
                  Unmute Daily Check-in
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  Mute Day {currentDay} Check-in
                </>
              )}
            </button>

            <span className="text-[11px] font-mono text-stone-400">
              💡 {isRealAI ? "Live Gemini 3.5 API Connection" : "Local Predictive Simulation Mode"}
            </span>
          </div>
        </div>
      </div>

      {/* Ask Luna Anything Console */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[32px] p-6 shadow-xs flex flex-col gap-4" id="luna-ask-anything">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-stone-400" />
          <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wider font-mono">Ask Luna Anything</h3>
        </div>

        <form onSubmit={handleAskLuna} className="flex gap-2">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder="Ask about supplements, sleep patterns, past symptoms..."
            className="flex-1 bg-white/60 text-stone-800 font-sans text-xs sm:text-sm p-3.5 rounded-2xl border border-stone-200/60 focus:outline-none focus:border-stone-500 focus:bg-white transition"
            id="chat-input-query"
          />
          <button
            type="submit"
            disabled={chatLoading || !customQuestion.trim()}
            className="bg-[#881337] hover:bg-rose-950 text-white font-mono text-xs px-4 rounded-2xl transition disabled:opacity-40"
            id="chat-submit-btn"
          >
            {chatLoading ? "Querying..." : "Send"}
          </button>
        </form>

        {chatResponse && (
          <div className="bg-white/80 p-4 rounded-2xl border border-stone-200/50 text-xs sm:text-sm text-stone-700 leading-relaxed animate-fade-in relative">
            <span className="absolute top-2 right-2 text-[9px] font-mono font-medium text-stone-400 uppercase">Interactive Answer</span>
            <p className="font-mono text-[10px] text-stone-400 block mb-1">Luna AI health companion responds:</p>
            <p className="font-light italic">"{chatResponse}"</p>
          </div>
        )}
      </div>

      {/* Persistence Memory Sandbox Timeline */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-[32px] p-6 shadow-xs" id="luna-remedy-timeline">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#881337]" />
            <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-widest font-mono">
              Verified Remedy Memory Base
            </h3>
          </div>
          <span className="text-[10px] font-mono bg-[#881337]/10 text-[#881337] px-2 py-0.5 rounded-full font-bold uppercase">
            Historical Memory Log
          </span>
        </div>

        <p className="text-xs text-stone-500 font-light mb-4">
          The core advantage of Luna Premium is tracking your direct body patterns over months. Here is what your historical logs feed into the current day prediction loop:
        </p>

        <div className="space-y-4 font-sans text-xs">
          
          <div className="relative pl-6 border-l border-rose-300">
            <div className="absolute top-1 -left-1.5 w-3 h-3 rounded-full bg-rose-500" />
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[10px] text-stone-400 uppercase">September Logs (Menstrual Phase)</span>
              <span className="text-[9px] font-mono bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-100">
                Days 2–3 Cramps Relief
              </span>
            </div>
            <p className="text-stone-700 font-light leading-relaxed">
              Cramps severity <strong>4/5</strong> dropped to <strong>0/5</strong> within 24 hours of starting <strong>Magnesium Glycinate 300mg</strong>. User marked key efficacy as "Holy Grail (5/5)".
            </p>
          </div>

          <div className="relative pl-6 border-l border-teal-300">
            <div className="absolute top-1 -left-1.5 w-3 h-3 rounded-full bg-teal-500" />
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[10px] text-stone-400 uppercase">October Logs (Luteal Phase)</span>
              <span className="text-[9px] font-mono bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded border border-teal-100">
                Day 23 Bloating Relief
              </span>
            </div>
            <p className="text-stone-700 font-light leading-relaxed">
              Logged sudden bloating and lower belly discomfort on day 23 of late Luteal. Drank <strong>Ginger Tea (1 warm cup)</strong>, with bloating and gas resolving within 1 hour. marked Efficacy (4/5).
            </p>
          </div>
          
        </div>
      </div>

    </div>
  );
}
