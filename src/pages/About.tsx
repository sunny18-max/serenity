
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Heart, Shield, Users, Target, Star, TrendingUp, CheckCircle,ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  const features = [
    {
      icon: Brain,
      title: "Evidence-Based Assessments",
      description: "Clinically validated tools like PHQ-9 and GAD-7 used by mental health professionals worldwide",
      color: "text-primary"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Advanced analytics to monitor your mental health journey and identify improvement patterns",
      color: "text-wellness"
    },
    {
      icon: Heart,
      title: "Personalized Insights",
      description: "AI-powered recommendations tailored to your specific mental health needs and goals",
      color: "text-energy"
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "End-to-end encryption ensuring your sensitive health data remains completely confidential",
      color: "text-focus"
    }
  ];

  const stats = [
    { value: "1 in 8", label: "People globally suffer from mental disorders", icon: Users },
    { value: "75%", label: "Of mental health conditions remain untreated", icon: Target },
    { value: "90%", label: "Treatment success rate when properly diagnosed", icon: Star }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-cursive font-bold text-gradient-primary">Serenity</h1>
            </div>
           <Link 
          to="/" 
          className="inline-flex items-center text-slate-600 hover:text-indigo-600 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2 bg-primary/10 border-primary/30 text-primary">
              🧠 About Serenity
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Revolutionizing
              <span className="text-gradient-primary block font-cursive">Mental Healthcare</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-body leading-relaxed">
              Serenity is a comprehensive mental health assessment and tracking platform designed to make 
              mental wellness accessible, private, and effective for everyone.
            </p>
          </div>

          {/* Mission Statement */}
          <Card className="mb-16 p-8 bg-gradient-calm text-white">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/25 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-serif font-bold mb-4">Our Mission</h2>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                To break down barriers in mental healthcare by providing accessible, evidence-based screening tools 
                that empower individuals to understand, track, and improve their mental wellbeing with privacy and dignity.
              </p>
            </div>
          </Card>

          {/* Key Features */}
          <div className="mb-16">
            <h2 className="text-3xl font-serif font-bold text-center mb-12">
              Why Choose <span className="text-gradient-primary">Serenity?</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="team-card group">
                  <CardHeader>
                    <div className={`w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
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

          {/* Statistics */}
          <div className="mb-16">
            <h2 className="text-3xl font-serif font-bold text-center mb-12">
              The Mental Health <span className="text-gradient-primary">Crisis</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center p-6 hover:shadow-medium transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-2">{stat.value}</h3>
                  <p className="text-muted-foreground">{stat.label}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Technology */}
          <Card className="mb-16">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-serif font-bold mb-4">
                  Built with <span className="text-gradient-primary">Modern Technology</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Serenity leverages cutting-edge technology to provide a seamless, secure, and effective mental health platform.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: "React", description: "Modern frontend framework" },
                  { name: "TypeScript", description: "Type-safe development" },
                  { name: "Tailwind CSS", description: "Beautiful, responsive design" },
                  { name: "Supabase", description: "Secure backend & database" }
                ].map((tech, index) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Brain className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-1">{tech.name}</h4>
                    <p className="text-sm text-muted-foreground">{tech.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center">
            <Card className="p-8 bg-gradient-hero text-white">
              <h2 className="text-3xl font-serif font-bold mb-4">Ready to Start Your Journey?</h2>
              <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
                Take the first step towards better mental health. Join thousands who trust Serenity 
                for their mental wellness journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/auth">Get Started Today</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/60 text-white bg-black/40 hover:bg-white/15 neon-border" asChild>
                  <Link to="/contact">Contact Our Team</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;