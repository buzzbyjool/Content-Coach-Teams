import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Users, ClipboardList, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useTranslation } from '../../hooks/useTranslation';
import { useSpring, animated } from 'react-spring';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AnalyticsData {
  totalCoaches: number;
  totalUsers: number;
  completionRate: number;
  loading: boolean;
  error: string | null;
}

const StatCard = ({ title, value, change, increasing, icon, loading }: any) => {
  const props = useSpring({
    from: { number: 0 },
    to: { number: parseInt(value) || 0 },
    delay: 200,
    config: { mass: 1, tension: 20, friction: 10 }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex justify-between items-start">
        {icon}
        {!loading && (
          <span className={`flex items-center text-sm ${
            increasing ? 'text-green-600' : 'text-red-600'
          }`}>
            {change}
            {increasing ? (
              <ArrowUpRight className="h-4 w-4 ml-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 ml-1" />
            )}
          </span>
        )}
      </div>
      <div className="mt-4">
        {loading ? (
          <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
        ) : (
          <animated.p className="text-2xl font-semibold text-gray-900">
            {props.number.to((n: number) => 
              title === 'Taux de complétion' ? `${Math.round(n)}%` : Math.round(n)
            )}
          </animated.p>
        )}
      </div>
      <p className="text-sm text-gray-500">{title}</p>
    </motion.div>
  );
};

export function AnalyticsModal({ isOpen, onClose }: AnalyticsModalProps) {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalCoaches: 0,
    totalUsers: 0,
    completionRate: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!isOpen) return;

      try {
        setAnalytics(prev => ({ ...prev, loading: true, error: null }));

        // Get total Company Coaches
        const coachesSnapshot = await getDocs(collection(db, 'forms'));
        const totalCoaches = coachesSnapshot.size;

        // Get total users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const totalUsers = usersSnapshot.size;

        // Calculate completion rate
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentCoachesQuery = query(
          collection(db, 'forms'),
          where('createdAt', '>=', thirtyDaysAgo.toISOString())
        );
        
        const recentCoachesSnapshot = await getDocs(recentCoachesQuery);
        const completedCoaches = recentCoachesSnapshot.docs.filter(doc => !doc.data().isArchived).length;
        const completionRate = recentCoachesSnapshot.size > 0 
          ? (completedCoaches / recentCoachesSnapshot.size) * 100 
          : 0;

        setAnalytics({
          totalCoaches,
          totalUsers,
          completionRate,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setAnalytics(prev => ({
          ...prev,
          loading: false,
          error: 'Erreur lors du chargement des analyses'
        }));
      }
    };

    fetchAnalytics();
  }, [isOpen]);

  const stats = [
    {
      title: 'Company Coaches',
      value: analytics.loading ? '-' : analytics.totalCoaches.toString(),
      change: '+12.5%',
      increasing: true,
      icon: <ClipboardList className="h-5 w-5 text-teal-600" />
    },
    {
      title: 'Utilisateurs',
      value: analytics.loading ? '-' : analytics.totalUsers.toString(),
      change: '+4.2%',
      increasing: true,
      icon: <Users className="h-5 w-5 text-blue-600" />
    },
    {
      title: 'Taux de complétion',
      value: analytics.loading ? '-' : `${Math.round(analytics.completionRate)}%`,
      change: '-2.1%',
      increasing: false,
      icon: <TrendingUp className="h-5 w-5 text-purple-600" />
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm"
              onClick={onClose}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl font-bold text-gray-900"
                >
                  Vue d'ensemble des analyses
                </motion.h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </motion.button>
              </div>

              {analytics.error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg"
                >
                  {analytics.error}
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <StatCard
                    key={index}
                    {...stat}
                    loading={analytics.loading}
                  />
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-50 rounded-lg p-6 text-center"
              >
                <p className="text-gray-500">
                  Les graphiques détaillés seront bientôt disponibles
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}