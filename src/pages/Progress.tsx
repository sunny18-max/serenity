import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Share2, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AssessmentChart from "@/components/charts/AssessmentChart";
import ProgressOverview from "@/components/charts/ProgressOverview";
import { format } from 'date-fns';
import { auth, db } from "@/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

interface AssessmentData {
  type: string;
  score: number;
  date: string;
  interpretation: string;
  answers: Record<string, string>;
}

const Progress = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<AssessmentData[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
      const fetchData = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setAssessments([]); // Ensure state is always an array
          return;
        }

        // Fetch user profile
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data());
        }

        // Fetch assessments from subcollection
        const assessmentsSnapshot = await getDocs(collection(db, "users", currentUser.uid, "assessments"));
        const assessmentsList = assessmentsSnapshot.docs.map(doc => doc.data());
        setAssessments(Array.isArray(assessmentsList) ? assessmentsList : []);
      };

      fetchData();
    }, []);

  const getAssessmentsByType = (type: string) => {
    return assessments.filter(assessment => assessment.type === type);
  };

  const generateReport = () => {
    const reportData = {
      user: user?.name || "User",
      generatedDate: new Date().toISOString(),
      summary: {
        totalAssessments: assessments.length,
        assessmentTypes: [...new Set(assessments.map(a => a.type))],
        dateRange: assessments.length > 0 ? {
          start: assessments[0].date,
          end: assessments[assessments.length - 1].date
        } : null
      },
      assessments: assessments,
      insights: generateInsights()
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `mental-health-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const generateInsights = () => {
    if (assessments.length === 0) return [];

    const insights = [];

    // Check for improvements
    const phq9Data = getAssessmentsByType('phq9');
    if (phq9Data.length >= 2) {
      const trend = phq9Data[phq9Data.length - 1].score - phq9Data[0].score;
      if (trend < 0) {
        insights.push({
          type: 'positive',
          message: `Your depression scores have improved by ${Math.abs(trend)} points since your first assessment.`
        });
      }
    }

    // Check consistency
    if (assessments.length >= 3) {
      insights.push({
        type: 'neutral',
        message: `You've completed ${assessments.length} assessments, showing consistent engagement with your mental health tracking.`
      });
    }

    // Check recent activity
    const recentAssessments = assessments.filter(a =>
      new Date(a.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    if (recentAssessments.length > 0) {
      insights.push({
        type: 'positive',
        message: `You've completed ${recentAssessments.length} assessment(s) this week - keep up the great work!`
      });
    }

    return insights;
  };

  const assessmentTypes = [
    { id: 'phq9', name: 'Depression (PHQ-9)', description: 'Track symptoms of depression over time' },
    { id: 'gad7', name: 'Anxiety (GAD-7)', description: 'Monitor generalized anxiety disorder symptoms' },
    { id: 'stress', name: 'Stress Level', description: 'Evaluate perceived stress and coping mechanisms' },
    { id: 'wellness', name: 'Overall Wellness', description: 'Overall well-being across life domains' },
    { id: 'sleep', name: 'Sleep Quality', description: 'Sleep patterns and quality assessment' }
  ];

  const insights = generateInsights();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Progress Reports
              </h1>
              <p className="text-muted-foreground">Comprehensive view of your mental health journey</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={generateReport} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-medium">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{assessments.length}</p>
                  <p className="text-sm text-muted-foreground">Total Assessments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-wellness/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-wellness" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{user?.wellnessScore || 0}</p>
                  <p className="text-sm text-muted-foreground">Wellness Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-energy/10 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-energy" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{user?.streak || 0}</p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Badge variant="secondary" className="text-xs">
                    {[...new Set(assessments.map(a => a.type))].length}
                  </Badge>
                </div>
                <div>
                  <p className="text-2xl font-bold">{[...new Set(assessments.map(a => a.type))].length}</p>
                  <p className="text-sm text-muted-foreground">Assessment Types</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <Card className="shadow-medium mb-8">
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
              <CardDescription>Personalized insights based on your assessment history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      insight.type === 'positive' ? 'bg-wellness' :
                      insight.type === 'negative' ? 'bg-destructive' : 'bg-primary'
                    }`} />
                    <p className="text-sm flex-1">{insight.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Charts</TabsTrigger>
            <TabsTrigger value="history">Assessment History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ProgressOverview assessments={assessments} user={user} />
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {assessmentTypes.map((type) => {
                const data = getAssessmentsByType(type.id);
                if (data.length === 0) return null;

                return (
                  <AssessmentChart
                    key={type.id}
                    data={data}
                    type="line"
                    title={type.name}
                    description={type.description}
                  />
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Assessment History</CardTitle>
                <CardDescription>Complete history of all your assessments</CardDescription>
              </CardHeader>
              <CardContent>
                {assessments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No assessments completed yet</p>
                    <p className="text-sm">Start your mental health journey by taking an assessment</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assessments
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((assessment, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-medium capitalize">
                              {assessment.type === 'phq9' ? 'PHQ-9 Depression' :
                               assessment.type === 'gad7' ? 'GAD-7 Anxiety' :
                               assessment.type === 'stress' ? 'Stress Assessment' :
                               assessment.type === 'wellness' ? 'Wellness Assessment' :
                               assessment.type === 'sleep' ? 'Sleep Quality' :
                               assessment.type} Assessment
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(assessment.date), 'PPP')} at {format(new Date(assessment.date), 'p')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold">Score: {assessment.score}</p>
                            <Badge variant="secondary" className="text-xs">
                              {assessment.interpretation}
                            </Badge>
                          </div>
                        </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Progress;