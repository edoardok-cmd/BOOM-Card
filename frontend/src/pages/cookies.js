import React from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';

export default function Cookies() {
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">{t('cookies.title') || 'Cookie Policy'}</h1>
        <p className="text-gray-600 mb-6">{t('cookies.subtitle') || 'Last updated: January 2024'}</p>
        
        <div className="prose max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('cookies.whatAre.title') || 'What are cookies?'}</h2>
            <p>{t('cookies.whatAre.content') || 'Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience and allow certain features to work.'}</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('cookies.howWeUse.title') || 'How we use cookies'}</h2>
            <p>{t('cookies.howWeUse.content') || 'We use cookies to:'}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('cookies.howWeUse.item1') || 'Remember your preferences and settings'}</li>
              <li>{t('cookies.howWeUse.item2') || 'Improve your browsing experience'}</li>
              <li>{t('cookies.howWeUse.item3') || 'Analyze site traffic and usage'}</li>
              <li>{t('cookies.howWeUse.item4') || 'Personalize content and ads'}</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('cookies.types.title') || 'Types of cookies we use'}</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">{t('cookies.types.essential.title') || 'Essential cookies'}</h3>
            <p>{t('cookies.types.essential.content') || 'These cookies are necessary for the website to function properly. They cannot be switched off in our systems.'}</p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">{t('cookies.types.performance.title') || 'Performance cookies'}</h3>
            <p>{t('cookies.types.performance.content') || 'These cookies allow us to count visits and traffic sources so we can measure and improve performance.'}</p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">{t('cookies.types.functional.title') || 'Functional cookies'}</h3>
            <p>{t('cookies.types.functional.content') || 'These cookies enable the website to provide enhanced functionality and personalization.'}</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('cookies.managing.title') || 'Managing cookies'}</h2>
            <p>{t('cookies.managing.content') || 'You can control and manage cookies through your browser settings. Please note that removing or blocking cookies may impact your user experience.'}</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('cookies.contact.title') || 'Contact us'}</h2>
            <p>{t('cookies.contact.content') || 'If you have any questions about our cookie policy, please contact us at privacy@boomcard.com'}</p>
          </section>
        </div>
      </div>
    </Layout>
  );
}