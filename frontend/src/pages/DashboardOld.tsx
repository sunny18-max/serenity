import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Shield,
  Bell,
  CheckCircle
} from "lucide-react";

import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
  type: string;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
}

const NotificationSystem = ({ notifications, onMarkAsRead }: NotificationSystemProps) => {
  const unreadCount = notifications.filter(n => !n.read).length;

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
                  className={`p-4 ${notification.read ? "bg-muted/30" : "bg-background"}`}
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
                    {notification.timestamp.toLocaleDateString()} • {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Welcome to Serenity!",
      message: "Complete your first wellness assessment to get started.",
      read: false,
      timestamp: new Date(),
      type: "info"
    }
  ]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/auth");
          return;
        }

        const response = await axios.get("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUser(response.data.user);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/auth");
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const handleMoodSelection = (mood: number) => {
    setCurrentMood(mood);
    toast({
      title: "Mood recorded",
      description: "Thank you for sharing how you feel today.",
    });
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const getMoodIcon = (mood: number) => {
    if (mood >= 4) return <Smile className="w-6 h-6 text-green-500" />;
    if (mood >= 3) return <Meh className="w-6 h-6 text-yellow-500" />;
    return <Frown className="w-6 h-6 text-red-500" />;
  };

  const getMoodText = (mood: number) => {
    if (mood >= 4) return "Great";
    if (mood >= 3) return "Okay";
    return "Not great";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-primary/10 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-gradient-primary">Serenity</h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <Badge className="absolute -top-1 -right-1 px-1 py-0 text-xs bg-red-500">
                    {notifications.filter(n => !n.read).length}
                  </Badge>
                )}
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name || "User"}! 👋
          </h2>
          <p className="text-muted-foreground">
            Here's your mental wellness overview for today.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mood Tracker */}
            <Card className="shadow-medium border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  How are you feeling today?
                </CardTitle>
                <CardDescription>
                  Your mood helps us personalize your experience.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4 mb-6">
                  {[1, 2, 3, 4, 5].map((mood) => (
                    <button
                      key={mood}
                      onClick={() => handleMoodSelection(mood)}
                      className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                        currentMood === mood
                          ? "border-primary bg-primary/10"
                          : "border-muted hover:border-primary/50"
                      }`}
                    >
                      {getMoodIcon(mood)}
                      <span className="text-sm mt-2 font-medium">
                        {getMoodText(mood)}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
                  
            {/* Progress Overview */}
            <Card className="shadow-medium border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Weekly Progress
                </CardTitle>
                <CardDescription>
                  Your mental wellness journey this week.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Mindfulness", value: 75 },
                    { label: "Sleep Quality", value: 60 },
                    { label: "Stress Level", value: 40 },
                    { label: "Mood Stability", value: 85 }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="text-sm text-muted-foreground">{item.value}%</span>
                      </div>
                      <Progress value={item.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* User Profile Card */}
            <Card className="shadow-medium border-primary/10">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>
                <CardTitle>{user?.name || "User"}</CardTitle>
                <CardDescription>{user?.email || "user@example.com"}</CardDescription>
                {user?.phone && <CardDescription>{user.phone}</CardDescription>}
                <Badge variant="outline" className="mt-2">
                  <Shield className="w-3 h-3 mr-1" />
                  Account Protected
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">14</div>
                    <div className="text-sm text-muted-foreground">Sessions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">87%</div>
                    <div className="text-sm text-muted-foreground">Progress</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-medium border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  New Journal Entry
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Brain className="w-4 h-4 mr-2" />
                  Start Meditation
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Insights
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Heart className="w-4 h-4 mr-2" />
                  Breathing Exercise
                </Button>
              </CardContent>
            </Card>

            {/* Notifications */}
            <NotificationSystem
              notifications={notifications}
              onMarkAsRead={markNotificationAsRead}
            />
          </div>
        </div>

        {/* Upcoming Sessions */}
        <Card className="mt-8 shadow-medium border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Sessions
            </CardTitle>
            <CardDescription>
              Your scheduled wellness sessions and activities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {[
                {
                  title: "Morning Meditation",
                  time: "Tomorrow, 7:00 AM",
                  type: "meditation"
                },
                {
                  title: "Therapy Session",
                  time: "June 15, 2:00 PM",
                  type: "therapy"
                },
                {
                  title: "Breathing Exercise",
                  time: "Daily, 6:00 PM",
                  type: "exercise"
                }
              ].map((session, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <div className="font-medium">{session.title}</div>
                    <div className="text-sm text-muted-foreground">{session.time}</div>
                  </div>
                  <Badge variant="secondary">{session.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;