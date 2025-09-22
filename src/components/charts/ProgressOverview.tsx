import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Calendar, Target } from "lucide-react";
import { format, subDays, eachDayOfInterval } from 'date-fns';

interface AssessmentData {
  type: string;
  score: number;
  date: string;
  interpretation: string;
}

const ProgressOverview = () => {
  const [assessments, setAssessments] = useState<AssessmentData[]>([]);
  const [wellnessData, setWellnessData] = useState<any[]>([]);

  useEffect(() => {
    const storedAssessments = localStorage.getItem("assessments");
    if (storedAssessments) {
      setAssessments(JSON.parse(storedAssessments));
    }

    // Generate mock wellness data for the last 30 days
    const endDate = new Date();
    const startDate = subDays(endDate, 29);
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    
    const mockWellnessData = dateRange.map((date, index) => ({
      date: format(date, 'MMM dd'),
      mood: Math.floor(Math.random() * 3) + 6 + Math.sin(index * 0.1) * 2, // Simulate mood variations
      energy: Math.floor(Math.random() * 3) + 5 + Math.cos(index * 0.15) * 1.5,
      sleep: Math.floor(Math.random() * 2) + 6 + Math.sin(index * 0.2) * 1,
      stress: Math.floor(Math.random() * 3) + 3 + Math.sin(index * 0.25) * 1.5,
    }));
    
    setWellnessData(mockWellnessData);
  }, []);

  const getAssessmentsByType = (type: string) => {
    return assessments.filter(assessment => assessment.type === type);
  };

  const getTrend = (data: AssessmentData[]) => {
    if (data.length < 2) return { trend: 'stable', change: 0 };
    
    const recent = data.slice(-2);
    const change = recent[1].score - recent[0].score;
    
    if (change > 0) return { trend: 'up', change };
    if (change < 0) return { trend: 'down', change: Math.abs(change) };
    return { trend: 'stable', change: 0 };
  };

  const renderTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <Minus className="w-4 h-4 text-yellow-500" />;
    }
  };

  const assessmentTypes = [
    { id: 'phq9', name: 'Depression (PHQ-9)', color: '#8b5cf6' },
    { id: 'gad7', name: 'Anxiety (GAD-7)', color: '#06b6d4' },
    { id: 'stress', name: 'Stress Level', color: '#f59e0b' },
    { id: 'wellness', name: 'Overall Wellness', color: '#10b981' },
    { id: 'sleep', name: 'Sleep Quality', color: '#6366f1' }
  ];

  return (
    <div className="space-y-6">
      {/* Overall Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {assessmentTypes.map((type) => {
          const data = getAssessmentsByType(type.id);
          const trend = getTrend(data);
          const latest = data[data.length - 1];
          
          return (
            <Card key={type.id} className="shadow-medium">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">{type.name}</h3>
                  {renderTrendIcon(trend.trend)}
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold" style={{ color: type.color }}>
                    {latest ? latest.score : '--'}
                  </p>
                  <div className="flex items-center gap-2">
                    {latest && (
                      <Badge variant="secondary" className="text-xs">
                        {latest.interpretation}
                      </Badge>
                    )}
                    {trend.change !== 0 && (
                      <span className="text-xs text-muted-foreground">
                        {trend.trend === 'up' ? '+' : '-'}{trend.change}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Charts */}
      <Tabs defaultValue="assessments" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assessments">Assessment Progress</TabsTrigger>
          <TabsTrigger value="wellness">Daily Wellness</TabsTrigger>
        </TabsList>
        
        <TabsContent value="assessments" className="space-y-4">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Assessment Score Trends
              </CardTitle>
              <CardDescription>
                Track your progress across different mental health assessments over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assessments.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <div className="text-center">
                    <p>No assessment data available</p>
                    <p className="text-sm">Complete assessments to see your progress trends</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="date" 
                      type="category"
                      allowDuplicatedCategory={false}
                    />
                    <YAxis />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-card p-3 rounded-lg shadow-lg border">
                              <p className="font-medium">{label}</p>
                              {payload.map((entry: any, index) => (
                                <p key={index} className="text-sm" style={{ color: entry.color }}>
                                  {entry.dataKey}: {entry.value}
                                </p>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {assessmentTypes.map((type) => {
                      const data = getAssessmentsByType(type.id).map(item => ({
                        date: format(new Date(item.date), 'MMM dd'),
                        [type.id]: item.score
                      }));
                      
                      if (data.length === 0) return null;
                      
                      return (
                        <Line
                          key={type.id}
                          type="monotone"
                          dataKey={type.id}
                          data={data}
                          stroke={type.color}
                          strokeWidth={2}
                          dot={{ fill: type.color, strokeWidth: 2, r: 4 }}
                          connectNulls={false}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="wellness" className="space-y-4">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Daily Wellness Tracking
              </CardTitle>
              <CardDescription>
                Monitor your daily mood, energy, sleep, and stress levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={wellnessData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card p-3 rounded-lg shadow-lg border">
                            <p className="font-medium">{label}</p>
                            {payload.map((entry: any, index) => (
                              <p key={index} className="text-sm" style={{ color: entry.color }}>
                                {entry.dataKey}: {entry.value}/10
                              </p>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="mood"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="energy"
                    stackId="2"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="sleep"
                    stackId="3"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="stress"
                    stackId="4"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressOverview;