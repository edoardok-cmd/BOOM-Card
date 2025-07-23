import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Avatar } from '../Avatar';
import { AvatarSize, AvatarStatus } from '../Avatar.types';

// Mock next/image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: function Image({ src, alt, onError, ...props }: any) {
    return <img src={src} alt={alt} onError={onError} {...props} />;
  },
}));

describe('Avatar', () => {
  const defaultProps = {
    name: 'John Doe',
    src: 'https://example.com/avatar.jpg',
  };

  describe('Rendering', () => {
    it('should render with image when src is provided', () => {
      render(<Avatar {...defaultProps} />);
      const image = screen.getByRole('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', defaultProps.src);
      expect(image).toHaveAttribute('alt', defaultProps.name);
    });

    it('should render initials when no src is provided', () => {
      render(<Avatar name="John Doe" />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should render single initial for single name', () => {
      render(<Avatar name="John" />);
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('should render default icon when no name or src provided', () => {
      render(<Avatar />);
      const svg = screen.getByTestId('avatar-default-icon');
      expect(svg).toBeInTheDocument();
    });

    it('should render initials for multi-word names', () => {
      render(<Avatar name="John Michael Doe" />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should handle empty string name', () => {
      render(<Avatar name="" />);
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    const sizes: AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
    
    sizes.forEach(size => {
      it(`should render with ${size} size`, () => {
        const { container } = render(<Avatar {...defaultProps} size={size} />);
        const avatar = container.firstChild;
        expect(avatar).toHaveClass(`avatar--${size}`);
      });
    });

    it('should default to md size', () => {
      const { container } = render(<Avatar {...defaultProps} />);
      expect(avatar).toHaveClass('avatar--md');
    });
  });

  describe('Status Indicator', () => {
    const statuses: AvatarStatus[] = ['online', 'offline', 'busy', 'away'];

    statuses.forEach(status => {
      it(`should render ${status} status indicator`, () => {
        render(<Avatar {...defaultProps} status={status} />);
        const indicator = screen.getByTestId('avatar-status-indicator');
        expect(indicator).toBeInTheDocument();
        expect(indicator).toHaveClass(`avatar__status--${status}`);
      });
    });

    it('should not render status indicator when status is not provided', () => {
      render(<Avatar {...defaultProps} />);
      expect(screen.queryByTestId('avatar-status-indicator')).not.toBeInTheDocument();
    });
  });

  describe('Image Error Handling', () => {
    it('should show initials when image fails to load', () => {
      render(<Avatar {...defaultProps} />);
      
      fireEvent.error(image);
      
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should show default icon when image fails and no name', () => {
      render(<Avatar src="https://example.com/avatar.jpg" />);
      
      fireEvent.error(image);
      
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      expect(screen.getByTestId('avatar-default-icon')).toBeInTheDocument();
    });
  });

  describe('Click Handler', () => {
    it('should call onClick when clicked', () => {
      const handleClick = jest.fn();
      render(<Avatar {...defaultProps} onClick={handleClick} />);
      
      fireEvent.click(avatar);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should have button role when onClick is provided', () => {
      render(<Avatar {...defaultProps} onClick={handleClick} />);
      
      expect(avatar).toHaveAttribute('role', 'button');
      expect(avatar).toHaveAttribute('tabIndex', '0');
    });

    it('should handle keyboard interaction when clickable', () => {
      render(<Avatar {...defaultProps} onClick={handleClick} />);
      
      fireEvent.keyDown(avatar, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      fireEvent.keyDown(avatar, { key: ' ' });
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('should not respond to keyboard when not clickable', () => {
      render(<Avatar {...defaultProps} />);
      
      const clickSpy = jest.fn();
      avatar.onclick = clickSpy;
      
      fireEvent.keyDown(avatar, { key: 'Enter' });
      expect(clickSpy).not.toHaveBeenCalled();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const customClass = 'custom-avatar-class';
      render(<Avatar {...defaultProps} className={customClass} />);
      
      expect(avatar).toHaveClass(customClass);
    });

    it('should apply custom styles', () => {
      const customStyle = { backgroundColor: 'red', borderWidth: '3px' };
      render(<Avatar {...defaultProps} style={customStyle} />);
      
      expect(avatar).toHaveStyle(customStyle);
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label', () => {
      render(<Avatar {...defaultProps} />);
      expect(avatar).toHaveAttribute('aria-label', `Avatar for ${defaultProps.name}`);
    });

    it('should have generic aria-label when no name', () => {
      render(<Avatar src="https://example.com/avatar.jpg" />);
      expect(avatar).toHaveAttribute('aria-label', 'User avatar');
    });

    it('should support custom aria-label', () => {
      const customLabel = 'Custom avatar label';
      render(<Avatar {...defaultProps} ariaLabel={customLabel} />);
      expect(avatar).toHaveAttribute('aria-label', customLabel);
    });

    it('should have proper focus styles when clickable', () => {
      render(<Avatar {...defaultProps} onClick={handleClick} />);
      
      expect(avatar).toHaveClass('avatar--clickable');
    });
  });

  describe('Loading State', () => {
    it('should show loading skeleton when loading prop is true', () => {
      render(<Avatar {...defaultProps} loading />);
      
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      expect(screen.queryByText('JD')).not.toBeInTheDocument();
      expect(screen.getByTestId('avatar-skeleton')).toBeInTheDocument();
    });

    it('should not show loading skeleton when loading is false', () => {
      render(<Avatar {...defaultProps} loading={false} />);
      
      expect(screen.getByRole('img')).toBeInTheDocument();
      expect(screen.queryByTestId('avatar-skeleton')).not.toBeInTheDocument();
    });
  });

  describe('Badge', () => {
    it('should render badge when provided', () => {
      render(<Avatar {...defaultProps} badge={5} />);
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByTestId('avatar-badge')).toBeInTheDocument();
    });

    it('should render 99+ for badges over 99', () => {
      render(<Avatar {...defaultProps} badge={100} />);
      expect(screen.getByText('99+')).toBeInTheDocument();
    });

    it('should not render badge when value is 0', () => {
      render(<Avatar {...defaultProps} badge={0} />);
      expect(screen.queryByTestId('avatar-badge')).not.toBeInTheDocument();
    });

    it('should not render badge when value is negative', () => {
      render(<Avatar {...defaultProps} badge={-1} />);
      expect(screen.queryByTestId('avatar-badge')).not.toBeInTheDocument();
    });
  });

  describe('Shape Variants', () => {
    it('should render circular avatar by default', () => {
      const { container } = render(<Avatar {...defaultProps} />);
      expect(avatar).toHaveClass('avatar--circle');
    });

    it('should render square avatar when shape is square', () => {
      const { container } = render(<Avatar {...defaultProps} shape="square" />);
      expect(avatar).toHaveClass('avatar--square');
    });

    it('should render rounded avatar when shape is rounded', () => {
      const { container } = render(<Avatar {...defaultProps} shape="rounded" />);
      expect(avatar).toHaveClass('avatar--rounded');
    });
  });

  describe('Group Context', () => {
    it('should apply group styles when in avatar group', () => {
      const { container } = render(
        <Avatar {...defaultProps} isInGroup groupPosition={1} />
      );
      expect(avatar).toHaveClass('avatar--grouped');
      expect(avatar).toHaveStyle({ '--avatar-group-index': '1' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in names', () => {
      render(<Avatar name="José María" />);
      expect(screen.getByText('JM')).toBeInTheDocument();
    });

    it('should handle non-latin characters', () => {
      render(<Avatar name="Иван Петров" />);
      expect(screen.getByText('ИП')).toBeInTheDocument();
    });

    it('should handle single letter names', () => {
      render(<Avatar name="X" />);
      expect(screen.getByText('X')).toBeInTheDocument();
    });

    it('should trim whitespace from names', () => {
      render(<Avatar name="  John   Doe  " />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should handle undefined props gracefully', () => {
      render(<Avatar name={undefined} src={undefined} />);
      expect(screen.getByTestId('avatar-default-icon')).toBeInTheDocument();
    });
  });
});
