import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';

export default function PartnerWithUs() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    businessName,
    contactName,
    email,
    phone,
    businessType,
    location,
    website,
    message
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO
    alert(t('partnerWithUs.form.success') || 'Thank you for your interest! We will contact you soon.');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const benefits = [
    {
      icon

      ),
      title) || 'New Customers',
      description) || 'Access thousands of BOOM Card members actively looking for premium experiences'
    },
    {
      icon

      ),
      title) || 'Increased Revenue',
      description) || 'Fill empty tables and rooms during off-peak hours with guaranteed customers'
    },
    {
      icon

      ),
      title) || 'No Upfront Costs',
      description) || 'Pay only a small commission on actual sales - no setup fees or monthly charges'
    },
    {
      icon

      ),
      title) || 'Free Marketing',
      description) || 'Featured in our app, website, and promotional materials at no extra cost'
    },
    {
      icon

      ),
      title) || 'Analytics & Insights',
      description) || 'Track performance and customer behavior with detailed analytics dashboard'
    },
    {
      icon

      ),
      title) || 'Flexible Terms',
      description) || 'Set your own discount levels and availability - you\'re always in control'
    }
  ];

  return (
    
      {/* Hero Section */}

            {t('partnerWithUs.hero.subtitle') || 'Join Bulgaria\'s fastest-growing discount network and reach thousands of new customers'}

      {/* Benefits Section */}

            {t('partnerWithUs.benefits.title') || 'Why Partner With Us?'}
          
           (

                  {benefit.icon}
                
                {benefit.title}
                {benefit.description}
              
            ))}

      {/* How It Works */}

            {t('partnerWithUs.howItWorks.title') || 'How It Works'}

              1
              {t('partnerWithUs.howItWorks.step1.title') || 'Apply Online'}
              {t('partnerWithUs.howItWorks.step1.description') || 'Fill out our simple application form'}

              2
              {t('partnerWithUs.howItWorks.step2.title') || 'Get Approved'}
              {t('partnerWithUs.howItWorks.step2.description') || 'We review and approve qualified businesses'}

              3
              {t('partnerWithUs.howItWorks.step3.title') || 'Setup & Training'}
              {t('partnerWithUs.howItWorks.step3.description') || 'Quick setup and staff training'}

              4
              {t('partnerWithUs.howItWorks.step4.title') || 'Start Growing'}
              {t('partnerWithUs.howItWorks.step4.description') || 'Welcome new customers immediately'}

      {/* Application Form */}

            {t('partnerWithUs.form.title') || 'Become a Partner'}

                  {t('partnerWithUs.form.businessName') || 'Business Name'} *

                  {t('partnerWithUs.form.contactName') || 'Contact Person'} *

                  {t('partnerWithUs.form.email') || 'Email Address'} *

                  {t('partnerWithUs.form.phone') || 'Phone Number'} *

                  {t('partnerWithUs.form.businessType') || 'Business Type'} *

                  {t('partnerWithUs.form.selectType') || 'Select type'}
                  {t('partnerWithUs.form.types.restaurant') || 'Restaurant'}
                  {t('partnerWithUs.form.types.hotel') || 'Hotel'}
                  {t('partnerWithUs.form.types.spa') || 'Spa & Wellness'}
                  {t('partnerWithUs.form.types.entertainment') || 'Entertainment'}
                  {t('partnerWithUs.form.types.retail') || 'Retail'}
                  {t('partnerWithUs.form.types.other') || 'Other'}

                  {t('partnerWithUs.form.location') || 'Location/City'} *

                  {t('partnerWithUs.form.website') || 'Website (optional)'}

                  {t('partnerWithUs.form.message') || 'Additional Information'}

                {t('partnerWithUs.form.submit') || 'Submit Application'}

      {/* Contact CTA */}

            {t('partnerWithUs.cta.title') || 'Have Questions?'}

            {t('partnerWithUs.cta.subtitle') || 'Our partnership team is here to help'}

              partners@boomcard.bg

              +359 2 123 4567

  );
}