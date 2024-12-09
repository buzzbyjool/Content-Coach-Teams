import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Settings, LogOut, Shield } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { motion } from 'framer-motion';

interface NavbarProps {
  onSettingsClick: () => void;
}

function Navbar({ onSettingsClick }: NavbarProps) {
  const { user, signOut, isAdmin } = useAuth();
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/80"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-4 group">
            <motion.img 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              src="https://static.wixstatic.com/media/ee6fb8_acd9328cd6a94354acd9f9d0441563b5~mv2.png" 
              alt="EDITUS Logo"
              className="h-8 w-auto"
            />
            <div className="h-6 w-px bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200" />
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-teal-500"
            >
              Content-Coach
            </motion.span>
          </Link>

          {user && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-2"
            >
              {isAdmin && (
                <motion.div whileHover={{ scale: 1.1 }}>
                  <Link
                    to="/admin"
                    className="nav-link"
                    title={t('admin.panel')}
                  >
                    <Shield className="h-5 w-5" />
                  </Link>
                </motion.div>
              )}
              <motion.div whileHover={{ scale: 1.1 }}>
                <button
                  onClick={onSettingsClick}
                  className="nav-link"
                  title={t('common.settings')}
                >
                  <Settings className="h-5 w-5" />
                </button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }}>
                <button
                  onClick={handleLogout}
                  className="nav-link"
                  title={t('auth.signOut')}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

export default Navbar;