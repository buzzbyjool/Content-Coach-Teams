import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Shield, Trash2, Loader2, Calendar, FileText, AlertCircle } from 'lucide-react';
import { DeleteUserDialog } from '../DeleteUserDialog';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  formCount: number;
}

interface UserListProps {
  isSuperAdmin: boolean;
}

export function UserList({ isSuperAdmin }: UserListProps) {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all users
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          formCount: 0
        })) as User[];

        // Get all forms
        const formsQuery = query(collection(db, 'forms'));
        const formsSnapshot = await getDocs(formsQuery);
        
        // Count forms per user
        const formCounts = new Map<string, number>();
        formsSnapshot.docs.forEach(doc => {
          const userId = doc.data().userId;
          formCounts.set(userId, (formCounts.get(userId) || 0) + 1);
        });

        // Update users with form counts
        const updatedUsers = usersData.map(user => ({
          ...user,
          formCount: formCounts.get(user.id) || 0
        }));

        setUsers(updatedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteDoc(doc(db, 'users', userToDelete.id));
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <ul className="divide-y divide-gray-200">
        <AnimatePresence>
          {users.map((user, index) => (
            <motion.li
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.email}</p>
                    <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        {user.formCount} forms
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {isSuperAdmin && user.role !== 'super_admin' && (
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  )}

                  {user.role === 'admin' && (
                    <Shield className="h-5 w-5 text-teal-600" />
                  )}

                  {isSuperAdmin && user.role !== 'super_admin' && user.id !== user?.uid && (
                    <button
                      onClick={() => setUserToDelete(user)}
                      className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors duration-200"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <DeleteUserDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteUser}
        email={userToDelete?.email || ''}
      />
    </div>
  );
}