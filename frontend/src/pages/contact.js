import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';

export default function Contact() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name,
    email,
    subject,
    message
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO
    alert(t('contact.form.success') || 'Thank you for contacting us! We will get back to you soon.');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    
      {/* Hero Section */}

            {t('contact.hero.subtitle') || 'We\'re here to help and answer any questions you might have'}

      {/* Contact Form and Info */}

                {t('contact.form.title') || 'Send us a message'}

                    {t('contact.form.name') || 'Your Name'}

                    {t('contact.form.email') || 'Email Address'}

                    {t('contact.form.subject') || 'Subject'}

                    {t('contact.form.subjects.general') || 'General Inquiry'}
                    {t('contact.form.subjects.support') || 'Technical Support'}
                    {t('contact.form.subjects.billing') || 'Billing Question'}
                    {t('contact.form.subjects.partnership') || 'Partnership Opportunity'}
                    {t('contact.form.subjects.feedback') || 'Feedback'}

                    {t('contact.form.message') || 'Message'}

                  {t('contact.form.send') || 'Send Message'}

            {/* Contact Information */}

                {t('contact.info.title') || 'Get in touch'}

                      {t('contact.info.address.title') || 'Office Address'}

                      123 Vitosha Blvd
                      Sofia 1000, Bulgaria

                      {t('contact.info.phone.title') || 'Phone'}
                    
                    +359 2 123 4567
                    
                      {t('contact.info.phone.hours') || 'Monday - Friday, 9AM - 6PM EET'}

                      {t('contact.info.email.title') || 'Email'}

                      {t('contact.info.email.general') || 'General inquiries'}: info@boomcard.bg
                      {t('contact.info.email.support') || 'Support'}: support@boomcard.bg
                      {t('contact.info.email.partners') || 'Partnerships'}: partners@boomcard.bg

              {/* Map */}

                  {t('contact.map.title') || 'Find us on the map'}

                    {t('contact.map.placeholder') || 'Interactive map will be displayed here'}

      {/* FAQ CTA */}

            {t('contact.faq.title') || 'Looking for quick answers?'}

            {t('contact.faq.subtitle') || 'Check out our frequently asked questions'}

            {t('contact.faq.button') || 'Visit Help Center'}

  );
}