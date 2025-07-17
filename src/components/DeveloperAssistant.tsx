import React, { useState, useEffect, useRef } from 'react';
import { Code, X, Send, Bug, Database, Settings, AlertCircle, CheckCircle, ExternalLink, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  hasActions?: boolean;
  actions?: DiagnosticAction[];
}

interface DiagnosticAction {
  type: 'code' | 'link' | 'command';
  label: string;
  content: string;
  description?: string;
}

interface IssueDiagnosis {
  category: string;
  likelyCause: string;
  suggestedFix: string;
  codeSnippet?: string;
  links?: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const DeveloperAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [issueData, setIssueData] = useState<any>({});
  const [diagnosis, setDiagnosis] = useState<IssueDiagnosis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const diagnosticQuestions = [
    {
      question: "What part of the system needs work?",
      type: "select",
      options: [
        "Authentication (Login/Signup)",
        "Database (Supabase Tables/RLS)",
        "Forms (Property Intake/User Registration)", 
        "API (Edge Functions/External APIs)",
        "UI Components (Styling/Layout)",
        "Deployment (Build Errors/Performance)",
        "Real-time Features (Chat/Updates)",
        "Other/Not Sure"
      ],
      key: "systemPart"
    },
    {
      question: "What error or behavior is occurring?",
      type: "textarea",
      placeholder: "Describe the error message, unexpected behavior, or what's not working as expected...",
      key: "errorDescription"
    },
    {
      question: "Have you made any recent changes?",
      type: "textarea", 
      placeholder: "List any recent code changes, database updates, or configuration modifications...",
      key: "recentChanges"
    },
    {
      question: "What do you expect to happen?",
      type: "textarea",
      placeholder: "Describe the expected behavior or desired outcome...",
      key: "expectedBehavior"
    }
  ];

  const commonSolutions = {
    "Authentication (Login/Signup)": {
      issues: [
        {
          problem: "Users can't sign in/up",
          cause: "Missing RLS policies or incorrect auth configuration",
          fix: "Check Supabase Auth settings and RLS policies on profiles table",
          code: `-- Check if profiles table has correct RLS policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Create missing policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);`
        },
        {
          problem: "Infinite loading on auth",
          cause: "Auth state not properly handled or deadlock in onAuthStateChange",
          fix: "Check useAuth hook implementation",
          code: `// Fix auth state handling
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    setSession(session);
    setUser(session?.user ?? null);
    // Don't call other Supabase functions here!
  });
  return () => subscription.unsubscribe();
}, []);`
        }
      ]
    },
    "Database (Supabase Tables/RLS)": {
      issues: [
        {
          problem: "Can't see/insert data",
          cause: "Missing or incorrect RLS policies",
          fix: "Add appropriate RLS policies for user access",
          code: `-- Enable RLS
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- Add basic policies
CREATE POLICY "Users can view own data" ON your_table FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON your_table FOR INSERT WITH CHECK (auth.uid() = user_id);`
        },
        {
          problem: "Foreign key errors",
          cause: "Referencing wrong table or missing relationships",
          fix: "Check foreign key constraints and table relationships",
          code: `-- Check constraints
SELECT constraint_name, table_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'your_table';`
        }
      ]
    },
    "Forms (Property Intake/User Registration)": {
      issues: [
        {
          problem: "Form validation errors",
          cause: "Schema mismatch or missing required fields",
          fix: "Check form schema against database table structure",
          code: `// Ensure form data matches table schema
const { error } = await supabase
  .from('properties')
  .insert({
    agent_id: user.id, // Make sure this matches your user reference
    property_type: formData.propertyType,
    // ... other fields matching exactly
  });`
        }
      ]
    },
    "API (Edge Functions/External APIs)": {
      issues: [
        {
          problem: "Edge function not responding",
          cause: "CORS issues or function not deployed",
          fix: "Check CORS headers and function deployment",
          code: `// Add CORS headers to edge function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle OPTIONS request
if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}`
        }
      ]
    },
    "UI Components (Styling/Layout)": {
      issues: [
        {
          problem: "Colors appearing wrong (yellow instead of white)",
          cause: "HSL color functions receiving non-HSL values",
          fix: "Check index.css and tailwind.config.ts for proper HSL color definitions",
          code: `/* Fix in index.css - use HSL values */
:root {
  --background: 0 0% 100%; /* NOT rgb(255,255,255) */
  --foreground: 222.2 84% 4.9%;
}

/* In tailwind.config.ts */
colors: {
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
}`
        }
      ]
    }
  };

  const addMessage = (content: string, type: 'bot' | 'user', actions?: DiagnosticAction[]) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      hasActions: !!actions,
      actions
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const analyzeIssue = () => {
    const systemPart = issueData.systemPart;
    const errorDesc = issueData.errorDescription?.toLowerCase() || '';
    
    let diagnosis: IssueDiagnosis = {
      category: systemPart,
      likelyCause: "Unknown issue",
      suggestedFix: "Need more information to diagnose",
      priority: 'medium'
    };

    // Simple pattern matching for common issues
    if (systemPart === "Authentication (Login/Signup)") {
      if (errorDesc.includes('infinite') || errorDesc.includes('loading')) {
        diagnosis = {
          category: 'Authentication',
          likelyCause: 'Auth state deadlock in onAuthStateChange callback',
          suggestedFix: 'Remove Supabase calls from auth state listener',
          codeSnippet: `// Fix: Don't call Supabase functions in onAuthStateChange
supabase.auth.onAuthStateChange((event, session) => {
  setSession(session);
  setUser(session?.user ?? null);
  // Use setTimeout for other operations
  if (event === 'SIGNED_IN') {
    setTimeout(() => fetchUserData(), 0);
  }
});`,
          priority: 'high'
        };
      } else if (errorDesc.includes('policy') || errorDesc.includes('permission')) {
        diagnosis = {
          category: 'Authentication', 
          likelyCause: 'Missing or incorrect RLS policies',
          suggestedFix: 'Check RLS policies on auth-related tables',
          codeSnippet: `-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Add missing profile policies  
CREATE POLICY "Public profiles are viewable" ON profiles FOR SELECT USING (true);`,
          priority: 'high'
        };
      }
    } else if (systemPart === "Database (Supabase Tables/RLS)") {
      if (errorDesc.includes('rls') || errorDesc.includes('policy') || errorDesc.includes('permission')) {
        diagnosis = {
          category: 'Database',
          likelyCause: 'Row Level Security policies blocking access',
          suggestedFix: 'Add or fix RLS policies for data access',
          codeSnippet: `-- Enable RLS and add policies
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own data" ON your_table 
FOR ALL USING (auth.uid() = user_id);`,
          priority: 'critical'
        };
      }
    } else if (systemPart === "UI Components (Styling/Layout)") {
      if (errorDesc.includes('yellow') || errorDesc.includes('color')) {
        diagnosis = {
          category: 'UI/Styling',
          likelyCause: 'Non-HSL colors passed to HSL functions in CSS',
          suggestedFix: 'Use HSL format in index.css color definitions',
          codeSnippet: `/* Fix color definitions in index.css */
:root {
  --background: 0 0% 100%;  /* HSL format */
  --foreground: 222.2 84% 4.9%;
}

/* NOT rgb(255,255,255) or #ffffff */`,
          priority: 'medium'
        };
      }
    }

    setDiagnosis(diagnosis);
    
    const actions: DiagnosticAction[] = [
      {
        type: 'code',
        label: 'Copy Fix Code',
        content: diagnosis.codeSnippet || '',
        description: 'Copy the suggested code fix'
      },
      {
        type: 'link', 
        label: 'Supabase Dashboard',
        content: 'https://supabase.com/dashboard',
        description: 'Open Supabase project dashboard'
      },
      {
        type: 'link',
        label: 'Troubleshooting Docs', 
        content: 'https://docs.lovable.dev/tips-tricks/troubleshooting',
        description: 'View complete troubleshooting guide'
      }
    ];

    const analysisMessage = `
🔍 **Diagnosis Complete**

**Issue Category:** ${diagnosis.category}
**Priority:** ${diagnosis.priority.toUpperCase()}

**Likely Cause:** ${diagnosis.likelyCause}

**Suggested Fix:** ${diagnosis.suggestedFix}

${diagnosis.codeSnippet ? '**Code Fix Available** ⬇️' : ''}

I've provided some actions below to help resolve this issue. Would you like me to explain any part of the diagnosis in more detail?
    `;

    addMessage(analysisMessage, 'bot', actions);
  };

  const handleNext = (value?: string) => {
    const currentQuestion = diagnosticQuestions[currentStep];
    const inputValue = value || currentInput;
    
    setIssueData(prev => ({ ...prev, [currentQuestion.key]: inputValue }));
    addMessage(inputValue, 'user');

    if (currentStep < diagnosticQuestions.length - 1) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        addMessage(diagnosticQuestions[currentStep + 1].question, 'bot');
      }, 500);
    } else {
      setTimeout(() => {
        addMessage("Analyzing your issue... 🔍", 'bot');
        setTimeout(analyzeIssue, 1000);
      }, 500);
    }
    
    setCurrentInput('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  const openLink = (url: string) => {
    window.open(url, '_blank');
  };

  const startAssistant = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      addMessage("👋 Hi! I'm your Developer Assistant. I'll help diagnose and solve technical issues on your real estate platform.", 'bot');
      setTimeout(() => {
        addMessage(diagnosticQuestions[0].question, 'bot');
      }, 1000);
    }
  };

  const resetAssistant = () => {
    setMessages([]);
    setCurrentStep(0);
    setIssueData({});
    setDiagnosis(null);
    setCurrentInput('');
    addMessage("👋 Hi! I'm your Developer Assistant. I'll help diagnose and solve technical issues on your real estate platform.", 'bot');
    setTimeout(() => {
      addMessage(diagnosticQuestions[0].question, 'bot');
    }, 1000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderInput = () => {
    if (diagnosis) {
      return (
        <div className="flex justify-center">
          <Button onClick={resetAssistant} variant="outline">
            New Diagnosis
          </Button>
        </div>
      );
    }

    const currentQuestion = diagnosticQuestions[currentStep];
    
    switch (currentQuestion.type) {
      case 'select':
        return (
          <Select onValueChange={handleNext}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {currentQuestion.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))
              }
            </SelectContent>
          </Select>
        );

      case 'textarea':
        return (
          <div className="space-y-2">
            <Textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder={currentQuestion.placeholder}
              rows={3}
            />
            <Button onClick={() => handleNext()} className="w-full">
              Continue
            </Button>
          </div>
        );

      default:
        return (
          <div className="flex space-x-2">
            <Input
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Type your answer..."
              onKeyPress={(e) => e.key === 'Enter' && handleNext()}
              className="flex-1"
            />
            <Button onClick={() => handleNext()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        );
    }
  };

  return (
    <>
      {/* Developer Assistant Button */}
      {!isOpen && (
        <Button
          onClick={startAssistant}
          className="fixed bottom-52 right-6 rounded-full w-14 h-14 bg-violet-600 hover:bg-violet-700 shadow-lg z-50"
          size="icon"
        >
          <Code className="h-6 w-6" />
        </Button>
      )}

      {/* Assistant Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[520px] h-[650px] shadow-xl z-50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center space-x-2">
              <Code className="h-5 w-5 text-violet-600" />
              <CardTitle className="text-lg">Developer Assistant</CardTitle>
              <Badge variant="secondary">Diagnose & Solve</Badge>
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
                  <div key={message.id}>
                    <div
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg p-3 ${
                          message.type === 'user'
                            ? 'bg-violet-600 text-white'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.type === 'bot' && <Bug className="h-4 w-4 mt-0.5 text-violet-600" />}
                          <p className="text-sm whitespace-pre-line">{message.content}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    {message.hasActions && message.actions && (
                      <div className="flex flex-wrap gap-2 mt-2 ml-6">
                        {message.actions.map((action, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (action.type === 'code') {
                                copyToClipboard(action.content);
                              } else if (action.type === 'link') {
                                openLink(action.content);
                              }
                            }}
                            className="text-xs"
                          >
                            {action.type === 'code' && <Copy className="h-3 w-3 mr-1" />}
                            {action.type === 'link' && <ExternalLink className="h-3 w-3 mr-1" />}
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            {renderInput()}

            {/* Progress indicator */}
            {!diagnosis && (
              <div className="flex justify-center">
                <Badge variant="secondary">
                  Step {currentStep + 1} of {diagnosticQuestions.length}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default DeveloperAssistant;
