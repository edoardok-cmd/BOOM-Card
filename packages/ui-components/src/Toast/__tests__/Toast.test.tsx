import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast } from '../Toast';
import { ToastProvider, useToast } from '../ToastContext';
import { renderHook, act } from '@testing-library/react';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('Toast', () => {
  const defaultProps = {
    id: 'test-toast-1',
    message: 'Test toast message',
    type: 'success' as const,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render toast with message', () => {
      render(<Toast {...defaultProps} />);
      expect(screen.getByText('Test toast message')).toBeInTheDocument();
    });

    it('should render success toast with correct styling', () => {
      render(<Toast {...defaultProps} type="success" />);
      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-green-50', 'border-green-200');
    });

    it('should render error toast with correct styling', () => {
      render(<Toast {...defaultProps} type="error" />);
      expect(toast).toHaveClass('bg-red-50', 'border-red-200');
    });

    it('should render info toast with correct styling', () => {
      render(<Toast {...defaultProps} type="info" />);
      expect(toast).toHaveClass('bg-blue-50', 'border-blue-200');
    });

    it('should render warning toast with correct styling', () => {
      render(<Toast {...defaultProps} type="warning" />);
      expect(toast).toHaveClass('bg-yellow-50', 'border-yellow-200');
    });

    it('should render with custom className', () => {
      render(<Toast {...defaultProps} className="custom-class" />);
      expect(toast).toHaveClass('custom-class');
    });

    it('should render action button when action prop is provided', () => {
      const mockAction = jest.fn();
      render(
        <Toast
          {...defaultProps}
          action={{
            label: 'Undo',
            onClick: mockAction,
          }}
        />
      );
      expect(screen.getByText('Undo')).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<Toast {...defaultProps} />);
      expect(screen.getByLabelText('Close')).toBeInTheDocument();
    });

    it('should render with description', () => {
      render(
        <Toast
          {...defaultProps}
          description="Additional description text"
        />
      );
      expect(screen.getByText('Additional description text')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<Toast {...defaultProps} />);
      
      const closeButton = screen.getByLabelText('Close');
      await user.click(closeButton);
      
      expect(defaultProps.onClose).toHaveBeenCalledWith('test-toast-1');
    });

    it('should call action onClick when action button is clicked', async () => {
      render(
        <Toast
          {...defaultProps}
          action={{
            label: 'Retry',
            onClick: mockAction,
          }}
        />
      );
      
      const actionButton = screen.getByText('Retry');
      await user.click(actionButton);
      
      expect(mockAction).toHaveBeenCalled();
    });

    it('should auto-dismiss after duration', () => {
      render(<Toast {...defaultProps} duration={3000} />);
      
      expect(defaultProps.onClose).not.toHaveBeenCalled();
      
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      
      expect(defaultProps.onClose).toHaveBeenCalledWith('test-toast-1');
    });

    it('should not auto-dismiss when duration is null', () => {
      render(<Toast {...defaultProps} duration={null} />);
      
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('should pause auto-dismiss on hover', async () => {
      render(<Toast {...defaultProps} duration={3000} />);
      
      
      // Hover over toast
      await user.hover(toast);
      
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      
      // Should not close while hovering
      expect(defaultProps.onClose).not.toHaveBeenCalled();
      
      // Unhover
      await user.unhover(toast);
      
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      
      // Should close after unhover and duration
      expect(defaultProps.onClose).toHaveBeenCalledWith('test-toast-1');
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes', () => {
      render(<Toast {...defaultProps} />);
      expect(toast).toHaveAttribute('aria-live', 'polite');
    });

    it('should have accessible close button', () => {
      render(<Toast {...defaultProps} />);
      expect(closeButton).toHaveAttribute('type', 'button');
    });

    it('should be keyboard navigable', async () => {
      render(<Toast {...defaultProps} />);
      
      // Tab to close button
      await user.tab();
      expect(screen.getByLabelText('Close')).toHaveFocus();
      
      // Press Enter to close
      await user.keyboard('{Enter}');
      expect(defaultProps.onClose).toHaveBeenCalledWith('test-toast-1');
    });

    it('should handle action button keyboard navigation', async () => {
      render(
        <Toast
          {...defaultProps}
          action={{
            label: 'Action',
            onClick: mockAction,
          }}
        />
      );
      
      // Tab to action button
      await user.tab();
      expect(screen.getByText('Action')).toHaveFocus();
      
      // Tab to close button
      await user.tab();
      expect(screen.getByLabelText('Close')).toHaveFocus();
    });
  });

  describe('ToastProvider and useToast', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ToastProvider>{children}</ToastProvider>
    );

    it('should add toast through context', () => {
      const { result } = renderHook(() => useToast(), { wrapper });
      
      act(() => {
        result.current.addToast({
          message: 'Context toast',
          type: 'success',
        });
      });
      
      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0]).toMatchObject({
        message: 'Context toast',
        type: 'success',
      });
    });

    it('should remove toast through context', () => {
      const { result } = renderHook(() => useToast(), { wrapper });
      
      let toastId: string;
      act(() => {
        toastId = result.current.addToast({
          message: 'Removable toast',
          type: 'info',
        });
      });
      
      expect(result.current.toasts).toHaveLength(1);
      
      act(() => {
        result.current.removeToast(toastId!);
      });
      
      expect(result.current.toasts).toHaveLength(0);
    });

    it('should handle multiple toasts', () => {
      const { result } = renderHook(() => useToast(), { wrapper });
      
      act(() => {
        result.current.addToast({ message: 'Toast 1', type: 'success' });
        result.current.addToast({ message: 'Toast 2', type: 'error' });
        result.current.addToast({ message: 'Toast 3', type: 'info' });
      });
      
      expect(result.current.toasts).toHaveLength(3);
      expect(result.current.toasts.map(t => t.message)).toEqual([
        'Toast 1',
        'Toast 2',
        'Toast 3',
      ]);
    });

    it('should generate unique IDs for toasts', () => {
      const { result } = renderHook(() => useToast(), { wrapper });
      
      let id1: string, id2: string;
      act(() => {
        id1 = result.current.addToast({ message: 'Toast 1', type: 'success' });
        id2 = result.current.addToast({ message: 'Toast 2', type: 'success' });
      });
      
      expect(id1).not.toBe(id2);
    });

    it('should respect max toast limit', () => {
      const { result } = renderHook(() => useToast(), { wrapper });
      
      act(() => {
        // Add more toasts than the default limit
        for (let i = 0; i < 10; i++) {
          result.current.addToast({ message: `Toast ${i}`, type: 'info' });
        });
      
      // Should only keep the most recent toasts up to the limit
      expect(result.current.toasts.length).toBeLessThanOrEqual(5);
    });

    it('should handle custom toast properties', () => {
      const { result } = renderHook(() => useToast(), { wrapper });
      
      act(() => {
        result.current.addToast({
          message: 'Custom toast',
          type: 'warning',
          duration: 5000,
          description: 'Custom description',
          action: {
            label: 'Custom Action',
            onClick: jest.fn(),
          },
        });
      });
      
      expect(result.current.toasts[0]).toMatchObject({
        message: 'Custom toast',
        type: 'warning',
 
}}}}
}
