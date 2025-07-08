import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../lib/supabase';
import AdminLogin from '../components/AdminLogin';
import ImageUploader from '../components/ImageUploader';
import { isAuthenticated, logout } from '../utils/auth';
import { validateImageUrl } from '../utils/imageUpload';

const { 
  FiEdit, FiTrash2, FiSave, FiPlus, FiX, FiMessageSquare, FiYoutube, FiLogOut, 
  FiSettings, FiImage, FiArrowUp, FiArrowDown, FiUpload, FiExternalLink, FiLink,
  FiCheck, FiClock, FiEye, FiMail
} = FiIcons;

const AdminPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [heroContent, setHeroContent] = useState({
    title: 'Meet Despi',
    subtitle: 'Δέσποινα Ασβεστά - A rising star in women\'s football from Chania, Greece. Known for her incredible skills, determination, and passion for the beautiful game.',
    buttonText: 'Watch Highlights',
    buttonLink: '#videos'
  });
  const [videos, setVideos] = useState([]);
  const [messages, setMessages] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [pendingImages, setPendingImages] = useState([]);
  const [settings, setSettings] = useState({
    recaptcha_enabled: false,
    recaptcha_site_key: '',
    recaptcha_secret_key: '',
    notification_emails: 'despihania@gmail.com'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentVideo, setCurrentVideo] = useState({
    title: '',
    description: '',
    url: '',
    thumbnail_url: ''
  });
  const [currentImage, setCurrentImage] = useState({
    title: '',
    alt_text: '',
    image_url: '',
    is_featured: false
  });

  const tabs = [
    { id: 'pending', label: 'Pending Images', icon: FiClock },
    { id: 'hero', label: 'Hero Section', icon: FiEdit },
    { id: 'gallery', label: 'Gallery', icon: FiImage },
    { id: 'videos', label: 'Videos', icon: FiYoutube },
    { id: 'messages', label: 'Messages', icon: FiMessageSquare },
    { id: 'settings', label: 'Settings', icon: FiSettings }
  ];

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [activeTab, isLoggedIn]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'pending') {
        const { data, error } = await supabase
          .from('gallery_images_despi_9a7b3c4d2e')
          .select('*')
          .eq('is_approved', false)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPendingImages(data || []);
      } else if (activeTab === 'hero') {
        const { data, error } = await supabase
          .from('hero_content_despi_9a7b3c4d2e')
          .select('*')
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (data) setHeroContent(data);
      } else if (activeTab === 'gallery') {
        const { data, error } = await supabase
          .from('gallery_images_despi_9a7b3c4d2e')
          .select('*')
          .eq('is_approved', true)
          .order('sort_order', { ascending: true });

        if (error) throw error;
        setGalleryImages(data || []);
      } else if (activeTab === 'videos') {
        const { data, error } = await supabase
          .from('videos_despi_9a7b3c4d2e')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        const filteredVideos = (data || []).filter(video => 
          !video.title.toLowerCase().includes('music') && 
          !video.description.toLowerCase().includes('music') && 
          video.youtube_id !== 'dQw4w9WgXcQ'
        );
        setVideos(filteredVideos);
      } else if (activeTab === 'messages') {
        const { data, error } = await supabase
          .from('contact_messages_despi_9a7b3c4d2e')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMessages(data || []);
      } else if (activeTab === 'settings') {
        try {
          await supabase.query(`
            CREATE TABLE IF NOT EXISTS admin_settings_despi_9a7b3c4d2e (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              setting_key TEXT UNIQUE NOT NULL,
              setting_value TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
          `);

          const { data, error } = await supabase
            .from('admin_settings_despi_9a7b3c4d2e')
            .select('*');

          if (error) throw error;

          const settingsObj = {};
          (data || []).forEach(setting => {
            settingsObj[setting.setting_key] = setting.setting_value;
          });

          setSettings({
            recaptcha_enabled: settingsObj.recaptcha_enabled === 'true',
            recaptcha_site_key: settingsObj.recaptcha_site_key || '',
            recaptcha_secret_key: settingsObj.recaptcha_secret_key || '',
            notification_emails: settingsObj.notification_emails || 'despihania@gmail.com'
          });
        } catch (error) {
          console.error('Error fetching settings:', error);
        }
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab} data:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const approveImage = async (imageId) => {
    try {
      const { error } = await supabase
        .from('gallery_images_despi_9a7b3c4d2e')
        .update({ 
          is_approved: true, 
          upload_status: 'approved',
          updated_at: new Date()
        })
        .eq('id', imageId);

      if (error) throw error;
      
      fetchData();
      alert('Image approved successfully!');
    } catch (error) {
      console.error('Error approving image:', error);
      alert('Error approving image. Please try again.');
    }
  };

  const rejectImage = async (imageId) => {
    if (!confirm('Are you sure you want to reject this image? This will permanently delete it.')) return;

    try {
      const { error } = await supabase
        .from('gallery_images_despi_9a7b3c4d2e')
        .delete()
        .eq('id', imageId);

      if (error) throw error;
      
      fetchData();
      alert('Image rejected and deleted.');
    } catch (error) {
      console.error('Error rejecting image:', error);
      alert('Error rejecting image. Please try again.');
    }
  };

  const saveSettings = async () => {
    try {
      try {
        await supabase.query(`
          CREATE TABLE IF NOT EXISTS admin_settings_despi_9a7b3c4d2e (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            setting_key TEXT UNIQUE NOT NULL,
            setting_value TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
        `);
      } catch (error) {
        console.error('Error ensuring admin_settings table exists:', error);
      }

      const settingsToSave = [
        { setting_key: 'recaptcha_enabled', setting_value: settings.recaptcha_enabled.toString() },
        { setting_key: 'recaptcha_site_key', setting_value: settings.recaptcha_site_key },
        { setting_key: 'recaptcha_secret_key', setting_value: settings.recaptcha_secret_key },
        { setting_key: 'notification_emails', setting_value: settings.notification_emails }
      ];

      for (const setting of settingsToSave) {
        const { data, error: checkError } = await supabase
          .from('admin_settings_despi_9a7b3c4d2e')
          .select('id')
          .eq('setting_key', setting.setting_key)
          .single();

        let result;
        if (data) {
          result = await supabase
            .from('admin_settings_despi_9a7b3c4d2e')
            .update({ setting_value: setting.setting_value })
            .eq('setting_key', setting.setting_key);
        } else {
          result = await supabase
            .from('admin_settings_despi_9a7b3c4d2e')
            .insert([setting]);
        }

        if (result.error) throw result.error;
      }

      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(`Error saving settings: ${error.message || 'Please try again.'}`);
    }
  };

  const renderPendingTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Pending Image Approvals</h3>
      
      {isLoading ? (
        <p>Loading pending images...</p>
      ) : (
        <div className="space-y-4">
          {pendingImages.length === 0 ? (
            <p className="text-gray-500">No pending images for approval.</p>
          ) : (
            pendingImages.map((image) => (
              <div key={image.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-400">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-40">
                    <img
                      src={image.image_url}
                      alt={image.alt_text}
                      className="w-full h-24 object-cover rounded"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/160x96?text=Image';
                      }}
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{image.title}</h4>
                      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                        Pending Approval
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{image.alt_text}</p>
                    <div className="text-xs text-gray-500">
                      Uploaded: {new Date(image.created_at).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Uploaded by: {image.uploaded_by || 'Unknown'}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex flex-col gap-2">
                    <button
                      onClick={() => approveImage(image.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                    >
                      <SafeIcon icon={FiCheck} className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => rejectImage(image.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
                    >
                      <SafeIcon icon={FiX} className="w-4 h-4" />
                      Reject
                    </button>
                    <a
                      href={image.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                    >
                      <SafeIcon icon={FiEye} className="w-4 h-4" />
                      View
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Website Settings</h3>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-lg font-medium mb-4">reCAPTCHA Settings</h4>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="recaptcha_enabled"
              checked={settings.recaptcha_enabled}
              onChange={(e) => setSettings({ ...settings, recaptcha_enabled: e.target.checked })}
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
            />
            <label htmlFor="recaptcha_enabled" className="text-sm font-medium text-gray-700">
              Enable reCAPTCHA for contact form and image uploads
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              reCAPTCHA Site Key
            </label>
            <input
              type="text"
              value={settings.recaptcha_site_key}
              onChange={(e) => setSettings({ ...settings, recaptcha_site_key: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter your reCAPTCHA site key"
            />
            <p className="text-xs text-gray-500 mt-1">
              Get your site key from{' '}
              <a
                href="https://www.google.com/recaptcha/admin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google reCAPTCHA Admin
              </a>
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              reCAPTCHA Secret Key
            </label>
            <input
              type="password"
              value={settings.recaptcha_secret_key}
              onChange={(e) => setSettings({ ...settings, recaptcha_secret_key: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter your reCAPTCHA secret key"
              autoComplete="new-password"
            />
            <p className="text-xs text-gray-500 mt-1">
              This is used for server-side verification
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-lg font-medium mb-4">Email Notifications</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notification Email Addresses
            </label>
            <input
              type="text"
              value={settings.notification_emails}
              onChange={(e) => setSettings({ ...settings, notification_emails: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="email1@example.com, email2@example.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple email addresses with commas. These emails will receive notifications for new messages and image uploads.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={saveSettings}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
        >
          <SafeIcon icon={FiSave} />
          Save Settings
        </button>
      </div>
    </div>
  );

  // Keep existing render methods for other tabs...
  const renderHeroTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Edit Hero Content</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={heroContent.title}
            onChange={(e) => setHeroContent({ ...heroContent, title: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows="4"
            value={heroContent.subtitle}
            onChange={(e) => setHeroContent({ ...heroContent, subtitle: e.target.value })}
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={heroContent.buttonText}
            onChange={(e) => setHeroContent({ ...heroContent, buttonText: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={heroContent.buttonLink}
            onChange={(e) => setHeroContent({ ...heroContent, buttonLink: e.target.value })}
          />
        </div>
      </div>
      <div className="pt-4">
        <button
          onClick={async () => {
            try {
              const { data: existingData, error: checkError } = await supabase
                .from('hero_content_despi_9a7b3c4d2e')
                .select('id')
                .limit(1);

              if (checkError) throw checkError;

              let result;
              if (existingData && existingData.length > 0) {
                result = await supabase
                  .from('hero_content_despi_9a7b3c4d2e')
                  .update(heroContent)
                  .eq('id', existingData[0].id);
              } else {
                result = await supabase
                  .from('hero_content_despi_9a7b3c4d2e')
                  .insert([heroContent]);
              }

              if (result.error) throw result.error;
              alert('Hero content saved successfully!');
            } catch (error) {
              console.error('Error saving hero content:', error);
              alert('Error saving hero content. Please try again.');
            }
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
        >
          <SafeIcon icon={FiSave} />
          Save Changes
        </button>
      </div>
    </div>
  );

  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-16 pb-12">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-64 bg-gray-800 text-white p-6">
              <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
              <nav className="space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-green-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <SafeIcon icon={tab.icon} />
                    {tab.label}
                    {tab.id === 'pending' && pendingImages.length > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-auto">
                        {pendingImages.length}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
              <div className="mt-auto pt-6 border-t border-gray-700 mt-6 space-y-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-700"
                >
                  <SafeIcon icon={FiLogOut} />
                  Logout
                </button>
                <a
                  href="/"
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-700"
                >
                  <span>Return to Website</span>
                </a>
              </div>
            </div>
            <div className="flex-1 p-6">
              {activeTab === 'pending' && renderPendingTab()}
              {activeTab === 'hero' && renderHeroTab()}
              {activeTab === 'settings' && renderSettingsTab()}
              {/* Add other existing render methods here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;