import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Drawer } from '../Drawer';
import { DrawerProps } from '../types';

expect.extend(toHaveNoViolations);

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('Drawer', () => {
  const defaultProps: DrawerProps = {
    isOpen: true,
    onClose: jest.fn(),
    children: <div>Drawer Content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when open', () => {
      render(<Drawer {...defaultProps} />);
      expect(screen.getByText('Drawer Content')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(<Drawer {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Drawer Content')).not.toBeInTheDocument();
    });

    it('should render with custom title', () => {
      render(<Drawer {...defaultProps} title="Test Title" />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should render with custom width', () => {
      render(<Drawer {...defaultProps} width="500px" />);
      const drawer = screen.getByRole('dialog').firstChild as HTMLElement;
      expect(drawer).toHaveStyle({ maxWidth: '500px' });
    });

    it('should render footer content', () => {
      const footer = <div>Footer Content</div>;
      render(<Drawer {...defaultProps} footer={footer} />);
      expect(screen.getByText('Footer Content')).toBeInTheDocument();
    });
  });

  describe('Positions', () => {
    it('should render on the right by default', () => {
      render(<Drawer {...defaultProps} />);
      expect(drawer).toHaveClass('drawer-right');
    });

    it('should render on the left', () => {
      render(<Drawer {...defaultProps} position="left" />);
      expect(drawer).toHaveClass('drawer-left');
    });

    it('should render on the top', () => {
      render(<Drawer {...defaultProps} position="top" />);
      expect(drawer).toHaveClass('drawer-top');
    });

    it('should render on the bottom', () => {
      render(<Drawer {...defaultProps} position="bottom" />);
      expect(drawer).toHaveClass('drawer-bottom');
    });
  });

  describe('Sizes', () => {
    it('should apply small size class', () => {
      render(<Drawer {...defaultProps} size="small" />);
      expect(drawer).toHaveClass('drawer-small');
    });

    it('should apply medium size class', () => {
      render(<Drawer {...defaultProps} size="medium" />);
      expect(drawer).toHaveClass('drawer-medium');
    });

    it('should apply large size class', () => {
      render(<Drawer {...defaultProps} size="large" />);
      expect(drawer).toHaveClass('drawer-large');
    });

    it('should apply full size class', () => {
      render(<Drawer {...defaultProps} size="full" />);
      expect(drawer).toHaveClass('drawer-full');
    });
  });

  describe('Interactions', () => {
    it('should call onClose when close button is clicked', async () => {
      const onClose = jest.fn();
      render(<Drawer {...defaultProps} onClose={onClose} />);
      
      const closeButton = screen.getByLabelText('Close drawer');
      await userEvent.click(closeButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when overlay is clicked', async () => {
      render(<Drawer {...defaultProps} onClose={onClose} />);
      
      const overlay = screen.getByTestId('drawer-overlay');
      await userEvent.click(overlay);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when drawer content is clicked', async () => {
      render(<Drawer {...defaultProps} onClose={onClose} />);
      
      const content = screen.getByText('Drawer Content');
      await userEvent.click(content);
      
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should call onClose when Escape key is pressed', async () => {
      render(<Drawer {...defaultProps} onClose={onClose} />);
      
      fireEvent.keyDown(document, { key: 'Escape', keyCode: 27 });
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not close on Escape when closeOnEscape is false', () => {
      render(<Drawer {...defaultProps} onClose={onClose} closeOnEscape={false} />);
      
      fireEvent.keyDown(document, { key: 'Escape', keyCode: 27 });
      
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should not close on overlay click when closeOnOverlayClick is false', async () => {
      render(<Drawer {...defaultProps} onClose={onClose} closeOnOverlayClick={false} />);
      
      await userEvent.click(overlay);
      
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Focus Management', () => {
    it('should focus on first focusable element when opened', async () => {
      const { rerender } = render(
        <Drawer {...defaultProps} isOpen={false}>
          <button>First Button</button>
          <button>Second Button</button>
        </Drawer>
      );

      rerender(
        <Drawer {...defaultProps} isOpen={true}>
          <button>First Button</button>
          <button>Second Button</button>
        </Drawer>
      );

      await waitFor(() => {
        expect(screen.getByText('First Button')).toHaveFocus();
      });
    });

    it('should trap focus within drawer', async () => {
      render(
        <Drawer {...defaultProps}>
          <button>First Button</button>
          <button>Second Button</button>
        </Drawer>
      );

      const firstButton = screen.getByText('First Button');
      const secondButton = screen.getByText('Second Button');

      firstButton.focus();
      expect(firstButton).toHaveFocus();

      // Tab to second button
      fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
      expect(secondButton).toHaveFocus();

      // Tab to close button
      fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
      expect(closeButton).toHaveFocus();

      // Tab should cycle back to first button
      fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
      expect(firstButton).toHaveFocus();
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      render(<Drawer {...defaultProps} className="custom-drawer" />);
      expect(drawer).toHaveClass('custom-drawer');
    });

    it('should hide close button when showCloseButton is false', () => {
      render(<Drawer {...defaultProps} showCloseButton={false} />);
      expect(screen.queryByLabelText('Close drawer')).not.toBeInTheDocument();
    });

    it('should show overlay by default', () => {
      render(<Drawer {...defaultProps} />);
      expect(screen.getByTestId('drawer-overlay')).toBeInTheDocument();
    });

    it('should hide overlay when showOverlay is false', () => {
      render(<Drawer {...defaultProps} showOverlay={false} />);
      expect(screen.queryByTestId('drawer-overlay')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Drawer {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes', () => {
      render(<Drawer {...defaultProps} title="Test Drawer" />);
      const dialog = screen.getByRole('dialog');
      
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby');
      
      const titleId = dialog.getAttribute('aria-labelledby');
      const title = document.getElementById(titleId!);
      expect(title).toHaveTextContent('Test Drawer');
    });

    it('should have proper role attributes', () => {
      render(<Drawer {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should announce to screen readers when opened', () => {
      const { rerender } = render(<Drawer {...defaultProps} isOpen={false} />);
      
      rerender(<Drawer {...defaultProps} isOpen={true} />);
      
      expect(dialog).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Animation', () => {
    it('should apply animation classes based on position', () => {
      const { rerender } = render(<Drawer {...defaultProps} position="right" />);
      let drawer = screen.getByRole('dialog').firstChild as HTMLElement;
      expect(drawer).toHaveClass('drawer-right');

      rerender(<Drawer {...defaultProps} position="left" />);
      drawer = screen.getByRole('dialog').firstChild as HTMLElement;
      expect(drawer).toHaveClass('drawer-left');

      rerender(<Drawer {...defaultProps} position="top" />);
      drawer = screen.getByRole('dialog').firstChild as HTMLElement;
      expect(drawer).toHaveClass('drawer-top');

      rerender(<Drawer {...defaultProps} position="bottom" />);
      drawer = screen.getByRole('dialog').firstChild as HTMLElement;
      expect(drawer).toHaveClass('drawer-bottom');
    });
  });

  describe('Body Scroll Lock', () => {
    it('should prevent body scroll when open', () => {
      const originalOverflow = document.body.style.overflow;
      
      render(<Drawer {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');
      
      // Cleanup
      document.body.style.overflow = originalOverflow;
    });

    it('should restore body scroll when closed', () => {
      
      const { rerender } = render(<Drawer {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');
      
      rerender(<Drawer {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe(originalOverflow);
    });
  });

  describe('Portal Rendering', () => {
    it('should render in a portal by default', () => {
      const { container } = render(<Drawer {...defaultProps} />);
      expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
      expect(document.body.querySelector('[role="dialog"]')).toBeInTheDocument();
    });

    it('should render in place when portal is false', () => {
      const { container } = render(<Drawer {...defaultProps} portal={false} />);
      expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
    });
  });

  describe('Z-Index', () => {
    it('should apply custom z-index', () => {
      render(<Drawer {...defaultProps} zIndex={9999} />);
      expect(overlay).toHaveStyle({ zIndex: '9999' });
    });

    it('should have default z-index', () => {
      render(<Drawer {...defaultProps} />);
      expect(overlay).toHaveStyle({ zIndex: '1000' });
    });
  });

  describe('Event Callbacks', () => {
    it('should call onOpen when drawer opens', () => {
      const onOpen = jest.fn();
      const { rerender } = render(
        <Drawer {...defaultProps} isOpen={false} onOpen={onOpen} />
      );

      rerender(<Drawer {...defaultProps} isOpen={true} onOpen={onOpen} />);
      
      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it('should call onAfterOpen after drawer animation completes', async () => {
      const onAfterOpen = jest.fn();
      const { rerender } = render(
        <Drawer {...defaultProps} isOpen={false} onAfterOpen={onAfterOpen} />
      );

      rerender(<Drawer {...defaultProps} isOpen={true} onAfterOpen={onAfterOpen} />);
      
      await waitFor(() => {
        expect(onAfterOpen).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onAfterClose after drawer closes', async () => {
      const onAfterClose = jest.fn();
      const { rerender } = render(
        <Drawer {...defaultProps} isOpen={true} onAfterClose={onAfterClose} />
      );

      rerender(<Drawer {...defaultProps} isOpen={false} onAfterClose={onAfterClose} />);
      
      await waitFor(() => {
        expect(onAfterClose).toHaveBeenCalledTimes(1);
      });
    });
  });
});
