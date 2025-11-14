import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import {
  ArrowLeft, Play, Pause, RotateCcw, TreePine, Sparkles, Award, Target, Clock,
  Leaf, Flower2, Trees, Brain, Heart, Zap, Trophy, Star, Smile, Cloud, Home,
  Gamepad2, Crown, Shield, Flame, Gem, Rocket, Cpu, Wifi
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import MobileBottomNav from "@/components/MobileBottomNav";
import { motion, AnimatePresence } from "framer-motion";

type GameType = "menu" | "forest" | "memory" | "breathing" | "gratitude" | "whack";

interface GameLevel {
  level: number;
  xp: number;
  xpToNext: number;
  totalXp: number;
  prestige: number;
}

interface GameStats {
  forestMinutes: number;
  treesPlanted: number;
  memoryHighScore: number;
  breathingSessions: number;
  gratitudeCount: number;
  whackScore: number;
  totalPoints: number;
  // Level system for each game
  forestLevel: GameLevel;
  memoryLevel: GameLevel;
  breathingLevel: GameLevel;
  gratitudeLevel: GameLevel;
  whackLevel: GameLevel;
  // Global player stats
  playerLevel: number;
  playerXp: number;
  totalGamesPlayed: number;
  achievements: string[];
  lastPlayed: string;
}

const WellnessGames = () => {
  const [currentGame, setCurrentGame] = useState<GameType>("menu");
  const [stats, setStats] = useState<GameStats>({
    forestMinutes: 0, treesPlanted: 0, memoryHighScore: 0,
    breathingSessions: 0, gratitudeCount: 0, whackScore: 0, totalPoints: 0,
    forestLevel: { level: 1, xp: 0, xpToNext: 100, totalXp: 0, prestige: 0 },
    memoryLevel: { level: 1, xp: 0, xpToNext: 100, totalXp: 0, prestige: 0 },
    breathingLevel: { level: 1, xp: 0, xpToNext: 100, totalXp: 0, prestige: 0 },
    gratitudeLevel: { level: 1, xp: 0, xpToNext: 100, totalXp: 0, prestige: 0 },
    whackLevel: { level: 1, xp: 0, xpToNext: 100, totalXp: 0, prestige: 0 },
    playerLevel: 1, playerXp: 0, totalGamesPlayed: 0, achievements: [], lastPlayed: ""
  });
  const [instructionGame, setInstructionGame] = useState<any | null>(null);

  // Forest Game
  const [forestDuration, setForestDuration] = useState(25);
  const [forestTime, setForestTime] = useState(25 * 60);
  const [forestActive, setForestActive] = useState(false);
  const [treeStage, setTreeStage] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Memory Game
  const [memoryCards, setMemoryCards] = useState<Array<{id: number; emoji: string; flipped: boolean; matched: boolean}>>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);

  // Breathing Game
  const [breathPhase, setBreathPhase] = useState<"in"|"hold"|"out"|"rest">("in");
  const [breathActive, setBreathActive] = useState(false);
  const [breathCount, setBreathCount] = useState(0);

  // Gratitude Game
  const [gratitudeList, setGratitudeList] = useState<string[]>([]);
  const [gratitudeInput, setGratitudeInput] = useState("");

  // Whack-a-Stress
  const [whackMoles, setWhackMoles] = useState<boolean[]>(Array(9).fill(false));
  const [whackScore, setWhackScore] = useState(0);
  const [whackActive, setWhackActive] = useState(false);
  const [whackTime, setWhackTime] = useState(30);

  const navigate = useNavigate();
  const { toast } = useToast();

  // Firebase Storage Functions
  const saveStatsToFirebase = async (newStats: GameStats) => {
    const user = auth.currentUser;
    if (!user) return;
    
    try {
      await updateDoc(doc(db, "users", user.uid), {
        game_scores: newStats
      });
    } catch (e) { 
      console.error("Error saving stats:", e); 
    }
  };

  // Level System Functions
  const calculateLevel = (totalXp: number): { level: number; xp: number; xpToNext: number } => {
    let level = 1;
    let xpForCurrentLevel = 0;
    let xpForNextLevel = 100;
    
    while (totalXp >= xpForNextLevel) {
      xpForCurrentLevel = xpForNextLevel;
      level++;
      xpForNextLevel = Math.floor(100 * Math.pow(1.5, level - 1));
    }
    
    return {
      level,
      xp: totalXp - xpForCurrentLevel,
      xpToNext: xpForNextLevel - xpForCurrentLevel
    };
  };

  const addXpToGame = useCallback((gameType: keyof GameStats, xpAmount: number) => {
    setStats(prevStats => {
      const gameLevel = prevStats[gameType] as GameLevel;
      const newTotalXp = gameLevel.totalXp + xpAmount;
      const levelData = calculateLevel(newTotalXp);
      
      const updatedGameLevel: GameLevel = {
        ...gameLevel,
        totalXp: newTotalXp,
        level: levelData.level,
        xp: levelData.xp,
        xpToNext: levelData.xpToNext
      };

      // Check for level up
      if (levelData.level > gameLevel.level) {
        toast({
          title: `🎉 Level Up!`,
          description: `${gameType.replace('Level', '')} is now level ${levelData.level}!`,
        });
      }

      const newStats = {
        ...prevStats,
        [gameType]: updatedGameLevel,
        playerXp: prevStats.playerXp + xpAmount,
        totalGamesPlayed: prevStats.totalGamesPlayed + 1,
        lastPlayed: new Date().toISOString()
      };

      // Save to Firebase
      saveStatsToFirebase(newStats);
      return newStats;
    });
  }, [toast]);

  const games: any[] = [
    { 
      id: "forest", title: "Focus Forest 🌳", desc: "Grow trees by staying focused", icon: TreePine, color: "from-green-400 to-emerald-600", points: stats.forestMinutes,
      instructions: "Select a duration (15-60 mins). Click 'Start Focus' and a tree will grow. If you leave the page, the tree dies. Complete the session to plant the tree and earn points."
    },
    { 
      id: "memory", title: "Memory Match 🎴", desc: "Match pairs & boost memory", icon: Brain, color: "from-purple-400 to-pink-600", points: stats.memoryHighScore,
      instructions: "Click on cards to reveal them. Find all matching pairs to complete the game. The fewer moves you make, the higher your score!"
    },
    { 
      id: "breathing", title: "Calm Bubbles 🫧", desc: "Breathe with floating bubbles", icon: Cloud, color: "from-blue-400 to-cyan-600", points: stats.breathingSessions,
      instructions: "Click 'Start Breathing' and follow the on-screen guide. Breathe in as the bubble grows, hold, and breathe out as it shrinks. Complete 5 cycles to feel calmer."
    },
    { 
      id: "gratitude", title: "Gratitude Garden 🌸", desc: "Plant flowers of gratitude", icon: Flower2, color: "from-pink-400 to-rose-600", points: stats.gratitudeCount,
      instructions: "Type something you're grateful for in the input box and press the flower button. Each entry plants a flower in your garden, helping you cultivate positivity."
    },
    { 
      id: "whack", title: "Whack-a-Stress 🎯", desc: "Smash away your worries!", icon: Zap, color: "from-orange-400 to-red-600", points: stats.whackScore,
      instructions: "When the game starts, anxious faces (😰) will pop up. Click them as fast as you can to score points before the 30-second timer runs out. Avoid the calm faces (💤)!"
    }
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      console.log("Fetching game stats for user:", user.uid);
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        const userData = docSnap.data();
        console.log("User data:", userData);
        if (userData.game_scores) {
          console.log("Found game_scores:", userData.game_scores);
          setStats(prevStats => ({ ...prevStats, ...userData.game_scores }));
        } else {
          console.log("No game_scores found, using default stats");
        }
      } else {
        console.log("User document doesn't exist");
      }
    } catch (e) { 
      console.error("Error fetching stats:", e); 
    }
  };

  useEffect(() => {
    if (forestActive) {
      timerRef.current = setInterval(() => {
        setForestTime(prev => {
          if (prev <= 1) {
            completeForest();
            return 0;
          }
          const progress = ((forestDuration * 60 - prev) / (forestDuration * 60)) * 100;
          setTreeStage(Math.min(5, Math.floor(progress / 20)));
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [forestActive]);

  const updateStats = async (updates: Partial<GameStats>) => {
    const user = auth.currentUser;
    if (!user) return;
    
    // Use a functional update to ensure we have the latest state
    const newStats = await new Promise<GameStats>(resolve => {
      setStats(prevStats => {
        const updated = { ...prevStats, ...updates };
        resolve(updated);
        return updated;
      });
    });

    try {
      console.log("Saving game stats:", newStats);
      // Save to the same location where fetchStats reads from
      await updateDoc(doc(db, "users", user.uid), {
        game_scores: newStats
      });
      console.log("Game stats saved successfully");
      toast({
        title: "Progress Saved",
        description: "Your wellness progress has been saved.",
      });
    } catch (e) { 
      console.error("Error saving stats:", e);
      toast({
        title: "Save Failed",
        description: "Failed to save progress. Please try again.",
        variant: "destructive"
      });
    }
  };

  const completeForest = async () => {
    setForestActive(false);
    const mins = forestDuration;
    
    // Update stats with new forest completion
    await updateStats({
      forestMinutes: stats.forestMinutes + mins,
      treesPlanted: stats.treesPlanted + 1,
      totalPoints: stats.totalPoints + mins * 2
    });
    
    toast({ title: "🌳 Tree Planted!", description: `+${mins * 2} points!` });
  };

  const startMemory = () => {
    const emojis = ["🎮","🎯","🎨","🎭","🎪","🎸","🎺","🎻"];
    const cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5)
      .map((emoji, id) => ({ id, emoji, flipped: false, matched: false }));
    setMemoryCards(cards);
    setMemoryMoves(0);
    setFlippedIndices([]);
  };

  const flipMemoryCard = (idx: number) => {
    if (flippedIndices.length === 2 || memoryCards[idx].matched || memoryCards[idx].flipped) return;
    const newCards = [...memoryCards];
    newCards[idx].flipped = true;
    setMemoryCards(newCards);
    const newFlipped = [...flippedIndices, idx];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMemoryMoves(memoryMoves + 1);
      const [a, b] = newFlipped;
      if (memoryCards[a].emoji === memoryCards[b].emoji) {
        setTimeout(() => {
          const matched = [...memoryCards];
          matched[a].matched = matched[b].matched = true;
          setMemoryCards(matched);
          setFlippedIndices([]);
          if (matched.filter(c => c.matched).length === 16) {
            const score = Math.max(100 - memoryMoves * 5, 10);
            updateStats({ memoryHighScore: Math.max(stats.memoryHighScore, score), totalPoints: stats.totalPoints + score });
            toast({ title: "🎉 Perfect Match!", description: `+${score} points!` });
          }
        }, 500);
      } else {
        setTimeout(() => {
          const reset = [...memoryCards];
          reset[a].flipped = reset[b].flipped = false;
          setMemoryCards(reset);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  const startBreathing = () => {
    setBreathActive(true);
    setBreathCount(0);
    const phases = [{p:"in",d:4000},{p:"hold",d:4000},{p:"out",d:4000},{p:"rest",d:2000}];
    let idx = 0, cycles = 0;
    const run = () => {
      if (cycles >= 5) {
        setBreathActive(false);
        updateStats({ breathingSessions: stats.breathingSessions + 1, totalPoints: stats.totalPoints + 20 });
        toast({ title: "🫧 Breathing Complete!", description: "+20 points!" });
        return;
      }
      setBreathPhase(phases[idx].p as any);
      setTimeout(() => {
        idx++;
        if (idx >= 4) { idx = 0; cycles++; setBreathCount(cycles); }
        if (cycles < 5) run();
      }, phases[idx].d);
    };
    run();
  };

  const addGratitude = () => {
    if (!gratitudeInput.trim()) return;
    setGratitudeList([...gratitudeList, gratitudeInput]);
    setGratitudeInput("");
    updateStats({ gratitudeCount: stats.gratitudeCount + 1, totalPoints: stats.totalPoints + 10 });
    toast({ title: "🌸 Flower Planted!", description: "+10 points!" });
  };

  const startWhack = () => {
    setWhackScore(0);
    setWhackTime(30);
    setWhackActive(true);

    const interval = setInterval(() => {
      setWhackTime(t => {
        if (t <= 1) {
          clearInterval(interval);
          setWhackActive(false);
          // Use functional update to get the latest score
          setWhackScore(currentScore => {
            updateStats({ whackScore: Math.max(stats.whackScore, currentScore), totalPoints: stats.totalPoints + currentScore });
            toast({ title: "🎯 Game Over!", description: `Score: ${currentScore}` });
            return currentScore;
          });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (whackActive) {
      const moleInterval = setInterval(() => {
        const idx = Math.floor(Math.random() * 9);
        setWhackMoles(m => { const n = [...m]; n[idx] = true; return n; });
        setTimeout(() => setWhackMoles(m => { const n = [...m]; n[idx] = false; return n; }), 800);
      }, 1200);
      return () => clearInterval(moleInterval);
    }
  }, [whackActive]);

  const whackMole = (idx: number) => {
    if (!whackMoles[idx]) return;
    setWhackScore(s => s + 10);
    setWhackMoles(m => { const n = [...m]; n[idx] = false; return n; });
  };

  const handlePlayClick = (game: any) => {
    setInstructionGame(game);
  };

  const startGame = (gameId: GameType) => {
    setInstructionGame(null);
    setCurrentGame(gameId);
    if (gameId === "memory") startMemory();
  };

  if (currentGame === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900 pb-16 lg:pb-0">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
            <div className="flex items-center gap-2">
              <Badge className="text-lg px-4 py-2"><Trophy className="w-5 h-5 mr-2" />{stats.totalPoints} Points</Badge>
              {/* Debug buttons - remove these after testing */}
              <Button size="sm" variant="outline" onClick={fetchStats}>🔄 Load</Button>
              <Button size="sm" variant="outline" onClick={() => updateStats({totalPoints: stats.totalPoints + 10})}>💾 Test Save</Button>
            </div>
          </div>

          <motion.div initial={{y:-20,opacity:0}} animate={{y:0,opacity:1}} className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              🎮 Wellness Arcade
            </h1>
            <p className="text-lg text-muted-foreground">Choose your game & boost your mental health!</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {games.map((game, i) => {
              const Icon = game.icon;
              return (
                <motion.div key={game.id} initial={{scale:0,rotate:-10}} animate={{scale:1,rotate:0}} transition={{delay:i*0.1}}>
                  <Card className="cursor-pointer hover:scale-105 transition-all hover:shadow-2xl border-2 hover:border-primary" onClick={() => handlePlayClick(game)}>
                    <CardHeader className={`bg-gradient-to-br ${game.color} text-white rounded-t-lg`}>
                      <div className="flex items-center justify-between">
                        <Icon className="w-12 h-12" />
                        <Badge variant="secondary" className="text-lg">{game.points}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <CardTitle className="text-xl mb-2">{game.title}</CardTitle>
                      <CardDescription className="text-base">{game.desc}</CardDescription>
                      <Button className="w-full mt-4" size="lg" onClick={() => handlePlayClick(game)}><Play className="w-4 h-4 mr-2" />Play Now</Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {instructionGame && (
          <Dialog open onOpenChange={() => setInstructionGame(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                  <instructionGame.icon className="w-6 h-6" />
                  {instructionGame.title}
                </DialogTitle>
                <DialogDescription className="pt-4 text-base">
                  {instructionGame.instructions}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={() => startGame(instructionGame.id)}>Start Game</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        <MobileBottomNav />
      </div>
    );
  }

  // Individual game screens would go here - I'll create a compact version
  const GameHeader = ({title, onBack}: {title: string; onBack: () => void}) => (
    <div className="flex items-center justify-between mb-6">
      <Button variant="ghost" onClick={onBack}><Home className="w-4 h-4 mr-2" />Menu</Button>
      <h2 className="text-2xl font-bold">{title}</h2>
      <Badge className="text-lg"><Trophy className="w-4 h-4 mr-1" />{stats.totalPoints}</Badge>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-16 lg:pb-0">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-4xl">
        <GameHeader title={games.find(g=>g.id===currentGame)?.title || ""} onBack={() => setCurrentGame("menu")} />
        
        {currentGame === "forest" && (
          <Card className="p-6">
            <div className="text-center space-y-6">
              <div className="text-9xl">{["🌱","🌿","🪴","🌳","🌲","🌴"][treeStage]}</div>
              <div className="text-6xl font-mono font-bold">{Math.floor(forestTime/60)}:{(forestTime%60).toString().padStart(2,'0')}</div>
              <Progress value={((forestDuration*60-forestTime)/(forestDuration*60))*100} className="h-4" />
              <div className="flex gap-3 justify-center flex-wrap">
                {[15,25,45,60].map(d => (
                  <Button key={d} variant={forestDuration===d?"default":"outline"} onClick={()=>{setForestDuration(d);setForestTime(d*60);}}>{d}min</Button>
                ))}
              </div>
              <Button size="lg" onClick={()=>setForestActive(!forestActive)} className="w-full">
                {forestActive?<Pause className="w-5 h-5 mr-2"/>:<Play className="w-5 h-5 mr-2"/>}
                {forestActive?"Pause":"Start Focus"}
              </Button>
            </div>
          </Card>
        )}

        {currentGame === "memory" && (
          <Card className="p-6">
            <div className="mb-4 flex justify-between"><span>Moves: {memoryMoves}</span><Button onClick={startMemory} size="sm"><RotateCcw className="w-4 h-4" /></Button></div>
            <div className="grid grid-cols-4 gap-3">
              {memoryCards.map((card,i) => (
                <motion.div key={i} whileTap={{scale:0.9}} onClick={()=>flipMemoryCard(i)}
                  className={cn("aspect-square rounded-xl flex items-center justify-center text-4xl cursor-pointer transition-all",
                    card.flipped||card.matched?"bg-white dark:bg-gray-800 border-4 border-primary":"bg-gradient-to-br from-purple-400 to-pink-400")}>
                  {card.flipped||card.matched?card.emoji:"?"}
                </motion.div>
              ))}
            </div>
          </Card>
        )}

        {currentGame === "breathing" && (
          <Card className="p-6">
            <div className="text-center space-y-6">
              <motion.div animate={{scale:breathPhase==="in"?1.5:breathPhase==="out"?0.7:1}} transition={{duration:breathPhase==="rest"?2:4}}
                className={cn("w-64 h-64 mx-auto rounded-full flex items-center justify-center text-white text-3xl font-bold",
                  breathPhase==="in"?"bg-blue-500":breathPhase==="hold"?"bg-purple-500":breathPhase==="out"?"bg-green-500":"bg-gray-400")}>
                {breathPhase==="in"?"Breathe In":breathPhase==="hold"?"Hold":breathPhase==="out"?"Breathe Out":"Rest"}
              </motion.div>
              <div className="flex gap-2 justify-center">{[...Array(5)].map((_,i)=><div key={i} className={cn("w-4 h-4 rounded-full",i<breathCount?"bg-blue-500":"bg-gray-300")}/>)}</div>
              <Button size="lg" onClick={startBreathing} disabled={breathActive} className="w-full"><Play className="w-5 h-5 mr-2" />Start Breathing</Button>
            </div>
          </Card>
        )}

        {currentGame === "gratitude" && (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex gap-2">
                <input value={gratitudeInput} onChange={e=>setGratitudeInput(e.target.value)} onKeyPress={e=>e.key==="Enter"&&addGratitude()}
                  placeholder="I'm grateful for..." className="flex-1 px-4 py-3 border-2 rounded-lg text-lg" />
                <Button onClick={addGratitude} size="lg"><Flower2 className="w-5 h-5" /></Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <AnimatePresence>
                  {gratitudeList.map((item,i) => (
                    <motion.div key={i} initial={{scale:0,rotate:-20}} animate={{scale:1,rotate:0}} exit={{scale:0}}
                      className="p-4 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-950 dark:to-rose-950 rounded-xl text-center">
                      <div className="text-4xl mb-2">🌸</div>
                      <p className="text-sm font-medium">{item}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </Card>
        )}

        {currentGame === "whack" && (
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex justify-between text-xl font-bold">
                <span>Score: {whackScore}</span>
                <span>Time: {whackTime}s</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {whackMoles.map((active,i) => (
                  <motion.div key={i} whileTap={{scale:0.8}} onClick={()=>whackMole(i)}
                    className={cn("aspect-square rounded-2xl flex items-center justify-center text-6xl cursor-pointer transition-all",
                      active?"bg-gradient-to-br from-red-400 to-orange-400":"bg-gray-200 dark:bg-gray-800")}>
                    {active?"😰":"💤"}
                  </motion.div>
                ))}
              </div>
              <Button size="lg" onClick={startWhack} disabled={whackActive} className="w-full"><Zap className="w-5 h-5 mr-2" />Start Game</Button>
            </div>
          </Card>
        )}
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default WellnessGames;
