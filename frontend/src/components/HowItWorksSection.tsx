import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Brain, BarChart3, Heart, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    step: "01",
    title: "Complete Assessment",
    description: "Take clinically validated assessments like PHQ-9 and GAD-7 in a secure, private environment.",
    icon: Brain,
    color: "text-primary"
  },
  {
    step: "02", 
    title: "Get Insights",
    description: "Receive personalized insights and recommendations based on your assessment results and patterns.",
    icon: BarChart3,
    color: "text-secondary"
  },
  {
    step: "03",
    title: "Track Progress",
    description: "Monitor your mental health journey with interactive dashboards and progress tracking tools.",
    icon: Heart,
    color: "text-wellness"
  },
  {
    step: "04",
    title: "Stay Secure",
    description: "Your data remains private with end-to-end encryption and HIPAA-compliant security measures.",
    icon: Shield,
    color: "text-focus"
  }
];

const features = [
  "Clinically validated assessments",
  "AI-powered personalized insights", 
  "Real-time progress tracking",
  "End-to-end encryption",
  "Professional-grade analytics",
  "24/7 accessibility",
  "Multi-device synchronization",
  "Export reports for healthcare providers"
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-background to-wellness/5 dark:to-wellness/10">
      <div className="container mx-auto">
        {/* How It Works */}
        <div className="text-center mb-16" data-aos="fade-up">
          <Badge variant="outline" className="mb-4 px-4 py-2 bg-wellness/15 border-wellness/30 text-wellness neon-text dark:bg-wellness/25 dark:border-wellness/50 dark:text-wellness">
            🔄 How It Works
          </Badge>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Your Journey to
            <span className="text-gradient-primary block">Better Mental Health</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Follow our simple, scientifically-backed process to understand, track, 
            and improve your mental wellness.
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Card className="h-full border-0 bg-card/70 backdrop-blur-sm hover:shadow-medium hover:-translate-y-2 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {step.step}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center mx-auto mb-4 mt-4 ${step.color}`}>
                    <step.icon className="w-8 h-8" />
                  </div>

                  <h3 className="text-lg font-semibold mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>

              {/* Arrow for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 z-10">
                  <ArrowRight className="w-6 h-6 text-primary/40" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div data-aos="fade-right">
            <h3 className="text-3xl font-serif font-bold mb-6">
              Everything You Need for
              <span className="text-gradient-primary block">Mental Wellness</span>
            </h3>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Our comprehensive platform combines clinical expertise with modern technology 
              to provide you with professional-grade mental health tools.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-3"
                  data-aos="fade-right"
                  data-aos-delay={index * 50}
                >
                  <CheckCircle className="w-5 h-5 text-wellness flex-shrink-0" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <Button 
              size="lg" 
              variant="hero" 
              className="btn-enhanced btn-glow"
              onClick={() => window.location.href = '/auth'}
            >
              Start Your Assessment
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          <div className="relative" data-aos="fade-left">
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border-0 shadow-strong">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-2xl font-bold mb-4">Trusted by Professionals</h4>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Our assessments are the same tools used by licensed mental health 
                  professionals in clinical settings worldwide.
                </p>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">50K+</div>
                    <div className="text-xs text-muted-foreground">Assessments</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-secondary">95%</div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-wellness">24/7</div>
                    <div className="text-xs text-muted-foreground">Available</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
