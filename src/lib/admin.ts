import { httpsCallable } from 'firebase/functions';
import { functions, db } from './firebase';
import { collection, doc, updateDoc, getDoc, getDocs, deleteDoc } from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
}

export const createAdminUser = async (
  email: string, 
  password: string, 
  firstName: string, 
  lastName: string
): Promise<void> => {
  try {
    const createAdminFunction = httpsCallable(functions, 'createAdmin');
    await createAdminFunction({ email, password, firstName, lastName });
  } catch (error) {
    console.error('Error creating admin:', error);
    throw new Error('Failed to create admin user');
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    // First, delete user's forms
    const formsRef = collection(db, 'forms');
    const formsSnapshot = await getDocs(formsRef);
    const batch = db.batch();
    
    formsSnapshot.docs.forEach(doc => {
      if (doc.data().userId === userId) {
        batch.delete(doc.ref);
      }
    });

    // Delete user document
    const userRef = doc(db, 'users', userId);
    batch.delete(userRef);

    // Execute batch
    await batch.commit();

    // Delete auth user via Cloud Function
    const deleteUserFunction = httpsCallable(functions, 'deleteUser');
    await deleteUserFunction({ userId });
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete user');
  }
};

export const setUserRole = async (userId: string, role: string): Promise<void> => {
  try {
    // First update Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { 
      role,
      updatedAt: new Date().toISOString()
    });

    // Then update custom claims via Cloud Function
    const setRoleFunction = httpsCallable(functions, 'setUserRole');
    await setRoleFunction({ userId, role });
  } catch (error) {
    console.error('Error setting user role:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to set user role');
  }
};

export const updateUserProfile = async (
  userId: string, 
  data: { firstName?: string; lastName?: string }
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile');
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as User));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }
};

export const checkAdminStatus = async (userId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    return userData?.role === 'admin' || userData?.role === 'super_admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export const isSuperAdmin = async (userId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    return userData?.role === 'super_admin';
  } catch (error) {
    console.error('Error checking super admin status:', error);
    return false;
  }
};