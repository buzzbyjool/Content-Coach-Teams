import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { LogoUpload } from '../components/LogoUpload';
import { AddressAutocomplete } from '../components/AddressAutocomplete';
import { AddressMap } from '../components/AddressMap';
import { Loader2, Bot } from 'lucide-react';
import { fireConfetti } from '../lib/confetti';
import { getApiKey } from '../lib/apiKeys';
import { AISearchOverlay } from '../components/AISearchOverlay';
import { useTranslation } from '../hooks/useTranslation';
import { sendWebhook } from '../lib/webhooks';

export default function NewForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [autoFilling, setAutoFilling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    idNumber: '',
    website: 'https://',
    mainActivity: '',
    subActivities: '',
    employeeCount: '',
    siteCount: '',
    decisionMaker: '',
    clientAddress: '',
    clientEmail: '',
    logoUrl: '',
    logoPublicId: '',
    facebookUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    lastGoogleReview: '',
    coordinates: undefined as { lat: string; lon: string } | undefined,
    isArchived: false // Add default value for isArchived
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      setError(null);

      // Validate and convert numeric fields
      const employeeCount = parseInt(formData.employeeCount) || 0;
      const siteCount = parseInt(formData.siteCount) || 0;

      // Prepare form data with proper types and required fields
      const formDataToSubmit = {
        ...formData,
        employeeCount,
        siteCount,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isArchived: false,
        coordinates: formData.coordinates ? {
          lat: formData.coordinates.lat,
          lon: formData.coordinates.lon
        } : null
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'forms'), formDataToSubmit);
      const formWithId = { ...formDataToSubmit, id: docRef.id };

      // Send webhook
      try {
        await sendWebhook(formWithId);
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
        // Non-blocking error - show notification but continue
        setError(
          'Le formulaire a été enregistré mais la notification n\'a pas pu être envoyée. ' +
          'L\'équipe technique en a été informée.'
        );
      }

      fireConfetti();
      
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      console.error('Error creating form:', error);
      setError(t('companyCoach.createError'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUploaded = (logoUrl: string, logoPublicId: string) => {
    setFormData(prev => ({ ...prev, logoUrl, logoPublicId }));
  };

  const handleAddressChange = (address: string, coordinates?: { lat: string; lon: string }) => {
    setFormData(prev => ({
      ...prev,
      clientAddress: address,
      coordinates
    }));
  };

  const handleAutoFill = async () => {
    if (!formData.companyName.trim() || autoFilling) return;

    try {
      setAutoFilling(true);
      setError(null);

      const apiKey = await getApiKey('perplexity');
      if (!apiKey) {
        throw new Error('AI service is not configured');
      }

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-huge-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that provides company information. Return ONLY a JSON object with the following structure: {"address": string | null, "website": string | null, "decisionMaker": string | null, "mainActivity": string | null, "subActivities": string | null, "employeeCount": number | null, "siteCount": number | null, "facebookUrl": string | null, "instagramUrl": string | null, "linkedinUrl": string | null, "lastGoogleReview": string | null}. For lastGoogleReview, return the date in YYYY-MM-DD format. Do not include any other text in your response.'
            },
            {
              role: 'user',
              content: `Find comprehensive business information for the company: ${formData.companyName}. Include address, website, decision maker (CEO), main activity, sub-activities, employee count, number of locations, Facebook URL, Instagram URL, LinkedIn URL, and the date of their last Google Business review. Return only JSON.`
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
          top_p: 0.9,
          stream: false
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get company information');
      }

      const data = await response.json();
      let info;
      
      try {
        info = JSON.parse(data.choices[0].message.content.trim());
      } catch (e) {
        const match = data.choices[0].message.content.match(/\{[^}]+\}/);
        if (match) {
          info = JSON.parse(match[0]);
        } else {
          throw new Error('Invalid response format');
        }
      }

      if (!info || typeof info !== 'object') {
        throw new Error('Invalid response format');
      }

      setFormData(prev => ({
        ...prev,
        clientAddress: info.address || '',
        website: info.website || 'https://',
        decisionMaker: info.decisionMaker || '',
        mainActivity: info.mainActivity || '',
        subActivities: info.subActivities || '',
        employeeCount: info.employeeCount?.toString() || '',
        siteCount: info.siteCount?.toString() || '',
        facebookUrl: info.facebookUrl || '',
        instagramUrl: info.instagramUrl || '',
        linkedinUrl: info.linkedinUrl || '',
        lastGoogleReview: info.lastGoogleReview || ''
      }));
    } catch (error) {
      console.error('Error auto-filling form:', error);
      setError(t('companyCoach.autoFillError'));
    } finally {
      setAutoFilling(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('companyCoach.createNew')}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('companyCoach.logo')}
          </label>
          <div className="mt-1">
            <LogoUpload onLogoUploaded={handleLogoUploaded} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
              {t('companyCoach.name')}
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="flex-1 rounded-l-md border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                required
              />
              <button
                type="button"
                onClick={handleAutoFill}
                disabled={!formData.companyName || autoFilling}
                className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:opacity-50"
                title={t('companyCoach.autoFill')}
              >
                {autoFilling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700">
              {t('companyCoach.idNumber')}
            </label>
            <input
              type="text"
              id="idNumber"
              value={formData.idNumber}
              onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
              {t('companyCoach.website')}
            </label>
            <input
              type="url"
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label htmlFor="mainActivity" className="block text-sm font-medium text-gray-700">
              {t('companyCoach.mainActivity')}
            </label>
            <input
              type="text"
              id="mainActivity"
              value={formData.mainActivity}
              onChange={(e) => setFormData({ ...formData, mainActivity: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label htmlFor="subActivities" className="block text-sm font-medium text-gray-700">
              {t('companyCoach.subActivities')}
            </label>
            <input
              type="text"
              id="subActivities"
              value={formData.subActivities}
              onChange={(e) => setFormData({ ...formData, subActivities: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label htmlFor="facebookUrl" className="block text-sm font-medium text-gray-700">
              Quelle est l'adresse web de la page Facebook ?
            </label>
            <input
              type="url"
              id="facebookUrl"
              value={formData.facebookUrl}
              onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              placeholder="https://facebook.com/..."
            />
          </div>

          <div>
            <label htmlFor="instagramUrl" className="block text-sm font-medium text-gray-700">
              Quelle est l'adresse web de la page Instagram ?
            </label>
            <input
              type="url"
              id="instagramUrl"
              value={formData.instagramUrl}
              onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              placeholder="https://instagram.com/..."
            />
          </div>

          <div>
            <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700">
              Quelle est l'adresse web de la page LinkedIn ?
            </label>
            <input
              type="url"
              id="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              placeholder="https://linkedin.com/company/..."
            />
          </div>

          <div>
            <label htmlFor="lastGoogleReview" className="block text-sm font-medium text-gray-700">
              Quelle est la date du dernier commentaire sur Google Business profile ?
            </label>
            <input
              type="date"
              id="lastGoogleReview"
              value={formData.lastGoogleReview}
              onChange={(e) => setFormData({ ...formData, lastGoogleReview: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            />
          </div>

          <div>
            <label htmlFor="employeeCount" className="block text-sm font-medium text-gray-700">
              {t('companyCoach.employeeCount')}
            </label>
            <input
              type="number"
              id="employeeCount"
              value={formData.employeeCount}
              onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              required
              min="0"
            />
          </div>

          <div>
            <label htmlFor="siteCount" className="block text-sm font-medium text-gray-700">
              {t('companyCoach.siteCount')}
            </label>
            <input
              type="number"
              id="siteCount"
              value={formData.siteCount}
              onChange={(e) => setFormData({ ...formData, siteCount: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              required
              min="0"
            />
          </div>

          <div>
            <label htmlFor="decisionMaker" className="block text-sm font-medium text-gray-700">
              {t('companyCoach.decisionMaker')}
            </label>
            <input
              type="text"
              id="decisionMaker"
              value={formData.decisionMaker}
              onChange={(e) => setFormData({ ...formData, decisionMaker: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label htmlFor="clientAddress" className="block text-sm font-medium text-gray-700">
              {t('companyCoach.address')}
            </label>
            <AddressAutocomplete
              value={formData.clientAddress}
              onChange={handleAddressChange}
              required
            />
            {formData.coordinates && (
              <div className="mt-4">
                <AddressMap 
                  address={formData.clientAddress}
                  coordinates={{
                    lat: parseFloat(formData.coordinates.lat),
                    lon: parseFloat(formData.coordinates.lon)
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700">
              {t('companyCoach.email')}
            </label>
            <input
              type="email"
              id="clientEmail"
              value={formData.clientEmail}
              onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('companyCoach.creating')}
              </>
            ) : (
              t('companyCoach.create')
            )}
          </button>
        </div>
      </form>

      <AISearchOverlay 
        isVisible={autoFilling} 
        message={t('companyCoach.aiSearching')}
      />
    </div>
  );
}