import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  BookOpen, 
  ExternalLink, 
  Search, 
  Download, 
  Video, 
  FileText, 
  Headphones,
  Heart,
  Brain,
  Shield,
  Users,
  Phone,
  Globe,
  Sparkles,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
import MobileBottomNav from "@/components/MobileBottomNav";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: "article" | "video" | "audio" | "pdf" | "tool" | "hotline";
  url: string;
  author?: string;
  duration?: string;
  tags: string[];
}

const resources: Resource[] = [
  {
    id: "1",
    title: "Understanding Depression: A Comprehensive Guide",
    description: "Learn about the symptoms, causes, and treatment options for depression from leading mental health experts.",
    category: "Mental Health Education",
    type: "article",
    url: "https://www.nimh.nih.gov/health/topics/depression",
    author: "NIMH",
    tags: ["depression", "education", "symptoms"]
  },
  {
    id: "2",
    title: "Anxiety Management Techniques",
    description: "Practical strategies and exercises to help manage anxiety in daily life.",
    category: "Self-Help",
    type: "video",
    url: "https://www.youtube.com/watch?v=WWloIAQpMcQ",
    author: "Therapy in a Nutshell",
    duration: "15 min",
    tags: ["anxiety", "coping", "techniques"]
  },
  {
    id: "3",
    title: "Mindfulness Meditation for Beginners",
    description: "Guided meditation sessions to help reduce stress and improve mental clarity.",
    category: "Mindfulness",
    type: "audio",
    url: "https://www.headspace.com/meditation/mindfulness",
    author: "Headspace",
    duration: "10-20 min",
    tags: ["meditation", "mindfulness", "stress"]
  },
  {
    id: "4",
    title: "Mental Health First Aid Manual",
    description: "Essential guide for recognizing and responding to mental health crises.",
    category: "Crisis Support",
    type: "pdf",
    url: "https://www.mentalhealthfirstaid.org/",
    author: "Mental Health First Aid",
    tags: ["crisis", "first aid", "emergency"]
  },
  {
    id: "5",
    title: "PHQ-9 Depression Assessment",
    description: "Validated screening tool for depression symptoms and severity.",
    category: "Assessment Tools",
    type: "tool",
    url: "/assessment-center",
    author: "Serenity Platform",
    tags: ["assessment", "depression", "screening"]
  },
  {
    id: "6",
    title: "988 Suicide & Crisis Lifeline",
    description: "24/7 free and confidential support for people in distress and their loved ones.",
    category: "Crisis Support",
    type: "hotline",
    url: "tel:988",
    author: "SAMHSA",
    tags: ["crisis", "suicide", "emergency", "24/7"]
  },
  {
    id: "7",
    title: "PTSD: What You Need to Know",
    description: "Comprehensive information about post-traumatic stress disorder, its symptoms, and treatment options.",
    category: "Mental Health Education",
    type: "article",
    url: "https://www.ptsd.va.gov/understand/what/index.asp",
    author: "VA National Center for PTSD",
    tags: ["ptsd", "trauma", "veterans"]
  },
  {
    id: "8",
    title: "Sleep Hygiene for Mental Health",
    description: "Learn how proper sleep habits can significantly impact your mental well-being.",
    category: "Self-Help",
    type: "video",
    url: "https://www.youtube.com/watch?v=nm1TxQj9IsQ",
    author: "Sleep Foundation",
    duration: "12 min",
    tags: ["sleep", "hygiene", "wellness"]
  }
];

const categories = [
  "All",
  "Mental Health Education",
  "Self-Help",
  "Mindfulness",
  "Crisis Support",
  "Assessment Tools"
];

const Resources = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("all");

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "All" || resource.category === selectedCategory;
    const matchesType = selectedType === "all" || resource.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "article": return <FileText className="w-4 h-4" />;
      case "video": return <Video className="w-4 h-4" />;
      case "audio": return <Headphones className="w-4 h-4" />;
      case "pdf": return <Download className="w-4 h-4" />;
      case "tool": return <Brain className="w-4 h-4" />;
      case "hotline": return <Phone className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "article": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "video": return "bg-red-500/10 text-red-600 border-red-500/20";
      case "audio": return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "pdf": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "tool": return "bg-primary/10 text-primary border-primary/20";
      case "hotline": return "bg-red-600/10 text-red-700 border-red-600/20";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-16 lg:pb-0">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-7xl">
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4"
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
              <Badge className="mb-2 px-3 py-1 bg-primary/20 border-primary/50 text-primary dark:bg-primary/30 dark:border-primary/60 dark:text-primary">
                <BookOpen className="w-3 h-3 mr-1" />
                Learning Hub
              </Badge>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Mental Health Resources
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">Evidence-based tools and educational content</p>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          className="mb-8 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto">
              <TabsTrigger 
                value="all" 
                className="text-xs sm:text-sm px-2 sm:px-4 py-2"
                onClick={() => setSelectedType("all")}
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="article" 
                className="text-xs sm:text-sm px-2 sm:px-4 py-2"
                onClick={() => setSelectedType("article")}
              >
                <FileText className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Articles</span>
              </TabsTrigger>
              <TabsTrigger 
                value="video" 
                className="text-xs sm:text-sm px-2 sm:px-4 py-2"
                onClick={() => setSelectedType("video")}
              >
                <Video className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Videos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="audio" 
                className="text-xs sm:text-sm px-2 sm:px-4 py-2"
                onClick={() => setSelectedType("audio")}
              >
                <Headphones className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Audio</span>
              </TabsTrigger>
              <TabsTrigger 
                value="tool" 
                className="text-xs sm:text-sm px-2 sm:px-4 py-2"
                onClick={() => setSelectedType("tool")}
              >
                <Brain className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Tools</span>
              </TabsTrigger>
              <TabsTrigger 
                value="hotline" 
                className="text-xs sm:text-sm px-2 sm:px-4 py-2"
                onClick={() => setSelectedType("hotline")}
              >
                <Phone className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Crisis</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="text-xs sm:text-sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Resources Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {filteredResources.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No resources found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge className={`${getTypeColor(resource.type)} text-xs`}>
                        {getTypeIcon(resource.type)}
                        <span className="ml-1 capitalize">{resource.type}</span>
                      </Badge>
                      {resource.type === "hotline" && (
                        <Badge className="bg-red-100 text-red-700 text-xs animate-pulse">
                          24/7
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                      {resource.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {resource.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{resource.author}</span>
                        {resource.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {resource.duration}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {resource.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <Button 
                        className="w-full group-hover:bg-primary/90 transition-colors"
                        onClick={() => {
                          if (resource.type === "hotline") {
                            window.location.href = resource.url;
                          } else if (resource.url.startsWith("/")) {
                            navigate(resource.url);
                          } else {
                            window.open(resource.url, "_blank");
                          }
                        }}
                      >
                        {resource.type === "hotline" ? (
                          <>
                            <Phone className="w-4 h-4 mr-2" />
                            Call Now
                          </>
                        ) : resource.url.startsWith("/") ? (
                          <>
                            <Brain className="w-4 h-4 mr-2" />
                            Use Tool
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Access Resource
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Emergency Resources Banner */}
        <motion.div 
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-1">
                    Crisis Support Available 24/7
                  </h3>
                  <p className="text-red-700 dark:text-red-300 text-sm mb-3">
                    If you're experiencing a mental health crisis, immediate help is available.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => window.location.href = "tel:988"}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call 988
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300"
                      onClick={() => navigate("/emergency-help")}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      More Help
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default Resources;