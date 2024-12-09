import { useState, useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { Form } from '../types/form';
import { Image, Calendar, FileText, MoreVertical, Pencil, Archive, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface FormItemProps {
  form: Form;
  onSelect: () => void;
  onDelete: () => void;
  onArchive?: (formId: string) => Promise<void>;
  onScheduleMeeting: () => void;
  defaultPresentationUrl: string;
  index: number;
}

export function FormItem({ 
  form, 
  onSelect, 
  onDelete, 
  onArchive,
  onScheduleMeeting,
  defaultPresentationUrl,
  index
}: FormItemProps) {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'form',
    item: { 
      id: form.id!,
      type: 'form',
      currentFolderId: form.folderId 
    },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  }), [form]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          menuButtonRef.current && !menuButtonRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showMenu && menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right - 192, // 192px is the width of the menu (w-48)
      });
    }
  }, [showMenu]);

  const Menu = () => {
    if (!showMenu) return null;

    return createPortal(
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        style={{
          position: 'absolute',
          top: `${menuPosition.top}px`,
          left: `${menuPosition.left}px`,
          zIndex: 9999,
        }}
        className="w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
      >
        <div className="py-1">
          <Link
            to={`/forms/edit/${form.id}`}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Pencil className="h-4 w-4 mr-2" />
            {t('common.edit')}
          </Link>
          {onArchive && (
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
          )}
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
      </motion.div>,
      document.body
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`relative p-6 ${isDragging ? 'opacity-50' : ''} bg-white/80 backdrop-blur-sm rounded-xl 
        border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 group
        hover:bg-gradient-to-br hover:from-white hover:to-gray-50/80`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div ref={drag} className="relative cursor-move">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <motion.button
            onClick={onSelect}
            className="group flex items-center space-x-4"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {form.logoUrl ? (
              <motion.img 
                src={form.logoUrl} 
                alt={`${form.companyName} logo`}
                className="w-14 h-14 object-contain rounded-xl border border-gray-200/50 bg-white p-2 shadow-sm
                  group-hover:shadow-md transition-all duration-300"
                animate={{ rotate: isHovered ? [0, -5, 5, 0] : 0 }}
                transition={{ duration: 0.5 }}
              />
            ) : (
              <motion.div 
                className="w-14 h-14 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl flex items-center justify-center
                  border border-gray-200/50 shadow-sm group-hover:shadow-md transition-all duration-300"
                animate={{ rotate: isHovered ? [0, -5, 5, 0] : 0 }}
                transition={{ duration: 0.5 }}
              >
                <Image className="w-6 h-6 text-gray-400" />
              </motion.div>
            )}
            <div>
              <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r 
                from-gray-900 to-gray-700 group-hover:from-teal-600 group-hover:to-teal-500 transition-all duration-300">
                {form.companyName}
              </h3>
              <p className="mt-2 text-sm text-gray-500 flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 mr-3" />
                {t('companyCoach.createdOn')} {new Date(form.createdAt).toLocaleDateString()}
              </p>
            </div>
          </motion.button>

          <div className="flex items-center space-x-1">
            <motion.button
              onClick={onScheduleMeeting}
              className="p-2.5 text-gray-500 hover:text-teal-600 hover:bg-teal-50/50 rounded-lg
                border border-transparent hover:border-teal-100 transition-all duration-300"
              title={t('meetings.schedule')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Calendar className="h-5 w-5" />
            </motion.button>

            <motion.a
              href={form.presentationUrl || defaultPresentationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 text-gray-500 hover:text-teal-600 hover:bg-teal-50/50 rounded-lg
                border border-transparent hover:border-teal-100 transition-all duration-300"
              title={t('companyCoach.viewPresentation')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FileText className="h-5 w-5" />
            </motion.a>

            <motion.button
              ref={menuButtonRef}
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-500 hover:text-teal-600 hover:bg-gray-100 rounded-full"
              title={t('common.actions')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MoreVertical className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        <Menu />
      </AnimatePresence>
    </motion.div>
  );
}