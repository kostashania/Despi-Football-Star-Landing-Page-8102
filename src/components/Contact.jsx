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
    ensureContactTable();
  }, []);

  const ensureContactTable = async () => {
    try {
      // Check if the table exists
      const { data, error } = await supabase
        .from('contact_messages_despi_9a7b3c4d2e')
        .select('id')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        console.log("Contact messages table doesn't exist. Creating it...");
        
        // Create table with proper RLS
        const createTableQuery = `
          CREATE TABLE IF NOT EXISTS contact_messages_despi_9a7b3c4d2e (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Enable Row Level Security
          ALTER TABLE contact_messages_despi_9a7b3c4d2e ENABLE ROW LEVEL SECURITY;
          
          -- Create policies for authenticated users (admins)
          CREATE POLICY "Allow select for authenticated users" 
            ON contact_messages_despi_9a7b3c4d2e FOR SELECT 
            USING (auth.role() = 'authenticated');
            
          CREATE POLICY "Allow update for authenticated users" 
            ON contact_messages_despi_9a7b3c4d2e FOR UPDATE 
            USING (auth.role() = 'authenticated')
            WITH CHECK (auth.role() = 'authenticated');
            
          CREATE POLICY "Allow delete for authenticated users" 
            ON contact_messages_despi_9a7b3c4d2e FOR DELETE 
            USING (auth.role() = 'authenticated');
          
          -- Create policy for anonymous users to insert messages
          CREATE POLICY "Allow insert for anonymous users" 
            ON contact_messages_despi_9a7b3c4d2e FOR INSERT 
            WITH CHECK (true);
        `;
        
        await supabase.rpc('execute_sql', { query: createTableQuery });
        console.log("Contact messages table created successfully!");
      }
    } catch (error) {
      console.error("Error ensuring contact table exists:", error);
    }
  };

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

  const sendEmailNotification = async (messageData) => {
    try {
      // Get notification settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('admin_settings_despi_9a7b3c4d2e')
        .select('*')
        .in('setting_key', ['notification_emails', 'email_notifications_enabled']);

      if (settingsError) throw settingsError;

      const settings = {};
      settingsData.forEach(setting => {
        settings[setting.setting_key] = setting.setting_value;
      });

      // Check if email notifications are enabled
      if (settings.email_notifications_enabled !== 'true') {
        console.log('Email notifications are disabled');
        return;
      }

      const notificationEmails = settings.notification_emails || 'despihania@gmail.com';
      const emailList = notificationEmails.split(',').map(email => email.trim()).filter(email => email);

      if (emailList.length === 0) {
        console.log('No notification emails configured');
        return;
      }

      // Create HTML email content
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #16a34a, #22c55e); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">New Contact Message</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Despi's Website</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #16a34a; margin-top: 0;">Message Details</h2>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">Name:</strong>
                <div style="margin-top: 5px; padding: 10px; background: #f3f4f6; border-radius: 5px;">
                  ${messageData.name}
                </div>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">Email:</strong>
                <div style="margin-top: 5px; padding: 10px; background: #f3f4f6; border-radius: 5px;">
                  <a href="mailto:${messageData.email}" style="color: #16a34a; text-decoration: none;">
                    ${messageData.email}
                  </a>
                </div>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">Message:</strong>
                <div style="margin-top: 5px; padding: 15px; background: #f3f4f6; border-radius: 5px; line-height: 1.6;">
                  ${messageData.message.replace(/\n/g, '<br>')}
                </div>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">Received:</strong>
                <div style="margin-top: 5px; padding: 10px; background: #f3f4f6; border-radius: 5px;">
                  ${new Date(messageData.created_at).toLocaleString()}
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <a href="${window.location.origin}/#/admin" 
                 style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View in Admin Panel
              </a>
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; text-align: center; color: #6b7280; font-size: 14px;">
              <p>This email was sent automatically from Despi's website contact form.</p>
            </div>
          </div>
        </div>
      `;

      // Send email to each recipient
      for (const email of emailList) {
        try {
          const { data, error } = await supabase.functions.invoke('send-email', {
            body: {
              to: email,
              subject: `New Contact Message from ${messageData.name} - Despi's Website`,
              html: htmlContent
            }
          });

          if (error) {
            console.error('Error sending email to', email, ':', error);
          } else {
            console.log('Email sent successfully to', email);
          }
        } catch (emailError) {
          console.error('Error sending email to', email, ':', emailError);
        }
      }
    } catch (error) {
      console.error('Error in sendEmailNotification:', error);
    }
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

      console.log("Submitting message:", form);

      // Insert the new message directly
      const { data, error } = await supabase
        .from('contact_messages_despi_9a7b3c4d2e')
        .insert([
          {
            name: form.name,
            email: form.email,
            message: form.message,
            is_read: false,
            created_at: new Date()
          }
        ])
        .select();

      if (error) {
        console.error("Insert error:", error);
        throw error;
      }

      console.log("Message submitted successfully:", data);

      // Send email notification
      if (data && data.length > 0) {
        await sendEmailNotification(data[0]);
      }

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
      setErrorMessage('There was a problem submitting your message. Please try again. Error: ' + (error.message || error));
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