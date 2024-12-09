import { useEffect, useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Meeting } from '../../types/meeting';
import { useTranslation } from '../../hooks/useTranslation';

export function UpcomingMeetings() {
  const { t } = useTranslation();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUpcomingMeetings = async () => {
      try {
        const now = new Date().toISOString();
        const meetingsQuery = query(
          collection(db, 'meetings'),
          where('startTime', '>=', now),
          orderBy('startTime', 'asc'),
          limit(2)
        );

        const snapshot = await getDocs(meetingsQuery);
        const meetingsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          startTime: new Date(doc.data().startTime),
          endTime: new Date(doc.data().endTime),
        })) as Meeting[];

        setMeetings(meetingsData);
      } catch (error) {
        console.error('Error loading upcoming meetings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUpcomingMeetings();
  }, []);

  if (loading) {
    return <div className="animate-pulse h-24 bg-gray-100 rounded-lg" />;
  }

  if (meetings.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        {t('dashboard.noUpcomingMeetings')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {meetings.map((meeting) => (
        <div
          key={meeting.id}
          className="bg-white p-4 rounded-lg border border-gray-200 space-y-2"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">{meeting.title}</h3>
            <span className="text-sm text-gray-500">
              {format(meeting.startTime, 'd MMM', { locale: fr })}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            {format(meeting.startTime, 'HH:mm', { locale: fr })} - {format(meeting.endTime, 'HH:mm', { locale: fr })}
          </div>
        </div>
      ))}
    </div>
  );
}