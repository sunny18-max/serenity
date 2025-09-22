import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import WelcomeGreeting from "@/components/WelcomeGreeting";
import VoiceAssistant from "@/components/VoiceAssistant";
import { auth, db } from "@/firebase";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
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
  CheckCircle
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
  type: string;
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

const Dashboard = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [assessmentHistory, setAssessmentHistory] = useState<any[]>([]);
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/auth");
        return;
      }
      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setUserData({ ...userDoc.data(), name: userDoc.data().name || user.displayName || "User" });
      } else {
        // New user, show empty stats
        setUserData({
          name: user.displayName || "User",
          wellness_score: 0,
          streak: 0,
          assessments_count: 0,
          weekly_progress: [],
          moods: [],
        });
      }

      // Fetch assessments from subcollection
      const assessmentsSnapshot = await getDocs(collection(db, "users", user.uid, "assessments"));
      const assessmentsList = assessmentsSnapshot.docs.map(doc => doc.data());
      setAssessmentHistory(Array.isArray(assessmentsList) ? assessmentsList : []);
    });

    // Sample notifications (can be replaced with backend notifications)
    setNotifications([
      {
        id: 1,
        title: "Daily Check-in Reminder",
        message: "How are you feeling today? Take a moment for your daily wellness check.",
        read: false,
        timestamp: new Date(),
        type: "reminder",
      },
      {
        id: 2,
        title: "Welcome to Serenity!",
        message: "Your dashboard is ready with personalized insights.",
        read: false,
        timestamp: new Date(Date.now() - 86400000),
        type: "info",
      },
    ]);

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await auth.signOut();
    toast({
      title: "Logged out successfully",
      description: "Thank you for using Serenity. See you next time!",
    });
    navigate("/");
  };

  const handleMarkAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
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
          last_login: today,
        },
        { merge: true }
      );
      setUserData((prev: any) => ({
        ...prev,
        moods: updatedMoods,
        last_login: today,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 cyber-grid">
      {/* Welcome Greeting */}
      {showWelcome && userData && (
        <WelcomeGreeting
          userName={userData.name}
          onDismiss={() => setShowWelcome(false)}
        />
      )}

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center justify-between">
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-medium border-primary/10 hover:shadow-glow transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wellness Score</CardTitle>
              <Heart className="w-4 h-4 text-energy" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-energy">
                {userData?.wellness_score || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {userData?.wellness_score >= 70
                  ? "Excellent progress"
                  : userData?.wellness_score >= 50
                  ? "Good progress"
                  : "Keep working on it"}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-primary/10 hover:shadow-glow transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Target className="w-4 h-4 text-focus" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-focus">
                {userData?.streak || 0}
              </div>
              <p className="text-xs text-muted-foreground">Days in a row</p>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-primary/10 hover:shadow-glow transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assessments</CardTitle>
              <Brain className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {assessmentHistory.length}
              </div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-primary/10 hover:shadow-glow transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <TrendingUp className="w-4 h-4 text-wellness" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-wellness">
                +{Math.floor(Math.random() * 15) + 5}%
              </div>
              <p className="text-xs text-muted-foreground">Mood improvement</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-medium border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Get started with your mental wellness journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    size="lg"
                    className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                    onClick={() => navigate("/assessment-center")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Take Assessment
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate("/progress")}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Progress
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
      <VoiceAssistant />
    </div>
  );
};

export default Dashboard;