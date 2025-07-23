import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Alert } from '../Alert';
import { AlertProvider, useAlert } from '../AlertContext';
import { renderHook, act } from '@testing-library/react';

// Add jest-axe matcher
expect.extend(toHaveNoViolations);

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('Alert Component', () => {
  const defaultProps = {
    id: 'test-alert',
    title: 'Test Alert',
    message: 'This is a test alert message',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<Alert {...defaultProps} />);
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Test Alert')).toBeInTheDocument();
      expect(screen.getByText('This is a test alert message')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<Alert {...defaultProps} className="custom-alert" />);
      
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('custom-alert');
    });

    it('should render without title', () => {
      render(<Alert {...defaultProps} title={undefined} />);
      
      expect(screen.queryByText('Test Alert')).not.toBeInTheDocument();
      expect(screen.getByText('This is a test alert message')).toBeInTheDocument();
    });

    it('should render with custom icon', () => {
      const CustomIcon = () => <svg data-testid="custom-icon" />;
      render(<Alert {...defaultProps} icon={<CustomIcon />} />);
      
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      const actions = [
        { label: 'Confirm', onClick: jest.fn() },
        { label: 'Cancel', onClick: jest.fn(), variant: 'secondary' as const },
      ];
      
      render(<Alert {...defaultProps} actions={actions} />);
      
      expect(screen.getByText('Confirm')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    const variants = ['info', 'success', 'warning', 'error'] as const;

    variants.forEach((variant) => {
      it(`should render ${variant} variant correctly`, () => {
        render(<Alert {...defaultProps} variant={variant} />);
        
        expect(alert).toHaveAttribute('data-variant', variant);
      });

      it(`should have correct ARIA attributes for ${variant} variant`, () => {
        render(<Alert {...defaultProps} variant={variant} />);
        
        const expectedAriaLive = variant === 'error' ? 'assertive' : 'polite';
        expect(alert).toHaveAttribute('aria-live', expectedAriaLive);
      });
    });
  });

  describe('Dismissible', () => {
    it('should show close button when dismissible', () => {
      render(<Alert {...defaultProps} dismissible />);
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should not show close button when not dismissible', () => {
      render(<Alert {...defaultProps} dismissible={false} />);
      
      expect(closeButton).not.toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', async () => {
      const onClose = jest.fn();
      render(<Alert {...defaultProps} dismissible onClose={onClose} />);
      
      await userEvent.click(closeButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledWith('test-alert');
    });

    it('should dismiss alert with Escape key', () => {
      render(<Alert {...defaultProps} dismissible onClose={onClose} />);
      
      fireEvent.keyDown(screen.getByRole('alert'), { key: 'Escape' });
      
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledWith('test-alert');
    });
  });

  describe('Auto-dismiss', () => {
    jest.useFakeTimers();

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should auto-dismiss after specified duration', () => {
      render(
        <Alert {...defaultProps} dismissible autoDismiss={3000} onClose={onClose} />
      );
      
      expect(onClose).not.toHaveBeenCalled();
      
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledWith('test-alert');
    });

    it('should show countdown progress when autoDismiss is enabled', () => {
      render(<Alert {...defaultProps} dismissible autoDismiss={5000} />);
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-label', 'Auto-dismiss countdown');
    });

    it('should pause countdown on hover', () => {
      render(
        <Alert {...defaultProps} dismissible autoDismiss={3000} onClose={onClose} />
      );
      
      
      act(() => {
        jest.advanceTimersByTime(1500);
      });
      
      fireEvent.mouseEnter(alert);
      
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      
      expect(onClose).not.toHaveBeenCalled();
      
      fireEvent.mouseLeave(alert);
      
      act(() => {
        jest.advanceTimersByTime(1500);
      });
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Actions', () => {
    it('should handle action button clicks', async () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();
      
        { label: 'Confirm', onClick: onConfirm },
        { label: 'Cancel', onClick: onCancel },
      ];
      
      render(<Alert {...defaultProps} actions={actions} />);
      
      await userEvent.click(screen.getByText('Confirm'));
      expect(onConfirm).toHaveBeenCalledTimes(1);
      
      await userEvent.click(screen.getByText('Cancel'));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should handle async action handlers', async () => {
      const asyncAction = jest.fn().mockResolvedValue(undefined);
      
      render(<Alert {...defaultProps} actions={actions} />);
      
      const button = screen.getByText('Async Action');
      await userEvent.click(button);
      
      await waitFor(() => {
        expect(asyncAction).toHaveBeenCalledTimes(1);
      });
    });

    it('should disable action buttons during async operations', async () => {
      let resolveAction: () => void;
        new Promise((resolve) => { resolveAction = resolve; })
      );
      
      
      render(<Alert {...defaultProps} actions={actions} />);
      
      await userEvent.click(button);
      
      expect(button).toBeDisabled();
      
      act(() => {
        resolveAction!();
      });
      
      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Alert {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have correct ARIA attributes', () => {
      render(<Alert {...defaultProps} variant="error" />);
      
      expect(alert).toHaveAttribute('aria-live', 'assertive');
      expect(alert).toHaveAttribute('aria-atomic', 'true');
    });

    it('should announce title and message to screen readers', () => {
      render(<Alert {...defaultProps} />);
      
      const announcement = alert.querySelector('[aria-label]');
      expect(announcement).toHaveAttribute('aria-label', 'Test Alert: This is a test alert message');
    });

    it('should have keyboard navigation for actions', async () => {
        { label: 'Action 1', onClick: jest.fn() },
        { label: 'Action 2', onClick: jest.fn() },
      ];
      
      render(<Alert {...defaultProps} actions={actions} />);
      
      const button1 = screen.getByText('Action 1');
      const button2 = screen.getByText('Action 2');
      
      button1.focus();
      expect(document.activeElement).toBe(button1);
      
      await userEvent.tab();
      expect(document.activeElement).toBe(button2);
    });
  });

  describe('AlertContext Integration', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AlertProvider>{children}</AlertProvider>
    );

    it('should add alert through context', () => {
      const { result } = renderHook(() => useAlert(), { wrapper });
      
      act(() => {
        result.current.addAlert({
          title: 'Context Alert',
          message: 'Alert from context',)
          variant: 'success',
        });
      });
      
      expect(result.current.alerts).toHaveLength(1);
     
}
}
}
