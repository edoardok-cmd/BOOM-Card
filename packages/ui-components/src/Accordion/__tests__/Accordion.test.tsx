import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ThemeProvider } from '@emotion/react';
import { Accordion, AccordionItem, AccordionProps } from '../Accordion';
import { theme } from '../../../theme';
import '@testing-library/jest-dom';

expect.extend(toHaveNoViolations);

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('Accordion', () => {
  const mockItems: AccordionItem[] = [
    {
      id: '1',
      title: 'Restaurant Discounts',
      content: 'Get up to 20% off at partner restaurants',
      icon: '🍽️',
    },
    {
      id: '2',
      title: 'Hotel Benefits',
      content: 'Exclusive rates and room upgrades',
      icon: '🏨',
      disabled: false,
    },
    {
      id: '3',
      title: 'Spa & Wellness',
      content: 'Relaxation and wellness services',
      icon: '🧘',
      disabled: true,
    },
  ];

  const defaultProps: AccordionProps = {
    items: mockItems,
    'aria-label': 'BOOM Card benefits accordion',
  };

  const renderWithTheme = (ui: React.ReactElement) => {
    return render(
      <ThemeProvider theme={theme}>
        {ui}
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all accordion items', () => {
      renderWithTheme(<Accordion {...defaultProps} />);
      
      expect(screen.getByText('Restaurant Discounts')).toBeInTheDocument();
      expect(screen.getByText('Hotel Benefits')).toBeInTheDocument();
      expect(screen.getByText('Spa & Wellness')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = renderWithTheme(
        <Accordion {...defaultProps} className="custom-accordion" />
      );
      
      expect(container.firstChild).toHaveClass('custom-accordion');
    });

    it('should render icons when provided', () => {
      renderWithTheme(<Accordion {...defaultProps} />);
      
      expect(screen.getByText('🍽️')).toBeInTheDocument();
      expect(screen.getByText('🏨')).toBeInTheDocument();
      expect(screen.getByText('🧘')).toBeInTheDocument();
    });

    it('should not render content initially when all items are collapsed', () => {
      renderWithTheme(<Accordion {...defaultProps} />);
      
      expect(screen.queryByText('Get up to 20% off at partner restaurants')).not.toBeInTheDocument();
      expect(screen.queryByText('Exclusive rates and room upgrades')).not.toBeInTheDocument();
    });

    it('should render with default expanded items', () => {
      renderWithTheme(
        <Accordion {...defaultProps} defaultExpanded={['1', '2']} />
      );
      
      expect(screen.getByText('Get up to 20% off at partner restaurants')).toBeInTheDocument();
      expect(screen.getByText('Exclusive rates and room upgrades')).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should expand item on click', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Accordion {...defaultProps} />);
      
      const firstButton = screen.getByRole('button', { name: /Restaurant Discounts/i });
      await user.click(firstButton);
      
      expect(screen.getByText('Get up to 20% off at partner restaurants')).toBeInTheDocument();
    });

    it('should collapse expanded item on second click', async () => {
      renderWithTheme(<Accordion {...defaultProps} defaultExpanded={['1']} />);
      
      expect(screen.getByText('Get up to 20% off at partner restaurants')).toBeInTheDocument();
      
      await user.click(firstButton);
      
      expect(screen.queryByText('Get up to 20% off at partner restaurants')).not.toBeInTheDocument();
    });

    it('should handle multiple items in non-exclusive mode', async () => {
      renderWithTheme(<Accordion {...defaultProps} exclusive={false} />);
      
      const secondButton = screen.getByRole('button', { name: /Hotel Benefits/i });
      
      await user.click(firstButton);
      await user.click(secondButton);
      
      expect(screen.getByText('Get up to 20% off at partner restaurants')).toBeInTheDocument();
      expect(screen.getByText('Exclusive rates and room upgrades')).toBeInTheDocument();
    });

    it('should only allow one item expanded in exclusive mode', async () => {
      renderWithTheme(<Accordion {...defaultProps} exclusive={true} />);
      
      
      await user.click(firstButton);
      expect(screen.getByText('Get up to 20% off at partner restaurants')).toBeInTheDocument();
      
      await user.click(secondButton);
      expect(screen.queryByText('Get up to 20% off at partner restaurants')).not.toBeInTheDocument();
      expect(screen.getByText('Exclusive rates and room upgrades')).toBeInTheDocument();
    });

    it('should not expand disabled items', async () => {
      renderWithTheme(<Accordion {...defaultProps} />);
      
      const disabledButton = screen.getByRole('button', { name: /Spa & Wellness/i });
      await user.click(disabledButton);
      
      expect(screen.queryByText('Relaxation and wellness services')).not.toBeInTheDocument();
    });

    it('should handle keyboard navigation', async () => {
      renderWithTheme(<Accordion {...defaultProps} />);
      
      firstButton.focus();
      
      await user.keyboard('{Enter}');
      expect(screen.getByText('Get up to 20% off at partner restaurants')).toBeInTheDocument();
      
      await user.keyboard('{Space}');
      expect(screen.queryByText('Get up to 20% off at partner restaurants')).not.toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('should call onChange when item is expanded', async () => {
      const onChange = jest.fn();
      renderWithTheme(<Accordion {...defaultProps} onChange={onChange} />);
      
      await user.click(firstButton);
      
      expect(onChange).toHaveBeenCalledWith(['1']);
    });

    it('should call onChange with empty array when all items are collapsed', async () => {
      renderWithTheme(
        <Accordion {...defaultProps} defaultExpanded={['1']} onChange={onChange} />
      );
      
      await user.click(firstButton);
      
      expect(onChange).toHaveBeenCalledWith([]);
    });

    it('should call onChange with multiple items in non-exclusive mode', async () => {
      renderWithTheme(
        <Accordion {...defaultProps} exclusive={false} onChange={onChange} />
      );
      
      
      await user.click(firstButton);
      expect(onChange).toHaveBeenCalledWith(['1']);
      
      await user.click(secondButton);
      expect(onChange).toHaveBeenCalledWith(['1', '2']);
    });
  });

  describe('Controlled Mode', () => {
    it('should work as controlled component', async () => {
      const ControlledAccordion = () => {
        const [expanded, setExpanded] = React.useState<string[]>(['1']);
        
        return (
          <Accordion
            {...defaultProps}
            expanded={expanded}
            onChange={setExpanded}
          />
        );
      };
      
      renderWithTheme(<ControlledAccordion />);
      
      expect(screen.getByText('Get up to 20% off at partner restaurants')).toBeInTheDocument();
      
      await user.click(secondButton);
      
      await waitFor(() => {
        expect(screen.getByText('Exclusive rates and room upgrades')).toBeInTheDocument();
      });
    });

    it('should not update when onChange is not provided in controlled mode', async () => {
      renderWithTheme(<Accordion {...defaultProps} expanded={['1']} />);
      
      expect(screen.getByText('Get up to 20% off at partner restaurants')).toBeInTheDocument();
      
      await user.click(firstButton);
      
      // Should remain expanded because no onChange handler
      expect(screen.getByText('Get up to 20% off at partner restaurants')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithTheme(<Accordion {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes', () => {
      renderWithTheme(<Accordion {...defaultProps} defaultExpanded=
}}}