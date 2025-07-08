import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../lib/supabase';

const { FiHeart, FiYoutube, FiInstagram, FiFacebook } = FiIcons;

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [socialLinks, setSocialLinks] = useState({
    youtube: 'https://www.youtube.com/@despi5740',
    instagram: 'https://instagram.com/despi_football',
    facebook: 'https://facebook.com/despi.football'
  });

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings_despi_9a7b3c4d2e')
        .select('*')
        .in('setting_key', ['social_youtube_url', 'social_instagram_url', 'social_facebook_url']);

      if (error) throw error;

      const settings = {};
      data.forEach(setting => {
        settings[setting.setting_key] = setting.setting_value;
      });

      setSocialLinks({
        youtube: settings.social_youtube_url || 'https://www.youtube.com/@despi5740',
        instagram: settings.social_instagram_url || 'https://instagram.com/despi_football',
        facebook: settings.social_facebook_url || 'https://facebook.com/despi.football'
      });
    } catch (error) {
      console.error('Error fetching social links:', error);
    }
  };

  const socialLinksArray = [
    { icon: FiYoutube, href: socialLinks.youtube, label: 'YouTube' },
    { icon: FiInstagram, href: socialLinks.instagram, label: 'Instagram' },
    { icon: FiFacebook, href: socialLinks.facebook, label: 'Facebook' }
  ];

  const handleNavClick = (href) => {
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
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center mb-4">
              <img
                src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1751959468570-Despi2.png"
                alt="Despi Logo"
                className="h-12 mr-2 filter brightness-0 invert"
              />
            </div>
            <p className="text-gray-400 mb-4">
              Following the journey of a rising football star from Chania, Greece.
            </p>
            <div className="flex gap-4">
              {socialLinksArray.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                  className="bg-gray-800 p-3 rounded-full hover:bg-gray-700 transition-colors"
                >
                  <SafeIcon icon={social.icon} className="text-gray-400 w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h4 className="text-xl font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNavClick('#home')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('#about')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('#bio')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Bio
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('#skills')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Skills
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('#gallery')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('#videos')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Videos
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('#contact')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contact
                </button>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h4 className="text-xl font-bold mb-4">Contact Info</h4>
            <div className="space-y-2 text-gray-400">
              <p>Chania, Greece</p>
              <p>despihania@gmail.com</p>
              <p>+30 698 414 6197 (Mr Kostas)</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="border-t border-gray-800 mt-8 pt-8 text-center"
        >
          <p className="text-gray-400 flex items-center justify-center gap-2">
            Made with <SafeIcon icon={FiHeart} className="text-red-500" /> for Despi © {currentYear} All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;