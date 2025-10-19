import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { MessageCircle, X, Mic, MicOff, Send, Sparkles, Volume2 } from 'lucide-react';
import { getAIResponse, getQuickSuggestions } from '@/lib/aiAssistant';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  type: 'user' | 'assistant';
  text: string;
}

const VoiceAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [quickSuggestions, setQuickSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        // Auto-send after speech recognition
        handleSendMessage(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: "Could not recognize speech. Please try again.",
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Load initial suggestions
    setQuickSuggestions(getQuickSuggestions([]));

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (type: 'user' | 'assistant', text: string) => {
    setMessages(prev => [...prev, { type, text }]);
  };

  const handleQuestionClick = async (question: string) => {
    // Add user question to chat
    addMessage('user', question);
    setIsTyping(true);
    
    try {
      // Get AI response
      const response = await getAIResponse(question, messages);
      setIsTyping(false);
      addMessage('assistant', response);
      
      // Speak response if enabled
      if (isSpeaking) {
        speakText(response);
      }
      
      // Update suggestions
      setQuickSuggestions(getQuickSuggestions([...messages, { type: 'user', text: question }, { type: 'assistant', text: response }]));
    } catch (error) {
      setIsTyping(false);
      addMessage('assistant', "I'm having trouble connecting right now. Please try again!");
    }
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText;
    if (!messageText.trim()) return;
    
    // Add user message
    addMessage('user', messageText);
    setInputText('');
    setIsTyping(true);
    
    try {
      // Get AI response
      const response = await getAIResponse(messageText, messages);
      setIsTyping(false);
      addMessage('assistant', response);
      
      // Speak response if enabled
      if (isSpeaking) {
        speakText(response);
      }
      
      // Update suggestions
      setQuickSuggestions(getQuickSuggestions([...messages, { type: 'user', text: messageText }, { type: 'assistant', text: response }]));
    } catch (error) {
      setIsTyping(false);
      addMessage('assistant', "I'm having trouble connecting right now. Please try again!");
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast({
          title: "Listening...",
          description: "Speak now. I'm listening!",
        });
      } catch (error) {
        console.error('Recognition start error:', error);
        toast({
          title: "Error",
          description: "Could not start speech recognition.",
          variant: "destructive",
        });
      }
    }
  };

  const toggleSpeaking = () => {
    setIsSpeaking(!isSpeaking);
    if (isSpeaking) {
      window.speechSynthesis.cancel();
    }
    toast({
      title: isSpeaking ? "Voice Off" : "Voice On",
      description: isSpeaking ? "Responses will not be spoken" : "Responses will be spoken aloud",
    });
  };

  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg z-40"
            size="icon"
          >
            <MessageCircle className="w-5 h-5 text-white" />
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-md h-[500px] flex flex-col p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              Serenity Assistant
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-8">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>Ask me anything about using Serenity!</p>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          <div className="border-t p-4">
            {isTyping && (
              <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
            <div className="flex flex-wrap gap-2 mb-3">
              {quickSuggestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-1 px-2"
                  onClick={() => handleQuestionClick(question)}
                >
                  {question}
                </Button>
              ))}
            </div>

            {/* Input Area */}
            <div className="flex gap-2">
              <Button
                onClick={toggleListening}
                variant={isListening ? "destructive" : "outline"}
                size="icon"
                className="flex-shrink-0"
                title="Voice Input"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              
              <Button
                onClick={toggleSpeaking}
                variant={isSpeaking ? "default" : "outline"}
                size="icon"
                className="flex-shrink-0"
                title="Voice Output"
              >
                <Volume2 className="w-4 h-4" />
              </Button>
              
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type or speak your question..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              
              <Button
                onClick={() => handleSendMessage()}
                size="icon"
                className="flex-shrink-0"
                disabled={!inputText.trim() || isTyping}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VoiceAssistant;