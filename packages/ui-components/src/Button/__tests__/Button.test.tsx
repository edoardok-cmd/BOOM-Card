import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../Button';
import { defaultTheme } from '../../../theme';
import '@testing-library/jest-dom';

expect.extend(toHaveNoViolations);

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={defaultTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render with text content', () => {
      renderWithTheme(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('should render with children elements', () => {
      renderWithTheme(
        <Button>
          <span data-testid="icon">🎯</span>
          <span>Get Discount</span>
        </Button>
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('Get Discount')).toBeInTheDocument();
    });

    it('should render as a link when href is provided', () => {
      renderWithTheme(
        <Button as="a" href="/deals">
          View Deals
        </Button>
      );
      const link = screen.getByRole('link', { name: 'View Deals' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/deals');
    });
  });

  describe('Variants', () => {
    it('should render primary variant by default', () => {
      renderWithTheme(<Button>Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-primary');
    });

    it('should render secondary variant', () => {
      renderWithTheme(<Button variant="secondary">Secondary</Button>);
      expect(button).toHaveClass('btn-secondary');
    });

    it('should render outline variant', () => {
      renderWithTheme(<Button variant="outline">Outline</Button>);
      expect(button).toHaveClass('btn-outline');
    });

    it('should render ghost variant', () => {
      renderWithTheme(<Button variant="ghost">Ghost</Button>);
      expect(button).toHaveClass('btn-ghost');
    });

    it('should render danger variant', () => {
      renderWithTheme(<Button variant="danger">Delete</Button>);
      expect(button).toHaveClass('btn-danger');
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      renderWithTheme(<Button size="small">Small</Button>);
      expect(button).toHaveClass('btn-small');
    });

    it('should render medium size by default', () => {
      renderWithTheme(<Button>Medium</Button>);
      expect(button).toHaveClass('btn-medium');
    });

    it('should render large size', () => {
      renderWithTheme(<Button size="large">Large</Button>);
      expect(button).toHaveClass('btn-large');
    });
  });

  describe('States', () => {
    it('should handle disabled state', () => {
      renderWithTheme(<Button disabled>Disabled</Button>);
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should handle loading state', () => {
      renderWithTheme(<Button loading>Loading</Button>);
      expect(button).toBeDisabled();
      expect(screen.getByTestId('button-spinner')).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('should show loading text when provided', () => {
      renderWithTheme(
        <Button loading loadingText="Processing...">
          Submit
        </Button>
      );
      expect(screen.getByText('Processing...')).toBeInTheDocument();
      expect(screen.queryByText('Submit')).not.toBeInTheDocument();
    });

    it('should handle active state', () => {
      renderWithTheme(<Button active>Active</Button>);
      expect(button).toHaveClass('btn-active');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Interactions', () => {
    it('should call onClick handler when clicked', async () => {
      const handleClick = jest.fn();
      renderWithTheme(<Button onClick={handleClick}>Click</Button>);
      
      await userEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', async () => {
      renderWithTheme(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );
      
      await userEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not call onClick when loading', async () => {
      renderWithTheme(
        <Button loading onClick={handleClick}>
          Loading
        </Button>
      );
      
      await userEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should handle keyboard navigation', async () => {
      renderWithTheme(<Button onClick={handleClick}>Press Enter</Button>);
      
      button.focus();
      
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Icon Support', () => {
    it('should render with start icon', () => {
      const Icon = () => <span data-testid="start-icon">→</span>;
      renderWithTheme(
        <Button startIcon={<Icon />}>
          Next
        </Button>
      );
      
      expect(screen.getByTestId('start-icon')).toBeInTheDocument();
      expect(screen.getByTestId('start-icon').parentElement).toHaveClass('btn-icon-start');
    });

    it('should render with end icon', () => {
      renderWithTheme(
        <Button endIcon={<Icon />}>
          Back
        </Button>
      );
      
      expect(screen.getByTestId('end-icon')).toBeInTheDocument();
      expect(screen.getByTestId('end-icon').parentElement).toHaveClass('btn-icon-end');
    });

    it('should render icon-only button', () => {
      renderWithTheme(
        <Button iconOnly aria-label="Search">
          <span data-testid="search-icon">🔍</span>
        </Button>
      );
      
      expect(button).toHaveClass('btn-icon-only');
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });
  });

  describe('Full Width', () => {
    it('should render full width button', () => {
      renderWithTheme(<Button fullWidth>Full Width</Button>);
      expect(button).toHaveClass('btn-full-width');
      expect(button).toHaveStyle({ width: '100%' });
    });
  });

  describe('Form Integration', () => {
    it('should submit form when type is submit', async () => {
      const handleSubmit = jest.fn(e => e.preventDefault());
      renderWithTheme(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit</Button>
        </form>
      );
      
      await userEvent.click(button);
      
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('should reset form when type is reset', async () => {
      const TestForm = () => {
        const [value, setValue] = React.useState('test');
        return (
          <form>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              data-testid="input"
            />
            <Button type="reset">Reset</Button>
          </form>
        );
      };
      
      renderWithTheme(<TestForm />);
      
      const input = screen.getByTestId('input') as HTMLInputElement;
      
      await userEvent.clear(input);
      await userEvent.type(input, 'new value');
      expect(input.value).toBe('new value');
      
      await userEvent.click(button);
      expect(input.value).toBe('test');
    });
  });

  describe('Custom Props', () => {
    it('should pass through custom data attributes', () => {
      renderWithTheme(
        <Button data-testid="custom-button" data-tracking-id="promo-cta">
          Track Me
        </Button>
      );
      
      expect(button).toHaveAttribute('data-tracking-id', 'promo-cta');
    });

    it('should apply custom className', () => {
      renderWithTheme(
        <Button className="custom-class boom-button">
          Custom
        </Button>
      );
      
      expect(button).toHaveClass('custom-class', 'boom-button');
    });

    it('should apply custom styles', () => {
      renderWithTheme(
        <Button style={{ marginTop: '20px', backgroundColor: 'red' }}>
          Styled
        </Button>
      );
      
      expect(button).toHaveStyle({
        marginTop: '20px',
        backgroundColor
}}}}