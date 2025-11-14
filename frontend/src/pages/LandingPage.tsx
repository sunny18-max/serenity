import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Heart, TrendingUp, Shield, Users, Bell, CheckCircle, ArrowRight, Sparkles, Activity, Menu, X } from "lucide-react";
import heroDashboard from "@/assets/hero-dashboard.jpg";
import { motion, AnimatePresence } from "framer-motion";
import { TypeAnimation } from 'react-type-animation';
import { Link } from "react-router-dom";
import AOS from 'aos';
import 'aos/dist/aos.css';
import ProfessionalHeroVideo from '@/components/ProfessionalHeroVideo';
import InfiniteCarousel from '@/components/InfiniteCarousel';
import TestimonialsSection from '@/components/TestimonialsSection';
import ResearchSection from '@/components/ResearchSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import PartnershipsSection from '@/components/PartnershipsSection';
import { ThemeToggle } from '@/components/ThemeToggle';

const LandingPage = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      mirror: false,
      offset: 50
    });
  }, []);

  const VideoModal = ({ onClose }: { onClose: () => void }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-4xl bg-black rounded-lg overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-primary transition-colors z-10"
          aria-label="Close video"
        >
          <X className="w-8 h-8" />
        </button>
        <div className="aspect-video">
          {/* Replace with your actual video URL from YouTube or Vimeo */}
          <iframe
            src="https://www.youtube.com/embed/NQcYZplTXnQ?autoplay=1&rel=0&modestbranding=1"
            title="Serenity App Demo"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
      </motion.div>
    </motion.div>
  );

  const features = [
    {
      icon: Brain,
      title: "Validated Assessments",
      description: "PHQ-9, GAD-7, and other clinically proven mental health screening tools",
      color: "text-primary"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Interactive dashboards to monitor mood patterns and behavioral trends",
      color: "text-wellness"
    },
    {
      icon: Heart,
      title: "Personalized Insights",
      description: "AI-powered recommendations for cognitive-behavioral strategies",
      color: "text-energy"
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Connect with peers and access professional therapy resources",
      color: "text-secondary"
    },
    {
      icon: Bell,
      title: "Smart Reminders",
      description: "Gentle notifications to maintain consistent mental wellness habits",
      color: "text-accent"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "End-to-end encryption with GDPR/HIPAA compliance",
      color: "text-focus"
    }
  ];

  const benefits = [
    "Early detection of mental health patterns",
    "Personalized wellness recommendations",
    "24/7 support and resources",
    "Data-driven insights for better care",
    "Reduced stigma through normalization",
    "Bridge between therapy sessions"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 cyber-grid">
      {/* Particle Background */}
      <div className="particle-network">
        {[...Array(30)].map((_, i) => (
          <div 
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 cyber-glass border-b border-white/20 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3" data-aos="fade-right">
              <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center shadow-neon glow-effect">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-cursive font-bold text-gradient-primary cyber-font">Serenity</h1>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8" data-aos="fade-down">
              <a href="#features" className="relative text-foreground/80 hover:text-primary transition-all duration-300 group">
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
              <Link to="/about" className="relative text-foreground/80 hover:text-primary transition-all duration-300 group">
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link to="/contact" className="relative text-foreground/80 hover:text-primary transition-all duration-300 group">
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>

            <div className="flex items-center space-x-4" data-aos="fade-left">
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Desktop Buttons */}
              <Button variant="ghost" className="hidden md:flex" onClick={() => window.location.href = '/auth'}>
                Sign In
              </Button>
              <Button variant="hero" className="hidden md:flex" onClick={() => window.location.href = '/auth'}>
                Get Started
              </Button>
              
              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-white/10 bg-background/95 backdrop-blur-xl"
          >
            <div className="container mx-auto px-6 py-4 space-y-4">
              <a 
                href="#features" 
                className="block py-3 px-4 text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </a>
              <Link 
                to="/about" 
                className="block py-3 px-4 text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="block py-3 px-4 text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="pt-4 space-y-3 border-t border-border">
                <Button 
                  variant="ghost" 
                  className="w-full justify-center btn-enhanced" 
                  onClick={() => {
                    window.location.href = '/auth';
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Sign In
                </Button>
                <Button 
                  variant="hero" 
                  className="w-full justify-center" 
                  onClick={() => {
                    window.location.href = '/auth';
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoModalOpen && <VideoModal onClose={() => setIsVideoModalOpen(false)} />}
      </AnimatePresence>


      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <div data-aos="futuristic-fade" data-aos-delay="100">
            <Badge variant="outline" className="mb-6 px-4 py-2 bg-primary/10 border-primary/30 text-primary neon-text dark:bg-primary/20 dark:border-primary/50 dark:text-primary">
              🧠 Mental Wellness Revolution
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <TypeAnimation
                sequence={[
                  'Your Journey to Mental Wellness',
                  2000,
                  'Your Path to Inner Peace',
                  2000,
                  'Your Road to Better Health',
                  2000,
                  'Your Journey to Mental Wellness',
                ]}
                wrapper="span"
                speed={50}
                className="text-gradient-primary block floating-animation font-cursive"
                repeat={Infinity}
              />
              <span className="block mt-2">Starts Here</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-body">
              Serenity combines validated assessments, AI-powered insights, and personalized support 
              to help you understand, track, and improve your mental health journey with privacy and dignity.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button 
                size="lg" 
                variant="hero" 
                onClick={() => window.location.href = '/auth'}
                data-aos="zoom-in"
                data-aos-delay="300"
              >
                Start Your Assessment
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="btn-enhanced"
                onClick={() => setIsVideoModalOpen(true)}
                data-aos="zoom-in"
                data-aos-delay="400"
              >
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Professional Hero Video */}
          <div className="relative mx-auto max-w-5xl" data-aos="fade-up" data-aos-delay="500">
            <ProfessionalHeroVideo />
            <div className="text-center mt-8">
              <Badge variant="outline" className="px-4 py-2 bg-primary/10 border-primary/30 text-primary">
                <Activity className="w-4 h-4 mr-2 inline" />
                Professional Mental Health Education
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto">
          <div className="text-center mb-16" data-aos="fade-up">
            <Badge variant="outline" className="mb-4 px-4 py-2 bg-wellness/15 border-wellness/30 text-wellness neon-text dark:bg-wellness/25 dark:border-wellness/50 dark:text-wellness">
              ✨ Comprehensive Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              Everything You Need for
              <span className="text-gradient-primary block">Mental Wellness</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform combines clinical expertise with modern technology to provide 
              comprehensive mental health support.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="aos-card group cursor-pointer transition-cyber hover:shadow-medium hover:-translate-y-2 border-0 shadow-soft bg-card/70 backdrop-blur-sm neon-border"
                onMouseEnter={() => setActiveFeature(index)}
                data-aos="futuristic-fade"
                data-aos-delay={index * 100}
              >
                <CardHeader>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center mb-4 group-hover:scale-110 transition-bounce ${feature.color} glow-effect`}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <CardTitle className="text-xl font-serif">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div data-aos="fade-right">
              <Badge variant="outline" className="mb-4 px-4 py-2 bg-energy/15 border-energy/30 text-energy neon-text dark:bg-energy/25 dark:border-energy/50 dark:text-energy">
                🎯 Impact & Benefits
              </Badge>
              <h2 className="text-4xl font-serif font-bold mb-6">
                Transforming Mental Health
                <span className="text-gradient-primary block">One Person at a Time</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
/* ... */
                of individuals take control of their mental health journey with confidence and privacy.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index} 
                    className="flex items-center space-x-3"
                    data-aos="fade-right"
                    data-aos-delay={index * 100}
                  >
                    <CheckCircle className="w-6 h-6 text-wellness flex-shrink-0 glow-effect" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>

              <Button 
                size="lg" 
                variant="hero" 
                className="mt-8"
                onClick={() => window.location.href = '/auth'}
                data-aos="zoom-in"
                data-aos-delay="600"
              >
                Join Serenity Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>

            <div className="relative" data-aos="fade-left" data-aos-delay="300">
              <Card className="p-8 shadow-strong border-0 bg-gradient-calm text-white holographic-card">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/25 rounded-full flex items-center justify-center mx-auto mb-6 glow-effect">
                    <Heart className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-4">1 in 8 People</h3>
                  <p className="text-lg opacity-90 mb-6">
                    Globally suffer from mental disorders. Many remain undiagnosed due to stigma, 
                    high costs, or lack of awareness.
                  </p>
                  <div className="cyber-glass rounded-xl p-4">
                    <div className="text-sm opacity-80 mb-1">Breaking Barriers</div>
                    <div className="text-lg font-medium">Making Mental Health Accessible</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Carousel Section */}
      <section id="about" className="py-20 px-6 bg-gradient-to-br from-secondary/5 to-accent/5">
        <div className="container mx-auto">
          <div className="text-center mb-12" data-aos="fade-up">
            <Badge variant="outline" className="mb-4 px-4 py-2 bg-primary/15 border-primary/30 text-primary neon-text dark:bg-primary/25 dark:border-primary/50 dark:text-primary">
              ✨ What Makes Us Different
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Comprehensive Features for
              <span className="text-gradient-primary block font-cursive">Your Mental Wellness</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-body">
              Discover the powerful features that make Serenity the perfect companion 
              for your mental health journey.
            </p>
          </div>

          {/* Infinite Carousel */}
          <div data-aos="fade-up" data-aos-delay="200">
            <InfiniteCarousel />
          </div>

          {/* Learn More CTA */}
          <div className="text-center mt-12" data-aos="fade-up" data-aos-delay="400">
            <Link to="/about">
              <Button variant="outline" size="lg" className="btn-enhanced">
                Learn More About Serenity
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Research & Evidence Section */}
      <ResearchSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Partnerships & Resources Section */}
      <PartnershipsSection />

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-hologram opacity-20"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-3xl mx-auto text-white" data-aos="zoom-in">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              Ready to Start Your
              <span className="block">Wellness Journey?</span>
            </h2>
            <p className="text-xl opacity-90 mb-12 leading-relaxed">
              Join thousands who've taken control of their mental health with Serenity. 
              Start with a free assessment and discover personalized insights today.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                variant="secondary" 
                className="bg-white text-primary hover:bg-white/90"
                onClick={() => window.location.href = '/auth'}
                data-aos="zoom-in"
                data-aos-delay="200"
              >
                Start Free Assessment
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="btn-enhanced border-white/60 text-white bg-black/40 hover:bg-white/15"
                data-aos="zoom-in"
                data-aos-delay="300"
                onClick={() => window.location.href = '/about'}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-16 px-6 bg-foreground/5 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2" data-aos="fade-right">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center shadow-soft">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-cursive font-bold text-gradient-primary">Serenity</h3>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Empowering individuals to take control of their mental wellness journey 
                through technology, privacy, and compassion.
              </p>
              <div className="text-sm text-muted-foreground">
                "Mental wellness is not a luxury; it is a right."
              </div>
            </div>
            
            <div data-aos="fade-up" data-aos-delay="100">
              <h4 className="font-semibold mb-4">Platform</h4>
              <div className="space-y-2 text-muted-foreground">
                <div>Assessments</div>
                <div>Tracking</div>
                <div>Insights</div>
                <div>Community</div>
              </div>
            </div>
            
            <div data-aos="fade-up" data-aos-delay="200">
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-muted-foreground">
                <div>Help Center</div>
                <div>Privacy Policy</div>
                <div>Terms of Service</div>
                <div>Contact Us</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground" data-aos="fade-up">
            <p>&copy; 2025 Serenity Mental Health Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
