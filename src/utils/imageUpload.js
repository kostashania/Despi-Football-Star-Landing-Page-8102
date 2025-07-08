import supabase from '../lib/supabase';

// Maximum file size in bytes (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed file types
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
];

/**
 * Generate a random unique ID for file names
 * @returns {string} A random unique ID
 */
const generateUniqueId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Convert a file to a base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - A promise that resolves to the base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Upload an image to Supabase storage
 * @param {File} file - The file to upload
 * @returns {Promise<string>} - A promise that resolves to the public URL of the uploaded file
 */
export const uploadImage = async (file) => {
  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
    }
    
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error('File type not supported. Please upload a JPEG, PNG, WebP, or GIF image.');
    }
    
    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${generateUniqueId()}.${fileExt}`;
    const filePath = `images/${fileName}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('despi-gallery')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) throw error;
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('despi-gallery')
      .getPublicUrl(filePath);
      
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Validate an image URL
 * @param {string} url - The URL to validate
 * @returns {Promise<boolean>} - A promise that resolves to true if the URL is valid
 */
export const validateImageUrl = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return contentType && contentType.startsWith('image/');
  } catch (error) {
    return false;
  }
};