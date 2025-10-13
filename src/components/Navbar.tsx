import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Trophy className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">WinQuizz</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link to="/#how-it-works" className="text-foreground hover:text-primary transition-colors">
            How It Works
          </Link>
          <Link to="/#features" className="text-foreground hover:text-primary transition-colors">
            Features
          </Link>
          <Link to="/#prizes" className="text-foreground hover:text-primary transition-colors">
            Prizes
          </Link>
          <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
            Contact
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate("/auth")} className="hover:text-primary">
            Login
          </Button>
          <Button onClick={() => navigate("/auth")} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            Register Now
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
