import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Logo from '../components/Logo';
import { useLanguage } from '../contexts/LanguageContext';
import Layout from '../components/Layout';

export default function Demo() {
  const { t } = useLanguage();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);

  const demoSteps = [
    {
      title: t('demo.step1.title') || 'Welcome to BOOM Card',
      description: t('demo.step1.description') || 'Join thousands of members enjoying exclusive discounts at Bulgaria\'s finest establishments',
      image: '/images/demo/step1.jpg',
      color: 'from-orange-500 to-red-500'
    },
    {
      title: t('demo.step2.title') || 'Choose Your Plan',
      description: t('demo.step2.description') || 'Select from Essential, Premium, or VIP Elite memberships',
      image: '/images/demo/step2.jpg',
      color: 'from-blue-500 to-purple-500'
    },
    {
      title: t('demo.step3.title') || 'Browse Partners',
      description: t('demo.step3.description') || 'Access 375+ premium partners across dining, hotels, fitness, and more',
      image: '/images/demo/step3.jpg',
      color: 'from-green-500 to-teal-500'
    },
    {
      title: t('demo.step4.title') || 'Show Your Card',
      description: t('demo.step4.description') || 'Present your digital BOOM Card or QR code at any partner location',
      image: '/images/demo/step4.jpg',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: t('demo.step5.title') || 'Save Instantly',
      description: t('demo.step5.description') || 'Enjoy discounts from 10% to 40% automatically applied at checkout',
      image: '/images/demo/step5.jpg',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const handleNext = () => {
    if (activeStep < demoSteps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      router.push('/register');
    }
  };

  const handlePrevious = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSkip = () => {
    router.push('/register');
  };

  return (
    <Layout>
      <Head>
        <title>{t('demo.title') || 'Demo'} - BOOM Card</title>
      </Head>

      <div className="min-h-screen flex flex-col">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-1">
          <div 
            className="bg-orange-600 h-1 transition-all duration-300"
            style={{ width: `${((activeStep + 1) / demoSteps.length) * 100}%` }}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-4xl w-full">
            <div className={`bg-gradient-to-r ${demoSteps[activeStep].color} rounded-2xl p-12 text-white`}>
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-4">{demoSteps[activeStep].title}</h1>
                <p className="text-xl opacity-90">{demoSteps[activeStep].description}</p>
              </div>

              {/* Demo Image Placeholder */}
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-8 mb-8">
                <div className="aspect-video bg-white/10 rounded flex items-center justify-center">
                  <span className="text-2xl opacity-50">Demo Visual</span>
                </div>
              </div>

              {/* Step Indicators */}
              <div className="flex justify-center space-x-2 mb-8">
                {demoSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveStep(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === activeStep 
                        ? 'w-8 bg-white' 
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePrevious}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    activeStep === 0 
                      ? 'invisible' 
                      : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
                  }`}
                >
                  {t('demo.previous') || 'Previous'}
                </button>

                <button
                  onClick={handleSkip}
                  className="text-white/70 hover:text-white underline"
                >
                  {t('demo.skip') || 'Skip Demo'}
                </button>

                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-all"
                >
                  {activeStep === demoSteps.length - 1 
                    ? t('demo.getStarted') || 'Get Started'
                    : t('demo.next') || 'Next'
                  }
                </button>
              </div>
            </div>

            {/* Features Preview */}
            {activeStep === 0 && (
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-4">💳</div>
                  <h3 className="font-semibold mb-2">{t('demo.feature1.title') || 'Digital Card'}</h3>
                  <p className="text-gray-600 text-sm">{t('demo.feature1.desc') || 'Always with you on your phone'}</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-4">🏪</div>
                  <h3 className="font-semibold mb-2">{t('demo.feature2.title') || '375+ Partners'}</h3>
                  <p className="text-gray-600 text-sm">{t('demo.feature2.desc') || 'Premium locations nationwide'}</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-4">💰</div>
                  <h3 className="font-semibold mb-2">{t('demo.feature3.title') || 'Save Money'}</h3>
                  <p className="text-gray-600 text-sm">{t('demo.feature3.desc') || 'Up to 40% off every visit'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}