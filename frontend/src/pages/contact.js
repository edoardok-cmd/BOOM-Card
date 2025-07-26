import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';

export default function Contact() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement form submission
    alert(t('contact.form.success') || 'Thank you for contacting us!');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">{t('contact.title') || 'Contact Us'}</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('contact.form.name') || 'Your Name'}
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('contact.form.email') || 'Email Address'}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('contact.form.subject') || 'Subject'}
            </label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="general">{t('contact.form.subjects.general') || 'General Inquiry'}</option>
              <option value="support">{t('contact.form.subjects.support') || 'Support'}</option>
              <option value="partnership">{t('contact.form.subjects.partnership') || 'Partnership'}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('contact.form.message') || 'Message'}
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          
          <button
            type="submit"
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700"
          >
            {t('contact.form.send') || 'Send Message'}
          </button>
        </form>
      </div>
    </Layout>
  );
}