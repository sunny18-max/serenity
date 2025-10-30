import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/firebase";

export interface NotificationData {
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "reminder" | "achievement";
  read?: boolean;
}

/**
 * Create a notification for the current user
 */
export const createNotification = async (data: NotificationData) => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const notificationsRef = collection(db, "users", user.uid, "notifications");
    await addDoc(notificationsRef, {
      ...data,
      read: data.read || false,
      timestamp: serverTimestamp(),
    });

    // Show browser notification if permission granted
    if (Notification.permission === "granted") {
      new Notification(data.title, {
        body: data.message,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      });
    }
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

/**
 * Create notification for mood logging
 */
export const notifyMoodLogged = async (mood: number) => {
  const moodLabels = ["Terrible", "Bad", "Okay", "Good", "Excellent"];
  await createNotification({
    title: "Mood Logged",
    message: `You logged your mood as ${moodLabels[mood - 1]}. Keep tracking your progress!`,
    type: "success",
  });
};

/**
 * Create notification for assessment completion
 */
export const notifyAssessmentCompleted = async (type: string, score: number) => {
  await createNotification({
    title: "Assessment Completed",
    message: `You completed the ${type.toUpperCase()} assessment with a score of ${score}. Check your progress dashboard for insights.`,
    type: "success",
  });
};

/**
 * Create notification for mindfulness session completion
 */
export const notifyMindfulnessCompleted = async (exerciseName: string, duration: number, xpEarned: number) => {
  await createNotification({
    title: "Mindfulness Session Complete",
    message: `Great job! You completed "${exerciseName}" (${duration} min) and earned ${xpEarned} XP.`,
    type: "success",
  });
};

/**
 * Create notification for achievement unlocked
 */
export const notifyAchievementUnlocked = async (achievementName: string, xpReward: number) => {
  await createNotification({
    title: "Achievement Unlocked! 🎉",
    message: `Congratulations! You've unlocked "${achievementName}" and earned ${xpReward} XP!`,
    type: "achievement",
  });
};

/**
 * Create notification for level up
 */
export const notifyLevelUp = async (newLevel: number) => {
  await createNotification({
    title: "Level Up! 🚀",
    message: `Amazing progress! You've reached Level ${newLevel}. Keep up the great work!`,
    type: "achievement",
  });
};

/**
 * Create notification for streak milestone
 */
export const notifyStreakMilestone = async (streak: number) => {
  await createNotification({
    title: "Streak Milestone! 🔥",
    message: `You're on a ${streak} day streak! Consistency is key to wellness.`,
    type: "achievement",
  });
};

/**
 * Create daily reminder notification
 */
export const notifyDailyReminder = async () => {
  await createNotification({
    title: "Daily Check-in Reminder",
    message: "How are you feeling today? Take a moment for your daily wellness check.",
    type: "reminder",
  });
};

/**
 * Create notification for AI chat response
 */
export const notifyAIChatResponse = async () => {
  await createNotification({
    title: "AI Companion Responded",
    message: "Your AI therapy companion has responded to your message.",
    type: "info",
  });
};

/**
 * Create notification for community interaction
 */
export const notifyCommunityInteraction = async (groupName: string) => {
  await createNotification({
    title: "New Community Message",
    message: `Someone responded in "${groupName}". Check it out!`,
    type: "info",
  });
};

/**
 * Create notification for challenge completion
 */
export const notifyChallengeCompleted = async (challengeName: string, xpReward: number) => {
  await createNotification({
    title: "Challenge Completed! ✨",
    message: `You completed "${challengeName}" and earned ${xpReward} XP!`,
    type: "achievement",
  });
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};
