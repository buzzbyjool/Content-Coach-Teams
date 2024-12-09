import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { Users as UsersIcon, ClipboardList, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Form } from '../../types/form';
import { DeleteFormDialog } from '../../components/DeleteFormDialog';
import { FormDetailsModal } from '../../components/FormDetailsModal';
import { ApiKeyManager } from '../../components/admin/ApiKeyManager';
import { motion } from 'framer-motion';

interface FormWithCreator extends Form {
  creatorEmail?: string;
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState<FormWithCreator[]>([]);
  const [stats, setStats] = useState({
    totalForms: 0,
    totalUsers: 0
  });
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const isSuperAdmin = user?.email === 'julien.doussot@mac.com';

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch all forms
        const formsQuery = query(collection(db, 'forms'));
        const formsSnapshot = await getDocs(formsQuery);
        
        // Fetch all users to map user IDs to emails
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const userMap = new Map();
        usersSnapshot.docs.forEach(doc => {
          userMap.set(doc.id, doc.data().email);
        });

        // Map forms with creator emails
        const formsData = formsSnapshot.docs.map(doc => {
          const formData = doc.data();
          return {
            id: doc.id,
            ...formData,
            creatorEmail: userMap.get(formData.userId) || 'Unknown User'
          };
        }) as FormWithCreator[];

        setForms(formsData);
        setStats({
          totalForms: formsData.length,
          totalUsers: usersSnapshot.size
        });
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDeleteForm = async () => {
    if (!formToDelete?.id) return;

    try {
      await deleteDoc(doc(db, 'forms', formToDelete.id));
      setForms(forms.filter(form => form.id !== formToDelete.id));
      setStats(prev => ({ ...prev, totalForms: prev.totalForms - 1 }));
      setFormToDelete(null);
    } catch (error) {
      console.error('Error deleting form:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-[#5DB6BB] animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-[#5DB6BB]/20 to-[#4A9296]/20 rounded-lg blur-lg" />
          <div className="relative">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#5DB6BB] to-[#4A9296]">
              Admin Dashboard
            </h1>
            <div className="absolute -bottom-2 left-0 right-0 h-[1px] bg-gradient-to-r from-[#5DB6BB]/50 to-transparent" />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            to="/admin/users"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-[#5DB6BB] to-[#4A9296] hover:from-[#4A9296] hover:to-[#5DB6BB] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5DB6BB] transition-all duration-300"
          >
            <UsersIcon className="h-5 w-5 mr-2" />
            Manage Users
          </Link>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-gradient-to-br from-[#5DB6BB] to-[#4A9296] rounded-lg">
                  <ClipboardList className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Forms
                  </dt>
                  <dd className="text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#5DB6BB] to-[#4A9296]">
                    {stats.totalForms}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-gradient-to-br from-[#5DB6BB] to-[#4A9296] rounded-lg">
                  <UsersIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Users
                  </dt>
                  <dd className="text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#5DB6BB] to-[#4A9296]">
                    {stats.totalUsers}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {isSuperAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <ApiKeyManager />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white shadow-lg rounded-lg hover:shadow-xl transition-all duration-300"
      >
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">All Forms</h2>

          <div className="mt-4">
            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-[#5DB6BB]/5 to-[#4A9296]/5">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Company
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created By
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created At
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {forms.map((form) => (
                          <tr key={form.id} className="hover:bg-gradient-to-r hover:from-[#5DB6BB]/5 hover:to-[#4A9296]/5 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => setSelectedForm(form)}
                                className="flex items-center group hover:opacity-75 transition-opacity"
                              >
                                {form.logoUrl ? (
                                  <img
                                    src={form.logoUrl}
                                    alt={`${form.companyName} logo`}
                                    className="h-8 w-8 rounded-full object-contain"
                                  />
                                ) : (
                                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#5DB6BB]/10 to-[#4A9296]/10 flex items-center justify-center">
                                    <ClipboardList className="h-4 w-4 text-[#5DB6BB]" />
                                  </div>
                                )}
                                <span className="ml-3 font-medium text-gray-900 group-hover:text-[#5DB6BB]">
                                  {form.companyName}
                                </span>
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {form.creatorEmail}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(form.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <Link
                                  to={`/forms/edit/${form.id}`}
                                  className="text-[#5DB6BB] hover:text-[#4A9296] p-2 hover:bg-[#5DB6BB]/10 rounded-full transition-colors duration-200"
                                  title="Edit form"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Link>
                                <button
                                  onClick={() => setFormToDelete(form)}
                                  className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors duration-200"
                                  title="Delete form"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

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
    </div>
  );
}