import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, Brain, X } from "lucide-react";

interface WelcomeGreetingProps {
  userName: string;
  onDismiss: () => void;
}

const WelcomeGreeting = ({ userName, onDismiss }: WelcomeGreetingProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setShow(false);
    setTimeout(onDismiss, 300);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <Card className={`max-w-lg w-full p-8 text-center welcome-animation sparkle-effect bg-gradient-to-br from-card/95 to-primary/5 border-primary/20 shadow-glow ${show ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 w-8 p-0 hover:bg-primary/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Sparkles className="w-10 h-10 text-white animate-spin" />
          </div>
          <h2 className="text-3xl font-bold text-gradient-primary font-cursive mb-2">
            Welcome Back!
          </h2>
          <h3 className="text-2xl font-semibold mb-4">
            Hello, <span className="text-primary">{userName}</span>
          </h3>
        </div>

        <p className="text-muted-foreground mb-6 leading-relaxed font-body">
          We're excited to continue your mental wellness journey with you. 
          Your dashboard is ready with personalized insights and recommendations.
        </p>

        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="flex items-center gap-2 text-wellness">
            <Heart className="w-5 h-5" />
            <span className="text-sm font-medium">Wellness Focused</span>
          </div>
          <div className="flex items-center gap-2 text-primary">
            <Brain className="w-5 h-5" />
            <span className="text-sm font-medium">AI Powered</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleDismiss}
            className="w-full btn-futuristic"
            size="lg"
          >
            Continue to Dashboard
          </Button>
          <p className="text-xs text-muted-foreground">
            Take a moment to explore your progress and new recommendations
          </p>
        </div>
      </Card>
    </div>
  );
};

export default WelcomeGreeting;