import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Share2, Calendar, TrendingUp, BarChart3, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AssessmentChart from "@/components/charts/AssessmentChart";
import ProgressOverview from "@/components/charts/ProgressOverview";
import { format } from 'date-fns';
import { auth, db } from "@/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
        const assessmentsList = assessmentsSnapshot.docs.map(doc => doc.data() as AssessmentData);
        setAssessments(Array.isArray(assessmentsList) ? assessmentsList : []);
      };

      fetchData();
    }, []);

  const getAssessmentsByType = (type: string) => {
    return assessments.filter(assessment => assessment.type === type);
  };

  const generatePDFReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Title
    doc.setFontSize(22);
    doc.setTextColor(99, 102, 241);
    doc.text('Progress Report', pageWidth / 2, 20, { align: 'center' });

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${format(new Date(), 'PPP')}`, pageWidth / 2, 28, { align: 'center' });

    // User Info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`User: ${user?.name || 'Anonymous'}`, 14, 40);
    doc.text(`Wellness Score: ${user?.wellness_score || 0}`, 14, 47);
    doc.text(`Current Streak: ${user?.streak || 0} days`, 14, 54);
    doc.text(`Total Assessments: ${assessments.length}`, 14, 61);

    // Assessments Table
    if (assessments.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(99, 102, 241);
      doc.text('Assessment History', 14, 75);

      const tableData = assessments.slice(0, 10).map(a => [
        format(new Date(a.date), 'MMM dd, yyyy'),
        a.type.toUpperCase(),
        a.score.toString(),
        a.interpretation
      ]);

      autoTable(doc, {
        startY: 80,
        head: [['Date', 'Type', 'Score', 'Interpretation']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241] },
      });
    }

    // Insights
    const insights = generateInsights();
    if (insights.length > 0) {
      const finalY = (doc as any).lastAutoTable?.finalY || 85;
      doc.setFontSize(14);
      doc.setTextColor(99, 102, 241);
      doc.text('Key Insights', 14, finalY + 15);

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      let yPos = finalY + 22;
      insights.forEach((insight, index) => {
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = 20;
        }
        const lines = doc.splitTextToSize(`• ${insight.message}`, pageWidth - 28);
        doc.text(lines, 14, yPos);
        yPos += lines.length * 5 + 3;
      });
    }

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Serenity - Mental Wellness Platform | Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    doc.save(`serenity-progress-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const handleShare = () => {
    const shareText = `I've been tracking my mental wellness journey with Serenity! 🌟\n\n📊 Progress Summary:\n• ${assessments.length} assessments completed\n• ${user?.streak || 0} day streak\n• Wellness Score: ${user?.wellness_score || 0}\n\nTaking care of mental health matters! #MentalHealth #Wellness #SelfCare`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Mental Wellness Progress',
        text: shareText,
      }).catch(() => {});
    } else {
      // Fallback: Copy to clipboard and show social media options
      navigator.clipboard.writeText(shareText);
      
      const shareUrls = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      };
      
      // Show options dialog
      const choice = confirm('Share on social media?\n\nOK = Twitter\nCancel = Copy to clipboard (Done!)');
      if (choice) {
        window.open(shareUrls.twitter, '_blank');
      }
    }
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

    // Check PTSD improvements
    const pcl5Data = getAssessmentsByType('pcl5');
    if (pcl5Data.length >= 2) {
      const trend = pcl5Data[pcl5Data.length - 1].score - pcl5Data[0].score;
      if (trend < 0) {
        insights.push({
          type: 'positive',
          message: `Your PTSD symptoms have improved by ${Math.abs(trend)} points since your first assessment.`
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
    { id: 'pcl5', name: 'PTSD (PCL-5)', description: 'Track post-traumatic stress disorder symptoms' },
    { id: 'stress', name: 'Stress Level', description: 'Evaluate perceived stress and coping mechanisms' },
    { id: 'wellness', name: 'Overall Wellness', description: 'Overall well-being across life domains' },
    { id: 'sleep', name: 'Sleep Quality', description: 'Sleep patterns and quality assessment' }
  ];

  const insights = generateInsights();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <Badge className="mb-2 px-3 py-1 bg-primary/10 border-primary/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Your Journey
              </Badge>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Progress Reports
              </h1>
              <p className="text-muted-foreground">Comprehensive view of your mental health journey</p>
            </div>
          </div>

          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button variant="outline" onClick={generatePDFReport} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={handleShare} className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </motion.div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: BarChart3, value: assessments.length, label: "Total Assessments", color: "primary" },
            { icon: TrendingUp, value: user?.wellness_score || 0, label: "Wellness Score", color: "wellness" },
            { icon: Calendar, value: user?.streak || 0, label: "Day Streak", color: "energy" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className="shadow-medium hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className={`w-10 h-10 bg-${stat.color}/10 rounded-full flex items-center justify-center`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <stat.icon className={`w-5 h-5 text-${stat.color}`} />
                    </motion.div>
                    <div>
                      <motion.p 
                        className="text-2xl font-bold"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.3, type: "spring" }}
                      >
                        {stat.value}
                      </motion.p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          
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
                               assessment.type === 'pcl5' ? 'PCL-5 PTSD' :
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