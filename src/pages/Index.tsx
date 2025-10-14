import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import PrizesSection from "@/components/PrizesSection";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();

      if (user && session) {
        // Check if user is admin
        if (user.email === "admin.winquizz@gmail.com") {
          navigate("/admin");
        } else {
          // Check if both email and phone are verified
          const { data: profile } = await supabase
            .from("profiles")
            .select("email_verified, phone_verified")
            .eq("id", user.id)
            .single();

          if (profile?.email_verified && profile?.phone_verified) {
            navigate("/dashboard");
          } else {
            navigate("/verify");
          }
        }
      }
    } catch (error) {
      // User not authenticated, stay on landing page
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <PrizesSection />
      <Footer />
    </div>
  );
};

export default Index;
