import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Moon } from "lucide-react";

interface SleepAssessmentProps {
  onComplete: (score: number, answers: Record<string, string>) => void;
}

const SleepAssessment = ({ onComplete }: SleepAssessmentProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions = [
    "How long does it usually take you to fall asleep?",
    "How often do you wake up during the night?",
    "How would you rate your sleep quality?",
    "How refreshed do you feel when you wake up?",
    "How often do you have difficulty staying asleep?",
    "How often do you wake up earlier than planned?",
    "How satisfied are you with your current sleep pattern?",
    "How often does poor sleep interfere with your daily activities?"
  ];

  const options = [
    [
      { value: "0", label: "Less than 15 minutes" },
      { value: "1", label: "15-30 minutes" },
      { value: "2", label: "30-60 minutes" },
      { value: "3", label: "More than 60 minutes" }
    ],
    [
      { value: "0", label: "Never" },
      { value: "1", label: "1-2 times per week" },
      { value: "2", label: "3-4 times per week" }, 
      { value: "3", label: "5 or more times per week" }
    ],
    [
      { value: "0", label: "Very good" },
      { value: "1", label: "Good" },
      { value: "2", label: "Poor" },
      { value: "3", label: "Very poor" }
    ],
    [
      { value: "0", label: "Very refreshed" },
      { value: "1", label: "Fairly refreshed" },
      { value: "2", label: "Slightly refreshed" },
      { value: "3", label: "Not refreshed at all" }
    ],
    [
      { value: "0", label: "Never" },
      { value: "1", label: "1-2 times per week" },
      { value: "2", label: "3-4 times per week" },
      { value: "3", label: "5 or more times per week" }
    ],
    [
      { value: "0", label: "Never" },
      { value: "1", label: "1-2 times per week" },
      { value: "2", label: "3-4 times per week" },
      { value: "3", label: "5 or more times per week" }
    ],
    [
      { value: "0", label: "Very satisfied" },
      { value: "1", label: "Satisfied" },
      { value: "2", label: "Dissatisfied" },
      { value: "3", label: "Very dissatisfied" }
    ],
    [
      { value: "0", label: "Never" },
      { value: "1", label: "Rarely" },
      { value: "2", label: "Sometimes" },
      { value: "3", label: "Often" }
    ]
  ];

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const totalScore = Object.values(answers).reduce((sum, val) => sum + parseInt(val), 0);
      onComplete(totalScore, answers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const canProceed = answers[currentQuestion] !== undefined;

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-medium border-focus/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-focus/10 rounded-full flex items-center justify-center mb-4">
            <Moon className="w-6 h-6 text-focus" />
          </div>
          <CardTitle className="text-2xl">Sleep Quality Assessment</CardTitle>
          <CardDescription>
            Evaluate your sleep patterns and quality over the past month
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium leading-relaxed">
              {questions[currentQuestion]}
            </h3>

            <RadioGroup 
              value={answers[currentQuestion] || ""}
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              {options[currentQuestion].map((option) => (
                <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="min-w-24"
            >
              {currentQuestion === questions.length - 1 ? "Complete" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SleepAssessment;