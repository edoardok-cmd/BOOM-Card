import React from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';

export default function Terms() {
  const { t } = useLanguage();

  return (
    
      {/* Hero Section */}

            {t('terms.hero.subtitle') || 'Last updated, 2024'}

      {/* Content */}

              {t('terms.sections.acceptance.title') || '1. Acceptance of Terms'}

              {t('terms.sections.acceptance.content') || 
              'By accessing and using BOOM Card services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.'}

              {t('terms.sections.services.title') || '2. Description of Services'}

              {t('terms.sections.services.content') || 
              'BOOM Card provides a digital discount card service that offers exclusive discounts at partner locations including restaurants, hotels, spas, and entertainment venues throughout Bulgaria. The service is provided through our website and mobile applications.'}

              {t('terms.sections.membership.title') || '3. Membership and Account'}

              {t('terms.sections.membership.content') || 
              'To use BOOM Card services, you must register for an account and select a membership plan. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.'}

              {t('terms.sections.payment.title') || '4. Payment Terms'}

              {t('terms.sections.payment.content') || 
              'Membership fees are billed monthly or annually, depending on your selected plan. All fees are non-refundable except as required by law. You may cancel your subscription at any time, and your access will continue until the end of your current billing period.'}

              {t('terms.sections.usage.title') || '5. Acceptable Use'}

              {t('terms.sections.usage.content') || 
              'You agree to use BOOM Card services only for lawful purposes. You may not share your account with others unless you have a Family Plan. Misuse of the service may result in termination of your account.'}

              {t('terms.sections.partners.title') || '6. Partner Discounts'}

              {t('terms.sections.partners.content') || 
              'Discounts are provided by our partner businesses and may change without notice. BOOM Card is not responsible for the quality of goods or services provided by partners. All transactions are between you and the partner business.'}

              {t('terms.sections.privacy.title') || '7. Privacy'}

              {t('terms.sections.privacy.content') || 
              'Your use of our services is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the Site and informs users of our data collection practices.'}

              {t('terms.sections.liability.title') || '8. Limitation of Liability'}

              {t('terms.sections.liability.content') || 
              'BOOM Card shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service.'}

              {t('terms.sections.changes.title') || '9. Changes to Terms'}

              {t('terms.sections.changes.content') || 
              'We reserve the right to modify these terms at any time. We will notify users of any changes by posting the new Terms of Service on this page.'}

              {t('terms.sections.contact.title') || '10. Contact Information'}

              {t('terms.sections.contact.content') || 
              'If you have any questions about these Terms, please contact us at legal@boomcard.bg.'}

  );
}