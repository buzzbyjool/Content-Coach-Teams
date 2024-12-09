import { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Form } from '../types/form';
import { DeleteFormDialog } from './DeleteFormDialog';
import { FormDetailsModal } from './FormDetailsModal';
import { MeetingModal } from './meetings/MeetingModal';
import { FormItem } from './FormItem';
import { useDrop } from 'react-dnd';
import { useTranslation } from '../hooks/useTranslation';

interface FormListProps {
  forms: Form[];
  setForms: React.Dispatch<React.SetStateAction<Form[]>>;
  onMoveForm?: (formId: string, folderId: string | null) => Promise<void>;
  onArchive?: (formId: string) => Promise<void>;
}

export function FormList({ forms, setForms, onMoveForm, onArchive }: FormListProps) {
  const { t } = useTranslation();
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Form | null>(null);
  const defaultPresentationUrl = "https://docs.google.com/presentation/d/1i0qkY3gEH4bxowOFbwiuMtHO4xJLtazzR3UUnolF7SE/edit?usp=share_link";

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'form',
    drop: async (item: { id: string; type: string; currentFolderId: string | null }, monitor) => {
      console.log('Drop detected:', { item, canDrop: monitor.canDrop() });
      if (!monitor.didDrop() && onMoveForm && item.currentFolderId !== null) {
        console.log('Moving form to root:', item.id);
        await onMoveForm(item.id, null);
      }
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
    }),
  }), [onMoveForm]);

  const handleDelete = async () => {
    if (!formToDelete?.id) return;

    try {
      await deleteDoc(doc(db, 'forms', formToDelete.id));
      setForms(forms.filter(form => form.id !== formToDelete.id));
      setFormToDelete(null);
    } catch (error) {
      console.error('Error deleting form:', error);
    }
  };

  const handleScheduleMeeting = (form: Form) => {
    setSelectedCoach(form);
    setShowMeetingModal(true);
  };

  console.log('FormList render:', { isOver, formsCount: forms.length });

  return (
    <div
      ref={drop}
      className={`space-y-4 min-h-[100px] rounded-lg transition-colors ${
        isOver ? 'bg-teal-50 border-2 border-dashed border-teal-300' : ''
      }`}
    >
      {forms.map((form) => (
        <FormItem
          key={form.id}
          form={form}
          onSelect={() => setSelectedForm(form)}
          onDelete={() => setFormToDelete(form)}
          onArchive={onArchive}
          onScheduleMeeting={() => handleScheduleMeeting(form)}
          defaultPresentationUrl={defaultPresentationUrl}
        />
      ))}

      {selectedForm && (
        <FormDetailsModal
          form={selectedForm}
          onClose={() => setSelectedForm(null)}
        />
      )}

      <DeleteFormDialog
        isOpen={!!formToDelete}
        onClose={() => setFormToDelete(null)}
        onConfirm={handleDelete}
        companyName={formToDelete?.companyName || ''}
      />

      {selectedCoach && (
        <MeetingModal
          isOpen={showMeetingModal}
          onClose={() => {
            setShowMeetingModal(false);
            setSelectedCoach(null);
          }}
          coachId={selectedCoach.id!}
          coachName={selectedCoach.companyName}
        />
      )}
    </div>
  );
}