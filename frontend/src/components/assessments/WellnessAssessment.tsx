import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Heart } from "lucide-react";

interface WellnessAssessmentProps {
  onComplete: (score: number, answers: Record<string, string>) => void;
  onBack: () => void;
}

const WellnessAssessment = ({ onComplete, onBack }: WellnessAssessmentProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions = [
    "How satisfied are you with your life overall?",
    "How would you rate your physical health?",
    "How satisfied are you with your relationships?",
    "How well are you able to manage stress?",
    "How satisfied are you with your work/daily activities?",
    "How well do you sleep at night?",
    "How often do you engage in activities you enjoy?",
    "How confident do you feel about the future?",
    "How well do you take care of your physical needs?",
    "How connected do you feel to others?"
  ];

  const options = [
    { value: "1", label: "Very poor" },
    { value: "2", label: "Poor" },
    { value: "3", label: "Fair" },
    { value: "4", label: "Good" },
    { value: "5", label: "Excellent" }
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
      <Card className="shadow-medium border-wellness/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-wellness/10 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-6 h-6 text-wellness" />
          </div>
          <CardTitle className="text-2xl">Overall Wellness Assessment</CardTitle>
          <CardDescription>
            Evaluate your overall well-being across different life domains
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
              {options.map((option) => (
                <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={option.value} id={`q${currentQuestion}-${option.value}`} />
                  <Label htmlFor={`q${currentQuestion}-${option.value}`} className="flex-1 cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={onBack}
            >
              Back to Assessments
            </Button>
            
            <div className="flex gap-2">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WellnessAssessment;