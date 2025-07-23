import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { Form } from '../Form';
import { FormField } from '../FormField';
import { FormProps, FormFieldProps, ValidationRule } from '../types';

// Mock implementations
const mockOnSubmit = jest.fn();
const mockOnChange = jest.fn();
const mockOnBlur = jest.fn();
const mockOnValidate = jest.fn();

// Test data
const testFormData = {
  email: 'test@example.com',
  password: 'Test123!',
  confirmPassword: 'Test123!',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1234567890',
  agreeToTerms: true
};

// Validation rules
const emailValidation: ValidationRule[] = [
  {
    type: 'required',
    message: 'Email is required'
  },
  {
    type: 'email',
    message: 'Invalid email format'
  }
];

const passwordValidation: ValidationRule[] = [
  {
    type: 'required',
    message: 'Password is required'
  },
  {
    type: 'minLength',
    value: 8,
    message: 'Password must be at least 8 characters'
  },
  {
    type: 'pattern',
    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'Password must contain uppercase, lowercase, number and special character'
  }
];

describe('Form Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render form with default props', () => {
      render(<Form onSubmit={mockOnSubmit} />);
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
    });

    it('should render form with custom className', () => {
      render(<Form onSubmit={mockOnSubmit} className="custom-form" />);
      expect(form).toHaveClass('custom-form');
    });

    it('should render form with custom id', () => {
      render(<Form onSubmit={mockOnSubmit} id="test-form" />);
      expect(form).toHaveAttribute('id', 'test-form');
    });

    it('should render form fields as children', () => {
      render(
        <Form onSubmit={mockOnSubmit}>
          <FormField name="email" label="Email" />
          <FormField name="password" label="Password" type="password" />
        </Form>
      );
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('should render submit button when provided', () => {
      render(
        <Form onSubmit={mockOnSubmit} submitButton={{ text: 'Submit Form' }} />
      );
      expect(screen.getByRole('button', { name: 'Submit Form' })).toBeInTheDocument();
    });

    it('should render loading state', () => {
      render(
        <Form onSubmit={mockOnSubmit} isLoading={true} submitButton={{ text: 'Submit' }} />
      );
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should render error message', () => {
      const errorMessage = 'Form submission failed';
      render(<Form onSubmit={mockOnSubmit} error={errorMessage} />);
      expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
    });

    it('should render success message', () => {
      const successMessage = 'Form submitted successfully';
      render(<Form onSubmit={mockOnSubmit} success={successMessage} />);
      expect(screen.getByRole('status')).toHaveTextContent(successMessage);
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with form data', async () => {
      const user = userEvent.setup();
      render(
        <Form onSubmit={mockOnSubmit} submitButton={{ text: 'Submit' }}>
          <FormField name="email" label="Email" />
          <FormField name="password" label="Password" type="password" />
        </Form>
      );

      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'Test123!');
      await user.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'Test123!'
        });
      });
    });

    it('should prevent submission when form is invalid', async () => {
      render(
        <Form onSubmit={mockOnSubmit} submitButton={{ text: 'Submit' }}>
          <FormField 
            name="email" 
            label="Email" 
            validation={emailValidation}
            required
          />
        </Form>
      );

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('should handle async onSubmit', async () => {
      const asyncOnSubmit = jest.fn().mockResolvedValue({ success: true });
      
      render(
        <Form onSubmit={asyncOnSubmit} submitButton={{ text: 'Submit' }}>
          <FormField name="email" label="Email" />
        </Form>
      );

      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(asyncOnSubmit).toHaveBeenCalledWith({ email: 'test@example.com' });
      });
    });

    it('should handle submission errors', async () => {
      const failingOnSubmit = jest.fn().mockRejectedValue(new Error(errorMessage));
      
      render(
        <Form onSubmit={failingOnSubmit} submitButton={{ text: 'Submit' }}>
          <FormField name="email" label="Email" />
        </Form>
      );

      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
      });
    });

    it('should disable form during submission', async () => {
      const slowSubmit = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      
      render(
        <Form onSubmit={slowSubmit} submitButton={{ text: 'Submit' }}>
          <FormField name="email" label="Email" />
        </Form>
      );

      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', { name: 'Submit' });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(emailInput).toBeDisabled();

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
        expect(emailInput).not.toBeDisabled();
      });
    });
  });

  describe('Validation', () => {
    it('should validate required fields', async () => {
      render(
        <Form onSubmit={mockOnSubmit} submitButton={{ text: 'Submit' }}>
          <FormField 
            name="email" 
            label="Email" 
            validation={[{ type: 'required', message: 'Email is required' }]}
          />
        </Form>
      );

      await user.click(emailInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      render(
        <Form onSubmit={mockOnSubmit}>
          <FormField 
            name="email" 
            label="Email" 
            validation={emailValidation}
          />
        </Form>
      );

      await user.type(emailInput, 'invalid-email');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });
    });

    it('should validate password strength', async () => {
      render(
        <Form onSubmit={mockOnSubmit}>
          <FormField 
            name="password" 
            label="Password" 
            type="password"
            validation={passwordValidation}
          />
        </Form>
      );

      const passwordInput = screen.getByLabelText('Password');
      
      // Test short password
      await user.type(passwordInput, 'short');
      await user.tab();
      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
      });

      // Test weak password
      await user.clear(passwordInput);
      await user.type(passwordInput, 'weakpassword');
      await user.tab();
      await waitFor(() => {
        expect(screen.getByText('Password must contain uppercase, lowercase, number and special character')).toBeInTheDocument();
      });
    });

    it('should validate matching fields', async () => {
      render(
        <Form onSubmit={mockOnSubmit}>
          <FormField 
            name="password" 
            label="Password" 
            type="password"
          />
          <FormField 
            name="confirmPassword" 
            label="Confirm Password" 
            type="password"
            validation={[
              {
                type: 'match',
                field: 'password',
                message: 'Passwords do not match'
              }
            ]}
          />
  
}}}