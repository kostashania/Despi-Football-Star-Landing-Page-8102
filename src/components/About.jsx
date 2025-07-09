import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../lib/supabase';

const { FiMapPin, FiCalendar, FiTrendingUp, FiHeart, FiPlay } = FiIcons;

const About = () => {
  // Calculate Despi's age dynamically based on her birthdate (02/04/2013)
  const [featuredVideo, setFeaturedVideo] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  
  const calculateAge = () => {
    const birthDate = new Date('2013-04-02'); // YYYY-MM-DD format
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    // If birthday hasn't occurred yet this year, subtract 1 from age
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    const fetchFeaturedVideo = async () => {
      try {
        // Fetch a video marked as featured_in_about = true
        const { data, error } = await supabase
          .from('videos_despi_9a7b3c4d2e')
          .select('*')
          .eq('featured_in_about', true)
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching featured video:', error);
          return;
        }

        if (data) {
          setFeaturedVideo(data);
        }
      } catch (error) {
        console.error('Error in fetchFeaturedVideo:', error);
      }
    };

    fetchFeaturedVideo();
  }, []);

  const stats = [
    { icon: FiMapPin, label: 'From', value: 'Chania, Greece' },
    { icon: FiCalendar, label: 'Age', value: `${calculateAge()} Years Old` },
    { icon: FiTrendingUp, label: 'Position', value: 'Forward' },
    { icon: FiHeart, label: 'Passion', value: 'Football' }
  ];

  // Function to extract YouTube video ID from URL
  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            About Despi
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A young football prodigy from Chania, Greece, making waves in the football world with her exceptional skills and dedication to the sport.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {featuredVideo && showVideo ? (
              <div className="relative rounded-2xl shadow-2xl overflow-hidden w-full h-[500px]">
                <iframe
                  src={`https://www.youtube.com/embed/${getYoutubeVideoId(featuredVideo.url) || featuredVideo.youtube_id}?autoplay=1`}
                  title={featuredVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full absolute inset-0"
                ></iframe>
              </div>
            ) : (
              <div className="relative">
                <img 
                  src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1751962901891-blob" 
                  alt="Despi training" 
                  className="rounded-2xl shadow-2xl w-full h-[500px] object-cover" 
                />
                
                {featuredVideo && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl transition-opacity hover:bg-black/40"
                  >
                    <div className="bg-white/90 p-5 rounded-full shadow-lg transform transition-transform hover:scale-110">
                      <SafeIcon icon={FiPlay} className="text-green-600 w-8 h-8" />
                    </div>
                    <span className="sr-only">Play Video</span>
                  </button>
                )}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Rising Football Star
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Despi (Δέσποινα Ασβεστά) is a remarkable young talent from Chania, Greece, who has been making headlines with her incredible football skills at just {calculateAge()} years old. Her dedication to the sport and natural ability have caught the attention of football enthusiasts across Greece.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Known for her amazing goals and technical abilities, Despi represents the future of women's football. Her passion for the game is evident in every match she plays, inspiring young girls everywhere to pursue their football dreams.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-green-50 p-4 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <SafeIcon icon={stat.icon} className="text-green-600 w-5 h-5" />
                    <div>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="font-semibold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;