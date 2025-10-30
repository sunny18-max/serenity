import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { NewDiscussionDialog } from "@/components/NewDiscussionDialog";
import { DiscussionChatDialog } from "@/components/DiscussionChatDialog";
import { SupportGroupDialog } from "@/components/SupportGroupDialog";
import { NewSupportGroupDialog } from "@/components/NewSupportGroupDialog";
import { auth, db } from "@/firebase";
import { collection, query, orderBy, getDocs, doc, updateDoc, arrayUnion, arrayRemove, increment, onSnapshot } from "firebase/firestore";

interface SupportGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  members: string[];
  category: string;
  isAnonymous: boolean;
  moderator: string;
  tags: string[];
  createdAt: any;
}

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
  isModerated: boolean;
}

interface FirebaseDiscussion {
  id: string;
  title: string;
  content: string;
  tags: string[];
  authorId: string;
  authorName: string;
  likes: number;
  likedBy: string[];
  comments: number;
  createdAt: any;
}

const Community = () => {
  const [activeTab, setActiveTab] = useState("news");
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [liveStreams, setLiveStreams] = useState<VideoContent[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [firebaseDiscussions, setFirebaseDiscussions] = useState<FirebaseDiscussion[]>([]);
  const [isLoadingDiscussions, setIsLoadingDiscussions] = useState(false);
  const [supportGroups, setSupportGroups] = useState<SupportGroup[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("recent");
  const [isNewDiscussionOpen, setIsNewDiscussionOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<{ id: string; title: string } | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<SupportGroup | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadDiscussionsFromFirebase = async () => {
    setIsLoadingDiscussions(true);
    try {
      const discussionsQuery = query(
        collection(db, "community_discussions"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(discussionsQuery);
      const loadedDiscussions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirebaseDiscussion[];
      setFirebaseDiscussions(loadedDiscussions);
    } catch (error) {
      console.error("Error loading discussions:", error);
    } finally {
      setIsLoadingDiscussions(false);
    }
  };

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
      loadDiscussionsFromFirebase();
      loadSupportGroupsFromFirebase();
    };
    loadContent();
  }, []);

  const handleLikeDiscussion = async (discussionId: string) => {
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like discussions.",
        variant: "destructive",
      });
      return;
    }

    try {
      const discussion = firebaseDiscussions.find(d => d.id === discussionId);
      if (!discussion) return;

      const discussionRef = doc(db, "community_discussions", discussionId);
      const hasLiked = discussion.likedBy.includes(user.uid);

      if (hasLiked) {
        // Unlike
        await updateDoc(discussionRef, {
          likes: increment(-1),
          likedBy: arrayRemove(user.uid)
        });
      } else {
        // Like
        await updateDoc(discussionRef, {
          likes: increment(1),
          likedBy: arrayUnion(user.uid)
        });
        toast({
          title: "Liked!",
          description: "Your support means a lot to the community.",
        });
      }

      // Reload discussions
      await loadDiscussionsFromFirebase();
    } catch (error) {
      console.error("Error liking discussion:", error);
      toast({
        title: "Error",
        description: "Failed to like discussion.",
        variant: "destructive",
      });
    }
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

  // Filter and sort Firebase discussions
  const filteredFirebaseDiscussions = firebaseDiscussions
    .filter(discussion =>
      discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (filterBy === "recent") {
        return b.createdAt?.seconds - a.createdAt?.seconds;
      } else if (filterBy === "popular") {
        return b.likes - a.likes;
      } else if (filterBy === "discussed") {
        return b.comments - a.comments;
      }
      return 0;
    });

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSupportGroups = supportGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
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


  const loadSupportGroupsFromFirebase = async () => {
    setIsLoadingGroups(true);
    try {
      const groupsQuery = query(
        collection(db, "support_groups"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(groupsQuery);
      const loadedGroups = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SupportGroup[];
      setSupportGroups(loadedGroups);
    } catch (error) {
      console.error("Error loading support groups:", error);
    } finally {
      setIsLoadingGroups(false);
    }
  };

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
          <Button 
            className="flex items-center gap-2"
            onClick={() => setIsNewDiscussionOpen(true)}
          >
            <Plus className="w-4 h-4" />
            New Discussion
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                {filterBy === "recent" ? "Recent" : filterBy === "popular" ? "Popular" : "Most Discussed"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterBy("recent")}>
                Recent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy("popular")}>
                Most Liked
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy("discussed")}>
                Most Discussed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            {isLoadingDiscussions ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-muted rounded w-full mb-2" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredFirebaseDiscussions.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No discussions found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "Try adjusting your search query" : "Be the first to start a discussion!"}
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => setIsNewDiscussionOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Start Discussion
                </Button>
              </div>
            ) : (
              filteredFirebaseDiscussions.map(discussion => {
                const user = auth.currentUser;
                const hasLiked = user && discussion.likedBy.includes(user.uid);
                const timeAgo = discussion.createdAt?.seconds 
                  ? formatTimestamp(new Date(discussion.createdAt.seconds * 1000).toISOString())
                  : "Just now";

                return (
                  <Card key={discussion.id} className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{discussion.title}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <UserCircle className="w-4 h-4" />
                              <span>{discussion.authorName}</span>
                            </div>
                            <span>{timeAgo}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">{discussion.content}</p>
                          {discussion.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {discussion.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <button
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                            onClick={() => setSelectedDiscussion({ id: discussion.id, title: discussion.title })}
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>{discussion.comments} comments</span>
                          </button>
                          <div className="flex items-center gap-1">
                            <Heart className={cn("w-4 h-4", hasLiked && "fill-red-500 text-red-500")} />
                            <span>{discussion.likes} likes</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedDiscussion({ id: discussion.id, title: discussion.title })}
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Join Chat
                          </Button>
                          <Button 
                            size="sm" 
                            variant={hasLiked ? "default" : "outline"}
                            onClick={() => handleLikeDiscussion(discussion.id)}
                          >
                            <Heart className={cn("w-4 h-4", hasLiked && "fill-current")} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
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

        {activeTab === "groups" && (
          <div>
            <Card className="mb-6 bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
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
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsNewGroupOpen(true)}
                    className="bg-gradient-primary flex-shrink-0"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Group
                  </Button>
                </div>
              </CardContent>
            </Card>

            {isLoadingGroups ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-12 w-12 bg-muted rounded-full mb-2" />
                      <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted rounded w-full" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-muted rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredSupportGroups.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No support groups found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "Try adjusting your search query" : "Be the first to create a support group!"}
                </p>
                <Button onClick={() => setIsNewGroupOpen(true)} className="bg-gradient-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Support Group
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSupportGroups.map(group => (
                  <Card
                    key={group.id}
                    className="hover:shadow-glow transition-all duration-300 cursor-pointer border-primary/10"
                    onClick={() => setSelectedGroup(group)}
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
                        <span>{group.memberCount || 0} members</span>
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
                        View Group
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
      <MobileBottomNav />
      
      {/* Dialogs */}
      <NewDiscussionDialog
        open={isNewDiscussionOpen}
        onOpenChange={setIsNewDiscussionOpen}
        onDiscussionCreated={loadDiscussionsFromFirebase}
      />
      
      {selectedDiscussion && (
        <DiscussionChatDialog
          open={!!selectedDiscussion}
          onOpenChange={(open) => !open && setSelectedDiscussion(null)}
          discussionId={selectedDiscussion.id}
          discussionTitle={selectedDiscussion.title}
        />
      )}
      
      {selectedGroup && (
        <SupportGroupDialog
          open={!!selectedGroup}
          onOpenChange={(open) => !open && setSelectedGroup(null)}
          groupId={selectedGroup.id}
          groupName={selectedGroup.name}
          groupDescription={selectedGroup.description}
          isAnonymous={selectedGroup.isAnonymous}
        />
      )}
      
      <NewSupportGroupDialog
        open={isNewGroupOpen}
        onOpenChange={setIsNewGroupOpen}
        onGroupCreated={loadSupportGroupsFromFirebase}
      />
    </div>
  );
};

export default Community;