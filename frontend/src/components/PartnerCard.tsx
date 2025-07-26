import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface PartnerCardProps {
  partner: {
    id: number;
    name: string;
    category: string;
    discount: number;
    rating: number;
    image: string;
    location: string;
  };
}

export default function PartnerCard({ partner }: PartnerCardProps) {
  return (
    <Link href={`/partners/${partner.id}`}>
      <a className="block group cursor-pointer">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
          <div className="relative h-48 overflow-hidden">
            <div className="absolute inset-0 bg-gray-200">
              {/* Placeholder for image */}
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              -{partner.discount}%
            </div>
          </div>
          
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors">
              {partner.name}
            </h3>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
              <span>{partner.category}</span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
                {partner.rating}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {partner.location}
            </div>
          </div>
        </div>
      </a>
    </Link>
  );
}