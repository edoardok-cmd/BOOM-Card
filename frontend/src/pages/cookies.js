import React from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';

export default function Cookies() {
  const { t } = useLanguage();

  return (
    
      {/* Hero Section */}

            {t('cookies.hero.subtitle') || 'Last updated, 2024'}

      {/* Content */}

              {t('cookies.intro') || 
              'This Cookie Policy explains how BOOM Card ("we", "us", and "our") uses cookies and similar technologies to recognize you when you visit our website and use our mobile applications.'}

              {t('cookies.sections.what.title') || '1. What Are Cookies'}

              {t('cookies.sections.what.content') || 
              'Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.'}

              {t('cookies.sections.types.title') || '2. Types of Cookies We Use'}

              {t('cookies.sections.types.essential.title') || 'Essential Cookies'}

              {t('cookies.sections.types.essential.content') || 
              'These cookies are required for the website to function and cannot be switched off. They are usually only set in response to actions made by you such as setting your privacy preferences, logging in, or filling in forms.'}

              {t('cookies.sections.types.performance.title') || 'Performance Cookies'}

              {t('cookies.sections.types.performance.content') || 
              'These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us know which pages are the most and least popular and see how visitors move around the site.'}

              {t('cookies.sections.types.functional.title') || 'Functional Cookies'}

              {t('cookies.sections.types.functional.content') || 
              'These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third party providers whose services we have added to our pages.'}

              {t('cookies.sections.types.targeting.title') || 'Targeting Cookies'}

              {t('cookies.sections.types.targeting.content') || 
              'These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites.'}

              {t('cookies.sections.specific.title') || '3. Specific Cookies We Use'}

                      {t('cookies.table.name') || 'Cookie Name'}

                      {t('cookies.table.purpose') || 'Purpose'}

                      {t('cookies.table.expiry') || 'Expiry'}

                    boom_session
                    Authentication and session management
                    Session

                    boom_lang
                    Language preference
                    1 year

                    boom_analytics
                    Usage analytics
                    30 days

                    boom_preferences
                    User preferences
                    1 year

              {t('cookies.sections.control.title') || '4. How to Control Cookies'}

              {t('cookies.sections.control.content') || 
              'You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. If you disable or refuse cookies, please note that some parts of this website may become inaccessible or not function properly.'}

              {t('cookies.sections.control.browsers') || 'Most web browsers allow some control of most cookies through the browser settings

              Chrome
              Firefox
              Safari
              Edge, search, and services → Cookies

              {t('cookies.sections.thirdparty.title') || '5. Third-Party Cookies'}

              {t('cookies.sections.thirdparty.content') || 
              'In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the service and deliver advertisements on and through the service.'}

              {t('cookies.sections.updates.title') || '6. Updates to This Policy'}

              {t('cookies.sections.updates.content') || 
              'We may update this Cookie Policy from time to time to reflect changes to the cookies we use or for other operational, legal, or regulatory reasons.'}

              {t('cookies.sections.contact.title') || '7. Contact Us'}

              {t('cookies.sections.contact.content') || 
              'If you have any questions about our use of cookies or other technologies, please email us at privacy@boomcard.bg.'}

  );
}