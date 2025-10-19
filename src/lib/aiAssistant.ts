// AI Assistant Service using Google Gemini
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

// Initialize Gemini AI
const initializeAI = () => {
  if (!GEMINI_API_KEY) {
    console.warn("Gemini API key not configured");
    return false;
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  return true;
};

// System prompt for the assistant
const SYSTEM_PROMPT = `You are Serenity Assistant, a compassionate and knowledgeable mental wellness companion. You help users navigate the Serenity mental health platform.

Your capabilities:
- Guide users through mental health assessments (PHQ-9, GAD-7, PCL-5, Stress, Wellness, Sleep)
- Explain how to track mood and progress
- Provide information about mental wellness features
- Offer encouragement and support
- Answer questions about the platform

Guidelines:
- Be warm, empathetic, and supportive
- Keep responses concise (2-3 sentences max)
- Focus on platform features and mental wellness
- Encourage professional help for serious concerns
- Never provide medical diagnosis or treatment advice
- Be positive and encouraging

Available features in Serenity:
- Assessment Center: Take validated mental health screenings
- Mood Tracker: Daily mood check-ins with notes
- Progress Reports: View charts and trends over time
- AI Therapist: Chat with AI for emotional support
- Resources: Access articles, videos, and tools
- Community: Connect with others and read wellness news
- Spotify Wellness: Listen to calming music playlists
- Mindfulness: Guided meditation and breathing exercises
- Wellness Games: Focus and relaxation games
- Emergency Help: Crisis resources and hotlines

Respond naturally and helpfully to user questions.`;

/**
 * Get AI response using Gemini
 */
export const getAIResponse = async (userMessage: string, conversationHistory: any[] = []): Promise<string> => {
  // Check if AI is available
  if (!initializeAI()) {
    return getFallbackResponse(userMessage);
  }

  try {
    // Build conversation context
    const context = conversationHistory
      .map((msg) => `${msg.type === "user" ? "User" : "Assistant"}: ${msg.text}`)
      .join("\n");

    const fullPrompt = `${SYSTEM_PROMPT}\n\nConversation History:\n${context}\n\nUser: ${userMessage}\n\nAssistant:`;

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return text.trim();
  } catch (error) {
    console.error("AI response error:", error);
    return getFallbackResponse(userMessage);
  }
};

/**
 * Fallback responses when AI is not available
 */
const getFallbackResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase();

  // Assessment questions
  if (lowerMessage.includes("assessment") || lowerMessage.includes("test") || lowerMessage.includes("screening")) {
    return "You can take mental health assessments by going to the Assessment Center from your dashboard. We offer PHQ-9 for depression, GAD-7 for anxiety, and more. Would you like to start one?";
  }

  // Mood tracking
  if (lowerMessage.includes("mood") || lowerMessage.includes("feeling") || lowerMessage.includes("track")) {
    return "Track your daily mood on the Dashboard! Just select how you're feeling and add a note. You can view your mood history in the Progress section to see patterns over time.";
  }

  // Progress
  if (lowerMessage.includes("progress") || lowerMessage.includes("chart") || lowerMessage.includes("report")) {
    return "View your progress in the Progress page! You'll see charts of your assessment scores, mood trends, and insights about your mental wellness journey. You can also export reports as PDF.";
  }

  // AI Therapist
  if (lowerMessage.includes("therapist") || lowerMessage.includes("talk") || lowerMessage.includes("chat")) {
    return "Our AI Therapist is available 24/7 for emotional support! Click on 'AI Therapist' in the sidebar to start a confidential conversation. Remember, for serious concerns, please contact a professional.";
  }

  // Resources
  if (lowerMessage.includes("resource") || lowerMessage.includes("article") || lowerMessage.includes("video")) {
    return "Check out the Resources section for helpful articles, videos, and tools! We have guides on anxiety, depression, stress management, sleep, and more from trusted sources.";
  }

  // Community
  if (lowerMessage.includes("community") || lowerMessage.includes("support") || lowerMessage.includes("group")) {
    return "Join our Community to read mental wellness news, watch helpful videos, and connect with others! We have discussions, live streams, and support resources.";
  }

  // Music/Spotify
  if (lowerMessage.includes("music") || lowerMessage.includes("spotify") || lowerMessage.includes("relax")) {
    return "Try our Spotify Wellness feature! Listen to curated playlists for anxiety relief, meditation, sleep, and stress relief. Music can be a powerful tool for mental wellness!";
  }

  // Mindfulness
  if (lowerMessage.includes("meditat") || lowerMessage.includes("mindful") || lowerMessage.includes("breath")) {
    return "Explore our Mindfulness section for guided meditation and breathing exercises! We have box breathing, body scans, and more to help you relax and center yourself.";
  }

  // Emergency
  if (lowerMessage.includes("crisis") || lowerMessage.includes("emergency") || lowerMessage.includes("help") || lowerMessage.includes("suicide")) {
    return "If you're in crisis, please reach out for help immediately. Go to Emergency Help in the sidebar for crisis hotlines (988, Crisis Text Line). You're not alone, and help is available 24/7.";
  }

  // Greeting
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
    return "Hello! I'm Serenity Assistant, here to help you navigate your mental wellness journey. I can guide you through assessments, mood tracking, progress reports, and more. What would you like to know?";
  }

  // Default
  return "I'm here to help you with Serenity! I can assist with assessments, mood tracking, progress reports, AI therapy, resources, community features, music, mindfulness, and more. What would you like to explore?";
};

/**
 * Get quick action suggestions based on context
 */
export const getQuickSuggestions = (conversationHistory: any[]): string[] => {
  const suggestions = [
    "How do I take an assessment?",
    "Show me my progress",
    "How do I track my mood?",
    "What resources are available?",
    "Tell me about the AI Therapist",
    "How do I use Spotify Wellness?",
    "Show me mindfulness exercises",
    "Where can I find help in a crisis?",
  ];

  // Return random 4 suggestions
  return suggestions.sort(() => Math.random() - 0.5).slice(0, 4);
};
