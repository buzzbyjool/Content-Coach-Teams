import { Activity, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { UpcomingMeetings } from './UpcomingMeetings';
import { useTranslation } from '../../hooks/useTranslation';

interface ActivityStats {
  totalCoaches: number;
  pendingMeetings: number;
  needsUpdate: number;
  loading: boolean;
  error: string | null;
}

export function ActivitySummary() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<ActivityStats>({
    totalCoaches: 0,
    pendingMeetings: 0,
    needsUpdate: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchActivityStats = async () => {
      if (!user) return;

      try {
        // Get all user's Company Coaches
        const coachesQuery = query(
          collection(db, 'forms'),
          where('userId', '==', user.uid)
        );
        const coachesSnapshot = await getDocs(coachesQuery);
        const coaches = coachesSnapshot.docs;

        // If there are no coaches, return early with zeros
        if (coaches.length === 0) {
          setStats({
            totalCoaches: 0,
            pendingMeetings: 0,
            needsUpdate: 0,
            loading: false,
            error: null
          });
          return;
        }

        // Get all meetings only if there are coaches
        const coachIds = coaches.map(doc => doc.id);
        const meetingsQuery = query(
          collection(db, 'meetings'),
          where('coachId', 'in', coachIds)
        );
        const meetingsSnapshot = await getDocs(meetingsQuery);
        
        // Calculate stats
        const totalCoaches = coaches.filter(doc => !doc.data().isArchived).length;
        const coachesWithoutMeetings = coaches.filter(doc => {
          const hasMeeting = meetingsSnapshot.docs.some(meeting => 
            meeting.data().coachId === doc.id
          );
          return !doc.data().isArchived && !hasMeeting;
        }).length;

        const pendingMeetings = meetingsSnapshot.docs.filter(doc => {
          const meetingDate = new Date(doc.data().startTime);
          return meetingDate > new Date();
        }).length;

        setStats({
          totalCoaches,
          pendingMeetings,
          needsUpdate: coachesWithoutMeetings,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching activity stats:', error);
        setStats(prev => ({ 
          ...prev, 
          loading: false,
          error: t('dashboard.loadError')
        }));
      }
    };

    fetchActivityStats();
  }, [user, t]);

  // If there are no coaches and no error, return null to hide the section
  if (!stats.loading && !stats.error && stats.totalCoaches === 0) {
    return null;
  }

  const formatMessage = (key: string, count: number) => {
    return t(key).replace('{count}', count.toString());
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="lg:col-span-2 bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="h-5 w-5" />
          <h3 className="font-medium">{t('dashboard.recentActivity')}</h3>
        </div>

        {stats.error ? (
          <div className="flex items-center space-x-2 text-red-200">
            <AlertCircle className="h-5 w-5" />
            <p>{stats.error}</p>
          </div>
        ) : stats.loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
            <div className="h-4 bg-white/20 rounded w-2/3"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.totalCoaches > 0 && (
              <p className="text-sm text-teal-100">
                {formatMessage('dashboard.activeCoaches', stats.totalCoaches)}
              </p>
            )}
            {stats.needsUpdate > 0 && (
              <p className="text-sm text-teal-100">
                {formatMessage('dashboard.needsMeeting', stats.needsUpdate)}
              </p>
            )}
            {stats.pendingMeetings > 0 && (
              <p className="text-sm text-teal-100">
                {formatMessage('dashboard.pendingMeetings', stats.pendingMeetings)}
              </p>
            )}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <h3 className="font-medium">{t('dashboard.upcomingMeetings')}</h3>
          </div>
        </div>
        <UpcomingMeetings />
      </motion.div>
    </div>
  );
}