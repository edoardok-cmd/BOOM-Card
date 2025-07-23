import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Dropdown } from '../Dropdown';
import type { DropdownProps } from '../Dropdown.types';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('Dropdown', () => {
  const defaultOptions = [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'spa', label: 'Spa' },
    { value: 'entertainment', label: 'Entertainment' },
  ];

  const defaultProps: DropdownProps = {
    options: defaultOptions,
    placeholder: 'Select an option',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with placeholder', () => {
      render(<Dropdown {...defaultProps} />);
      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });

    it('should render with custom label', () => {
      render(<Dropdown {...defaultProps} label="Category" />);
      expect(screen.getByText('Category')).toBeInTheDocument();
    });

    it('should render with selected value', () => {
      render(<Dropdown {...defaultProps} value="hotel" />);
      expect(screen.getByText('Hotel')).toBeInTheDocument();
    });

    it('should render in disabled state', () => {
      render(<Dropdown {...defaultProps} disabled />);
      const trigger = screen.getByRole('button');
      expect(trigger).toBeDisabled();
      expect(trigger).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('should render with error state', () => {
      render(<Dropdown {...defaultProps} error="Please select a category" />);
      expect(screen.getByText('Please select a category')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveClass('border-red-500');
    });

    it('should render required indicator', () => {
      render(<Dropdown {...defaultProps} label="Category" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByText('*')).toHaveClass('text-red-500');
    });

    it('should render with custom className', () => {
      render(<Dropdown {...defaultProps} className="custom-dropdown" />);
      expect(screen.getByTestId('dropdown-container')).toHaveClass('custom-dropdown');
    });
  });

  describe('Interaction', () => {
    it('should open dropdown on click', async () => {
      render(<Dropdown {...defaultProps} />);
      
      await userEvent.click(trigger);
      
      await waitFor(() => {
        defaultOptions.forEach(option => {
          expect(screen.getByText(option.label)).toBeInTheDocument();
        });
      });
    });

    it('should close dropdown on click outside', async () => {
      render(
        <div>
          <Dropdown {...defaultProps} />
          <div data-testid="outside">Outside element</div>
        </div>
      );
      
      await userEvent.click(trigger);
      
      await waitFor(() => {
        expect(screen.getByText('Restaurant')).toBeInTheDocument();
      });
      
      await userEvent.click(screen.getByTestId('outside'));
      
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('should select option on click', async () => {
      render(<Dropdown {...defaultProps} />);
      
      await userEvent.click(screen.getByRole('button'));
      await userEvent.click(screen.getByText('Hotel'));
      
      expect(defaultProps.onChange).toHaveBeenCalledWith('hotel');
      expect(screen.getByText('Hotel')).toBeInTheDocument();
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('should not open when disabled', async () => {
      render(<Dropdown {...defaultProps} disabled />);
      
      await userEvent.click(screen.getByRole('button'));
      
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('should handle keyboard navigation', async () => {
      render(<Dropdown {...defaultProps} />);
      
      // Open with Enter
      trigger.focus();
      fireEvent.keyDown(trigger, { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
      
      // Navigate with arrow keys
      fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowDown' });
      expect(screen.getByText('Restaurant')).toHaveAttribute('data-highlighted', 'true');
      
      fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowDown' });
      expect(screen.getByText('Hotel')).toHaveAttribute('data-highlighted', 'true');
      
      // Select with Enter
      fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Enter' });
      expect(defaultProps.onChange).toHaveBeenCalledWith('hotel');
      
      // Close with Escape
      fireEvent.keyDown(trigger, { key: 'Enter' });
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
      
      fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('Search functionality', () => {
    it('should filter options based on search', async () => {
      render(<Dropdown {...defaultProps} searchable />);
      
      await userEvent.click(screen.getByRole('button'));
      const searchInput = screen.getByPlaceholderText('Search...');
      
      await userEvent.type(searchInput, 'hot');
      
      await waitFor(() => {
        expect(screen.getByText('Hotel')).toBeInTheDocument();
        expect(screen.queryByText('Restaurant')).not.toBeInTheDocument();
        expect(screen.queryByText('Spa')).not.toBeInTheDocument();
      });
    });

    it('should show no results message', async () => {
      render(<Dropdown {...defaultProps} searchable />);
      
      await userEvent.click(screen.getByRole('button'));
      
      await userEvent.type(searchInput, 'xyz');
      
      await waitFor(() => {
        expect(screen.getByText('No options found')).toBeInTheDocument();
      });
    });

    it('should clear search on close', async () => {
      render(<Dropdown {...defaultProps} searchable />);
      
      await userEvent.click(screen.getByRole('button'));
      
      await userEvent.type(searchInput, 'hot');
      await userEvent.click(document.body);
      
      await userEvent.click(screen.getByRole('button'));
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search...')).toHaveValue('');
        defaultOptions.forEach(option => {
          expect(screen.getByText(option.label)).toBeInTheDocument();
        });
      });
    });
  });

  describe('Multi-select functionality', () => {
    it('should allow multiple selections', async () => {
      const onChangeMulti = vi.fn();
      render(
        <Dropdown
          {...defaultProps}
          multiple
          value={[]}
          onChange={onChangeMulti}
        />
      );
      
      await userEvent.click(screen.getByRole('button'));
      await userEvent.click(screen.getByText('Restaurant'));
      
      expect(onChangeMulti).toHaveBeenCalledWith(['restaurant']);
      
      await userEvent.click(screen.getByText('Hotel'));
      expect(onChangeMulti).toHaveBeenCalledWith(['restaurant', 'hotel']);
    });

    it('should display multiple selected values', () => {
      render(
        <Dropdown
          {...defaultProps}
          multiple
          value={['restaurant', 'hotel']}
        />
      );
      
      expect(screen.getByText('Restaurant, Hotel')).toBeInTheDocument();
    });

    it('should remove selection on second click', async () => {
      render(
        <Dropdown
          {...defaultProps}
          multiple
          value={['restaurant', 'hotel']}
          onChange={onChangeMulti}
        />
      );
      
      await userEvent.click(screen.getByRole('button'));
      await userEvent.click(screen.getByText('Restaurant'));
      
      expect(onChangeMulti).toHaveBeenCalledWith(['hotel']);
    });

    it('should show checkboxes for multi-select', async () => {
      render(
        <Dropdown
          {...defaultProps}
          multiple
          value={['restaurant']}
        />
      );
      
      await userEvent.click(screen.getByRole('button'));
      
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(defaultOptions.length);
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
    });
  });

  describe('Loading state', () => {
    it('should show loading spinner', () => {
      render(<Dropdown {...defaultProps} loading />);
      expect(screen.getByTestId('dropdown-loading')).toBeInTheDocument();
    });

    it('should disable interaction while loading', async () => {
      render(<Dropdown {...defaultProps} loading />);
      
      await userEvent.click(trigger);
      
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('Custom rendering', () => {
    it('should use custom option renderer', async () => {
      const customRenderer = (option: any) => (
        <div data-testid={`custom-${option.value}`}>
          Custom: {option.label}
        </div>
      );
      
      render(
        <Dropdown
          {...defaultProps}
          renderOption={customRenderer}
        />
      );
      
      await userEvent.click(screen.getByRole('button'));
      
      expect(screen.getByTestId('custom-restaurant')).toBeInTheDocument();
      expect(screen.getByText('Custom: Restaurant')).toBeInTheDocument();
    });

    it('should use custom value renderer', () => {
        <span data-testid="custom-value">Selected: {value}</span>
      );
      
      render(
        <Dropdown
          {...defaultProps}
          value="hotel"
          renderValue={customRenderer}
        />
      );
      
      expect(screen.getByTestId('custom-value')).toBeInTheDocument();
      expect(screen.getByText('Selected: hotel')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<Dropdown {...defaultProps} label="Category" />);
      
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveAttribute('aria-labelledby');
    });

    it('should update ARIA attributes when open', async () => {
      render(<Dropdown {...defaultProps} />);
      
      await userEvent.click(trigger);
      
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('should support screen reader announcements', async () => {
      render(<Dropdown {...defaultProps} />);
      
      await userEvent.click(screen.getByRole('button'));
      await userEvent.click(screen.getByText('Hotel'));
      
      const announcement = screen.getByRole('status', { hidden: true });
      expect(announcement).toHaveTextContent('Hotel selected');
    });
  });

  describe('Size variant
}