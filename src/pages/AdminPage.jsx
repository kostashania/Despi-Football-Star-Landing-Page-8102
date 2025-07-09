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
  FiCheck, FiClock, FiEye, FiMail, FiVideo, FiStar, FiCalendar, FiShare2, FiRefreshCw, FiAlertTriangle, FiBell
} = FiIcons;

const AdminPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('messages');
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
  const [bioTimeline, setBioTimeline] = useState([]);
  const [settings, setSettings] = useState({
    recaptcha_enabled: false,
    recaptcha_site_key: '',
    recaptcha_secret_key: '',
    notification_emails: 'despihania@gmail.com',
    email_notifications_enabled: true,
    email_from_address: 'noreply@asvesta.eu',
    social_youtube_url: 'https://www.youtube.com/@despi5740',
    social_instagram_url: 'https://instagram.com/despi_football',
    social_facebook_url: 'https://facebook.com/despi.football'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [emailTestResult, setEmailTestResult] = useState('');
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
  const [currentBioItem, setCurrentBioItem] = useState({
    year: new Date().getFullYear(),
    description: '',
    sort_order: 0
  });

  const tabs = [
    { id: 'messages', label: 'Messages', icon: FiMessageSquare },
    { id: 'pending', label: 'Pending Images', icon: FiClock },
    { id: 'hero', label: 'Hero Section', icon: FiEdit },
    { id: 'bio', label: 'Short Bio', icon: FiCalendar },
    { id: 'gallery', label: 'Gallery', icon: FiImage },
    { id: 'videos', label: 'Videos', icon: FiYoutube },
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
      if (activeTab === 'messages') {
        try {
          setDebugInfo('Fetching messages...');
          
          // Use a simpler query to check if table exists and get messages
          const { data, error } = await supabase
            .from('contact_messages_despi_9a7b3c4d2e')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            if (error.code === 'PGRST116') {
              setDebugInfo('Messages table does not exist. Creating it...');
              // Table doesn't exist, we'll show the empty state
              setMessages([]);
            } else {
              throw error;
            }
          } else {
            setDebugInfo(`Messages fetched successfully: ${data ? data.length : 0}`);
            setMessages(data || []);
          }
        } catch (messagesError) {
          console.error('Error fetching messages:', messagesError);
          setDebugInfo('Error fetching messages: ' + messagesError.message);
          setMessages([]);
        }
      } else if (activeTab === 'pending') {
        try {
          const { data, error } = await supabase
            .from('gallery_images_despi_9a7b3c4d2e')
            .select('*')
            .eq('is_approved', false)
            .order('created_at', { ascending: false });

          if (error && error.code !== 'PGRST116') throw error;
          setPendingImages(data || []);
        } catch (error) {
          console.error('Error fetching pending images:', error);
          setPendingImages([]);
        }
      } else if (activeTab === 'hero') {
        try {
          const { data, error } = await supabase
            .from('hero_content_despi_9a7b3c4d2e')
            .select('*')
            .limit(1)
            .single();

          if (error && error.code !== 'PGRST116') throw error;
          if (data) setHeroContent(data);
        } catch (error) {
          console.error('Error fetching hero content:', error);
        }
      } else if (activeTab === 'bio') {
        try {
          const { data, error } = await supabase
            .from('bio_timeline_despi_9a7b3c4d2e')
            .select('*')
            .order('sort_order', { ascending: true });

          if (error && error.code !== 'PGRST116') throw error;
          setBioTimeline(data || []);
        } catch (error) {
          console.error('Error fetching bio timeline:', error);
          setBioTimeline([]);
        }
      } else if (activeTab === 'gallery') {
        try {
          const { data, error } = await supabase
            .from('gallery_images_despi_9a7b3c4d2e')
            .select('*')
            .eq('is_approved', true)
            .order('sort_order', { ascending: true });

          if (error && error.code !== 'PGRST116') throw error;
          setGalleryImages(data || []);
        } catch (error) {
          console.error('Error fetching gallery images:', error);
          setGalleryImages([]);
        }
      } else if (activeTab === 'videos') {
        try {
          const { data, error } = await supabase
            .from('videos_despi_9a7b3c4d2e')
            .select('*')
            .order('created_at', { ascending: false });

          if (error && error.code !== 'PGRST116') throw error;
          const filteredVideos = (data || []).filter(video => 
            !video.title.toLowerCase().includes('music') && 
            !video.description.toLowerCase().includes('music') && 
            video.youtube_id !== 'dQw4w9WgXcQ'
          );
          setVideos(filteredVideos);
        } catch (error) {
          console.error('Error fetching videos:', error);
          setVideos([]);
        }
      } else if (activeTab === 'settings') {
        try {
          const { data, error } = await supabase
            .from('admin_settings_despi_9a7b3c4d2e')
            .select('*');

          if (error && error.code !== 'PGRST116') throw error;

          const settingsObj = {};
          (data || []).forEach(setting => {
            settingsObj[setting.setting_key] = setting.setting_value;
          });

          setSettings({
            recaptcha_enabled: settingsObj.recaptcha_enabled === 'true',
            recaptcha_site_key: settingsObj.recaptcha_site_key || '',
            recaptcha_secret_key: settingsObj.recaptcha_secret_key || '',
            notification_emails: settingsObj.notification_emails || 'despihania@gmail.com',
            email_notifications_enabled: settingsObj.email_notifications_enabled !== 'false',
            email_from_address: settingsObj.email_from_address || 'noreply@asvesta.eu',
            social_youtube_url: settingsObj.social_youtube_url || 'https://www.youtube.com/@despi5740',
            social_instagram_url: settingsObj.social_instagram_url || 'https://instagram.com/despi_football',
            social_facebook_url: settingsObj.social_facebook_url || 'https://facebook.com/despi.football'
          });
        } catch (error) {
          console.error('Error fetching settings:', error);
        }
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab} data:`, error);
      setDebugInfo(`Error fetching ${activeTab} data: ` + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testEmailFunction = async () => {
    setEmailTestResult('Testing email function...');
    
    try {
      // First try the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: settings.notification_emails.split(',')[0].trim(),
          subject: 'Test Email from Despi\'s Website',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #16a34a, #22c55e); color: white; padding: 20px; border-radius: 10px;">
                <h1 style="margin: 0;">Test Email</h1>
                <p style="margin: 10px 0 0 0;">This is a test email from Despi's website admin panel.</p>
              </div>
              <div style="padding: 20px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
                <p>If you received this email, your email notifications are working correctly!</p>
                <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                  Sent at: ${new Date().toLocaleString()}
                </p>
              </div>
            </div>
          `
        }
      });

      if (error) {
        throw error;
      }

      setEmailTestResult('✅ Test email sent successfully via Supabase Edge Function!');
      
    } catch (supabaseError) {
      console.error('Supabase Edge Function failed:', supabaseError);
      setEmailTestResult('❌ Supabase Edge Function failed: ' + supabaseError.message + 
        '\n\nPossible issues:\n' +
        '1. Edge Function not deployed: Run `supabase functions deploy send-email`\n' +
        '2. RESEND_API_KEY not set in Supabase secrets\n' +
        '3. From email not verified in Resend account\n' +
        '4. CORS configuration error\n\n' +
        'The contact form will still save messages to the database, but email notifications won\'t work until this is fixed.');
    }
    
    // Clear the result after 15 seconds
    setTimeout(() => {
      setEmailTestResult('');
    }, 15000);
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
      const settingsToSave = [
        { setting_key: 'recaptcha_enabled', setting_value: settings.recaptcha_enabled.toString() },
        { setting_key: 'recaptcha_site_key', setting_value: settings.recaptcha_site_key },
        { setting_key: 'recaptcha_secret_key', setting_value: settings.recaptcha_secret_key },
        { setting_key: 'notification_emails', setting_value: settings.notification_emails },
        { setting_key: 'email_notifications_enabled', setting_value: settings.email_notifications_enabled.toString() },
        { setting_key: 'email_from_address', setting_value: settings.email_from_address },
        { setting_key: 'social_youtube_url', setting_value: settings.social_youtube_url },
        { setting_key: 'social_instagram_url', setting_value: settings.social_instagram_url },
        { setting_key: 'social_facebook_url', setting_value: settings.social_facebook_url }
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

  const deleteGalleryImage = async (imageId) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const { error } = await supabase
        .from('gallery_images_despi_9a7b3c4d2e')
        .delete()
        .eq('id', imageId);

      if (error) throw error;
      
      fetchData();
      alert('Image deleted successfully!');
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error deleting image. Please try again.');
    }
  };

  const toggleImageFeatured = async (imageId, currentFeatured) => {
    try {
      const { error } = await supabase
        .from('gallery_images_despi_9a7b3c4d2e')
        .update({ is_featured: !currentFeatured })
        .eq('id', imageId);

      if (error) throw error;
      
      fetchData();
    } catch (error) {
      console.error('Error updating image:', error);
      alert('Error updating image. Please try again.');
    }
  };

  const addVideo = async () => {
    if (!currentVideo.title || !currentVideo.url) {
      alert('Please fill in title and URL');
      return;
    }

    try {
      const extractYoutubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
      };

      const youtubeId = extractYoutubeId(currentVideo.url);
      const thumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : '';

      const { error } = await supabase
        .from('videos_despi_9a7b3c4d2e')
        .insert([{
          ...currentVideo,
          youtube_id: youtubeId,
          thumbnail_url: thumbnailUrl,
          created_at: new Date()
        }]);

      if (error) throw error;
      
      setCurrentVideo({ title: '', description: '', url: '', thumbnail_url: '' });
      fetchData();
      alert('Video added successfully!');
    } catch (error) {
      console.error('Error adding video:', error);
      alert('Error adding video. Please try again.');
    }
  };

  const deleteVideo = async (videoId) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const { error } = await supabase
        .from('videos_despi_9a7b3c4d2e')
        .delete()
        .eq('id', videoId);

      if (error) throw error;
      
      fetchData();
      alert('Video deleted successfully!');
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Error deleting video. Please try again.');
    }
  };

  const markMessageAsRead = async (messageId) => {
    try {
      const { error } = await supabase
        .from('contact_messages_despi_9a7b3c4d2e')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;
      
      fetchData();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const { error } = await supabase
        .from('contact_messages_despi_9a7b3c4d2e')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
      
      fetchData();
      alert('Message deleted successfully!');
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Error deleting message. Please try again.');
    }
  };

  const addBioItem = async () => {
    if (!currentBioItem.year || !currentBioItem.description) {
      alert('Please fill in year and description');
      return;
    }

    try {
      const { error } = await supabase
        .from('bio_timeline_despi_9a7b3c4d2e')
        .insert([{
          ...currentBioItem,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }]);

      if (error) throw error;
      
      setCurrentBioItem({ year: new Date().getFullYear(), description: '', sort_order: 0 });
      fetchData();
      alert('Bio item added successfully!');
    } catch (error) {
      console.error('Error adding bio item:', error);
      alert('Error adding bio item. Please try again.');
    }
  };

  const deleteBioItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this bio item?')) return;

    try {
      const { error } = await supabase
        .from('bio_timeline_despi_9a7b3c4d2e')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      
      fetchData();
      alert('Bio item deleted successfully!');
    } catch (error) {
      console.error('Error deleting bio item:', error);
      alert('Error deleting bio item. Please try again.');
    }
  };

  const toggleBioItemActive = async (itemId, currentActive) => {
    try {
      const { error } = await supabase
        .from('bio_timeline_despi_9a7b3c4d2e')
        .update({ is_active: !currentActive })
        .eq('id', itemId);

      if (error) throw error;
      
      fetchData();
    } catch (error) {
      console.error('Error updating bio item:', error);
      alert('Error updating bio item. Please try again.');
    }
  };

  const createSampleMessage = async () => {
    try {
      setDebugInfo('Creating sample message...');
      
      // Add a sample message
      const sampleMessage = {
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a sample message to test the messages functionality.',
        is_read: false,
        created_at: new Date()
      };
      
      const { data, error } = await supabase
        .from('contact_messages_despi_9a7b3c4d2e')
        .insert([sampleMessage])
        .select();
        
      if (error) throw error;
      
      setDebugInfo('Sample message created successfully: ' + JSON.stringify(data));
      fetchData();
      alert('Sample message added!');
    } catch (error) {
      console.error('Error adding sample message:', error);
      setDebugInfo('Error adding sample message: ' + error.message);
      alert('Error adding sample message. Please try again.');
    }
  };

  const renderMessagesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Contact Messages</h3>
        
        <div className="flex gap-2">
          <button
            onClick={() => fetchData()}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
          >
            <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
            Refresh
          </button>
          
          <button
            onClick={createSampleMessage}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            Add Sample
          </button>
        </div>
      </div>
      
      {debugInfo && (
        <div className="bg-gray-100 p-4 rounded-lg text-xs font-mono whitespace-pre-wrap overflow-auto max-h-40 mb-4">
          <div className="flex justify-between">
            <h4 className="font-bold mb-2">Debug Information</h4>
            <button onClick={() => setDebugInfo('')} className="text-gray-500 hover:text-gray-700">
              <SafeIcon icon={FiX} className="w-4 h-4" />
            </button>
          </div>
          {debugInfo}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <SafeIcon icon={FiRefreshCw} className="w-6 h-6 text-blue-500 animate-spin" />
          <span className="ml-2">Loading messages...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 text-blue-800">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <SafeIcon icon={FiAlertTriangle} className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">No Messages Found</h4>
                  <p className="mb-4">
                    No messages have been submitted through the contact form yet. 
                    You can add a sample message for testing purposes.
                  </p>
                  
                  <div className="bg-white p-4 rounded-lg border border-blue-100 mb-4">
                    <h5 className="font-medium mb-2">Troubleshooting</h5>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Make sure the contact form is working correctly</li>
                      <li>Check if the database table exists and has the correct permissions</li>
                      <li>Verify that anonymous users can insert records</li>
                      <li>Ensure the form is properly connected to the database</li>
                    </ul>
                  </div>
                  
                  <button 
                    onClick={createSampleMessage}
                    className="bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-md text-blue-800 transition-colors flex items-center gap-2"
                  >
                    <SafeIcon icon={FiPlus} className="w-4 h-4" />
                    Add Sample Message
                  </button>
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`bg-white p-4 rounded-lg shadow ${
                !message.is_read ? 'border-l-4 border-blue-400' : ''
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">{message.name}</h4>
                    <p className="text-sm text-gray-600">{message.email}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!message.is_read && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{message.message}</p>
                <div className="flex gap-2">
                  <a
                    href={`mailto:${message.email}`}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 flex items-center gap-1"
                  >
                    <SafeIcon icon={FiMail} className="w-3 h-3" />
                    Reply
                  </a>
                  {!message.is_read && (
                    <button
                      onClick={() => markMessageAsRead(message.id)}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                    >
                      Mark as Read
                    </button>
                  )}
                  <button
                    onClick={() => deleteMessage(message.id)}
                    className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

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

  const renderBioTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Bio Timeline Management</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          {isEditing ? 'Cancel' : 'Add Bio Item'}
        </button>
      </div>

      {isEditing && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="text-lg font-medium mb-4">Add New Bio Item</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                value={currentBioItem.year}
                onChange={(e) => setCurrentBioItem({ ...currentBioItem, year: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="2024"
                min="1900"
                max="2100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={currentBioItem.description}
                onChange={(e) => setCurrentBioItem({ ...currentBioItem, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="3"
                placeholder="Despi joins K10 of Finikas Italian Academy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input
                type="number"
                value={currentBioItem.sort_order}
                onChange={(e) => setCurrentBioItem({ ...currentBioItem, sort_order: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="0"
                min="0"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={addBioItem}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add Bio Item
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <p>Loading bio timeline...</p>
      ) : (
        <div className="space-y-4">
          {bioTimeline.length === 0 ? (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-yellow-800">
              <p className="flex items-center gap-2">
                <SafeIcon icon={FiClock} className="w-5 h-5" />
                No bio items yet. Add your first bio item using the "Add Bio Item" button above.
              </p>
            </div>
          ) : (
            bioTimeline.map((item) => (
              <div key={item.id} className={`bg-white p-4 rounded-lg shadow ${
                !item.is_active ? 'opacity-50' : ''
              }`}>
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full font-medium">
                        {item.year}
                      </span>
                      {!item.is_active && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                          Hidden
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700">{item.description}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      Sort Order: {item.sort_order}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex gap-2">
                    <button
                      onClick={() => toggleBioItemActive(item.id, item.is_active)}
                      className={`px-3 py-1 text-xs rounded ${
                        item.is_active 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {item.is_active ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => deleteBioItem(item.id)}
                      className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  const renderGalleryTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Gallery Management</h3>
      
      {isLoading ? (
        <p>Loading gallery images...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleryImages.length === 0 ? (
            <div className="col-span-full bg-blue-50 p-4 rounded-lg border border-blue-200 text-blue-800">
              <p>No gallery images yet. Approve user-uploaded images or add your own.</p>
            </div>
          ) : (
            galleryImages.map((image) => (
              <div key={image.id} className="bg-white p-4 rounded-lg shadow">
                <div className="relative mb-3">
                  <img
                    src={image.image_url}
                    alt={image.alt_text}
                    className="w-full h-32 object-cover rounded"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/200x128?text=Image';
                    }}
                  />
                  {image.is_featured && (
                    <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                      <SafeIcon icon={FiStar} className="w-3 h-3 inline mr-1" />
                      Featured
                    </span>
                  )}
                </div>
                <h4 className="font-medium mb-2">{image.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{image.alt_text}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleImageFeatured(image.id, image.is_featured)}
                    className={`px-3 py-1 text-xs rounded ${
                      image.is_featured 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {image.is_featured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button
                    onClick={() => deleteGalleryImage(image.id)}
                    className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  const renderVideosTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Video Management</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          {isEditing ? 'Cancel' : 'Add Video'}
        </button>
      </div>

      {isEditing && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="text-lg font-medium mb-4">Add New Video</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={currentVideo.title}
                onChange={(e) => setCurrentVideo({ ...currentVideo, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter video title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={currentVideo.description}
                onChange={(e) => setCurrentVideo({ ...currentVideo, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="3"
                placeholder="Enter video description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
              <input
                type="url"
                value={currentVideo.url}
                onChange={(e) => setCurrentVideo({ ...currentVideo, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={addVideo}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add Video
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <p>Loading videos...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.length === 0 ? (
            <div className="col-span-full bg-blue-50 p-4 rounded-lg border border-blue-200 text-blue-800">
              <p>No videos yet. Add your first video using the "Add Video" button above.</p>
            </div>
          ) : (
            videos.map((video) => (
              <div key={video.id} className="bg-white p-4 rounded-lg shadow">
                <div className="relative mb-3">
                  <img
                    src={video.thumbnail_url || 'https://via.placeholder.com/200x113?text=Video'}
                    alt={video.title}
                    className="w-full h-32 object-cover rounded"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <SafeIcon icon={FiVideo} className="text-white w-8 h-8" />
                  </div>
                </div>
                <h4 className="font-medium mb-2">{video.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{video.description}</p>
                <div className="flex gap-2">
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center gap-1"
                  >
                    <SafeIcon icon={FiExternalLink} className="w-3 h-3" />
                    View
                  </a>
                  <button
                    onClick={() => deleteVideo(video.id)}
                    className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
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
        <h4 className="text-lg font-medium mb-4">Email Notifications</h4>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="email_notifications_enabled"
              checked={settings.email_notifications_enabled}
              onChange={(e) => setSettings({ ...settings, email_notifications_enabled: e.target.checked })}
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
            />
            <label htmlFor="email_notifications_enabled" className="text-sm font-medium text-gray-700">
              Enable email notifications for new contact messages
            </label>
          </div>
          
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
              Separate multiple email addresses with commas. These emails will receive notifications for new messages.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Email Address
            </label>
            <input
              type="email"
              value={settings.email_from_address}
              onChange={(e) => setSettings({ ...settings, email_from_address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="noreply@asvesta.eu"
            />
            <p className="text-xs text-gray-500 mt-1">
              This email address must be verified in your Resend account
            </p>
          </div>
          
          <div className="pt-4 border-t">
            <button
              onClick={testEmailFunction}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <SafeIcon icon={FiBell} className="w-4 h-4" />
              Test Email Function
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Send a test email to verify your email configuration is working
            </p>
            
            {emailTestResult && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <h5 className="font-medium mb-2">Test Results:</h5>
                <pre className="text-xs whitespace-pre-wrap">{emailTestResult}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-lg font-medium mb-4">Social Media URLs</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              YouTube URL
            </label>
            <input
              type="url"
              value={settings.social_youtube_url}
              onChange={(e) => setSettings({ ...settings, social_youtube_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="https://www.youtube.com/@despi5740"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instagram URL
            </label>
            <input
              type="url"
              value={settings.social_instagram_url}
              onChange={(e) => setSettings({ ...settings, social_instagram_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="https://instagram.com/despi_football"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facebook URL
            </label>
            <input
              type="url"
              value={settings.social_facebook_url}
              onChange={(e) => setSettings({ ...settings, social_facebook_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="https://facebook.com/despi.football"
            />
          </div>
        </div>
      </div>

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

              if (checkError && checkError.code !== 'PGRST116') throw checkError;

              let result;
              if (existingData && existingData.length > 0) {
                result = await supabase
                  .from('hero_content_despi_9a7b3c4d2e')
                  .update({
                    ...heroContent,
                    updated_at: new Date()
                  })
                  .eq('id', existingData[0].id);
              } else {
                result = await supabase
                  .from('hero_content_despi_9a7b3c4d2e')
                  .insert([{
                    ...heroContent,
                    created_at: new Date(),
                    updated_at: new Date()
                  }]);
              }

              if (result.error) throw result.error;
              
              alert('Hero content saved successfully!');
            } catch (error) {
              console.error('Error saving hero content:', error);
              alert('Error saving hero content. Please try again. Error: ' + error.message);
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
                    {tab.id === 'messages' && messages.filter(m => !m.is_read).length > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 ml-auto">
                        {messages.filter(m => !m.is_read).length}
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
              {activeTab === 'messages' && renderMessagesTab()}
              {activeTab === 'pending' && renderPendingTab()}
              {activeTab === 'hero' && renderHeroTab()}
              {activeTab === 'bio' && renderBioTab()}
              {activeTab === 'gallery' && renderGalleryTab()}
              {activeTab === 'videos' && renderVideosTab()}
              {activeTab === 'settings' && renderSettingsTab()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;