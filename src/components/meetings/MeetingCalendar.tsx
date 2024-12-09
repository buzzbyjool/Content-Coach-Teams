import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Meeting } from '../../types/meeting';
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useTranslation } from '../../hooks/useTranslation';

const locales = {
  'fr': fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: fr }),
  getDay,
  locales,
});

interface MeetingCalendarProps {
  meetings: Meeting[];
}

const messages = {
  week: 'Semaine',
  work_week: 'Semaine de travail',
  day: 'Jour',
  month: 'Mois',
  previous: 'Précédent',
  next: 'Suivant',
  today: "Aujourd'hui",
  agenda: 'Agenda',
  noEventsInRange: 'Aucune réunion sur cette période',
  allDay: 'Toute la journée',
  date: 'Date',
  time: 'Heure',
  event: 'Réunion',
  showMore: total => `+ ${total} réunion(s) supplémentaire(s)`
};

export function MeetingCalendar({ meetings }: MeetingCalendarProps) {
  const { t } = useTranslation();

  const events = meetings.map(meeting => ({
    id: meeting.id,
    title: `${meeting.title} (${format(new Date(meeting.startTime), 'HH:mm', { locale: fr })})`,
    start: new Date(meeting.startTime),
    end: new Date(meeting.endTime),
    resource: meeting,
  }));

  return (
    <div className="h-[600px]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        views={['month', 'week', 'day']}
        defaultView="week"
        messages={messages}
        culture="fr"
        tooltipAccessor={event => `${event.title}\n${format(event.start, 'd MMMM yyyy', { locale: fr })}`}
        eventPropGetter={() => ({
          style: {
            backgroundColor: '#0D9488',
            borderRadius: '4px',
            border: 'none',
            color: 'white',
            padding: '2px 5px'
          },
        })}
        dayPropGetter={date => ({
          style: {
            backgroundColor: date.getDay() === 0 || date.getDay() === 6 ? '#f9fafb' : 'white',
          },
        })}
      />
    </div>
  );
}