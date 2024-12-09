import { doc, getDoc } from 'firebase/firestore';
import { db, fetchWithRetry } from './firebase';

export async function getApiKey(service: string): Promise<string | null> {
  try {
    return await fetchWithRetry(async () => {
      const settingsRef = doc(db, 'settings', 'api_keys');
      const snapshot = await getDoc(settingsRef);
      
      if (!snapshot.exists()) {
        return null;
      }

      const data = snapshot.data();
      const serviceKey = data[service.toLowerCase()];
      return serviceKey?.key || null;
    });
  } catch (error) {
    console.error('Error fetching API key:', error);
    throw error;
  }
}