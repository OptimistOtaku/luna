export interface UserProfile {
  name: string;
  email: string;
  cycleLength: number;
  periodLength: number;
  lastPeriodDate: string; // YYYY-MM-DD
  isOnboarded: boolean;
  goals: string[];
}

export enum CyclePhase {
  MENSTRUAL = "Menstrual",
  FOLLICULAR = "Follicular",
  OVULATORY = "Ovulatory",
  LUTEAL = "Luteal"
}

export interface SymptomLog {
  id: string;
  name: string; // e.g. "Cramps", "Bloating", "Mood swings", "Fatigue", "Insomnia", "Headache"
  severity: number; // 0 (none) to 5 (severe)
}

export interface RemedyLog {
  id: string;
  name: string; // e.g. "Magnesium Glycinate", "Chamomile Tea", "Heating Pad", "Ginger Tea", "Ibuprofen", "Yoga"
  dosage?: string; // e.g. "300mg", "1 cup", "20 mins", "200mg"
  efficacy: number; // 1 (ineffective) to 5 (holy grail)
  loggedAt: string; // ISO timestamp or HH:MM
}

export interface CycleDayData {
  date: string; // YYYY-MM-DD
  cycleDay: number; // 1 to 28+
  phase: CyclePhase;
  symptoms: SymptomLog[];
  remedies: RemedyLog[];
  notes?: string;
  flow?: "none" | "light" | "medium" | "heavy";
  moodScore?: number; // 1 to 5
  energyScore?: number; // 1 to 5
}

export interface CycleHistory {
  cycleId: string;
  startDate: string; // YYYY-MM-DD
  cycleLength: number; // e.g. 28
  periodLength: number; // e.g. 5
  logs: CycleDayData[];
}

export interface AICheckIn {
  phase: CyclePhase;
  cycleDay: number;
  message: string;
  suggestion?: {
    remedy: string;
    dosage?: string;
    reason: string;
  };
  ignored?: boolean;
}

export interface RemedyCorrelation {
  remedyName: string;
  symptomName: string;
  dosage?: string;
  successCount: number;
  avgDaysToRelief: number;
  description: string;
}
