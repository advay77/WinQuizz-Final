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
    const checkAuth = async () => {
      try {
        // 🔹 Fetch user info
        const {
          data: { user },
        } = await supabase.auth.getUser();

        // 🔹 Fetch session info
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // 🚫 No user or session -> stay on landing page
        if (!user || !session) return;

        // 🔹 Admin check
        if (user.email === "admin.winquizz@gmail.com") {
          navigate("/admin");
          return;
        }

        // 🔹 Fetch profile info for verification status
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("email_verified, phone_verified")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          return;
        }

        if (!profile) {
          console.warn("Profile not found for user:", user.id);
          return;
        }

        // ✅ Check verification status
        if ((profile as { email_verified: boolean; phone_verified: boolean }).email_verified &&
            (profile as { email_verified: boolean; phone_verified: boolean }).phone_verified) {
          navigate("/dashboard");
        } else {
          navigate("/verify");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        // stay on landing page if anything fails
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-16"> {/* Add padding-top to account for fixed navbar */}
        <HeroSection />
        <FeaturesSection />
        <PrizesSection />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
