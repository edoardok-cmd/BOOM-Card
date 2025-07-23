import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from '../Switch';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';

expect.extend(toHaveNoViolations);

describe('Switch Component', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Basic Functionality', () => {
    it('renders without crashing', () => {
      render(<Switch />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeInTheDocument();
    });

    it('renders with default unchecked state', () => {
      render(<Switch />);
      expect(switchElement).not.toBeChecked();
      expect(switchElement).toHaveAttribute('aria-checked', 'false');
    });

    it('renders with checked state when checked prop is true', () => {
      render(<Switch checked />);
      expect(switchElement).toBeChecked();
      expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });

    it('toggles state on click', async () => {
      const user = userEvent.setup();
      render(<Switch onChange={mockOnChange} />);

      await user.click(switchElement);
      expect(mockOnChange).toHaveBeenCalledWith(true);
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('toggles state on space key press', async () => {
      render(<Switch onChange={mockOnChange} />);

      switchElement.focus();
      await user.keyboard(' ');
      expect(mockOnChange).toHaveBeenCalledWith(true);
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('toggles state on enter key press', async () => {
      render(<Switch onChange={mockOnChange} />);

      switchElement.focus();
      await user.keyboard('{Enter}');
      expect(mockOnChange).toHaveBeenCalledWith(true);
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('Props and Variants', () => {
    it('renders with label', () => {
      render(<Switch label="Enable notifications" />);
      expect(screen.getByText('Enable notifications')).toBeInTheDocument();
    });

    it('renders with helper text', () => {
      render(<Switch helperText="Receive email alerts" />);
      expect(screen.getByText('Receive email alerts')).toBeInTheDocument();
    });

    it('renders with both label and helper text', () => {
      render(
        <Switch 
          label="Enable notifications" 
          helperText="Receive email alerts"
        />
      );
      expect(screen.getByText('Enable notifications')).toBeInTheDocument();
      expect(screen.getByText('Receive email alerts')).toBeInTheDocument();
    });

    it('applies size variants correctly', () => {
      const { rerender } = render(<Switch size="small" />);
      let switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveClass('switch--small');

      rerender(<Switch size="medium" />);
      switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveClass('switch--medium');

      rerender(<Switch size="large" />);
      switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveClass('switch--large');
    });

    it('applies color variants correctly', () => {
      const { rerender } = render(<Switch color="primary" />);
      expect(switchElement).toHaveClass('switch--primary');

      rerender(<Switch color="secondary" />);
      switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveClass('switch--secondary');

      rerender(<Switch color="success" />);
      switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveClass('switch--success');
    });

    it('applies custom className', () => {
      render(<Switch className="custom-switch" />);
      expect(switchElement).toHaveClass('custom-switch');
    });

    it('passes through data attributes', () => {
      render(<Switch data-testid="custom-switch" data-analytics="switch-toggle" />);
      expect(switchElement).toHaveAttribute('data-analytics', 'switch-toggle');
    });
  });

  describe('Disabled State', () => {
    it('renders as disabled when disabled prop is true', () => {
      render(<Switch disabled />);
      expect(switchElement).toBeDisabled();
      expect(switchElement).toHaveClass('switch--disabled');
    });

    it('does not toggle when disabled', async () => {
      render(<Switch disabled onChange={mockOnChange} />);

      await user.click(switchElement);
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('shows disabled cursor on hover when disabled', () => {
      render(<Switch disabled />);
      expect(switchElement).toHaveStyle({ cursor: 'not-allowed' });
    });
  });

  describe('Loading State', () => {
    it('renders loading spinner when loading prop is true', () => {
      render(<Switch loading />);
      const spinner = screen.getByTestId('switch-spinner');
      expect(spinner).toBeInTheDocument();
    });

    it('disables interaction when loading', async () => {
      render(<Switch loading onChange={mockOnChange} />);

      await user.click(switchElement);
      expect(mockOnChange).not.toHaveBeenCalled();
      expect(switchElement).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Error State', () => {
    it('renders with error styling when error prop is true', () => {
      render(<Switch error />);
      expect(switchElement).toHaveClass('switch--error');
    });

    it('displays error message when provided', () => {
      render(<Switch error errorMessage="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByText('This field is required')).toHaveClass('switch__error-message');
    });

    it('adds aria-invalid when error is true', () => {
      render(<Switch error />);
      expect(switchElement).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Controlled vs Uncontrolled', () => {
    it('works as controlled component', async () => {
      const ControlledSwitch = () => {
        const [checked, setChecked] = React.useState(false);
        return (
          <Switch 
            checked={checked} 
            onChange={setChecked}
            data-testid="controlled-switch"
          />
        );
      };

      render(<ControlledSwitch />);

      expect(switchElement).not.toBeChecked();
      await user.click(switchElement);
      expect(switchElement).toBeChecked();
    });

    it('works as uncontrolled component with defaultChecked', async () => {
      render(<Switch defaultChecked onChange={mockOnChange} />);

      expect(switchElement).toBeChecked();
      await user.click(switchElement);
      expect(mockOnChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <Switch label="Enable feature" helperText="This enables the feature" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('associates label with switch using aria-labelledby', () => {
      render(<Switch label="Test Label" />);
      const labelElement = screen.getByText('Test Label');
      
      expect(switchElement).toHaveAttribute('aria-labelledby', labelElement.id);
    });

    it('has proper focus styles', () => {
      render(<Switch />);
      
      switchElement.focus();
      expect(switchElement).toHaveFocus();
      expect(switchElement).toHaveClass('switch--focused');
    });

    it('supports keyboard navigation', async () => {
      render(
        <>
          <button>Before</button>
          <Switch />
          <button>After</button>
        </>
      );

      const beforeButton = screen.getByText('Before');
      const afterButton = screen.getByText('After');

      beforeButton.focus();
      await user.tab();
      expect(switchElement).toHaveFocus();

      await user.tab();
      expect(afterButton).toHaveFocus();
    });

    it('announces state changes to screen readers', async () => {
      render(<Switch aria-label="Toggle feature" />);

      expect(switchElement).toHaveAttribute('aria-checked', 'false');
      await user.click(switchElement);
      expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });

    it('includes aria-describedby for helper text', () => {
      render(<Switch helperText="Additional
}}}