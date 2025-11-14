import { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Heart, Shield, Users, TrendingUp, Sparkles, Activity, Target } from 'lucide-react';

const testimonials = [
  {
    icon: Brain,
    title: "Evidence-Based",
    description: "Clinically validated assessments used by professionals worldwide",
    color: "text-primary"
  },
  {
    icon: Heart,
    title: "Compassionate Care",
    description: "Empathetic support for your mental wellness journey",
    color: "text-energy"
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "End-to-end encryption protecting your sensitive data",
    color: "text-focus"
  },
  {
    icon: Users,
    title: "Community Support",
    description: "Connect with peers who understand your journey",
    color: "text-secondary"
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    description: "Monitor your mental health improvements over time",
    color: "text-wellness"
  },
  {
    icon: Sparkles,
    title: "AI-Powered Insights",
    description: "Personalized recommendations tailored to your needs",
    color: "text-accent"
  },
  {
    icon: Activity,
    title: "Real-Time Analytics",
    description: "Professional-grade insights at your fingertips",
    color: "text-primary"
  },
  {
    icon: Target,
    title: "Goal Setting",
    description: "Set and achieve your mental wellness objectives",
    color: "text-wellness"
  }
];

export default function InfiniteCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    // Duplicate items for seamless loop
    const scrollerContent = Array.from(scroller.children);
    scrollerContent.forEach((item) => {
      const duplicatedItem = item.cloneNode(true);
      scroller.appendChild(duplicatedItem);
    });
  }, []);

  return (
    <div className="w-full overflow-hidden py-8 relative">
      {/* Gradient overlays for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      <div 
        ref={scrollerRef}
        className="flex gap-6 animate-infinite-scroll hover:pause-animation"
        style={{
          width: 'max-content'
        }}
      >
        {testimonials.map((item, index) => (
          <Card 
            key={index}
            className="flex-shrink-0 w-80 group hover:shadow-lg transition-all duration-300 border-0 bg-card/70 backdrop-blur-sm hover:-translate-y-1"
          >
            <CardContent className="p-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
