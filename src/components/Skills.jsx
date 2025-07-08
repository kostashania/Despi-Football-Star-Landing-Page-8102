import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiTarget, FiZap, FiTrendingUp, FiHeart, FiAward, FiStar } = FiIcons;

const Skills = () => {
  const skills = [
    {
      icon: FiTarget,
      title: 'Goal Scoring',
      description: 'Exceptional ability to find the back of the net with precision and power',
      level: 95
    },
    {
      icon: FiZap,
      title: 'Speed & Agility',
      description: 'Lightning-fast movements and quick directional changes',
      level: 90
    },
    {
      icon: FiTrendingUp,
      title: 'Technical Skills',
      description: 'Outstanding ball control, dribbling, and passing abilities',
      level: 88
    },
    {
      icon: FiHeart,
      title: 'Passion',
      description: 'Unwavering dedication and love for the beautiful game',
      level: 100
    },
    {
      icon: FiAward,
      title: 'Leadership',
      description: 'Natural leader on and off the pitch, inspiring teammates',
      level: 85
    },
    {
      icon: FiStar,
      title: 'Match Impact',
      description: 'Consistent game-changing performances and clutch moments',
      level: 92
    }
  ];

  return (
    <section id="skills" className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Skills & Abilities
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Despi's remarkable football skills that make her stand out on the pitch
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <SafeIcon icon={skill.icon} className="text-green-600 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{skill.title}</h3>
              </div>
              
              <p className="text-gray-600 mb-4">{skill.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Skill Level</span>
                  <span className="text-sm font-bold text-green-600">{skill.level}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;