import React from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';

export default function Cookies() {
  const { t } = useLanguage();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('cookies.hero.title') || 'Cookie Policy'}
          </h1>
          <p className="text-xl opacity-90">
            {t('cookies.hero.subtitle') || 'Last updated: January 1, 2024'}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              {t('cookies.intro') || 
              'This Cookie Policy explains how BOOM Card ("we", "us", and "our") uses cookies and similar technologies to recognize you when you visit our website and use our mobile applications.'}
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              {t('cookies.sections.what.title') || '1. What Are Cookies'}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('cookies.sections.what.content') || 
              'Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.'}
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              {t('cookies.sections.types.title') || '2. Types of Cookies We Use'}
            </h2>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">
              {t('cookies.sections.types.essential.title') || 'Essential Cookies'}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('cookies.sections.types.essential.content') || 
              'These cookies are required for the website to function and cannot be switched off. They are usually only set in response to actions made by you such as setting your privacy preferences, logging in, or filling in forms.'}
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">
              {t('cookies.sections.types.performance.title') || 'Performance Cookies'}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('cookies.sections.types.performance.content') || 
              'These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us know which pages are the most and least popular and see how visitors move around the site.'}
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">
              {t('cookies.sections.types.functional.title') || 'Functional Cookies'}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('cookies.sections.types.functional.content') || 
              'These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third party providers whose services we have added to our pages.'}
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">
              {t('cookies.sections.types.targeting.title') || 'Targeting Cookies'}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('cookies.sections.types.targeting.content') || 
              'These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites.'}
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              {t('cookies.sections.specific.title') || '3. Specific Cookies We Use'}
            </h2>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      {t('cookies.table.name') || 'Cookie Name'}
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      {t('cookies.table.purpose') || 'Purpose'}
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      {t('cookies.table.expiry') || 'Expiry'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">boom_session</td>
                    <td className="border border-gray-300 px-4 py-2">Authentication and session management</td>
                    <td className="border border-gray-300 px-4 py-2">Session</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">boom_lang</td>
                    <td className="border border-gray-300 px-4 py-2">Language preference</td>
                    <td className="border border-gray-300 px-4 py-2">1 year</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">boom_analytics</td>
                    <td className="border border-gray-300 px-4 py-2">Usage analytics</td>
                    <td className="border border-gray-300 px-4 py-2">30 days</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">boom_preferences</td>
                    <td className="border border-gray-300 px-4 py-2">User preferences</td>
                    <td className="border border-gray-300 px-4 py-2">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              {t('cookies.sections.control.title') || '4. How to Control Cookies'}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('cookies.sections.control.content') || 
              'You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. If you disable or refuse cookies, please note that some parts of this website may become inaccessible or not function properly.'}
            </p>
            
            <p className="text-gray-600 mb-4">
              {t('cookies.sections.control.browsers') || 'Most web browsers allow some control of most cookies through the browser settings:'}
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Chrome: Settings → Privacy and security → Cookies</li>
              <li>Firefox: Settings → Privacy & Security → Cookies</li>
              <li>Safari: Preferences → Privacy → Cookies</li>
              <li>Edge: Settings → Privacy, search, and services → Cookies</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              {t('cookies.sections.thirdparty.title') || '5. Third-Party Cookies'}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('cookies.sections.thirdparty.content') || 
              'In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the service and deliver advertisements on and through the service.'}
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              {t('cookies.sections.updates.title') || '6. Updates to This Policy'}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('cookies.sections.updates.content') || 
              'We may update this Cookie Policy from time to time to reflect changes to the cookies we use or for other operational, legal, or regulatory reasons.'}
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              {t('cookies.sections.contact.title') || '7. Contact Us'}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('cookies.sections.contact.content') || 
              'If you have any questions about our use of cookies or other technologies, please email us at privacy@boomcard.bg.'}
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
