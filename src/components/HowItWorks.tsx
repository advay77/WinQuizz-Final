import { CheckCircle2, UserCheck, Ticket, ListChecks } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    id: 1,
    title: 'Register & Verify',
    description: 'Complete KYC with Aadhaar/PAN verification and mobile OTP for secure registration',
    icon: <UserCheck className="h-8 w-8" />,
    color: 'from-red-500 to-red-600',
    delay: 0.1
  },
  {
    id: 2,
    title: 'Buy Tickets',
    description: 'Purchase tickets for your favorite quizzes to participate and win big',
    icon: <Ticket className="h-8 w-8" />,
    color: 'from-red-600 to-red-700',
    delay: 0.3
  },
  {
    id: 3,
    title: 'Answer Questions',
    description: 'Test your knowledge by answering quiz questions correctly to win cash prizes',
    icon: <ListChecks className="h-8 w-8" />,
    color: 'from-red-700 to-red-800',
    delay: 0.5
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-16 md:py-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 to-red-100/30 dark:from-gray-900/50 dark:to-gray-800/50 -z-10" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,black_5%,black_95%,transparent)]">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(to_right,transparent,white_5%,white_95%,transparent)]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div 
          className="text-center max-w-4xl mx-auto mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-medium px-3 py-1 rounded-full mb-4">
            Get Started
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get amazing prizes and certificates, by testing your knowledge - it's simple, fun and rewarding!
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {steps.map((step) => (
            <motion.div 
              key={step.id}
              className="group relative"
              variants={item}
            >
              {/* Decorative line */}
              {step.id < steps.length && (
                <div className="hidden md:block absolute left-full top-12 w-8 h-0.5 bg-gradient-to-r from-red-500/30 to-red-700/30" />
              )}
              
              <div className="h-full bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-100 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 bg-gradient-to-br ${step.color} text-white shadow-lg`}>
                  {step.icon}
                </div>
                
                <div className="flex items-center mb-4">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Step {step.id}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300">
                  {step.description}
                </p>
                
                {/* Animated border bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" />
        <div className="absolute -bottom-12 -left-12 w-72 h-72 bg-red-600/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
      </div>
    </section>
  );
}
