import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc 
} from 'firebase/firestore';
import { PlusCircle, Archive, Building2 } from 'lucide-react';
import { Form } from '../types/form';
import { Folder } from '../types/folder';
import { FolderList } from '../components/FolderList';
import { FormList } from '../components/FormList';
import { SearchBar } from '../components/SearchBar';
import { useSearch } from '../hooks/useSearch';
import { DashboardBriefing } from '../components/DashboardBriefing';
import { useTranslation } from '../hooks/useTranslation';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState<Form[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        // Load forms
        const formsQuery = query(
          collection(db, 'forms'),
          where('userId', '==', user.uid)
        );
        const formsSnapshot = await getDocs(formsQuery);
        const formsData = formsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Form[];
        setForms(formsData);

        // Load folders
        const foldersQuery = query(
          collection(db, 'folders'),
          where('userId', '==', user.uid)
        );
        const foldersSnapshot = await getDocs(foldersQuery);
        const foldersData = foldersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Folder[];
        setFolders(foldersData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleCreateFolder = async (name: string) => {
    if (!user) return;

    try {
      const newFolder: Omit<Folder, 'id'> = {
        name,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        isArchived: false,
        order: folders.length
      };

      const docRef = await addDoc(collection(db, 'folders'), newFolder);
      const createdFolder = { ...newFolder, id: docRef.id };
      setFolders(prevFolders => [...prevFolders, createdFolder]);
      return createdFolder;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  };

  const handleMoveForm = async (formId: string, folderId: string | null) => {
    if (!formId) return;

    try {
      console.log('Moving form:', { formId, folderId });
      const formRef = doc(db, 'forms', formId);
      await updateDoc(formRef, {
        folderId,
        updatedAt: new Date().toISOString()
      });

      setForms(prevForms => 
        prevForms.map(form => 
          form.id === formId ? { ...form, folderId } : form
        )
      );
    } catch (error) {
      console.error('Error moving form:', error);
      throw error;
    }
  };

  const handleArchiveFolder = async (folderId: string) => {
    if (!folderId) return;

    try {
      const folder = folders.find(f => f.id === folderId);
      if (!folder) return;

      const folderRef = doc(db, 'folders', folderId);
      await updateDoc(folderRef, {
        isArchived: !folder.isArchived,
        updatedAt: new Date().toISOString()
      });

      setFolders(prevFolders => 
        prevFolders.map(f => 
          f.id === folderId ? { ...f, isArchived: !f.isArchived } : f
        )
      );
    } catch (error) {
      console.error('Error archiving folder:', error);
      throw error;
    }
  };

  const handleArchiveForm = async (formId: string) => {
    if (!formId) return;

    try {
      const form = forms.find(f => f.id === formId);
      if (!form) return;

      const formRef = doc(db, 'forms', formId);
      await updateDoc(formRef, {
        isArchived: !form.isArchived,
        updatedAt: new Date().toISOString()
      });

      setForms(prevForms => 
        prevForms.map(f => 
          f.id === formId ? { ...f, isArchived: !f.isArchived } : f
        )
      );
    } catch (error) {
      console.error('Error archiving form:', error);
      throw error;
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!folderId) return;

    try {
      await deleteDoc(doc(db, 'folders', folderId));
      
      // Update forms in the deleted folder
      const formsToUpdate = forms.filter(f => f.folderId === folderId);
      for (const form of formsToUpdate) {
        if (form.id) {
          await handleMoveForm(form.id, null);
        }
      }

      setFolders(prevFolders => prevFolders.filter(f => f.id !== folderId));
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  };

  const handleRenameFolder = async (folderId: string, newName: string) => {
    if (!folderId) return;

    try {
      const folderRef = doc(db, 'folders', folderId);
      await updateDoc(folderRef, {
        name: newName,
        updatedAt: new Date().toISOString()
      });

      setFolders(prevFolders => 
        prevFolders.map(f => 
          f.id === folderId ? { ...f, name: newName } : f
        )
      );
    } catch (error) {
      console.error('Error renaming folder:', error);
      throw error;
    }
  };

  const filteredForms = useSearch(forms, searchQuery);
  const unorganizedForms = filteredForms.filter(form => !form.folderId && !form.isArchived);
  const archivedForms = filteredForms.filter(form => form.isArchived);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5DB6BB]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <DashboardBriefing />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#5DB6BB]/20 to-[#4A9296]/20 rounded-lg blur-lg" />
          <div className="relative">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-[#5DB6BB] to-[#4A9296] rounded-lg shadow-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#5DB6BB] to-[#4A9296]">
                  {t('companyCoach.myCompanyCoaches')}
                </h1>
                <p className="text-sm text-gray-500 mt-1">Gérez vos questionnaires clients efficacement</p>
              </div>
            </div>
            <div className="absolute -bottom-2 left-14 right-0 h-[1px] bg-gradient-to-r from-[#5DB6BB]/50 to-transparent" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="w-full sm:w-64">
            <SearchBar 
              onSearch={setSearchQuery}
              placeholder={t('companyCoach.searchCompanies')}
            />
          </div>
          <Link
            to="/forms/new"
            className="new-coach-button"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            {t('companyCoach.createNew')}
          </Link>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Archive className="h-4 w-4 mr-1.5" />
            {showArchived ? t('companyCoach.current') : t('companyCoach.archived')}
          </button>
        </div>
      </div>

      {searchQuery && (
        <div className="mb-4 text-sm text-gray-500">
          {t('common.searchResults').replace('{{count}}', filteredForms.length.toString())}
        </div>
      )}

      <div className="space-y-6">
        {!showArchived && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="relative mb-6">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#5DB6BB]/10 to-[#4A9296]/10 rounded-lg blur-sm" />
              <div className="relative flex items-center space-x-3">
                <div className="h-8 w-1 bg-gradient-to-b from-[#5DB6BB] to-[#4A9296] rounded-full" />
                <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#5DB6BB] to-[#4A9296] gradient-title">
                  {t('companyCoach.current')}
                </h2>
              </div>
            </div>
            <FormList 
              forms={unorganizedForms} 
              setForms={setForms} 
              onMoveForm={handleMoveForm}
              onArchive={handleArchiveForm}
            />
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          <FolderList
            folders={folders}
            forms={filteredForms}
            onCreateFolder={handleCreateFolder}
            onMoveForm={handleMoveForm}
            onArchiveFolder={handleArchiveFolder}
            onArchiveForm={handleArchiveForm}
            onDeleteFolder={handleDeleteFolder}
            onRenameFolder={handleRenameFolder}
            showArchived={showArchived}
          />
        </div>

        {showArchived && archivedForms.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t('companyCoach.archived')}</h2>
            <FormList 
              forms={archivedForms} 
              setForms={setForms}
              onArchive={handleArchiveForm}
            />
          </div>
        )}
      </div>
    </div>
  );
}