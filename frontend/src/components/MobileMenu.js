import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LanguageIcon from '@mui/icons-material/Language';
import PersonIcon from '@mui/icons-material/Person';
import { useLanguage } from '../contexts/LanguageContext';

const MobileMenu = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close menu on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setIsOpen(false);
      setActiveSubmenu(null);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  const menuItems = [
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
          href: '/food-drink/restaurants'
        },
        {
          id: 'cafes',
          label: t('menu.cafesCoffee'),
          href: '/food-drink/cafes'
        },
        {
          id: 'bars-pubs',
          label: t('menu.barsPubs'),
          href: '/food-drink/bars'
        }
      ]
    },
    {
      id: 'entertainment',
      label: t('menu.entertainment'),
      href: '/entertainment',
      submenu: [
        {
          id: 'nightclubs',
          label: t('menu.nightclubs'),
          href: '/entertainment/nightclubs'
        },
        {
          id: 'live-music',
          label: t('menu.liveMusic'),
          href: '/entertainment/live-music'
        },
        {
          id: 'events',
          label: t('menu.events'),
          href: '/entertainment/events'
        }
      ]
    },
    {
      id: 'accommodation',
      label: t('menu.accommodation'),
      href: '/accommodation',
      submenu: [
        {
          id: 'hotels',
          label: t('menu.hotels'),
          href: '/accommodation/hotels'
        },
        {
          id: 'vacation-rentals',
          label: t('menu.vacationRentals'),
          href: '/accommodation/vacation-rentals'
        }
      ]
    },
    {
      id: 'experiences',
      label: t('menu.experiences'),
      href: '/experiences'
    },
    {
      id: 'help',
      label: t('menu.help'),
      href: '/help'
    },
    {
      id: 'partners',
      label: t('menu.partners'),
      href: '/partners'
    }
  ];

  const toggleSubmenu = (itemId) => {
    setActiveSubmenu(activeSubmenu === itemId ? null : itemId);
  };

  const renderMenuItem = (item, depth = 0) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isActive = router.pathname === item.href || 
                    router.pathname.startsWith(item.href + '/');

    return (
      <div key={item.id} className="border-b border-gray-200 dark:border-gray-700">
        {hasSubmenu ? (
          <button
            onClick={() => toggleSubmenu(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
              isActive 
                ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' 
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <span className="font-medium">{item.label}</span>
            <ExpandMoreIcon 
              className={`transition-transform ${
                activeSubmenu === item.id ? 'rotate-180' : ''
              }`}
              style={{ width: '20px', height: '20px' }}
            />
          </button>
        ) : (
          <Link href={item.href || '#'}>
            <a
              className={`block px-4 py-3 transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' 
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <span className="font-medium">{item.label}</span>
            </a>
          </Link>
        )}
        
        {hasSubmenu && activeSubmenu === item.id && (
          <div className="bg-gray-50 dark:bg-gray-800/50">
            {item.submenu.map(subItem => (
              <Link key={subItem.id} href={subItem.href || '#'}>
                <a
                  className={`block px-8 py-2 text-sm transition-colors ${
                    router.pathname === subItem.href
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {subItem.label}
                </a>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Menu Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <CloseIcon style={{ width: '24px', height: '24px' }} />
        ) : (
          <MenuIcon style={{ width: '24px', height: '24px' }} />
        )}
      </button>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Content */}
          <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-gray-900 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <Link href="/">
                <a className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                  <img 
                    src="/logo.svg" 
                    alt="BOOM Card" 
                    className="h-8 w-auto"
                    onError={(e) => {
                      e.currentTarget.src = '/logo-fallback.png';
                    }}
                  />
                  <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                    BOOM Card
                  </span>
                </a>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close menu"
              >
                <CloseIcon style={{ width: '24px', height: '24px' }} />
              </button>
            </div>

            {/* Menu Items */}
            <div className="overflow-y-auto h-[calc(100%-80px)]">
              <nav className="py-4">
                {menuItems.map(item => renderMenuItem(item))}
              </nav>

              {/* Additional Actions */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
                <Link href="/login">
                  <a className="flex items-center justify-center w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    <PersonIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                    {t('common.login')}
                  </a>
                </Link>
                <Link href="/register">
                  <a className="flex items-center justify-center w-full px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                    {t('common.register')}
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;