import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMapPin, FiCalendar, FiTrendingUp, FiHeart } = FiIcons;

const About = () => {
  const stats = [
    {
      icon: FiMapPin,
      label: 'From',
      value: 'Chania, Greece'
    },
    {
      icon: FiCalendar,
      label: 'Age',
      value: '10 Years Old'
    },
    {
      icon: FiTrendingUp,
      label: 'Position',
      value: 'Forward'
    },
    {
      icon: FiHeart,
      label: 'Passion',
      value: 'Football'
    }
  ];

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
          >
            <img
              src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1751962901891-blob"
              alt="Despi training"
              className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
            />
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
              Despi (Δέσποινα Ασβεστά) is a remarkable young talent from Chania, Greece, who has been making headlines with her incredible football skills at just 10 years old. Her dedication to the sport and natural ability have caught the attention of football enthusiasts across Greece.
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