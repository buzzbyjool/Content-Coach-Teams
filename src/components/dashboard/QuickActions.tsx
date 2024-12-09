import { useState } from 'react';
import { BarChart, CalendarDays, Plus, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalyticsModal } from './AnalyticsModal';
import { AgendaModal } from './AgendaModal';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';

const buttonVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: { 
    scale: 1.02,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.2 }
  },
  tap: { scale: 0.98 }
};

const iconVariants = {
  initial: { rotate: -45, opacity: 0 },
  animate: { rotate: 0, opacity: 1 },
  hover: { rotate: 15, scale: 1.1 }
};

export function QuickActions() {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAgenda, setShowAgenda] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <motion.div
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        <motion.button 
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          transition={{ delay: 0.1 }}
          onClick={() => setShowAgenda(true)}
          className="flex items-center justify-between bg-[#5DB6BB]/10 hover:bg-[#5DB6BB]/20 backdrop-blur-sm rounded-lg px-4 py-3 group"
        >
          <span className="text-sm">Voir l'agenda</span>
          <motion.div variants={iconVariants}>
            <CalendarDays className="h-4 w-4 transition-transform group-hover:text-white" />
          </motion.div>
        </motion.button>

        <motion.button 
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          transition={{ delay: 0.2 }}
          onClick={() => setShowAnalytics(true)}
          className="flex items-center justify-between bg-[#5DB6BB]/10 hover:bg-[#5DB6BB]/20 backdrop-blur-sm rounded-lg px-4 py-3 group"
        >
          <span className="text-sm">Voir les analyses</span>
          <motion.div variants={iconVariants}>
            <BarChart className="h-4 w-4 transition-transform group-hover:text-white" />
          </motion.div>
        </motion.button>

        <Link to="/forms/new">
          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between bg-[#5DB6BB]/10 hover:bg-[#5DB6BB]/20 backdrop-blur-sm rounded-lg px-4 py-3 group cursor-pointer"
          >
            <span className="text-sm">Nouveau Coach</span>
            <motion.div 
              variants={iconVariants}
              className="flex items-center space-x-1"
            >
              <Plus className="h-4 w-4 transition-transform group-hover:text-white" />
              <ArrowRight className="h-4 w-4 transition-transform group-hover:text-white" />
            </motion.div>
          </motion.div>
        </Link>
      </motion.div>

      <AnimatePresence>
        {showAnalytics && (
          <AnalyticsModal 
            isOpen={showAnalytics} 
            onClose={() => setShowAnalytics(false)} 
          />
        )}

        {showAgenda && (
          <AgendaModal
            isOpen={showAgenda}
            onClose={() => setShowAgenda(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}