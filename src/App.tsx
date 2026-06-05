import React, { useState, useEffect } from "react";
import CycleWheel, { getCyclePhase } from "./components/CycleWheel";
import SymptomLogger from "./components/SymptomLogger";
import AICompanion from "./components/AICompanion";
import Onboarding from "./components/Onboarding";
import { CyclePhase, SymptomLog, RemedyLog, UserProfile } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  Thermometer, 
  Activity, 
  HelpCircle, 
  Calendar, 
  Settings, 
  Sparkles, 
  History, 
  ExternalLink,
  BookOpen,
  X,
  User,
  ShieldAlert,
  Sliders,
  RotateCcw
} from "lucide-react";

import WELLNESS_HERO_IMAGE from "./assets/images/luna_wellness_hero_1780588758088.png";
import USER_PORTRAIT_IMAGE from "./assets/images/luna_user_portrait_1780588774842.png";

export default function App() {
  // User Profile loaded directly from key storage
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("luna_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isOnboarded) {
          return parsed;
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Calculate simulated cycle day relative to last period date, standard 23 fallback
  const [currentDay, setCurrentDay] = useState<number>(() => {
    const saved = localStorage.getItem("luna_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.lastPeriodDate && parsed.cycleLength) {
          const lastDate = new Date(parsed.lastPeriodDate);
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - lastDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          // Modulo wrap to keep within cycle limit boundary
          return (diffDays % parsed.cycleLength) || 1;
        }
      } catch (e) {}
    }
    return 23;
  });
  
  // Tracking logs state for active symptoms of currentDay
  const [activeSymptoms, setActiveSymptoms] = useState<SymptomLog[]>([]);

  // Track of logged remedies for currentDay
  const [activeRemedies, setActiveRemedies] = useState<RemedyLog[]>([]);

  const [moodScore, setMoodScore] = useState<number>(3);
  const [energyScore, setEnergyScore] = useState<number>(2);
  const [dailyNotes, setDailyNotes] = useState<string>("");
  
  // Custom navigation info state popup modallers
  const [activeModal, setActiveModal] = useState<"history" | "library" | "profile" | null>(null);

  // Profile editing inputs state
  const [editName, setEditName] = useState("");
  const [editCycleLength, setEditCycleLength] = useState(28);
  const [editPeriodLength, setEditPeriodLength] = useState(5);
  const [editLastPeriodDate, setEditLastPeriodDate] = useState("");

  // Sync profile details when profile modal is opened
  useEffect(() => {
    if (profile) {
      setEditName(profile.name);
      setEditCycleLength(profile.cycleLength);
      setEditPeriodLength(profile.periodLength);
      setEditLastPeriodDate(profile.lastPeriodDate);
    }
  }, [profile, activeModal]);

  // Load saved state for the current day
  useEffect(() => {
    const key = `luna_day_log_day_${currentDay}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setActiveSymptoms(parsed.activeSymptoms || []);
        setActiveRemedies(parsed.activeRemedies || []);
        setMoodScore(parsed.moodScore ?? 3);
        setEnergyScore(parsed.energyScore ?? 3);
        setDailyNotes(parsed.dailyNotes ?? "");
      } catch (e) {
        console.warn("Could not load day log", e);
      }
    } else {
      // Setup smart default demo state for Day 23, but keep clean for others
      if (currentDay === 23) {
        setActiveSymptoms([
          { id: "sym-bloating", name: "Bloating", severity: 3 },
          { id: "sym-insomnia", name: "Insomnia", severity: 1 }
        ]);
        setActiveRemedies([]);
        setMoodScore(3);
        setEnergyScore(2);
        setDailyNotes("My back is a bit sore and feeling bloated near bedtime.");
      } else {
        setActiveSymptoms([]);
        setActiveRemedies([]);
        setMoodScore(3);
        setEnergyScore(3);
        setDailyNotes("");
      }
    }
  }, [currentDay]);

  // Save the state back when symptoms list, remedies list, scores, or note changes
  useEffect(() => {
    if (!profile) return;
    const key = `luna_day_log_day_${currentDay}`;
    const logData = {
      activeSymptoms,
      activeRemedies,
      moodScore,
      energyScore,
      dailyNotes
    };
    localStorage.setItem(key, JSON.stringify(logData));
  }, [currentDay, activeSymptoms, activeRemedies, moodScore, energyScore, dailyNotes, profile]);

  // Handle onboarding callback
  const handleOnboardingComplete = (newProfile: UserProfile) => {
    localStorage.setItem("luna_profile", JSON.stringify(newProfile));
    setProfile(newProfile);

    // Set starting day based on calculated duration
    if (newProfile.lastPeriodDate && newProfile.cycleLength) {
      const lastDate = new Date(newProfile.lastPeriodDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const calculatedDay = (diffDays % newProfile.cycleLength) || 1;
      setCurrentDay(calculatedDay);
    } else {
      setCurrentDay(23); // Standard default
    }
  };

  // Profile modal update handler
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const updated: UserProfile = {
      ...profile,
      name: editName.trim() || profile.name,
      cycleLength: editCycleLength || profile.cycleLength,
      periodLength: editPeriodLength || profile.periodLength,
      lastPeriodDate: editLastPeriodDate || profile.lastPeriodDate
    };

    localStorage.setItem("luna_profile", JSON.stringify(updated));
    setProfile(updated);
    setActiveModal(null);
    alert("Luna health credentials and rhythm offsets updated successfully.");
  };

  // Reset function to clear database and resume onboarding
  const handleResetData = () => {
    if (confirm("Are you sure you want to delete your profile and clear all logged cycle logs? This cannot be undone.")) {
      localStorage.removeItem("luna_profile");
      // Clear logged values
      for (let i = 1; i <= 35; i++) {
        localStorage.removeItem(`luna_day_log_day_${i}`);
      }
      setProfile(null);
      setCurrentDay(23);
      setActiveModal(null);
    }
  };

  // Route to onboarding layout if not logged in
  if (!profile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Derive active phase dynamic indicators
  const phaseInfo = getCyclePhase(currentDay);

  // Dynamic values that adapt organically to the current cycle day to show Luna's "clever" context!
  const getDynamicBiometrics = () => {
    if (currentDay >= 1 && currentDay <= 5) {
      // Menstrual
      return { heartRate: 64, temperature: "36.4", sleepQuality: 71, phaseText: "Estrogen down, focus on iron & absolute rest" };
    } else if (currentDay >= 6 && currentDay <= 13) {
      // Follicular
      return { heartRate: 68, temperature: "36.5", sleepQuality: 88, phaseText: "Estrogen rising, energy is building" };
    } else if (currentDay >= 14 && currentDay <= 15) {
      // Ovulation
      return { heartRate: 75, temperature: "36.6", sleepQuality: 92, phaseText: "Estrogen & LH peak, peak stamina" };
    } else {
      // Luteal
      const tempFactor = currentDay > 21 ? "36.9" : "36.8";
      const sleepQualityValue = currentDay > 22 ? 78 : 83;
      return { heartRate: 72, temperature: tempFactor, sleepQuality: sleepQualityValue, phaseText: "Progesterone dominates, potential night sweat & bloated intervals" };
    }
  };

  const biometrics = getDynamicBiometrics();

  // Callback handlers for symptoms logger
  const handleSymptomSeverityChange = (symptomName: string, severity: number) => {
    setActiveSymptoms((prev) => {
      const idx = prev.findIndex((s) => s.name === symptomName);
      if (idx > -1) {
        if (severity === 0) {
          return prev.filter((s) => s.name !== symptomName);
        } else {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], severity };
          return updated;
        }
      } else if (severity > 0) {
        return [...prev, { id: `sym-${Date.now()}`, name: symptomName, severity }];
      }
      return prev;
    });
  };

  const handleRemedyToggle = (remedyName: string, dosage?: string) => {
    setActiveRemedies((prev) => {
      const idx = prev.findIndex((r) => r.name === remedyName);
      if (idx > -1) {
        return prev.filter((r) => r.name !== remedyName);
      } else {
        return [...prev, {
          id: `rem-${Date.now()}`,
          name: remedyName,
          dosage,
          efficacy: 4,
          loggedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }];
      }
    });
  };

  // Dynamic initials for custom avatar
  const getInitials = (nameStr: string) => {
    const trimmed = nameStr.trim();
    if (!trimmed) return "LN";
    const parts = trimmed.split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return trimmed.slice(0, 2).toUpperCase();
  };

  return (
    <div className="w-full min-h-screen bg-[#fdf2f2] text-[#3d2c2c] font-sans relative overflow-x-hidden selection:bg-rose-200" id="luna-app-container">
      
      {/* Absolute Frosted Glass blurred atmospheric background nodes */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#fecaca] blur-[120px] opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#fae8ff] blur-[120px] opacity-50"></div>
        <div className="absolute top-[20%] right-[10%] w-[35%] h-[35%] rounded-full bg-[#fce7f3] blur-[100px] opacity-40"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col min-h-screen px-4 md:px-10">
        
        {/* Navigation Bar */}
        <nav className="flex items-center justify-between py-6 md:py-8 border-b border-rose-100/20" id="luna-navbar">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-[#f43f5e] to-[#881337] rounded-full shadow-lg shadow-rose-200 flex items-center justify-center">
              <span className="text-white text-xs font-serif italic">l</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#881337] cursor-pointer" style={{ fontFamily: "'Georgia', serif" }} onClick={() => setCurrentDay(23)}>
              luna
            </span>
            <span className="ml-2 text-[10px] uppercase tracking-widest font-bold bg-[#881337] text-white px-2.5 py-0.5 rounded-full">
              Premium
            </span>
          </div>

          <div className="flex items-center gap-4 md:gap-8 text-xs md:text-sm font-medium text-stone-600">
            <button 
              onClick={() => setActiveModal("history")}
              className="hover:text-[#881337] transition flex items-center gap-1.5 font-mono uppercase tracking-wider text-[11px]"
              id="nav-history-btn"
            >
              <History className="w-4 h-4" /> Cycle History
            </button>
            
            <button 
              onClick={() => setActiveModal("library")}
              className="hover:text-[#881337] transition flex items-center gap-1.5 font-mono uppercase tracking-wider text-[11px]"
              id="nav-library-btn"
            >
              <BookOpen className="w-4 h-4" /> Health Library
            </button>

            {/* Profile Avatar displaying current context */}
            <button 
              onClick={() => setActiveModal("profile")}
              className="group flex items-center gap-2 bg-white/40 border border-white/60 pl-2.5 pr-4 py-1.5 rounded-full hover:bg-white/70 transition shadow-sm"
              id="nav-profile-btn"
              title="View and edit your personal hormone profile goals"
            >
              <img 
                src={USER_PORTRAIT_IMAGE} 
                alt="Your portrait" 
                className="w-7 h-7 rounded-full object-cover border border-[#881337]/15 group-hover:scale-105 transition duration-300"
                referrerPolicy="no-referrer"
              />
              <span className="font-mono text-xs text-[#881337] font-bold uppercase tracking-wider">
                {getInitials(profile.name)}
              </span>
            </button>
          </div>
        </nav>

        {/* Global Informative Alert Bar */}
        <div className="my-2 bg-white/20 backdrop-blur-md border border-white/55 px-5 py-3 rounded-2xl text-[11px] font-mono text-stone-500 flex items-center gap-2 justify-between flex-wrap shadow-sm">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>Active Luna AI diagnostic session running. Change the <strong>Simulation Dial</strong> on the wheel to preview custom phase actions.</span>
          </div>
          <span className="text-[#881337] font-semibold uppercase tracking-wider">Logged in as {profile.name}</span>
        </div>

        {/* Main Application Bento Grid Layout */}
        {/* We use motion.div here keyed to currentPhase to fade columns beautifully on hormonal phase transitions */}
        <AnimatePresence mode="wait">
          <motion.main 
            key={phaseInfo.name}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.52, ease: "easeOut" }}
            className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-1 md:py-6 pb-12" 
            id="luna-main-grid"
          >
            
            {/* Left Column (Day Wheel Status, Dynamic state statistics) */}
            <div className="lg:col-span-4 flex flex-col gap-6" id="bento-col-left">
              
              {/* Day display Frosted Hero Card */}
              <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[36px] p-6 flex flex-col justify-between shadow-xs transition duration-300 hover:bg-white/45">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#881337]/75 font-mono mb-2 block text-left">
                    Current Status
                  </p>
                  <div className="flex items-baseline gap-2 text-left">
                    <h1 className="text-6xl md:text-7xl font-light leading-none tracking-tight text-stone-800" style={{ fontFamily: "'Georgia', serif" }}>
                      Day {currentDay}
                    </h1>
                  </div>
                  <p className="text-base font-semibold text-stone-700 mt-2 text-left">
                    {phaseInfo.name} Phase
                  </p>
                  <code className="text-[9px] font-mono text-[#881337] bg-rose-50/50 px-2.5 py-1 rounded-full border border-rose-100/35 mt-1.5 inline-block text-left">
                    {biometrics.phaseText}
                  </code>
                </div>
                
                <div className="space-y-3 mt-6">
                  <div className="h-2 w-full bg-white/40 rounded-full overflow-hidden border border-white/50">
                    <div 
                      className="h-full bg-gradient-to-r from-rose-400 to-[#881337] rounded-full transition-all duration-500"
                      style={{ width: `${(currentDay / profile.cycleLength) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-mono font-medium text-stone-500">
                    <span>
                      {currentDay > (profile.cycleLength - 5) ? "Period arriving soon" : `${profile.cycleLength - currentDay} days remaining`}
                    </span>
                    <span>{Math.round((currentDay / profile.cycleLength) * 100)}% of cycle finished</span>
                  </div>
                </div>
              </div>

              {/* Cycle interactive Wheel slider */}
              <CycleWheel currentDay={currentDay} onDayChange={setCurrentDay} maxCycleDays={profile.cycleLength} />

            </div>

            {/* Right Column (Luna Health AI Companion greeting & Daily inputs logger) */}
            <div className="lg:col-span-8 flex flex-col gap-6" id="bento-col-right">
              
              {/* Companion Active Greeting console */}
              <AICompanion 
                currentDay={currentDay}
                currentPhase={phaseInfo.name}
                activeSymptoms={activeSymptoms}
                activeRemedies={activeRemedies}
                dailyNotes={dailyNotes}
                userName={profile.name}
              />

              {/* Symptom Logger check-in panel */}
              <SymptomLogger 
                activeSymptoms={activeSymptoms}
                activeRemedies={activeRemedies}
                onSymptomSeverityChange={handleSymptomSeverityChange}
                onRemedyToggle={handleRemedyToggle}
                moodScore={moodScore}
                onMoodScoreChange={setMoodScore}
                energyScore={energyScore}
                onEnergyScoreChange={setEnergyScore}
                dailyNotes={dailyNotes}
                onDailyNotesChange={setDailyNotes}
              />

              {/* Bottom biometric metrics row displaying responsive smart readings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="luna-biometrics-row">
                
                <div className="bg-white/30 backdrop-blur-xl border border-white/50 rounded-[28px] p-5 flex items-center gap-4 shadow-xs hover:bg-white/40 transition">
                  <div className="w-11 h-11 rounded-full bg-orange-100/85 flex items-center justify-center text-orange-600 shadow-inner">
                    <Heart className="w-5 h-5 fill-orange-500 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider">Heart Rate</p>
                    <p className="text-xl font-bold font-display text-stone-800">
                      {biometrics.heartRate} <span className="text-xs font-normal text-stone-500">bpm</span>
                    </p>
                  </div>
                </div>

                <div className="bg-white/30 backdrop-blur-xl border border-white/50 rounded-[28px] p-5 flex items-center gap-4 shadow-xs hover:bg-white/40 transition">
                  <div className="w-11 h-11 rounded-full bg-blue-100/85 flex items-center justify-center text-blue-600 shadow-inner">
                    <Thermometer className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider">Basal Temp</p>
                    <p className="text-xl font-bold font-display text-stone-800">
                      {biometrics.temperature} <span className="text-xs font-normal text-stone-500">°C</span>
                    </p>
                  </div>
                </div>

                <div className="bg-white/30 backdrop-blur-xl border border-white/50 rounded-[28px] p-5 flex items-center gap-4 shadow-xs hover:bg-white/40 transition">
                  <div className="w-11 h-11 rounded-full bg-emerald-100/85 flex items-center justify-center text-emerald-600 shadow-inner">
                    <Activity className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider">Sleep Quality</p>
                    <p className="text-xl font-bold font-display text-stone-800">
                      {biometrics.sleepQuality} <span className="text-xs font-normal text-stone-500">%</span>
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </motion.main>
        </AnimatePresence>

        {/* Custom Footer */}
        <footer className="py-8 text-center border-t border-rose-100/10 text-stone-400 text-xs font-mono" id="luna-footer">
          <p>© 2026 Luna Premium Period Tracking. AI companion active.</p>
        </footer>

      </div>

      {/* Dynamic Popups for Premium Features */}
      {activeModal === "history" && (
        <div className="fixed inset-0 bg-[#3d2c2c]/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-xl w-full p-6 border border-rose-150 shadow-2xl relative animate-fade-in text-left">
            <button 
              onClick={() => setActiveModal(null)} 
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-50 transition"
              id="close-modal-history"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-[#881337]" />
              <h3 className="text-lg font-bold font-display text-stone-800" style={{ fontFamily: 'Georgia, serif' }}>
                {profile.name}'s Cycle History Lengths
              </h3>
            </div>

            <p className="text-xs text-stone-500 mb-4 font-light">
              Here is an overview of previous monthly logs synchronized securely in local device memory. 
            </p>

            <div className="space-y-3.5 text-xs text-stone-700">
              <div className="p-3.5 bg-stone-50 rounded-2xl flex justify-between items-center border border-stone-100">
                <div>
                  <p className="font-semibold text-stone-800">September Period (Cycle - 2)</p>
                  <p className="text-[10px] text-[#881337] font-mono uppercase font-semibold">Cramps resolved using Magnesium</p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-[#881337]">28 days</span> <span className="text-stone-400 text-[10px] block font-mono">Period: 5 days</span>
                </div>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-2xl flex justify-between items-center border border-stone-100">
                <div>
                  <p className="font-semibold text-stone-800">October Period (Cycle - 1)</p>
                  <p className="text-[10px] text-[#881337] font-mono uppercase font-semibold">Bloating resolved using Ginger tea on Day 23</p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-[#881337]">29 days</span> <span className="text-stone-400 text-[10px] block font-mono">Period: 4 days</span>
                </div>
              </div>

              <div className="p-3.5 bg-rose-50/50 rounded-2xl flex justify-between items-center border border-rose-100/60">
                <div>
                  <p className="font-semibold text-[#881337]">Active Period (Simulated Current Cycle)</p>
                  <p className="text-[10px] text-stone-500 font-mono uppercase font-medium">Tracking and calculations active</p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-[#881337]">Day {currentDay}/{profile.cycleLength}</span> <span className="text-stone-400 text-[10px] block font-mono">In Progress</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setActiveModal(null)}
              className="w-full mt-6 py-3 bg-[#881337] hover:bg-rose-950 text-white font-mono rounded-xl text-xs transition font-semibold"
            >
              Back to Track Console
            </button>
          </div>
        </div>
      )}

      {activeModal === "library" && (
        <div className="fixed inset-0 bg-[#3d2c2c]/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-xl w-full p-6 border border-rose-150 shadow-2xl relative animate-fade-in text-left">
            <button 
              onClick={() => setActiveModal(null)} 
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-50 transition"
              id="close-modal-library"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <BookOpen className="w-5 h-5 text-teal-600" />
              <h3 className="text-lg font-bold font-display text-stone-800" style={{ fontFamily: 'Georgia, serif' }}>
                Luna Health Library
              </h3>
            </div>

            {/* Embedded watercolor wellness illustration */}
            <div className="w-full h-32 rounded-2xl overflow-hidden mb-4 relative">
              <img 
                src={WELLNESS_HERO_IMAGE} 
                alt="Moon Wellness Watercolor Art" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-stone-900/30" />
            </div>

            <p className="text-xs text-stone-500 mb-4 font-light">
              Premium guidelines backed by endocrine studies for optimizing performance around hormonal waves.
            </p>

            <div className="space-y-3 text-xs text-stone-700 max-h-[220px] overflow-y-auto pr-1">
              <div className="p-3 bg-rose-50/40 rounded-xl">
                <h4 className="font-semibold text-rose-800 mb-1">Menstrual Phase (Days 1–5)</h4>
                <p className="font-light text-stone-600 text-[11px] leading-relaxed">Estrogen & Progesterone bottom out. Sleep latency is slightly elevated. Opt for light restorative yoga, heating pads for cramps, and iron-dense food.</p>
              </div>

              <div className="p-3 bg-teal-50/40 rounded-xl">
                <h4 className="font-semibold text-teal-800 mb-1">Follicular Phase (Days 6–13)</h4>
                <p className="font-light text-stone-600 text-[11px] leading-relaxed">Estrogen rises steadily. High cognitive performance, great creative ability. Physical power levels start recovering fully.</p>
              </div>

              <div className="p-3 bg-amber-50/40 rounded-xl">
                <h4 className="font-semibold text-amber-800 mb-1">Ovulatory Phase (Days 14–15)</h4>
                <p className="font-light text-stone-600 text-[11px] leading-relaxed">Estrogen peaks alongside LH. Body basal temperature rises slightly. Max performance on high-intensity drills or public speaking events.</p>
              </div>

              <div className="p-3 bg-indigo-50/40 rounded-xl">
                <h4 className="font-semibold text-indigo-800 mb-1">Luteal Phase (Days 16–28)</h4>
                <p className="font-light text-stone-600 text-[11px] leading-relaxed">Progesterone surges. Sleep efficiency decreases near day 21. High likelihood of water retention, cravings, and PMS. Offset physical congestion with ginger tea.</p>
              </div>
            </div>

            <button 
              onClick={() => setActiveModal(null)}
              className="w-full mt-5 py-3 bg-[#881337] hover:bg-rose-950 text-white font-mono rounded-xl text-xs transition font-semibold"
            >
              Done reading
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Profile and Hormone Goals settings edit panel modal */}
      {activeModal === "profile" && (
        <div className="fixed inset-0 bg-[#3d2c2c]/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-xl w-full p-6 border border-rose-150 shadow-2xl relative animate-fade-in text-left">
            <button 
              onClick={() => setActiveModal(null)} 
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-50 transition"
              id="close-modal-profile"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 border-b border-stone-100 pb-4">
              <img 
                src={USER_PORTRAIT_IMAGE} 
                alt="Portrait" 
                className="w-12 h-12 rounded-full object-cover border-2 border-[#881337]/50"
                referrerPolicy="no-referrer"
              />
              <div>
                <h3 className="text-lg font-bold text-stone-800 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                  Hormone Profile Settings
                </h3>
                <p className="text-xs text-stone-400 font-mono font-medium">SECRET ENDPOINT: SECURE AES LOCALSTORAGE</p>
              </div>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-1.5 font-bold">
                    Custom Nickname
                  </label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-stone-800 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-1.5 font-bold">
                    Profile Email
                  </label>
                  <input 
                    type="text" 
                    value={profile.email} 
                    disabled 
                    className="w-full p-2.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-400 text-xs font-mono"
                    title="Immutable profile signature key"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-1.5 font-bold">
                    Cycle Length (Days)
                  </label>
                  <input 
                    type="number" 
                    min="20"
                    max="45"
                    value={editCycleLength}
                    onChange={e => setEditCycleLength(parseInt(e.target.value) || 28)}
                    className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-stone-800 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-1.5 font-bold">
                    Period Duration (Days)
                  </label>
                  <input 
                    type="number" 
                    min="2"
                    max="12"
                    value={editPeriodLength}
                    onChange={e => setEditPeriodLength(parseInt(e.target.value) || 5)}
                    className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-[#3d2c2c] text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-1.5 font-bold">
                  First Day of Last Flow
                </label>
                <input 
                  type="date" 
                  value={editLastPeriodDate}
                  onChange={e => setEditLastPeriodDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-stone-800 text-xs"
                />
              </div>

              {/* Goals list review */}
              <div>
                <label className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-1.5 font-bold text-left">
                  Configured AI Intentions
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {profile.goals.map(goal => (
                    <span 
                      key={goal} 
                      className="text-[10px] bg-[#881337]/10 text-[#881337] px-2.5 py-1 rounded-full font-mono font-medium"
                    >
                      ✓ {goal}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-stone-100">
                <button 
                  type="button"
                  onClick={handleResetData}
                  className="px-4 py-2.5 border border-stone-200 hover:border-rose-400 hover:bg-rose-50/40 text-stone-500 hover:text-rose-800 font-mono text-xs rounded-xl flex items-center gap-1.5 transition"
                  title="Clear all stored memory to trigger onboarding block again"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Profile
                </button>

                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-[#881337] hover:bg-rose-950 text-white font-mono text-xs rounded-xl transition font-semibold"
                >
                  Save Profile Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
