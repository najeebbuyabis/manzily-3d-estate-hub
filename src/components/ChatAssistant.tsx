import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

interface UserAnswers {
  lookingFor: string;
  propertyType: string;
  location: string;
  budget: string;
  specificNeeds: string;
  wantsAgent: boolean;
}

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Partial<UserAnswers>>({});
  const [isConversationComplete, setIsConversationComplete] = useState(false);
  const [userLanguage, setUserLanguage] = useState<'en' | 'ar'>('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const questions = {
    en: [
      "Hello! I'm here to help you find the perfect property. Are you looking to rent or buy?",
      "Great! What type of property are you interested in? (apartment, villa, house, farm, land, commercial)",
      "Which location do you prefer in Kuwait?",
      "What's your budget range in KWD?",
      "Do you have any specific needs or preferences? (e.g., sea view, garden, number of rooms, parking)",
      "Would you like me to connect you with one of our verified agents for personalized assistance?"
    ],
    ar: [
      "مرحباً! أنا هنا لمساعدتك في العثور على العقار المثالي. هل تبحث عن إيجار أم شراء؟",
      "ممتاز! ما نوع العقار الذي تهتم به؟ (شقة، فيلا، منزل، مزرعة، أرض، تجاري)",
      "ما المنطقة المفضلة لديك في الكويت؟",
      "ما النطاق السعري المطلوب بالدينار الكويتي؟",
      "هل لديك أي احتياجات أو تفضيلات خاصة؟ (مثل: إطلالة بحرية، حديقة، عدد الغرف، موقف سيارات)",
      "هل تود أن أربطك بأحد وكلائنا المعتمدين للحصول على مساعدة شخصية؟"
    ]
  };

  const summaryText = {
    en: {
      title: "Here's a summary of your requirements:",
      lookingFor: "Looking for:",
      propertyType: "Property type:",
      location: "Location:",
      budget: "Budget:",
      specificNeeds: "Specific needs:",
      wantsAgent: "Agent contact:",
      yes: "Yes",
      no: "No",
      thanks: "Thank you! Based on your requirements, I'll help you find matching properties. Our team will be in touch soon!"
    },
    ar: {
      title: "هنا ملخص لمتطلباتك:",
      lookingFor: "تبحث عن:",
      propertyType: "نوع العقار:",
      location: "المنطقة:",
      budget: "الميزانية:",
      specificNeeds: "الاحتياجات الخاصة:",
      wantsAgent: "التواصل مع الوكيل:",
      yes: "نعم",
      no: "لا",
      thanks: "شكراً لك! بناءً على متطلباتك، سأساعدك في العثور على العقارات المناسبة. فريقنا سيتواصل معك قريباً!"
    }
  };

  // Detect language from user input
  const detectLanguage = (text: string): 'en' | 'ar' => {
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(text) ? 'ar' : 'en';
  };

  const addMessage = (content: string, type: 'bot' | 'user') => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = () => {
    if (!currentInput.trim()) return;

    // Detect language on first user message
    if (currentStep === 0) {
      setUserLanguage(detectLanguage(currentInput));
    }

    addMessage(currentInput, 'user');

    // Save answer
    const answerKeys: (keyof UserAnswers)[] = ['lookingFor', 'propertyType', 'location', 'budget', 'specificNeeds', 'wantsAgent'];
    if (currentStep < answerKeys.length) {
      const key = answerKeys[currentStep];
      setUserAnswers(prev => ({
        ...prev,
        [key]: key === 'wantsAgent' ? currentInput.toLowerCase().includes('yes') || currentInput.toLowerCase().includes('نعم') : currentInput
      }));
    }

    setCurrentInput('');

    // Move to next question or show summary
    if (currentStep < questions[userLanguage].length - 1) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        addMessage(questions[userLanguage][currentStep + 1], 'bot');
      }, 500);
    } else {
      // Show summary
      setTimeout(() => {
        showSummary();
      }, 500);
    }
  };

  const showSummary = () => {
    const summary = summaryText[userLanguage];
    const summaryContent = `
${summary.title}

• ${summary.lookingFor} ${userAnswers.lookingFor}
• ${summary.propertyType} ${userAnswers.propertyType}
• ${summary.location} ${userAnswers.location}
• ${summary.budget} ${userAnswers.budget}
• ${summary.specificNeeds} ${userAnswers.specificNeeds || 'N/A'}
• ${summary.wantsAgent} ${userAnswers.wantsAgent ? summary.yes : summary.no}

${summary.thanks}
    `;
    
    addMessage(summaryContent, 'bot');
    setIsConversationComplete(true);
  };

  const startConversation = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      addMessage(questions.en[0], 'bot');
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setCurrentStep(0);
    setUserAnswers({});
    setIsConversationComplete(false);
    setUserLanguage('en');
    setCurrentInput('');
    addMessage(questions.en[0], 'bot');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={startConversation}
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-primary hover:bg-primary/90 shadow-lg z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-xl z-50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Real Estate Assistant</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-4 space-y-4">
            {/* Messages */}
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.type === 'bot' && <Bot className="h-4 w-4 mt-0.5 text-primary" />}
                        {message.type === 'user' && <User className="h-4 w-4 mt-0.5" />}
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            {!isConversationComplete ? (
              <div className="flex space-x-2">
                <Input
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder={userLanguage === 'ar' ? 'اكتب إجابتك...' : 'Type your answer...'}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                  dir={userLanguage === 'ar' ? 'rtl' : 'ltr'}
                />
                <Button onClick={handleSendMessage} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex justify-center">
                <Button onClick={resetConversation} variant="outline">
                  {userLanguage === 'ar' ? 'محادثة جديدة' : 'New Conversation'}
                </Button>
              </div>
            )}

            {/* Progress indicator */}
            {!isConversationComplete && (
              <div className="flex justify-center">
                <Badge variant="secondary">
                  {currentStep + 1} / {questions[userLanguage].length}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ChatAssistant;