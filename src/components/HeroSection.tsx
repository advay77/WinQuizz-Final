import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          WinQuizz – <br />
          <span className="text-primary">Participate Smartly.</span><br />
          <span className="text-primary">Win with your skills.</span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
          India's first ultimate skill-based contest platform. Compete in fun quizzes and win amazing prizes.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mb-16">
          <Button 
            size="lg" 
            onClick={() => navigate("/auth")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-8 py-6"
          >
            <Target className="mr-2 h-5 w-5" />
            Register Now
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10 font-semibold text-lg px-8 py-6"
          >
            How It Works
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-5xl font-bold text-primary mb-2">25,000+</div>
            <div className="text-muted-foreground">Participants</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-primary mb-2">150+</div>
            <div className="text-muted-foreground">Quizzes</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-primary mb-2">₹50L+</div>
            <div className="text-muted-foreground">Prizes Won</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
