// Spotify Integration Service for Mental Wellness Music

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: string[];
  album: string;
  albumArt: string;
  duration: number;
  previewUrl: string | null;
  uri: string;
  externalUrl: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  image: string;
  trackCount: number;
  uri: string;
  externalUrl: string;
  category: string;
}

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || "";
const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || "";

let accessToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Get Spotify access token using Client Credentials flow
 */
const getAccessToken = async (): Promise<string> => {
  // Return cached token if still valid
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error("Spotify credentials not configured");
  }

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      throw new Error("Failed to get Spotify access token");
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + data.expires_in * 1000 - 60000; // Refresh 1 min before expiry

    return accessToken;
  } catch (error) {
    console.error("Spotify authentication error:", error);
    throw error;
  }
};

/**
 * Search for mental wellness playlists
 */
export const searchWellnessPlaylists = async (query: string): Promise<SpotifyPlaylist[]> => {
  // If no credentials, return curated playlists
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    console.warn("Spotify credentials not configured, using curated playlists");
    return getCuratedPlaylists(query);
  }

  try {
    const token = await getAccessToken();
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=20`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Spotify API error:", response.status, errorData);
      throw new Error(`Spotify API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.playlists || !data.playlists.items || data.playlists.items.length === 0) {
      console.warn("No playlists found for query:", query);
      return [];
    }

    return data.playlists.items
      .filter((item: any) => item && item.id && item.images && item.images.length > 0)
      .map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || "No description available",
        image: item.images[0]?.url || "https://via.placeholder.com/300x300?text=No+Image",
        trackCount: item.tracks.total,
        uri: item.uri,
        externalUrl: item.external_urls.spotify,
        category: query,
      }));
  } catch (error) {
    console.error("Error searching playlists:", error);
    // Return empty array instead of curated playlists for search
    return [];
  }
};

/**
 * Get curated mental wellness playlists (fallback)
 */
const getCuratedPlaylists = (category: string): SpotifyPlaylist[] => {
  const playlists: { [key: string]: SpotifyPlaylist[] } = {
    anxiety: [
      {
        id: "37i9dQZF1DWZqd5JICZI0u",
        name: "Peaceful Piano",
        description: "Relax and indulge with beautiful piano pieces",
        image: "https://i.scdn.co/image/ab67706f00000002ca5a7517156021292e5663a6",
        trackCount: 175,
        uri: "spotify:playlist:37i9dQZF1DWZqd5JICZI0u",
        externalUrl: "https://open.spotify.com/playlist/37i9dQZF1DWZqd5JICZI0u",
        category: "anxiety",
      },
      {
        id: "37i9dQZF1DX4sWSpwq3LiO",
        name: "Peaceful Guitar",
        description: "Relax and unwind to these calm guitar melodies",
        image: "https://i.scdn.co/image/ab67706f00000002d073e656e546de0e42b6d0b7",
        trackCount: 100,
        uri: "spotify:playlist:37i9dQZF1DX4sWSpwq3LiO",
        externalUrl: "https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO",
        category: "anxiety",
      },
    ],
    meditation: [
      {
        id: "37i9dQZF1DWZqd5JICZI0u",
        name: "Deep Focus",
        description: "Keep calm and focus with ambient and post-rock music",
        image: "https://i.scdn.co/image/ab67706f000000029bb6af539d072de34548d15c",
        trackCount: 200,
        uri: "spotify:playlist:37i9dQZF1DWZeKCadgRdKQ",
        externalUrl: "https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ",
        category: "meditation",
      },
    ],
    sleep: [
      {
        id: "37i9dQZF1DWZd79rJ6a7lp",
        name: "Sleep",
        description: "Gentle ambient piano to help you fall asleep",
        image: "https://i.scdn.co/image/ab67706f00000002b70e4f2f7d0216e3f0ecb5c7",
        trackCount: 150,
        uri: "spotify:playlist:37i9dQZF1DWZd79rJ6a7lp",
        externalUrl: "https://open.spotify.com/playlist/37i9dQZF1DWZd79rJ6a7lp",
        category: "sleep",
      },
    ],
    stress: [
      {
        id: "37i9dQZF1DX1s9knjP51Oa",
        name: "Chill Lofi Study Beats",
        description: "The perfect study beats, twenty four seven",
        image: "https://i.scdn.co/image/ab67706f00000002d073e656e546de0e42b6d0b7",
        trackCount: 300,
        uri: "spotify:playlist:37i9dQZF1DX1s9knjP51Oa",
        externalUrl: "https://open.spotify.com/playlist/37i9dQZF1DX1s9knjP51Oa",
        category: "stress",
      },
    ],
  };

  return playlists[category] || [];
};

/**
 * Get all mental wellness categories
 */
export const getWellnessCategories = () => {
  return [
    {
      id: "anxiety",
      name: "Anxiety Relief",
      description: "Calming music to ease anxious thoughts",
      icon: "🧘",
      query: "anxiety relief calm meditation",
    },
    {
      id: "meditation",
      name: "Meditation & Mindfulness",
      description: "Ambient sounds for deep meditation",
      icon: "🕉️",
      query: "meditation mindfulness ambient",
    },
    {
      id: "sleep",
      name: "Sleep & Relaxation",
      description: "Gentle melodies for restful sleep",
      icon: "😴",
      query: "sleep relaxation peaceful",
    },
    {
      id: "stress",
      name: "Stress Relief",
      description: "Soothing tracks to reduce stress",
      icon: "🌊",
      query: "stress relief lofi chill",
    },
    {
      id: "focus",
      name: "Focus & Concentration",
      description: "Background music for productivity",
      icon: "🎯",
      query: "focus concentration study",
    },
    {
      id: "mood",
      name: "Mood Boost",
      description: "Uplifting music to improve your mood",
      icon: "☀️",
      query: "happy uplifting positive mood",
    },
    {
      id: "nature",
      name: "Nature Sounds",
      description: "Natural soundscapes for tranquility",
      icon: "🌲",
      query: "nature sounds rain forest",
    },
    {
      id: "yoga",
      name: "Yoga & Stretching",
      description: "Flowing music for yoga practice",
      icon: "🧘‍♀️",
      query: "yoga stretching flow",
    },
  ];
};

/**
 * Get playlist tracks
 */
export const getPlaylistTracks = async (playlistId: string): Promise<SpotifyTrack[]> => {
  try {
    const token = await getAccessToken();
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get playlist tracks");
    }

    const data = await response.json();
    return data.items
      .filter((item: any) => item.track)
      .map((item: any) => ({
        id: item.track.id,
        name: item.track.name,
        artists: item.track.artists.map((a: any) => a.name),
        album: item.track.album.name,
        albumArt: item.track.album.images[0]?.url || "",
        duration: item.track.duration_ms,
        previewUrl: item.track.preview_url,
        uri: item.track.uri,
        externalUrl: item.track.external_urls.spotify,
      }));
  } catch (error) {
    console.error("Error getting playlist tracks:", error);
    return [];
  }
};

/**
 * Format duration from milliseconds to MM:SS
 */
export const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

/**
 * Get personalized recommendations based on user's mood
 */
export const getRecommendationsByMood = (mood: number): string => {
  const moodCategories: { [key: number]: string } = {
    1: "sleep", // Terrible - calming sleep music
    2: "anxiety", // Bad - anxiety relief
    3: "stress", // Okay - stress relief
    4: "mood", // Good - mood boost
    5: "focus", // Excellent - focus music
  };

  return moodCategories[mood] || "meditation";
};
