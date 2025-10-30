import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { MessageCircle, Send, Heart, UserCircle, Clock } from "lucide-react";
import { auth, db } from "@/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { cn } from "@/lib/utils";

interface DiscussionChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discussionId: string;
  discussionTitle: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: any;
  createdAt: any;
}

export const DiscussionChatDialog = ({
  open,
  onOpenChange,
  discussionId,
  discussionTitle,
}: DiscussionChatDialogProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!open || !discussionId) return;

    setIsLoading(true);

    // Real-time listener for messages
    const messagesQuery = query(
      collection(db, "community_discussions", discussionId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const loadedMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ChatMessage[];
        setMessages(loadedMessages);
        setIsLoading(false);
        
        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      },
      (error) => {
        console.error("Error loading messages:", error);
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Failed to load messages.",
          variant: "destructive",
        });
      }
    );

    return () => unsubscribe();
  }, [open, discussionId, toast]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to send messages.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Add message to subcollection
      await addDoc(
        collection(db, "community_discussions", discussionId, "messages"),
        {
          userId: user.uid,
          userName: user.displayName || "Anonymous",
          message: newMessage.trim(),
          timestamp: serverTimestamp(),
          createdAt: serverTimestamp(),
        }
      );

      // Update comment count on main discussion
      const discussionRef = doc(db, "community_discussions", discussionId);
      await updateDoc(discussionRef, {
        comments: increment(1),
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            {discussionTitle}
          </DialogTitle>
          <DialogDescription>
            Join the conversation • {messages.length} message{messages.length !== 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        {/* Messages Area */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4 py-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No messages yet. Be the first to comment!
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const isCurrentUser = auth.currentUser?.uid === message.userId;
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3 animate-in fade-in slide-in-from-bottom-2",
                      isCurrentUser ? "justify-end" : "justify-start"
                    )}
                  >
                    {!isCurrentUser && (
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <UserCircle className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[70%] rounded-2xl px-4 py-3",
                        isCurrentUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold">
                          {isCurrentUser ? "You" : message.userName}
                        </span>
                        <span className="text-xs opacity-70 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.message}
                      </p>
                    </div>
                    {isCurrentUser && (
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <UserCircle className="w-5 h-5 text-primary" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t pt-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              maxLength={500}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-gradient-primary"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {newMessage.length}/500 characters
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
