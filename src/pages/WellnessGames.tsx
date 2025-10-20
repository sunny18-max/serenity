import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import {
  ArrowLeft,
  Brain,
  Heart,
  Smile,
  Sparkles,
  Target,
  Zap,
  Cloud,
  Sun,
  Moon,
  Star,
  Flower2,
  TreePine,
  Award,
  TrendingUp,
  RefreshCw,
  Play,
  Check,
  X,
  Shuffle,
  Timer,
  Trophy,
  Lightbulb,
  MessageCircle,
  Music,
  Palette,
  Book,
  Coffee,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import MobileBottomNav from "@/components/MobileBottomNav";
import { motion, AnimatePresence } from "framer-motion";

interface GameStats {
  focusMinutes: number;
  gratitudeEntries: number;
  breathingExercises: number;
  thoughtChallenges: number;
  moodBoosts: number;
  totalPoints: number;
}

const WellnessGames = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<GameStats>({
    focusMinutes: 0,
    gratitudeEntries: 0,
    breathingExercises: 0,
    thoughtChallenges: 0,
    moodBoosts: 0,
    totalPoints: 0,
  });

  // Gratitude Game State
  const [gratitudeItems, setGratitudeItems] = useState<string[]>([]);
  const [currentGratitude, setCurrentGratitude] = useState("");

  // Breathing Game State
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("inhale");
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathCount, setBreathCount] = useState(0);

  // Thought Challenge State
  const [negativeThought, setNegativeThought] = useState("");
  const [positiveReframe, setPositiveReframe] = useState("");
  const [thoughtHistory, setThoughtHistory] = useState<Array<{ negative: string; positive: string }>>([]);

  // Mood Boost State
  const [selectedMoodBoost, setSelectedMoodBoost] = useState<string | null>(null);

  // Memory Match State
  const [memoryCards, setMemoryCards] = useState<Array<{ id: number; emoji: string; flipped: boolean; matched: boolean }>>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryMatches, setMemoryMatches] = useState(0);

  const moodBoostActivities = [
    { id: 1, icon: Music, title: "Listen to Music", description: "5 min mood boost", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950" },
    { id: 2, icon: Coffee, title: "Mindful Tea/Coffee", description: "Savor the moment", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
    { id: 3, icon: Book, title: "Read Something", description: "Escape for 10 min", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950" },
    { id: 4, icon: Sun, title: "Get Sunlight", description: "Vitamin D boost", color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950" },
    { id: 5, icon: Palette, title: "Doodle/Color", description: "Express creativity", color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950" },
    { id: 6, icon: MessageCircle, title: "Text a Friend", description: "Social connection", color: "text-green-500", bg: "bg-green-50 dark:bg-green-950" },
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const statsDoc = await getDoc(doc(db, "users", user.uid, "wellness", "games"));
      if (statsDoc.exists()) {
        setStats(statsDoc.data() as GameStats);
      }
    } catch (error) {
      console.error("Error fetching game stats:", error);
    }
  };

  const updateStats = async (updates: Partial<GameStats>) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const statsRef = doc(db, "users", user.uid, "wellness", "games");
      await setDoc(statsRef, { ...stats, ...updates }, { merge: true });
      setStats(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error("Error updating stats:", error);
    }
  };

  // Gratitude Game Functions
  const addGratitudeItem = () => {
    if (currentGratitude.trim()) {
      setGratitudeItems([...gratitudeItems, currentGratitude]);
      setCurrentGratitude("");
      updateStats({
        gratitudeEntries: stats.gratitudeEntries + 1,
        totalPoints: stats.totalPoints + 10,
      });
      toast({
        title: "Gratitude Added! 🌟",
        description: "+10 wellness points",
      });
    }
  };

  // Breathing Exercise Functions
  const startBreathingExercise = () => {
    setBreathingActive(true);
    setBreathCount(0);
    runBreathingCycle();
  };

  const runBreathingCycle = () => {
    const phases = [
      { phase: "inhale" as const, duration: 4000 },
      { phase: "hold" as const, duration: 4000 },
      { phase: "exhale" as const, duration: 4000 },
      { phase: "rest" as const, duration: 2000 },
    ];

    let currentPhaseIndex = 0;
    let cycleCount = 0;

    const runPhase = () => {
      if (cycleCount >= 5) {
        setBreathingActive(false);
        setBreathCount(5);
        updateStats({
          breathingExercises: stats.breathingExercises + 1,
          totalPoints: stats.totalPoints + 20,
        });
        toast({
          title: "Breathing Exercise Complete! 🌬️",
          description: "+20 wellness points",
        });
        return;
      }

      const currentPhase = phases[currentPhaseIndex];
      setBreathingPhase(currentPhase.phase);

      setTimeout(() => {
        currentPhaseIndex++;
        if (currentPhaseIndex >= phases.length) {
          currentPhaseIndex = 0;
          cycleCount++;
          setBreathCount(cycleCount);
        }
        if (cycleCount < 5) {
          runPhase();
        }
      }, currentPhase.duration);
    };

    runPhase();
  };

  // Thought Challenge Functions
  const submitThoughtChallenge = () => {
    if (negativeThought.trim() && positiveReframe.trim()) {
      setThoughtHistory([...thoughtHistory, { negative: negativeThought, positive: positiveReframe }]);
      setNegativeThought("");
      setPositiveReframe("");
      updateStats({
        thoughtChallenges: stats.thoughtChallenges + 1,
        totalPoints: stats.totalPoints + 15,
      });
      toast({
        title: "Thought Reframed! 💭",
        description: "+15 wellness points",
      });
    }
  };

  // Mood Boost Functions
  const completeMoodBoost = (activityId: number) => {
    setSelectedMoodBoost(activityId.toString());
    setTimeout(() => {
      updateStats({
        moodBoosts: stats.moodBoosts + 1,
        totalPoints: stats.totalPoints + 5,
      });
      toast({
        title: "Mood Boost Complete! 😊",
        description: "+5 wellness points",
      });
      setSelectedMoodBoost(null);
    }, 1000);
  };

  // Memory Match Game Functions
  const initMemoryGame = () => {
    const emojis = ["🌸", "🌺", "🌻", "🌷", "🌹", "🌼", "🍀", "🌿"];
    const cards = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        flipped: false,
        matched: false,
      }));
    setMemoryCards(cards);
    setFlippedCards([]);
    setMemoryMoves(0);
    setMemoryMatches(0);
  };

  const flipCard = (id: number) => {
    if (flippedCards.length === 2 || memoryCards[id].matched || memoryCards[id].flipped) return;

    const newCards = [...memoryCards];
    newCards[id].flipped = true;
    setMemoryCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMemoryMoves(memoryMoves + 1);
      const [first, second] = newFlipped;
      
      if (memoryCards[first].emoji === memoryCards[second].emoji) {
        setTimeout(() => {
          const matchedCards = [...memoryCards];
          matchedCards[first].matched = true;
          matchedCards[second].matched = true;
          setMemoryCards(matchedCards);
          setFlippedCards([]);
          setMemoryMatches(memoryMatches + 1);

          if (memoryMatches + 1 === 8) {
            updateStats({
              totalPoints: stats.totalPoints + 25,
            });
            toast({
              title: "Memory Game Complete! 🎉",
              description: "+25 wellness points",
            });
          }
        }, 500);
      } else {
        setTimeout(() => {
          const resetCards = [...memoryCards];
          resetCards[first].flipped = false;
          resetCards[second].flipped = false;
          setMemoryCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const getBreathingMessage = () => {
    switch (breathingPhase) {
      case "inhale": return "Breathe In...";
      case "hold": return "Hold...";
      case "exhale": return "Breathe Out...";
      case "rest": return "Rest...";
    }
  };

  const getBreathingColor = () => {
    switch (breathingPhase) {
      case "inhale": return "bg-blue-500";
      case "hold": return "bg-purple-500";
      case "exhale": return "bg-green-500";
      case "rest": return "bg-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-16 lg:pb-0">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Badge variant="secondary" className="text-sm">
              <Trophy className="w-4 h-4 mr-1" />
              {stats.totalPoints} Points
            </Badge>
          </div>

          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Wellness Games
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Fun activities to boost your mental health
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="w-6 h-6 mx-auto mb-1 text-red-500" />
              <p className="text-xl font-bold">{stats.gratitudeEntries}</p>
              <p className="text-xs text-muted-foreground">Gratitude</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Cloud className="w-6 h-6 mx-auto mb-1 text-blue-500" />
              <p className="text-xl font-bold">{stats.breathingExercises}</p>
              <p className="text-xs text-muted-foreground">Breathing</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Brain className="w-6 h-6 mx-auto mb-1 text-purple-500" />
              <p className="text-xl font-bold">{stats.thoughtChallenges}</p>
              <p className="text-xs text-muted-foreground">Thoughts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Smile className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
              <p className="text-xl font-bold">{stats.moodBoosts}</p>
              <p className="text-xs text-muted-foreground">Mood Boosts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Sparkles className="w-6 h-6 mx-auto mb-1 text-orange-500" />
              <p className="text-xl font-bold">{stats.totalPoints}</p>
              <p className="text-xs text-muted-foreground">Total Points</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-1 text-green-500" />
              <p className="text-xl font-bold">
                {stats.gratitudeEntries + stats.breathingExercises + stats.thoughtChallenges + stats.moodBoosts}
              </p>
              <p className="text-xs text-muted-foreground">Activities</p>
            </CardContent>
          </Card>
        </div>

        {/* Games Tabs */}
        <Tabs defaultValue="gratitude" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-6">
            <TabsTrigger value="gratitude">Gratitude</TabsTrigger>
            <TabsTrigger value="breathing">Breathing</TabsTrigger>
            <TabsTrigger value="thoughts">Thoughts</TabsTrigger>
            <TabsTrigger value="mood">Mood Boost</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
          </TabsList>

          {/* Gratitude Game */}
          <TabsContent value="gratitude">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Gratitude Journal
                </CardTitle>
                <CardDescription>
                  Write down 3 things you're grateful for today
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentGratitude}
                    onChange={(e) => setCurrentGratitude(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addGratitudeItem()}
                    placeholder="I'm grateful for..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button onClick={addGratitudeItem} disabled={!currentGratitude.trim()}>
                    <Check className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <AnimatePresence>
                    {gratitudeItems.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg"
                      >
                        <Star className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm flex-1">{item}</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {gratitudeItems.length >= 3 && (
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p className="font-semibold text-green-700 dark:text-green-400">
                      Amazing! You've completed your gratitude practice! 🌟
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Breathing Exercise */}
          <TabsContent value="breathing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-blue-500" />
                  Box Breathing
                </CardTitle>
                <CardDescription>
                  4-4-4-4 breathing technique for calm and focus
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <motion.div
                    className={cn(
                      "w-48 h-48 mx-auto rounded-full flex items-center justify-center transition-colors duration-1000",
                      getBreathingColor()
                    )}
                    animate={breathingActive ? {
                      scale: breathingPhase === "inhale" ? 1.2 : breathingPhase === "exhale" ? 0.8 : 1
                    } : {}}
                    transition={{ duration: breathingPhase === "rest" ? 2 : 4 }}
                  >
                    <div className="text-white text-center">
                      <p className="text-2xl font-bold mb-2">{getBreathingMessage()}</p>
                      <p className="text-sm">Cycle {breathCount}/5</p>
                    </div>
                  </motion.div>
                </div>

                <div className="text-center space-y-4">
                  {!breathingActive ? (
                    <Button onClick={startBreathingExercise} size="lg" className="w-full sm:w-auto">
                      <Play className="w-4 h-4 mr-2" />
                      Start Breathing Exercise
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Follow the circle's movement with your breath
                      </p>
                      <div className="flex justify-center gap-2">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-3 h-3 rounded-full",
                              i < breathCount ? "bg-blue-500" : "bg-gray-300"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-400">Benefits:</h4>
                  <ul className="text-sm space-y-1 text-blue-600 dark:text-blue-300">
                    <li>• Reduces stress and anxiety</li>
                    <li>• Improves focus and concentration</li>
                    <li>• Lowers blood pressure</li>
                    <li>• Promotes relaxation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Thought Challenge */}
          <TabsContent value="thoughts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  Thought Challenger
                </CardTitle>
                <CardDescription>
                  Reframe negative thoughts using CBT techniques
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Negative Thought</label>
                    <textarea
                      value={negativeThought}
                      onChange={(e) => setNegativeThought(e.target.value)}
                      placeholder="Write down a negative or unhelpful thought..."
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Positive Reframe</label>
                    <textarea
                      value={positiveReframe}
                      onChange={(e) => setPositiveReframe(e.target.value)}
                      placeholder="How can you reframe this thought more positively or realistically?"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                    />
                  </div>

                  <Button
                    onClick={submitThoughtChallenge}
                    disabled={!negativeThought.trim() || !positiveReframe.trim()}
                    className="w-full"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Submit Reframe
                  </Button>
                </div>

                {thoughtHistory.length > 0 && (
                  <div className="space-y-3 mt-6">
                    <h4 className="font-semibold">Your Progress:</h4>
                    {thoughtHistory.slice(-3).reverse().map((entry, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-start gap-2">
                          <X className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">{entry.negative}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                          <p className="text-sm font-medium">{entry.positive}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mood Boost Activities */}
          <TabsContent value="mood">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smile className="w-5 h-5 text-yellow-500" />
                  Quick Mood Boosters
                </CardTitle>
                <CardDescription>
                  5-minute activities to lift your spirits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {moodBoostActivities.map((activity) => {
                    const Icon = activity.icon;
                    const isSelected = selectedMoodBoost === activity.id.toString();
                    
                    return (
                      <motion.div
                        key={activity.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Card
                          className={cn(
                            "cursor-pointer transition-all",
                            isSelected && "ring-2 ring-primary",
                            activity.bg
                          )}
                          onClick={() => completeMoodBoost(activity.id)}
                        >
                          <CardContent className="p-6 text-center">
                            <Icon className={cn("w-12 h-12 mx-auto mb-3", activity.color)} />
                            <h3 className="font-semibold mb-1">{activity.title}</h3>
                            <p className="text-xs text-muted-foreground">{activity.description}</p>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="mt-3"
                              >
                                <Check className="w-6 h-6 mx-auto text-green-500" />
                              </motion.div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Memory Match Game */}
          <TabsContent value="memory">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flower2 className="w-5 h-5 text-pink-500" />
                  Mindful Memory Match
                </CardTitle>
                <CardDescription>
                  Match the flowers to improve focus and memory
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="font-semibold">Moves:</span> {memoryMoves}
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">Matches:</span> {memoryMatches}/8
                  </div>
                  <Button onClick={initMemoryGame} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    New Game
                  </Button>
                </div>

                {memoryCards.length === 0 ? (
                  <div className="text-center py-12">
                    <Button onClick={initMemoryGame} size="lg">
                      <Play className="w-4 h-4 mr-2" />
                      Start Game
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-3">
                    {memoryCards.map((card) => (
                      <motion.div
                        key={card.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => flipCard(card.id)}
                        className={cn(
                          "aspect-square rounded-lg flex items-center justify-center text-4xl cursor-pointer transition-all",
                          card.flipped || card.matched
                            ? "bg-white dark:bg-gray-800 border-2 border-primary"
                            : "bg-primary/20 hover:bg-primary/30"
                        )}
                      >
                        {card.flipped || card.matched ? card.emoji : "?"}
                      </motion.div>
                    ))}
                  </div>
                )}

                {memoryMatches === 8 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg"
                  >
                    <Trophy className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p className="font-semibold text-green-700 dark:text-green-400">
                      Congratulations! You matched all pairs in {memoryMoves} moves! 🎉
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default WellnessGames;
