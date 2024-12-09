import { useState } from 'react';
import { functions } from '../../lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { Key, Loader2 } from 'lucide-react';

export function ApiKeyManager() {
  const [service, setService] = useState('');
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service.trim() || !key.trim()) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const setApiKey = httpsCallable(functions, 'setApiKey');
      await setApiKey({ 
        service: service.trim().toLowerCase(), 
        key: key.trim() 
      });
      
      setSuccess(`API key for ${service} stored successfully`);
      setService('');
      setKey('');
    } catch (error: any) {
      console.error('Error storing API key:', error);
      setError(error?.message || 'Failed to store API key. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center mb-4">
        <Key className="h-5 w-5 text-teal-600 mr-2" />
        <h2 className="text-lg font-medium text-gray-900">API Key Management</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div>
          <label htmlFor="service" className="block text-sm font-medium text-gray-700">
            Service Name
          </label>
          <select
            id="service"
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            required
          >
            <option value="">Select a service</option>
            <option value="perplexity">Perplexity AI</option>
          </select>
        </div>

        <div>
          <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">
            API Key
          </label>
          <input
            type="password"
            id="api-key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            placeholder="Enter your API key"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !service || !key}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Storing...
            </>
          ) : (
            'Store API Key'
          )}
        </button>
      </form>
    </div>
  );
}