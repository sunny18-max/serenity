import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, TrendingUp, Users, Heart, Brain, Shield, Zap } from 'lucide-react';

const impactStats = [
  {
    number: "95%",
    label: "Accuracy Rate",
    description: "Clinical assessment precision",
    icon: Brain,
    color: "from-primary to-primary/60"
  },
  {
    number: "50K+",
    label: "Lives Improved",
    description: "Users worldwide",
    icon: Users,
    color: "from-secondary to-secondary/60"
  },
  {
    number: "24/7",
    label: "Support Available",
    description: "Round-the-clock care",
    icon: Heart,
    color: "from-wellness to-wellness/60"
  },
  {
    number: "99.9%",
    label: "Uptime Guarantee",
    description: "Reliable service",
    icon: Shield,
    color: "from-focus to-focus/60"
  }
];

const benefits = [
  {
    title: "Early Detection",
    description: "Identify mental health patterns before they become critical",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&w=600&q=80",
    icon: Brain
  },
  {
    title: "Personalized Care",
    description: "AI-powered recommendations tailored to your unique needs",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&w=600&q=80",
    icon: Heart
  },
  {
    title: "24/7 Accessibility",
    description: "Support and resources available whenever you need them",
    image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?ixlib=rb-4.0.3&w=600&q=80",
    icon: Zap
  },
  {
    title: "Privacy Protection",
    description: "Your mental health data remains completely confidential",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&w=600&q=80",
    icon: Shield
  },
  {
    title: "Progress Tracking",
    description: "Visual insights into your mental wellness journey",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&w=600&q=80",
    icon: TrendingUp
  },
  {
    title: "Community Support",
    description: "Connect with others on similar wellness journeys",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&w=600&q=80",
    icon: Users
  }
];

export default function UniqueImpactSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);
  const controls = useAnimation();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % benefits.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 px-6 relative overflow-hidden">
      {/* Unique Background with Morphing Shapes */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-energy/5 via-background to-wellness/5" />
        
        {/* Morphing Background Shapes */}
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 0.8, 1],
            x: [0, 50, -30, 0],
            y: [0, -20, 40, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-accent/10 to-wellness/10 rounded-full blur-3xl"
          animate={{
            scale: [0.8, 1.3, 1, 0.8],
            x: [0, -40, 20, 0],
            y: [0, 30, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20" data-aos="fade-up">
          <Badge 
            variant="outline" 
            className="mb-6 px-6 py-3 bg-energy/15 border-energy/30 text-energy backdrop-blur-sm"
          >
            🎯 Impact & Benefits
          </Badge>
          <h2 className="text-5xl md:text-7xl font-bold mb-8">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-energy via-wellness to-primary">
              Transforming Lives
            </span>
            <br />
            <span className="text-foreground">One Person at a Time</span>
          </h2>
        </div>

        {/* Stats Grid with Unique Layout */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {impactStats.map((stat, index) => (
            <motion.div
              key={index}
              className="relative"
              onHoverStart={() => setHoveredStat(index)}
              onHoverEnd={() => setHoveredStat(null)}
              whileHover={{ scale: 1.05, y: -10 }}
            >
              <Card className="h-full border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm shadow-xl overflow-hidden">
                <CardContent className="p-6 text-center relative">
                  {/* Background Icon */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center opacity-5"
                    animate={{ rotate: hoveredStat === index ? 360 : 0 }}
                    transition={{ duration: 2 }}
                  >
                    <stat.icon className="w-32 h-32" />
                  </motion.div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <motion.div
                      className="text-4xl font-bold text-foreground mb-2"
                      animate={{ scale: hoveredStat === index ? 1.1 : 1 }}
                    >
                      {stat.number}
                    </motion.div>
                    
                    <h3 className="text-lg font-semibold mb-2">{stat.label}</h3>
                    <p className="text-sm text-muted-foreground">{stat.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Unique Benefits Showcase */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Interactive Benefits List */}
          <div className="space-y-6">
            <h3 className="text-3xl font-bold mb-8">
              Why Choose <span className="text-gradient-primary">Serenity?</span>
            </h3>
            
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-500 ${
                  activeIndex === index 
                    ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/30' 
                    : 'bg-card/50 border border-border/50 hover:bg-card/80'
                }`}
                onClick={() => setActiveIndex(index)}
                whileHover={{ x: 10 }}
              >
                <div className="flex items-start space-x-4">
                  <motion.div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      activeIndex === index 
                        ? 'bg-primary text-white' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                    animate={{ 
                      scale: activeIndex === index ? 1.1 : 1,
                      rotate: activeIndex === index ? 360 : 0
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <benefit.icon className="w-6 h-6" />
                  </motion.div>
                  
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold mb-2">{benefit.title}</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                  
                  <motion.div
                    animate={{ 
                      opacity: activeIndex === index ? 1 : 0,
                      x: activeIndex === index ? 0 : 20
                    }}
                  >
                    <CheckCircle className="w-6 h-6 text-wellness" />
                  </motion.div>
                </div>
                
                {/* Active Indicator */}
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-secondary rounded-r-full"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: activeIndex === index ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
          </div>

          {/* Right: Dynamic Image Showcase */}
          <div className="relative">
            <div className="relative h-[600px] rounded-3xl overflow-hidden">
              {/* Main Image */}
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
              >
                <img
                  src={benefits[activeIndex].image}
                  alt={benefits[activeIndex].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </motion.div>

              {/* Floating Content */}
              <motion.div
                key={`content-${activeIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="absolute bottom-8 left-8 right-8"
              >
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        {(() => {
                          const IconComponent = benefits[activeIndex].icon;
                          return <IconComponent className="w-6 h-6 text-white" />;
                        })()}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white">
                          {benefits[activeIndex].title}
                        </h4>
                        <p className="text-white/80 text-sm">
                          {benefits[activeIndex].description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Progress Indicators */}
              <div className="absolute top-8 right-8 space-y-2">
                {benefits.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`w-1 h-8 rounded-full ${
                      index === activeIndex ? 'bg-white' : 'bg-white/30'
                    }`}
                    animate={{ 
                      scaleY: index === activeIndex ? 1 : 0.5,
                      opacity: index === activeIndex ? 1 : 0.5
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Decorative Elements */}
            <motion.div
              className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-wellness/30 to-energy/30 rounded-full blur-xl"
              animate={{ scale: [1.2, 1, 1.2] }}
              transition={{ duration: 5, repeat: Infinity }}
            />
          </div>
        </div>

        {/* CTA Section */}
        <motion.div 
          className="text-center mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Button 
            size="lg" 
            variant="hero"
            className="px-12 py-6 text-xl relative group overflow-hidden"
            onClick={() => window.location.href = '/auth'}
          >
            <span className="relative z-10 flex items-center">
              Join Serenity Today
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-secondary/0 via-white/20 to-secondary/0"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.8 }}
            />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
