import React from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';

export default function Privacy() {
  const { t } = useLanguage();

  return (
    
      {/* Hero Section */}

            {t('privacy.hero.subtitle') || 'Last updated, 2024'}

      {/* Content */}

              {t('privacy.intro') || 
              'BOOM Card ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.'}

              {t('privacy.sections.collection.title') || '1. Information We Collect'}

              {t('privacy.sections.collection.personal.title') || 'Personal Information'}

              {t('privacy.sections.collection.personal.content') || 
              'We collect information you provide directly to us, such you create an account, including, email address, phone number, billing information, and address.'}

              {t('privacy.sections.collection.usage.title') || 'Usage Information'}

              {t('privacy.sections.collection.usage.content') || 
              'We automatically collect information about how you use BOOM Card, including, partner locations visited, app usage patterns, and device information.'}

              {t('privacy.sections.use.title') || '2. How We Use Your Information'}

              {t('privacy.sections.use.items.1') || 'To provide and maintain our service'}
              {t('privacy.sections.use.items.2') || 'To process your transactions and send related information'}
              {t('privacy.sections.use.items.3') || 'To send you technical notices and support messages'}
              {t('privacy.sections.use.items.4') || 'To communicate about products, services, and promotional offers'}
              {t('privacy.sections.use.items.5') || 'To monitor and analyze usage trends'}
              {t('privacy.sections.use.items.6') || 'To personalize your experience'}

              {t('privacy.sections.sharing.title') || '3. Information Sharing'}

              {t('privacy.sections.sharing.content') || 
              'We do not sell, trade, or rent your personal information to third parties. We may share your information in the following situations

              {t('privacy.sections.sharing.items.1') || 'With partner businesses when you redeem discounts'}
              {t('privacy.sections.sharing.items.2') || 'With service providers who help us operate our business'}
              {t('privacy.sections.sharing.items.3') || 'To comply with legal obligations'}
              {t('privacy.sections.sharing.items.4') || 'To protect our rights and safety'}

              {t('privacy.sections.security.title') || '4. Data Security'}

              {t('privacy.sections.security.content') || 
              'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.'}

              {t('privacy.sections.rights.title') || '5. Your Rights'}

              {t('privacy.sections.rights.content') || 
              'You have the right to

              {t('privacy.sections.rights.items.1') || 'Access your personal information'}
              {t('privacy.sections.rights.items.2') || 'Correct inaccurate information'}
              {t('privacy.sections.rights.items.3') || 'Request deletion of your information'}
              {t('privacy.sections.rights.items.4') || 'Object to processing of your information'}
              {t('privacy.sections.rights.items.5') || 'Request portability of your information'}
              {t('privacy.sections.rights.items.6') || 'Withdraw consent at any time'}

              {t('privacy.sections.cookies.title') || '6. Cookies and Tracking'}

              {t('privacy.sections.cookies.content') || 
              'We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.'}

              {t('privacy.sections.children.title') || '7. Children\'s Privacy'}

              {t('privacy.sections.children.content') || 
              'Our service is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18.'}

              {t('privacy.sections.changes.title') || '8. Changes to This Policy'}

              {t('privacy.sections.changes.content') || 
              'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.'}

              {t('privacy.sections.contact.title') || '9. Contact Us'}

              {t('privacy.sections.contact.content') || 
              'If you have any questions about this Privacy Policy, please contact us at

              Email
              Phone
              Address, Sofia 1000, Bulgaria

  );
}