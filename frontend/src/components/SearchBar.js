import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsOpen(false);
    }
  };

  return (
    
       {
          console.log('Search button clicked, current state, isOpen);
          setIsOpen(!isOpen);
        }}
        className="p-2 rounded-lg hover
        aria-label="Search"
        type="button"
      >

      {isOpen && (

             setSearchQuery(e.target.value)}
              placeholder="Search partners, plans, or locations..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus
              autoFocus
            />

            Press Enter to search
            
              Search

      )}
    
  );
}