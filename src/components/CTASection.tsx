import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Target, Zap, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CTASection: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');

  const handleRegisterNow = () => {
    const userInterest = {
      timestamp: new Date().toISOString(),
      action: 'final_cta_clicked',
    };
    localStorage.setItem('winquizz_final_cta', JSON.stringify(userInterest));

    // Navigate to dashboard
    navigate('/dashboard');
  };

  const handleNewsletterSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email) {
      const subscription = {
        email,
        timestamp: new Date().toISOString(),
        source: 'final_cta',
      };
      localStorage.setItem('winquizz_newsletter_final', JSON.stringify(subscription));
      alert("Thanks for subscribing! You'll be the first to know when we launch.");
      setEmail('');
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  return (
    <>
      {/* Main CTA Section */}
      <section className="py-20 bg-gradient-to-br from-red-600 to-red-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Ready to Participate & Win Prices?
            <span className="block text-yellow-300">Join WinQuizz Today!</span>
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Test your knowledge, compete with thousands of participants, and win amazing prizes worth lakhs!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              onClick={handleRegisterNow}
              size="lg"
              className="bg-white text-red-600 hover:bg-gray-100 px-8 py-4 text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Target className="mr-2 h-6 w-6" />
              Register & Participate Now
            </Button>
            <div className="flex items-center space-x-2 text-yellow-300">
              <Zap className="h-5 w-5" />
              <span className="font-semibold">Limited Time: Zero Registration Fee!</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Target className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
              <h3 className="text-xl font-bold mb-2">100% Skill-Based</h3>
              <p className="opacity-90">Pure knowledge, zero luck involved</p>
            </div>
            <div>
              <UserCheck className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
              <h3 className="text-xl font-bold mb-2">Instant Participation</h3>
              <p className="opacity-90">Register and start competing immediately</p>
            </div>
            <div>
              <Zap className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
              <h3 className="text-xl font-bold mb-2">Fast Rewards</h3>
              <p className="opacity-90">Quick payouts and instant results</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay Updated</h2>
          <p className="text-lg text-gray-600 mb-8">
            Be the first to know about new contests, exclusive prizes, and special offers
          </p>
          <Card className="p-6 max-w-md mx-auto">
            <form onSubmit={handleNewsletterSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={handleEmailChange}
                className="text-center"
                required
              />
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                Subscribe to Updates
              </Button>
            </form>
            <p className="text-xs text-gray-500 mt-3">
              No spam, unsubscribe anytime. Privacy policy protected.
            </p>
          </Card>
        </div>
      </section>
    </>
  );
};

export default CTASection;
