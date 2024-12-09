import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

export const setApiKey = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated to manage API keys'
    );
  }

  const { service, key } = data;

  // Validate input
  if (!service || !key) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Service name and API key are required'
    );
  }

  try {
    // Check super admin status
    const userRef = await db.collection('users').doc(context.auth.uid).get();
    const userData = userRef.data();
    
    if (!userData?.role || userData.role !== 'super_admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only super admins can manage API keys'
      );
    }

    // Store in settings collection
    const settingsRef = db.collection('settings').doc('api_keys');
    await settingsRef.set({
      [service.toLowerCase()]: {
        key: key,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: context.auth.uid
      }
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error('Error in setApiKey:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to store API key'
    );
  }
});