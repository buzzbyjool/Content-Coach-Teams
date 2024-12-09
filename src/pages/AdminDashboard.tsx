import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { Users, ClipboardList, ShieldCheck } from 'lucide-react';
import { UserList } from '../components/admin/UserList';
import { AdminStats } from '../components/admin/AdminStats';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalForms: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const formsSnap = await getDocs(collection(db, 'forms'));
        
        setStats({
          totalUsers: usersSnap.size,
          totalForms: formsSnap.size,
          activeUsers: usersSnap.docs.filter(doc => doc.data().lastLogin).length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
        
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <AdminStats
            icon={<Users className="h-6 w-6 text-white" />}
            title="Total Users"
            value={stats.totalUsers}
          />
          <AdminStats
            icon={<ClipboardList className="h-6 w-6 text-white" />}
            title="Total Forms"
            value={stats.totalForms}
          />
          <AdminStats
            icon={<ShieldCheck className="h-6 w-6 text-white" />}
            title="Active Users"
            value={stats.activeUsers}
          />
        </div>

        <div className="mt-8">
          <UserList isSuperAdmin={user?.email === 'julien.doussot@mac.com'} />
        </div>
      </div>
    </div>
  );
}