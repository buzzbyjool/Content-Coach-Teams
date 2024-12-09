import express from 'express';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert } from 'firebase-admin/app';

const app = express();
app.use(express.json());

// Initialize Firebase Admin
initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore();

interface TypeformAnswer {
  field: {
    id: string;
  };
  text?: string;
  number?: number;
  email?: string;
  url?: string;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.post('/webhook/typeform', async (req, res) => {
  try {
    const { form_response } = req.body;
    const answers = form_response.answers;

    // Find user email from the specific field (2oxfFVXylEq1)
    const userEmailAnswer = answers.find(
      (answer: TypeformAnswer) => answer.field.id === '2oxfFVXylEq1'
    );
    
    if (!userEmailAnswer?.email) {
      return res.status(400).json({ error: 'User email not found' });
    }

    // Get Firebase user by email
    const userRecord = await getAuth().getUserByEmail(userEmailAnswer.email);

    // Map Typeform answers to our form structure
    const formData = {
      userId: userRecord.uid,
      companyName: getAnswerValue(answers, 'twAYALYJdmWu'),
      idNumber: getAnswerValue(answers, 'Ms5BZcJfYqxL'),
      website: getAnswerValue(answers, 'SwVlWGENdyAo'),
      mainActivity: getAnswerValue(answers, 'fr5PNJaHWR0i'),
      subActivities: getAnswerValue(answers, 'HUFPSHdeMR45'),
      facebookUrl: getAnswerValue(answers, 'facebookUrlFieldId'),
      instagramUrl: getAnswerValue(answers, 'instagramUrlFieldId'),
      linkedinUrl: getAnswerValue(answers, 'linkedinUrlFieldId'),
      lastGoogleReview: getAnswerValue(answers, 'lastGoogleReviewFieldId'),
      employeeCount: getAnswerValue(answers, 'eVRfKuH4Tkyu'),
      siteCount: getAnswerValue(answers, '6b1IWkc2p3u2'),
      decisionMaker: getAnswerValue(answers, 'wO8aAFBXzS0A'),
      clientAddress: getAnswerValue(answers, '4n79svw4nnda'),
      clientEmail: getAnswerValue(answers, '1odBCJQla32d'),
      createdAt: new Date().toISOString(),
    };

    // Save to Firestore
    await db.collection('forms').add(formData);

    res.status(200).json({ message: 'Form processed successfully' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function getAnswerValue(answers: TypeformAnswer[], fieldId: string) {
  const answer = answers.find(a => a.field.id === fieldId);
  return answer?.text || answer?.number || answer?.email || answer?.url || '';
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
});

export default app;