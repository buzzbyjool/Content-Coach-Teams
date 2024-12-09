import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  User, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword as firebaseUpdatePassword,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'user';
  createdAt: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  isAdmin: boolean;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let unsubscribeAuth: () => void;
    let unsubscribeData: () => void;

    const setupAuthListener = () => {
      unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
        setUser(user);
        
        if (user) {
          // Set up real-time listener for user data
          const userRef = doc(db, 'users', user.uid);
          unsubscribeData = onSnapshot(userRef, async (doc) => {
            if (doc.exists()) {
              const data = doc.data() as UserData;
              setUserData(data);
              setIsAdmin(data.role === 'admin' || data.role === 'super_admin' || user.email === 'julien.doussot@mac.com');
            } else {
              // Create user document if it doesn't exist
              const newUserData: UserData = {
                email: user.email!,
                firstName: '',
                lastName: '',
                role: user.email === 'julien.doussot@mac.com' ? 'super_admin' : 'user',
                createdAt: new Date().toISOString(),
              };
              await setDoc(userRef, newUserData);
              setUserData(newUserData);
              setIsAdmin(user.email === 'julien.doussot@mac.com');
            }
            setLoading(false);
          });
        } else {
          setUserData(null);
          setIsAdmin(false);
          setLoading(false);
        }
      });
    };

    setupAuthListener();

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeData) unsubscribeData();
    };
  }, []);

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;

    // Create user document in Firestore
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      email: user.email,
      firstName,
      lastName,
      role: 'user',
      createdAt: new Date().toISOString(),
    });
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        lastLogout: new Date().toISOString(),
      }, { merge: true });
    }
    return firebaseSignOut(auth);
  };

  const updatePassword = async (newPassword: string) => {
    if (!user) throw new Error('No user logged in');
    await firebaseUpdatePassword(user, newPassword);
  };

  const value = {
    user,
    userData,
    loading,
    isAdmin,
    signup,
    login,
    signOut,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}