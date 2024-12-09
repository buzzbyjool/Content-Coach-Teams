import { useState } from 'react';
import { Folder, MoreVertical, Archive, Pencil, Trash2, FolderOpen, Calendar, FileText, Image } from 'lucide-react';
import { Folder as FolderType } from '../types/folder';
import { Form } from '../types/form';
import { DeleteFormDialog } from './DeleteFormDialog';
import { FormDetailsModal } from './FormDetailsModal';
import { MeetingModal } from './meetings/MeetingModal';
import { Link } from 'react-router-dom';
import { useDrag, useDrop } from 'react-dnd';
import { useTranslation } from '../hooks/useTranslation';

interface FormItemInFolderProps {
  form: Form;
  onSelect: () => void;
  onDelete: () => void;
  onArchive: (formId: string) => Promise<void>;
  onScheduleMeeting: () => void;
  defaultPresentationUrl: string;
}

function FormItemInFolder({ 
  form, 
  onSelect, 
  onDelete, 
  onArchive,
  onScheduleMeeting,
  defaultPresentationUrl 
}: FormItemInFolderProps) {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'form',
    item: { 
      id: form.id, 
      type: 'form',
      currentFolderId: form.folderId 
    },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  }), [form.id, form.folderId]);

  return (
    <div
      ref={drag}
      className={`flex items-center justify-between p-2 rounded-md bg-gray-50 ${
        isDragging ? 'opacity-50' : ''
      } cursor-move`}
    >
      <div className="flex items-center flex-1 min-w-0">
        <button
          onClick={onSelect}
          className="group flex items-center hover:opacity-75 transition-opacity"
        >
          {form.logoUrl ? (
            <img
              src={form.logoUrl}
              alt={`${form.companyName} logo`}
              className="h-8 w-8 rounded object-contain"
            />
          ) : (
            <div className="h-8 w-8 rounded bg-gray-200 flex items-center justify-center">
              <Image className="h-4 w-4 text-gray-400" />
            </div>
          )}
          <span className="ml-2 text-sm text-gray-900 group-hover:text-teal-600 truncate">
            {form.companyName}
          </span>
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onScheduleMeeting}
          className="p-1 text-gray-500 hover:text-teal-600 hover:bg-gray-100 rounded"
          title={t('meetings.schedule')}
        >
          <Calendar className="h-4 w-4" />
        </button>
        <a
          href={form.presentationUrl || defaultPresentationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 text-gray-500 hover:text-teal-600 hover:bg-gray-100 rounded"
          title={t('companyCoach.viewPresentation')}
        >
          <FileText className="h-4 w-4" />
        </a>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-gray-500 hover:text-teal-600 hover:bg-gray-100 rounded"
            title={t('common.actions')}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1">
                <Link
                  to={`/forms/edit/${form.id}`}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  {t('common.edit')}
                </Link>
                <button
                  onClick={() => {
                    onArchive(form.id!);
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  {form.isArchived ? t('common.unarchive') : t('common.archive')}
                </button>
                <button
                  onClick={() => {
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('common.delete')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface FolderItemProps {
  folder: FolderType;
  forms: Form[];
  onMoveForm: (formId: string, folderId: string | null) => Promise<void>;
  onArchiveForm: (formId: string) => Promise<void>;
  onArchive: (folderId: string) => Promise<void>;
  onDelete: (folderId: string) => Promise<void>;
  onRename: (folderId: string, newName: string) => Promise<void>;
}

export function FolderItem({
  folder,
  forms,
  onMoveForm,
  onArchiveForm,
  onArchive,
  onDelete,
  onRename
}: FolderItemProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Form | null>(null);
  const defaultPresentationUrl = "https://docs.google.com/presentation/d/1i0qkY3gEH4bxowOFbwiuMtHO4xJLtazzR3UUnolF7SE/edit?usp=share_link";

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'form',
    drop: async (item: { id: string; type: string; currentFolderId: string | null }) => {
      console.log('Drop on folder:', { folderId: folder.id, item });
      if (item.currentFolderId !== folder.id) {
        await onMoveForm(item.id, folder.id);
      }
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
    }),
  }), [folder.id, onMoveForm]);

  const handleDeleteForm = async () => {
    if (!formToDelete?.id) return;
    await onMoveForm(formToDelete.id, null);
    setFormToDelete(null);
  };

  const handleScheduleMeeting = (form: Form) => {
    setSelectedCoach(form);
    setShowMeetingModal(true);
  };

  return (
    <div className="space-y-2">
      <div
        ref={drop}
        className={`relative group bg-white rounded-lg border ${
          isOver ? 'border-teal-500 bg-teal-50' : 'border-gray-200'
        }`}
      >
        <div className="flex items-center p-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center flex-1 min-w-0"
          >
            {isOpen ? (
              <FolderOpen className="h-5 w-5 text-teal-500 mr-2 flex-shrink-0" />
            ) : (
              <Folder className="h-5 w-5 text-teal-500 mr-2 flex-shrink-0" />
            )}
            <span className="text-sm font-medium text-gray-900 truncate">
              {folder.name}
            </span>
            <span className="ml-2 text-xs text-gray-500">
              ({forms.length})
            </span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onArchive(folder.id);
                      setShowMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    {folder.isArchived ? t('common.unarchive') : t('common.archive')}
                  </button>
                  <button
                    onClick={() => {
                      onDelete(folder.id);
                      setShowMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {isOpen && forms.length > 0 && (
          <div className="border-t border-gray-200 p-3 space-y-2">
            {forms.map((form) => (
              <FormItemInFolder
                key={form.id}
                form={form}
                onSelect={() => setSelectedForm(form)}
                onDelete={() => setFormToDelete(form)}
                onArchive={onArchiveForm}
                onScheduleMeeting={() => handleScheduleMeeting(form)}
                defaultPresentationUrl={defaultPresentationUrl}
              />
            ))}
          </div>
        )}
      </div>

      <DeleteFormDialog
        isOpen={!!formToDelete}
        onClose={() => setFormToDelete(null)}
        onConfirm={handleDeleteForm}
        companyName={formToDelete?.companyName || ''}
      />

      {selectedForm && (
        <FormDetailsModal
          form={selectedForm}
          onClose={() => setSelectedForm(null)}
        />
      )}

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