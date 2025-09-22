import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Assessment = () => {
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const questions = [
    { id: 1, text: "Little interest or pleasure in doing things?" },
    { id: 2, text: "Feeling down, depressed, or hopeless?" },
    { id: 3, text: "Trouble falling or staying asleep, or sleeping too much?" },
    { id: 4, text: "Feeling tired or having little energy?" },
    { id: 5, text: "Poor appetite or overeating?" },
    { id: 6, text: "Feeling bad about yourself — or that you are a failure?" },
    { id: 7, text: "Trouble concentrating on things?" },
    { id: 8, text: "Moving or speaking so slowly that others noticed?" },
    { id: 9, text: "Thoughts that you would be better off dead?" },
  ];

  const handleAnswer = (questionId: number, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmitAssessment = async () => {
    setIsSubmitting(true);
    try {
      // Store assessment results in localStorage
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const assessmentResult = {
        date: new Date().toISOString(),
        answers: answers,
        score: Object.values(answers).reduce((sum: number, val: any) => sum + parseInt(val || "0"), 0)
      };

      const assessments = JSON.parse(localStorage.getItem("assessments") || "[]");
      assessments.push(assessmentResult);
      localStorage.setItem("assessments", JSON.stringify(assessments));

      // Update user data
      user.hasCompletedInitialAssessment = true;
      user.assessmentsCount = (user.assessmentsCount || 0) + 1;
      user.wellnessScore = Math.max(0, 100 - (Number(assessmentResult.score) * 4)); // Convert PHQ-9 to wellness score
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (error) {
      console.error("Assessment error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Daily Assessment (PHQ-9)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((q) => (
            <div key={q.id}>
              <Label>{q.text}</Label>
              <RadioGroup onValueChange={(value) => handleAnswer(q.id, value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id={`q${q.id}-0`} />
                  <Label htmlFor={`q${q.id}-0`}>Not at all</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id={`q${q.id}-1`} />
                  <Label htmlFor={`q${q.id}-1`}>Several days</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id={`q${q.id}-2`} />
                  <Label htmlFor={`q${q.id}-2`}>More than half the days</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id={`q${q.id}-3`} />
                  <Label htmlFor={`q${q.id}-3`}>Nearly every day</Label>
                </div>
              </RadioGroup>
            </div>
          ))}
          <Button 
            onClick={handleSubmitAssessment} 
            disabled={isSubmitting || Object.keys(answers).length < questions.length}
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : "Submit Assessment"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Assessment;