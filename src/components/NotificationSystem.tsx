import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, X, Heart, Brain, Target, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'insight' | 'achievement' | 'checkIn';
  icon: any;
  color: string;
  timestamp: Date;
}

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { toast } = useToast();

  const notificationTemplates = [
    {
      title: "Time for your daily check-in",
      message: "How are you feeling today? Take a moment to reflect on your mood.",
      type: 'checkIn' as const,
      icon: Heart,
      color: "text-wellness"
    },
    {
      title: "New insight available",
      message: "We've noticed patterns in your mood tracking. Check your personalized insights.",
      type: 'insight' as const,
      icon: Brain,
      color: "text-primary"
    },
    {
      title: "Great progress this week!",
      message: "You've completed 5 mood check-ins this week. Keep up the excellent work!",
      type: 'achievement' as const,
      icon: Target,
      color: "text-secondary"
    },
    {
      title: "Mindfulness reminder",
      message: "Consider taking a 5-minute breathing exercise to center yourself.",
      type: 'reminder' as const,
      icon: Sparkles,
      color: "text-accent"
    }
  ];

  // Simulate random notifications for user engagement
  useEffect(() => {
    const generateNotification = () => {
      const template = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)];
      const notification: Notification = {
        id: Date.now().toString(),
        ...template,
        timestamp: new Date()
      };

      setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only latest 5
      
      // Show toast notification
      toast({
        title: notification.title,
        description: notification.message,
        duration: 5000,
      });
    };

    // Generate first notification after 10 seconds
    const initialTimer = setTimeout(generateNotification, 10000);
    
    // Then generate notifications every 2-5 minutes for demo
    const intervalTimer = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every interval
        generateNotification();
      }
    }, 120000); // Check every 2 minutes

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [toast]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
            {notifications.length}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 top-12 w-80 z-50">
          <Card className="shadow-strong border-0 bg-card/95 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Notifications</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowNotifications(false)}
                    className="w-6 h-6"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No notifications yet</p>
                    <p className="text-sm">We'll notify you about important updates</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 ${notification.color}`}>
                            <notification.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm mb-1">{notification.title}</h4>
                            <p className="text-xs text-muted-foreground mb-2">{notification.message}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(notification.timestamp)}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => dismissNotification(notification.id)}
                                className="w-6 h-6 opacity-50 hover:opacity-100"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 border-t border-border/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNotifications([])}
                    className="w-full text-xs"
                  >
                    Clear all notifications
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;