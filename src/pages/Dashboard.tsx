import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate, useLocation } from "react-router-dom";
import WelcomeGreeting from "@/components/WelcomeGreeting";
import VoiceAssistant from "@/components/VoiceAssistant";
import { auth, db } from "@/firebase";
import { doc, getDoc, setDoc, collection, getDocs, query, orderBy, limit, onSnapshot, addDoc, updateDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { 
  Brain, 
  Heart, 
  TrendingUp, 
  Calendar, 
  Activity, 
  Sparkles, 
  Target, 
  User,
  Settings,
  LogOut,
  Plus,
  BarChart3,
  Smile,
  Frown,
  Meh,
  Bell,
  CheckCircle,
  Home,
  LineChart,
  BookOpen,
  Users,
  Award,
  ChevronLeft,
  ChevronRight,
  Music
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
  type: string;
}

interface Assessment {
  score: number;
  date: string;
  type: string;
  interpretation: string;
}

interface MoodEntry {
  date: string;
  mood: number;
  timestamp: string;
}

interface UserData {
  name: string;
  wellness_score: number;
  streak: number;
  last_login: string;
  assessments_count: number;
  weekly_progress: any[];
  moods: MoodEntry[];
}

const NotificationSystem = ({
  notifications,
  onMarkAsRead,
}: {
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Card className="shadow-medium border-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
          {unreadCount > 0 && (
            <Badge className="ml-2 bg-red-500">{unreadCount}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 ${
                    notification.read ? "bg-muted/30" : "bg-background"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onMarkAsRead(notification.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {notification.timestamp.toLocaleDateString()} •{" "}
                    {notification.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Sidebar = ({ 
  isCollapsed, 
  onToggle,
  currentPath 
}: { 
  isCollapsed: boolean;
  onToggle: () => void;
  currentPath: string;
}) => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: BarChart3, label: "Assessment Center", path: "/assessment-center" },
    { icon: LineChart, label: "Progress", path: "/progress" },
    { icon: BookOpen, label: "Resources", path: "/resources" },
    { icon: Users, label: "Community", path: "/community" },
    { icon: Award, label: "Achievements", path: "/achievements" },
  ];

  return (
    <div className={cn(
      "bg-background/95 backdrop-blur-md border-r border-primary/10 transition-all duration-300 flex-col hidden lg:flex",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-primary/10 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-2xl font-cursive font-bold text-gradient-primary cyber-font">
              Serenity
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            
            return (
              <Button
                key={item.path}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start transition-all duration-200",
                  isCollapsed ? "px-2" : "px-3",
                  isActive && "bg-primary/10 border border-primary/20"
                )}
                onClick={() => navigate(item.path)}
              >
                <Icon className={cn("w-4 h-4", isActive && "text-primary")} />
                {!isCollapsed && (
                  <span className={cn("ml-3", isActive && "font-semibold text-primary")}>
                    {item.label}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-primary/10">
        <div className={cn(
          "flex items-center space-x-3 transition-all duration-300",
          isCollapsed ? "justify-center" : "justify-start"
        )}>
          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Welcome back!</p>
              <p className="text-xs text-muted-foreground truncate">Ready to thrive</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [assessmentHistory, setAssessmentHistory] = useState<Assessment[]>([]);
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasCheckedWelcome, setHasCheckedWelcome] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Calculate streak based on consecutive login days
  const calculateStreak = (lastLogin: string | undefined): number => {
    if (!lastLogin) return 1;
    
    const lastLoginDate = new Date(lastLogin);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Reset time part for accurate day comparison
    lastLoginDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    
    if (lastLoginDate.getTime() === today.getTime()) {
      return 0; // Already logged in today
    } else if (lastLoginDate.getTime() === yesterday.getTime()) {
      return 1; // Consecutive login
    } else {
      return 1; // New streak starting
    }
  };

  // Calculate wellness score based on assessments
  const calculateWellnessScore = (assessments: Assessment[]): number => {
    if (assessments.length === 0) return 0;
    
    const totalScore = assessments.reduce((sum, assessment) => sum + assessment.score, 0);
    const averageScore = totalScore / assessments.length;
    
    // Convert to percentage (assuming score is out of 100)
    return Math.round(averageScore);
  };

  // Update weekly progress
  const updateWeeklyProgress = (currentProgress: any[]): any[] => {
    const today = new Date().toISOString().split('T')[0];
    const currentWeekProgress = currentProgress || [];
    
    // Check if today is already recorded
    if (!currentWeekProgress.includes(today)) {
      return [...currentWeekProgress, today].slice(-7); // Keep only last 7 days
    }
    
    return currentWeekProgress;
  };

  // Check if welcome should be shown - FIXED VERSION
  const shouldShowWelcome = (userData: UserData | null): boolean => {
    if (!userData) return false;
    
    // Check localStorage for today's welcome
    const today = new Date().toISOString().split('T')[0];
    const lastWelcomeDate = localStorage.getItem('lastWelcomeDate');
    
    // Show welcome if we haven't shown it today
    if (lastWelcomeDate !== today) {
      localStorage.setItem('lastWelcomeDate', today);
      return true;
    }
    
    return false;
  };

  useEffect(() => {
    // Check if user is logged in
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/auth");
        return;
      }

      try {
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch assessments from subcollection
        const assessmentsSnapshot = await getDocs(collection(db, "users", user.uid, "assessments"));
        const assessmentsList = assessmentsSnapshot.docs.map(doc => doc.data() as Assessment);
        setAssessmentHistory(Array.isArray(assessmentsList) ? assessmentsList : []);

        // Calculate wellness score from assessments
        const wellnessScore = calculateWellnessScore(assessmentsList);

        if (userDoc.exists()) {
          const existingData = userDoc.data();
          const lastLogin = existingData.last_login;
          
          // Calculate new streak
          const streakIncrement = calculateStreak(lastLogin);
          const newStreak = lastLogin ? (existingData.streak || 0) + streakIncrement : 1;
          
          // Update weekly progress
          const weeklyProgress = updateWeeklyProgress(existingData.weekly_progress);
          
          const updatedUserData: UserData = {
            name: existingData.name || user.displayName || "User",
            wellness_score: wellnessScore,
            streak: newStreak,
            last_login: today,
            assessments_count: assessmentsList.length,
            weekly_progress: weeklyProgress,
            moods: existingData.moods || [],
          };

          // Update user data in Firestore
          await setDoc(
            doc(db, "users", user.uid),
            updatedUserData,
            { merge: true }
          );

          setUserData(updatedUserData);

          // Show welcome greeting based on fixed logic
          if (!hasCheckedWelcome) {
            const shouldShow = shouldShowWelcome(updatedUserData);
            setShowWelcome(shouldShow);
            setHasCheckedWelcome(true);
          }

          // Show streak celebration if applicable
          if (streakIncrement > 0 && newStreak > 1) {
            toast({
              title: "Streak Updated!",
              description: `You're on a ${newStreak} day streak! Keep it up!`,
            });
          }
        } else {
          // New user, create initial data
          const initialUserData: UserData = {
            name: user.displayName || "User",
            wellness_score: wellnessScore,
            streak: 1,
            last_login: today,
            assessments_count: assessmentsList.length,
            weekly_progress: [today],
            moods: [],
          };

          await setDoc(doc(db, "users", user.uid), initialUserData);
          setUserData(initialUserData);

          // Show welcome for new users
          if (!hasCheckedWelcome) {
            setShowWelcome(true);
            setHasCheckedWelcome(true);
            localStorage.setItem('lastWelcomeDate', today);
          }

          toast({
            title: "Welcome to Serenity!",
            description: "Your wellness journey starts now!",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
      }
    });

    // Real-time notifications from Firebase
    const user = auth.currentUser;
    if (user) {
      const notificationsRef = collection(db, "users", user.uid, "notifications");
      const notificationsQuery = query(notificationsRef, orderBy("timestamp", "desc"), limit(10));
      
      const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
        const notifs = snapshot.docs.map((doc) => ({
          id: parseInt(doc.id) || Math.random(),
          title: doc.data().title,
          message: doc.data().message,
          read: doc.data().read || false,
          timestamp: doc.data().timestamp?.toDate() || new Date(),
          type: doc.data().type || "info",
        }));
        setNotifications(notifs);
      });

      return () => {
        unsubscribe();
        unsubscribeNotifications();
      };
    }

    return () => unsubscribe();
  }, [navigate, toast, hasCheckedWelcome]);

  const handleLogout = async () => {
    await auth.signOut();
    toast({
      title: "Logged out successfully",
      description: "Thank you for using Serenity. See you next time!",
    });
    navigate("/");
  };

  const handleMarkAsRead = async (id: number) => {
    const user = auth.currentUser;
    if (!user) return;
    
    try {
      // Update in Firebase
      const notificationRef = doc(db, "users", user.uid, "notifications", id.toString());
      await updateDoc(notificationRef, { read: true });
      
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMoodSelection = async (mood: number) => {
    setCurrentMood(mood);
    // Store mood entry in Firestore
    const user = auth.currentUser;
    if (!user) return;
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      const today = new Date().toISOString().split("T")[0];
      const newMood = {
        date: today,
        mood,
        timestamp: new Date().toISOString(),
      };
      const updatedMoods = [...(userData?.moods || []), newMood];
      await setDoc(
        doc(db, "users", user.uid),
        {
          moods: updatedMoods,
        },
        { merge: true }
      );
      setUserData((prev: any) => ({
        ...prev,
        moods: updatedMoods,
      }));
      toast({
        title: "Mood recorded!",
        description: "Thanks for sharing how you're feeling today.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record mood.",
        variant: "destructive",
      });
    }
  };

  const getMoodIcon = (mood: number) => {
    if (mood <= 2) return <Frown className="w-8 h-8" />;
    if (mood <= 3) return <Meh className="w-8 h-8" />;
    return <Smile className="w-8 h-8" />;
  };

  const getMoodLabel = (mood: number) => {
    const labels = ["Awful", "Bad", "Okay", "Good", "Excellent"];
    return labels[mood - 1] || "Unknown";
  };

  // Recent assessments (if any)
  const recentAssessments = assessmentHistory
    ? assessmentHistory.slice(-3).reverse()
    : [];

  // Mobile Bottom Navigation Component
  const BottomNav = () => {
    const navigate = useNavigate();
    const mobileMenuItems = [
      { icon: Home, label: "Home", path: "/dashboard" },
      { icon: BarChart3, label: "Assess", path: "/assessment-center" },
      { icon: LineChart, label: "Progress", path: "/progress" },
      { icon: Users, label: "Community", path: "/community" },
      { icon: User, label: "Profile", path: "/settings" },
    ];

    return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-primary/20 shadow-2xl">
        <div className="grid grid-cols-5 gap-1 px-2 py-2 safe-bottom">
          {mobileMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200",
                  isActive 
                    ? "bg-primary/15 text-primary" 
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 mb-1 transition-transform",
                  isActive && "scale-110"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  isActive && "font-semibold"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 cyber-grid flex pb-16 lg:pb-0">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentPath={location.pathname}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Welcome Greeting - Shows once per day */}
        {showWelcome && userData && (
          <WelcomeGreeting
            userName={userData.name}
            onDismiss={() => {
              setShowWelcome(false);
            }}
          />
        )}

        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
            {/* Header - Mobile Optimized */}
            <div className="mb-6 sm:mb-8">
              {/* Mobile Header */}
              <div className="lg:hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold">
                        Hi, <span className="text-primary font-cursive">{userData?.name || "User"}</span>!
                      </h1>
                      <p className="text-xs text-muted-foreground">
                        {userData?.streak > 0 ? `${userData.streak} day streak 🔥` : "Start your journey"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => navigate("/settings")}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Desktop Header */}
              <div className="hidden lg:flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">
                      Welcome back,{" "}
                      <span className="text-primary font-cursive">
                        {userData?.name || "User"}
                      </span>
                      !
                    </h1>
                    <p className="text-muted-foreground font-body">
                      {userData?.streak > 0
                        ? `You're on a ${userData.streak} day streak! Keep it up.`
                        : "Ready to start your wellness journey?"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/settings")}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
              {[
                { title: "Wellness Score", icon: Heart, value: `${userData?.wellness_score || 0}%`, subtitle: userData?.wellness_score >= 80 ? "Excellent!" : userData?.wellness_score >= 50 ? "Good progress" : "Keep working on it", color: "text-energy" },
                { title: "Current Streak", icon: Target, value: userData?.streak || 0, subtitle: "Days in a row", color: "text-focus" },
                { title: "Assessments", icon: Brain, value: assessmentHistory.length, subtitle: "Completed", color: "text-primary" },
                { title: "This Week", icon: TrendingUp, value: `+${Math.floor(Math.random() * 15) + 5}%`, subtitle: "Mood improvement", color: "text-wellness" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <Card className="shadow-medium border-primary/10 hover:shadow-glow transition-all duration-300 h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                      <CardTitle className="text-xs sm:text-sm font-medium">{stat.title}</CardTitle>
                      <stat.icon className={`w-3 h-3 sm:w-4 sm:h-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6 pt-0">
                      <motion.div 
                        className={`text-xl sm:text-2xl font-bold ${stat.color}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.2, type: "spring" }}
                      >
                        {stat.value}
                      </motion.div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{stat.subtitle}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Actions - Enhanced */}
                <Card className="shadow-medium border-primary/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>
                      Access your wellness tools instantly
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <Button
                        variant="outline"
                        className="h-24 flex-col gap-2 hover:bg-primary/10 hover:border-primary transition-all"
                        onClick={() => navigate("/ai-therapist")}
                      >
                        <Brain className="w-6 h-6 text-primary" />
                        <span className="text-xs font-medium">AI Therapist</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-24 flex-col gap-2 hover:bg-primary/10 hover:border-primary transition-all"
                        onClick={() => navigate("/mood-tracker")}
                      >
                        <Heart className="w-6 h-6 text-energy" />
                        <span className="text-xs font-medium">Mood Tracker</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-24 flex-col gap-2 hover:bg-primary/10 hover:border-primary transition-all"
                        onClick={() => navigate("/mindfulness")}
                      >
                        <Sparkles className="w-6 h-6 text-wellness" />
                        <span className="text-xs font-medium">Mindfulness</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-24 flex-col gap-2 hover:bg-primary/10 hover:border-primary transition-all"
                        onClick={() => navigate("/gamification")}
                      >
                        <Target className="w-6 h-6 text-focus" />
                        <span className="text-xs font-medium">Achievements</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-24 flex-col gap-2 hover:bg-primary/10 hover:border-primary transition-all"
                        onClick={() => navigate("/assessment-center")}
                      >
                        <BarChart3 className="w-6 h-6 text-primary" />
                        <span className="text-xs font-medium">Assessments</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-24 flex-col gap-2 hover:bg-green-500/10 hover:border-green-500 transition-all"
                        onClick={() => navigate("/wellness-games")}
                      >
                        <Target className="w-6 h-6 text-green-500" />
                        <span className="text-xs font-medium">Focus Games</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-24 flex-col gap-2 hover:bg-green-500/10 hover:border-green-500 transition-all bg-gradient-to-br from-black/5 to-green-500/5"
                        onClick={() => navigate("/spotify-wellness")}
                      >
                        <Music className="w-6 h-6 text-green-500" />
                        <span className="text-xs font-medium">Spotify Music</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-24 flex-col gap-2 hover:bg-red-500/10 hover:border-red-500 transition-all"
                        onClick={() => navigate("/emergency-help")}
                      >
                        <Heart className="w-6 h-6 text-red-500" />
                        <span className="text-xs font-medium">Need Help?</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Daily Mood Check */}
                <Card className="shadow-medium border-primary/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-energy" />
                      Daily Mood Check
                    </CardTitle>
                    <CardDescription>How are you feeling today?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-5 gap-4 mb-6">
                      {[1, 2, 3, 4, 5].map((mood) => (
                        <button
                          key={mood}
                          onClick={() => handleMoodSelection(mood)}
                          className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                            currentMood === mood
                              ? "border-primary bg-primary/10 shadow-glow"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <div
                              className={
                                mood <= 2
                                  ? "text-destructive"
                                  : mood <= 3
                                  ? "text-energy"
                                  : "text-wellness"
                              }
                            >
                              {getMoodIcon(mood)}
                            </div>
                            <span className="text-xs font-medium">
                              {getMoodLabel(mood)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {currentMood && (
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Thanks for sharing! You selected:{" "}
                          <strong>{getMoodLabel(currentMood)}</strong>
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Assessments */}
                <Card className="shadow-medium border-primary/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-focus" />
                      Recent Assessments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentAssessments.length === 0 ? (
                      <div className="text-center py-8">
                        <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          No assessments completed yet
                        </p>
                        <Button
                          className="mt-4"
                          onClick={() => navigate("/assessment-center")}
                        >
                          Take Your First Assessment
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentAssessments.map((assessment, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div>
                              <h4 className="font-medium">
                                {assessment.type?.toUpperCase() || "Assessment"}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(assessment.date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                Score: {assessment.score}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {assessment.interpretation}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <NotificationSystem
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                />

                {/* Progress Overview */}
                <Card className="shadow-medium border-primary/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-wellness" />
                      Progress Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Weekly Goal</span>
                        <span className="text-sm text-muted-foreground">
                          {userData?.weekly_progress
                            ? `${userData.weekly_progress.length}/7 days`
                            : "0/7 days"}
                        </span>
                      </div>
                      <Progress
                        value={
                          userData?.weekly_progress
                            ? (userData.weekly_progress.length / 7) * 100
                            : 0
                        }
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Wellness Score</span>
                        <span className="text-sm text-muted-foreground">
                          {userData?.wellness_score || 0}%
                        </span>
                      </div>
                      <Progress
                        value={userData?.wellness_score || 0}
                        className="h-2"
                      />
                    </div>

                    <div className="pt-4">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate("/progress")}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        View Full Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      <VoiceAssistant />
      
      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Dashboard;