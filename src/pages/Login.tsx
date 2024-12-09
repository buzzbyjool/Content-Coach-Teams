import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, ArrowRight } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { motion } from 'framer-motion';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (error) {
      setError(t('auth.loginError'));
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Veuillez saisir votre adresse email');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setResetLoading(true);
      await sendPasswordResetEmail(auth, email);
      setSuccess('Un email de réinitialisation a été envoyé à votre adresse');
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Erreur lors de l\'envoi de l\'email de réinitialisation');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5DB6BB]/5 via-white to-[#5DB6BB]/5 flex">
      {/* Left Panel - Branding */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#5DB6BB] to-[#4A9296]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)]" style={{ backgroundSize: '24px 24px' }} />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold mb-6">Content Coach</h1>
            <p className="text-xl text-[#E5F4F5] mb-8">
              Gérez vos questionnaires clients efficacement avec notre plateforme intuitive.
            </p>
            <div className="flex items-center space-x-4 text-[#E5F4F5]">
              <span className="w-8 h-px bg-[#8FCFD2]" />
              <span>Intégration TypeForm</span>
            </div>
            <div className="flex items-center space-x-4 text-[#E5F4F5] mt-4">
              <span className="w-8 h-px bg-[#8FCFD2]" />
              <span>Authentification Firebase</span>
            </div>
            <div className="flex items-center space-x-4 text-[#E5F4F5] mt-4">
              <span className="w-8 h-px bg-[#8FCFD2]" />
              <span>Stockage Cloud</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md mx-auto w-full"
        >
          <div className="relative text-center mb-12">
            <div className="relative">
              <img 
                src="https://static.wixstatic.com/media/ee6fb8_acd9328cd6a94354acd9f9d0441563b5~mv2.png" 
                alt="EDITUS Logo"
                className="h-16 w-auto mx-auto mb-6 drop-shadow-xl"
              />
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#5DB6BB] to-[#4A9296] mb-3">
                Bienvenue
              </h2>
              <p className="text-gray-500">
                Connectez-vous pour accéder à votre espace
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg"
              >
                {success}
              </motion.div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse email
              </label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5DB6BB]/30 to-[#4A9296]/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="relative w-full px-4 py-3 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200/50 
                    focus:border-[#5DB6BB]/50 focus:ring-[#5DB6BB]/50 shadow-sm group-hover:shadow-md transition-all duration-300"
                  placeholder="vous@exemple.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5DB6BB]/30 to-[#4A9296]/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="relative w-full px-4 py-3 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200/50 
                    focus:border-[#5DB6BB]/50 focus:ring-[#5DB6BB]/50 shadow-sm group-hover:shadow-md transition-all duration-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetLoading}
                className="text-sm text-[#5DB6BB] hover:text-[#4A9296] disabled:opacity-50 transition-colors duration-200"
              >
                {resetLoading ? 'Envoi en cours...' : 'Mot de passe oublié ?'}
              </button>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full flex justify-center items-center py-3 px-4 rounded-lg text-white 
                bg-gradient-to-r from-[#5DB6BB] to-[#4A9296] hover:from-[#4A9296] hover:to-[#5DB6BB]
                shadow-lg shadow-[#5DB6BB]/20 hover:shadow-xl hover:shadow-[#5DB6BB]/30
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5DB6BB] 
                transition-all duration-300 group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5DB6BB] to-[#4A9296] rounded-lg opacity-0 group-hover:opacity-30 blur transition-opacity duration-300" />
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </motion.button>

            <p className="mt-8 text-center text-sm text-gray-500">
              Pas encore de compte ?{' '}
              <Link 
                to="/register" 
                className="relative font-medium text-[#5DB6BB] hover:text-[#4A9296] transition-colors group"
              >
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-[#5DB6BB] to-[#4A9296] group-hover:w-full transition-all duration-300" />
                Créer un compte
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}