// Previous content with updated translations
import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, FileText, Loader2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DatePicker from 'react-datepicker';
import { motion, AnimatePresence } from 'framer-motion';
import { addHours, format, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { meetingSchema, type Meeting } from '../../types/meeting';
import { db } from '../../lib/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { MeetingCalendar } from './MeetingCalendar';
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  coachId: string;
  coachName: string;
}

export function MeetingModal({ isOpen, onClose, coachId, coachName }: MeetingModalProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [view, setView] = useState<'calendar' | 'new'>('calendar');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      coachId,
      title: '',
      startTime: new Date(),
      endTime: addHours(new Date(), 1),
      agenda: '',
      attendees: [],
      createdAt: new Date().toISOString(),
    }
  });

  const startTime = watch('startTime');
  const endTime = watch('endTime');

  useEffect(() => {
    if (isOpen) {
      loadMeetings();
    }
  }, [isOpen, coachId]);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      setError(null);

      const coachesQuery = query(
        collection(db, 'forms'),
        where('userId', '==', user?.uid)
      );
      const coachesSnapshot = await getDocs(coachesQuery);
      const coachIds = coachesSnapshot.docs.map(doc => doc.id);

      const meetingsQuery = query(
        collection(db, 'meetings'),
        where('coachId', 'in', coachIds)
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
      console.error('Error loading meetings:', error);
      setError(t('meetings.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const checkConflicts = (start: Date, end: Date): boolean => {
    return meetings.some(meeting => {
      const meetingStart = new Date(meeting.startTime);
      const meetingEnd = new Date(meeting.endTime);
      
      return (
        isWithinInterval(start, { start: meetingStart, end: meetingEnd }) ||
        isWithinInterval(end, { start: meetingStart, end: meetingEnd }) ||
        isWithinInterval(meetingStart, { start, end }) ||
        isWithinInterval(meetingEnd, { start, end })
      );
    });
  };

  const handleCreateMeeting = async (data: any) => {
    try {
      setLoading(true);
      setError(null);

      if (checkConflicts(data.startTime, data.endTime)) {
        setError(t('meetings.conflictDetected'));
        return;
      }

      const meetingData = {
        ...data,
        coachId,
        startTime: data.startTime.toISOString(),
        endTime: data.endTime.toISOString(),
        createdAt: new Date().toISOString(),
        attendees: data.attendees || []
      };

      await addDoc(collection(db, 'meetings'), meetingData);
      await loadMeetings();
      reset();
      setView('calendar');
    } catch (error) {
      console.error('Error creating meeting:', error);
      setError(t('meetings.createError'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setView('calendar');
    setError(null);
    onClose();
  };

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
              onClick={handleClose}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full"
            >
              <div className="flex justify-between items-center p-6 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {view === 'calendar' ? t('meetings.meetingSchedule') : t('meetings.new')}
                  </h2>
                  <p className="text-sm text-gray-500">{coachName}</p>
                </div>
                <button
                  onClick={handleClose}
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

                {loading && view === 'calendar' ? (
                  <div className="flex justify-center items-center h-[600px]">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                  </div>
                ) : view === 'calendar' ? (
                  <div className="space-y-6">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setView('new')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700"
                      >
                        {t('meetings.scheduleNewMeeting')}
                      </button>
                    </div>
                    <MeetingCalendar meetings={meetings} />
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(handleCreateMeeting)} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {t('meetings.title')}
                      </label>
                      <input
                        type="text"
                        {...register('title')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t('meetings.startTime')}
                        </label>
                        <DatePicker
                          selected={startTime}
                          onChange={(date) => setValue('startTime', date as Date)}
                          showTimeSelect
                          dateFormat="d MMMM yyyy HH:mm"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                          minDate={new Date()}
                          locale={fr}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t('meetings.endTime')}
                        </label>
                        <DatePicker
                          selected={endTime}
                          onChange={(date) => setValue('endTime', date as Date)}
                          showTimeSelect
                          dateFormat="d MMMM yyyy HH:mm"
                          minDate={startTime}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                          locale={fr}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {t('meetings.agenda')}
                      </label>
                      <textarea
                        {...register('agenda')}
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                      />
                      {errors.agenda && (
                        <p className="mt-1 text-sm text-red-600">{errors.agenda.message}</p>
                      )}
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setView('calendar')}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {t('meetings.scheduling')}
                          </>
                        ) : (
                          t('meetings.schedule')
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}