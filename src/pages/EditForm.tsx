import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { LogoUpload } from '../components/LogoUpload';
import { Form } from '../types/form';
import { Loader2 } from 'lucide-react';
import { AddressAutocomplete } from '../components/AddressAutocomplete';
import { AddressMap } from '../components/AddressMap';

export default function EditForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadForm = async () => {
      if (!id || !user) return;

      try {
        const docRef = doc(db, 'forms', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // Allow access if user is admin or form owner
          if (isAdmin || docSnap.data().userId === user.uid) {
            setForm({ id: docSnap.id, ...docSnap.data() } as Form);
          } else {
            navigate('/');
          }
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error loading form:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, [id, user, navigate, isAdmin]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id || !form) return;

    try {
      setSaving(true);
      const docRef = doc(db, 'forms', id);
      await updateDoc(docRef, {
        ...form,
        updatedAt: new Date().toISOString()
      });
      navigate(isAdmin ? '/admin' : '/');
    } catch (error) {
      console.error('Error updating form:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUploaded = (url: string, publicId: string) => {
    setForm(prev => prev ? { ...prev, logoUrl: url, logoPublicId: publicId } : null);
  };

  const handleAddressChange = (address: string, coordinates?: { lat: string; lon: string }) => {
    setForm(prev => prev ? {
      ...prev,
      clientAddress: address,
      coordinates
    } : null);
  };

  const handleCancel = () => {
    navigate(isAdmin ? '/admin' : '/');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (!form) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Company Coach</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Company Logo</label>
          <div className="mt-1">
            <LogoUpload onLogoUploaded={handleLogoUploaded} currentLogo={form.logoUrl} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700">
              ID Number
            </label>
            <input
              type="text"
              id="idNumber"
              value={form.idNumber}
              onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
              Website
            </label>
            <input
              type="url"
              id="website"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label htmlFor="mainActivity" className="block text-sm font-medium text-gray-700">
              Main Activity
            </label>
            <input
              type="text"
              id="mainActivity"
              value={form.mainActivity}
              onChange={(e) => setForm({ ...form, mainActivity: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label htmlFor="subActivities" className="block text-sm font-medium text-gray-700">
              Sub Activities
            </label>
            <input
              type="text"
              id="subActivities"
              value={form.subActivities}
              onChange={(e) => setForm({ ...form, subActivities: e.target.value })}
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
              value={form.facebookUrl}
              onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
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
              value={form.instagramUrl}
              onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
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
              value={form.linkedinUrl}
              onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
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
              value={form.lastGoogleReview}
              onChange={(e) => setForm({ ...form, lastGoogleReview: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            />
          </div>

          <div>
            <label htmlFor="employeeCount" className="block text-sm font-medium text-gray-700">
              Number of Employees
            </label>
            <input
              type="number"
              id="employeeCount"
              value={form.employeeCount}
              onChange={(e) => setForm({ ...form, employeeCount: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              required
              min="0"
            />
          </div>

          <div>
            <label htmlFor="siteCount" className="block text-sm font-medium text-gray-700">
              Number of Sites
            </label>
            <input
              type="number"
              id="siteCount"
              value={form.siteCount}
              onChange={(e) => setForm({ ...form, siteCount: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              required
              min="0"
            />
          </div>

          <div>
            <label htmlFor="decisionMaker" className="block text-sm font-medium text-gray-700">
              Decision Maker Name
            </label>
            <input
              type="text"
              id="decisionMaker"
              value={form.decisionMaker}
              onChange={(e) => setForm({ ...form, decisionMaker: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label htmlFor="clientAddress" className="block text-sm font-medium text-gray-700">
              Client Address
            </label>
            <AddressAutocomplete
              value={form.clientAddress}
              onChange={handleAddressChange}
              required
            />
            {form.coordinates && (
              <div className="mt-4">
                <AddressMap 
                  address={form.clientAddress}
                  coordinates={{
                    lat: parseFloat(form.coordinates.lat),
                    lon: parseFloat(form.coordinates.lon)
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700">
              Client Email
            </label>
            <input
              type="email"
              id="clientEmail"
              value={form.clientEmail}
              onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
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
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}