import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SpotifyTrack } from "@/lib/spotifyService";

interface SpotifyPlayerProps {
  playlist: {
    id: string;
    name: string;
    image: string;
  };
  tracks: SpotifyTrack[];
  onClose?: () => void;
}

const SpotifyPlayer = ({ playlist, tracks, onClose }: SpotifyPlayerProps) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    // Load new track
    if (currentTrack?.previewUrl && audioRef.current) {
      audioRef.current.src = currentTrack.previewUrl;
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrackIndex]);

  const handlePlayPause = () => {
    if (!audioRef.current || !currentTrack?.previewUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    } else {
      setCurrentTrackIndex(0); // Loop back to start
    }
  };

  const handlePrevious = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    } else {
      setCurrentTrackIndex(tracks.length - 1); // Loop to end
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEnded = () => {
    // Auto-play next track
    handleNext();
  };

  if (!currentTrack) {
    return null;
  }

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={handleTimeUpdate}
      />

      <Card className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-black via-gray-900 to-green-950 border-t-2 border-green-500/30 shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Track Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img
                src={currentTrack.albumArt}
                alt={currentTrack.album}
                className="w-14 h-14 rounded shadow-lg"
              />
              <div className="min-w-0 flex-1">
                <p className="text-white font-semibold truncate">
                  {currentTrack.name}
                </p>
                <p className="text-gray-400 text-sm truncate">
                  {currentTrack.artists.join(", ")}
                </p>
                <p className="text-gray-500 text-xs truncate">
                  {playlist.name}
                </p>
              </div>
            </div>

            {/* Player Controls */}
            <div className="flex flex-col items-center gap-2 flex-1 max-w-xl">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handlePrevious}
                  className="text-white hover:text-green-400 hover:bg-green-950/50"
                >
                  <SkipBack className="w-5 h-5" />
                </Button>
                <Button
                  size="sm"
                  onClick={handlePlayPause}
                  disabled={!currentTrack.previewUrl}
                  className="w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 text-black"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleNext}
                  className="text-white hover:text-green-400 hover:bg-green-950/50"
                >
                  <SkipForward className="w-5 h-5" />
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center gap-2 w-full">
                <span className="text-xs text-gray-400 w-10 text-right">
                  {formatTime(currentTime)}
                </span>
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="flex-1"
                  disabled={!currentTrack.previewUrl}
                />
                <span className="text-xs text-gray-400 w-10">
                  {formatTime(duration)}
                </span>
              </div>

              {!currentTrack.previewUrl && (
                <p className="text-xs text-yellow-500">
                  Preview not available - Click to play on Spotify
                </p>
              )}
            </div>

            {/* Volume & Actions */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMuted(!isMuted)}
                className="text-white hover:text-green-400 hover:bg-green-950/50"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={100}
                step={1}
                onValueChange={(value) => {
                  setVolume(value[0]);
                  setIsMuted(false);
                }}
                className="w-24"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.open(currentTrack.externalUrl, "_blank")}
                className="text-white hover:text-green-400 hover:bg-green-950/50"
                title="Open in Spotify"
              >
                <Maximize2 className="w-5 h-5" />
              </Button>
              {onClose && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClose}
                  className="text-white hover:text-red-400 hover:bg-red-950/50"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>

          {/* Track Queue Indicator */}
          <div className="mt-2 flex items-center justify-center gap-1">
            {tracks.slice(0, 10).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1 rounded-full transition-all",
                  index === currentTrackIndex
                    ? "w-8 bg-green-500"
                    : "w-1 bg-gray-600"
                )}
              />
            ))}
            {tracks.length > 10 && (
              <span className="text-xs text-gray-500 ml-2">
                +{tracks.length - 10} more
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default SpotifyPlayer;
