import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';

interface CategoryCardProps {
  category: {
    id: string;
    title: { en: string; bg: string };
    icon: string;
    count: number;
    color: string;
  };
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const { language } = useLanguage();

  return (
    <Link href={`/partners?category=${category.id}`}>
      <a className="block group cursor-pointer">
        <div className="relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
          <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
          
          <div className="relative p-6 text-center">
            <div className="text-5xl mb-4">{category.icon}</div>
            <h3 className="text-lg font-semibold mb-2">
              {category.title[language]}
            </h3>
            <p className="text-sm text-gray-600">
              {category.count} partners
            </p>
          </div>
        </div>
      </a>
    </Link>
  );
}