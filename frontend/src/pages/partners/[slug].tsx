import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import SearchBar from '../../components/SearchBar';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import UserProfileDropdown from '../../components/UserProfileDropdown';
import Logo from '../../components/Logo';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

interface Partner {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
  logo?: string;
  coverImage?: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  website?: string;
  discountPercentage: number;
  discountDescription: string;
  terms?: string;
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  totalReviews: number;
}

export default function PartnerDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const { t } = useLanguage();
  const { user } = useAuth();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8003/api';

  useEffect(() => {
    if (slug) {
      fetchPartnerDetails();
    }
  }, [slug]);

  const fetchPartnerDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/partners/slug/${slug}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setPartner(data.data);
      } else {
        setError(data.message || 'Failed to load partner details');
      }
    } catch (err) {
      console.error('Error fetching partner:', err);
      setError('Failed to load partner details');
    } finally {
      setLoading(false);
    }
  };

  const handleShowDiscount = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setShowQR(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading partner details...</p>
        </div>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Partner not found</h2>
          <p className="text-gray-600 mb-8">{error || 'The partner you\'re looking for doesn\'t exist.'}</p>
          <Link href="/partners">
            <a className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors">
              Back to Partners
            </a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{partner.name} - BOOM Card Partner</title>
        <meta name="description" content={partner.description} />
      </Head>

      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Logo size="md" showText={true} />
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-1">
                <Link href="/">
                  <a className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                    {t('nav.home') || 'Home'}
                  </a>
                </Link>
                <Link href="/partners">
                  <a className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-semibold">
                    {t('nav.partners') || 'Partners'}
                  </a>
                </Link>
                <Link href="/subscriptions">
                  <a className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                    {t('nav.plans') || 'Plans'}
                  </a>
                </Link>
                <div className="pl-4 ml-4 border-l border-gray-200 flex items-center space-x-3">
                  <SearchBar />
                  <LanguageSwitcher />
                  <UserProfileDropdown />
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Cover Image */}
      <div className="relative h-80 bg-gradient-to-br from-orange-400 to-red-500">
        {partner.coverImage && (
          <img
            src={partner.coverImage}
            alt={partner.name}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="text-white">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                {partner.category}
              </span>
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                📍 {partner.city}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{partner.name}</h1>
            <div className="flex items-center gap-6">
              <div className="bg-green-500/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <span className="text-3xl font-bold">{partner.discountPercentage}%</span>
                <span className="text-sm ml-2">Discount</span>
              </div>
              {partner.rating > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">★</span>
                  <span className="font-semibold">{partner.rating.toFixed(1)}</span>
                  <span className="text-sm opacity-80">({partner.totalReviews} reviews)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold mb-4">About {partner.name}</h2>
              <p className="text-gray-600 leading-relaxed">{partner.description}</p>
            </div>

            {/* Discount Details */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold mb-4">Discount Details</h2>
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-3xl font-bold text-orange-600">{partner.discountPercentage}% OFF</p>
                    <p className="text-gray-600 mt-2">{partner.discountDescription}</p>
                  </div>
                  <div className="text-6xl">🎉</div>
                </div>
                {partner.terms && (
                  <div className="mt-4 pt-4 border-t border-orange-200">
                    <p className="text-sm text-gray-600">
                      <strong>Terms & Conditions:</strong> {partner.terms}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* How to Use */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold mb-4">How to Use Your Discount</h2>
              <ol className="space-y-4">
                <li className="flex items-start">
                  <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-4 font-bold">1</span>
                  <div>
                    <p className="font-semibold">Show Your BOOM Card</p>
                    <p className="text-gray-600">Present your digital or physical BOOM Card at the venue</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-4 font-bold">2</span>
                  <div>
                    <p className="font-semibold">Get QR Code Scanned</p>
                    <p className="text-gray-600">Let the staff scan your unique QR code</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-4 font-bold">3</span>
                  <div>
                    <p className="font-semibold">Enjoy Your Discount</p>
                    <p className="text-gray-600">Your discount will be automatically applied to your bill</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>

          {/* Right Column - Contact & Actions */}
          <div className="space-y-8">
            {/* Contact Info */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h3 className="text-xl font-bold mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">📍</span>
                  <div>
                    <p className="font-semibold">Address</p>
                    <p className="text-gray-600">{partner.address}</p>
                    <p className="text-gray-600">{partner.city}</p>
                  </div>
                </div>
                {partner.phone && (
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">📞</span>
                    <div>
                      <p className="font-semibold">Phone</p>
                      <a href={`tel:${partner.phone}`} className="text-blue-600 hover:underline">
                        {partner.phone}
                      </a>
                    </div>
                  </div>
                )}
                {partner.email && (
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">✉️</span>
                    <div>
                      <p className="font-semibold">Email</p>
                      <a href={`mailto:${partner.email}`} className="text-blue-600 hover:underline">
                        {partner.email}
                      </a>
                    </div>
                  </div>
                )}
                {partner.website && (
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">🌐</span>
                    <div>
                      <p className="font-semibold">Website</p>
                      <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <button
                onClick={handleShowDiscount}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                {user ? 'Show My QR Code' : 'Login to Use Discount'}
              </button>
              {!user && (
                <p className="text-sm text-gray-600 mt-4 text-center">
                  You need to be logged in to use your BOOM Card discount
                </p>
              )}
            </div>

            {/* Map placeholder */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h3 className="text-xl font-bold mb-4">Location</h3>
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <p className="text-gray-500">Map coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowQR(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-4 text-center">Your BOOM Card QR Code</h3>
            <div className="bg-gray-100 rounded-lg p-8 mb-6">
              <div className="bg-white p-4 rounded-lg">
                {/* QR Code placeholder */}
                <div className="w-48 h-48 mx-auto bg-gray-300 flex items-center justify-center">
                  <p className="text-gray-600">QR Code</p>
                </div>
              </div>
            </div>
            <p className="text-center text-gray-600 mb-6">
              Show this QR code to the staff to receive your {partner.discountPercentage}% discount
            </p>
            <button
              onClick={() => setShowQR(false)}
              className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}