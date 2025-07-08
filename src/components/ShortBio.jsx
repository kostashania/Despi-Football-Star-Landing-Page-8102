import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../lib/supabase';

const { FiCalendar, FiTrendingUp } = FiIcons;

const ShortBio = () => {
  const [bioTimeline, setBioTimeline] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBioTimeline();
  }, []);

  const fetchBioTimeline = async () => {
    try {
      const { data, error } = await supabase
        .from('bio_timeline_despi_9a7b3c4d2e')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setBioTimeline(data || []);
    } catch (error) {
      console.error('Error fetching bio timeline:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!bioTimeline || bioTimeline.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Short Bio
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Key milestones in Despi's football journey
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-green-200"></div>
            
            {bioTimeline.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="relative flex items-start mb-8 last:mb-0"
              >
                {/* Timeline dot */}
                <div className="flex-shrink-0 w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg z-10">
                  {item.year}
                </div>
                
                {/* Content */}
                <div className="ml-8 flex-grow">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 + 0.2 }}
                    className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <SafeIcon icon={FiCalendar} className="text-green-600 w-5 h-5" />
                      <span className="text-green-600 font-semibold">{item.year}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{item.description}</p>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShortBio;