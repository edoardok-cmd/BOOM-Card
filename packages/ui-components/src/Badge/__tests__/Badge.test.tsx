import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Badge } from '../Badge';
import { BadgeVariant, BadgeSize } from '../Badge.types';

describe('Badge', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<Badge>Default Badge</Badge>);
      const badge = screen.getByText('Default Badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('badge');
      expect(badge).toHaveClass('badge--primary');
      expect(badge).toHaveClass('badge--medium');
    });

    it('should render children correctly', () => {
      render(<Badge>Test Content</Badge>);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<Badge className="custom-class">Badge</Badge>);
      expect(badge).toHaveClass('badge');
      expect(badge).toHaveClass('custom-class');
    });

    it('should render as different HTML element when "as" prop is provided', () => {
      const { container } = render(<Badge as="div">Div Badge</Badge>);
      const divBadge = container.querySelector('div.badge');
      expect(divBadge).toBeInTheDocument();
      expect(divBadge).toHaveTextContent('Div Badge');
    });
  });

  describe('Variants', () => {
    const variants: BadgeVariant[] = ['primary', 'secondary', 'success', 'warning', 'danger', 'info'];

    variants.forEach((variant) => {
      it(`should render with ${variant} variant`, () => {
        render(<Badge variant={variant}>{variant} Badge</Badge>);
        expect(badge).toHaveClass(`badge--${variant}`);
      });
    });
  });

  describe('Sizes', () => {
    const sizes: BadgeSize[] = ['small', 'medium', 'large'];

    sizes.forEach((size) => {
      it(`should render with ${size} size`, () => {
        render(<Badge size={size}>{size} Badge</Badge>);
        expect(badge).toHaveClass(`badge--${size}`);
      });
    });
  });

  describe('States', () => {
    it('should render with rounded style when rounded prop is true', () => {
      render(<Badge rounded>Rounded Badge</Badge>);
      expect(badge).toHaveClass('badge--rounded');
    });

    it('should not have rounded class when rounded prop is false', () => {
      render(<Badge rounded={false}>Not Rounded</Badge>);
      expect(badge).not.toHaveClass('badge--rounded');
    });

    it('should render with outline style when outline prop is true', () => {
      render(<Badge outline>Outline Badge</Badge>);
      expect(badge).toHaveClass('badge--outline');
    });

    it('should not have outline class when outline prop is false', () => {
      render(<Badge outline={false}>Solid Badge</Badge>);
      expect(badge).not.toHaveClass('badge--outline');
    });
  });

  describe('Icon Support', () => {
    it('should render with icon', () => {
      const IconComponent = () => <svg data-testid="test-icon" />;
      render(<Badge icon={<IconComponent />}>Badge with Icon</Badge>);
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('Badge with Icon')).toBeInTheDocument();
    });

    it('should render icon in correct position', () => {
      const { container } = render(
        <Badge icon={<IconComponent />}>Badge Content</Badge>
      );
      
      const icon = screen.getByTestId('test-icon');
      const content = screen.getByText('Badge Content');
      
      expect(badge?.firstChild).toContainElement(icon);
      expect(icon.nextSibling).toBe(content);
    });
  });

  describe('Clickable Badge', () => {
    it('should render with onClick handler', () => {
      const handleClick = jest.fn();
      render(
        <Badge onClick={handleClick}>Clickable Badge</Badge>
      );
      
      expect(badge).toHaveClass('badge--clickable');
      
      badge.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not have clickable class when onClick is not provided', () => {
      render(<Badge>Non-clickable Badge</Badge>);
      expect(badge).not.toHaveClass('badge--clickable');
    });
  });

  describe('Combinations', () => {
    it('should render with multiple props combined', () => {
      render(
        <Badge
          variant="success"
          size="large"
          rounded
          outline
          className="custom-badge"
        >
          Combined Props
        </Badge>
      );
      
      expect(badge).toHaveClass('badge');
      expect(badge).toHaveClass('badge--success');
      expect(badge).toHaveClass('badge--large');
      expect(badge).toHaveClass('badge--rounded');
      expect(badge).toHaveClass('badge--outline');
      expect(badge).toHaveClass('custom-badge');
    });

    it('should render clickable badge with icon and custom styling', () => {
      
      render(
        <Badge
          variant="info"
          size="small"
          icon={<IconComponent />}
          onClick={handleClick}
          rounded
        >
          Complex Badge
        </Badge>
      );
      
      expect(badge).toHaveClass('badge--info');
      expect(badge).toHaveClass('badge--small');
      expect(badge).toHaveClass('badge--clickable');
      expect(badge).toHaveClass('badge--rounded');
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      
      badge.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have appropriate role when clickable', () => {
      render(
        <Badge onClick={handleClick}>Clickable Badge</Badge>
      );
      
      expect(badge).toHaveAttribute('role', 'button');
      expect(badge).toHaveAttribute('tabIndex', '0');
    });

    it('should not have button role when not clickable', () => {
      render(<Badge>Static Badge</Badge>);
      expect(badge).not.toHaveAttribute('role');
      expect(badge).not.toHaveAttribute('tabIndex');
    });

    it('should handle keyboard events for clickable badges', () => {
      render(
        <Badge onClick={handleClick}>Keyboard Badge</Badge>
      );
      
      
      // Test Enter key
      badge.focus();
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      badge.dispatchEvent(enterEvent);
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      // Test Space key
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      badge.dispatchEvent(spaceEvent);
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    it('should render without children', () => {
      const { container } = render(<Badge />);
      expect(badge).toBeInTheDocument();
      expect(badge).toBeEmptyDOMElement();
    });

    it('should handle numeric children', () => {
      render(<Badge>{42}</Badge>);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should handle multiple children', () => {
      render(
        <Badge>
          <span>First</span>
          <span>Second</span>
        </Badge>
      );
      
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });

    it('should maintain ref forwarding', () => {
      const ref = React.createRef<HTMLSpanElement>();
      render(<Badge ref={ref}>Badge with Ref</Badge>);
      
      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
      expect(ref.current).toHaveTextContent('Badge with Ref');
    });
  });

  describe('HTML Attributes', () => {
    it('should pass through HTML attributes', () => {
      render(
        <Badge
          id="test-badge"
          data-testid="badge"
          aria-label="Test Badge"
          title="Badge Title"
        >
          Attributes Badge
        </Badge>
      );
      
      expect(badge).toHaveAttribute('id', 'test-badge');
      expect(badge).toHaveAttribute('data-testid', 'badge');
      expect(badge).toHaveAttribute('aria-label', 'Test Badge');
      expect(badge).toHaveAttribute('title', 'Badge Title');
    });

    it('should handle style prop', () => {
      const customStyle = { backgroundColor: 'red', color: 'white' };
      render(
        <Badge style={customStyle}>Styled Badge</Badge>
      );
      
      expect(badge).toHaveStyle('background-color: red');
      expect(badge).toHaveStyle('color: white');
    });
  });
});
