import { Trophy, User, LogOut, BarChart3, Home, Menu, X, Settings, Phone, Wallet, Shield, ChevronDown, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface Profile {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  role?: string | null;
  wallet_balance?: number | null;
  documents_verified?: boolean | null;
}

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Fetch user profile if user exists
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setProfile(profileData);
      }
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // User Navbar - shown when user is logged in
  if (user && !loading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Trophy className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">WinQuizz</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors flex items-center gap-2">
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link to="/progress" className="text-foreground hover:text-primary transition-colors flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Progress
            </Link>
            <Link to="/leaderboard" className="text-foreground hover:text-primary transition-colors flex items-center gap-2">
              <Award className="h-4 w-4" />
              Leaderboard
            </Link>
            <Link to="/withdrawal" className="text-foreground hover:text-primary transition-colors flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Withdraw
            </Link>
            <Link to="/contest" className="text-foreground hover:text-primary transition-colors flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Contest
            </Link>
            {profile?.role === 'admin' && (
              <Link to="/admin" className="text-foreground hover:text-primary transition-colors flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-md">
                <Shield className="h-4 w-4" />
                Admin Panel
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Desktop User Dropdown */}
          <div className="hidden md:flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-accent">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{profile?.full_name || user.email?.split('@')[0]}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="flex flex-col space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{profile?.full_name || user.email?.split('@')[0]}</span>
                    {profile?.role === 'admin' && (
                      <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                        ADMIN
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Wallet Balance */}
                <DropdownMenuItem className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Wallet Balance</span>
                    <span className="text-xs text-muted-foreground">₹{profile?.wallet_balance?.toFixed(2) || '0.00'}</span>
                  </div>
                </DropdownMenuItem>

                {/* KYC Status */}
                <DropdownMenuItem className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">KYC Status</span>
                    <div className="flex gap-1 mt-1">
                      <Badge variant={profile?.email_verified ? "default" : "secondary"} className="text-xs">
                        Email {profile?.email_verified ? "✓" : "✗"}
                      </Badge>
                      <Badge variant={profile?.phone_verified ? "default" : "secondary"} className="text-xs">
                        Phone {profile?.phone_verified ? "✓" : "✗"}
                      </Badge>
                      <Badge variant={profile?.documents_verified ? "default" : "secondary"} className="text-xs">
                        Docs {profile?.documents_verified ? "✓" : "✗"}
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Info & Settings */}
                <DropdownMenuItem className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Info & Settings</span>
                </DropdownMenuItem>

                {/* 24*7 Contact */}
                <DropdownMenuItem className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>24*7 Contact</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Logout */}
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:text-red-700">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <Link 
                to="/dashboard" 
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              <Link 
                to="/progress" 
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <BarChart3 className="h-4 w-4" />
                Progress
              </Link>
              <Link 
                to="/leaderboard" 
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Award className="h-4 w-4" />
                Leaderboard
              </Link>
              <Link 
                to="/withdrawal" 
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Wallet className="h-4 w-4" />
                Withdraw
              </Link>
              {profile?.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="flex items-center gap-2 text-foreground hover:text-primary transition-colors py-2 bg-primary/10 px-3 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <User className="h-4 w-4" />
                  <span>{profile?.full_name || user.email?.split('@')[0]}</span>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }} 
                  className="hover:text-primary flex items-center gap-2 w-full justify-start"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    );
  }

  // Default Navbar - shown when user is not logged in
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Trophy className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">WinQuizz</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/#HowItWorks" className="text-foreground hover:text-primary transition-colors">
            How It Works
          </Link>
          <Link to="/#Features" className="text-foreground hover:text-primary transition-colors">
            Features
          </Link>
          <Link to="/#Prizes" className="text-foreground hover:text-primary transition-colors">
            Prizes
          </Link>
          <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
            Contact
          </Link>
        </div>

        {/* Mobile Hamburger Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate("/auth")} className="hover:text-primary">
            Login
          </Button>
          <Button onClick={() => navigate("/auth")} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            Register Now
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link 
              to="/#how-it-works" 
              className="block text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link 
              to="/#features" 
              className="block text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              to="/#prizes" 
              className="block text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Prizes
            </Link>
            <Link 
              to="/contact" 
              className="block text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="border-t border-border pt-4 space-y-3">
              <Button 
                variant="ghost" 
                onClick={() => {
                  navigate("/auth");
                  setIsMenuOpen(false);
                }} 
                className="hover:text-primary w-full justify-start"
              >
                Login
              </Button>
              <Button 
                onClick={() => {
                  navigate("/auth");
                  setIsMenuOpen(false);
                }} 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold w-full"
              >
                Register Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
