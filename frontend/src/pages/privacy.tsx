import React from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';

export default function Privacy() {
  const { t } = useLanguage();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('privacy.hero.title') || 'Privacy Policy'}
          </h1>
          <p className="text-xl opacity-90">
            {t('privacy.hero.subtitle') || 'Last updated: January 1, 2024'}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              {t('privacy.intro') || 
              'BOOM Card ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.'}
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              {t('privacy.sections.collection.title') || '1. Information We Collect'}
            </h2>
            <h3 className="text-xl font-semibold mt-4 mb-2">
              {t('privacy.sections.collection.personal.title') || 'Personal Information'}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('privacy.sections.collection.personal.content') || 
              'We collect information you provide directly to us, such as when you create an account, including: name, email address, phone number, billing information, and address.'}
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">
              {t('privacy.sections.collection.usage.title') || 'Usage Information'}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('privacy.sections.collection.usage.content') || 
              'We automatically collect information about how you use BOOM Card, including: discount redemptions, partner locations visited, app usage patterns, and device information.'}
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              {t('privacy.sections.use.title') || '2. How We Use Your Information'}
            </h2>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>{t('privacy.sections.use.items.1') || 'To provide and maintain our service'}</li>
              <li>{t('privacy.sections.use.items.2') || 'To process your transactions and send related information'}</li>
              <li>{t('privacy.sections.use.items.3') || 'To send you technical notices and support messages'}</li>
              <li>{t('privacy.sections.use.items.4') || 'To communicate about products, services, and promotional offers'}</li>
              <li>{t('privacy.sections.use.items.5') || 'To monitor and analyze usage trends'}</li>
              <li>{t('privacy.sections.use.items.6') || 'To personalize your experience'}</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              {t('privacy.sections.sharing.title') || '3. Information Sharing'}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('privacy.sections.sharing.content') || 
              'We do not sell, trade, or rent your personal information to third parties. We may share your information in the following situations:'}
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>{t('privacy.sections.sharing.items.1') || 'With partner businesses when you redeem discounts'}</li>
              <li>{t('privacy.sections.sharing.items.2') || 'With service providers who help us operate our business'}</li>
              <li>{t('privacy.sections.sharing.items.3') || 'To comply with legal obligations'}</li>
              <li>{t('privacy.sections.sharing.items.4') || 'To protect our rights and safety'}</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              {t('privacy.sections.security.title') || '4. Data Security'}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('privacy.sections.security.content') || 
              'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.'}
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              {t('privacy.sections.rights.title') || '5. Your Rights'}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('privacy.sections.rights.content') || 
              'You have the right to:'}
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>{t('privacy.sections.rights.items.1') || 'Access your personal information'}</li>
              <li>{t('privacy.sections.rights.items.2') || 'Correct inaccurate information'}</li>
              <li>{t('privacy.sections.rights.items.3') || 'Request deletion of your information'}</li>
              <li>{t('privacy.sections.rights.items.4') || 'Object to processing of your information'}</li>
              <li>{t('privacy.sections.rights.items.5') || 'Request portability of your information'}</li>
              <li>{t('privacy.sections.rights.items.6') || 'Withdraw consent at any time'}</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              {t('privacy.sections.cookies.title') || '6. Cookies and Tracking'}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('privacy.sections.cookies.content') || 
              'We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.'}
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              {t('privacy.sections.children.title') || '7. Children\'s Privacy'}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('privacy.sections.children.content') || 
              'Our service is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18.'}
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              {t('privacy.sections.changes.title') || '8. Changes to This Policy'}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('privacy.sections.changes.content') || 
              'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.'}
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              {t('privacy.sections.contact.title') || '9. Contact Us'}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('privacy.sections.contact.content') || 
              'If you have any questions about this Privacy Policy, please contact us at:'}
            </p>
            <p className="text-gray-600">
              Email: privacy@boomcard.bg<br />
              Phone: +359 2 123 4567<br />
              Address: 123 Vitosha Blvd, Sofia 1000, Bulgaria
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
// Force server-side rendering
export async function getServerSideProps() {
  return {
    props: {},
  }
}
