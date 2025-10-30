import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/firebase";
import { doc, getDoc, setDoc, collection, addDoc, query, orderBy, getDocs } from "firebase/firestore";
import { 
  Brain, 
  Send, 
  Sparkles, 
  Heart,
  MessageCircle,
  ArrowLeft,
  Lightbulb,
  TrendingUp,
  Shield,
  Mic,
  MicOff,
  Paperclip,
  FileText,
  Image as ImageIcon,
  File,
  X
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import MobileBottomNav from "@/components/MobileBottomNav";
import { FileUploadDialog } from "@/components/FileUploadDialog";
import { cn } from "@/lib/utils";
import { generateAIResponse, analyzeEmotion, isCrisisMessage } from "@/lib/aiService";
import { notifyAIChatResponse } from "@/lib/notifications";

interface FileAttachment {
  name: string;
  type: string;
  size: number;
  url?: string;
  data?: string; // base64 for images
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  emotion?: string;
  files?: FileAttachment[];
}

interface CBTTechnique {
  name: string;
  description: string;
  icon: any;
}

const cbtTechniques: CBTTechnique[] = [
  {
    name: "Thought Challenging",
    description: "Identify and challenge negative thought patterns",
    icon: Brain,
  },
  {
    name: "Behavioral Activation",
    description: "Engage in activities that improve mood",
    icon: TrendingUp,
  },
  {
    name: "Mindfulness",
    description: "Stay present and aware of your thoughts",
    icon: Heart,
  },
  {
    name: "Problem Solving",
    description: "Break down problems into manageable steps",
    icon: Lightbulb,
  },
];

const AITherapist = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userName, setUserName] = useState("User");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/auth");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().name || "User");
        }

        // Load chat history
        const chatQuery = query(
          collection(db, "users", user.uid, "ai_chats"),
          orderBy("timestamp", "asc")
        );
        const chatSnapshot = await getDocs(chatQuery);
        const chatHistory = chatSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        })) as Message[];
        
        if (chatHistory.length === 0) {
          // Welcome message
          setMessages([{
            id: "welcome",
            role: "assistant",
            content: `Hello ${userDoc.data()?.name || "there"}! I'm your AI wellness companion, trained with Cognitive Behavioral Therapy (CBT) principles. I'm here to listen, support, and help you work through your thoughts and feelings. How are you feeling today?`,
            timestamp: new Date(),
          }]);
        } else {
          setMessages(chatHistory);
        }
      } catch (error) {
        console.error("Error loading chat:", error);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const processFiles = async (files: File[]): Promise<FileAttachment[]> => {
    const attachments: FileAttachment[] = [];

    for (const file of files) {
      const attachment: FileAttachment = {
        name: file.name,
        type: file.type,
        size: file.size,
      };

      // Convert images to base64 for preview
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        attachment.data = base64;
      }

      attachments.push(attachment);
    }

    return attachments;
  };

  const handleFilesSelected = async (files: File[]) => {
    setUploadedFiles(files);
    toast({
      title: "Files uploaded",
      description: `${files.length} file(s) ready to send`,
    });
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && uploadedFiles.length === 0) || isLoading) return;

    const user = auth.currentUser;
    if (!user) return;

    // Process uploaded files
    const fileAttachments = uploadedFiles.length > 0 ? await processFiles(uploadedFiles) : undefined;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage || "[Shared files]",
      timestamp: new Date(),
      files: fileAttachments,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setUploadedFiles([]);
    setIsLoading(true);

    try {
      // Save user message to Firestore
      await addDoc(collection(db, "users", user.uid, "ai_chats"), {
        role: "user",
        content: userMessage.content,
        timestamp: new Date(),
        files: fileAttachments?.map(f => ({
          name: f.name,
          type: f.type,
          size: f.size,
        })),
      });

      // Check for crisis keywords
      if (isCrisisMessage(inputMessage)) {
        toast({
          title: "Crisis Resources Available",
          description: "Please check the Emergency Help section for immediate support.",
          variant: "destructive",
        });
      }

      // Analyze emotion
      const emotion = analyzeEmotion(inputMessage);

      // Build conversation history for context
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Build file context for AI
      let fileContext = "";
      if (fileAttachments && fileAttachments.length > 0) {
        fileContext = `\n\n[User has shared ${fileAttachments.length} file(s): ${fileAttachments.map(f => `${f.name} (${f.type})`).join(', ')}. Please acknowledge these files and offer to discuss their content or how they relate to the user's mental health journey.]`;
      }

      // Generate AI response using real AI service
      const aiResponse = await generateAIResponse(
        userMessage.content + fileContext,
        conversationHistory
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
        emotion,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save AI response to Firestore
      await addDoc(collection(db, "users", user.uid, "ai_chats"), {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
        emotion,
      });

      // Create notification
      await notifyAIChatResponse();

    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Not Supported",
        description: "Voice input is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast({
        title: "Error",
        description: "Failed to capture voice input.",
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-16 lg:pb-0">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow flex-shrink-0">
                  <Brain className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="truncate">AI Therapy Companion</span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                Your personal CBT-trained wellness assistant
              </p>
            </div>
          </div>
          <Badge className="bg-gradient-primary text-white text-xs sm:text-sm whitespace-nowrap">
            <Shield className="w-3 h-3 mr-1" />
            Private & Secure
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* CBT Techniques Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-medium border-primary/10 sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  CBT Techniques
                </CardTitle>
                <CardDescription>Evidence-based approaches</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {cbtTechniques.map((technique, index) => {
                  const Icon = technique.icon;
                  return (
                    <div
                      key={index}
                      className="p-3 rounded-lg border border-primary/10 hover:border-primary/30 transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{technique.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {technique.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="shadow-medium border-primary/10 h-[calc(100vh-16rem)] sm:h-[calc(100vh-14rem)] lg:h-[calc(100vh-12rem)]">
              <CardHeader className="border-b border-primary/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center animate-pulse">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Therapy Session</CardTitle>
                      <CardDescription>
                        {messages.length > 1 ? `${messages.length - 1} messages` : "Start your conversation"}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <Heart className="w-3 h-3 mr-1 text-energy" />
                    Active
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-0 flex flex-col h-[calc(100%-5rem)]">
                {/* Messages */}
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-3 animate-in fade-in slide-in-from-bottom-2",
                          message.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        {message.role === "assistant" && (
                          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                            <Brain className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[80%] rounded-2xl px-4 py-3",
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          {/* File attachments */}
                          {message.files && message.files.length > 0 && (
                            <div className="space-y-2 mb-3">
                              {message.files.map((file, idx) => (
                                <div
                                  key={idx}
                                  className={cn(
                                    "rounded-lg p-2 border",
                                    message.role === "user"
                                      ? "bg-primary-foreground/10 border-primary-foreground/20"
                                      : "bg-background border-border"
                                  )}
                                >
                                  {file.type.startsWith("image/") && file.data ? (
                                    <img
                                      src={file.data}
                                      alt={file.name}
                                      className="max-w-full h-auto rounded max-h-48 object-contain"
                                    />
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      {file.type === "application/pdf" ? (
                                        <FileText className="w-4 h-4" />
                                      ) : file.type.startsWith("image/") ? (
                                        <ImageIcon className="w-4 h-4" />
                                      ) : (
                                        <File className="w-4 h-4" />
                                      )}
                                      <span className="text-xs font-medium truncate">
                                        {file.name}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <p className="text-xs opacity-70 mt-2">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {message.role === "user" && (
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium">
                              {userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center animate-pulse">
                          <Brain className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-muted rounded-2xl px-4 py-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce delay-100" />
                            <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce delay-200" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="border-t border-primary/10 p-4">
                  {/* Uploaded files preview */}
                  {uploadedFiles.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {uploadedFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-sm"
                        >
                          {file.type.startsWith("image/") ? (
                            <ImageIcon className="w-4 h-4 text-primary" />
                          ) : file.type === "application/pdf" ? (
                            <FileText className="w-4 h-4 text-red-500" />
                          ) : (
                            <File className="w-4 h-4 text-blue-500" />
                          )}
                          <span className="truncate max-w-[150px]">{file.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 p-0"
                            onClick={() => removeUploadedFile(idx)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleVoiceInput}
                      disabled={isListening}
                      className={cn(
                        "flex-shrink-0",
                        isListening && "bg-primary text-primary-foreground"
                      )}
                    >
                      {isListening ? (
                        <MicOff className="w-4 h-4 animate-pulse" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsUploadDialogOpen(true)}
                      disabled={isLoading}
                      className="flex-shrink-0"
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Input
                      placeholder="Share your thoughts..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={(!inputMessage.trim() && uploadedFiles.length === 0) || isLoading}
                      className="bg-gradient-primary flex-shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    This AI companion uses CBT principles but is not a replacement for professional therapy
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <MobileBottomNav />
      <FileUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onFilesSelected={handleFilesSelected}
      />
    </div>
  );
};

export default AITherapist;
