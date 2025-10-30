import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import MobileBottomNav from "@/components/MobileBottomNav";
import { InteractiveHelpMap } from "@/components/InteractiveHelpMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { 
  Phone,
  MessageCircle,
  Heart,
  Shield,
  AlertTriangle,
  ExternalLink,
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Headphones,
  Mail,
  Globe,
  Map
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HotlineResource {
  id: string;
  name: string;
  description: string;
  phone: string;
  available: string;
  type: "crisis" | "support" | "text" | "chat";
  icon: any;
  website?: string;
  textNumber?: string;
}

const hotlines: HotlineResource[] = [
  {
    id: "988",
    name: "988 Suicide & Crisis Lifeline",
    description: "24/7 free and confidential support for people in distress",
    phone: "988",
    available: "24/7",
    type: "crisis",
    icon: Phone,
    website: "https://988lifeline.org",
    textNumber: "988"
  },
  {
    id: "crisis-text",
    name: "Crisis Text Line",
    description: "Free 24/7 support via text message",
    phone: "",
    textNumber: "741741",
    available: "24/7",
    type: "text",
    icon: MessageCircle,
    website: "https://www.crisistextline.org"
  },
  {
    id: "samhsa",
    name: "SAMHSA National Helpline",
    description: "Treatment referral and information service",
    phone: "1-800-662-4357",
    available: "24/7",
    type: "support",
    icon: Headphones,
    website: "https://www.samhsa.gov"
  },
  {
    id: "nami",
    name: "NAMI HelpLine",
    description: "Information, resources and referrals",
    phone: "1-800-950-6264",
    available: "Mon-Fri, 10am-10pm ET",
    type: "support",
    icon: Users,
    website: "https://www.nami.org"
  },
  {
    id: "trevor",
    name: "The Trevor Project",
    description: "Crisis support for LGBTQ+ youth",
    phone: "1-866-488-7386",
    textNumber: "678678",
    available: "24/7",
    type: "crisis",
    icon: Heart,
    website: "https://www.thetrevorproject.org"
  },
  {
    id: "veterans",
    name: "Veterans Crisis Line",
    description: "Support for veterans and their families",
    phone: "988 (Press 1)",
    textNumber: "838255",
    available: "24/7",
    type: "crisis",
    icon: Shield,
    website: "https://www.veteranscrisisline.net"
  }
];

const copingStrategies = [
  {
    title: "Grounding Technique",
    description: "5-4-3-2-1 method to stay present",
    steps: [
      "Name 5 things you can see",
      "Name 4 things you can touch",
      "Name 3 things you can hear",
      "Name 2 things you can smell",
      "Name 1 thing you can taste"
    ]
  },
  {
    title: "Box Breathing",
    description: "Calm your nervous system",
    steps: [
      "Breathe in for 4 counts",
      "Hold for 4 counts",
      "Breathe out for 4 counts",
      "Hold for 4 counts",
      "Repeat 4 times"
    ]
  },
  {
    title: "Safe Place Visualization",
    description: "Create mental calm",
    steps: [
      "Close your eyes",
      "Imagine a place where you feel safe",
      "Notice the details - colors, sounds, smells",
      "Stay there for a few minutes",
      "Return when ready"
    ]
  }
];

const EmergencyHelp = () => {
  const [selectedHotline, setSelectedHotline] = useState<HotlineResource | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleText = (number: string) => {
    window.location.href = `sms:${number}`;
  };

  const downloadSafetyPlan = () => {
    const safetyPlanContent = `MENTAL HEALTH SAFETY PLAN

Date Created: ${new Date().toLocaleDateString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. WARNING SIGNS
   Identify thoughts, images, moods, situations, and behaviors that indicate a crisis may be developing:

   • _________________________________________________________________
   • _________________________________________________________________
   • _________________________________________________________________
   • _________________________________________________________________
   • _________________________________________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. INTERNAL COPING STRATEGIES
   Things I can do on my own to take my mind off problems without contacting another person:

   • _________________________________________________________________
   • _________________________________________________________________
   • _________________________________________________________________
   • _________________________________________________________________
   • _________________________________________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. SOCIAL CONTACTS AND SETTINGS
   People and social settings that provide distraction:

   Name: ___________________________  Phone: _________________________
   Name: ___________________________  Phone: _________________________
   Name: ___________________________  Phone: _________________________

   Places I can go:
   • _________________________________________________________________
   • _________________________________________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. PEOPLE I CAN ASK FOR HELP
   
   Name: ___________________________  Phone: _________________________
   Relationship: _____________________________________________________

   Name: ___________________________  Phone: _________________________
   Relationship: _____________________________________________________

   Name: ___________________________  Phone: _________________________
   Relationship: _____________________________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5. PROFESSIONALS AND AGENCIES I CAN CONTACT

   Therapist/Counselor: ______________________________________________
   Phone: ___________________________  Available: ____________________

   Doctor: ___________________________________________________________
   Phone: ___________________________  Available: ____________________

   Local Emergency Services: _________________________________________
   Phone: ___________________________

   Crisis Hotline: 988 Suicide & Crisis Lifeline
   Phone: 988 (24/7)

   Crisis Text Line: Text "HELLO" to 741741 (24/7)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6. MAKING THE ENVIRONMENT SAFE

   Steps I can take to make my environment safer:

   • _________________________________________________________________
   • _________________________________________________________________
   • _________________________________________________________________
   • _________________________________________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

7. REASONS FOR LIVING

   • _________________________________________________________________
   • _________________________________________________________________
   • _________________________________________________________________
   • _________________________________________________________________
   • _________________________________________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REMEMBER:
• Keep this plan in a place where you can access it easily
• Share it with trusted friends, family, or your therapist
• Review and update it regularly
• In immediate danger, call 911 or go to the nearest emergency room

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generated by Serenity Mental Health Wellness App
${new Date().toLocaleString()}`;

    const blob = new Blob([safetyPlanContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Safety-Plan-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Safety Plan Downloaded",
      description: "Your safety plan template has been downloaded successfully.",
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "crisis": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "support": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "text": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "chat": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-orange-50 dark:from-gray-900 dark:via-background dark:to-gray-800 pb-16 lg:pb-0">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-7xl">
        {/* Emergency Alert */}
        <Alert className="mb-6 border-red-500/50 bg-red-500/10">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <AlertTitle className="text-red-500 font-bold">If you're in immediate danger</AlertTitle>
          <AlertDescription className="text-red-500/90">
            Call 911 or go to your nearest emergency room. These resources are for support but not emergency medical care.
          </AlertDescription>
        </Alert>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-glow">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                Emergency Support
              </h1>
              <p className="text-muted-foreground mt-1">
                You're not alone. Help is available 24/7
              </p>
            </div>
          </div>
          <Badge className="bg-green-500 text-white">
            <Clock className="w-3 h-3 mr-1" />
            Available Now
          </Badge>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="map" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              Map
            </TabsTrigger>
            <TabsTrigger value="hotlines" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Hotlines
            </TabsTrigger>
            <TabsTrigger value="coping" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Coping
            </TabsTrigger>
          </TabsList>

          {/* Map Tab */}
          <TabsContent value="map" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-primary" />
                Find Help Centers Worldwide
              </h2>
              <p className="text-muted-foreground mb-6">
                Browse the interactive map to find mental health facilities near you or anywhere in the world
              </p>
              <InteractiveHelpMap />
            </div>
          </TabsContent>

          {/* Hotlines Tab */}
          <TabsContent value="hotlines" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Phone className="w-6 h-6 text-primary" />
                Crisis Hotlines & Support
              </h2>
              
              <div className="space-y-4">
                {hotlines.map(hotline => {
                  const Icon = hotline.icon;
                  
                  return (
                    <Card 
                      key={hotline.id}
                      className={cn(
                        "shadow-medium border-2 transition-all cursor-pointer hover:shadow-glow",
                        selectedHotline?.id === hotline.id ? "border-primary" : "border-primary/10"
                      )}
                      onClick={() => setSelectedHotline(hotline)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <CardTitle className="text-lg">{hotline.name}</CardTitle>
                                <Badge className={cn("text-xs", getTypeColor(hotline.type))}>
                                  {hotline.type}
                                </Badge>
                              </div>
                              <CardDescription>{hotline.description}</CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">Available:</span>
                            <span className="text-muted-foreground">{hotline.available}</span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {hotline.phone && (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCall(hotline.phone);
                                }}
                                className="bg-gradient-primary"
                                size="sm"
                              >
                                <Phone className="w-4 h-4 mr-2" />
                                Call {hotline.phone}
                              </Button>
                            )}
                            
                            {hotline.textNumber && (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleText(hotline.textNumber!);
                                }}
                                variant="outline"
                                size="sm"
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Text {hotline.textNumber}
                              </Button>
                            )}
                            
                            {hotline.website && (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(hotline.website, '_blank');
                                }}
                                variant="outline"
                                size="sm"
                              >
                                <Globe className="w-4 h-4 mr-2" />
                                Website
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* International Resources */}
            <Card className="shadow-medium border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  International Resources
                </CardTitle>
                <CardDescription>
                  Crisis support worldwide
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-medium">Find Help Worldwide</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Visit findahelpline.com for crisis support in your country
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('https://findahelpline.com', '_blank')}
                    >
                      Visit Website
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coping Tab */}
          <TabsContent value="coping" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Heart className="w-6 h-6 text-primary" />
                Immediate Coping Strategies
              </h2>
              <p className="text-muted-foreground mb-6">
                Try these techniques while waiting for support
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {copingStrategies.map((strategy, index) => (
                  <Card key={index} className="shadow-medium border-primary/10">
                    <CardHeader>
                      <CardTitle className="text-lg">{strategy.title}</CardTitle>
                      <CardDescription>{strategy.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-2">
                        {strategy.steps.map((step, idx) => (
                          <li key={idx} className="text-sm flex gap-2">
                            <span className="text-primary font-medium">{idx + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Alert className="border-primary/20 bg-primary/5 mt-6">
                <Heart className="h-4 w-4 text-primary" />
                <AlertTitle className="text-sm">Remember</AlertTitle>
                <AlertDescription className="text-xs">
                  These feelings are temporary. You've gotten through difficult times before, and you can get through this too.
                </AlertDescription>
              </Alert>

              <Button 
                className="w-full lg:w-auto bg-gradient-primary mt-4"
                onClick={() => navigate("/ai-therapist")}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Talk to AI Companion
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Safety Plan Section */}
        <Card className="shadow-medium border-primary/10 mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Create Your Safety Plan
            </CardTitle>
            <CardDescription>
              Having a plan can help during difficult moments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Warning Signs</h4>
                <p className="text-sm text-muted-foreground">
                  Identify thoughts, images, moods, situations that indicate a crisis may be developing
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Coping Strategies</h4>
                <p className="text-sm text-muted-foreground">
                  List activities you can do on your own to take your mind off problems
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Support Contacts</h4>
                <p className="text-sm text-muted-foreground">
                  Keep a list of people and places that provide support and help
                </p>
              </div>
            </div>
            <Button className="mt-4" variant="outline" onClick={downloadSafetyPlan}>
              <Mail className="w-4 h-4 mr-2" />
              Download Safety Plan Template
            </Button>
          </CardContent>
        </Card>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default EmergencyHelp;
