import { useState } from 'react';
import { Folder, Archive, Plus, FolderOpen } from 'lucide-react';
import { Folder as FolderType } from '../types/folder';
import { Form } from '../types/form';
import { FolderItem } from './FolderItem';
import { CreateFolderDialog } from './CreateFolderDialog';
import { useDrop } from 'react-dnd';
import { useTranslation } from '../hooks/useTranslation';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

interface FolderListProps {
  folders: FolderType[];
  forms: Form[];
  onCreateFolder: (name: string) => Promise<void>;
  onMoveForm: (formId: string, folderId: string | null) => Promise<void>;
  onArchiveFolder: (folderId: string) => Promise<void>;
  onArchiveForm: (formId: string) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
  onRenameFolder: (folderId: string, newName: string) => Promise<void>;
  showArchived?: boolean;
}

export function FolderList({
  folders,
  forms,
  onCreateFolder,
  onMoveForm,
  onArchiveFolder,
  onArchiveForm,
  onDeleteFolder,
  onRenameFolder,
  showArchived = false
}: FolderListProps) {
  const { t } = useTranslation();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'form',
    drop: async (item: { id: string; type: string; currentFolderId: string | null }, monitor) => {
      if (!monitor.didDrop() && item.type === 'form' && item.currentFolderId !== null) {
        await onMoveForm(item.id, null);
      }
    },
    collect: monitor => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }), [onMoveForm]);

  const filteredFolders = folders.filter(folder => folder.isArchived === showArchived);

  return (
    <div className="space-y-4">
      <motion.div
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        variants={containerVariants}
        ref={ref}
        className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0"
      >
        <motion.h2 
          variants={itemVariants}
          className="text-lg font-medium text-gray-900 flex items-center"
        >
          {showArchived ? (
            <>
              <Archive className="h-5 w-5 mr-2" />
              {t('folders.archived')}
            </>
          ) : (
            <>
              <FolderOpen className="h-5 w-5 mr-2" />
              {t('folders.title')}
            </>
          )}
        </motion.h2>
        {!showArchived && (
          <motion.button
            variants={itemVariants}
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 4px 15px rgba(93, 182, 187, 0.1)"
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateDialog(true)}
            className="group relative inline-flex items-center justify-center px-4 py-2 overflow-hidden rounded-lg 
              bg-white border border-[#5DB6BB]/30 text-[#5DB6BB] shadow-sm hover:bg-[#5DB6BB]/5 
              transition-all duration-300"
          >
            <div className="absolute inset-0 w-0 bg-gradient-to-r from-[#5DB6BB]/10 via-[#5DB6BB]/5 to-transparent 
              transform skew-x-[-25deg] transition-all duration-700 group-hover:w-[150%]" />
            <Plus className="h-4 w-4 mr-1.5 transition-transform duration-300 group-hover:rotate-90" />
            <span className="relative font-medium">{t('folders.new')}</span>
          </motion.button>
        )}
      </motion.div>

      <div
        ref={drop}
        className={`space-y-2 min-h-[100px] rounded-lg p-4 transition-all duration-300 ${
          isOver ? 'bg-[#5DB6BB]/10 border-2 border-dashed border-[#5DB6BB]/30' : ''
        }`}
      >
        <AnimatePresence mode="wait">
          {filteredFolders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-8 text-gray-500"
            >
              <Folder className="h-8 w-8 mb-2" />
              <p className="text-sm text-center">
                {showArchived
                  ? t('folders.noArchived')
                  : t('companyCoach.dropHereOrCreateFolder')}
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-2"
            >
              {filteredFolders.map((folder, index) => (
                <motion.div
                  key={folder.id}
                  variants={itemVariants}
                  custom={index}
                  layout
                >
                  <FolderItem
                    folder={folder}
                    forms={forms.filter(form => form.folderId === folder.id)}
                    onMoveForm={onMoveForm}
                    onArchiveForm={onArchiveForm}
                    onArchive={onArchiveFolder}
                    onDelete={onDeleteFolder}
                    onRename={onRenameFolder}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CreateFolderDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreate={onCreateFolder}
      />
    </div>
  );
}