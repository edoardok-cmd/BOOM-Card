import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Search, X, Menu as MenuIcon, Globe, User, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useClickOutside } from '../../hooks/useClickOutside';
import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { Input } from '../Input';
import { Avatar } from '../Avatar';
import { Badge } from '../Badge';
import { Dropdown } from '../Dropdown';

interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  submenu?: MenuItem[];
  action?: () => void;
  external?: boolean;
  protected?: boolean;
}

interface MenuProps {
  className?: string;
  variant?: 'primary' | 'secondary';
  position?: 'fixed' | 'relative' | 'absolute';
  transparent?: boolean;
  onSearch?: (query: string) => void;
}

export const Menu: React.FC<MenuProps> = ({
  className,
  variant = 'primary',
  position = 'fixed',
  transparent = false,
  onSearch
}) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setActiveSubmenu(null));
  useClickOutside(mobileMenuRef, () => setIsMobileMenuOpen(false));

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }, [isSearchOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const menuItems: MenuItem[] = [
    {
      id: 'home',
      label: t('menu.home'),
      href: '/'
    },
    {
      id: 'food-drink',
      label: t('menu.foodDrink'),
      href: '/food-drink',
      submenu: [
        {
          id: 'restaurants',
          label: t('menu.restaurants'),
          href: '/food-drink/restaurants',
          submenu: [
            { id: 'fine-dining', label: t('menu.fineDining'), href: '/food-drink/restaurants/fine-dining' },
            { id: 'casual-dining', label: t('menu.casualDining'), href: '/food-drink/restaurants/casual-dining' },
            { id: 'fast-food', label: t('menu.fastFood'), href: '/food-drink/restaurants/fast-food' },
            { id: 'dietary', label: t('menu.dietaryOptions'), href: '/food-drink/restaurants/dietary' }
          ]
        },
        {
          id: 'cafes',
          label: t('menu.cafesCoffee'),
          href: '/food-drink/cafes'
        },
        {
          id: 'bars-pubs',
          label: t('menu.barsPubs'),
          href: '/food-drink/bars',
          submenu: [
            { id: 'sky-bars', label: t('menu.skyBars'), href: '/food-drink/bars/sky-bars' },
            { id: 'cocktail-bars', label: t('menu.cocktailBars'), href: '/food-drink/bars/cocktail-bars' },
            { id: 'sports-bars', label: t('menu.sportsBars'), href: '/food-drink/bars/sports-bars' },
            { id: 'wine-bars', label: t('menu.wineBars'), href: '/food-drink/bars/wine-bars' }
          ]
        }
      ]
    },
    {
      id: 'entertainment',
      label: t('menu.entertainment'),
      href: '/entertainment',
      submenu: [
        { id: 'nightclubs', label: t('menu.nightclubs'), href: '/entertainment/nightclubs' },
        { id: 'live-music', label: t('menu.liveMusic'), href: '/entertainment/live-music' },
        { id: 'comedy-clubs', label: t('menu.comedyClubs'), href: '/entertainment/comedy-clubs' },
        { id: 'cultural-events', label: t('menu.culturalEvents'), href: '/entertainment/cultural-events' },
        { id: 'gaming-centers', label: t('menu.gamingCenters'), href: '/entertainment/gaming-centers' }
      ]
    },
    {
      id: 'accommodation',
      label: t('menu.accommodation'),
      href: '/accommodation',
      submenu: [
        { id: 'hotels', label: t('menu.hotels'), href: '/accommodation/hotels' },
        { id: 'boutique-hotels', label: t('menu.boutiqueHotels'), href: '/accommodation/boutique-hotels' },
        { id: 'bnb', label: t('menu.bedBreakfast'), href: '/accommodation/bed-breakfast' },
        { id: 'vacation-rentals', label: t('menu.vacationRentals'), href: '/accommodation/vacation-rentals' },
        { id: 'business-hotels', label: t('menu.businessHotels'), href: '/accommodation/business-hotels' }
      ]
    },
    {
      id: 'experiences',
      label: t('menu.experiences'),
      href: '/experiences',
      submenu: [
        { id: 'adventure', label: t('menu.adventureActivities'), href: '/experiences/adventure' },
        { id: 'wellness-spa', label: t('menu.wellnessSpa'), href: '/experiences/wellness-spa' },
        { id: 'wine-food-tastings', label: t('menu.wineFoodTastings'), href: '/experiences/tastings' },
        { id: 'escape-rooms', label: t('menu.escapeRooms'), href: '/experiences/escape-rooms' },
        { id: 'transportation', label: t('menu.transportation'), href: '/experiences/transportation' }
      ]
    }
  ];

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
      setIsSearchOpen(false);
      setSearchQuery('');
    }, [searchQuery, onSearch]);

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('preferred-language', lang);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isActive = location.pathname === item.href || 
                    location.pathname.startsWith(item.href + '/');

    if (item.protected && !isAuthenticated) {
      return null;
    }

    const content = (
      <>
        <span className="flex items-center gap-2">
          {item.icon && <item.icon className="w-4 h-4" />}
          {item.label}
          {item.badge && (
            <Badge size="sm" variant="primary">
              {item.badge}
            </Badge>
          )}
        </span>
        {hasSubmenu && (
          <ChevronDown 
            className={cn(
              "w-4 h-4 transition-transform",
              activeSubmenu === item.id && "rotate-180"
            )}
          />
        )}
      </>
    );

    const itemClass = cn(
      "flex items-center justify-between px-4 py-2 text-sm font-medium transition-colors rounded-md",
      depth === 0 ? "hover:bg-gray-100 dark:hover:bg-gray-800" : "hover:bg-gray-50 dark:hover:bg-gray-700",
      isActive && "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400",
      !isActive && "text-gray-700 dark:text-gray-200"
    );

    if (item.action) {
      return (
        <button
          key={item.id}
          onClick={item.action}
          className={itemClass}
        >
          {content}
        </button>
      );
    }

    if (item.external) {
      return (
        <a
          key={item.id}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className={itemClass}
        >
          {content}
        </a>
      );
    }

    return (
      <div key={item.id} className="relative">
        {hasSubmenu ? (
          <button
            onClick={() => setActiveSubmenu(activeSubmenu === item.id ? null : item.id)}
            className={itemClass}
          >
            {content}
          </button>
        ) : (
          <Link to={item.href || '#'} className={itemClass}>
            {content}
          </Link>
        )}
        
        {hasSubmenu && activeSubmenu === item.id && (
          <div className={cn(
            "absolute top-full mt-1 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50",
            depth === 0 ? "left-0 min-w-[200px]" : "left-full top-0 ml-1 min-w-[180px]"
          )}>
            <div className="py-1">
              {item.submenu.map(subItem => renderMenuItem(subItem, depth + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const menuClasses = cn(
    "w-full transition-all duration-300 z-50",
    position === 'fixed' && "fixed top-0 left-0 right-0",
    transparent && !isScrolled ? "bg-transparent" : "bg-white dark:bg-gray-900 shadow-md",)
    className
  );

  return (
    <>
      <nav className={menuClasses} ref={menuRef}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/logo.svg" 
                alt="BOOM Card" 
                className="h-8 w-auto"
                onError={(e) => {
                  e.currentTarget.src = '/logo-fallback.png';
                }}
              />
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
       
}
}
}
}
