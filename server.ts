import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

// Lazy initialize Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY environment variable is not set or has placeholder value.");
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

const app = express();
app.use(express.json());

const PORT = 3000;

// API Route: Calculate cycle-position aware insights and remedy suggestions
app.post("/api/luna/insight", async (req, res) => {
  const { currentDay, currentPhase, symptoms, remedies, ignoredLastCheckIn, customNote } = req.body;

  // Formulate detailed history payload for the model prompt
  const historyContext = `
  HISTORICAL DATA LOGS OF PREVIOUS CYCLES:
  - September Cycle:
    * Day 2 & 3: Severe cramps logged (Severity 4/5).
    * Day 3 PM: Took Magnesium Glycinate, 300mg.
    * Day 4, 5, 6: Cramp logs dropped to 0/5. Marked Magnesium Glycinate efficacy as "Holy Grail (5/5)".
    * Day 22 - 25 Luteal phase: Logged moderate bloating (Severity 3/5) & Mild insomnia. Logged Chamomile Tea (1 cup) with moderate efficacy (4/5).
  - October Cycle:
    * Day 1: Severe cramps (Severity 4/5). Started Magnesium Glycinate 300mg on Day 1.
    * Day 3: Cramp logs dropped to 0/5. Efficacy logged as 5/5.
    * Day 23 Luteal phase: Logged sudden mood swing/bloating. Took Ginger Tea. Efficacy tracked as 4/5. Ginger helped stop bloating within 1 hour.
  `;

  const inputPrompt = `
  CURRENT STATUS:
  - Current Day: ${currentDay} of the user's cycle.
  - Current Phase: ${currentPhase} Phase.
  - Active Logged Symptoms Today: ${(symptoms || []).map((s: any) => `${s.name} (Severity: ${s.severity}/5)`).join(", ") || "No active symptoms logged yet today."}
  - Active Logged Remedies Today: ${(remedies || []).map((r: any) => `${r.name} (${r.dosage || "No dosage"} - Efficacy: ${r.efficacy}/5)`).join(", ") || "No remedies logged yet today."}
  - User ignored the previous day's notification: ${ignoredLastCheckIn ? "YES (adjust your tone to be extremely quiet, shorter, non-intrusive, respecting their space. Still be helpful.)" : "NO"}
  - User custom daily journal note: "${customNote || "None"}"
  `;

  try {
    const ai = getGeminiClient();
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { text: historyContext },
        { text: inputPrompt }
      ],
      config: {
        systemInstruction: `You are Luna, a premium and active AI cycle tracker companion who predicts needs and suggests what worked in previous months (e.g. September/October).
        
        CRITICAL RULES:
        1. Cycle position awareness: Acknowledge the exact phase (${currentPhase}) and day (${currentDay}) without being overly textbook.
        2. Symptom history memory: Refer specifically to September/October logs where relevant. (e.g., "In September, Magnesium Glycinate (300mg) worked exceptionally well on Day 2 to resolve your severe cramps...").
        3. Warm, modern but non-fussy, premium tone. NOT bubbly, NOT hyperactive, NOT cold. No markdown headings. Keep it compact (2 to 3 sentences maximum for the message).
        4. In premium subscription, we focus on personalization: your data working for you, rather than general medical web facts.
        5. Suggestion Object must provide a tailored actionable suggestion. If bloating is active or expected, suggest Ginger Tea or Chamomile based on October logs. If Day 1-3 cramps, suggest Magnesium Glycinate based on September/October logs. Ensure it refers to their past efficacy.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: {
              type: Type.STRING,
              description: "Warm, empathetic, 2-3 sentence cycle check-in greeting based on current day and history."
            },
            suggestion: {
              type: Type.OBJECT,
              properties: {
                remedy: { type: Type.STRING, description: "Suggested remedy name (e.g. 'Magnesium Glycinate 300mg' or 'Ginger Tea')" },
                dosage: { type: Type.STRING, description: "Suggested timing or dosage" },
                reason: { type: Type.STRING, description: "Personalized explanation referencing his/her September or October logs." }
              },
              required: ["remedy", "reason"]
            },
            adaptedTone: {
              type: Type.STRING,
              description: "Brief note of the applied tone strategy (quiet, warm, diagnostic, etc.)"
            }
          },
          required: ["message", "suggestion"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      data: parsed,
      isRealAI: true
    });

  } catch (error: any) {
    // Graceful fallback for demo purposes or when api keys are missing
    console.warn("Gemini API call failed or is unconfigured. Triggering robust local simulation.", error.message);
    
    // Construct rich, realistic local insights based on cycle characteristics to emulate Gemini perfectly
    let sampleMessage = "";
    let sampleRemedy = "Magnesium Glycinate";
    let sampleDosage = "300mg once daily";
    let sampleReason = "Our remedy engine indicates you logged cramps dropping from 4/5 to 0/5 within 24 hours of taking magnesium in September.";

    if (currentPhase === "Luteal") {
      sampleMessage = `Welcome back. You're on Day ${currentDay} of your luteal phase. Historically, your logs show mild bloating and bedtime fatigue starting around now. Let's stay ahead of it today.`;
      sampleRemedy = "Ginger Tea";
      sampleDosage = "1 warm cup in the afternoon";
      sampleReason = "In your October cycle, drinking ginger tea on day 23 relieved your bloating and cramps within 1 hour.";
    } else if (currentPhase === "Menstrual") {
      sampleMessage = `You're on Day ${currentDay} of your cycle. We know Day 1-3 is historically heavy. Let's make today comfortable.`;
      sampleRemedy = "Magnesium Glycinate";
      sampleDosage = "300mg in the evening";
      sampleReason = "Your September logs show that starting Magnesium on Day 2 cut your cramp duration down from 5 days to just 3.";
    } else if (currentPhase === "Ovulatory") {
      sampleMessage = `Happy Day ${currentDay}! You're in your Ovulation window. Energy levels are likely peaking. It's a great match for a high-intensity session or focusing on creative work.`;
      sampleRemedy = "Hydration + Stretch";
      sampleDosage = "Extra water, 15m stretch";
      sampleReason = "In transition phases, tracking natural energy peaks helps us schedule your optimal training intervals.";
    } else {
      sampleMessage = `Day ${currentDay} (Follicular phase) is underway. Your body is recharging, estrogen levels are rising, and physical stamina is steadily returning.`;
      sampleRemedy = "Iron-Rich Foods";
      sampleDosage = "Incorporate spinach or lentils today";
      sampleReason = "Supplementing dietary iron in follicular days historically helped you stave off Day 6 energy drains.";
    }

    if (ignoredLastCheckIn) {
      sampleMessage = `Day ${currentDay} is here. Keeping things quiet today. Let me know if you need any remedy logs tracked.`;
    }

    return res.json({
      success: true,
      data: {
        message: sampleMessage,
        suggestion: {
          remedy: sampleRemedy,
          dosage: sampleDosage,
          reason: sampleReason
        },
        adaptedTone: ignoredLastCheckIn ? "quieter" : "standard"
      },
      isRealAI: false,
      warning: "Gemini server running on simulation mode (API key unconfigured/invalid)."
    });
  }
});

// Boot the server and serve frontend SPA
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Luna express server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
