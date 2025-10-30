import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Video, 
  Headphones, 
  FileText, 
  Search, 
  Download,
  Play,
  Bookmark,
  Share2,
  ExternalLink,
  Check,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [savedResources, setSavedResources] = useState<number[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const categories = [
    { id: "all", label: "All Resources" },
    { id: "articles", label: "Articles" },
    { id: "videos", label: "Videos" },
    { id: "audio", label: "Audio Guides" },
    { id: "tools", label: "Tools & Worksheets" }
  ];

  // Sample PDF download URLs
  const samplePDFs = [
    "https://www.nimh.nih.gov/health/topics/anxiety-disorders",
    "https://ggia.berkeley.edu/practice/mindful_breathing#data-tab-download",
    "https://www.cci.health.wa.gov.au/~/media/CCI/Mental-Health-Professionals/Depression/Depression---Information-Sheets/Depression-Information-Sheet---01---What-is-Depression.pdf",
    "https://www.apa.org/topics/stress/toolkit.pdf",
    "https://www.uhs.umich.edu/files/uhs/field/downloads/relaxation-skills.pdf",
    "https://store.samhsa.gov/sites/default/files/d7/priv/sma16-4955.pdf"
  ];

  // Sample video URLs
  const sampleVideos = [
    "https://youtu.be/6p_yaNFSYao", // Mindfulness meditation
    "https://youtu.be/LiUnFJ8P4gM", // Breathing exercises
    "https://youtu.be/0BbHW3H_xmo", // Stress management
    "https://youtu.be/WGG7MGgptxE", // Anxiety relief
    "https://youtu.be/g0jfhRcXtLQ", // Sleep meditation
    "https://youtu.be/_1h-zizAGsc"  // Progressive relaxation
  ];

  const resources = [
    {
      id: 1,
      title: "Understanding Anxiety Disorders",
      type: "article",
      category: "articles",
      description: "Comprehensive guide to understanding anxiety, its symptoms, and management techniques.",
      duration: "15 min read",
      icon: FileText,
      tags: ["Anxiety", "Education", "Self-help"],
      downloadUrl: samplePDFs[0],
      externalUrl: "https://www.nimh.nih.gov/health/topics/anxiety-disorders"
    },
    {
      id: 2,
      title: "Mindfulness Meditation Guide",
      type: "video",
      category: "videos",
      description: "Step-by-step guided meditation for beginners to practice mindfulness.",
      duration: "20 min",
      icon: Video,
      tags: ["Meditation", "Mindfulness", "Beginners"],
      videoUrl: sampleVideos[0],
      externalUrl: "https://www.mindful.org/meditation/mindfulness-getting-started/"
    },
    {
      id: 3,
      title: "Progressive Muscle Relaxation",
      type: "audio",
      category: "audio",
      description: "Audio guide for progressive muscle relaxation to reduce stress and tension.",
      duration: "15 min",
      icon: Headphones,
      tags: ["Relaxation", "Stress", "Sleep"],
      audioUrl: "https://youtu.be/_1h-zizAGsc", // Sample audio
      externalUrl: "https://www.uclahealth.org/medical-services/sleep-center/patient-resources/relaxation-mp3s"
    },
    {
      id: 4,
      title: "Cognitive Behavioral Therapy Workbook",
      type: "tool",
      category: "tools",
      description: "Interactive workbook with CBT exercises to challenge negative thought patterns.",
      duration: "Self-paced",
      icon: BookOpen,
      tags: ["CBT", "Workbook", "Exercises"],
      downloadUrl: samplePDFs[1],
      externalUrl: "https://www.psychologytools.com/downloads/cbt-worksheets-and-therapy-resources/"
    },
    {
      id: 5,
      title: "Building Resilience in Difficult Times",
      type: "article",
      category: "articles",
      description: "Learn strategies to build emotional resilience and cope with life's challenges.",
      duration: "12 min read",
      icon: FileText,
      tags: ["Resilience", "Coping", "Mental Strength"],
      downloadUrl: samplePDFs[2],
      externalUrl: "https://www.apa.org/topics/resilience"
    },
    {
      id: 6,
      title: "Breathing Techniques for Panic Attacks",
      type: "video",
      category: "videos",
      description: "Emergency breathing techniques to manage panic attacks and acute anxiety.",
      duration: "10 min",
      icon: Video,
      tags: ["Panic", "Breathing", "Emergency"],
      videoUrl: sampleVideos[1],
      externalUrl: "https://www.anxietycanada.com/articles/calm-breathing/"
    },
    {
      id: 7,
      title: "Daily Mood Tracker Worksheet",
      type: "tool",
      category: "tools",
      description: "Printable worksheet to track your daily moods and identify patterns.",
      duration: "Daily",
      icon: BookOpen,
      tags: ["Tracking", "Worksheet", "Daily"],
      downloadUrl: samplePDFs[3],
      externalUrl: "#"
    },
    {
      id: 8,
      title: "Sleep Hygiene Guide",
      type: "article",
      category: "articles",
      description: "Comprehensive guide to improving sleep quality and establishing healthy sleep habits.",
      duration: "18 min read",
      icon: FileText,
      tags: ["Sleep", "Hygiene", "Wellness"],
      downloadUrl: samplePDFs[4],
      externalUrl: "https://www.sleepfoundation.org/sleep-hygiene"
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || resource.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "article": return FileText;
      case "video": return Video;
      case "audio": return Headphones;
      case "tool": return BookOpen;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "article": return "bg-blue-100 text-blue-800";
      case "video": return "bg-purple-100 text-purple-800";
      case "audio": return "bg-green-100 text-green-800";
      case "tool": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Handle Download
  const handleDownload = (resource: any) => {
    if (resource.downloadUrl) {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = resource.downloadUrl;
      link.target = '_blank';
      link.download = `${resource.title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: `${resource.title} is being downloaded.`,
      });
    } else if (resource.videoUrl || resource.audioUrl) {
      // For videos and audio, open in new tab
      window.open(resource.externalUrl || resource.videoUrl || resource.audioUrl, '_blank');
    }
  };

  // Handle Watch/Listen
  const handleWatch = (resource: any) => {
    if (resource.videoUrl) {
      // Open video in a modal or new tab
      window.open(resource.videoUrl, '_blank');
    } else if (resource.audioUrl) {
      // For audio, you could create an audio player
      const audio = new Audio(resource.audioUrl);
      audio.play().catch(() => {
        // If autoplay fails, open in new tab
        window.open(resource.audioUrl, '_blank');
      });
    } else if (resource.externalUrl) {
      window.open(resource.externalUrl, '_blank');
    }
    
    toast({
      title: "Opening Content",
      description: `Opening ${resource.title}...`,
    });
  };

  // Handle Save/Bookmark
  const handleSave = (resourceId: number) => {
    setSavedResources(prev => {
      if (prev.includes(resourceId)) {
        // Remove from saved
        toast({
          title: "Removed from Saved",
          description: "Resource removed from your saved items.",
        });
        return prev.filter(id => id !== resourceId);
      } else {
        // Add to saved
        toast({
          title: "Saved for Later",
          description: "Resource added to your saved items.",
        });
        return [...prev, resourceId];
      }
    });
  };

  // Handle Share
  const handleShare = async (resource: any) => {
    const shareData = {
      title: resource.title,
      text: resource.description,
      url: resource.externalUrl || resource.downloadUrl || resource.videoUrl || window.location.href,
    };

    try {
      if (navigator.share) {
        // Use Web Share API if available (mobile devices)
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard and show social share options
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: "Link Copied!",
          description: "Resource link copied to clipboard. You can now share it.",
        });
        
        // Show social share options
        const socialUrls = {
          twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(resource.title)}&url=${encodeURIComponent(shareData.url)}`,
          facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`,
          linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`,
          whatsapp: `https://wa.me/?text=${encodeURIComponent(resource.title + ' ' + shareData.url)}`
        };

        // You could show a modal with these options, but for now we'll just log them
        console.log('Social share URLs:', socialUrls);
      }
    } catch (error) {
      console.log('Sharing failed:', error);
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareData.url);
      toast({
        title: "Link Copied!",
        description: "Resource link copied to clipboard.",
      });
    }
  };

  // Get appropriate button text and icon based on resource type
  const getActionButton = (resource: any) => {
    if (resource.type === "video") {
      return {
        text: "Watch",
        icon: Play,
        action: () => handleWatch(resource)
      };
    } else if (resource.type === "audio") {
      return {
        text: "Listen",
        icon: Headphones,
        action: () => handleWatch(resource)
      };
    } else if (resource.downloadUrl) {
      return {
        text: "Download",
        icon: Download,
        action: () => handleDownload(resource)
      };
    } else {
      return {
        text: "View",
        icon: ExternalLink,
        action: () => window.open(resource.externalUrl, '_blank')
      };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 cyber-grid">
      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="mb-4 px-4 py-2 bg-primary/10 border-primary/30">
            <BookOpen className="w-4 h-4 mr-2" />
            Curated Content
          </Badge>
          <h1 className="text-5xl font-bold mb-4 text-gradient-primary">Mental Wellness Resources</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Access curated articles, videos, audio guides, and tools to support your mental health journey.
          </p>
        </motion.div>

        {/* Search and Categories */}
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

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Button
                  variant={activeCategory === category.id ? "default" : "outline"}
                  onClick={() => setActiveCategory(category.id)}
                  className="text-sm"
                >
                  {category.label}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource, index) => {
            const Icon = getTypeIcon(resource.type);
            const actionButton = getActionButton(resource);
            const ActionIcon = actionButton.icon;
            const isSaved = savedResources.includes(resource.id);

            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                <Card className="hover:shadow-xl transition-all duration-300 group h-full border-2 hover:border-primary/30">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className={`p-2 rounded-lg ${getTypeColor(resource.type)}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <Badge variant="secondary" className={getTypeColor(resource.type)}>
                        {resource.type}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {resource.title}
                    </CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span>{resource.duration}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {resource.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSave(resource.id)}
                          className={isSaved ? "bg-green-50 border-green-200 text-green-700" : ""}
                        >
                          {isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleShare(resource)}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={actionButton.action}
                        className="flex items-center gap-1"
                      >
                        <ActionIcon className="w-4 h-4" />
                        {actionButton.text}
                      </Button>
                    </div>
                  </div>
                </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No resources found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Saved Resources Section */}
        {savedResources.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Bookmark className="w-6 h-6 text-primary" />
              Your Saved Resources ({savedResources.length})
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources
                .filter(resource => savedResources.includes(resource.id))
                .map(resource => {
                  const Icon = getTypeIcon(resource.type);
                  const actionButton = getActionButton(resource);
                  const ActionIcon = actionButton.icon;

                  return (
                    <Card key={resource.id} className="border-primary/20 bg-primary/5">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <div className={`p-2 rounded-lg ${getTypeColor(resource.type)}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Saved
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                        <CardDescription>{resource.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <span>{resource.duration}</span>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={actionButton.action}
                            className="w-full flex items-center gap-1"
                          >
                            <ActionIcon className="w-4 h-4" />
                            {actionButton.text}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;