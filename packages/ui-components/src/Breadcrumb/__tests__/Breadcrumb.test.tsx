import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Breadcrumb } from '../Breadcrumb';
import { BreadcrumbProps } from '../types';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

// Mock useTranslation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: jest.fn(),
    },
  }),
}));

// Helper function to render with router
const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
};

describe('Breadcrumb', () => {
  const defaultProps: BreadcrumbProps = {
    items: [
      { label: 'Home', path: '/' },
      { label: 'Food & Drink', path: '/food-drink' },
      { label: 'Restaurants', path: '/food-drink/restaurants' },
    ],
  };

  it('renders breadcrumb items correctly', () => {
    renderWithRouter(<Breadcrumb {...defaultProps} />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Food & Drink')).toBeInTheDocument();
    expect(screen.getByText('Restaurants')).toBeInTheDocument();
  });

  it('renders links for all items except the last one', () => {
    renderWithRouter(<Breadcrumb {...defaultProps} />);
    
    const homeLink = screen.getByRole('link', { name: 'Home' });
    const foodDrinkLink = screen.getByRole('link', { name: 'Food & Drink' });
    
    expect(homeLink).toHaveAttribute('href', '/');
    expect(foodDrinkLink).toHaveAttribute('href', '/food-drink');
    
    // Last item should not be a link
    const restaurantsText = screen.getByText('Restaurants');
    expect(restaurantsText.closest('a')).toBeNull();
  });

  it('applies custom className when provided', () => {
    const { container } = renderWithRouter(
      <Breadcrumb {...defaultProps} className="custom-breadcrumb" />
    );
    
    expect(container.firstChild).toHaveClass('custom-breadcrumb');
  });

  it('renders separator between items', () => {
    renderWithRouter(<Breadcrumb {...defaultProps} />);
    
    const separators = screen.getAllByText('/');
    expect(separators).toHaveLength(2); // 3 items = 2 separators
  });

  it('renders custom separator when provided', () => {
    renderWithRouter(
      <Breadcrumb {...defaultProps} separator=">" />
    );
    
    expect(separators).toHaveLength(2);
  });

  it('renders with single item without separator', () => {
    const singleItemProps: BreadcrumbProps = {
      items: [{ label: 'Home', path: '/' }],
    };
    
    renderWithRouter(<Breadcrumb {...singleItemProps} />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.queryByText('/')).not.toBeInTheDocument();
  });

  it('handles items without paths correctly', () => {
    const propsWithoutPaths: BreadcrumbProps = {
      items: [
        { label: 'Home', path: '/' },
        { label: 'Current Page' }, // No path
      ],
    };
    
    renderWithRouter(<Breadcrumb {...propsWithoutPaths} />);
    
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByText('Current Page')).toBeInTheDocument();
    expect(screen.getByText('Current Page').closest('a')).toBeNull();
  });

  it('truncates long labels when maxLength is provided', () => {
    const longLabelProps: BreadcrumbProps = {
      items: [
        { label: 'Home', path: '/' },
        { label: 'Very Long Category Name That Should Be Truncated', path: '/category' },
      ],
      maxLength: 20,
    };
    
    renderWithRouter(<Breadcrumb {...longLabelProps} />);
    
    expect(screen.getByText('Very Long Category...')).toBeInTheDocument();
  });

  it('shows full label on hover when truncated', () => {
    const longLabelProps: BreadcrumbProps = {
      items: [
        { label: 'Home', path: '/' },
        { label: 'Very Long Category Name That Should Be Truncated', path: '/category' },
      ],
      maxLength: 20,
    };
    
    renderWithRouter(<Breadcrumb {...longLabelProps} />);
    
    const truncatedElement = screen.getByText('Very Long Category...');
    expect(truncatedElement).toHaveAttribute('title', 'Very Long Category Name That Should Be Truncated');
  });

  it('renders with showHome option', () => {
    const propsWithoutHome: BreadcrumbProps = {
      items: [
        { label: 'Food & Drink', path: '/food-drink' },
        { label: 'Restaurants', path: '/food-drink/restaurants' },
      ],
      showHome: true,
    };
    
    renderWithRouter(<Breadcrumb {...propsWithoutHome} />);
    
    expect(screen.getByText('breadcrumb.home')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'breadcrumb.home' })).toHaveAttribute('href', '/');
  });

  it('handles onClick callback for breadcrumb items', () => {
    const handleClick = jest.fn();
    const propsWithClick: BreadcrumbProps = {
      items: [
        { label: 'Home', path: '/', onClick: handleClick },
        { label: 'Food & Drink', path: '/food-drink' },
      ],
    };
    
    renderWithRouter(<Breadcrumb {...propsWithClick} />);
    
    fireEvent.click(homeLink);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with custom item className', () => {
    const propsWithCustomClass: BreadcrumbProps = {
      items: [
        { label: 'Home', path: '/', className: 'home-item' },
        { label: 'Food & Drink', path: '/food-drink', className: 'category-item' },
      ],
    };
    
    renderWithRouter(<Breadcrumb {...propsWithCustomClass} />);
    
    
    expect(homeLink.parentElement).toHaveClass('home-item');
    expect(foodDrinkLink.parentElement).toHaveClass('category-item');
  });

  it('handles empty items array', () => {
    const emptyProps: BreadcrumbProps = {
      items: [],
    };
    
    const { container } = renderWithRouter(<Breadcrumb {...emptyProps} />);
    
    expect(container.firstChild?.firstChild).toBeEmptyDOMElement();
  });

  it('renders structured data for SEO', () => {
    renderWithRouter(<Breadcrumb {...defaultProps} />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
    
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
  });

  it('handles items with icons', () => {
    const IconComponent = () => <span data-testid="custom-icon">🏠</span>;
    
    const propsWithIcons: BreadcrumbProps = {
      items: [
        { label: 'Home', path: '/', icon: <IconComponent /> },
        { label: 'Food & Drink', path: '/food-drink' },
      ],
    };
    
    renderWithRouter(<Breadcrumb {...propsWithIcons} />);
    
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('applies active state to current page item', () => {
    const { container } = renderWithRouter(
      <Breadcrumb {...defaultProps} />,
      { route: '/food-drink/restaurants' }
    );
    
    const lastItem = container.querySelector('.breadcrumb-item:last-child');
    expect(lastItem).toHaveClass('breadcrumb-item--active');
  });

  it('supports RTL layout', () => {
    const { container } = renderWithRouter(
      <Breadcrumb {...defaultProps} isRTL={true} />
    );
    
    expect(container.firstChild).toHaveClass('breadcrumb--rtl');
  });

  it('handles responsive behavior', () => {
    const responsiveProps: BreadcrumbProps = {
      items: [
        { label: 'Home', path: '/' },
        { label: 'Food & Drink', path: '/food-drink' },
        { label: 'Restaurants', path: '/food-drink/restaurants' },
        { label: 'Italian', path: '/food-drink/restaurants/italian' },
        { label: 'Pizza Place', path: '/food-drink/restaurants/italian/pizza-place' },
      ],
      collapseAt: 3,
    };
    
    renderWithRouter(<Breadcrumb {...responsiveProps} />);
    
    // Should show first item, ellipsis, and last 2 items
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('...')).toBeInTheDocument();
    expect(screen.getByText('Italian')).toBeInTheDocument();
    expect(screen.getByText('Pizza Place')).toBeInTheDocument();
    expect(screen.queryByText('Food & Drink')).not.toBeInTheDocument();
    expect(screen.queryByText('Restaurants')).not.toBeInTheDocument();
  });

  it('expands collapsed items on ellipsis click', () => {
    const responsiveProps: BreadcrumbProps = {
      items: [
        { label: 'Home', path: '/' },
        { label: 'Food & Drink', path: '/food-drink' },
        { label: 'Restaurants', path: '/food-drink/restaurants' },
        { label: 'Italian', path: '/food-drink/restaurants/italian' },
      ],
      collapseAt: 3,
    };
    
    renderWithRouter(<Breadcrumb {...responsiveProps} />);
    
    const ellipsis = screen.getByText('...');
    fireEvent.click(ellipsis);
    
    // All items should now be visible
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Food & Drink')).toBeInTheDocument();
    expect(screen.getByText('Restaurants')).toBeInTheDocument();
    expect(screen.getByText('Italian')).toBeInTheDocument();
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });

  it('renders with custom aria-label', () => {
    renderWithRouter(
      <Breadcrumb {...defaultProps} ariaLabel="Navigation breadcrumb" />
    );
    
    expect(nav).toHaveAttribute('aria-label', 'Navigation breadcrumb');
  });

  it('supports keyboard navigation', () => {
    renderWithRouter(<Breadcrumb {...defaultProps} />);
    
    const links = screen.getAllByRole('link');
    
    // All navigable items should be focusable
    links.forEach(link => {
      expect(link).toHaveAttribute('tabIndex', '0');
    });
  });

  it('renders loading state', () => {
    renderWithRouter(<Breadcrumb items={[]} isLoading={true} />);
    
    expect(screen.getByTestId('breadcrumb-skeleton')).toBeInTheDocument();
  });

  it('handles error state gracefully', () => {
    // Suppress console.error for this test
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const invalidProps = {
      items: null as any, // Invalid items
    };
    
    renderWithRouter(<Breadcrumb {...invalidProps} />);
    
    // Should render empty without crashing
    expect(screen.queryByRole('navigation')).toBeInTheDocument();
    
    consoleError.mockRestore();
  });
});
