import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ThemeProvider } from 'styled-components';
import { Checkbox } from '../Checkbox';
import { defaultTheme } from '../../../theme';
import '@testing-library/jest-dom';

expect.extend(toHaveNoViolations);

// Mock theme for testing
const mockTheme = {
  ...defaultTheme,
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    error: '#dc3545',
    success: '#28a745',
    text: '#212529',
    textLight: '#6c757d',
    border: '#dee2e6',
    background: '#ffffff',
    disabled: '#e9ecef',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  typography: {
    fontSize: {
      sm: '14px',
      md: '16px',
      lg: '18px',
    },
  },
  transitions: {
    fast: '0.15s ease-in-out',
    medium: '0.3s ease-in-out',
  },
};

// Helper function to render with theme
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={mockTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('Checkbox Component', () => {
  describe('Basic Rendering', () => {
    it('should render correctly with default props', () => {
      renderWithTheme(<Checkbox />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
      expect(checkbox).not.toBeDisabled();
    });

    it('should render with label', () => {
      const label = 'Accept terms and conditions';
      renderWithTheme(<Checkbox label={label} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    });

    it('should render with custom id', () => {
      const customId = 'custom-checkbox-id';
      renderWithTheme(<Checkbox id={customId} />);
      expect(checkbox).toHaveAttribute('id', customId);
    });

    it('should render with name attribute', () => {
      const name = 'agreement';
      renderWithTheme(<Checkbox name={name} />);
      expect(checkbox).toHaveAttribute('name', name);
    });
  });

  describe('State Management', () => {
    it('should be checked when checked prop is true', () => {
      renderWithTheme(<Checkbox checked />);
      expect(checkbox).toBeChecked();
    });

    it('should be unchecked when checked prop is false', () => {
      renderWithTheme(<Checkbox checked={false} />);
      expect(checkbox).not.toBeChecked();
    });

    it('should toggle checked state on click', async () => {
      const handleChange = jest.fn();
      renderWithTheme(<Checkbox onChange={handleChange} />);
      
      await userEvent.click(checkbox);
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('should handle controlled component state', async () => {
      const ControlledCheckbox = () => {
        const [checked, setChecked] = React.useState(false);
        return (
          <Checkbox
            checked={checked}
            onChange={setChecked}
            label="Controlled checkbox"
          />
        );
      };

      renderWithTheme(<ControlledCheckbox />);
      
      expect(checkbox).not.toBeChecked();
      await userEvent.click(checkbox);
      expect(checkbox).toBeChecked();
      await userEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('should support indeterminate state', () => {
      renderWithTheme(<Checkbox indeterminate />);
      expect(checkbox.indeterminate).toBe(true);
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      renderWithTheme(<Checkbox disabled />);
      expect(checkbox).toBeDisabled();
    });

    it('should not trigger onChange when disabled', async () => {
      renderWithTheme(<Checkbox disabled onChange={handleChange} />);
      
      await userEvent.click(checkbox);
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should apply disabled styles to label', () => {
      const { container } = renderWithTheme(
        <Checkbox disabled label="Disabled checkbox" />
      );
      expect(label).toHaveStyle('cursor: not-allowed');
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      const { container } = renderWithTheme(<Checkbox size="small" />);
      const wrapper = container.querySelector('[data-testid="checkbox-wrapper"]');
      expect(wrapper).toHaveClass('size-small');
    });

    it('should render medium size by default', () => {
      const { container } = renderWithTheme(<Checkbox />);
      expect(wrapper).toHaveClass('size-medium');
    });

    it('should render large size', () => {
      const { container } = renderWithTheme(<Checkbox size="large" />);
      expect(wrapper).toHaveClass('size-large');
    });
  });

  describe('Variants', () => {
    it('should render primary variant by default', () => {
      const { container } = renderWithTheme(<Checkbox />);
      expect(wrapper).toHaveClass('variant-primary');
    });

    it('should render secondary variant', () => {
      const { container } = renderWithTheme(<Checkbox variant="secondary" />);
      expect(wrapper).toHaveClass('variant-secondary');
    });

    it('should render error variant', () => {
      const { container } = renderWithTheme(<Checkbox variant="error" />);
      expect(wrapper).toHaveClass('variant-error');
    });

    it('should render success variant', () => {
      const { container } = renderWithTheme(<Checkbox variant="success" />);
      expect(wrapper).toHaveClass('variant-success');
    });
  });

  describe('Error State', () => {
    it('should display error message', () => {
      const errorMessage = 'This field is required';
      renderWithTheme(<Checkbox error={errorMessage} />);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should apply error styles when error is present', () => {
      const { container } = renderWithTheme(<Checkbox error="Error" />);
      expect(wrapper).toHaveClass('has-error');
    });

    it('should announce error to screen readers', () => {
      renderWithTheme(<Checkbox error={errorMessage} />);
      const errorElement = screen.getByText(errorMessage);
      expect(errorElement).toHaveAttribute('role', 'alert');
    });
  });

  describe('Helper Text', () => {
    it('should display helper text', () => {
      const helperText = 'Optional field';
      renderWithTheme(<Checkbox helperText={helperText} />);
      expect(screen.getByText(helperText)).toBeInTheDocument();
    });

    it('should link helper text to checkbox for accessibility', () => {
      renderWithTheme(<Checkbox helperText={helperText} />);
      expect(checkbox).toHaveAttribute('aria-describedby');
    });
  });

  describe('Required State', () => {
    it('should mark checkbox as required', () => {
      renderWithTheme(<Checkbox required />);
      expect(checkbox).toHaveAttribute('aria-required', 'true');
      expect(checkbox).toHaveAttribute('required');
    });

    it('should show required indicator in label', () => {
      renderWithTheme(<Checkbox required label="Terms" />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('Keyboard Interaction', () => {
    it('should toggle on space key press', async () => {
      renderWithTheme(<Checkbox onChange={handleChange} />);
      
      checkbox.focus();
      fireEvent.keyDown(checkbox, { key: ' ', code: 'Space' });
      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith(true);
      });
    });

    it('should be focusable', () => {
      renderWithTheme(<Checkbox />);
      
      checkbox.focus();
      expect(checkbox).toHaveFocus();
    });

    it('should handle tab navigation', async () => {
      renderWithTheme(
        <>
          <input type="text" placeholder="Before" />
          <Checkbox label="Middle checkbox" />
          <input type="text" placeholder="After" />
        </>
      );
      
      const beforeInput = screen.getByPlaceholderText('Before');
      const afterInput = screen.getByPlaceholderText('After');
      
      beforeInput.focus();
      await userEvent.t
}}}