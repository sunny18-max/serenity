import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  TreePine,
  Sparkles,
  Award,
  Target,
  Clock,
  Leaf,
  Flower2,
  Trees,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface FocusSession {
  duration: number;
  completed: boolean;
  timestamp: Date;
}

interface GameStats {
  totalSessions: number;
  totalMinutes: number;
  treesPlanted: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string;
}

const WellnessGames = () => {
  const [selectedDuration, setSelectedDuration] = useState(25); // minutes
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // seconds
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [treeStage, setTreeStage] = useState(0); // 0-5 growth stages
  const [stats, setStats] = useState<GameStats>({
    totalSessions: 0,
    totalMinutes: 0,
    treesPlanted: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastSessionDate: "",
  });
  const [showCelebration, setShowCelebration] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const durations = [
    { value: 15, label: "15 min", icon: Leaf, color: "text-green-400" },
    { value: 25, label: "25 min", icon: TreePine, color: "text-green-500" },
    { value: 45, label: "45 min", icon: Trees, color: "text-green-600" },
    { value: 60, label: "60 min", icon: Flower2, color: "text-green-700" },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const statsDoc = await getDoc(doc(db, "users", user.uid, "wellness", "focus_game"));
        if (statsDoc.exists()) {
          setStats(statsDoc.data() as GameStats);
        }
      } catch (error) {
        console.error("Error fetching game stats:", error);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          
          // Update tree growth based on progress
          const progress = ((selectedDuration * 60 - prev) / (selectedDuration * 60)) * 100;
          const newStage = Math.min(5, Math.floor(progress / 20));
          setTreeStage(newStage);
          
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, isPaused, selectedDuration]);

  const handleStart = () => {
    if (!isActive) {
      setIsActive(true);
      setIsPaused(false);
      setTreeStage(0);
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeRemaining(selectedDuration * 60);
    setTreeStage(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleSessionComplete = async () => {
    setIsActive(false);
    setShowCelebration(true);

    const user = auth.currentUser;
    if (!user) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      
      // Calculate new streak
      let newStreak = stats.currentStreak;
      if (stats.lastSessionDate !== today) {
        const lastDate = new Date(stats.lastSessionDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = stats.currentStreak || 1;
      }

      const updatedStats: GameStats = {
        totalSessions: stats.totalSessions + 1,
        totalMinutes: stats.totalMinutes + selectedDuration,
        treesPlanted: stats.treesPlanted + 1,
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, stats.longestStreak),
        lastSessionDate: today,
      };

      await updateDoc(doc(db, "users", user.uid, "wellness", "focus_game"), {
        totalSessions: updatedStats.totalSessions,
        totalMinutes: updatedStats.totalMinutes,
        treesPlanted: updatedStats.treesPlanted,
        currentStreak: updatedStats.currentStreak,
        longestStreak: updatedStats.longestStreak,
        lastSessionDate: updatedStats.lastSessionDate,
      });
      await updateDoc(doc(db, "users", user.uid), {
        xp: increment(selectedDuration * 5),
      });

      setStats(updatedStats);
      setTreeStage(5);

      toast({
        title: "🎉 Focus Session Complete!",
        description: `You planted a tree! +${selectedDuration * 5} XP earned.`,
      });

      setTimeout(() => {
        setShowCelebration(false);
        handleReset();
      }, 3000);
    } catch (error) {
      console.error("Error saving session:", error);
    }
  };

  const handleDurationChange = (duration: number) => {
    if (!isActive) {
      setSelectedDuration(duration);
      setTimeRemaining(duration * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((selectedDuration * 60 - timeRemaining) / (selectedDuration * 60)) * 100;

  const getTreeEmoji = () => {
    const stages = ["🌱", "🌿", "🪴", "🌳", "🌲", "🌲✨"];
    return stages[treeStage] || "🌱";
  };

  const getMotivationalMessage = () => {
    if (progress < 25) return "Your tree is sprouting...";
    if (progress < 50) return "Keep going! Your tree is growing...";
    if (progress < 75) return "Almost there! Your tree is flourishing...";
    if (progress < 100) return "Final stretch! Your tree is maturing...";
    return "Beautiful! Your tree is fully grown!";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-blue-50 dark:from-gray-900 dark:via-background dark:to-gray-800 pb-16 lg:pb-0">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Badge variant="secondary" className="text-sm">
            <Award className="w-4 h-4 mr-1" />
            {stats.treesPlanted} Trees Planted
          </Badge>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Focus Forest
          </h1>
          <p className="text-muted-foreground">
            Stay focused and grow your mental wellness forest
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stats.totalMinutes}</p>
              <p className="text-sm text-muted-foreground">Total Minutes</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{stats.totalSessions}</p>
              <p className="text-sm text-muted-foreground">Sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <p className="text-2xl font-bold">{stats.currentStreak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Timer Card */}
        <Card className="shadow-xl border-2">
          <CardHeader>
            <CardTitle className="text-center">Focus Timer</CardTitle>
            <CardDescription className="text-center">
              Choose your focus duration and watch your tree grow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Duration Selection */}
            {!isActive && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {durations.map((dur) => {
                  const Icon = dur.icon;
                  return (
                    <Button
                      key={dur.value}
                      variant={selectedDuration === dur.value ? "default" : "outline"}
                      className="h-20 flex-col gap-2"
                      onClick={() => handleDurationChange(dur.value)}
                    >
                      <Icon className={cn("w-6 h-6", dur.color)} />
                      <span className="text-xs">{dur.label}</span>
                    </Button>
                  );
                })}
              </div>
            )}

            {/* Tree Display */}
            <div className="relative">
              <div
                className={cn(
                  "text-9xl text-center transition-all duration-500",
                  showCelebration && "animate-bounce"
                )}
              >
                {getTreeEmoji()}
              </div>
              {isActive && (
                <p className="text-center text-sm text-muted-foreground mt-2">
                  {getMotivationalMessage()}
                </p>
              )}
            </div>

            {/* Timer Display */}
            <div className="text-center">
              <p className="text-6xl font-bold font-mono">{formatTime(timeRemaining)}</p>
              <Progress value={progress} className="mt-4 h-3" />
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              {!isActive ? (
                <Button size="lg" onClick={handleStart} className="px-8">
                  <Play className="w-5 h-5 mr-2" />
                  Start Focus
                </Button>
              ) : (
                <>
                  <Button size="lg" variant="outline" onClick={handlePause}>
                    <Pause className="w-5 h-5 mr-2" />
                    {isPaused ? "Resume" : "Pause"}
                  </Button>
                  <Button size="lg" variant="destructive" onClick={handleReset}>
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset
                  </Button>
                </>
              )}
            </div>

            {/* Tips */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <p className="text-sm text-center text-muted-foreground">
                  💡 <strong>Tip:</strong> Put your phone away, close unnecessary tabs, and focus on one task.
                  Your tree will die if you leave this page!
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TreePine className="w-5 h-5 text-green-500" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge className="mt-1">1</Badge>
              <div>
                <p className="font-medium">Choose Your Duration</p>
                <p className="text-sm text-muted-foreground">
                  Select a focus period (15-60 minutes)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="mt-1">2</Badge>
              <div>
                <p className="font-medium">Stay Focused</p>
                <p className="text-sm text-muted-foreground">
                  Watch your tree grow as you maintain focus
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="mt-1">3</Badge>
              <div>
                <p className="font-medium">Plant Your Tree</p>
                <p className="text-sm text-muted-foreground">
                  Complete the session to add a tree to your forest and earn XP
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="mt-1">4</Badge>
              <div>
                <p className="font-medium">Build Your Streak</p>
                <p className="text-sm text-muted-foreground">
                  Focus daily to maintain your streak and grow your forest
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WellnessGames;
