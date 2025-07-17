import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  Users, 
  Building2, 
  Home, 
  Briefcase, 
  Search, 
  PlusCircle, 
  BarChart3, 
  Globe,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface UserRole {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  actions: Array<{
    label: string;
    labelAr: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    descriptionAr: string;
  }>;
}

interface UserOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleSelected: (role: string) => void;
}

const roles: UserRole[] = [
  {
    id: "buyer",
    title: "Buyer",
    titleAr: "مشتري",
    description: "Looking for your perfect property",
    descriptionAr: "تبحث عن العقار المثالي",
    icon: Search,
    color: "bg-blue-500",
    actions: [
      {
        label: "Browse Properties",
        labelAr: "تصفح العقارات",
        icon: Building2,
        description: "Explore available properties",
        descriptionAr: "استكشف العقارات المتاحة"
      },
      {
        label: "Get AI Assistance",
        labelAr: "احصل على مساعدة الذكي",
        icon: Sparkles,
        description: "Chat with our AI assistant",
        descriptionAr: "تحدث مع مساعدنا الذكي"
      }
    ]
  },
  {
    id: "agent",
    title: "Agent",
    titleAr: "وسيط عقاري",
    description: "Real estate professional",
    descriptionAr: "محترف عقاري",
    icon: Briefcase,
    color: "bg-green-500",
    actions: [
      {
        label: "Add Properties",
        labelAr: "إضافة عقارات",
        icon: PlusCircle,
        description: "List new properties",
        descriptionAr: "إدراج عقارات جديدة"
      },
      {
        label: "Track Commissions",
        labelAr: "تتبع العمولات",
        icon: BarChart3,
        description: "Monitor your earnings",
        descriptionAr: "راقب أرباحك"
      }
    ]
  },
  {
    id: "owner",
    title: "Property Owner",
    titleAr: "مالك عقار",
    description: "Own properties to rent or sell",
    descriptionAr: "تمتلك عقارات للإيجار أو البيع",
    icon: Home,
    color: "bg-purple-500",
    actions: [
      {
        label: "List Property",
        labelAr: "إدراج عقار",
        icon: PlusCircle,
        description: "Add your property",
        descriptionAr: "أضف عقارك"
      },
      {
        label: "Find Agent",
        labelAr: "العثور على وسيط",
        icon: Users,
        description: "Connect with agents",
        descriptionAr: "تواصل مع الوسطاء"
      }
    ]
  },
  {
    id: "developer",
    title: "Developer",
    titleAr: "مطور عقاري",
    description: "Develop and sell properties",
    descriptionAr: "تطوير وبيع العقارات",
    icon: Building2,
    color: "bg-orange-500",
    actions: [
      {
        label: "Showcase Projects",
        labelAr: "عرض المشاريع",
        icon: Globe,
        description: "Display your developments",
        descriptionAr: "اعرض تطويراتك"
      },
      {
        label: "Analytics",
        labelAr: "التحليلات",
        icon: BarChart3,
        description: "Track project performance",
        descriptionAr: "تتبع أداء المشروع"
      }
    ]
  }
];

export default function UserOnboarding({ isOpen, onClose, onRoleSelected }: UserOnboardingProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isArabic, setIsArabic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { profile } = useUserProfile();

  const handleRoleSelection = async (roleId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Update user profile with selected role
      const { error } = await supabase
        .from("profiles")
        .update({ role: roleId })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: isArabic ? "تم حفظ دورك بنجاح" : "Role saved successfully",
        description: isArabic ? "مرحباً بك في منزلي!" : "Welcome to Manzily!"
      });

      onRoleSelected(roleId);
      onClose();
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to save your role. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleActions = (role: UserRole) => {
    return role.actions.map((action, index) => (
      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
        <div className={`w-8 h-8 ${role.color} rounded-full flex items-center justify-center flex-shrink-0`}>
          <action.icon className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-sm">
            {isArabic ? action.labelAr : action.label}
          </h4>
          <p className="text-xs text-muted-foreground">
            {isArabic ? action.descriptionAr : action.description}
          </p>
        </div>
      </div>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">Manzily</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsArabic(false)}
                className={!isArabic ? "bg-primary text-primary-foreground" : ""}
              >
                EN
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsArabic(true)}
                className={isArabic ? "bg-primary text-primary-foreground" : ""}
              >
                عربي
              </Button>
            </div>
          </div>
          
          <DialogTitle className="text-2xl">
            {isArabic ? "مرحباً بك في منزلي، منصة العقارات الذكية" : "Welcome to Manzily, your smart real estate platform"}
          </DialogTitle>
          
          <DialogDescription className="text-lg">
            {isArabic 
              ? "لنبدأ! يرجى إخباري بدورك وما تريد فعله اليوم"
              : "Let's get started! Please tell me your role and what you want to do today"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">
              {isArabic ? "اختر دورك:" : "Choose your role:"}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((role) => (
              <Card 
                key={role.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                  selectedRole === role.id 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedRole(role.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${role.color} rounded-full flex items-center justify-center`}>
                      <role.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {isArabic ? role.titleAr : role.title}
                      </CardTitle>
                      <CardDescription>
                        {isArabic ? role.descriptionAr : role.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground mb-3">
                      {isArabic ? "ما يمكنك فعله:" : "What you can do:"}
                    </p>
                    {getRoleActions(role)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedRole && (
            <div className="flex justify-center pt-4">
              <Button 
                onClick={() => handleRoleSelection(selectedRole)}
                disabled={isLoading}
                size="lg"
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                ) : (
                  <>
                    {isArabic ? "ابدأ الآن" : "Get Started"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {isArabic 
            ? "يمكنك تغيير دورك في أي وقت من إعدادات الملف الشخصي"
            : "You can change your role anytime from your profile settings"
          }
        </div>
      </DialogContent>
    </Dialog>
  );
}