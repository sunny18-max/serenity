import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
// Users should add their API key in .env file: VITE_GEMINI_API_KEY
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

let genAI: GoogleGenerativeAI | null = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
}

/**
 * System prompt for the AI therapist with CBT principles
 */
const THERAPIST_SYSTEM_PROMPT = `You are a compassionate AI mental health companion trained in Cognitive Behavioral Therapy (CBT) principles. Your role is to:

1. Listen actively and validate the user's feelings
2. Ask thoughtful, open-ended questions to help users explore their thoughts
3. Identify cognitive distortions (e.g., catastrophizing, black-and-white thinking, overgeneralization)
4. Gently challenge negative thought patterns using Socratic questioning
5. Suggest evidence-based CBT techniques when appropriate
6. Encourage behavioral activation and positive coping strategies
7. Provide psychoeducation about mental health concepts
8. Maintain a warm, empathetic, and non-judgmental tone
9. Recognize when professional help may be needed and encourage seeking it
10. When users share files (documents, images, notes), acknowledge them warmly and explore how they relate to their mental health journey

Important guidelines:
- Never diagnose mental health conditions
- Always emphasize that you're a supportive tool, not a replacement for professional therapy
- Be concise but thorough (2-4 sentences typically)
- Use empathetic language and validate emotions
- Focus on the present moment and actionable steps
- If user mentions self-harm or suicide, provide crisis resources immediately
- When files are shared, show interest and ask how they relate to their feelings, thoughts, or experiences
- For images, ask about the emotions or memories they evoke
- For documents/notes, offer to discuss the content and its significance to their wellbeing

Remember: You're here to support, guide, and empower users on their mental wellness journey.`;

/**
 * Generate AI response using Gemini
 */
export const generateAIResponse = async (
  userMessage: string,
  conversationHistory: { role: string; content: string }[] = []
): Promise<string> => {
  // Fallback if no API key
  if (!genAI || !API_KEY) {
    return generateFallbackResponse(userMessage);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Build conversation context
    const context = conversationHistory
      .slice(-6) // Last 6 messages for context
      .map((msg) => `${msg.role === "user" ? "User" : "Therapist"}: ${msg.content}`)
      .join("\n\n");

    const prompt = `${THERAPIST_SYSTEM_PROMPT}

Previous conversation:
${context}

User: ${userMessage}

Therapist:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text.trim();
  } catch (error) {
    console.error("Error generating AI response:", error);
    return generateFallbackResponse(userMessage);
  }
};

/**
 * Fallback response generator when API is not available
 */
const generateFallbackResponse = (userMessage: string): string => {
  const lowerText = userMessage.toLowerCase();

  // Crisis detection
  if (
    lowerText.includes("suicide") ||
    lowerText.includes("kill myself") ||
    lowerText.includes("end my life") ||
    lowerText.includes("self-harm")
  ) {
    return "I'm really concerned about what you're sharing. Please reach out to a crisis helpline immediately:\n\n• National Suicide Prevention Lifeline: 988\n• Crisis Text Line: Text HOME to 741741\n• International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/\n\nYour life matters, and there are people who want to help you right now.";
  }

  // Anxiety-related
  if (
    lowerText.includes("anxiety") ||
    lowerText.includes("anxious") ||
    lowerText.includes("worried") ||
    lowerText.includes("panic")
  ) {
    return "I hear that you're experiencing anxiety. That can feel really overwhelming. One helpful CBT technique is to challenge anxious thoughts by asking yourself: 'What evidence do I have for this worry? What's the worst that could happen, and could I handle it?' Would you like to explore what specific thoughts are contributing to your anxiety?";
  }

  // Depression-related
  if (
    lowerText.includes("depress") ||
    lowerText.includes("sad") ||
    lowerText.includes("hopeless") ||
    lowerText.includes("down")
  ) {
    return "Thank you for sharing that with me. Depression can make everything feel heavier. In CBT, we recognize that our thoughts, feelings, and behaviors are all connected. Sometimes when we're feeling down, our thoughts become more negative than the situation warrants. What's one specific thought that's been troubling you? Let's examine it together.";
  }

  // Stress-related
  if (
    lowerText.includes("stress") ||
    lowerText.includes("overwhelm") ||
    lowerText.includes("too much")
  ) {
    return "It sounds like you're dealing with a lot right now. When we feel overwhelmed, it can help to break things down into smaller, manageable pieces. What's one specific thing that's causing you stress? Let's work on that together and develop a plan to address it.";
  }

  // Sleep issues
  if (lowerText.includes("sleep") || lowerText.includes("insomnia")) {
    return "Sleep difficulties can really impact our wellbeing. CBT for insomnia focuses on building healthy sleep habits and addressing thoughts that interfere with rest. What's your current sleep routine like? Are there specific worries keeping you awake?";
  }

  // Relationship issues
  if (
    lowerText.includes("relationship") ||
    lowerText.includes("friend") ||
    lowerText.includes("family")
  ) {
    return "Relationships can be complex and challenging. In CBT, we look at how our interpretations of others' behaviors affect our emotions. Can you tell me more about what's happening? What thoughts go through your mind in these situations?";
  }

  // General supportive responses
  const generalResponses = [
    "I appreciate you opening up to me. Let's explore what you're experiencing together. Can you tell me more about what's been on your mind?",
    "Thank you for sharing that. I'm here to support you. What would be most helpful for us to focus on right now?",
    "I hear you. It takes courage to talk about these things. What specific aspect of this would you like to work through?",
    "That sounds challenging. In CBT, we often find that examining our thoughts can help us understand our feelings better. What thoughts have been going through your mind about this?",
  ];

  return generalResponses[Math.floor(Math.random() * generalResponses.length)];
};

/**
 * Analyze emotion from text
 */
export const analyzeEmotion = (text: string): string => {
  const lowerText = text.toLowerCase();

  // Negative emotions
  if (lowerText.match(/\b(sad|depressed|down|unhappy|miserable|hopeless|crying)\b/))
    return "sad";
  if (
    lowerText.match(
      /\b(anxious|worried|nervous|stressed|panic|fear|scared|terrified)\b/
    )
  )
    return "anxious";
  if (lowerText.match(/\b(angry|mad|frustrated|irritated|furious|annoyed)\b/))
    return "angry";
  if (lowerText.match(/\b(tired|exhausted|drained|fatigued|weary)\b/))
    return "tired";
  if (lowerText.match(/\b(lonely|isolated|alone|abandoned)\b/)) return "lonely";
  if (lowerText.match(/\b(guilty|ashamed|regret|embarrassed)\b/)) return "guilty";

  // Positive emotions
  if (lowerText.match(/\b(happy|joyful|excited|great|wonderful|amazing|fantastic)\b/))
    return "happy";
  if (lowerText.match(/\b(calm|peaceful|relaxed|serene|tranquil)\b/)) return "calm";
  if (lowerText.match(/\b(grateful|thankful|blessed|appreciative)\b/))
    return "grateful";
  if (lowerText.match(/\b(hopeful|optimistic|positive|encouraged)\b/))
    return "hopeful";

  return "neutral";
};

/**
 * Check if message requires immediate crisis intervention
 */
export const isCrisisMessage = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return (
    lowerText.includes("suicide") ||
    lowerText.includes("kill myself") ||
    lowerText.includes("end my life") ||
    lowerText.includes("want to die") ||
    lowerText.includes("self-harm") ||
    lowerText.includes("hurt myself")
  );
};
