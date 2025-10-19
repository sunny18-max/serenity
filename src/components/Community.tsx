import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Newspaper, 
  Share2, 
  Search,
  Plus,
  Filter,
  Calendar,
  MapPin,
  Shield,
  Lock,
  Send,
  ArrowLeft,
  UserCircle,
  AlertTriangle,
  CheckCircle,
  Play,
  ExternalLink,
  Video
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { fetchMentalWellnessNews, formatNewsDate, type NewsArticle } from "@/lib/newsService";
import { getMentalWellnessVideos, getLiveStreams, getMentalHealthDiscussions, formatTimestamp, type VideoContent, type Discussion } from "@/lib/contentService";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import { motion, AnimatePresence } from "framer-motion";
import MobileBottomNav from "@/components/MobileBottomNav";

interface SupportGroup {
  id: string;
  name: string;
  description: string;
  members: number;
  category: string;
  isAnonymous: boolean;
  moderator: string;
  tags: string[];
}

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
  isModerated: boolean;
}

const Community = () => {
  const [activeTab, setActiveTab] = useState("news");
  const [selectedGroup, setSelectedGroup] = useState<SupportGroup | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [liveStreams, setLiveStreams] = useState<VideoContent[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadContent = async () => {
      setIsLoadingNews(true);
      const articles = await fetchMentalWellnessNews();
      setNewsArticles(articles);
      setIsLoadingNews(false);
      
      // Load videos and discussions
      setVideos(getMentalWellnessVideos());
      setLiveStreams(getLiveStreams());
      setDiscussions(getMentalHealthDiscussions());
    };
    loadContent();
  }, []);

  const handleLikeDiscussion = (id: string) => {
    toast({
      title: "Liked!",
      description: "Your support means a lot to the community.",
    });
  };

  // Filter content based on search query
  const filteredNews = newsArticles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDiscussions = discussions.filter(discussion =>
    discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    discussion.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShareDiscussion = (discussion: Discussion) => {
    if (navigator.share) {
      navigator.share({
        title: discussion.title,
        text: discussion.content,
        url: discussion.url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(discussion.url);
      toast({
        title: "Link copied!",
        description: "Discussion link copied to clipboard.",
      });
    }
  };


  const supportGroups: SupportGroup[] = [
    {
      id: "anxiety-support",
      name: "Anxiety Support Circle",
      description: "Safe space to discuss anxiety, share coping strategies, and support each other",
      members: 234,
      category: "Anxiety",
      isAnonymous: true,
      moderator: "AI + Human Moderators",
      tags: ["Anxiety", "Coping", "Support"]
    },
    {
      id: "depression-warriors",
      name: "Depression Warriors",
      description: "Community for those battling depression to share experiences and find hope",
      members: 189,
      category: "Depression",
      isAnonymous: true,
      moderator: "AI + Human Moderators",
      tags: ["Depression", "Recovery", "Hope"]
    },
    {
      id: "stress-management",
      name: "Stress Management Hub",
      description: "Learn and share techniques for managing daily stress and overwhelm",
      members: 312,
      category: "Stress",
      isAnonymous: true,
      moderator: "AI + Human Moderators",
      tags: ["Stress", "Mindfulness", "Balance"]
    },
    {
      id: "lgbtq-wellness",
      name: "LGBTQ+ Wellness Space",
      description: "Supportive community for LGBTQ+ mental health and wellness",
      members: 156,
      category: "Identity",
      isAnonymous: true,
      moderator: "AI + Human Moderators",
      tags: ["LGBTQ+", "Identity", "Support"]
    },
    {
      id: "student-support",
      name: "Student Mental Health",
      description: "Support for students dealing with academic stress and mental health",
      members: 278,
      category: "Students",
      isAnonymous: true,
      moderator: "AI + Human Moderators",
      tags: ["Students", "Academic", "Stress"]
    },
    {
      id: "new-parents",
      name: "New Parents Wellness",
      description: "Mental health support for new and expecting parents",
      members: 145,
      category: "Parenting",
      isAnonymous: true,
      moderator: "AI + Human Moderators",
      tags: ["Parenting", "Postpartum", "Support"]
    }
  ];

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: `Anonymous User ${Math.floor(Math.random() * 1000)}`,
      message: chatMessage,
      timestamp: new Date(),
      isModerated: true
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatMessage("");

    toast({
      title: "Message sent",
      description: "Your message has been posted to the group"
    });
  };

  const handleJoinGroup = (group: SupportGroup) => {
    setSelectedGroup(group);
    // Simulate loading some messages
    setChatMessages([
      {
        id: "1",
        user: "Anonymous User 42",
        message: "Hi everyone, I'm new here. Looking forward to connecting with you all.",
        timestamp: new Date(Date.now() - 3600000),
        isModerated: true
      },
      {
        id: "2",
        user: "Anonymous User 128",
        message: "Welcome! This is a great supportive community. Feel free to share.",
        timestamp: new Date(Date.now() - 1800000),
        isModerated: true
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 cyber-grid pb-16 lg:pb-0">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Title Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="mb-4 px-4 py-2 bg-primary/10 border-primary/30">
            <Users className="w-4 h-4 mr-2" />
            Community Hub
          </Badge>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
            Mental Wellness Community
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Connect, learn, and grow together on your mental wellness journey
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex border-b mb-8 overflow-x-auto">
          <Button
            variant={activeTab === "news" ? "default" : "ghost"}
            onClick={() => setActiveTab("news")}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary whitespace-nowrap"
          >
            <Newspaper className="w-4 h-4 mr-2" />
            Mental Wellness News
          </Button>
          <Button
            variant={activeTab === "discussions" ? "default" : "ghost"}
            onClick={() => setActiveTab("discussions")}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Discussions
          </Button>
          <Button
            variant={activeTab === "events" ? "default" : "ghost"}
            onClick={() => setActiveTab("events")}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary whitespace-nowrap"
          >
            <Video className="w-4 h-4 mr-2" />
            Videos & Live Streams
          </Button>
          <Button
            variant={activeTab === "groups" ? "default" : "ghost"}
            onClick={() => setActiveTab("groups")}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary whitespace-nowrap"
          >
            <Users className="w-4 h-4 mr-2" />
            Support Groups
          </Button>
        </div>

        {/* Search and Actions */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search community..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Discussion
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </motion.div>

        {/* Content */}
        {activeTab === "news" && (
          <div>
            {isLoadingNews ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-muted rounded-t-lg" />
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-full" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="text-center py-12">
                <Newspaper className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No articles found</h3>
                <p className="text-muted-foreground">Try adjusting your search query</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNews.map((article) => (
                  <Card
                    key={article.id}
                    className="hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                    onClick={() => window.open(article.url, "_blank")}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80";
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-primary/90 backdrop-blur-sm">
                          {article.source}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {article.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{formatNewsDate(article.publishedAt)}</span>
                        {article.author && (
                          <span className="line-clamp-1">{article.author}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "discussions" && (
          <div className="space-y-6">
            {filteredDiscussions.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No discussions found</h3>
                <p className="text-muted-foreground">Try adjusting your search query</p>
              </div>
            ) : (
              filteredDiscussions.map(discussion => (
              <Card key={discussion.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => window.open(discussion.url, "_blank")}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 hover:text-primary transition-colors">{discussion.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span>By {discussion.author}</span>
                        <span>{formatTimestamp(discussion.timestamp)}</span>
                        <Badge variant="outline" className="text-xs">{discussion.platform}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{discussion.content}</p>
                      <div className="flex flex-wrap gap-1">
                        {discussion.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{discussion.replies} replies</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{discussion.likes} likes</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLikeDiscussion(discussion.id);
                        }}
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareDiscussion(discussion);
                        }}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" onClick={(e) => e.stopPropagation()}>
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View on Reddit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
            )}
          </div>
        )}

        {activeTab === "events" && (
          <div>
            {/* Live Streams Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Badge className="bg-red-500 animate-pulse">LIVE</Badge>
                24/7 Mental Wellness Streams
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveStreams.map(stream => (
                  <Card 
                    key={stream.id} 
                    className="hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                    onClick={() => window.open(stream.url, "_blank")}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={stream.thumbnail}
                        alt={stream.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-red-500 text-white animate-pulse">
                          🔴 LIVE
                        </Badge>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-black/70 backdrop-blur-sm text-white">
                          {stream.viewers?.toLocaleString()} watching
                        </Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {stream.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {stream.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{stream.channel}</span>
                        <Button size="sm" variant="outline">
                          <Play className="w-4 h-4 mr-1" />
                          Watch Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Videos Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Mental Wellness Videos & Meditations</h2>
              {filteredVideos.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No videos found</h3>
                  <p className="text-muted-foreground">Try adjusting your search query</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVideos.map(video => (
                  <Card 
                    key={video.id} 
                    className="hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                    onClick={() => window.open(video.url, "_blank")}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute bottom-2 right-2">
                        <Badge className="bg-black/70 backdrop-blur-sm text-white">
                          {video.duration}
                        </Badge>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                        <div className="w-16 h-16 bg-primary/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {video.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {video.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{video.channel}</span>
                        <Badge variant="secondary" className="capitalize">
                          {video.type}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "groups" && !selectedGroup && (
          <div>
            <Card className="mb-6 bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      Anonymous & Safe
                      <Badge variant="outline" className="text-xs">
                        <Lock className="w-3 h-3 mr-1" />
                        AI Moderated
                      </Badge>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      All support groups are anonymous and moderated by AI to ensure a safe, positive environment. 
                      Toxic behavior is automatically detected and prevented.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {supportGroups.map(group => (
                <Card 
                  key={group.id} 
                  className="hover:shadow-glow transition-all duration-300 cursor-pointer border-primary/10"
                  onClick={() => handleJoinGroup(group)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      {group.isAnonymous && (
                        <Badge variant="outline" className="text-xs">
                          <Lock className="w-3 h-3 mr-1" />
                          Anonymous
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <CardDescription>{group.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{group.members} members</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4" />
                      <span>{group.moderator}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {group.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button className="w-full mt-4 bg-gradient-primary">
                      Join Group
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "groups" && selectedGroup && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Group Info Sidebar */}
            <Card className="lg:col-span-1 shadow-medium border-primary/10">
              <CardHeader>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedGroup(null)}
                  className="mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Groups
                </Button>
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-center">{selectedGroup.name}</CardTitle>
                <CardDescription className="text-center">
                  {selectedGroup.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Safe Space</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    AI moderation ensures respectful communication
                  </p>
                </div>
                <div className="p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Anonymous</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your identity is protected
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Members</span>
                    <span className="font-medium">{selectedGroup.members}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Category</span>
                    <Badge variant="secondary">{selectedGroup.category}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="lg:col-span-3 shadow-medium border-primary/10">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Group Chat</CardTitle>
                    <CardDescription>
                      {selectedGroup.members} members • Active now
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Moderated
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px] p-6">
                  <div className="space-y-4">
                    {chatMessages.map(msg => (
                      <div key={msg.id} className="flex gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <UserCircle className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{msg.user}</span>
                            <span className="text-xs text-muted-foreground">
                              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {msg.isModerated && (
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm bg-muted/50 rounded-lg p-3">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Share your thoughts... (Be kind and supportive)"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      className="min-h-[60px]"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!chatMessage.trim()}
                      className="bg-gradient-primary"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Messages are monitored by AI to maintain a safe environment
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default Community;