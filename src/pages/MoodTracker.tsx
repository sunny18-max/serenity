import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/firebase";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { 
  Smile,
  Meh,
  Frown,
  Angry,
  Heart,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  Brain,
  Sparkles,
  AlertCircle,
  Sun,
  Cloud,
  CloudRain,
  Zap,
  Wind,
  Lightbulb,
  Activity
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { notifyMoodLogged } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface MoodEntry {
  date: string;
  mood: number;
  emoji: string;
  note: string;
  timestamp: string;
  triggers?: string[];
  activities?: string[];
}

interface MoodPattern {
  type: string;
  description: string;
  icon: any;
  severity: "info" | "warning" | "positive";
}

const moodOptions = [
  { value: 1, label: "Terrible", emoji: "😢", icon: Frown, color: "text-red-500", bg: "bg-red-500/10" },
  { value: 2, label: "Bad", emoji: "😟", icon: CloudRain, color: "text-orange-500", bg: "bg-orange-500/10" },
  { value: 3, label: "Okay", emoji: "😐", icon: Meh, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { value: 4, label: "Good", emoji: "🙂", icon: Cloud, color: "text-blue-500", bg: "bg-blue-500/10" },
  { value: 5, label: "Excellent", emoji: "😄", icon: Smile, color: "text-green-500", bg: "bg-green-500/10" }
];

const commonTriggers = [
  "Work stress", "Sleep issues", "Social anxiety", "Family", 
  "Health concerns", "Financial worry", "Loneliness", "Overwhelmed"
];

const commonActivities = [
  "Exercise", "Meditation", "Reading", "Music",
  "Social time", "Nature walk", "Creative work", "Rest"
];

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState("");
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [patterns, setPatterns] = useState<MoodPattern[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/auth");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const moods = userDoc.data().moods || [];
          setMoodHistory(moods.slice(-30)); // Last 30 entries
          analyzePatterns(moods);
        }
      } catch (error) {
        console.error("Error loading mood history:", error);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const analyzePatterns = (moods: MoodEntry[]) => {
    if (moods.length < 7) return;

    const detectedPatterns: MoodPattern[] = [];
    const recentMoods = moods.slice(-7);
    const avgMood = recentMoods.reduce((sum, m) => sum + m.mood, 0) / recentMoods.length;

    // Trend analysis
    const firstHalf = recentMoods.slice(0, 3).reduce((sum, m) => sum + m.mood, 0) / 3;
    const secondHalf = recentMoods.slice(-3).reduce((sum, m) => sum + m.mood, 0) / 3;
    
    if (secondHalf > firstHalf + 0.5) {
      detectedPatterns.push({
        type: "Improving Trend",
        description: "Your mood has been improving over the past week! Keep up the positive momentum.",
        icon: TrendingUp,
        severity: "positive"
      });
    } else if (secondHalf < firstHalf - 0.5) {
      detectedPatterns.push({
        type: "Declining Trend",
        description: "Your mood has been declining. Consider reaching out for support or trying stress-relief activities.",
        icon: TrendingDown,
        severity: "warning"
      });
    }

    // Low mood detection
    if (avgMood < 2.5) {
      detectedPatterns.push({
        type: "Persistent Low Mood",
        description: "You've been experiencing consistently low moods. It might be helpful to talk to a professional.",
        icon: AlertCircle,
        severity: "warning"
      });
    }

    // Volatility detection
    const variance = recentMoods.reduce((sum, m) => sum + Math.pow(m.mood - avgMood, 2), 0) / recentMoods.length;
    if (variance > 1.5) {
      detectedPatterns.push({
        type: "Mood Fluctuations",
        description: "Your mood has been fluctuating significantly. Try to identify triggers and maintain routines.",
        icon: Activity,
        severity: "info"
      });
    }

    // Trigger analysis
    const allTriggers = recentMoods.flatMap(m => m.triggers || []);
    const triggerCounts: { [key: string]: number } = {};
    allTriggers.forEach(t => {
      triggerCounts[t] = (triggerCounts[t] || 0) + 1;
    });
    const commonTrigger = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0];
    
    if (commonTrigger && commonTrigger[1] >= 3) {
      detectedPatterns.push({
        type: "Common Trigger Identified",
        description: `"${commonTrigger[0]}" appears frequently. Consider developing coping strategies for this trigger.`,
        icon: Lightbulb,
        severity: "info"
      });
    }

    setPatterns(detectedPatterns);
  };

  const handleSubmitMood = async () => {
    if (!selectedMood) {
      toast({
        title: "Please select a mood",
        description: "Choose how you're feeling today",
        variant: "destructive"
      });
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    setIsSubmitting(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      const moodOption = moodOptions.find(m => m.value === selectedMood)!;
      
      const newEntry: MoodEntry = {
        date: today,
        mood: selectedMood,
        emoji: moodOption.emoji,
        note: moodNote,
        timestamp: new Date().toISOString(),
        triggers: selectedTriggers,
        activities: selectedActivities
      };

      await updateDoc(doc(db, "users", user.uid), {
        moods: arrayUnion(newEntry)
      });

      setMoodHistory(prev => [...prev, newEntry]);
      analyzePatterns([...moodHistory, newEntry]);

      // Create notification
      await notifyMoodLogged(selectedMood);

      toast({
        title: "Mood recorded! 🎉",
        description: "Your entry has been saved successfully."
      });

      // Reset form
      setSelectedMood(null);
      setMoodNote("");
      setSelectedTriggers([]);
      setSelectedActivities([]);

    } catch (error) {
      console.error("Error saving mood:", error);
      toast({
        title: "Error",
        description: "Failed to save mood entry",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers(prev =>
      prev.includes(trigger) ? prev.filter(t => t !== trigger) : [...prev, trigger]
    );
  };

  const toggleActivity = (activity: string) => {
    setSelectedActivities(prev =>
      prev.includes(activity) ? prev.filter(a => a !== activity) : [...prev, activity]
    );
  };

  const chartData = moodHistory.slice(-14).map(entry => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mood: entry.mood
  }));

  const avgMood = moodHistory.length > 0
    ? (moodHistory.reduce((sum, m) => sum + m.mood, 0) / moodHistory.length).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
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
                  <Heart className="w-6 h-6 text-white" />
                </div>
                Mood Tracker
              </h1>
              <p className="text-muted-foreground mt-1">
                Track your emotions and discover patterns with AI insights
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Tracking Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Log Mood */}
            <Card className="shadow-medium border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smile className="w-5 h-5 text-primary" />
                  How are you feeling today?
                </CardTitle>
                <CardDescription>
                  Select your current mood and add context
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mood Selection */}
                <div className="grid grid-cols-5 gap-3">
                  {moodOptions.map(option => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setSelectedMood(option.value)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105",
                          selectedMood === option.value
                            ? `${option.bg} border-current ${option.color} shadow-lg`
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <span className="text-3xl">{option.emoji}</span>
                          <Icon className={cn("w-5 h-5", selectedMood === option.value ? option.color : "text-muted-foreground")} />
                          <span className="text-xs font-medium">{option.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Triggers */}
                <div>
                  <label className="text-sm font-medium mb-2 block">What triggered this mood?</label>
                  <div className="flex flex-wrap gap-2">
                    {commonTriggers.map(trigger => (
                      <Badge
                        key={trigger}
                        variant={selectedTriggers.includes(trigger) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleTrigger(trigger)}
                      >
                        {trigger}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Activities */}
                <div>
                  <label className="text-sm font-medium mb-2 block">What did you do today?</label>
                  <div className="flex flex-wrap gap-2">
                    {commonActivities.map(activity => (
                      <Badge
                        key={activity}
                        variant={selectedActivities.includes(activity) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleActivity(activity)}
                      >
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Add a note (optional)</label>
                  <Textarea
                    placeholder="How are you feeling? What's on your mind?"
                    value={moodNote}
                    onChange={(e) => setMoodNote(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <Button
                  onClick={handleSubmitMood}
                  disabled={!selectedMood || isSubmitting}
                  className="w-full bg-gradient-primary"
                  size="lg"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Saving..." : "Save Mood Entry"}
                </Button>
              </CardContent>
            </Card>

            {/* Mood Chart */}
            <Card className="shadow-medium border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-wellness" />
                  Mood Trends
                </CardTitle>
                <CardDescription>Your mood over the last 14 days</CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                      <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} style={{ fontSize: '12px' }} />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="mood" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        fill="url(#colorMood)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Start tracking to see your mood trends</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Insights Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats */}
            <Card className="shadow-medium border-primary/10">
              <CardHeader>
                <CardTitle className="text-lg">Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Entries</span>
                  <span className="text-2xl font-bold text-primary">{moodHistory.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Average Mood</span>
                  <span className="text-2xl font-bold text-wellness">{avgMood}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tracking Streak</span>
                  <span className="text-2xl font-bold text-energy">
                    {moodHistory.length > 0 ? Math.min(moodHistory.length, 30) : 0} days
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="shadow-medium border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="w-5 h-5 text-primary" />
                  AI Insights
                </CardTitle>
                <CardDescription>Patterns detected in your mood</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {patterns.length > 0 ? (
                  patterns.map((pattern, index) => {
                    const Icon = pattern.icon;
                    const severityColors = {
                      positive: "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400",
                      warning: "bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-400",
                      info: "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400"
                    };

                    return (
                      <div
                        key={index}
                        className={cn(
                          "p-3 rounded-lg border",
                          severityColors[pattern.severity]
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-sm mb-1">{pattern.type}</h4>
                            <p className="text-xs opacity-90">{pattern.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6">
                    <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Track for 7 days to unlock AI insights
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-medium border-primary/10">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/mindfulness")}
                >
                  <Wind className="w-4 h-4 mr-2" />
                  Start Mindfulness
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/ai-therapist")}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Talk to AI Companion
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/emergency-help")}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Need Help Now?
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;
