import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mic, MicOff, MessageCircle, X, Volume2, VolumeX, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const onboardingTips = [
  "You can say: 'How do I take an assessment?'",
  "Try: 'Show me my progress.'",
  "Ask: 'How do I track my mood?'",
  "Say: 'What is Serenity?'",
  "Or: 'How do I export my data?'"
];

const VoiceAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState<Array<{type: 'user' | 'assistant', text: string}>>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && conversation.length === 0) {
      setConversation([{
        type: 'assistant',
        text: "👋 Hi! I'm your Serenity voice assistant. I can help you navigate the app, explain features, or answer questions about mental wellness. You can speak to me or type your questions!"
      }]);
    }
  }, [isOpen, conversation.length]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => { chunks.push(event.data); };
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      setIsRecording(true);
      toast({ title: "Recording started", description: "Speak now, click stop when finished" });
    } catch (error) {
      toast({ title: "Microphone access denied", description: "Please allow microphone access to use voice features", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Replace with your backend API for voice transcription and assistant response
      // For demo, just echo back
      setConversation(prev => [...prev, { type: 'user', text: '[Voice message sent]' }]);
      setConversation(prev => [...prev, { type: 'assistant', text: "Voice processing is not set up in demo. Please use text input or set up your backend." }]);
    } catch (error) {
      toast({ title: "Error processing voice", description: "Please try again or use text input", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const sendTextMessage = async (text: string) => {
    if (!text.trim()) return;
    setConversation(prev => [...prev, { type: 'user', text }]);
    setIsProcessing(true);
    try {
      // Replace with your backend API for assistant response
      // For demo, provide canned responses
      let response = "I'm here to help!";
      if (/assessment/i.test(text)) response = "To take an assessment, click 'Take Assessment' on your dashboard.";
      else if (/progress/i.test(text)) response = "You can view your progress by clicking 'View Progress' on your dashboard.";
      else if (/mood/i.test(text)) response = "Track your mood daily using the mood check section on your dashboard.";
      else if (/export/i.test(text)) response = "Export your data from the Settings page under 'Data Management'.";
      else if (/serenity/i.test(text)) response = "Serenity is your mental wellness companion. It helps you track, assess, and improve your wellbeing.";
      setConversation(prev => [...prev, { type: 'assistant', text: response }]);
    } catch (error) {
      toast({ title: "Error sending message", description: "Please try again", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <>
      {/* Floating Voice Assistant Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-primary hover:shadow-glow transition-all duration-300 z-40 pulse-glow"
        size="icon"
        aria-label="Open Voice Assistant"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </Button>

      {/* Voice Assistant Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Serenity Voice Assistant
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col">
            {/* Conversation Display */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20 rounded-lg mb-4">
              {conversation.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border shadow-soft'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-background border shadow-soft p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <span className="text-sm text-muted-foreground ml-2">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              {/* Onboarding tips */}
              <div className="mt-4">
                <Card className="bg-muted/10">
                  <CardHeader className="flex flex-row items-center gap-2 pb-2">
                    <Info className="w-4 h-4 text-primary" />
                    <CardTitle className="text-sm">Try asking:</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {onboardingTips.map((tip, idx) => (
                      <div key={idx} className="text-xs text-muted-foreground">• {tip}</div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Voice Controls */}
              <div className="flex items-center justify-center gap-4">
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    disabled={isProcessing}
                    className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                    size="lg"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecording}
                    className="bg-destructive hover:bg-destructive/90"
                    size="lg"
                  >
                    <MicOff className="w-4 h-4 mr-2" />
                    Stop Recording
                  </Button>
                )}

                {isPlaying && (
                  <Button
                    onClick={stopAudio}
                    variant="outline"
                    size="lg"
                  >
                    <VolumeX className="w-4 h-4 mr-2" />
                    Stop Audio
                  </Button>
                )}
              </div>

              {/* Text Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your question here..."
                  className="flex-1 px-3 py-2 border rounded-md bg-background"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendTextMessage(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                  disabled={isProcessing}
                />
                <Button
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    sendTextMessage(input.value);
                    input.value = '';
                  }}
                  disabled={isProcessing}
                  size="icon"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>

              {/* Helper Text */}
              <p className="text-xs text-muted-foreground text-center">
                Ask me about taking assessments, viewing progress, mood tracking, or any app features!
              </p>
            </div>
          </div>

          {/* Hidden Audio Element */}
          <audio ref={audioRef} className="hidden" />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VoiceAssistant;