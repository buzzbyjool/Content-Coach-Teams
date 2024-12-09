import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { MeetingCalendar } from '../meetings/MeetingCalendar';
import type { Meeting } from '../../types/meeting';
import { useTranslation } from '../../hooks/useTranslation';

interface AgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AgendaModal({ isOpen, onClose }: AgendaModalProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMeetings = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Get all user's company coaches
        const coachesQuery = query(
          collection(db, 'forms'),
          where('userId', '==', user.uid)
        );
        const coachesSnapshot = await getDocs(coachesQuery);
        const coachIds = coachesSnapshot.docs.map(doc => doc.id);

        // Get all meetings for these coaches
        const meetingsQuery = query(
          collection(db, 'meetings'),
          where('coachId', 'in', coachIds.length > 0 ? coachIds : ['no-coaches'])
        );
        const snapshot = await getDocs(meetingsQuery);
        
        const meetingsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          startTime: new Date(doc.data().startTime),
          endTime: new Date(doc.data().endTime),
        })) as Meeting[];

        // Sort meetings by start time
        const sortedMeetings = meetingsData.sort((a, b) => 
          a.startTime.getTime() - b.startTime.getTime()
        );

        setMeetings(sortedMeetings);
      } catch (error) {
        console.error('Error loading meetings:', error);
        setError('Erreur lors du chargement des réunions');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadMeetings();
    }
  }, [isOpen, user]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-25"
              onClick={onClose}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full"
            >
              <div className="flex justify-between items-center p-6 border-b">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-teal-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Votre agenda complet
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                {error && (
                  <div className="mb-4 flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {loading ? (
                  <div className="flex justify-center items-center h-[600px]">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                  </div>
                ) : meetings.length > 0 ? (
                  <MeetingCalendar meetings={meetings} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[600px] text-gray-500">
                    <Calendar className="h-12 w-12 mb-4 text-gray-400" />
                    <p className="text-lg font-medium">Aucune réunion planifiée</p>
                    <p className="text-sm mt-2">
                      Planifiez une réunion depuis un Company Coach pour la voir apparaître ici
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}