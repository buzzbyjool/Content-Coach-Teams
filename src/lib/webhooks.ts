import { Form } from '../types/form';
import { auth } from './firebase';

const WEBHOOK_URL = 'https://hook.eu2.make.com/z9is6my4jrhb7elv2fl7daqe1caluxkm';

interface WebhookResponse {
  success: boolean;
  message?: string;
}

export async function sendWebhook(data: Form): Promise<WebhookResponse> {
  try {
    // Validate required data
    if (!data.id || !data.companyName) {
      throw new Error('Missing required fields for webhook');
    }

    // Get current user's email
    const currentUser = auth.currentUser;
    if (!currentUser?.email) {
      throw new Error('User email not available');
    }

    // Prepare webhook payload with all necessary fields
    const webhookData = {
      id: data.id,
      companyName: data.companyName.trim(),
      idNumber: data.idNumber?.trim() || null,
      website: data.website?.trim() || null,
      mainActivity: data.mainActivity?.trim() || null,
      subActivities: data.subActivities?.trim() || null,
      facebookUrl: data.facebookUrl?.trim() || null,
      instagramUrl: data.instagramUrl?.trim() || null,
      linkedinUrl: data.linkedinUrl?.trim() || null,
      lastGoogleReview: data.lastGoogleReview || null,
      employeeCount: Number(data.employeeCount) || 0,
      siteCount: Number(data.siteCount) || 0,
      decisionMaker: data.decisionMaker?.trim() || null,
      clientAddress: data.clientAddress?.trim() || null,
      clientEmail: data.clientEmail?.trim() || null,
      logoUrl: data.logoUrl?.trim() || null,
      logoPublicId: data.logoPublicId?.trim() || null,
      coordinates: data.coordinates || null,
      createdAt: data.createdAt,
      userId: data.userId,
      userEmail: currentUser.email // Add user's email to the payload
    };

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(webhookData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Webhook failed (${response.status}): ${errorText}`);
    }

    // Try to parse response as JSON, fallback to success message if not JSON
    try {
      return await response.json();
    } catch {
      return { success: true, message: 'Webhook sent successfully' };
    }
  } catch (error) {
    // Enhanced error logging
    console.error('Webhook error details:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        id: data.id,
        companyName: data.companyName,
        hasLogo: !!data.logoUrl,
        hasUserEmail: !!auth.currentUser?.email
      }
    });

    // Rethrow with more context
    throw new Error(
      `Failed to send webhook: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}