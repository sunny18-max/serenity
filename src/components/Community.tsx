import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Share2, 
  Search,
  Plus,
  Filter,
  Calendar,
  MapPin
} from "lucide-react";

const Community = () => {
  const [activeTab, setActiveTab] = useState("discussions");

  const discussions = [
    {
      id: 1,
      title: "Coping with morning anxiety",
      author: "Sarah M.",
      replies: 24,
      likes: 42,
      time: "2 hours ago",
      tags: ["Anxiety", "Support", "Morning Routine"]
    },
    {
      id: 2,
      title: "Meditation techniques that actually work",
      author: "David T.",
      replies: 18,
      likes: 56,
      time: "5 hours ago",
      tags: ["Meditation", "Mindfulness", "Techniques"]
    },
    {
      id: 3,
      title: "Dealing with social anxiety at work",
      author: "James L.",
      replies: 32,
      likes: 67,
      time: "1 day ago",
      tags: ["Social Anxiety", "Work", "Professional"]
    },
    {
      id: 4,
      title: "Progress after 3 months of therapy",
      author: "Emma R.",
      replies: 45,
      likes: 89,
      time: "2 days ago",
      tags: ["Progress", "Therapy", "Success Story"]
    }
  ];

  const events = [
    {
      id: 1,
      title: "Virtual Mindfulness Session",
      date: "2025-01-15",
      time: "7:00 PM EST",
      type: "online",
      attendees: 45,
      description: "Guided mindfulness and meditation session"
    },
    {
      id: 2,
      title: "Anxiety Support Group Meeting",
      date: "2025-01-18",
      time: "6:30 PM EST",
      type: "online",
      attendees: 32,
      description: "Peer support group for anxiety management"
    },
    {
      id: 3,
      title: "Mental Wellness Workshop",
      date: "2025-01-22",
      time: "2:00 PM EST",
      type: "online",
      attendees: 78,
      description: "Interactive workshop on building resilience"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 cyber-grid">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Community Support</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with others, share experiences, and find support in our safe and moderated community.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-8">
          <Button
            variant={activeTab === "discussions" ? "default" : "ghost"}
            onClick={() => setActiveTab("discussions")}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Discussions
          </Button>
          <Button
            variant={activeTab === "events" ? "default" : "ghost"}
            onClick={() => setActiveTab("events")}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Events
          </Button>
          <Button
            variant={activeTab === "groups" ? "default" : "ghost"}
            onClick={() => setActiveTab("groups")}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Users className="w-4 h-4 mr-2" />
            Support Groups
          </Button>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search community..."
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
        </div>

        {/* Content */}
        {activeTab === "discussions" && (
          <div className="space-y-6">
            {discussions.map(discussion => (
              <Card key={discussion.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{discussion.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span>By {discussion.author}</span>
                        <span>{discussion.time}</span>
                      </div>
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
                      <Button size="sm" variant="outline">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm">Join Discussion</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "events" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <Card key={event.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="capitalize">{event.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{event.attendees} attending</span>
                  </div>
                  <Button className="w-full mt-4">RSVP Now</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "groups" && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Support Groups Coming Soon</h3>
            <p className="text-muted-foreground mb-6">
              We're working on creating specialized support groups for different mental health topics.
            </p>
            <Button>Notify Me When Available</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;