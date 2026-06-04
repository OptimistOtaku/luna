import React, { useState } from "react";
import { UserProfile } from "../types";
import { Sparkles, ArrowRight, Book, Shield, Heart, Clock, Check } from "lucide-react";

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const AVAILABLE_GOALS = [
  "Anticipatory hormone dip tracking",
  "Tailored herb and remedy recommendations",
  "Biometric sleep & cortisol optimization",
  "PMS flare management and mood sync",
  "Cycle tracking and fertility awareness"
];

// Reference the actual generated hero image path
const HERO_IMAGE_PATH = "/src/assets/images/luna_wellness_hero_1780588758088.png";

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [lastPeriodDate, setLastPeriodDate] = useState(() => {
    // Default to 23 days ago so they naturally start on Day 23 like the pre-defined persona!
    const d = new Date();
    d.setDate(d.getDate() - 22);
    return d.toISOString().split("T")[0];
  });
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    "Anticipatory hormone dip tracking",
    "Tailored herb and remedy recommendations"
  ]);

  const handleGoalToggle = (goal: string) => {
    setSelectedGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const handleNext = () => {
    if (step === 1 && (!name.trim() || !email.trim())) {
      alert("Please specify a nickname and email to log your secure encrypted biometrics.");
      return;
    }
    if (step < 3) {
      setStep(prev => prev + 1);
    } else {
      const finalProfile: UserProfile = {
        name: name.trim(),
        email: email.trim(),
        cycleLength,
        periodLength,
        lastPeriodDate,
        isOnboarded: true,
        goals: selectedGoals
      };
      onComplete(finalProfile);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 text-left selection:bg-rose-200" id="luna-onboarding-container">
      {/* Blurred atmospheric glowing backdrops */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#fecaca] blur-[120px] opacity-40"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#fae8ff] blur-[120px] opacity-50"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl bg-white/55 backdrop-blur-3xl border border-white/80 rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-300">
        
        {/* Editorial Left sidebar with watercolor hero image */}
        <div className="w-full md:w-5/12 bg-cover bg-center relative min-h-[180px] md:min-h-[460px] flex flex-col justify-end p-6 border-b md:border-b-0 md:border-r border-rose-100">
          <img 
            src={HERO_IMAGE_PATH} 
            alt="Luna Watercolor Moon Theme" 
            className="absolute inset-0 w-full h-full object-cover z-0"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/40 to-transparent z-10" />

          <div className="relative z-20 text-white mt-auto">
            <span className="text-[10px] font-mono tracking-widest uppercase text-rose-300 font-bold block mb-1">Luna Premium</span>
            <h1 className="text-3xl font-bold tracking-tight font-display text-white" style={{ fontFamily: "Georgia, serif" }}>luna</h1>
            <p className="text-xs text-rose-100/90 leading-relaxed font-light mt-2">
              Active cycle intelligence that anticipates symptomatology before you even open your calendar. Let's make your data work directly for you.
            </p>
          </div>
        </div>

        {/* Dynamic Form Content */}
        <div className="flex-1 p-6 md:p-9 flex flex-col justify-between">
          
          {/* Onboarding Header */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] uppercase font-mono font-bold text-[#881337] tracking-widest bg-rose-100/60 px-2.5 py-1 rounded-full">
                Phase {step} of 3
              </span>
              <div className="flex gap-1.5">
                {[1, 2, 3].map(i => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === step ? "w-6 bg-[#881337]" : "w-2 bg-stone-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Steps router */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in" id="onboarding-step-1">
                <div>
                  <h2 className="text-2xl font-bold text-stone-800 tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
                    Identify yourself.
                  </h2>
                  <p className="text-xs text-stone-500 font-light mt-1.5 leading-relaxed">
                    Luna creates localized correlations specifically matching how you react to progesterone surges. Let's start with your secure profile basics.
                  </p>
                </div>

                <div className="space-y-3.5 pt-2">
                  <div>
                    <label className="text-[10px] font-mono tracking-wider text-stone-400 uppercase font-medium block mb-1.5">
                      Your First Name / Nickname
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="E.g., Elena"
                      className="w-full text-sm p-3 rounded-2xl bg-white border border-stone-200/70 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:bg-white text-stone-800 placeholder-stone-400"
                      id="onboard-name-input"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono tracking-wider text-stone-400 uppercase font-bold block mb-1.5">
                      Your Secure Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="E.g., elena@gmail.com"
                      className="w-full text-sm p-3 rounded-2xl bg-white border border-stone-200/70 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:bg-white text-stone-800 placeholder-stone-400"
                      id="onboard-email-input"
                    />
                  </div>
                </div>

                <div className="p-3 bg-stone-50/50 rounded-2xl border border-stone-100 flex items-start gap-2.5 text-[11px] text-stone-500 leading-relaxed font-light mt-4">
                  <Shield className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                  <span>Your privacy is premium. No marketing trackers. All logs are highly encrypted and processed securely by Luna's dedicated LLM model.</span>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in" id="onboarding-step-2">
                <div>
                  <h2 className="text-2xl font-bold text-stone-800 tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
                    Configure your rhythm.
                  </h2>
                  <p className="text-xs text-stone-500 font-light mt-1.5 leading-relaxed">
                    Luna calculates Estrogen waves dynamically. These estimates can be fine-tuned via the interactive dial on your dashboard anytime.
                  </p>
                </div>

                <div className="space-y-4 pt-2 text-xs">
                  
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="bg-white/40 p-3 rounded-2xl border border-stone-150">
                      <label className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-1.5 font-semibold">
                        Average Cycle Length
                      </label>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#881337]" />
                        <input
                          type="number"
                          min="20"
                          max="45"
                          value={cycleLength}
                          onChange={e => setCycleLength(parseInt(e.target.value) || 28)}
                          className="w-14 text-sm font-bold bg-transparent focus:outline-none text-stone-800"
                        />
                        <span className="text-stone-400 font-mono text-[10px]">Days</span>
                      </div>
                    </div>

                    <div className="bg-white/40 p-3 rounded-2xl border border-stone-150">
                      <label className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-1.5 font-bold">
                        Avg Period Duration
                      </label>
                      <div className="flex items-center gap-2">
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        <input
                          type="number"
                          min="2"
                          max="12"
                          value={periodLength}
                          onChange={e => setPeriodLength(parseInt(e.target.value) || 5)}
                          className="w-14 text-sm font-bold bg-transparent focus:outline-none text-stone-800"
                        />
                        <span className="text-stone-400 font-mono text-[10px]">Days</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono tracking-wider text-stone-400 uppercase font-medium block mb-1.5">
                      First Day Of Last Period
                    </label>
                    <input
                      type="date"
                      value={lastPeriodDate}
                      onChange={e => setLastPeriodDate(e.target.value)}
                      className="w-full text-xs sm:text-sm p-3 rounded-2xl bg-white border border-stone-200/70 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:bg-white text-stone-800"
                      id="onboard-last-date"
                    />
                    <span className="text-[10px] text-stone-400 font-mono mt-1 block">
                      💡 Luna will automatically calculate your starting day today.
                    </span>
                  </div>

                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-fade-in" id="onboarding-step-3">
                <div>
                  <h2 className="text-2xl font-bold text-stone-800 tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
                    Select your focus points.
                  </h2>
                  <p className="text-xs text-stone-500 font-light mt-1.2 leading-relaxed">
                    Choose what areas of the Luna Premium AI Remedy engine you want to prioritize for daily predictive synthesis.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  {AVAILABLE_GOALS.map((goal) => {
                    const active = selectedGoals.includes(goal);
                    return (
                      <button
                        key={goal}
                        onClick={() => handleGoalToggle(goal)}
                        className={`w-full text-xs font-sans text-left p-2.5 rounded-xl border flex items-center gap-3 transition ${
                          active
                            ? "border-[#881337] bg-rose-50/50 text-[#881337] font-medium"
                            : "border-stone-150 bg-white text-stone-600 hover:border-stone-300"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                          active ? "bg-[#881337] border-transparent text-white" : "border-stone-300 bg-white"
                        }`}>
                          {active && <Check className="w-3 h-3 stroke-[3px]" />}
                        </div>
                        <span>{goal}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Action Row */}
          <div className="flex gap-3 mt-8 pt-5 border-t border-stone-100">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="py-3 px-5 rounded-2xl border border-stone-200 text-xs font-mono font-medium text-stone-500 hover:bg-stone-50 transition"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 py-3 px-5 rounded-2xl bg-[#881337] hover:bg-rose-950 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition"
              id="onboard-next-btn"
            >
              <span>{step === 3 ? "Launch Luna Companion" : "Continue"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
