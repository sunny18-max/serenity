import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

interface AssessmentData {
  type: string;
  score: number;
  date: string;
  interpretation: string;
}

interface AssessmentChartProps {
  data: AssessmentData[];
  type: 'line' | 'bar' | 'pie';
  title: string;
  description?: string;
}

const AssessmentChart = ({ data, type, title, description }: AssessmentChartProps) => {
  const getScoreColor = (score: number, assessmentType: string) => {
    if (assessmentType === 'phq9') {
      if (score <= 4) return '#10b981'; // green
      if (score <= 9) return '#f59e0b'; // yellow
      if (score <= 14) return '#f97316'; // orange
      return '#ef4444'; // red
    }
    if (assessmentType === 'gad7') {
      if (score <= 4) return '#10b981';
      if (score <= 9) return '#f59e0b';
      if (score <= 14) return '#f97316';
      return '#ef4444';
    }
    if (assessmentType === 'stress') {
      if (score <= 13) return '#10b981';
      if (score <= 26) return '#f59e0b';
      return '#ef4444';
    }
    return '#6366f1'; // default purple
  };

  const formatChartData = () => {
    return data.map((item, index) => ({
      ...item,
      date: format(new Date(item.date), 'MMM dd'),
      name: `Assessment ${index + 1}`,
      fill: getScoreColor(item.score, item.type)
    }));
  };

  const chartData = formatChartData();

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" className="text-sm" />
              <YAxis className="text-sm" />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card p-3 rounded-lg shadow-lg border">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm">Score: {data.score}</p>
                        <p className="text-sm text-muted-foreground">{data.interpretation}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" className="text-sm" />
              <YAxis className="text-sm" />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card p-3 rounded-lg shadow-lg border">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm">Score: {data.score}</p>
                        <p className="text-sm text-muted-foreground">{data.interpretation}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        const pieData = chartData.reduce((acc: any[], curr) => {
          const existing = acc.find(item => item.interpretation === curr.interpretation);
          if (existing) {
            existing.value += 1;
          } else {
            acc.push({
              name: curr.interpretation,
              value: 1,
              fill: curr.fill
            });
          }
          return acc;
        }, []);

        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  const getLatestScore = () => {
    if (data.length === 0) return null;
    const latest = data[data.length - 1];
    return latest;
  };

  const latest = getLatestScore();

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {latest && (
            <Badge 
              variant="secondary"
              className="text-sm"
              style={{ backgroundColor: getScoreColor(latest.score, latest.type) + '20', color: getScoreColor(latest.score, latest.type) }}
            >
              Latest: {latest.score} - {latest.interpretation}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <div className="text-center">
              <p>No assessment data available</p>
              <p className="text-sm">Complete an assessment to see your progress</p>
            </div>
          </div>
        ) : (
          renderChart()
        )}
      </CardContent>
    </Card>
  );
};

export default AssessmentChart;