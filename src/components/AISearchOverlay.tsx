import { motion, AnimatePresence } from 'framer-motion';
import { AILoadingAnimation } from './AILoadingAnimation';

interface AISearchOverlayProps {
  isVisible: boolean;
  message?: string;
}

export function AISearchOverlay({ isVisible, message = "AI is searching..." }: AISearchOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-8 shadow-xl flex flex-col items-center max-w-sm mx-4"
          >
            <AILoadingAnimation />
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-lg font-medium text-gray-700"
            >
              {message}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-2 text-sm text-gray-500 text-center"
            >
              Analyzing company data and generating insights...
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}