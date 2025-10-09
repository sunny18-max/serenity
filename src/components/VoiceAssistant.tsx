import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { MessageCircle, X, Mic, MicOff, Send } from 'lucide-react';

const quickQuestions = [
  "How do I take an assessment?",
  "Show me my progress",
  "How do I track my mood?",
  "What is Serenity?",
  "How do I export my data?"
];

const quickAnswers: Record<string, string> = {
  "how do i take an assessment": "Go to your Dashboard and click the 'Take Assessment' button. You'll see a series of questions about your mental wellness. Answer them honestly and submit to get your results and recommendations.",
  "show me my progress": "Visit the Progress page from the sidebar. There you'll see charts showing your assessment scores over time, mood trends, and insights about your mental wellness journey.",
  "how do i track my mood": "Use the daily mood check-in on your Dashboard. Select your current mood, add an optional note about how you're feeling, and save it. You can view your mood history in the Progress section.",
  "what is serenity": "Serenity is your personal mental wellness companion. It helps you track your mood, take assessments, monitor your progress, and provides tools and insights to support your mental health journey.",
  "how do i export my data": "Go to Settings → Data Management → Export Data. You can choose to export as PDF for reports or CSV for data analysis. Your privacy is always protected."
};

interface Message {
  type: 'user' | 'assistant';
  text: string;
}

const VoiceAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (type: 'user' | 'assistant', text: string) => {
    setMessages(prev => [...prev, { type, text }]);
  };

  const handleQuestionClick = (question: string) => {
    // Add user question to chat
    addMessage('user', question);
    
    // Find and add assistant response
    const lowerQuestion = question.toLowerCase();
    const answer = quickAnswers[lowerQuestion] || "I can help with assessments, progress tracking, mood checks, and data export. What would you like to know?";
    
    setTimeout(() => {
      addMessage('assistant', answer);
    }, 500);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    // Add user message
    addMessage('user', inputText);
    
    // Find matching response or use default
    const lowerInput = inputText.toLowerCase();
    let answer = "I specialize in helping you navigate Serenity. Try asking about assessments, progress tracking, mood checks, or data export.";
    
    Object.keys(quickAnswers).forEach(key => {
      if (lowerInput.includes(key)) {
        answer = quickAnswers[key];
      }
    });
    
    setTimeout(() => {
      addMessage('assistant', answer);
    }, 500);
    
    setInputText('');
  };

  const toggleRecording = () => {
    if (isRecording) {
      window.speechSynthesis.cancel();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      const greeting = "Hello! I can help you navigate the app. Ask me about features or how to use them.";
      const utterance = new SpeechSynthesisUtterance(greeting);
      window.speechSynthesis.speak(utterance);
      
      // Auto-stop after greeting
      setTimeout(() => setIsRecording(false), 3000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
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
            <div className="flex flex-wrap gap-2 mb-3">
              {quickQuestions.map((question, index) => (
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
                onClick={toggleRecording}
                variant={isRecording ? "destructive" : "outline"}
                size="icon"
                className="flex-shrink-0"
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="flex-shrink-0"
                disabled={!inputText.trim()}
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