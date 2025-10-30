import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { MessageCircle, Tag, X } from "lucide-react";
import { auth, db } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface NewDiscussionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDiscussionCreated: () => void;
}

const SUGGESTED_TAGS = [
  "Anxiety",
  "Depression",
  "Stress",
  "Self-Care",
  "Mindfulness",
  "Sleep",
  "Relationships",
  "Work-Life Balance",
  "Coping Strategies",
  "Mental Health Tips",
];

export const NewDiscussionDialog = ({
  open,
  onOpenChange,
  onDiscussionCreated,
}: NewDiscussionDialogProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAddTag = (tag: string) => {
    if (selectedTags.length >= 5) {
      toast({
        title: "Maximum tags reached",
        description: "You can add up to 5 tags per discussion.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    if (!customTag.trim()) return;

    if (selectedTags.length >= 5) {
      toast({
        title: "Maximum tags reached",
        description: "You can add up to 5 tags per discussion.",
        variant: "destructive",
      });
      return;
    }

    const formattedTag = customTag.trim();
    if (!selectedTags.includes(formattedTag)) {
      setSelectedTags([...selectedTags, formattedTag]);
      setCustomTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and content for your discussion.",
        variant: "destructive",
      });
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a discussion.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "community_discussions"), {
        title: title.trim(),
        content: content.trim(),
        tags: selectedTags,
        authorId: user.uid,
        authorName: user.displayName || "Anonymous",
        authorEmail: user.email,
        likes: 0,
        likedBy: [],
        comments: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Discussion created!",
        description: "Your discussion has been posted to the community.",
      });

      // Reset form
      setTitle("");
      setContent("");
      setSelectedTags([]);
      setCustomTag("");
      onOpenChange(false);
      onDiscussionCreated();
    } catch (error) {
      console.error("Error creating discussion:", error);
      toast({
        title: "Error",
        description: "Failed to create discussion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Start a New Discussion
          </DialogTitle>
          <DialogDescription>
            Share your thoughts, ask questions, or start a conversation with the community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Discussion Title *</Label>
            <Input
              id="title"
              placeholder="What would you like to discuss?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground text-right">
              {title.length}/100
            </p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts, experiences, or questions..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {content.length}/1000
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags (Optional - Max 5)</Label>
            
            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {/* Suggested Tags */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Suggested tags:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_TAGS.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={`cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors ${
                      selectedTags.includes(tag) ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={() => !selectedTags.includes(tag) && handleAddTag(tag)}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Add custom tag..."
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddCustomTag()}
                maxLength={20}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddCustomTag}
                disabled={!customTag.trim() || selectedTags.length >= 5}
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim() || isSubmitting}
            className="bg-gradient-primary"
          >
            {isSubmitting ? "Posting..." : "Post Discussion"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
