import { v2 as cloudinary } from 'cloudinary';

const CLOUD_NAME = 'dtecqftxk';
const UPLOAD_PRESET = 'e6uom31s';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  error?: {
    message: string;
  };
}

export const uploadLogo = async (file: File): Promise<{ url: string; publicId: string }> => {
  // Validation checks
  if (!file) {
    throw new Error('No file selected');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size must be less than 5MB');
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPG, PNG, GIF, or WebP image');
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('cloud_name', CLOUD_NAME);
    formData.append('folder', 'logo');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Upload failed');
    }

    const data: CloudinaryResponse = await response.json();

    if (!data.secure_url || !data.public_id) {
      throw new Error('Invalid response from upload service');
    }

    return {
      url: data.secure_url,
      publicId: data.public_id
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    if (error instanceof Error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
    throw new Error('Upload failed: Please try again');
  }
};