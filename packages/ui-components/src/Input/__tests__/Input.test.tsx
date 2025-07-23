import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../Input';
import { vi } from 'vitest';

describe('Input Component', () => {
  describe('Basic Rendering', () => {
    it('should render input element', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<Input label="Email Address" />);
      expect(screen.getByText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(<Input placeholder="Enter your email" />);
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    });

    it('should render with helper text', () => {
      render(<Input helperText="We'll never share your email" />);
      expect(screen.getByText("We'll never share your email")).toBeInTheDocument();
    });

    it('should render with error message', () => {
      render(<Input error errorMessage="Email is required" />);
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    it('should render required indicator', () => {
      render(<Input label="Email" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('Input Types', () => {
    it('should render text input by default', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
    });

    it('should render email input', () => {
      render(<Input type="email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
    });

    it('should render password input', () => {
      render(<Input type="password" />);
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should render number input', () => {
      render(<Input type="number" />);
      expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number');
    });

    it('should render search input', () => {
      render(<Input type="search" />);
      expect(screen.getByRole('searchbox')).toHaveAttribute('type', 'search');
    });

    it('should render tel input', () => {
      render(<Input type="tel" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'tel');
    });

    it('should render url input', () => {
      render(<Input type="url" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'url');
    });
  });

  describe('Input States', () => {
    it('should handle disabled state', () => {
      render(<Input disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('should handle readonly state', () => {
      render(<Input readOnly value="Read only value" />);
      expect(input).toHaveAttribute('readonly');
      expect(input).toHaveValue('Read only value');
    });

    it('should apply error styles when error prop is true', () => {
      render(<Input error />);
      expect(input).toHaveClass('border-red-500');
    });

    it('should apply success styles when success prop is true', () => {
      render(<Input success />);
      expect(input).toHaveClass('border-green-500');
    });

    it('should handle loading state', () => {
      render(<Input loading />);
      expect(screen.getByTestId('input-spinner')).toBeInTheDocument();
    });
  });

  describe('Icons and Addons', () => {
    it('should render with left icon', () => {
      const MailIcon = () => <svg data-testid="mail-icon" />;
      render(<Input leftIcon={<MailIcon />} />);
      expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
    });

    it('should render with right icon', () => {
      const SearchIcon = () => <svg data-testid="search-icon" />;
      render(<Input rightIcon={<SearchIcon />} />);
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    it('should render with prefix', () => {
      render(<Input prefix="$" />);
      expect(screen.getByText('$')).toBeInTheDocument();
    });

    it('should render with suffix', () => {
      render(<Input suffix=".com" />);
      expect(screen.getByText('.com')).toBeInTheDocument();
    });

    it('should render clear button when clearable and has value', () => {
      render(<Input clearable value="test" onChange={() => {}} />);
      expect(screen.getByTestId('clear-button')).toBeInTheDocument();
    });

    it('should not render clear button when clearable but no value', () => {
      render(<Input clearable value="" />);
      expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument();
    });
  });

  describe('Password Input Features', () => {
    it('should toggle password visibility', async () => {
      render(<Input type="password" showPasswordToggle />);
      const toggleButton = screen.getByTestId('password-toggle');

      expect(input).toHaveAttribute('type', 'password');

      await userEvent.click(toggleButton);
      expect(input).toHaveAttribute('type', 'text');

      await userEvent.click(toggleButton);
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should show password strength indicator', () => {
      render(<Input type="password" showPasswordStrength value="weak123" />);
      expect(screen.getByTestId('password-strength')).toBeInTheDocument();
    });

    it('should update password strength on value change', async () => {
      const { rerender } = render(<Input type="password" showPasswordStrength value="" />);
      
      rerender(<Input type="password" showPasswordStrength value="weak" />);
      expect(screen.getByText('Weak')).toBeInTheDocument();

      rerender(<Input type="password" showPasswordStrength value="MediumPass123" />);
      expect(screen.getByText('Medium')).toBeInTheDocument();

      rerender(<Input type="password" showPasswordStrength value="Str0ng!Pass@2023" />);
      expect(screen.getByText('Strong')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle onChange event', async () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);

      await userEvent.type(input, 'Hello');
      expect(handleChange).toHaveBeenCalledTimes(5);
      expect(input).toHaveValue('Hello');
    });

    it('should handle onBlur event', async () => {
      const handleBlur = vi.fn();
      render(<Input onBlur={handleBlur} />);

      await userEvent.click(input);
      await userEvent.tab();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('should handle onFocus event', async () => {
      const handleFocus = vi.fn();
      render(<Input onFocus={handleFocus} />);

      await userEvent.click(input);
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('should handle onKeyDown event', async () => {
      const handleKeyDown = vi.fn();
      render(<Input onKeyDown={handleKeyDown} />);

      await userEvent.click(input);
      await userEvent.keyboard('{Enter}');
      expect(handleKeyDown).toHaveBeenCalled();
    });

    it('should clear input when clear button is clicked', async () => {
      render(<Input clearable value="test value" onChange={handleChange} />);
      
      const clearButton = screen.getByTestId('clear-button');
      await userEvent.click(clearButton);
      
      expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
        target: expect.objectContaining({ value: '' })
      }));
    });
  });

  describe('Validation', () => {
    it('should show error message when validation fails', () => {
      render(<Input error errorMessage="Invalid email format" />);
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      expect(screen.getByText('Invalid email format')).toHaveClass('text-red-500');
    });

    it('should handle pattern validation', () => {
      const handleInvalid = vi.fn();
      render(
        <Input 
          type="email" 
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
          onInvalid={handleInvalid}
        />
      );
      
      input.checkValidity();
    });

    it('should handle min and max for number inputs', () => {
      render(<Input type="number" min={0} max={100} />);
      
      expect(input).toHaveAttribute('min', '0');
      expect(input).toHaveAttribute('max', '100');
    });

    it('should handle minLength and maxLength', () => {
      render(<Input minLength={3} maxLength={10} />);
      
      expect(input).toHaveAttribute('minLength', '3');
      expect(input).toHaveAttribute('maxLength', '10');
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria labels', () => {
      render(<Input aria-label="Email input" />);
      expect(screen.getByLabelText('Email input')).toBeInTheDocument();
    });

    it('should associate label with input', () => {
      render(<Input label="Username" id="username-input" />);
      expect(input).toHaveAttribute('id', 'username-input');
    });

    it('should have aria-invalid when error', () => {
      render(<Input error />);
      expect(sc
}}}