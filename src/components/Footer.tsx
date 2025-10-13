import { Trophy } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">WinQuizz</span>
            </div>
            <p className="text-background/80">
              India's first ultimate skill-based contest platform.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/#how-it-works" className="text-background/80 hover:text-primary transition-colors">How It Works</Link></li>
              <li><Link to="/#features" className="text-background/80 hover:text-primary transition-colors">Features</Link></li>
              <li><Link to="/#prizes" className="text-background/80 hover:text-primary transition-colors">Prizes</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-background/80 hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="text-background/80 hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/refund" className="text-background/80 hover:text-primary transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-2 text-background/80">
              <li>Email: support@winquizz.com</li>
              <li>Phone: +91 1234567890</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-background/20 pt-8 text-center text-background/80">
          <p>&copy; 2025 WinQuizz. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
