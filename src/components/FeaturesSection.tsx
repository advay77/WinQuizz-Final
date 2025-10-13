import { Zap, Shield, Lock, FileText, Key, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Zap,
    title: "Skill-Based Only",
    description: "No luck involved - pure skill and knowledge testing platform"
  },
  {
    icon: Shield,
    title: "Fraud Prevention",
    description: "Advanced duplicate detection and device tracking systems"
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description: "PCI-DSS certified payment processing with encryption"
  },
  {
    icon: FileText,
    title: "GST Compliant",
    description: "Fully registered with GST and TDS compliance"
  },
  {
    icon: Key,
    title: "2FA Security",
    description: "Two-factor authentication for admin access and bot protection"
  },
  {
    icon: BarChart3,
    title: "Real-time Monitoring",
    description: "Live contest monitoring and automated fair participation detection"
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 px-4 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose WinQuizz?</h2>
          <p className="text-xl text-muted-foreground">Your safety and fair play are our top priorities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-primary transition-colors hover:shadow-lg">
              <CardContent className="pt-8 pb-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Shield className="h-5 w-5 text-primary" />
            <span>GST Registered</span>
          </div>
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Lock className="h-5 w-5 text-primary" />
            <span>PCI-DSS Compliant</span>
          </div>
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Zap className="h-5 w-5 text-primary" />
            <span>100% Skill-Based</span>
          </div>
          <div className="flex items-center gap-2 text-lg font-semibold">
            <FileText className="h-5 w-5 text-primary" />
            <span>RNG Certified</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
