import { useEffect, useState } from 'react';
import { Sun, Moon, Sunrise } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function GreetingHeader() {
  const { userData } = useAuth();
  const { t } = useTranslation();
  const [greeting, setGreeting] = useState('');
  const [icon, setIcon] = useState<JSX.Element>(<Sun />);

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setGreeting('Bonjour');
        setIcon(
          <motion.div
            initial={{ rotate: -90 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Sunrise className="h-6 w-6 text-amber-500" />
          </motion.div>
        );
      } else if (hour >= 12 && hour < 18) {
        setGreeting('Bon après-midi');
        setIcon(
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <Sun className="h-6 w-6 text-amber-500" />
          </motion.div>
        );
      } else {
        setGreeting('Bonsoir');
        setIcon(
          <motion.div
            animate={{ 
              rotate: [-5, 5, -5],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Moon className="h-6 w-6 text-indigo-400" />
          </motion.div>
        );
      }
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-2"
    >
      <motion.div 
        variants={item}
        className="flex items-center space-x-3"
      >
        {icon}
        <h1 className="text-2xl font-bold">
          {greeting}, {userData?.firstName || t('auth.defaultUser')}
        </h1>
      </motion.div>
    </motion.div>
  );
}