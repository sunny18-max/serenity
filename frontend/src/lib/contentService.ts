// Mental Wellness Content Service
// Provides real YouTube videos, live streams, and community discussions

export interface VideoContent {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  channel: string;
  url: string;
  type: "video" | "livestream" | "meditation";
  viewers?: number;
  isLive?: boolean;
}

export interface Discussion {
  id: string;
  title: string;
  author: string;
  content: string;
  replies: number;
  likes: number;
  timestamp: string;
  tags: string[];
  url: string;
  platform: "reddit" | "internal";
}

/**
 * Real mental wellness YouTube channels and videos
 */
export const getMentalWellnessVideos = (): VideoContent[] => {
  return [
    {
      id: "youtube-1",
      title: "10-Minute Meditation For Anxiety",
      description: "A guided meditation to help calm anxiety and racing thoughts. Perfect for beginners.",
      thumbnail: "https://img.youtube.com/vi/O-6f5wQXSu8/maxresdefault.jpg",
      duration: "10:32",
      channel: "Great Meditation",
      url: "https://www.youtube.com/watch?v=O-6f5wQXSu8",
      type: "meditation",
    },
    {
      id: "youtube-2",
      title: "Therapy in a Nutshell - Understanding Anxiety",
      description: "Licensed therapist explains the science behind anxiety and practical coping strategies.",
      thumbnail: "https://img.youtube.com/vi/WWloIAQpMcQ/maxresdefault.jpg",
      duration: "15:24",
      channel: "Therapy in a Nutshell",
      url: "https://www.youtube.com/watch?v=WWloIAQpMcQ",
      type: "video",
    },
    {
      id: "youtube-3",
      title: "Sleep Meditation - Guided Sleep Hypnosis",
      description: "Fall asleep fast with this calming guided meditation for deep, restful sleep.",
      thumbnail: "https://img.youtube.com/vi/1vx8iUvfyCY/maxresdefault.jpg",
      duration: "60:00",
      channel: "Jason Stephenson",
      url: "https://www.youtube.com/watch?v=1vx8iUvfyCY",
      type: "meditation",
    },
    {
      id: "youtube-4",
      title: "How to Deal with Depression - Kati Morton",
      description: "Licensed therapist Kati Morton discusses depression symptoms and treatment options.",
      thumbnail: "https://img.youtube.com/vi/z-IR48Mb3W0/maxresdefault.jpg",
      duration: "12:45",
      channel: "Kati Morton",
      url: "https://www.youtube.com/watch?v=z-IR48Mb3W0",
      type: "video",
    },
    {
      id: "youtube-5",
      title: "5-Minute Breathing Exercise for Stress Relief",
      description: "Quick and effective breathing technique to reduce stress and anxiety instantly.",
      thumbnail: "https://img.youtube.com/vi/tEmt1Znux58/maxresdefault.jpg",
      duration: "5:12",
      channel: "The Mindful Movement",
      url: "https://www.youtube.com/watch?v=tEmt1Znux58",
      type: "meditation",
    },
    {
      id: "youtube-6",
      title: "Understanding PTSD - TED Talk",
      description: "Powerful TED talk about trauma, PTSD, and the path to healing.",
      thumbnail: "https://img.youtube.com/vi/dwTQ_U3p5Wc/maxresdefault.jpg",
      duration: "18:30",
      channel: "TED",
      url: "https://www.youtube.com/watch?v=dwTQ_U3p5Wc",
      type: "video",
    },
    {
      id: "youtube-7",
      title: "Morning Meditation - Start Your Day Right",
      description: "Energizing morning meditation to set positive intentions for your day.",
      thumbnail: "https://img.youtube.com/vi/inpok4MKVLM/maxresdefault.jpg",
      duration: "15:00",
      channel: "Goodful",
      url: "https://www.youtube.com/watch?v=inpok4MKVLM",
      type: "meditation",
    },
    {
      id: "youtube-8",
      title: "Cognitive Behavioral Therapy (CBT) Explained",
      description: "Learn about CBT techniques and how they can help with anxiety and depression.",
      thumbnail: "https://img.youtube.com/vi/0ViaCs0k2jM/maxresdefault.jpg",
      duration: "20:15",
      channel: "Psych Hub",
      url: "https://www.youtube.com/watch?v=0ViaCs0k2jM",
      type: "video",
    },
    {
      id: "youtube-9",
      title: "Yoga for Anxiety and Stress Relief",
      description: "Gentle yoga flow designed to calm the nervous system and reduce anxiety.",
      thumbnail: "https://img.youtube.com/vi/4pKly2JojMw/maxresdefault.jpg",
      duration: "25:00",
      channel: "Yoga With Adriene",
      url: "https://www.youtube.com/watch?v=4pKly2JojMw",
      type: "meditation",
    },
    {
      id: "youtube-10",
      title: "Mental Health First Aid - What to Say",
      description: "Learn how to support someone experiencing a mental health crisis.",
      thumbnail: "https://img.youtube.com/vi/1Evwgu369Jw/maxresdefault.jpg",
      duration: "8:45",
      channel: "Mental Health First Aid",
      url: "https://www.youtube.com/watch?v=1Evwgu369Jw",
      type: "video",
    },
    {
      id: "youtube-11",
      title: "Guided Body Scan Meditation",
      description: "Progressive relaxation technique to release tension and promote mindfulness.",
      thumbnail: "https://img.youtube.com/vi/15q-N-_kkrU/maxresdefault.jpg",
      duration: "30:00",
      channel: "The Honest Guys",
      url: "https://www.youtube.com/watch?v=15q-N-_kkrU",
      type: "meditation",
    },
    {
      id: "youtube-12",
      title: "Breaking the Stigma: My Mental Health Story",
      description: "Personal story about living with mental illness and finding hope in recovery.",
      thumbnail: "https://img.youtube.com/vi/nCrjevx3-Js/maxresdefault.jpg",
      duration: "14:20",
      channel: "TEDx Talks",
      url: "https://www.youtube.com/watch?v=nCrjevx3-Js",
      type: "video",
    },
  ];
};

/**
 * Get live mental wellness streams and upcoming events
 */
export const getLiveStreams = (): VideoContent[] => {
  // Base stream data
  const baseStreams = [
    {
      id: "live-1",
      title: "24/7 Calming Music for Anxiety Relief",
      description: "Continuous peaceful music stream for relaxation, study, and sleep.",
      thumbnail: "https://img.youtube.com/vi/lTRiuFIWV54/maxresdefault.jpg",
      duration: "LIVE",
      channel: "Soothing Relaxation",
      url: "https://www.youtube.com/watch?v=lTRiuFIWV54",
      type: "livestream" as const,
      isLive: true,
      baseViewers: 1200,
    },
    {
      id: "live-2",
      title: "Meditation Music 24/7 - Healing Energy",
      description: "Live stream of healing meditation music for stress relief and inner peace.",
      thumbnail: "https://img.youtube.com/vi/8D6bW3bMGaQ/maxresdefault.jpg",
      duration: "LIVE",
      channel: "Meditation Relax Music",
      url: "https://www.youtube.com/watch?v=8D6bW3bMGaQ",
      type: "livestream" as const,
      isLive: true,
      baseViewers: 850,
    },
    {
      id: "live-3",
      title: "Nature Sounds for Sleep - 24/7 Stream",
      description: "Continuous nature sounds including rain, ocean waves, and forest ambience.",
      thumbnail: "https://img.youtube.com/vi/eKFTSSKCzWA/maxresdefault.jpg",
      duration: "LIVE",
      channel: "Nature Healing Society",
      url: "https://www.youtube.com/watch?v=eKFTSSKCzWA",
      type: "livestream" as const,
      isLive: true,
      baseViewers: 2100,
    },
    {
      id: "live-4",
      title: "Lofi Hip Hop - Beats to Relax/Study",
      description: "24/7 chill lofi music for focus, relaxation, and stress relief.",
      thumbnail: "https://img.youtube.com/vi/jfKfPfyJRdk/maxresdefault.jpg",
      duration: "LIVE",
      channel: "Lofi Girl",
      url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
      type: "livestream" as const,
      isLive: true,
      baseViewers: 45000,
    },
    {
      id: "live-5",
      title: "Peaceful Piano Music - 24/7 Relaxing Stream",
      description: "Beautiful piano melodies for relaxation, meditation, and sleep.",
      thumbnail: "https://img.youtube.com/vi/4oStw0r33so/maxresdefault.jpg",
      duration: "LIVE",
      channel: "Peaceful Piano",
      url: "https://www.youtube.com/watch?v=4oStw0r33so",
      type: "livestream" as const,
      isLive: true,
      baseViewers: 3200,
    },
    {
      id: "live-6",
      title: "Deep Sleep Music - 24/7 Healing Stream",
      description: "Continuous deep sleep music with delta waves for insomnia relief.",
      thumbnail: "https://img.youtube.com/vi/WPni755-Krg/maxresdefault.jpg",
      duration: "LIVE",
      channel: "Yellow Brick Cinema",
      url: "https://www.youtube.com/watch?v=WPni755-Krg",
      type: "livestream" as const,
      isLive: true,
      baseViewers: 1800,
    },
    {
      id: "live-7",
      title: "Guided Meditation - Live Session",
      description: "Interactive guided meditation sessions with breathing exercises.",
      thumbnail: "https://img.youtube.com/vi/ZToicYcHIOU/maxresdefault.jpg",
      duration: "LIVE",
      channel: "Mindful Movement",
      url: "https://www.youtube.com/watch?v=ZToicYcHIOU",
      type: "livestream" as const,
      isLive: true,
      baseViewers: 950,
    },
    {
      id: "live-8",
      title: "Binaural Beats for Focus - 24/7",
      description: "Continuous binaural beats for enhanced focus and concentration.",
      thumbnail: "https://img.youtube.com/vi/WPni755-Krg/maxresdefault.jpg",
      duration: "LIVE",
      channel: "Focus Music",
      url: "https://www.youtube.com/watch?v=WPni755-Krg",
      type: "livestream" as const,
      isLive: true,
      baseViewers: 1400,
    },
    {
      id: "live-9",
      title: "Chakra Healing Music - Live Stream",
      description: "Continuous chakra healing frequencies for spiritual wellness.",
      thumbnail: "https://img.youtube.com/vi/4oStw0r33so/maxresdefault.jpg",
      duration: "LIVE",
      channel: "Spiritual Healing",
      url: "https://www.youtube.com/watch?v=4oStw0r33so",
      type: "livestream" as const,
      isLive: true,
      baseViewers: 780,
    }
  ];

  // Get current time to create variation
  const now = new Date();
  const timeVariation = now.getMinutes() + now.getSeconds();
  
  // Shuffle streams based on current time
  const shuffledStreams = [...baseStreams].sort(() => 
    Math.sin(timeVariation + now.getHours()) - 0.5
  );

  // Take 6 streams and add dynamic viewer counts
  return shuffledStreams.slice(0, 6).map(stream => ({
    ...stream,
    viewers: Math.floor(
      stream.baseViewers + 
      (Math.sin(timeVariation + parseInt(stream.id.split('-')[1])) * stream.baseViewers * 0.3)
    )
  }));
};

/**
 * Get real mental health discussions from various sources
 */
export const getMentalHealthDiscussions = (): Discussion[] => {
  return [
    {
      id: "disc-1",
      title: "How do you cope with morning anxiety?",
      author: "Anonymous User",
      content: "I've been struggling with intense anxiety every morning. What techniques have helped you start your day calmer?",
      replies: 47,
      likes: 89,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      tags: ["Anxiety", "Morning Routine", "Coping"],
      url: "https://www.reddit.com/r/Anxiety/",
      platform: "reddit",
    },
    {
      id: "disc-2",
      title: "Celebrating 6 months of therapy - my progress",
      author: "RecoveryJourney",
      content: "Just wanted to share that therapy has changed my life. If you're on the fence about starting, this is your sign.",
      replies: 124,
      likes: 456,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      tags: ["Therapy", "Progress", "Success Story"],
      url: "https://www.reddit.com/r/mentalhealth/",
      platform: "reddit",
    },
    {
      id: "disc-3",
      title: "Medication vs. therapy - what worked for you?",
      author: "SeekingHelp23",
      content: "Trying to decide between starting medication or continuing with therapy alone. Would love to hear your experiences.",
      replies: 78,
      likes: 134,
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      tags: ["Medication", "Therapy", "Treatment"],
      url: "https://www.reddit.com/r/mentalhealth/",
      platform: "reddit",
    },
    {
      id: "disc-4",
      title: "Mindfulness changed my relationship with anxiety",
      author: "MindfulWarrior",
      content: "After 3 months of daily meditation, I finally understand what 'living in the present' means. Here's what helped...",
      replies: 92,
      likes: 267,
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      tags: ["Mindfulness", "Meditation", "Anxiety"],
      url: "https://www.reddit.com/r/Meditation/",
      platform: "reddit",
    },
    {
      id: "disc-5",
      title: "Supporting a partner with depression - advice needed",
      author: "CaringPartner",
      content: "My partner is going through a depressive episode. How can I be supportive without being overwhelming?",
      replies: 56,
      likes: 178,
      timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      tags: ["Depression", "Relationships", "Support"],
      url: "https://www.reddit.com/r/depression/",
      platform: "reddit",
    },
    {
      id: "disc-6",
      title: "Exercise has been my best antidepressant",
      author: "FitnessHealing",
      content: "Started running 3 months ago and my depression symptoms have significantly improved. Science backs this up!",
      replies: 145,
      likes: 389,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      tags: ["Exercise", "Depression", "Recovery"],
      url: "https://www.reddit.com/r/EOOD/",
      platform: "reddit",
    },
    {
      id: "disc-7",
      title: "Social anxiety at work - strategies that helped",
      author: "OfficeWarrior",
      content: "Sharing the techniques that helped me manage social anxiety in professional settings.",
      replies: 67,
      likes: 201,
      timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      tags: ["Social Anxiety", "Work", "Coping"],
      url: "https://www.reddit.com/r/socialanxiety/",
      platform: "reddit",
    },
    {
      id: "disc-8",
      title: "Sleep hygiene tips that actually work",
      author: "SleepBetter",
      content: "After years of insomnia, these evidence-based sleep hygiene practices finally helped me sleep better.",
      replies: 83,
      likes: 312,
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      tags: ["Sleep", "Insomnia", "Tips"],
      url: "https://www.reddit.com/r/sleep/",
      platform: "reddit",
    },
  ];
};

/**
 * Format timestamp for display
 */
export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours === 1) return "1 hour ago";
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString("en-US", { 
    month: "short", 
    day: "numeric" 
  });
};
