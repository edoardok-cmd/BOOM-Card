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



export default function PartnerDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const { t } = useLanguage();
  const { user } = useAuth();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQR, setShowQR] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

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
      
        
          
          Loading partner details...
        
      
    );
  }

  if (error || !partner) {
    return (
      
        
          Partner not found
          {error || 'The partner you\'re looking for doesn\'t exist.'}
          
            
              Back to Partners
            
          
        
      
    );
  }

  return (
    
      
        {partner.name} - BOOM Card Partner
        
      

      {/* Navigation */}
      
        
          
            
              
                
              
            
            
              
                
                  
                    {t('nav.home') || 'Home'}
                  
                
                
                  
                    {t('nav.partners') || 'Partners'}
                  
                
                
                  
                    {t('nav.plans') || 'Plans'}
                  
                
                
                  
                  
                  
                
              
            
          
        
      

      {/* Hero Section with Cover Image */}
      
        {partner.coverImage && (
          
        )}
        
        
          
            
              
                {partner.category}
              
              
                📍 {partner.city}
              
            
            {partner.name}
            
              
                {partner.discountPercentage}%
                Discount
              
              {partner.rating > 0 && (
                
                  ★
                  {partner.rating.toFixed(1)}
                  ({partner.totalReviews} reviews)
                
              )}
            
          
        
      

      {/* Main Content */}
      
        
          {/* Left Column - Main Info */}
          
            {/* Description */}
            
              About {partner.name}
              {partner.description}
            

            {/* Discount Details */}
            
              Discount Details
              
                
                  
                    {partner.discountPercentage}% OFF
                    {partner.discountDescription}
                  
                  🎉
                
                {partner.terms && (
                  
                    
                      Terms & Conditions
                    
                  
                )}
              
            

            {/* How to Use */}
            
              How to Use Your Discount
              
                
                  1
                  
                    Show Your BOOM Card
                    Present your digital or physical BOOM Card at the venue
                  
                
                
                  2
                  
                    Get QR Code Scanned
                    Let the staff scan your unique QR code
                  
                
                
                  3
                  
                    Enjoy Your Discount
                    Your discount will be automatically applied to your bill
                  
                
              
            
          

          {/* Right Column - Contact & Actions */}
          
            {/* Contact Info */}
            
              Contact Information
              
                
                  📍
                  
                    Address
                    {partner.address}
                    {partner.city}
                  
                
                {partner.phone && (
                  
                    📞
                    
                      Phone
                      
                        {partner.phone}
                      
                    
                  
                )}
                {partner.email && (
                  
                    ✉️
                    
                      Email
                      
                        {partner.email}
                      
                    
                  
                )}
                {partner.website && (
                  
                    🌐
                    
                      Website
                      
                        Visit Website
                      
                    
                  
                )}
              
            

            {/* Action Buttons */}
            
              
                {user ? 'Show My QR Code' : 'Login to Use Discount'}
              
              {!user && (
                
                  You need to be logged in to use your BOOM Card discount
                
              )}
            

            {/* Map placeholder */}
            
              Location
              
                Map coming soon
              
            
          
        
      

      {/* QR Code Modal */}
      {showQR && (
         setShowQR(false)}>
           e.stopPropagation()}>
            Your BOOM Card QR Code
            
              
                {/* QR Code placeholder */}
                
                  QR Code
                
              
            
            
              Show this QR code to the staff to receive your {partner.discountPercentage}% discount
            
             setShowQR(false)}
              className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              Close
            
          
        
      )}
    
  );
}