import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Mail, Phone, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

const Verify = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    setUser(user);

    // Check profile for verification status
    const { data: profile } = await supabase
      .from("profiles")
      .select("email_verified, phone_verified")
      .eq("id", user.id)
      .single();

    if (profile) {
      setEmailVerified(profile.email_verified);
      setPhoneVerified(profile.phone_verified);

      // If both verified, redirect to dashboard
      if (profile.email_verified && profile.phone_verified) {
        toast.success("Both email and phone verified!");
        navigate("/dashboard");
      }
    }
  };

  const handleSendEmailOtp = async () => {
    if (!user?.email) return;
    
    setSendingOtp(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: user.email,
        options: {
          shouldCreateUser: false,
        }
      });

      if (error) throw error;
      toast.success("Verification code sent to your email!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: user.email,
        token: emailOtp,
        type: "email"
      });

      if (error) throw error;

      // Update profile
      await supabase
        .from("profiles")
        .update({ email_verified: true })
        .eq("id", user.id);

      setEmailVerified(true);
      toast.success("Email verified successfully!");
      checkVerificationStatus();
    } catch (error: any) {
      toast.error(error.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneOtp = async () => {
    if (!user?.phone) {
      toast.error("Phone number not found. Please update your profile.");
      return;
    }
    
    setSendingOtp(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: user.phone,
        options: {
          shouldCreateUser: false,
        }
      });

      if (error) throw error;
      toast.success("Verification code sent to your phone!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP. Make sure phone provider is configured.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.phone) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: user.phone,
        token: phoneOtp,
        type: "sms"
      });

      if (error) throw error;

      // Update profile
      await supabase
        .from("profiles")
        .update({ phone_verified: true })
        .eq("id", user.id);

      setPhoneVerified(true);
      toast.success("Phone verified successfully!");
      checkVerificationStatus();
    } catch (error: any) {
      toast.error(error.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/30 px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="h-12 w-12 text-primary" />
            <span className="text-4xl font-bold">WinQuizz</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Verify Your Account</h1>
          <p className="text-muted-foreground">
            Please verify both your email and phone number to access your dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email Verification */}
          <Card className={`border-2 ${emailVerified ? "border-green-500" : ""}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {emailVerified ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : (
                  <Mail className="h-6 w-6 text-primary" />
                )}
                Email Verification
              </CardTitle>
              <CardDescription>
                {emailVerified 
                  ? "Your email has been verified!" 
                  : `Verify ${user?.email || "your email"}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!emailVerified ? (
                <form onSubmit={handleVerifyEmail} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-otp">Verification Code</Label>
                    <Input
                      id="email-otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value)}
                      maxLength={6}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSendEmailOtp}
                      disabled={sendingOtp}
                      className="flex-1"
                    >
                      {sendingOtp ? "Sending..." : "Send Code"}
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || emailOtp.length !== 6}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      Verify
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-2" />
                  <p className="text-green-600 font-semibold">Email Verified!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Phone Verification */}
          <Card className={`border-2 ${phoneVerified ? "border-green-500" : ""}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {phoneVerified ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : (
                  <Phone className="h-6 w-6 text-primary" />
                )}
                Phone Verification
              </CardTitle>
              <CardDescription>
                {phoneVerified 
                  ? "Your phone has been verified!" 
                  : `Verify ${user?.phone || "your phone number"}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!phoneVerified ? (
                <form onSubmit={handleVerifyPhone} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone-otp">Verification Code</Label>
                    <Input
                      id="phone-otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={phoneOtp}
                      onChange={(e) => setPhoneOtp(e.target.value)}
                      maxLength={6}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSendPhoneOtp}
                      disabled={sendingOtp || !user?.phone}
                      className="flex-1"
                    >
                      {sendingOtp ? "Sending..." : "Send Code"}
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || phoneOtp.length !== 6}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      Verify
                    </Button>
                  </div>
                  {!user?.phone && (
                    <p className="text-sm text-destructive">
                      Phone number missing. Please sign up with phone.
                    </p>
                  )}
                </form>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-2" />
                  <p className="text-green-600 font-semibold">Phone Verified!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {emailVerified && phoneVerified && (
          <div className="mt-6 text-center">
            <Button
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="bg-primary hover:bg-primary/90 text-lg px-8"
            >
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Verify;
