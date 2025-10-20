import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/firebase";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { 
  Play, 
  Pause, 
  RotateCcw,
  ArrowLeft,
  Wind,
  Heart,
  Moon,
  Sunrise,
  Brain,
  Sparkles,
  Timer,
  Award,
  TrendingUp,
  Music,
  Volume2,
  VolumeX,
  Video
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { notifyMindfulnessCompleted } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import MobileBottomNav from "@/components/MobileBottomNav";

interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  type: "breathing" | "meditation" | "gratitude";
  icon: any;
  instructions: string[];
  benefits: string[];
  videoUrl?: string;
  videoId?: string;
}

interface UserProgress {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  completedExercises: string[];
  lastSessionDate: string;
}

const exercises: Exercise[] = [
  {
    id: "box-breathing",
    title: "Box Breathing",
    description: "4-4-4-4 breathing technique for instant calm",
    duration: 240,
    type: "breathing",
    icon: Wind,
    videoId: "LiUnFJ8P4gM",
    videoUrl: "https://www.youtube.com/embed/LiUnFJ8P4gM",
    instructions: [
      "Breathe in for 4 seconds",
      "Hold for 4 seconds",
      "Breathe out for 4 seconds",
      "Hold for 4 seconds",
      "Repeat the cycle"
    ],
    benefits: ["Reduces stress", "Improves focus", "Calms nervous system"]
  },
  {
    id: "body-scan",
    title: "Body Scan Meditation",
    description: "Progressive relaxation from head to toe",
    duration: 600,
    type: "meditation",
    icon: Heart,
    videoId: "15q-N-_kkrU",
    videoUrl: "https://www.youtube.com/embed/15q-N-_kkrU",
    instructions: [
      "Find a comfortable position",
      "Close your eyes gently",
      "Focus on your breath",
      "Scan each body part from head to toe",
      "Release tension as you go"
    ],
    benefits: ["Deep relaxation", "Body awareness", "Stress relief"]
  },
  {
    id: "morning-meditation",
    title: "Morning Mindfulness",
    description: "Start your day with intention and clarity",
    duration: 300,
    type: "meditation",
    icon: Sunrise,
    videoId: "6p_yaNFSYao",
    videoUrl: "https://www.youtube.com/embed/6p_yaNFSYao",
    instructions: [
      "Sit comfortably with eyes closed",
      "Take 3 deep breaths",
      "Set your intention for the day",
      "Visualize a positive outcome",
      "Express gratitude"
    ],
    benefits: ["Positive mindset", "Clarity", "Energy boost"]
  },
  {
    id: "evening-calm",
    title: "Evening Wind Down",
    description: "Release the day and prepare for restful sleep",
    duration: 420,
    type: "meditation",
    icon: Moon,
    videoId: "g0jfhRcXtLQ",
    videoUrl: "https://www.youtube.com/embed/g0jfhRcXtLQ",
    instructions: [
      "Dim the lights and get comfortable",
      "Breathe slowly and deeply",
      "Review your day without judgment",
      "Let go of any tension",
      "Prepare for peaceful sleep"
    ],
    benefits: ["Better sleep", "Stress release", "Mental clarity"]
  },
  {
    id: "gratitude-practice",
    title: "Gratitude Reflection",
    description: "Cultivate appreciation and positive emotions",
    duration: 180,
    type: "gratitude",
    icon: Sparkles,
    videoId: "nj2ofrX7jAk",
    videoUrl: "https://www.youtube.com/embed/nj2ofrX7jAk",
    instructions: [
      "Think of 3 things you're grateful for",
      "Reflect on why each matters",
      "Feel the positive emotions",
      "Express thanks mentally",
      "Carry this feeling forward"
    ],
    benefits: ["Positive emotions", "Life satisfaction", "Resilience"]
  },
  {
    id: "stress-relief",
    title: "Stress Relief Breathing",
    description: "Quick technique to reduce anxiety",
    duration: 180,
    type: "breathing",
    icon: Brain,
    videoId: "0BbHW3H_xmo",
    videoUrl: "https://www.youtube.com/embed/0BbHW3H_xmo",
    instructions: [
      "Breathe in through nose for 4 counts",
      "Hold for 7 counts",
      "Exhale through mouth for 8 counts",
      "Repeat 4 times",
      "Notice the calm"
    ],
    benefits: ["Anxiety reduction", "Quick relief", "Mental clarity"]
  }
];

const Mindfulness = () => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [progress, setProgress] = useState(0);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalSessions: 0,
    totalMinutes: 0,
    currentStreak: 0,
    longestStreak: 0,
    completedExercises: [],
    lastSessionDate: ""
  });
  const [isMuted, setIsMuted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/auth");
        return;
      }

      try {
        const progressDoc = await getDoc(doc(db, "users", user.uid, "wellness", "mindfulness"));
        if (progressDoc.exists()) {
          setUserProgress(progressDoc.data() as UserProgress);
        }
      } catch (error) {
        console.error("Error loading progress:", error);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (isPlaying && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
        
        if (selectedExercise) {
          const elapsed = selectedExercise.duration - timeRemaining;
          setProgress((elapsed / selectedExercise.duration) * 100);
          
          // Update step based on time
          const stepDuration = selectedExercise.duration / selectedExercise.instructions.length;
          const newStep = Math.floor(elapsed / stepDuration);
          setCurrentStep(Math.min(newStep, selectedExercise.instructions.length - 1));
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, timeRemaining, selectedExercise]);

  const handleStartExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setTimeRemaining(exercise.duration);
    setProgress(0);
    setCurrentStep(0);
    setIsPlaying(true);
    
    // Don't play ambient sound when video is present (video has its own audio)
    // if (!isMuted && audioRef.current && !exercise.videoUrl) {
    //   audioRef.current.play();
    // }
  };

  const handlePauseResume = () => {
    setIsPlaying(!isPlaying);
    // Audio control disabled - videos have their own audio
    // if (audioRef.current) {
    //   if (isPlaying) {
    //     audioRef.current.pause();
    //   } else {
    //     audioRef.current.play();
    //   }
    // }
  };

  const handleReset = () => {
    setIsPlaying(false);
    if (selectedExercise) {
      setTimeRemaining(selectedExercise.duration);
      setProgress(0);
      setCurrentStep(0);
    }
    // Audio control disabled - videos have their own audio
    // if (audioRef.current) {
    //   audioRef.current.pause();
    //   audioRef.current.currentTime = 0;
    // }
  };

  const handleComplete = async () => {
    setIsPlaying(false);
    // Audio control disabled - videos have their own audio
    // if (audioRef.current) {
    //   audioRef.current.pause();
    // }

    const user = auth.currentUser;
    if (!user || !selectedExercise) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const minutes = Math.floor(selectedExercise.duration / 60);
      
      // Calculate new streak
      let newStreak = userProgress.currentStreak;
      if (userProgress.lastSessionDate !== today) {
        const lastDate = new Date(userProgress.lastSessionDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      }

      const updatedProgress: UserProgress = {
        totalSessions: userProgress.totalSessions + 1,
        totalMinutes: userProgress.totalMinutes + minutes,
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, userProgress.longestStreak),
        completedExercises: [...new Set([...userProgress.completedExercises, selectedExercise.id])],
        lastSessionDate: today
      };

      await setDoc(
        doc(db, "users", user.uid, "wellness", "mindfulness"),
        updatedProgress
      );

      setUserProgress(updatedProgress);

      // Calculate XP earned
      const xpEarned = minutes * 10;

      // Create notification
      await notifyMindfulnessCompleted(selectedExercise.title, minutes, xpEarned);

      toast({
        title: "🎉 Session Complete!",
        description: `Great job! You've completed ${selectedExercise.title}. +${minutes} minutes added.`,
      });

      // Award XP
      await updateDoc(doc(db, "users", user.uid), {
        xp: increment(minutes * 10),
        totalMindfulnessMinutes: increment(minutes)
      });

    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-16 lg:pb-0">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-7xl">
        {/* Header - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          {/* Mobile Header */}
          <div className="lg:hidden">
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
                  <Wind className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Mindfulness</h1>
                  <p className="text-xs text-muted-foreground">Daily practices</p>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
                    <Wind className="w-6 h-6 text-white" />
                  </div>
                  Mindfulness & Meditation
                </h1>
                <p className="text-muted-foreground mt-1">
                  Daily practices for mental clarity and peace
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="shadow-medium border-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-2xl font-bold text-primary">{userProgress.totalSessions}</p>
                </div>
                <Timer className="w-8 h-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Minutes</p>
                  <p className="text-2xl font-bold text-wellness">{userProgress.totalMinutes}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-wellness/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-bold text-energy">{userProgress.currentStreak} days</p>
                </div>
                <Award className="w-8 h-8 text-energy/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Exercises Done</p>
                  <p className="text-2xl font-bold text-focus">
                    {userProgress.completedExercises.length}/{exercises.length}
                  </p>
                </div>
                <Sparkles className="w-8 h-8 text-focus/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exercise List */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="breathing">Breathing</TabsTrigger>
                <TabsTrigger value="meditation">Meditation</TabsTrigger>
                <TabsTrigger value="gratitude">Gratitude</TabsTrigger>
              </TabsList>

              {["all", "breathing", "meditation", "gratitude"].map(type => (
                <TabsContent key={type} value={type} className="space-y-4">
                  {exercises
                    .filter(ex => type === "all" || ex.type === type)
                    .map(exercise => {
                      const Icon = exercise.icon;
                      const isCompleted = userProgress.completedExercises.includes(exercise.id);
                      
                      return (
                        <Card 
                          key={exercise.id}
                          className={cn(
                            "shadow-medium border-primary/10 hover:shadow-glow transition-all cursor-pointer",
                            selectedExercise?.id === exercise.id && "border-primary"
                          )}
                          onClick={() => handleStartExercise(exercise)}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                                  <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <CardTitle className="flex items-center gap-2 flex-wrap">
                                    {exercise.title}
                                    {exercise.videoUrl && (
                                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                                        <Video className="w-3 h-3 mr-1" />
                                        Guided Video
                                      </Badge>
                                    )}
                                    {isCompleted && (
                                      <Badge variant="outline" className="text-xs">
                                        <Award className="w-3 h-3 mr-1" />
                                        Completed
                                      </Badge>
                                    )}
                                  </CardTitle>
                                  <CardDescription className="mt-1">
                                    {exercise.description}
                                  </CardDescription>
                                </div>
                              </div>
                              <Badge variant="secondary">
                                {Math.floor(exercise.duration / 60)} min
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {exercise.benefits.map((benefit, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {benefit}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Active Session */}
          <div className="lg:col-span-1">
            <Card className="shadow-medium border-primary/10 sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-primary" />
                  {selectedExercise ? "Active Session" : "Select Exercise"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedExercise ? (
                  <div className="space-y-6">
                    {/* Video Player */}
                    {selectedExercise.videoUrl && (
                      <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                        <iframe
                          src={`${selectedExercise.videoUrl}?autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&rel=0&modestbranding=1`}
                          title={selectedExercise.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}

                    {/* Timer Display */}
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary mb-2">
                        {formatTime(timeRemaining)}
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Current Instruction */}
                    <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                      <p className="text-sm font-medium mb-2 text-primary">Current Step:</p>
                      <p className="text-lg font-medium">
                        {selectedExercise.instructions[currentStep]}
                      </p>
                    </div>

                    {/* All Instructions */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Instructions:</p>
                      {selectedExercise.instructions.map((instruction, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "p-2 rounded text-sm transition-all",
                            idx === currentStep 
                              ? "bg-primary/10 border border-primary/20" 
                              : "bg-muted/30"
                          )}
                        >
                          {idx + 1}. {instruction}
                        </div>
                      ))}
                    </div>

                    {/* Controls */}
                    <div className="flex gap-2">
                      <Button
                        onClick={handlePauseResume}
                        className="flex-1 bg-gradient-primary"
                        size="lg"
                      >
                        {isPlaying ? (
                          <><Pause className="w-4 h-4 mr-2" /> Pause</>
                        ) : (
                          <><Play className="w-4 h-4 mr-2" /> Resume</>
                        )}
                      </Button>
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        size="lg"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => setIsMuted(!isMuted)}
                        variant="outline"
                        size="lg"
                      >
                        {isMuted ? (
                          <VolumeX className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Wind className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Select an exercise to begin your mindfulness practice
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Hidden audio element for ambient sounds */}
      <audio ref={audioRef} loop>
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnMpBSuBzvLZiTYIGWi77eafTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUxh9Hz04IzBh5uwO/jmUgND1as5++wXRgIPpba8sZzKQUrgc7y2Yk2CBlou+3mn00QDFCn4/C2YxwGOJLX8sx5LAUkd8fw3ZBACh" type="audio/wav" />
      </audio>
      <MobileBottomNav />
    </div>
  );
};

export default Mindfulness;
