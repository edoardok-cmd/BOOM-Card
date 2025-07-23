import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from '../Select';
import { SelectOption } from '../types';
import '@testing-library/jest-dom';

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('Select', () => {
  const mockOptions: SelectOption[] = [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'spa', label: 'Spa' },
    { value: 'entertainment', label: 'Entertainment' },
  ];

  const mockOptionsWithGroups: SelectOption[] = [
    { value: 'fine-dining', label: 'Fine Dining', group: 'Restaurants' },
    { value: 'casual-dining', label: 'Casual Dining', group: 'Restaurants' },
    { value: 'luxury-hotel', label: 'Luxury Hotel', group: 'Hotels' },
    { value: 'boutique-hotel', label: 'Boutique Hotel', group: 'Hotels' },
  ];

  const defaultProps = {
    options: mockOptions,
    placeholder: 'Select a category',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with placeholder', () => {
      render(<Select {...defaultProps} />);
      expect(screen.getByText('Select a category')).toBeInTheDocument();
    });

    it('should render with selected value', () => {
      render(<Select {...defaultProps} value="restaurant" />);
      expect(screen.getByText('Restaurant')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = render(<Select {...defaultProps} className="custom-select" />);
      expect(container.firstChild).toHaveClass('custom-select');
    });

    it('should render as disabled', () => {
      render(<Select {...defaultProps} disabled />);
      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-disabled', 'true');
    });

    it('should render with error state', () => {
      render(<Select {...defaultProps} error />);
      expect(trigger).toHaveClass('error');
    });

    it('should render with loading state', () => {
      render(<Select {...defaultProps} loading />);
      expect(screen.getByTestId('select-loading')).toBeInTheDocument();
    });

    it('should render with custom width', () => {
      const { container } = render(<Select {...defaultProps} width={300} />);
      const selectElement = container.firstChild as HTMLElement;
      expect(selectElement.style.width).toBe('300px');
    });

    it('should render searchable variant', () => {
      render(<Select {...defaultProps} searchable />);
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('should render with custom search placeholder', () => {
      render(<Select {...defaultProps} searchable searchPlaceholder="Find category..." />);
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByPlaceholderText('Find category...')).toBeInTheDocument();
    });
  });

  describe('Dropdown behavior', () => {
    it('should open dropdown on click', () => {
      render(<Select {...defaultProps} />);
      
      fireEvent.click(trigger);
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      mockOptions.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });

    it('should close dropdown on escape key', () => {
      render(<Select {...defaultProps} />);
      
      fireEvent.click(trigger);
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('should close dropdown on outside click', () => {
      render(
        <div>
          <Select {...defaultProps} />
          <button>Outside button</button>
        </div>
      );
      
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      
      fireEvent.mouseDown(screen.getByText('Outside button'));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('should not open dropdown when disabled', () => {
      render(<Select {...defaultProps} disabled />);
      
      fireEvent.click(trigger);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('Selection behavior', () => {
    it('should select option on click', () => {
      render(<Select {...defaultProps} />);
      
      fireEvent.click(screen.getByRole('button'));
      fireEvent.click(screen.getByText('Hotel'));
      
      expect(defaultProps.onChange).toHaveBeenCalledWith('hotel');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('should not close dropdown on selection with closeOnSelect=false', () => {
      render(<Select {...defaultProps} closeOnSelect={false} />);
      
      fireEvent.click(screen.getByRole('button'));
      fireEvent.click(screen.getByText('Hotel'));
      
      expect(defaultProps.onChange).toHaveBeenCalledWith('hotel');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('should handle multi-select', () => {
      const multiSelectProps = {
        ...defaultProps,
        multiple: true,
        value: ['restaurant'],
      };
      
      render(<Select {...multiSelectProps} />);
      
      fireEvent.click(screen.getByRole('button'));
      fireEvent.click(screen.getByText('Hotel'));
      
      expect(defaultProps.onChange).toHaveBeenCalledWith(['restaurant', 'hotel']);
    });

    it('should handle deselection in multi-select', () => {
        ...defaultProps,
        multiple: true,
        value: ['restaurant', 'hotel'],
      };
      
      render(<Select {...multiSelectProps} />);
      
      fireEvent.click(screen.getByRole('button'));
      fireEvent.click(screen.getByText('Restaurant'));
      
      expect(defaultProps.onChange).toHaveBeenCalledWith(['hotel']);
    });

    it('should clear selection with clearable', () => {
      render(<Select {...defaultProps} value="restaurant" clearable />);
      
      const clearButton = screen.getByLabelText('Clear selection');
      fireEvent.click(clearButton);
      
      expect(defaultProps.onChange).toHaveBeenCalledWith(undefined);
    });

    it('should clear all selections in multi-select', () => {
      render(<Select {...defaultProps} value={['restaurant', 'hotel']} multiple clearable />);
      
      fireEvent.click(clearButton);
      
      expect(defaultProps.onChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Keyboard navigation', () => {
    it('should navigate options with arrow keys', async () => {
      render(<Select {...defaultProps} />);
      
      fireEvent.click(trigger);
      
      fireEvent.keyDown(trigger, { key: 'ArrowDown' });
      expect(screen.getByText('Restaurant')).toHaveClass('highlighted');
      
      fireEvent.keyDown(trigger, { key: 'ArrowDown' });
      expect(screen.getByText('Hotel')).toHaveClass('highlighted');
      
      fireEvent.keyDown(trigger, { key: 'ArrowUp' });
      expect(screen.getByText('Restaurant')).toHaveClass('highlighted');
    });

    it('should select option with Enter key', () => {
      render(<Select {...defaultProps} />);
      
      fireEvent.click(trigger);
      fireEvent.keyDown(trigger, { key: 'ArrowDown' });
      fireEvent.keyDown(trigger, { key: 'ArrowDown' });
      fireEvent.keyDown(trigger, { key: 'Enter' });
      
      expect(defaultProps.onChange).toHaveBeenCalledWith('hotel');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('should open dropdown with Space key', () => {
      render(<Select {...defaultProps} />);
      
      trigger.focus();
      fireEvent.keyDown(trigger, { key: ' ' });
      
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('should support Home and End keys', () => {
      render(<Select {...defaultProps} />);
      
      fireEvent.click(trigger);
      
      fireEvent.keyDown(trigger, { key: 'End' });
      expect(screen.getByText('Entertainment')).toHaveClass('highlighted');
      
      fireEvent.keyDown(trigger, { key: 'Home' });
      expect(screen.getByText('Restaurant')).toHaveClass('highlighted');
    });
  });

  describe('Search functionality', () => {
    it('should filter options based on search', async () => {
      const user = userEvent.setup();
      render(<Select {...defaultProps} searchable />);
      
      fireEvent.click(screen.getByRole('button'));
      const searchInput = screen.getByPlaceholderText('Search...');
      
      await user.type(searchInput, 'hot');
      
      expect(screen.getByText('Hotel')).toBeInTheDocument();
      expect(screen.queryByText('Restaurant')).not.toBeInTheDocument();
      expect(screen.queryByText('Spa')).not.toBeInTheDocument();
    });

    it('should show no results message', async () => {
      render(<Select {...defaultProps} searchable />);
      
      fireEvent.click(screen.getByRole('button'));
      
      await user.type(searchInput, 'xyz');
      
      expect(screen.ge
}}}