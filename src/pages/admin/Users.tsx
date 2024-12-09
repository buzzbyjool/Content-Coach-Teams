import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { Shield, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserList } from '../../components/admin/UserList';
import { CreateAdminDialog } from '../../components/admin/CreateAdminDialog';

export default function Users() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const isSuperAdmin = user?.email === 'julien.doussot@mac.com';

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    } else {
      setLoading(false);
    }
  }, [isAdmin, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage users and their roles in the system
          </p>
        </div>
        {isSuperAdmin && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateAdmin(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </motion.button>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white shadow overflow-hidden sm:rounded-lg"
      >
        <UserList isSuperAdmin={isSuperAdmin} />
      </motion.div>

      {showCreateAdmin && (
        <CreateAdminDialog
          isOpen={showCreateAdmin}
          onClose={() => setShowCreateAdmin(false)}
          onUserCreated={() => {
            setShowCreateAdmin(false);
          }}
        />
      )}
    </div>
  );
}