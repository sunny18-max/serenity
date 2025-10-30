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
import {
  Users,
  Send,
  UserCircle,
  Clock,
  Shield,
  Lock,
  LogIn,
  LogOut,
  AlertTriangle,
} from "lucide-react";
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
  arrayUnion,
  arrayRemove,
  getDoc,
  increment,
} from "firebase/firestore";
import { cn } from "@/lib/utils";

interface SupportGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  groupName: string;
  groupDescription: string;
  isAnonymous: boolean;
}

interface GroupMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: any;
  isModerated: boolean;
}

export const SupportGroupDialog = ({
  open,
  onOpenChange,
  groupId,
  groupName,
  groupDescription,
  isAnonymous,
}: SupportGroupDialogProps) => {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!open || !groupId) return;

    const checkMembership = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const groupDoc = await getDoc(doc(db, "support_groups", groupId));
        if (groupDoc.exists()) {
          const data = groupDoc.data();
          setIsMember(data.members?.includes(user.uid) || false);
          setMemberCount(data.memberCount || 0);
        }
      } catch (error) {
        console.error("Error checking membership:", error);
      }
    };

    checkMembership();

    // Real-time listener for group data
    const unsubscribeGroup = onSnapshot(
      doc(db, "support_groups", groupId),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const user = auth.currentUser;
          setIsMember(user ? data.members?.includes(user.uid) || false : false);
          setMemberCount(data.memberCount || 0);
        }
      }
    );

    // Real-time listener for messages (only if member)
    let unsubscribeMessages: (() => void) | undefined;

    if (isMember) {
      setIsLoading(true);
      const messagesQuery = query(
        collection(db, "support_groups", groupId, "messages"),
        orderBy("timestamp", "asc")
      );

      unsubscribeMessages = onSnapshot(
        messagesQuery,
        (snapshot) => {
          const loadedMessages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as GroupMessage[];
          setMessages(loadedMessages);
          setIsLoading(false);

          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        },
        (error) => {
          console.error("Error loading messages:", error);
          setIsLoading(false);
        }
      );
    }

    return () => {
      unsubscribeGroup();
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, [open, groupId, isMember]);

  const handleJoinGroup = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to join support groups.",
        variant: "destructive",
      });
      return;
    }

    try {
      const groupRef = doc(db, "support_groups", groupId);
      await updateDoc(groupRef, {
        members: arrayUnion(user.uid),
        memberCount: increment(1),
      });

      // Add welcome message
      await addDoc(collection(db, "support_groups", groupId, "messages"), {
        userId: "system",
        userName: "System",
        message: `${user.displayName || "A new member"} joined the group. Welcome! 👋`,
        timestamp: serverTimestamp(),
        isModerated: true,
      });

      toast({
        title: "Joined group!",
        description: `You are now a member of ${groupName}`,
      });
    } catch (error) {
      console.error("Error joining group:", error);
      toast({
        title: "Error",
        description: "Failed to join group.",
        variant: "destructive",
      });
    }
  };

  const handleLeaveGroup = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const groupRef = doc(db, "support_groups", groupId);
      await updateDoc(groupRef, {
        members: arrayRemove(user.uid),
        memberCount: increment(-1),
      });

      // Add leave message
      await addDoc(collection(db, "support_groups", groupId, "messages"), {
        userId: "system",
        userName: "System",
        message: `${user.displayName || "A member"} left the group.`,
        timestamp: serverTimestamp(),
        isModerated: true,
      });

      toast({
        title: "Left group",
        description: `You have left ${groupName}`,
      });

      setMessages([]);
    } catch (error) {
      console.error("Error leaving group:", error);
      toast({
        title: "Error",
        description: "Failed to leave group.",
        variant: "destructive",
      });
    }
  };

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

    if (!isMember) {
      toast({
        title: "Join required",
        description: "Please join the group to send messages.",
        variant: "destructive",
      });
      return;
    }

    try {
      const displayName = isAnonymous
        ? `Anonymous ${user.uid.slice(-4)}`
        : user.displayName || "User";

      await addDoc(collection(db, "support_groups", groupId, "messages"), {
        userId: user.uid,
        userName: displayName,
        message: newMessage.trim(),
        timestamp: serverTimestamp(),
        isModerated: false,
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

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {groupName}
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <p>{groupDescription}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                {memberCount} members
              </Badge>
              {isAnonymous && (
                <Badge variant="outline" className="text-xs">
                  <Lock className="w-3 h-3 mr-1" />
                  Anonymous
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Moderated
              </Badge>
            </div>
          </DialogDescription>
        </DialogHeader>

        {!isMember ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4 max-w-md">
              <Users className="w-16 h-16 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Join this support group</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect with others who understand what you're going through. Share
                  experiences, get support, and help others in a safe space.
                </p>
                {isAnonymous && (
                  <p className="text-xs text-muted-foreground bg-muted p-3 rounded-lg mb-4">
                    <Lock className="w-4 h-4 inline mr-1" />
                    Your identity will be anonymous in this group
                  </p>
                )}
              </div>
              <Button onClick={handleJoinGroup} className="bg-gradient-primary">
                <LogIn className="w-4 h-4 mr-2" />
                Join Group
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Messages Area */}
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 py-4">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isCurrentUser = auth.currentUser?.uid === message.userId;
                    const isSystem = message.userId === "system";

                    if (isSystem) {
                      return (
                        <div
                          key={message.id}
                          className="flex justify-center animate-in fade-in"
                        >
                          <Badge variant="secondary" className="text-xs">
                            {message.message}
                          </Badge>
                        </div>
                      );
                    }

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
            <div className="border-t pt-4 space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Share your thoughts..."
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
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <p className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Messages are monitored for safety
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLeaveGroup}
                  className="text-xs h-7"
                >
                  <LogOut className="w-3 h-3 mr-1" />
                  Leave Group
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
