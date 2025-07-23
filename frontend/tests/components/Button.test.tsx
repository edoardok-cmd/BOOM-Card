import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Button from '../../components/Button'; // Assuming component path is correct

// Mock the next-i18next useTranslation hook to control translations in tests
const mockT = vi.fn((key: string, options?: { count?: number; ns?: string }) => {
  // Simulate common namespace translations
  if (options?.ns === 'common') {
    if (key === 'submit') return 'Submit';
    if (key === 'loading') return 'Loading...';
  }
  // Simulate 'button' namespace translations for English
  if (mockI18n.language === 'en' && options?.ns === 'button') {
    if (key === 'click_me') return 'Click Me (EN)';
    if (key === 'cancel') return 'Cancel (EN)';
    if (key === 'action_button') return 'Action Button (EN)';
    if (key === 'save') return 'Save (EN)';
  }
  // Simulate 'button' namespace translations for Bulgarian
  if (mockI18n.language === 'bg' && options?.ns === 'button') {
    if (key === 'click_me') return 'Натисни ме (БГ)';
    if (key === 'cancel') return 'Отмени (БГ)';
    if (key === 'action_button') return 'Бутон за действие (БГ)';
    if (key === 'save') return 'Запази (БГ)';
  }
  return `test_translation_key:${key}`; // Fallback for unmatched keys
});

// Mock i18n instance to control and observe language changes
const mockI18n = {
  changeLanguage: vi.fn((lng: string) => {
    mockI18n.language = lng; // Simulate language change
  }),
  language: 'en', // Default language for tests
};

// Mock next-i18next module
vi.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
    i18n: mockI18n,
  }),
}));

// Mock Icon components for testing, simply rendering an SVG element with a test ID
const MockLeftIcon = () => <svg data-testid="left-icon" />;
const MockRightIcon = () => <svg data-testid="right-icon" />;

describe('Button Component', () => {
  // Reset language and clear all mock calls before each test
  beforeEach(() => {
    mockI18n.language = 'en'; // Ensure default language is English for each test
    vi.clearAllMocks(); // Clear calls to mockT and changeLanguage
  });

  // Test Case 1: Renders with children text content
  it('should render with provided children text', () => {
    render(<Button>Hello Button</Button>);
    expect(screen.getByRole('button', { name: 'Hello Button' })).toBeInTheDocument();
  });

  // Test Case 2: Renders with 'primary' variant class
  it('should render with primary variant styling', () => {
    render(<Button variant="primary">Primary Button</Button>);
    const button = screen.getByRole('button', { name: 'Primary Button' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('btn-primary'); // Assumes 'btn-primary' class for primary variant
  });

  // Test Case 3: Renders with 'secondary' variant class
  it('should render with secondary variant styling', () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('btn-secondary'); // Assumes 'btn-secondary' class
  });

  // Test Case 4: Renders with 'danger' variant class
  it('should render with danger variant styling', () => {
    render(<Button variant="danger">Danger Button</Button>);
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('btn-danger'); // Assumes 'btn-danger' class
  });

  // Test Case 5: Renders with 'small' size class
  it('should render with small size styling', () => {
    render(<Button size="small">Small Button</Button>);
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('btn-sm'); // Assumes 'btn-sm' class for small size
  });

  // Test Case 6: Renders with 'large' size class
  it('should render with large size styling', () => {
    render(<Button size="large">Large Button</Button>);
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('btn-lg'); // Assumes 'btn-lg' class for large size
  });

  // Test Case 7: Verifies onClick handler is called when the button is clicked
  it('should call onClick handler when the button is clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);

    await userEvent.click(button); // Use userEvent for more realistic DOM interaction

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Test Case 8: Verifies onClick handler is not called when the button is disabled
  it('should not call onClick handler when the button is disabled', async () => {
    render(<Button onClick={handleClick} disabled>Disabled Button</Button>);

    expect(button).toBeDisabled(); // Assert the button is disabled
    await userEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  // Test Case 9: Renders in loading state, displays loading text, and is disabled
  it('should render in loading state with translated loading text and be disabled', () => {
    render(<Button loading>Submit Form</Button>);
    // In loading state, the button's accessible name should become the translated "Loading..."
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled(); // Button should be disabled when loading
    // Expect a loading indicator (e.g., spinner) to be visible
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    // Ensure the original content is not visible
    expect(screen.queryByText('Submit Form')).not.toBeInTheDocument();
  });

  // Test Case 10: Verifies onClick handler is not called when the button is in loading state
  it('should not call onClick handler when the button is in loading state', async () => {
    render(<Button onClick={handleClick} loading>Action</Button>);

    await userEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  // Test Case 11: Renders with a left icon
  it('should render with a left icon when LeftIcon prop is provided', () => {
    render(<Button LeftIcon={MockLeftIcon}>Button with Left Icon</Button>);
    expect(screen.getByRole('button', { name: 'Button with Left Icon' })).toBeInTheDocument();
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  // Test Case 12: Renders with a right icon
  it('should render with a right icon when RightIcon prop is provided', () => {
    render(<Button RightIcon={MockRightIcon}>Button with Right Icon</Button>);
    expect(screen.getByRole('button', { name: 'Button with Right Icon' })).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  // Test Case 13: Renders with both left and right icons
  it('should render with both left and right icons when both props are provided', () => {
    render(<Button LeftIcon={MockLeftIcon} RightIcon={MockRightIcon}>Button with Both Icons</Button>);
    expect(screen.getByRole('button', { name: 'Button with Both Icons' })).toBeInTheDocument();
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  // Test Case 14: Icons are not rendered when button is in loading state
  it('should not render icons when the button is in loading state', () => {
    render(<Button LeftIcon={MockLeftIcon} RightIcon={MockRightIcon} loading>Loading</Button>);
    expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  // Test Case 15: Renders with a custom 'type' attribute
  it('should render with a custom type attribute (e.g., "submit")', () => {
    render(<Button type="submit">Submit Button</Button>);
    expect(button).toHaveAttribute('type', 'submit');
  });

  // Test Case 16: Renders with an accessibility label (aria-label)
  it('should render with an aria-label for improved accessibility', () => {
    render(<Button ariaLabel="Perform Important Action">Action</Button>);
    expect(button).toHaveAttribute('aria-label', 'Perform Important Action');
  });

  // Test Case 17: Renders icon-only button with aria-label
  it('should render an icon-only button with a proper aria-label', () => {
    render(<Button LeftIcon={MockLeftIcon} ariaLabel="Open Menu" />);
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Open Menu');
    expect(button).toHaveTextContent(''); // Ensure no unintended text content
  });

  // Test Case 18: Renders translated text using i18nKey (English)
  it('should render translated text from i18nKey in English', () => {
    render(<Button i18nKey="click_me" i18nNs="button" />);
    // Verify that the translation function was called with the correct key and namespace
    expect(mockT).toHaveBeenCalledWith('click_me', { ns: 'button' });
    expect(screen.getByRole('button', { name: 'Click Me (EN)' })).toBeInTheDocument();
  });

  // Test Case 19: Renders translated text using i18nKey (Bulgarian) after language change
  it('should render translated text from i18nKey in Bulgarian after language switch', () => {
    // Simulate language change for the mock i18n instance
    mockI18n.language = 'bg';

    render(<Button i18nKey="click_me" i18nNs="button" />);

    // Verify mockT was called and the button renders Bulgarian text
    expect(mockT).toHaveBeenCalledWith('click_me', { ns: 'button' });
    expect(screen.getByRole('button', { name: 'Натисни ме (БГ)' })).toBeInTheDocument();
  });

  // Test Case 20: Children prop should take precedence over i18nKey for button text
  it('should prioritize children prop over i18nKey if both are provided for visible text', () => {
    render(<Button i18nKey="button:click_me">Custom Button Text</Button>);
    expect(screen.getByRole('button', { name: 'Custom Button Text' })).toBeInTheDocument();
    // Ensure the i18n translated text is NOT present
    expect(screen.queryByText('Click Me (EN)')).not.toBeInTheDocument();
  });

  // Test Case 21: Renders button with additional custom className
  it('should render button with a custom className', () => {
    render(<Button className="my-extra-class">Styled Button</Button>);
    expect(button).toHaveClass('my-extra-class'); // Assert the custom class is applied
    expect(button).toHaveClass('btn'); // Ensure base class is also present
  });
});