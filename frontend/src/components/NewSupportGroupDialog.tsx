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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Users, Tag, X, Lock } from "lucide-react";
import { auth, db } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface NewSupportGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated: () => void;
}

const CATEGORY_OPTIONS = [
  "Anxiety",
  "Depression",
  "Stress",
  "PTSD",
  "Grief & Loss",
  "Relationships",
  "Addiction Recovery",
  "Eating Disorders",
  "Self-Harm",
  "Bipolar Disorder",
  "OCD",
  "General Support",
];

export const NewSupportGroupDialog = ({
  open,
  onOpenChange,
  onGroupCreated,
}: NewSupportGroupDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAddTag = (tag: string) => {
    if (selectedTags.length >= 5) {
      toast({
        title: "Maximum tags reached",
        description: "You can add up to 5 tags per group.",
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
        description: "You can add up to 5 tags per group.",
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
    if (!name.trim() || !description.trim() || !category) {
      toast({
        title: "Missing information",
        description: "Please provide name, description, and category.",
        variant: "destructive",
      });
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a support group.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "support_groups"), {
        name: name.trim(),
        description: description.trim(),
        category: category,
        tags: selectedTags,
        isAnonymous: isAnonymous,
        creatorId: user.uid,
        creatorName: user.displayName || "Anonymous",
        moderator: "AI + Human Moderators",
        members: [user.uid],
        memberCount: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Support group created!",
        description: "Your support group is now live.",
      });

      // Reset form
      setName("");
      setDescription("");
      setCategory("");
      setSelectedTags([]);
      setCustomTag("");
      setIsAnonymous(true);
      onOpenChange(false);
      onGroupCreated();
    } catch (error) {
      console.error("Error creating support group:", error);
      toast({
        title: "Error",
        description: "Failed to create support group. Please try again.",
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
            <Users className="w-5 h-5 text-primary" />
            Create Support Group
          </DialogTitle>
          <DialogDescription>
            Create a safe space for people to connect and support each other
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Anxiety Support Circle"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground text-right">
              {name.length}/60
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the purpose and focus of this support group..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/300
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category *</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((cat) => (
                <Badge
                  key={cat}
                  variant={category === cat ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Additional Tags (Optional - Max 5)</Label>

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

          {/* Anonymous Option */}
          <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
            />
            <div className="flex-1">
              <Label
                htmlFor="anonymous"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Lock className="w-4 h-4 inline mr-1" />
                Anonymous Group
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Members will appear as anonymous in this group for privacy
              </p>
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
            disabled={!name.trim() || !description.trim() || !category || isSubmitting}
            className="bg-gradient-primary"
          >
            {isSubmitting ? "Creating..." : "Create Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
