import { GoogleGenerativeAI } from "@google/generative-ai";

// PDF.js (browser-safe)
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.mjs";

// Load Gemini API Key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

let genAI: GoogleGenerativeAI | null = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
  console.log("Gemini AI initialized");
}

// ─────────────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────────────
const THERAPIST_SYSTEM_PROMPT = `
You are Serenity, an AI mental health companion using CBT.

NORMAL CHAT MODE:
- Respond empathetically but concisely.
- Avoid diagnosing.
- Ask constructive follow-up questions.
- Use CBT principles.

DOCUMENT ANALYSIS MODE:
You MUST switch to clinical analysis when a PDF or document text is provided.
Rules:
1. DO NOT greet the user.
2. DO NOT talk casually.
3. DO NOT use therapy tone.
4. Provide structured, objective analysis.
5. Identify key findings, symptoms, patterns, risks, strengths.
6. Return a formal mental-health style summary.
`;


export const extractPDFText = async (buffer: ArrayBuffer): Promise<string> => {
  try {
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      const pageText = content.items
        .map((item: any) => item.str)
        .join(" ");

      fullText += pageText + "\n\n";
    }

    return fullText.trim();
  } catch (error) {
    console.error("PDF extraction error:", error);
    return "";
  }
};


export const generateAIResponse = async (
  userMessage: string,
  conversationHistory: { role: string; content: string }[] = [],
  pdfText?: string
): Promise<string> => {
  const isDocumentMode = Boolean(pdfText && pdfText.length > 20);

  if (!genAI) {
    return isDocumentMode
      ? "The document was received, but AI analysis is unavailable (missing API key)."
      : "I'm here for you. Could you tell me more about what you're feeling?";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  
    const context = conversationHistory
      .slice(-6)
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n\n");

    let prompt = "";

  
    if (isDocumentMode) {
      prompt = `
${THERAPIST_SYSTEM_PROMPT}

You are now in **Document Analysis Mode**.

Analyze the following PDF content:

--------------------
${pdfText.substring(0, 25000)}
--------------------

Produce output in EXACTLY this structure:

### 1. Summary  
### 2. Key Clinical Findings  
### 3. Mental State Indicators  
### 4. Risk Factors  
### 5. Strengths & Protective Factors  
### 6. Overall Interpretation  

IMPORTANT RULES:
- No greetings.
- No casual conversation.
- Pure analysis only.
- Be formal and clinical.

Begin analysis now.
`;
    }

   
    else {
      prompt = `
${THERAPIST_SYSTEM_PROMPT}

Conversation History:
${context}

User: ${userMessage}

Assistant:
`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Gemini error:", error);
    return isDocumentMode
      ? "The document could not be analyzed due to an internal error."
      : "I'm here with you. Let's try again — tell me what you're experiencing.";
  }
};


export const analyzeEmotion = (text: string): string => {
  const t = text.toLowerCase();

  if (/sad|upset|down|depressed/.test(t)) return "sad";
  if (/anxious|panic|worried/.test(t)) return "anxious";
  if (/angry|frustrated|mad/.test(t)) return "angry";
  if (/happy|great|joy/.test(t)) return "happy";
  if (/tired|exhausted|drained/.test(t)) return "tired";

  return "neutral";
};

// ─────────────────────────────────────────────
// CRISIS DETECTION
// ─────────────────────────────────────────────
export const isCrisisMessage = (text: string): boolean => {
  const t = text.toLowerCase();
  return (
    t.includes("suicide") ||
    t.includes("kill myself") ||
    t.includes("end my life") ||
    t.includes("self-harm") ||
    t.includes("cut myself")
  );
};
