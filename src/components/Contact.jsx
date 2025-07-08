import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../lib/supabase';
import ReCAPTCHA from 'react-google-recaptcha';

const { FiMail, FiPhone, FiMapPin, FiYoutube, FiInstagram, FiFacebook, FiCheck } = FiIcons;

const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [recaptchaSettings, setRecaptchaSettings] = useState({
    enabled: false,
    siteKey: ''
  });
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  const [socialLinks, setSocialLinks] = useState({
    youtube: 'https://www.youtube.com/@despi5740',
    instagram: 'https://instagram.com/despi_football',
    facebook: 'https://facebook.com/despi.football'
  });

  const contactInfo = [
    { icon: FiMapPin, label: 'Location', value: 'Chania, Greece' },
    { icon: FiMail, label: 'Email', value: 'despihania@gmail.com' },
    { icon: FiPhone, label: 'Phone', value: '+30 698 414 6197 (Mr Kostas)' }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings_despi_9a7b3c4d2e')
        .select('*')
        .in('setting_key', [
          'recaptcha_enabled', 
          'recaptcha_site_key',
          'social_youtube_url',
          'social_instagram_url',
          'social_facebook_url'
        ]);

      if (error) throw error;

      const settings = {};
      data.forEach(setting => {
        settings[setting.setting_key] = setting.setting_value;
      });

      setRecaptchaSettings({
        enabled: settings.recaptcha_enabled === 'true',
        siteKey: settings.recaptcha_site_key || ''
      });

      setSocialLinks({
        youtube: settings.social_youtube_url || 'https://www.youtube.com/@despi5740',
        instagram: settings.social_instagram_url || 'https://instagram.com/despi_football',
        facebook: settings.social_facebook_url || 'https://facebook.com/despi.football'
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const socialLinksArray = [
    { icon: FiYoutube, href: socialLinks.youtube, label: 'YouTube' },
    { icon: FiInstagram, href: socialLinks.instagram, label: 'Instagram' },
    { icon: FiFacebook, href: socialLinks.facebook, label: 'Facebook' }
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRecaptchaChange = (value) => {
    setRecaptchaValue(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Check if reCAPTCHA is enabled and verify it
      if (recaptchaSettings.enabled && recaptchaSettings.siteKey) {
        if (!recaptchaValue) {
          throw new Error('Please complete the reCAPTCHA verification');
        }
      }

      // First, check if the table exists
      const { data: tableCheck, error: tableCheckError } = await supabase
        .from('contact_messages_despi_9a7b3c4d2e')
        .select('id')
        .limit(1);

      // If the table doesn't exist, create it
      if (tableCheckError && tableCheckError.code === 'PGRST116') {
        const createTableQuery = `
          CREATE TABLE IF NOT EXISTS contact_messages_despi_9a7b3c4d2e (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          ALTER TABLE contact_messages_despi_9a7b3c4d2e ENABLE ROW LEVEL SECURITY;
          CREATE POLICY "Allow all operations for authenticated users" ON contact_messages_despi_9a7b3c4d2e 
            USING (auth.role() = 'authenticated')
            WITH CHECK (auth.role() = 'authenticated');
          CREATE POLICY "Allow insert for anonymous users" ON contact_messages_despi_9a7b3c4d2e 
            FOR INSERT WITH CHECK (true);
        `;
        
        await supabase.rpc('execute_sql', { query: createTableQuery });
      }

      // Insert the new message
      const { error } = await supabase
        .from('contact_messages_despi_9a7b3c4d2e')
        .insert([
          {
            name: form.name,
            email: form.email,
            message: form.message,
            is_read: false,
            created_at: new Date()
          }
        ]);

      if (error) throw error;

      console.log("Message submitted successfully!");
      setSubmitSuccess(true);
      setForm({ name: '', email: '', message: '' });

      // Reset reCAPTCHA if enabled
      if (recaptchaSettings.enabled && window.grecaptcha) {
        window.grecaptcha.reset();
        setRecaptchaValue(null);
      }

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage('There was a problem submitting your message. Please try again. Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Get In Touch
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with Despi and follow her football journey
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Contact Information
            </h3>

            {contactInfo.map((info, index) => (
              <motion.div
                key={info.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="bg-green-100 p-3 rounded-full">
                  <SafeIcon icon={info.icon} className="text-green-600 w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{info.label}</p>
                  <p className="font-semibold text-gray-900">{info.value}</p>
                </div>
              </motion.div>
            ))}

            <div className="pt-8">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Follow Despi</h4>
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
                    className="bg-green-100 p-3 rounded-full hover:bg-green-200 transition-colors"
                  >
                    <SafeIcon icon={social.icon} className="text-green-600 w-6 h-6" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-2xl"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Send a Message
            </h3>

            {submitSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-100 p-4 rounded-lg flex items-center gap-3 mb-6"
              >
                <SafeIcon icon={FiCheck} className="text-green-600 w-5 h-5" />
                <p className="text-green-800">Thank you! Your message has been sent successfully.</p>
              </motion.div>
            )}

            {errorMessage && (
              <div className="bg-red-100 p-4 rounded-lg text-red-800 mb-6">
                {errorMessage}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  rows="4"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Your message"
                ></textarea>
              </div>

              {recaptchaSettings.enabled && recaptchaSettings.siteKey && (
                <div className="flex justify-center">
                  <ReCAPTCHA
                    sitekey={recaptchaSettings.siteKey}
                    onChange={handleRecaptchaChange}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || (recaptchaSettings.enabled && !recaptchaValue)}
                className={`w-full ${
                  isSubmitting || (recaptchaSettings.enabled && !recaptchaValue)
                    ? 'bg-gray-400'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white py-3 rounded-lg font-medium transition-colors relative`}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;