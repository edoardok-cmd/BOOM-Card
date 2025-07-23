import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Spinner } from '../Spinner';
import { SpinnerSize, SpinnerVariant } from '../types';

describe('Spinner', () => {
  describe('Rendering', () => {
    it('should render spinner component', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });

    it('should have accessible loading text', () => {
      render(<Spinner />);
      const loadingText = screen.getByText('Loading...');
      expect(loadingText).toBeInTheDocument();
      expect(loadingText).toHaveClass('sr-only');
    });

    it('should render with custom aria-label', () => {
      const customLabel = 'Loading discount cards';
      render(<Spinner ariaLabel={customLabel} />);
      expect(spinner).toHaveAttribute('aria-label', customLabel);
    });
  });

  describe('Sizes', () => {
    const sizes: SpinnerSize[] = ['sm', 'md', 'lg', 'xl'];

    sizes.forEach((size) => {
      it(`should render with ${size} size`, () => {
        render(<Spinner size={size} />);
        expect(spinner.firstChild).toHaveClass(`spinner-${size}`);
      });
    });

    it('should render with default md size when no size provided', () => {
      render(<Spinner />);
      expect(spinner.firstChild).toHaveClass('spinner-md');
    });
  });

  describe('Variants', () => {
    const variants: SpinnerVariant[] = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];

    variants.forEach((variant) => {
      it(`should render with ${variant} variant`, () => {
        render(<Spinner variant={variant} />);
        expect(spinner.firstChild).toHaveClass(`spinner-${variant}`);
      });
    });

    it('should render with default primary variant when no variant provided', () => {
      render(<Spinner />);
      expect(spinner.firstChild).toHaveClass('spinner-primary');
    });
  });

  describe('Overlay', () => {
    it('should render without overlay by default', () => {
      const { container } = render(<Spinner />);
      const overlay = container.querySelector('.spinner-overlay');
      expect(overlay).not.toBeInTheDocument();
    });

    it('should render with overlay when overlay prop is true', () => {
      const { container } = render(<Spinner overlay />);
      expect(overlay).toBeInTheDocument();
    });

    it('should render spinner inside overlay', () => {
      const { container } = render(<Spinner overlay />);
      expect(overlay).toContainElement(spinner);
    });

    it('should blur background when overlay is active', () => {
      const { container } = render(<Spinner overlay />);
      expect(overlay).toHaveClass('spinner-overlay-blur');
    });
  });

  describe('Centered', () => {
    it('should not be centered by default', () => {
      render(<Spinner />);
      expect(spinner).not.toHaveClass('spinner-centered');
    });

    it('should be centered when centered prop is true', () => {
      render(<Spinner centered />);
      expect(spinner).toHaveClass('spinner-centered');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const customClass = 'custom-spinner-class';
      render(<Spinner className={customClass} />);
      expect(spinner).toHaveClass(customClass);
    });

    it('should apply custom styles', () => {
      const customStyles = { marginTop: '20px', backgroundColor: 'red' };
      render(<Spinner style={customStyles} />);
      expect(spinner).toHaveStyle(customStyles);
    });

    it('should combine custom className with default classes', () => {
      render(<Spinner className={customClass} size="lg" variant="success" />);
      expect(spinner).toHaveClass(customClass);
      expect(spinner).toHaveClass('spinner-container');
    });
  });

  describe('Loading Text', () => {
    it('should display custom loading text', () => {
      const customText = 'Loading partner discounts...';
      render(<Spinner loadingText={customText} />);
      const text = screen.getByText(customText);
      expect(text).toBeInTheDocument();
      expect(text).toHaveClass('sr-only');
    });

    it('should display visible loading text when showText is true', () => {
      render(<Spinner loadingText={customText} showText />);
      expect(text).toBeInTheDocument();
      expect(text).not.toHaveClass('sr-only');
      expect(text).toHaveClass('spinner-text');
    });
  });

  describe('Animation', () => {
    it('should have spin animation class', () => {
      render(<Spinner />);
      const spinnerElement = spinner.querySelector('.spinner');
      expect(spinnerElement).toHaveClass('spinner-animation');
    });

    it('should apply custom animation speed', () => {
      const customSpeed = '2s';
      render(<Spinner animationSpeed={customSpeed} />);
      expect(spinnerElement).toHaveStyle({ animationDuration: customSpeed });
    });
  });

  describe('Accessibility', () => {
    it('should have role="status"', () => {
      render(<Spinner />);
      expect(spinner).toBeInTheDocument();
    });

    it('should have aria-live="polite"', () => {
      render(<Spinner />);
      expect(spinner).toHaveAttribute('aria-live', 'polite');
    });

    it('should have aria-busy="true"', () => {
      render(<Spinner />);
      expect(spinner).toHaveAttribute('aria-busy', 'true');
    });

    it('should include screen reader only text by default', () => {
      render(<Spinner />);
      const srText = screen.getByText('Loading...');
      expect(srText).toHaveClass('sr-only');
    });

    it('should support custom aria-describedby', () => {
      const describedById = 'loading-description';
      render(
        <>
          <Spinner ariaDescribedBy={describedById} />
          <div id={describedById}>Loading discount partner information</div>
        </>
      );
      expect(spinner).toHaveAttribute('aria-describedby', describedById);
    });
  });

  describe('Test IDs', () => {
    it('should have default test id', () => {
      render(<Spinner />);
      expect(spinner).toBeInTheDocument();
    });

    it('should accept custom test id', () => {
      const customTestId = 'partner-loading-spinner';
      render(<Spinner testId={customTestId} />);
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Integration Scenarios', () => {
    it('should render correctly in a loading card scenario', () => {
      const { container } = render(
        <div className="discount-card">
          <Spinner overlay size="lg" loadingText="Loading partner details..." showText />
        </div>
      );
      
      const card = container.querySelector('.discount-card');
      
      expect(card).toContainElement(overlay);
      expect(overlay).toContainElement(spinner);
      expect(text).toBeVisible();
    });

    it('should render inline spinner for button loading state', () => {
      render(
        <button disabled>
          <Spinner size="sm" variant="light" />
          Applying discount...
        </button>
      );
      
      const button = screen.getByRole('button');
      
      expect(button).toBeDisabled();
      expect(button).toContainElement(spinner);
      expect(spinner.firstChild).toHaveClass('spinner-sm');
      expect(spinner.firstChild).toHaveClass('spinner-light');
    });

    it('should render page-level loading spinner', () => {
      render(
        <div className="page-container">
          <Spinner 
            overlay 
            centered 
            size="xl" 
            loadingText="Loading available discounts..." 
            showText 
          />
        </div>
      );
      
      
      expect(spinner).toHaveClass('spinner-centered');
      expect(overlay).toHaveClass('spinner-overlay');
      expect(screen.getByText('Loading available discounts...')).toBeVisible();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<Spinner size="md" />);
      const initialSpinner = spinner.firstChild;
      
      rerender(<Spinner size="md" />);
      
      expect(spinner.firstChild).toBe(initialSpinner);
    });
  });
});
