import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  return (

                B
              
              BOOM Card

              {t('footer.tagline')}

          {/* Quick Links */}
          
            {t('footer.quickLinks')}

          {/* Support */}
          
            {t('footer.support')}

          {/* Contact */}
          
            {t('footer.contact')}

                123 Vitosha BlvdSofia 1000, Bulgaria

                +359 2 123 4567

                support@boomcard.bg

        {/* Bottom Bar */}

  );
}