import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, Key, Bug, User, Loader2 } from 'lucide-react';
import { updateUserProfile } from '../lib/admin';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { user, userData, updatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [firstName, setFirstName] = useState(userData?.firstName || '');
  const [lastName, setLastName] = useState(userData?.lastName || '');
  const [showDebug, setShowDebug] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await updatePassword(newPassword);
      setSuccess('Mot de passe mis à jour avec succès');
      setNewPassword('');
    } catch (error) {
      setError('Échec de la mise à jour du mot de passe');
      console.error('Error updating password:', error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateUserProfile(user.uid, { firstName, lastName });
      setSuccess('Profil mis à jour avec succès');
    } catch (error) {
      setError('Échec de la mise à jour du profil');
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 m-4"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#5DB6BB] to-[#4A9296]">
                Paramètres
              </h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            <div className="space-y-8">
              {/* Profile Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-[#5DB6BB]" />
                  Informations du profil
                </h3>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative group">
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        Prénom
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm 
                            focus:ring-[#5DB6BB] focus:border-[#5DB6BB] 
                            group-hover:border-[#5DB6BB]/50 transition-colors"
                          required
                        />
                      </div>
                    </div>
                    <div className="relative group">
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Nom
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm 
                            focus:ring-[#5DB6BB] focus:border-[#5DB6BB] 
                            group-hover:border-[#5DB6BB]/50 transition-colors"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent 
                      rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#5DB6BB] to-[#4A9296] 
                      hover:from-[#4A9296] hover:to-[#5DB6BB] focus:outline-none focus:ring-2 
                      focus:ring-offset-2 focus:ring-[#5DB6BB] disabled:opacity-50 transition-all duration-300"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Mise à jour...
                      </>
                    ) : (
                      'Mettre à jour le profil'
                    )}
                  </motion.button>
                </form>
              </motion.div>

              {/* Password Change Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Key className="h-5 w-5 mr-2 text-[#5DB6BB]" />
                  Changer le mot de passe
                </h3>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="relative group">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nouveau mot de passe"
                      className="block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm 
                        focus:ring-[#5DB6BB] focus:border-[#5DB6BB] 
                        group-hover:border-[#5DB6BB]/50 transition-colors"
                      minLength={6}
                      required
                    />
                  </div>
                  {error && <p className="text-red-600 text-sm">{error}</p>}
                  {success && <p className="text-green-600 text-sm">{success}</p>}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent 
                      rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#5DB6BB] to-[#4A9296] 
                      hover:from-[#4A9296] hover:to-[#5DB6BB] focus:outline-none focus:ring-2 
                      focus:ring-offset-2 focus:ring-[#5DB6BB] transition-all duration-300"
                  >
                    Mettre à jour le mot de passe
                  </motion.button>
                </form>
              </motion.div>

              {/* Debug Mode Toggle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Bug className="h-5 w-5 mr-2 text-[#5DB6BB]" />
                  Mode débogage
                </h3>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={showDebug}
                    onChange={(e) => setShowDebug(e.target.checked)}
                    className="h-4 w-4 text-[#5DB6BB] focus:ring-[#5DB6BB] border-gray-300 rounded 
                      transition-colors duration-200"
                  />
                  <span className="text-gray-700">Activer le mode débogage</span>
                </label>
                {showDebug && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 bg-gray-50 rounded-md"
                  >
                    <p className="text-sm text-gray-600">ID utilisateur : {user?.uid}</p>
                    <p className="text-sm text-gray-600">Email : {user?.email}</p>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default SettingsDialog;