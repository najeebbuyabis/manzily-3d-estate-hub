import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Phone, Lock, User, Building2, MessageSquare } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("buyer");
  const [companyName, setCompanyName] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [tempUserId, setTempUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const sendOtp = async () => {
    if (!mobile) {
      toast({
        title: "Mobile number required",
        description: "Please enter your mobile number",
        variant: "destructive",
      });
      return;
    }

    // Format mobile number with Kuwait country code
    const formattedMobile = mobile.startsWith('+965') ? mobile : `+965${mobile.replace(/^0+/, '')}`;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { mobile: formattedMobile }
      });

      if (error) throw error;

      setOtpSent(true);
      setShowOtpInput(true);
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${formattedMobile}`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to send OTP",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!showOtpInput) {
      await sendOtp();
      return;
    }

    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Format mobile number with Kuwait country code
      const formattedMobile = mobile.startsWith('+965') ? mobile : `+965${mobile.replace(/^0+/, '')}`;
      
      const { data, error } = await supabase.functions.invoke('verify-otp-signin', {
        body: { mobile: formattedMobile, password, otp }
      });

      if (error) throw error;

      if (data.session) {
        await supabase.auth.setSession(data.session);
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        onOpenChange(false);
      }
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (!showOtpInput) {
      await sendOtp();
      return;
    }

    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Format mobile number with Kuwait country code
      const formattedMobile = mobile.startsWith('+965') ? mobile : `+965${mobile.replace(/^0+/, '')}`;
      
      const { data, error } = await supabase.functions.invoke('verify-otp-signup', {
        body: { 
          mobile: formattedMobile, 
          password, 
          otp,
          fullName,
          role,
          companyName
        }
      });

      if (error) throw error;

      if (data.session) {
        await supabase.auth.setSession(data.session);
        toast({
          title: "Account created!",
          description: "Welcome to Manzily Real Estate Platform.",
        });
        onOpenChange(false);
      }
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-trust-dark">
            Welcome to Manzily
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-mobile">Mobile Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-trust-light" />
                  <Input
                    id="signin-mobile"
                    type="tel"
                    placeholder="e.g., 99662248 or +96599662248"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">Enter your Kuwait mobile number (automatically adds +965)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-trust-light" />
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              {showOtpInput && (
                <div className="space-y-2">
                  <Label htmlFor="signin-otp">Verification Code</Label>
                  <div className="flex flex-col items-center space-y-2">
                    <InputOTP value={otp} onChange={setOtp} maxLength={6}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                    <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to your mobile</p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity font-semibold h-11"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? (showOtpInput ? "Verifying..." : "Sending OTP...") : (showOtpInput ? "Verify & Sign In" : "Send OTP")}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-trust-light" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-mobile">Mobile Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-trust-light" />
                  <Input
                    id="signup-mobile"
                    type="tel"
                    placeholder="e.g., 99662248 or +96599662248"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">Enter your Kuwait mobile number (automatically adds +965)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Account Type</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="agent">Real Estate Agent</SelectItem>
                    <SelectItem value="agency">Real Estate Agency</SelectItem>
                    <SelectItem value="owner">Property Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(role === "agent" || role === "agency") && (
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-trust-light" />
                    <Input
                      id="company"
                      type="text"
                      placeholder="Enter company name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-trust-light" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-trust-light" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              {showOtpInput && (
                <div className="space-y-2">
                  <Label htmlFor="signup-otp">Verification Code</Label>
                  <div className="flex flex-col items-center space-y-2">
                    <InputOTP value={otp} onChange={setOtp} maxLength={6}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                    <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to your mobile</p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity font-semibold h-11"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? (showOtpInput ? "Creating Account..." : "Sending OTP...") : (showOtpInput ? "Verify & Create Account" : "Send OTP")}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}