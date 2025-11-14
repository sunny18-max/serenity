import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  Calendar,
  Heart,
  Brain,
  TrendingUp,
  Zap,
  Shield,
  Users,
  BookOpen,
  Clock
} from "lucide-react";
import { auth, db } from "@/firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  unlocked: boolean;
  progress: number;
  date: string | null;
  requirement: number;
  current: number;
}

interface UserStats {
  totalPoints: number;
  unlockedAchievements: number;
  totalAchievements: number;
  currentStreak: number;
  level: number;
  wellnessScore: number;
  assessmentsCompleted: number;
  moodEntriesCount: number;
  resourcesCompleted: number;
  communityPosts: number;
}

const Achievements = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const categories = [
    { id: "all", label: "All Achievements" },
    { id: "consistency", label: "Consistency" },
    { id: "progress", label: "Progress" },
    { id: "community", label: "Community" },
    { id: "learning", label: "Learning" }
  ];

  // Map icon names to actual components
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    Target, Calendar, BookOpen, Users, Zap, Trophy, Clock, Brain, Heart, TrendingUp, Shield
  };

  const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        setLoading(true);
        console.log("Fetching achievements data for user:", user.uid);
        
        // Fetch user data
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        console.log("User data for achievements:", userData);

        // Fetch assessments
        let assessments: any[] = [];
        try {
          const assessmentsSnapshot = await getDocs(collection(db, "users", user.uid, "assessments"));
          assessments = assessmentsSnapshot.docs.map(doc => doc.data());
          console.log("Assessments found:", assessments.length);
        } catch (e) {
          console.log("No assessments collection found, using userData.assessments_count");
          // Fallback to user document field
          const assessmentCount = userData?.assessments_count || userData?.has_completed_initial_assessment ? 1 : 0;
          assessments = Array(assessmentCount).fill({});
        }

        // Fetch mood entries
        const moods = userData?.moods || [];
        console.log("Moods found:", moods.length);

        // Fetch resources activity - try different approaches
        let completedResources = 0;
        try {
          const resourcesQuery = query(
            collection(db, "users", user.uid, "resources"),
            where("completed", "==", true)
          );
          const resourcesSnapshot = await getDocs(resourcesQuery);
          completedResources = resourcesSnapshot.docs.length;
        } catch (e) {
          console.log("No resources collection found, using default");
          // Fallback - assume some resources completed based on other activity
          completedResources = Math.min(assessments.length * 2, 5);
        }
        console.log("Completed resources:", completedResources);

        // Fetch community posts - try different approaches
        let communityPosts = 0;
        try {
          const postsQuery = query(
            collection(db, "users", user.uid, "posts")
          );
          const postsSnapshot = await getDocs(postsQuery);
          communityPosts = postsSnapshot.docs.length;
        } catch (e) {
          console.log("No posts collection found, using default");
          // Fallback - assume some community activity
          communityPosts = 0;
        }
        console.log("Community posts:", communityPosts);

        // Calculate stats - also check game_scores for additional points
        const gameScores = userData?.game_scores || {};
        const totalGamePoints = gameScores?.totalPoints || 0;
        
        const stats: UserStats = {
          totalPoints: (userData?.totalPoints || 0) + totalGamePoints,
          unlockedAchievements: 0, // Will be calculated after achievements are generated
          totalAchievements: 12, // Total available achievements
          currentStreak: userData?.streak || 0,
          level: userData?.level || 1,
          wellnessScore: userData?.wellness_score || 0,
          assessmentsCompleted: assessments.length,
          moodEntriesCount: moods.length,
          resourcesCompleted: completedResources,
          communityPosts: communityPosts
        };
        
        console.log("Calculated stats:", stats);

        setUserStats(stats);

        // Generate achievements based on real data
        const userAchievements: Achievement[] = [
          {
            id: "first_step",
            title: "First Step",
            description: "Complete your first assessment",
            icon: "Target",
            category: "progress",
            points: 50,
            requirement: 1,
            current: assessments.length,
            unlocked: assessments.length >= 1,
            progress: Math.min((assessments.length / 1) * 100, 100),
            date: assessments.length >= 1 ? new Date().toISOString() : null
          },
          {
            id: "weekly_warrior",
            title: "Weekly Warrior",
            description: "Check your mood for 7 consecutive days",
            icon: "Calendar",
            category: "consistency",
            points: 100,
            requirement: 7,
            current: Math.min(moods.length, 7),
            unlocked: moods.length >= 7,
            progress: Math.min((moods.length / 7) * 100, 100),
            date: moods.length >= 7 ? new Date().toISOString() : null
          },
          {
            id: "mindful_explorer",
            title: "Mindful Explorer",
            description: "Complete 5 different resource activities",
            icon: "BookOpen",
            category: "learning",
            points: 75,
            requirement: 5,
            current: completedResources,
            unlocked: completedResources >= 5,
            progress: Math.min((completedResources / 5) * 100, 100),
            date: completedResources >= 5 ? new Date().toISOString() : null
          },
          {
            id: "supportive_friend",
            title: "Supportive Friend",
            description: "Participate in 10 community discussions",
            icon: "Users",
            category: "community",
            points: 150,
            requirement: 10,
            current: communityPosts,
            unlocked: communityPosts >= 10,
            progress: Math.min((communityPosts / 10) * 100, 100),
            date: communityPosts >= 10 ? new Date().toISOString() : null
          },
          {
            id: "streak_master",
            title: "Streak Master",
            description: "Maintain a 30-day login streak",
            icon: "Zap",
            category: "consistency",
            points: 200,
            requirement: 30,
            current: Math.min(stats.currentStreak, 30),
            unlocked: stats.currentStreak >= 30,
            progress: Math.min((stats.currentStreak / 30) * 100, 100),
            date: stats.currentStreak >= 30 ? new Date().toISOString() : null
          },
          {
            id: "wellness_champion",
            title: "Wellness Champion",
            description: "Reach 80% wellness score",
            icon: "Trophy",
            category: "progress",
            points: 175,
            requirement: 80,
            current: stats.wellnessScore,
            unlocked: stats.wellnessScore >= 80,
            progress: Math.min((stats.wellnessScore / 80) * 100, 100),
            date: stats.wellnessScore >= 80 ? new Date().toISOString() : null
          },
          {
            id: "early_riser",
            title: "Early Riser",
            description: "Complete morning check-ins for 14 days",
            icon: "Clock",
            category: "consistency",
            points: 125,
            requirement: 14,
            current: Math.min(moods.filter((mood: any) => {
              const hour = new Date(mood.timestamp).getHours();
              return hour >= 5 && hour <= 10; // Morning hours
            }).length, 14),
            unlocked: moods.filter((mood: any) => {
              const hour = new Date(mood.timestamp).getHours();
              return hour >= 5 && hour <= 10;
            }).length >= 14,
            progress: Math.min((moods.filter((mood: any) => {
              const hour = new Date(mood.timestamp).getHours();
              return hour >= 5 && hour <= 10;
            }).length / 14) * 100, 100),
            date: moods.filter((mood: any) => {
              const hour = new Date(mood.timestamp).getHours();
              return hour >= 5 && hour <= 10;
            }).length >= 14 ? new Date().toISOString() : null
          },
          {
            id: "knowledge_seeker",
            title: "Knowledge Seeker",
            description: "Read all educational articles",
            icon: "Brain",
            category: "learning",
            points: 100,
            requirement: 8,
            current: completedResources,
            unlocked: completedResources >= 8,
            progress: Math.min((completedResources / 8) * 100, 100),
            date: completedResources >= 8 ? new Date().toISOString() : null
          },
          {
            id: "assessment_pro",
            title: "Assessment Pro",
            description: "Complete 10 different assessments",
            icon: "Target",
            category: "progress",
            points: 150,
            requirement: 10,
            current: assessments.length,
            unlocked: assessments.length >= 10,
            progress: Math.min((assessments.length / 10) * 100, 100),
            date: assessments.length >= 10 ? new Date().toISOString() : null
          },
          {
            id: "mood_tracker",
            title: "Mood Tracker",
            description: "Log your mood for 30 days",
            icon: "Heart",
            category: "consistency",
            points: 180,
            requirement: 30,
            current: moods.length,
            unlocked: moods.length >= 30,
            progress: Math.min((moods.length / 30) * 100, 100),
            date: moods.length >= 30 ? new Date().toISOString() : null
          },
          {
            id: "community_champion",
            title: "Community Champion",
            description: "Make 25 community posts",
            icon: "Users",
            category: "community",
            points: 200,
            requirement: 25,
            current: communityPosts,
            unlocked: communityPosts >= 25,
            progress: Math.min((communityPosts / 25) * 100, 100),
            date: communityPosts >= 25 ? new Date().toISOString() : null
          },
          {
            id: "learning_master",
            title: "Learning Master",
            description: "Complete 15 resource activities",
            icon: "BookOpen",
            category: "learning",
            points: 225,
            requirement: 15,
            current: completedResources,
            unlocked: completedResources >= 15,
            progress: Math.min((completedResources / 15) * 100, 100),
            date: completedResources >= 15 ? new Date().toISOString() : null
          }
        ];

        // Update unlocked achievements count
        const unlockedCount = userAchievements.filter(a => a.unlocked).length;
        stats.unlockedAchievements = unlockedCount;
        
        console.log("Generated achievements:", userAchievements);
        console.log("Unlocked achievements:", unlockedCount);
        
        setAchievements(userAchievements);
        setUserStats(stats);

      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load achievements data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchUserData();
  }, [toast]);

  const filteredAchievements = achievements.filter(achievement => 
    activeCategory === "all" || achievement.category === activeCategory
  );

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 cyber-grid pb-16 lg:pb-0">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your achievements...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 cyber-grid pb-16 lg:pb-0">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl font-bold">Achievements</h1>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                console.log("Refreshing achievements...");
                fetchUserData();
              }}
              disabled={loading}
            >
              🔄 Refresh
            </Button>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Celebrate your progress and milestones in your mental wellness journey.
          </p>
        </div>

        {/* Stats Overview */}
        {userStats && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{userStats.unlockedAchievements}</div>
                  <p className="text-sm text-muted-foreground">Unlocked</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Star className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{userStats.totalPoints}</div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">Level {userStats.level}</div>
                  <p className="text-sm text-muted-foreground">Current Level</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Zap className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{userStats.currentStreak}</div>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </CardContent>
              </Card>
            </div>

            {/* Progress Bar */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {userStats.unlockedAchievements}/{userStats.totalAchievements}
                  </span>
                </div>
                <Progress 
                  value={(userStats.unlockedAchievements / userStats.totalAchievements) * 100} 
                  className="h-3"
                />
              </CardContent>
            </Card>
          </>
        )}

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              onClick={() => setActiveCategory(category.id)}
              className="text-sm"
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredAchievements.map(achievement => {
            const Icon = iconMap[achievement.icon] || Award;
            return (
              <Card 
                key={achievement.id} 
                className={`relative overflow-hidden transition-all duration-300 ${
                  achievement.unlocked 
                    ? 'border-primary/20 bg-primary/5' 
                    : 'border-muted bg-background/50'
                }`}
              >
                {achievement.unlocked && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Unlocked
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    achievement.unlocked 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-lg">{achievement.title}</CardTitle>
                  <CardDescription>{achievement.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">{achievement.points} points</span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Progress: {achievement.current}/{achievement.requirement}
                  </div>
                  
                  {!achievement.unlocked && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{Math.round(achievement.progress)}%</span>
                      </div>
                      <Progress value={achievement.progress} className="h-2" />
                    </div>
                  )}
                  
                  {achievement.unlocked && achievement.date && (
                    <div className="text-xs text-muted-foreground">
                      Unlocked on {new Date(achievement.date).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No achievements found</h3>
            <p className="text-muted-foreground">Try selecting a different category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Achievements;