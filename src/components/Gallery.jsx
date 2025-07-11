import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../lib/supabase';
import ImageUploader from './ImageUploader';
import ReCAPTCHA from 'react-google-recaptcha';

const { FiX, FiUpload, FiPlus, FiImage, FiClock } = FiIcons;

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showUploader, setShowUploader] = useState(false);
  const [recaptchaSettings, setRecaptchaSettings] = useState({
    enabled: false,
    siteKey: ''
  });
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  const [images, setImages] = useState([
    {
      src: "https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1751962901891-blob",
      alt: "Despi in action",
      title: "Goal Celebration"
    },
    {
      src: "https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1751962951856-blob",
      alt: "Despi football moment",
      title: "Match Winner"
    },
    {
      src: "https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1751959485547-blob",
      alt: "Despi portrait",
      title: "Rising Star"
    },
    {
      src: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Training session",
      title: "Training Hard"
    },
    {
      src: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Team photo",
      title: "Team Spirit"
    },
    {
      src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Skills training",
      title: "Skill Development"
    }
  ]);

  useEffect(() => {
    fetchGalleryImages();
    fetchRecaptchaSettings();
  }, []);

  const fetchRecaptchaSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings_despi_9a7b3c4d2e')
        .select('*')
        .in('setting_key', ['recaptcha_enabled', 'recaptcha_site_key']);

      if (error) throw error;

      const settings = {};
      data.forEach(setting => {
        settings[setting.setting_key] = setting.setting_value;
      });

      setRecaptchaSettings({
        enabled: settings.recaptcha_enabled === 'true',
        siteKey: settings.recaptcha_site_key || ''
      });
    } catch (error) {
      console.error('Error fetching reCAPTCHA settings:', error);
    }
  };

  const fetchGalleryImages = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_images_despi_9a7b3c4d2e')
        .select('*')
        .eq('is_approved', true) // Only show approved images
        .order('sort_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedImages = data.map(image => ({
          id: image.id,
          src: image.image_url,
          alt: image.alt_text,
          title: image.title,
          isFeatured: image.is_featured
        }));
        setImages(formattedImages);
      }
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    }
  };

  const handleRecaptchaChange = (value) => {
    setRecaptchaValue(value);
  };

  const handleUploadSuccess = async (imageUrl) => {
    try {
      // Check reCAPTCHA if enabled
      if (recaptchaSettings.enabled && recaptchaSettings.siteKey) {
        if (!recaptchaValue) {
          alert('Please complete the reCAPTCHA verification before uploading.');
          return;
        }
      }

      // Create a new image entry with approval pending
      const newImage = {
        title: 'User Upload - Pending Approval',
        alt_text: 'User uploaded football image',
        image_url: imageUrl,
        is_featured: false,
        is_approved: false, // Requires admin approval
        uploaded_by: 'public_user',
        upload_status: 'pending'
      };

      // Get the next sort order
      const { data: existingImages } = await supabase
        .from('gallery_images_despi_9a7b3c4d2e')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1);

      const nextSortOrder = existingImages && existingImages.length > 0 
        ? existingImages[0].sort_order + 1 
        : 0;

      // Insert the new image
      const { error } = await supabase
        .from('gallery_images_despi_9a7b3c4d2e')
        .insert([{
          ...newImage,
          sort_order: nextSortOrder,
          created_at: new Date(),
          updated_at: new Date()
        }]);

      if (error) throw error;

      // Reset reCAPTCHA
      if (recaptchaSettings.enabled && window.grecaptcha) {
        window.grecaptcha.reset();
        setRecaptchaValue(null);
      }

      setShowUploader(false);
      
      alert('Image uploaded successfully! It will be reviewed by an admin before being published.');
    } catch (error) {
      console.error('Error saving uploaded image:', error);
      alert('Error saving uploaded image. Please try again.');
    }
  };

  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Photo Gallery
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Capturing Despi's journey and memorable moments on the football pitch
          </p>
        </motion.div>

        {/* Upload Button for Public Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <button
            onClick={() => setShowUploader(true)}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-full font-medium hover:bg-green-700 transition-colors"
          >
            <SafeIcon icon={FiUpload} className="w-5 h-5" />
            Share Your Photo
          </button>
          <p className="text-sm text-gray-500 mt-2">
            <SafeIcon icon={FiClock} className="w-4 h-4 inline mr-1" />
            Uploaded photos will be reviewed before being published
          </p>
        </motion.div>

        {/* Image Uploader Modal */}
        {showUploader && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowUploader(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Share Your Photo</h3>
                <button
                  onClick={() => setShowUploader(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <SafeIcon icon={FiX} className="w-6 h-6" />
                </button>
              </div>
              
              <p className="text-gray-600 mb-4">
                Share your photos of Despi's matches, training, or football moments!
              </p>
              
              <p className="text-sm text-orange-600 mb-6 bg-orange-50 p-3 rounded-lg">
                <SafeIcon icon={FiClock} className="w-4 h-4 inline mr-1" />
                Your photo will be reviewed by an admin before being published in the gallery.
              </p>

              <ImageUploader
                onUploadSuccess={handleUploadSuccess}
                onCancel={() => setShowUploader(false)}
                showRecaptcha={recaptchaSettings.enabled && recaptchaSettings.siteKey}
                recaptchaSettings={recaptchaSettings}
                onRecaptchaChange={handleRecaptchaChange}
                recaptchaValue={recaptchaValue}
              />
            </motion.div>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <motion.div
              key={image.id || index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg"
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold text-lg">{image.title}</h3>
                  {image.isFeatured && (
                    <span className="inline-block bg-green-600 text-white text-xs px-2 py-1 rounded-full mt-1">
                      Featured
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal */}
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="w-full h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-colors"
              >
                <SafeIcon icon={FiX} className="text-white w-6 h-6" />
              </button>
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <h3 className="text-white font-bold text-xl">{selectedImage.title}</h3>
                {selectedImage.isFeatured && (
                  <span className="inline-block bg-green-600 text-white text-sm px-3 py-1 rounded-full mt-2">
                    Featured Photo
                  </span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Gallery;