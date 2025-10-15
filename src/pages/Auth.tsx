import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("🚀 Starting signup process...");
      console.log("Email:", email);
      console.log("Phone:", phone);
      console.log("Full Name:", fullName);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/verify`,
          data: {
            full_name: fullName,
            phone: phone,
          }
        },
      });

      if (error) {
        console.error("❌ Signup error:", error);
        throw error;
      }
      
      console.log("✅ User created:", data.user?.id);
      
      if (data.user) {
        // Create profile directly (no trigger dependency)
        console.log("📝 Creating profile...");
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            email: email,
            phone: phone,
            full_name: fullName,
            role: 'user',
            email_verified: false,
            phone_verified: false
          })
          .select()
          .single();

        if (insertError) {
          console.error("⚠️ Profile insert error:", insertError);
          console.log("🔄 Trying upsert instead...");
          
          // Try upsert (insert or update)
          const { data: upsertProfile, error: upsertError } = await supabase
            .from("profiles")
            .upsert({
              id: data.user.id,
              email: email,
              phone: phone,
              full_name: fullName,
              role: 'user',
              email_verified: false,
              phone_verified: false
            }, {
              onConflict: 'id'
            })
            .select()
            .single();

          if (upsertError) {
            console.error("❌ Upsert error:", upsertError);
            console.log("💡 Profile creation failed, but continuing...");
          } else {
            console.log("✅ Profile created via upsert:", upsertProfile);
          }
        } else {
          console.log("✅ Profile created successfully:", newProfile);
        }

        console.log("🎉 Signup complete! Redirecting to verification...");
        toast.success("Account created! Redirecting to verification...");
        
        // Force navigation immediately
        console.log("🔄 Attempting navigation to /verify...");
        console.log("Current URL:", window.location.href);
        
        // Use window.location for guaranteed redirect
        setTimeout(() => {
          console.log("⚡ Forcing redirect with window.location...");
          window.location.href = "/verify";
        }, 100);
      }
    } catch (error: any) {
      console.error("❌ Full signup error:", error);
      
      // Check if user was created despite error
      if (error.message?.includes("already registered") || error.message?.includes("User already registered")) {
        console.log("⚠️ User exists, redirecting to verify anyway...");
        toast.info("Account exists. Redirecting to verification...");
        setLoading(false);
        setTimeout(() => {
          window.location.href = "/verify";
        }, 500);
      } else {
        toast.error(error.message || "An error occurred during sign up");
        setLoading(false);
      }
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        throw error;
      }
      
      // Check if both email and phone are verified
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("email_verified, phone_verified")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          toast.info("Profile not found. Redirecting to verification...");
          setTimeout(() => {
            window.location.href = "/verify";
          }, 500);
          return;
        }

        if (profile && profile.email_verified && profile.phone_verified) {
          toast.success("Logged in successfully!");
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 500);
        } else {
          toast.info("Please verify your email and phone");
          setTimeout(() => {
            window.location.href = "/verify";
          }, 500);
        }
      }
    } catch (error: any) {
      console.error("Full login error:", error);
      toast.error(error.message || "An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Welcome to WinQuizz</CardTitle>
          <CardDescription className="text-center">
            Sign up to participate in exciting quizzes and win amazing prizes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signup" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="login">Login</TabsTrigger>
            </TabsList>

            <TabsContent value="signup">
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-fullname">Full Name</Label>
                  <Input
                    id="signup-fullname"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Phone Number</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="+91 1234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                  {loading ? "Processing..." : "Sign Up"}
                </Button>
                
                {/* Debug button - remove in production */}
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full mt-2" 
                  onClick={() => {
                    console.log("🧪 Testing navigation...");
                    navigate("/verify");
                  }}
                >
                  🧪 Test Navigate to Verify
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="login">
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                  {loading ? "Processing..." : "Login"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
