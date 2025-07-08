import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../lib/supabase';
import AdminLogin from '../components/AdminLogin';
import { isAuthenticated, logout } from '../utils/auth';

const { FiEdit, FiTrash2, FiSave, FiPlus, FiX, FiMessageSquare, FiYoutube, FiLogOut, FiSettings } = FiIcons;

const AdminPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');
  const [heroContent, setHeroContent] = useState({
    title: 'Meet Despi',
    subtitle: 'Δέσποινα Ασβεστά - A rising star in women\'s football from Chania, Greece. Known for her incredible skills, determination, and passion for the beautiful game.',
    buttonText: 'Watch Highlights',
    buttonLink: '#videos'
  });
  
  const [videos, setVideos] = useState([]);
  const [messages, setMessages] = useState([]);
  const [settings, setSettings] = useState({
    recaptcha_enabled: false,
    recaptcha_site_key: '',
    recaptcha_secret_key: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentVideo, setCurrentVideo] = useState({
    title: '',
    description: '',
    url: '',
    thumbnail_url: ''
  });

  const tabs = [
    { id: 'hero', label: 'Hero Section', icon: FiEdit },
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
      if (activeTab === 'hero') {
        const { data, error } = await supabase
          .from('hero_content_despi_9a7b3c4d2e')
          .select('*')
          .limit(1)
          .single();
          
        if (error && error.code !== 'PGRST116') throw error;
        if (data) setHeroContent(data);
      } 
      else if (activeTab === 'videos') {
        const { data, error } = await supabase
          .from('videos_despi_9a7b3c4d2e')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        // Filter out any unwanted videos
        const filteredVideos = (data || []).filter(video => 
          !video.title.toLowerCase().includes('music') &&
          !video.description.toLowerCase().includes('music') &&
          video.youtube_id !== 'dQw4w9WgXcQ'
        );
        setVideos(filteredVideos);
      }
      else if (activeTab === 'messages') {
        const { data, error } = await supabase
          .from('contact_messages_despi_9a7b3c4d2e')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setMessages(data || []);
      }
      else if (activeTab === 'settings') {
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
          recaptcha_secret_key: settingsObj.recaptcha_secret_key || ''
        });
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab} data:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveHeroContent = async () => {
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
  };

  const saveSettings = async () => {
    try {
      const settingsToSave = [
        { setting_key: 'recaptcha_enabled', setting_value: settings.recaptcha_enabled.toString() },
        { setting_key: 'recaptcha_site_key', setting_value: settings.recaptcha_site_key },
        { setting_key: 'recaptcha_secret_key', setting_value: settings.recaptcha_secret_key }
      ];

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from('admin_settings_despi_9a7b3c4d2e')
          .upsert(setting, { onConflict: 'setting_key' });
          
        if (error) throw error;
      }
      
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    }
  };

  const handleVideoChange = (e) => {
    const { name, value } = e.target;
    setCurrentVideo({
      ...currentVideo,
      [name]: value
    });
  };

  const saveVideo = async (e) => {
    e.preventDefault();
    
    try {
      let youtubeId = null;
      if (currentVideo.url && currentVideo.url.includes('youtube.com')) {
        const urlParams = new URL(currentVideo.url).searchParams;
        youtubeId = urlParams.get('v');
      } else if (currentVideo.url && currentVideo.url.includes('youtu.be')) {
        youtubeId = currentVideo.url.split('/').pop();
      }
      
      // Prevent adding music videos or unwanted content
      if (currentVideo.title.toLowerCase().includes('music') || 
          currentVideo.description.toLowerCase().includes('music') ||
          youtubeId === 'dQw4w9WgXcQ') {
        alert('This video cannot be added. Please select a football-related video.');
        return;
      }
      
      const videoData = {
        ...currentVideo,
        youtube_id: youtubeId,
        thumbnail_url: currentVideo.thumbnail_url || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : null),
        created_at: new Date()
      };
      
      let result;
      
      if (currentVideo.id) {
        result = await supabase
          .from('videos_despi_9a7b3c4d2e')
          .update(videoData)
          .eq('id', currentVideo.id);
      } else {
        result = await supabase
          .from('videos_despi_9a7b3c4d2e')
          .insert([videoData]);
      }
      
      if (result.error) throw result.error;
      
      setCurrentVideo({
        title: '',
        description: '',
        url: '',
        thumbnail_url: ''
      });
      setIsEditing(false);
      fetchData();
      
    } catch (error) {
      console.error('Error saving video:', error);
      alert('Error saving video. Please try again.');
    }
  };

  const editVideo = (video) => {
    setCurrentVideo(video);
    setIsEditing(true);
  };

  const deleteVideo = async (id) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    
    try {
      const { error } = await supabase
        .from('videos_despi_9a7b3c4d2e')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      fetchData();
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Error deleting video. Please try again.');
    }
  };

  const deleteMessage = async (id) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      const { error } = await supabase
        .from('contact_messages_despi_9a7b3c4d2e')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      fetchData();
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Error deleting message. Please try again.');
    }
  };

  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

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
            onChange={(e) => setHeroContent({...heroContent, title: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
          <textarea 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows="4"
            value={heroContent.subtitle}
            onChange={(e) => setHeroContent({...heroContent, subtitle: e.target.value})}
          ></textarea>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={heroContent.buttonText}
            onChange={(e) => setHeroContent({...heroContent, buttonText: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={heroContent.buttonLink}
            onChange={(e) => setHeroContent({...heroContent, buttonLink: e.target.value})}
          />
        </div>
      </div>
      
      <div className="pt-4">
        <button 
          onClick={saveHeroContent}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
        >
          <SafeIcon icon={FiSave} />
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderVideosTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Manage Videos</h3>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
          >
            <SafeIcon icon={FiPlus} />
            Add New Video
          </button>
        )}
      </div>
      
      {isEditing && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <form onSubmit={saveVideo} className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">{currentVideo.id ? 'Edit Video' : 'Add New Video'}</h4>
              <button 
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setCurrentVideo({
                    title: '',
                    description: '',
                    url: '',
                    thumbnail_url: ''
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <SafeIcon icon={FiX} />
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input 
                type="text" 
                name="title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={currentVideo.title}
                onChange={handleVideoChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                name="description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="3"
                value={currentVideo.description}
                onChange={handleVideoChange}
                required
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
              <input 
                type="url" 
                name="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={currentVideo.url}
                onChange={handleVideoChange}
                required
                placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
              />
              <p className="text-xs text-gray-500 mt-1">Enter full YouTube URL (football-related videos only)</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL (optional)</label>
              <input 
                type="url" 
                name="thumbnail_url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={currentVideo.thumbnail_url || ''}
                onChange={handleVideoChange}
                placeholder="Leave blank to use YouTube thumbnail"
              />
            </div>
            
            <div className="pt-2">
              <button 
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
              >
                <SafeIcon icon={FiSave} />
                {currentVideo.id ? 'Update Video' : 'Save Video'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {isLoading ? (
        <p>Loading videos...</p>
      ) : (
        <div className="space-y-4">
          {videos.length === 0 ? (
            <p className="text-gray-500">No videos added yet.</p>
          ) : (
            videos.map(video => (
              <div key={video.id} className="bg-white p-4 rounded-lg shadow flex gap-4">
                <div className="flex-shrink-0 w-32">
                  <img 
                    src={video.thumbnail_url || `https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-20 object-cover rounded"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/120x80?text=Video';
                    }}
                  />
                </div>
                <div className="flex-grow">
                  <h4 className="font-medium">{video.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(video.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex-shrink-0 flex gap-2">
                  <button 
                    onClick={() => editVideo(video)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <SafeIcon icon={FiEdit} />
                  </button>
                  <button 
                    onClick={() => deleteVideo(video.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <SafeIcon icon={FiTrash2} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  const renderMessagesTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Contact Messages</h3>
      
      {isLoading ? (
        <p>Loading messages...</p>
      ) : (
        <div className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-gray-500">No messages received yet.</p>
          ) : (
            messages.map(message => (
              <div key={message.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between">
                  <h4 className="font-medium">{message.name}</h4>
                  <button 
                    onClick={() => deleteMessage(message.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm text-gray-600">{message.email}</div>
                <div className="text-xs text-gray-500 mb-2">
                  {new Date(message.created_at).toLocaleString()}
                </div>
                <p className="text-gray-800 border-t pt-2 mt-2">{message.message}</p>
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
              onChange={(e) => setSettings({...settings, recaptcha_enabled: e.target.checked})}
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
            />
            <label htmlFor="recaptcha_enabled" className="text-sm font-medium text-gray-700">
              Enable reCAPTCHA for contact form
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              reCAPTCHA Site Key
            </label>
            <input
              type="text"
              value={settings.recaptcha_site_key}
              onChange={(e) => setSettings({...settings, recaptcha_site_key: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter your reCAPTCHA site key"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              reCAPTCHA Secret Key
            </label>
            <input
              type="password"
              value={settings.recaptcha_secret_key}
              onChange={(e) => setSettings({...settings, recaptcha_secret_key: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter your reCAPTCHA secret key"
            />
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
    </div>
  );

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
              {activeTab === 'hero' && renderHeroTab()}
              {activeTab === 'videos' && renderVideosTab()}
              {activeTab === 'messages' && renderMessagesTab()}
              {activeTab === 'settings' && renderSettingsTab()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;