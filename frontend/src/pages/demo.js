import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Logo from '../components/Logo';
import SearchBar from '../components/SearchBar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import UserProfileDropdown from '../components/UserProfileDropdown';
import { useLanguage } from '../contexts/LanguageContext';

export default function Demo() {
  const { t } = useLanguage();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);

  const demoSteps = [
    {
      title),
      description),
      image,
      color
    },
    {
      title),
      description),
      image,
      color
    },
    {
      title),
      description),
      image,
      color
    },
    {
      title),
      description),
      image,
      color
    }
  ];

  return (

        {t('demo.title')}

      {/* Navigation */}

      {/* Hero Section */}

            {t('demo.hero.subtitle')}

      {/* Interactive Demo Section */}

              {t('demo.interactive.badge')}

              {t('demo.interactive.title')}

              {t('demo.interactive.subtitle')}

          {/* Demo Steps */}

                    {demoSteps[activeStep].title}

                    {t('demo.interactive.step')} {activeStep + 1} / {demoSteps.length}

                {/* Demo Screen */}

                    {demoSteps[activeStep].image}

                  {demoSteps[activeStep].description}

                {/* Step Navigation */}
                
                   setActiveStep(Math.max(0, activeStep - 1))}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      activeStep === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-50 text-blue-600 hover
                    }`}
                    disabled={activeStep === 0}
                  >
                    {t('demo.interactive.previous')}

                    {demoSteps.map((_, index) => (
                       setActiveStep(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          index === activeStep
                            ? 'bg-blue-600 w-8'
                            : 'bg-gray-300 hover
                        }`}
                      />
                    ))}

                   setActiveStep(Math.min(demoSteps.length - 1, activeStep + 1))}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      activeStep === demoSteps.length - 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover
                    }`}
                    disabled={activeStep === demoSteps.length - 1}
                  >
                    {t('demo.interactive.next')}

            {/* Right side - Features */}

                {t('demo.features.title')}

                    ✓

                    {t('demo.features.instant.title')}
                    {t('demo.features.instant.description')}

                    🔒

                    {t('demo.features.secure.title')}
                    {t('demo.features.secure.description')}

                    📍

                    {t('demo.features.everywhere.title')}
                    {t('demo.features.everywhere.description')}

      {/* Video Demo Section */}

              {t('demo.video.title')}

              {t('demo.video.subtitle')}

          {/* Video Placeholder */}

              {t('demo.video.placeholder')}

      {/* CTA Section */}

            {t('demo.cta.subtitle')}
          
           router.push('/subscriptions')}
              className="bg-white hover
              {t('demo.cta.getStarted')}
            
             router.push('/partners')}
              className="border-2 border-white text-white hover
              {t('demo.cta.explorePartners')}

  );
}