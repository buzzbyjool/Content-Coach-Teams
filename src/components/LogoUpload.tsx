import { useCallback, useState } from 'react';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { uploadLogo } from '../lib/cloudinary';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';

interface LogoUploadProps {
  onLogoUploaded: (url: string, publicId: string) => void;
  currentLogo?: string;
}

export function LogoUpload({ onLogoUploaded, currentLogo }: LogoUploadProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string>(currentLogo || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to create preview'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const handleFile = async (file: File) => {
    if (!user) {
      setError('You must be logged in to upload files');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Create preview first
      const previewUrl = await createPreview(file);
      setPreview(previewUrl);

      // Upload to Cloudinary
      const { url, publicId } = await uploadLogo(file);
      onLogoUploaded(url, publicId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload logo');
      setPreview('');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      await handleFile(file);
    }
  }, []);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleRemove = () => {
    setPreview('');
    setError(null);
    onLogoUploaded('', '');
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragging ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-teal-400'
        }`}
      >
        {preview ? (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Logo preview"
              className="h-32 w-32 object-contain rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 p-1.5 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition-colors"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileInput}
              className="hidden"
              id="logo-upload"
              disabled={uploading}
            />
            <label
              htmlFor="logo-upload"
              className="cursor-pointer inline-flex flex-col items-center"
            >
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
              ) : (
                <Upload className="h-8 w-8 text-gray-400" />
              )}
              <span className="mt-2 text-sm text-gray-500">
                {uploading
                  ? t('companyCoach.uploading')
                  : t('companyCoach.dragAndDrop')}
              </span>
              <span className="mt-1 text-xs text-gray-400">
                {t('companyCoach.fileRequirements')}
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}