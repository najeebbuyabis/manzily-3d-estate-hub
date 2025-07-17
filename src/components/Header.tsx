import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, User, Globe, Menu, LogOut, CreditCard, DollarSign, FileText, Users, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { AuthModal } from "@/components/auth/AuthModal";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from "@/components/LanguageToggle";

export const Header: React.FC = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Check if user is admin
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!user?.id,
  });

  const isAdmin = userProfile?.role === 'admin';

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-background/95 backdrop-blur-lg border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-bold text-foreground">Manzily</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Real Estate Platform</p>
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Button variant="ghost" onClick={() => navigate('/')} className="text-foreground hover:text-primary transition-colors font-medium">
              {t('home')}
            </Button>
            <Button variant="ghost" onClick={() => navigate('/developers')} className="text-muted-foreground hover:text-primary transition-colors">
              {t('developers')}
            </Button>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              {t('agents')}
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              {t('about')}
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              {t('contact')}
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <LanguageToggle />

            {/* Auth Buttons */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4" />
                    {user.email?.split('@')[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background border z-50">
                  <DropdownMenuItem onClick={() => navigate('/billing')}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    {t('billing')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/commissions')}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    {t('commissions')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/invoices')}>
                    <FileText className="mr-2 h-4 w-4" />
                    {t('invoices')}
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Users className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setAuthModalOpen(true)}>
                <User className="h-4 w-4" />
                {t('signIn')}
              </Button>
            )}
            
            <Button variant="hero" size="sm">
              {t('listProperty')}
            </Button>

            {/* Mobile Menu */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </header>
  );
};

export default Header;