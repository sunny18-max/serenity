import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Activity } from "lucide-react";

interface StressAssessmentProps {
  onComplete: (score: number, answers: Record<string, string>) => void;
  onBack: () => void;
}

const StressAssessment = ({ onComplete, onBack }: StressAssessmentProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions = [
    "In the last month, how often have you been upset because of something that happened unexpectedly?",
    "In the last month, how often have you felt that you were unable to control the important things in your life?",
    "In the last month, how often have you felt nervous and stressed?",
    "In the last month, how often have you felt confident about your ability to handle your personal problems?",
    "In the last month, how often have you felt that things were going your way?",
    "In the last month, how often have you found that you could not cope with all the things that you had to do?",
    "In the last month, how often have you been able to control irritations in your life?",
    "In the last month, how often have you felt that you were on top of things?",
    "In the last month, how often have you been angered because of things that happened that were outside of your control?",
    "In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?"
  ];

  const options = [
    { value: "0", label: "Never" },
    { value: "1", label: "Almost never" },
    { value: "2", label: "Sometimes" },
    { value: "3", label: "Fairly often" },
    { value: "4", label: "Very often" }
  ];

  // Questions 4, 5, 7, 8 are reverse scored
  const reverseScored = [3, 4, 6, 7];

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate total score with reverse scoring
      const totalScore = Object.entries(answers).reduce((sum, [questionIndex, value]) => {
        const numValue = parseInt(value);
        const isReverseScored = reverseScored.includes(parseInt(questionIndex));
        const score = isReverseScored ? 4 - numValue : numValue;
        return sum + score;
      }, 0);
      
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
      <Card className="shadow-medium border-energy/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-energy/10 rounded-full flex items-center justify-center mb-4">
            <Activity className="w-6 h-6 text-energy" />
          </div>
          <CardTitle className="text-2xl">Perceived Stress Scale</CardTitle>
          <CardDescription>
            Please indicate how often you felt or thought a certain way in the last month.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question */}
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

          {/* Navigation buttons */}
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

export default StressAssessment;