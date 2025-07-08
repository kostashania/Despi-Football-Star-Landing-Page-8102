import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../lib/supabase';

const { FiPlay, FiExternalLink, FiYoutube } = FiIcons;

const Videos = () => {
  const [videos, setVideos] = useState([
    {
      id: '6sfCZhgX5jA',
      title: 'Amazing Skills Showcase',
      description: 'Watch Despi demonstrate her incredible football skills and techniques',
      thumbnail: 'https://img.youtube.com/vi/6sfCZhgX5jA/maxresdefault.jpg'
    }
  ]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('videos_despi_9a7b3c4d2e')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (data && data.length > 0) {
          // Filter out unwanted videos and only show football-related content
          const filteredVideos = data.filter(video => 
            !video.title.toLowerCase().includes('music') &&
            !video.description.toLowerCase().includes('music') &&
            video.youtube_id !== 'dQw4w9WgXcQ'
          );
          setVideos(filteredVideos);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, []);

  const extractYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getYouTubeThumbnail = (videoId) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  return (
    <section id="videos" className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Video Highlights
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Watch Despi in action - her best goals, skills, and memorable moments
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {videos.map((video, index) => {
            const videoId = video.youtube_id || extractYoutubeId(video.url) || video.id;
            const thumbnailUrl = video.thumbnail_url || getYouTubeThumbnail(videoId);

            return (
              <motion.div
                key={videoId || index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="relative group">
                  <img
                    src={thumbnailUrl}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => window.open(video.url || `https://www.youtube.com/watch?v=${videoId}`, '_blank')}
                      className="bg-red-600 text-white p-4 rounded-full hover:bg-red-700 transition-colors"
                    >
                      <SafeIcon icon={FiPlay} className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{video.title}</h3>
                  <p className="text-gray-600 mb-4">{video.description}</p>
                  <button
                    onClick={() => window.open(video.url || `https://www.youtube.com/watch?v=${videoId}`, '_blank')}
                    className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                  >
                    Watch Video <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <button
            onClick={() => window.open('https://www.youtube.com/@despi5740', '_blank')}
            className="inline-flex items-center gap-3 bg-red-600 text-white px-8 py-4 rounded-full font-medium hover:bg-red-700 transition-colors"
          >
            <SafeIcon icon={FiYoutube} className="w-6 h-6" />
            Visit YouTube Channel
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Videos;