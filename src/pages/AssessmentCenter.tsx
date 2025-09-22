import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Shield, Activity, Heart, ArrowLeft, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PHQ9Assessment from "@/components/assessments/PHQ9Assessment";
import GAD7Assessment from "@/components/assessments/GAD7Assessment";
import StressAssessment from "@/components/assessments/StressAssessment";
import WellnessAssessment from "@/components/assessments/WellnessAssessment";
import SleepAssessment from "@/components/assessments/SleepAssessment";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";

type AssessmentType = "select" | "phq9" | "gad7" | "stress" | "wellness" | "sleep";

const AssessmentCenter = () => {
  const [currentAssessment, setCurrentAssessment] = useState<AssessmentType>("select");
  const navigate = useNavigate();
  const { toast } = useToast();

  const assessments = [
    {
      id: "phq9",
      title: "PHQ-9 Depression Screening",
      description: "Assess symptoms of depression over the past 2 weeks",
      icon: Brain,
      duration: "5-7 minutes",
      questions: "9 questions",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      id: "gad7",
      title: "GAD-7 Anxiety Assessment", 
      description: "Measure generalized anxiety disorder symptoms",
      icon: Shield,
      duration: "4-6 minutes",
      questions: "7 questions",
      color: "text-calm",
      bgColor: "bg-calm/10"
    },
    {
      id: "stress",
      title: "Perceived Stress Scale",
      description: "Evaluate your stress levels and coping mechanisms",
      icon: Activity,
      duration: "6-8 minutes", 
      questions: "10 questions",
      color: "text-energy",
      bgColor: "bg-energy/10"
    },
    {
      id: "wellness",
      title: "Overall Wellness Assessment",
      description: "Evaluate your well-being across different life domains",
      icon: Heart,
      duration: "7-10 minutes",
      questions: "10 questions", 
      color: "text-wellness",
      bgColor: "bg-wellness/10"
    },
    {
      id: "sleep",
      title: "Sleep Quality Assessment",
      description: "Assess your sleep patterns and quality",
      icon: Clock,
      duration: "5-8 minutes",
      questions: "8 questions",
      color: "text-focus", 
      bgColor: "bg-focus/10"
    }
  ];

  const handleAssessmentComplete = async (type: string, score: number, answers: Record<string, string>) => {
    const interpretation = getScoreInterpretation(type, score);
    const result = {
      type,
      score,
      answers,
      date: new Date().toISOString(),
      interpretation
    };

    // Save assessment result to Firestore
    const user = auth.currentUser;
    if (user) {
      try {
        await addDoc(
          collection(db, "users", user.uid, "assessments"),
          result
        );
        toast({
          title: "Assessment Complete",
          description: `Your ${type.toUpperCase()} assessment has been saved. Score: ${score}`,
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to save assessment.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Error",
        description: "You must be signed in to save assessments.",
        variant: "destructive",
      });
    }

    setCurrentAssessment("select");
  };

  const getScoreInterpretation = (type: string, score: number): string => {
    switch (type) {
      case "phq9":
        if (score <= 4) return "Minimal depression";
        if (score <= 9) return "Mild depression";
        if (score <= 14) return "Moderate depression";
        if (score <= 19) return "Moderately severe depression";
        return "Severe depression";
      case "gad7":
        if (score <= 4) return "Minimal anxiety";
        if (score <= 9) return "Mild anxiety";
        if (score <= 14) return "Moderate anxiety";
        return "Severe anxiety";
      case "stress":
        if (score <= 13) return "Low stress";
        if (score <= 26) return "Moderate stress";
        return "High stress";
      case "wellness":
        if (score >= 20) return "Excellent well-being";
        if (score >= 13) return "Good well-being";
        if (score >= 8) return "Moderate well-being";
        return "Poor well-being";
      case "sleep":
        if (score <= 5) return "Good sleep quality";
        if (score <= 10) return "Moderate sleep quality";
        return "Poor sleep quality";
      default:
        return "Assessment completed";
    }
  };

  if (currentAssessment !== "select") {
    const props = {
      onComplete: (score: number, answers: Record<string, string>) => 
        handleAssessmentComplete(currentAssessment, score, answers),
      onBack: () => setCurrentAssessment("select")
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 cyber-grid p-6">
        <div className="container mx-auto py-8">
          {currentAssessment === "phq9" && <PHQ9Assessment {...props} />}
          {currentAssessment === "gad7" && <GAD7Assessment {...props} />}
          {currentAssessment === "stress" && <StressAssessment {...props} />}
          {currentAssessment === "wellness" && <WellnessAssessment {...props} />}
          {currentAssessment === "sleep" && <SleepAssessment {...props} />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 cyber-grid">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold mb-4 text-gradient-primary">Assessment Center</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Take validated mental health screenings to track your wellbeing and get personalized insights
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {assessments.map((assessment) => {
            const Icon = assessment.icon;
            return (
              <Card 
                key={assessment.id}
                className="hover:shadow-medium transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                onClick={() => setCurrentAssessment(assessment.id as AssessmentType)}
              >
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 ${assessment.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${assessment.color}`} />
                  </div>
                  <CardTitle className="text-xl font-serif">{assessment.title}</CardTitle>
                  <CardDescription className="text-base">
                    {assessment.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{assessment.duration}</span>
                    </div>
                    <Badge variant="secondary">{assessment.questions}</Badge>
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentAssessment(assessment.id as AssessmentType);
                    }}
                  >
                    Start Assessment
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-serif font-bold mb-4">Track Your Mental Health Journey</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Regular assessments help identify patterns, track progress, and provide insights for better mental health management. 
                All assessments are based on clinically validated screening tools used by healthcare professionals.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-wellness mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Clinically Validated</h4>
                  <p className="text-sm text-muted-foreground">Evidence-based screening tools</p>
                </div>
                <div className="text-center">
                  <Heart className="w-8 h-8 text-energy mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Privacy Protected</h4>
                  <p className="text-sm text-muted-foreground">Your data stays secure and private</p>
                </div>
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-focus mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Progress Tracking</h4>
                  <p className="text-sm text-muted-foreground">Monitor trends over time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AssessmentCenter;