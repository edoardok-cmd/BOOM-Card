import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card } from '../Card';
import { CardProps } from '../Card.types';
import '@testing-library/jest-dom';

// Mock intersection observer
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver as any;

// Mock router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    locale: 'en',
  }),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

describe('Card Component', () => {
  const defaultProps: CardProps = {
    id: 'test-card-1',
    title: 'Test Restaurant',
    description: 'Amazing dining experience with 20% discount',
    imageUrl: '/images/restaurant.jpg',
    category: 'restaurant',
    discount: 20,
    rating: 4.5,
    reviewCount: 150,
    price: '$$',
    location: 'Sofia, Bulgaria',
    tags: ['Italian', 'Pizza', 'Pasta'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render card with all required props', () => {
      render(<Card {...defaultProps} />);
      
      expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
      expect(screen.getByText('Amazing dining experience with 20% discount')).toBeInTheDocument();
      expect(screen.getByText('20% OFF')).toBeInTheDocument();
      expect(screen.getByText('4.5')).toBeInTheDocument();
      expect(screen.getByText('(150)')).toBeInTheDocument();
      expect(screen.getByText('$$')).toBeInTheDocument();
      expect(screen.getByText('Sofia, Bulgaria')).toBeInTheDocument();
    });

    it('should render tags when provided', () => {
      render(<Card {...defaultProps} />);
      
      expect(screen.getByText('Italian')).toBeInTheDocument();
      expect(screen.getByText('Pizza')).toBeInTheDocument();
      expect(screen.getByText('Pasta')).toBeInTheDocument();
    });

    it('should render without optional props', () => {
      const minimalProps: CardProps = {
        id: 'test-card-2',
        title: 'Test Hotel',
        imageUrl: '/images/hotel.jpg',
        category: 'hotel',
      };
      
      render(<Card {...minimalProps} />);
      
      expect(screen.getByText('Test Hotel')).toBeInTheDocument();
      expect(screen.queryByText('OFF')).not.toBeInTheDocument();
      expect(screen.queryByText('(0)')).not.toBeInTheDocument();
    });

    it('should render featured badge when featured prop is true', () => {
      render(<Card {...defaultProps} featured />);
      
      expect(screen.getByText('Featured')).toBeInTheDocument();
      expect(screen.getByTestId('card-container')).toHaveClass('featured');
    });

    it('should render saved icon when isSaved prop is true', () => {
      render(<Card {...defaultProps} isSaved />);
      
      expect(screen.getByTestId('saved-icon')).toBeInTheDocument();
      expect(screen.getByTestId('save-button')).toHaveClass('saved');
    });

    it('should apply loading skeleton when loading prop is true', () => {
      render(<Card {...defaultProps} loading />);
      
      expect(screen.getByTestId('card-skeleton')).toBeInTheDocument();
      expect(screen.queryByText('Test Restaurant')).not.toBeInTheDocument();
    });

    it('should display availability status', () => {
      render(<Card {...defaultProps} availability="open" />);
      
      expect(screen.getByText('Open Now')).toBeInTheDocument();
      expect(screen.getByTestId('availability-indicator')).toHaveClass('open');
    });

    it('should display closed status', () => {
      render(<Card {...defaultProps} availability="closed" />);
      
      expect(screen.getByText('Closed')).toBeInTheDocument();
      expect(screen.getByTestId('availability-indicator')).toHaveClass('closed');
    });
  });

  describe('Interactions', () => {
    it('should call onClick handler when card is clicked', async () => {
      const handleClick = jest.fn();
      render(<Card {...defaultProps} onClick={handleClick} />);
      
      const card = screen.getByTestId('card-container');
      await userEvent.click(card);
      
      expect(handleClick).toHaveBeenCalledWith(defaultProps.id);
    });

    it('should call onSave handler when save button is clicked', async () => {
      const handleSave = jest.fn();
      render(<Card {...defaultProps} onSave={handleSave} />);
      
      const saveButton = screen.getByTestId('save-button');
      await userEvent.click(saveButton);
      
      expect(handleSave).toHaveBeenCalledWith(defaultProps.id, true);
    });

    it('should toggle saved state correctly', async () => {
      const { rerender } = render(<Card {...defaultProps} onSave={handleSave} isSaved={false} />);
      
      await userEvent.click(saveButton);
      
      expect(handleSave).toHaveBeenCalledWith(defaultProps.id, true);
      
      rerender(<Card {...defaultProps} onSave={handleSave} isSaved={true} />);
      await userEvent.click(saveButton);
      
      expect(handleSave).toHaveBeenCalledWith(defaultProps.id, false);
    });

    it('should show more options menu on button click', async () => {
      const handleShare = jest.fn();
      const handleReport = jest.fn();
      
      render(
        <Card 
          {...defaultProps} 
          onShare={handleShare}
          onReport={handleReport}
        />
      );
      
      const moreButton = screen.getByTestId('more-options-button');
      await userEvent.click(moreButton);
      
      expect(screen.getByText('Share')).toBeInTheDocument();
      expect(screen.getByText('Report')).toBeInTheDocument();
    });

    it('should call share handler from options menu', async () => {
      
      render(<Card {...defaultProps} onShare={handleShare} />);
      
      await userEvent.click(moreButton);
      
      const shareOption = screen.getByText('Share');
      await userEvent.click(shareOption);
      
      expect(handleShare).toHaveBeenCalledWith(defaultProps.id);
    });

    it('should prevent event propagation on button clicks', async () => {
      
      render(<Card {...defaultProps} onClick={handleClick} onSave={handleSave} />);
      
      await userEvent.click(saveButton);
      
      expect(handleSave).toHaveBeenCalled();
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<Card {...defaultProps} />);
      
      expect(screen.getByRole('article')).toHaveAttribute('aria-label', 'Test Restaurant card');
      expect(screen.getByTestId('save-button')).toHaveAttribute('aria-label', 'Save Test Restaurant');
      expect(screen.getByTestId('more-options-button')).toHaveAttribute('aria-label', 'More options for Test Restaurant');
    });

    it('should be keyboard navigable', async () => {
      
      render(<Card {...defaultProps} onClick={handleClick} onSave={handleSave} />);
      
      
      // Tab to card
      await userEvent.tab();
      expect(card).toHaveFocus();
      
      // Press Enter on card
      await userEvent.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalled();
      
      // Tab to save button
      await userEvent.tab();
      expect(saveButton).toHaveFocus();
      
      // Press Enter on save button
      await userEvent.keyboard('{Enter}');
      expect(handleSave).toHaveBeenCalled();
    });

    it('should announce dynamic content changes', async () => {
      const { rerender } = render(<Card {...defaultProps} isSaved={false} />);
      
      expect(screen.queryByText('Added to saved items')).not.toBeInTheDocument();
      
      rerender(<Card {...defaultProps} isSaved={true} />);
      
      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent('Added to saved items');
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should render compact view on small screens', () => {
      // Mock window size
      global.innerWidth = 320;
      global.dispatchEvent(new Event('resize'));
      
      render(<Card {...defaultProps} />);
      
      expect(screen.getByTestId('card-container')).toHaveClass('compact');
    });

    it('should show truncated description on compact view', () => {
      render(<Card {...defaultProps} compact />);
      
      const description = screen.getByTestId('card-description');
      expect(description).toHaveClass('truncate');
    });

    it('should lazy load images', () => {
      render(<Card {...defaultProps} />);
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('loading', 'lazy');
    });
  });

  describe('Error Handling', () => {
    it('should display fallback image on image error', () => {
      render(<Card {...defaultProps} imageUrl="/invalid-image.jpg" />);
      
      fireEvent.error(image);
      
      expect(image.src).toContain('/images/fallback-card.jpg');
    });

    it('should handle missing required props gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockIm
}}}