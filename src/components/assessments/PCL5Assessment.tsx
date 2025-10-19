import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle } from "lucide-react";

interface PCL5AssessmentProps {
  onComplete: (score: number, answers: Record<string, string>) => void;
  onBack: () => void;
}

const PCL5Assessment = ({ onComplete, onBack }: PCL5AssessmentProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions = [
    "Repeated, disturbing, and unwanted memories of the stressful experience?",
    "Repeated, disturbing dreams of the stressful experience?",
    "Suddenly feeling or acting as if the stressful experience were actually happening again?",
    "Feeling very upset when something reminded you of the stressful experience?",
    "Having strong physical reactions when something reminded you of the stressful experience?",
    "Avoiding memories, thoughts, or feelings related to the stressful experience?",
    "Avoiding external reminders of the stressful experience?",
    "Trouble remembering important parts of the stressful experience?",
    "Having strong negative beliefs about yourself, other people, or the world?",
    "Blaming yourself or someone else for the stressful experience?",
    "Having strong negative feelings such as fear, horror, anger, guilt, or shame?",
    "Loss of interest in activities that you used to enjoy?",
    "Feeling distant or cut off from other people?",
    "Trouble experiencing positive feelings?",
    "Irritable behavior, angry outbursts, or acting aggressively?",
    "Taking too many risks or doing things that could cause you harm?",
    "Being 'superalert' or watchful or on guard?",
    "Feeling jumpy or easily startled?",
    "Having difficulty concentrating?",
    "Trouble falling or staying asleep?"
  ];

  const options = [
    { value: "0", label: "Not at all" },
    { value: "1", label: "A little bit" },
    { value: "2", label: "Moderately" },
    { value: "3", label: "Quite a bit" },
    { value: "4", label: "Extremely" }
  ];

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate total score
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
      <Card className="shadow-medium border-energy/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-energy/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-energy" />
          </div>
          <CardTitle className="text-2xl">PCL-5 PTSD Assessment</CardTitle>
          <CardDescription>
            In the past month, how much have you been bothered by the following problems?
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
                className="min-w-24 bg-energy hover:bg-energy/90"
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

export default PCL5Assessment;