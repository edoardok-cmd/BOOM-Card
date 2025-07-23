import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Tooltip } from '../Tooltip';
import { TooltipProvider } from '../TooltipContext';
import '@testing-library/jest-dom';

expect.extend(toHaveNoViolations);

describe('Tooltip', () => {
  const defaultProps = {
    content: 'Test tooltip content',
    children: <button>Hover me</button>
  };

  const renderWithProvider = (ui: React.ReactElement) => {
    return render(
      <TooltipProvider>
        {ui}
      </TooltipProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('renders children correctly', () => {
      renderWithProvider(<Tooltip {...defaultProps} />);
      expect(screen.getByText('Hover me')).toBeInTheDocument();
    });

    it('shows tooltip on hover', async () => {
      const user = userEvent.setup();
      renderWithProvider(<Tooltip {...defaultProps} />);
      
      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        expect(screen.getByText('Test tooltip content')).toBeInTheDocument();
      });
    });

    it('hides tooltip on mouse leave', async () => {
      renderWithProvider(<Tooltip {...defaultProps} />);
      
      await user.hover(trigger);
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
      
      await user.unhover(trigger);
      
      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('shows tooltip on focus when trigger is click', async () => {
      renderWithProvider(
        <Tooltip {...defaultProps} trigger="click" />
      );
      
      await user.click(trigger);
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('toggles tooltip on click when trigger is click', async () => {
      renderWithProvider(
        <Tooltip {...defaultProps} trigger="click" />
      );
      
      
      // First click - show
      await user.click(trigger);
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
      
      // Second click - hide
      await user.click(trigger);
      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('Props and Variants', () => {
    it('applies custom className', async () => {
      renderWithProvider(
        <Tooltip {...defaultProps} className="custom-tooltip" />
      );
      
      await user.hover(trigger);
      
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip.parentElement).toHaveClass('custom-tooltip');
      });
    });

    it('renders with different variants', async () => {
      const variants = ['default', 'dark', 'light', 'error', 'warning', 'success'] as const;
      
      for (const variant of variants) {
        const { unmount } = renderWithProvider(
          <Tooltip {...defaultProps} variant={variant} />
        );
        
        await user.hover(trigger);
        
        await waitFor(() => {
          expect(tooltip).toHaveClass(`tooltip-${variant}`);
        });
        
        unmount();
      });

    it('respects disabled prop', async () => {
      renderWithProvider(
        <Tooltip {...defaultProps} disabled />
      );
      
      await user.hover(trigger);
      
      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('applies custom delay', async () => {
      const delay = 500;
      renderWithProvider(
        <Tooltip {...defaultProps} delay={delay} />
      );
      
      const startTime = Date.now();
      await user.hover(trigger);
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        const elapsedTime = Date.now() - startTime;
        expect(elapsedTime).toBeGreaterThanOrEqual(delay - 50); // Allow small variance
      });
    });

    it('handles interactive prop correctly', async () => {
      renderWithProvider(
        <Tooltip {...defaultProps} interactive />
      );
      
      await user.hover(trigger);
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
      
      await user.hover(tooltip);
      
      // Tooltip should remain visible when hovering over it
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  describe('Positioning', () => {
    const positions = ['top', 'bottom', 'left', 'right', 'top-start', 'top-end', 'bottom-start', 'bottom-end'] as const;
    
    it.each(positions)('positions tooltip at %s', async (position) => {
      renderWithProvider(
        <Tooltip {...defaultProps} position={position} />
      );
      
      await user.hover(trigger);
      
      await waitFor(() => {
        expect(tooltip.parentElement).toHaveAttribute('data-position', position);
      });
    });

    it('handles offset prop', async () => {
      const offset = 20;
      renderWithProvider(
        <Tooltip {...defaultProps} offset={offset} />
      );
      
      await user.hover(trigger);
      
      await waitFor(() => {
        expect(tooltip.parentElement).toHaveStyle(`--tooltip-offset: ${offset}px`);
      });
    });
  });

  describe('Content Types', () => {
    it('renders string content', async () => {
      renderWithProvider(
        <Tooltip content="Simple string content" children={<button>Trigger</button>} />
      );
      
      await user.hover(screen.getByText('Trigger'));
      
      await waitFor(() => {
        expect(screen.getByText('Simple string content')).toBeInTheDocument();
      });
    });

    it('renders JSX content', async () => {
      const jsxContent = (
        <div>
          <strong>Bold text</strong>
          <span>Regular text</span>
        </div>
      );
      
      renderWithProvider(
        <Tooltip content={jsxContent} children={<button>Trigger</button>} />
      );
      
      await user.hover(screen.getByText('Trigger'));
      
      await waitFor(() => {
        expect(screen.getByText('Bold text')).toBeInTheDocument();
        expect(screen.getByText('Regular text')).toBeInTheDocument();
      });
    });

    it('handles empty content gracefully', async () => {
      renderWithProvider(
        <Tooltip content="" children={<button>Trigger</button>} />
      );
      
      await user.hover(screen.getByText('Trigger'));
      
      // Should not show tooltip with empty content
      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('shows tooltip on focus for focusable elements', async () => {
      renderWithProvider(
        <Tooltip {...defaultProps} showOnFocus />
      );
      
      trigger.focus();
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('hides tooltip on blur', async () => {
      renderWithProvider(
        <Tooltip {...defaultProps} showOnFocus />
      );
      
      trigger.focus();
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
      
      trigger.blur();
      
      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('closes on Escape key press', async () => {
      renderWithProvider(
        <Tooltip {...defaultProps} trigger="click" />
      );
      
      await user.click(trigger);
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
      
      await user.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid hover/unhover', async () => {
      renderWithProvider(<Tooltip {...defaultProps} />);
      
      
      // Rapid hover/unhover sequence
      await user.hover(trigger);

}
}
}
}
