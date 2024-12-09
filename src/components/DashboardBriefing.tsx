import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BackgroundVideo } from './dashboard/BackgroundVideo';
import { GreetingHeader } from './dashboard/GreetingHeader';
import { ActivitySummary } from './dashboard/ActivitySummary';
import { QuickActions } from './dashboard/QuickActions';

export function DashboardBriefing() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#5DB6BB] to-[#4A9296] text-white mb-8">
      <BackgroundVideo />
      
      <div className="relative z-10 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <GreetingHeader />

          <div className="flex items-center text-teal-100 text-sm">
            <Clock className="h-4 w-4 mr-2" />
            <span>{format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}</span>
          </div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ActivitySummary />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <QuickActions />
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)]" style={{ backgroundSize: '24px 24px' }} />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
    </div>
  );
}