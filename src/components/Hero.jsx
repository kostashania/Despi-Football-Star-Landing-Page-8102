import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../lib/supabase';

const { FiPlay, FiStar, FiTarget } = FiIcons;

const Hero = () => {
  const [heroData, setHeroData] = useState({
    title: 'Meet Despi',
    subtitle: 'Δέσποινα Ασβεστά - A rising star in women\'s football from Chania, Greece. Known for her incredible skills, determination, and passion for the beautiful game.',
    buttonText: 'Watch Highlights',
    buttonLink: '#videos'
  });

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const { data, error } = await supabase
          .from('hero_content_despi_9a7b3c4d2e')
          .select('*')
          .limit(1)
          .single();

        if (error) throw error;
        if (data) setHeroData(data);
      } catch (error) {
        console.error('Error fetching hero data:', error);
      }
    };

    fetchHeroData();
  }, []);

  const handleButtonClick = (href) => {
    const element = document.querySelector(href);
    if (element) {
      const headerHeight = 80;
      const elementPosition = element.offsetTop - headerHeight;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="home" className="pt-20 pb-16 min-h-screen flex items-center">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6">
              <img
                src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1751959468570-Despi2.png"
                alt="Despi Logo"
                className="h-24 object-contain"
              />
            </div>

            <motion.h1
              className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {heroData.title.split(' ').map((word, index) => (
                <span key={index} className={index === 1 ? "text-green-600" : ""}>
                  {word}{' '}
                </span>
              ))}
            </motion.h1>

            <motion.p
              className="text-xl text-gray-600 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {heroData.subtitle}
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
                <SafeIcon icon={FiStar} className="text-green-600" />
                <span className="text-green-800 font-medium">Rising Star</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full">
                <SafeIcon icon={FiTarget} className="text-blue-600" />
                <span className="text-blue-800 font-medium">Goal Scorer</span>
              </div>
            </motion.div>

            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <button
                onClick={() => handleButtonClick(heroData.buttonLink)}
                className="bg-green-600 text-white px-8 py-3 rounded-full font-medium hover:bg-green-700 transition-colors"
              >
                {heroData.buttonText}
              </button>
              <button
                onClick={() => handleButtonClick('#about')}
                className="border-2 border-green-600 text-green-600 px-8 py-3 rounded-full font-medium hover:bg-green-600 hover:text-white transition-colors"
              >
                Learn More
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10">
              <img
                src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1751959485547-blob"
                alt="Despi Football Player"
                className="rounded-2xl shadow-2xl w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 to-transparent rounded-2xl"></div>
            </div>

            {/* Floating elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-4 -left-4 bg-white p-4 rounded-full shadow-lg"
            >
              <SafeIcon icon={FiPlay} className="text-green-600 w-6 h-6" />
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-4 -right-4 bg-green-600 p-4 rounded-full shadow-lg"
            >
              <SafeIcon icon={FiStar} className="text-white w-6 h-6" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;