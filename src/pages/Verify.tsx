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
import { sendEmailOTP } from "@/lib/emailService";
import { sendSMSOTP } from "@/lib/smsService";

const Verify = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [emailVerificationCode, setEmailVerificationCode] = useState<string | null>(null);
  const [phoneVerificationCode, setPhoneVerificationCode] = useState<string | null>(null);

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const checkVerificationStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      navigate("/auth");
      return;
    }

    setUser(user);

    console.log("🔍 Checking verification status for user:", user.id);

    // Check profile for verification status and phone number
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email_verified, phone_verified, phone, full_name, email")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("❌ Profile fetch error:", profileError);
      toast.error("Profile not found. Please try signing up again.");
      return;
    }

    if (profile) {
      console.log("✅ Profile loaded:", profile);
      setProfile(profile);
      setEmailVerified(profile.email_verified);
      setPhoneVerified(profile.phone_verified);

      // Check if phone number exists
      if (!profile.phone) {
        console.warn("⚠️ Phone number missing in profile!");
        toast.warning("Phone number missing. Please contact support.");
      } else {
        console.log("📱 Phone number found:", profile.phone);
      }

      // If both verified, redirect to dashboard
      if (profile.email_verified && profile.phone_verified) {
        console.log("🎉 Both verifications complete!");
        toast.success("Both email and phone verified!");
        navigate("/dashboard");
      }
    }
  };

  const handleSendEmailOtp = async () => {
    if (!user?.email) return;

    const otp = generateOTP();
    setEmailVerificationCode(otp);

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 EMAIL OTP GENERATED");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Email:", user.email);
    console.log("OTP Code:", otp);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    setSendingOtp(true);
    try {
      const success = await sendEmailOTP(user.email, otp);
      if (success) {
        toast.success(`Verification code sent! Check console for OTP: ${otp}`);
        console.log("✅ Email sent successfully");
      } else {
        toast.warning(`Email service unavailable. Use this OTP: ${otp}`);
        console.log("⚠️ Email service failed, but OTP is available above");
      }
    } catch (error: any) {
      toast.warning(`Email error. Use this OTP: ${otp}`);
      console.error("❌ Email error:", error.message);
      console.log("💡 You can still use the OTP shown above");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    setLoading(true);
    try {
      if (emailOtp === emailVerificationCode) {
        // Update profile
        await supabase
          .from("profiles")
          .update({ email_verified: true })
          .eq("id", user.id);

        setEmailVerified(true);
        toast.success("Email verified successfully!");
        checkVerificationStatus();
      } else {
        toast.error("Invalid verification code");
      }
    } catch (error: any) {
      toast.error(error.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneOtp = async () => {
    if (!profile?.phone) {
      toast.error("Phone number not found. Please update your profile.");
      return;
    }

    const otp = generateOTP();
    setPhoneVerificationCode(otp);

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📱 PHONE OTP GENERATED");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Phone:", profile.phone);
    console.log("OTP Code:", otp);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    setSendingOtp(true);
    try {
      const success = await sendSMSOTP(profile.phone, otp);
      if (success) {
        toast.success(`SMS sent! Check console for OTP: ${otp}`);
        console.log("✅ SMS sent successfully");
      } else {
        toast.warning(`SMS service unavailable. Use this OTP: ${otp}`);
        console.log("⚠️ SMS service failed, but OTP is available above");
      }
    } catch (error: any) {
      toast.warning(`SMS error. Use this OTP: ${otp}`);
      console.error("❌ SMS error:", error.message);
      console.log("💡 You can still use the OTP shown above");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.phone) return;

    setLoading(true);
    try {
      if (phoneOtp === phoneVerificationCode) {
        // Update profile
        await supabase
          .from("profiles")
          .update({ phone_verified: true })
          .eq("id", user.id);

        setPhoneVerified(true);
        toast.success("Phone verified successfully!");
        checkVerificationStatus();
      } else {
        toast.error("Invalid verification code");
      }
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
                  : `Verify ${profile?.phone || "your phone number"}`}
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
                      disabled={sendingOtp || !profile?.phone}
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
                  {!profile?.phone && (
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
