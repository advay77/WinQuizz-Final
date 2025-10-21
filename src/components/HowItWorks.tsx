import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  {
    id: 1,
    title: 'Sign Up',
    description: 'Create your free account in less than a minute',
    icon: <CheckCircle2 className="h-6 w-6 text-primary" />
  },
  {
    id: 2,
    title: 'Choose a Quiz',
    description: 'Select from our wide range of categories and difficulty levels',
    icon: <CheckCircle2 className="h-6 w-6 text-primary" />
  },
  {
    id: 3,
    title: 'Play & Win',
    description: 'Answer questions correctly to climb the leaderboard and win cash prizes',
    icon: <CheckCircle2 className="h-6 w-6 text-primary" />
  },
  {
    id: 4,
    title: 'Withdraw Earnings',
    description: 'Easily withdraw your winnings to your bank account or e-wallet',
    icon: <CheckCircle2 className="h-6 w-6 text-primary" />
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg">
            Win real cash prizes by testing your knowledge. It's simple, fun, and rewarding!
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className="bg-card p-6 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mr-3">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
              </div>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
