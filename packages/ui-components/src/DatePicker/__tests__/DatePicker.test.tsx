import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from '../DatePicker';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock date-fns for consistent testing
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  return {
    ...actual,
    startOfToday: () => new Date('2024-01-15'),
  };
});

describe('DatePicker', () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    value: null,
    onChange: mockOnChange,
    placeholder: 'Select date',
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<DatePicker {...defaultProps} />);
      expect(screen.getByPlaceholderText('Select date')).toBeInTheDocument();
    });

    it('should display the selected date when value is provided', () => {
      const selectedDate = new Date('2024-01-20');
      render(<DatePicker {...defaultProps} value={selectedDate} />);
      expect(screen.getByDisplayValue('20/01/2024')).toBeInTheDocument();
    });

    it('should display custom placeholder', () => {
      render(<DatePicker {...defaultProps} placeholder="Choose a date" />);
      expect(screen.getByPlaceholderText('Choose a date')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<DatePicker {...defaultProps} className="custom-datepicker" />);
      const container = screen.getByTestId('datepicker-container');
      expect(container).toHaveClass('custom-datepicker');
    });

    it('should be disabled when disabled prop is true', () => {
      render(<DatePicker {...defaultProps} disabled />);
      const input = screen.getByPlaceholderText('Select date');
      expect(input).toBeDisabled();
    });

    it('should show required indicator when required prop is true', () => {
      render(<DatePicker {...defaultProps} required label="Date" />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('Calendar Interactions', () => {
    it('should open calendar on input click', async () => {
      render(<DatePicker {...defaultProps} />);
      
      await userEvent.click(input);
      expect(screen.getByTestId('calendar-popup')).toBeInTheDocument();
    });

    it('should close calendar on outside click', async () => {
      render(
        <div>
          <DatePicker {...defaultProps} />
          <button>Outside</button>
        </div>
      );
      
      await userEvent.click(input);
      expect(screen.getByTestId('calendar-popup')).toBeInTheDocument();
      
      await userEvent.click(screen.getByText('Outside'));
      expect(screen.queryByTestId('calendar-popup')).not.toBeInTheDocument();
    });

    it('should close calendar on Escape key', async () => {
      render(<DatePicker {...defaultProps} />);
      
      await userEvent.click(input);
      expect(screen.getByTestId('calendar-popup')).toBeInTheDocument();
      
      await userEvent.keyboard('{Escape}');
      expect(screen.queryByTestId('calendar-popup')).not.toBeInTheDocument();
    });

    it('should select date on click', async () => {
      render(<DatePicker {...defaultProps} />);
      
      await userEvent.click(input);
      const dateButton = screen.getByText('20');
      await userEvent.click(dateButton);
      
      expect(mockOnChange).toHaveBeenCalledWith(expect.any(Date));
      expect(screen.queryByTestId('calendar-popup')).not.toBeInTheDocument();
    });

    it('should navigate months with arrow buttons', async () => {
      render(<DatePicker {...defaultProps} />);
      
      await userEvent.click(input);
      const prevButton = screen.getByLabelText('Previous month');
      const nextButton = screen.getByLabelText('Next month');
      
      const initialMonth = screen.getByTestId('current-month').textContent;
      
      await userEvent.click(nextButton);
      expect(screen.getByTestId('current-month').textContent).not.toBe(initialMonth);
      
      await userEvent.click(prevButton);
      await userEvent.click(prevButton);
      expect(screen.getByTestId('current-month').textContent).not.toBe(initialMonth);
    });

    it('should navigate to today with today button', async () => {
      render(<DatePicker {...defaultProps} showTodayButton />);
      
      await userEvent.click(input);
      const todayButton = screen.getByText('Today');
      
      await userEvent.click(todayButton);
      expect(mockOnChange).toHaveBeenCalledWith(expect.any(Date));
    });
  });

  describe('Date Constraints', () => {
    it('should disable dates before minDate', async () => {
      const minDate = new Date('2024-01-10');
      render(<DatePicker {...defaultProps} minDate={minDate} />);
      
      await userEvent.click(input);
      
      const disabledDate = screen.getByText('5');
      expect(disabledDate).toHaveAttribute('disabled');
    });

    it('should disable dates after maxDate', async () => {
      const maxDate = new Date('2024-01-20');
      render(<DatePicker {...defaultProps} maxDate={maxDate} />);
      
      await userEvent.click(input);
      
      expect(disabledDate).toHaveAttribute('disabled');
    });

    it('should disable specific dates with disabledDates', async () => {
      const disabledDates = [
        new Date('2024-01-15'),
        new Date('2024-01-16'),
      ];
      render(<DatePicker {...defaultProps} disabledDates={disabledDates} />);
      
      await userEvent.click(input);
      
      expect(screen.getByText('15')).toHaveAttribute('disabled');
      expect(screen.getByText('16')).toHaveAttribute('disabled');
    });

    it('should disable weekends when disableWeekends is true', async () => {
      render(<DatePicker {...defaultProps} disableWeekends />);
      
      await userEvent.click(input);
      
      // Assuming January 2024 where 13th and 14th are weekend
      const saturday = screen.getByText('13');
      const sunday = screen.getByText('14');
      
      expect(saturday).toHaveAttribute('disabled');
      expect(sunday).toHaveAttribute('disabled');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate calendar with arrow keys', async () => {
      render(<DatePicker {...defaultProps} />);
      
      await userEvent.click(input);
      const initialFocused = screen.getByTestId('focused-date');
      
      await userEvent.keyboard('{ArrowRight}');
      expect(screen.getByTestId('focused-date')).not.toBe(initialFocused);
      
      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{ArrowLeft}');
      await userEvent.keyboard('{ArrowUp}');
    });

    it('should select date with Enter key', async () => {
      render(<DatePicker {...defaultProps} />);
      
      await userEvent.click(input);
      await userEvent.keyboard('{Enter}');
      
      expect(mockOnChange).toHaveBeenCalled();
      expect(screen.queryByTestId('calendar-popup')).not.toBeInTheDocument();
    });

    it('should navigate months with PageUp/PageDown', async () => {
      render(<DatePicker {...defaultProps} />);
      
      await userEvent.click(input);
      
      await userEvent.keyboard('{PageDown}');
      expect(screen.getByTestId('current-month').textContent).not.toBe(initialMonth);
      
      await userEvent.keyboard('{PageUp}');
      await userEvent.keyboard('{PageUp}');
      expect(screen.getByTestId('current-month').textContent).not.toBe(initialMonth);
    });
  });

  describe('Input Formatting', () => {
    it('should format date according to dateFormat prop', () => {
      render(
        <DatePicker
          {...defaultProps}
          value={selectedDate}
          dateFormat="yyyy-MM-dd"
        />
      );
      expect(screen.getByDisplayValue('2024-01-20')).toBeInTheDocument();
    });

    it('should parse manual input correctly', async () => {
      render(<DatePicker {...defaultProps} />);
      
      await userEvent.clear(input);
      await userEvent.type(input, '25/12/2024');
      await userEvent.tab();
      
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          getFullYear: expect.any(Function),
          getMonth: expect.any(Function),
          getDate: expect.any(Function),
        })
      );
    });

    it('should handle invalid manual input', async () => {
      render(<DatePicker {...defaultProps} />);
      
      await userEvent.clear(input);
      await userEvent.type(input, 'invalid date');
      await userEvent.tab();
      
      expect(screen.getByText('Invalid date format')).toBeInTheDocument();
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Localization', () => {
    it('should display weekdays in English by default', async () => {
      render(<DatePicker {...defaultProps} />);
      
      await userEvent.click(input);
      expect(screen.getByText('Su')).toBeInTheDocument();
      expect(screen.getByText('Mo')).toBeInTheDocument();
    });

    it('should display weekdays in Bulgarian when locale is bg', async () => {
      render(<DatePicker {...defaultProps} locale="bg" />);
      
      await userEvent.click(input);
      expect(screen.getByText('Нд')).toBeInTheDocument();
      expect(screen.getByText('Пн')).toBeInTheDocument();
    });

    it('should display month names in correct locale', async () => {
      render(<DatePicker {...defaultProps} locale="bg" />);
      
      await userEvent.click(input);
      expect(screen.getByTestId('current-month')).toHaveTextContent(/януари/i);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<DatePicker {...defaultProps} label="Event Date" />);
      
      expect(input).toHaveAttribute('aria-label', 'Event Date');
      expect(input).toHaveAttribute('aria-required', 'false');
    });

    it('should indicate required field with ARIA', () => {
      render(<DatePicker {...defaultProps} required label="Date" />);
      
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('should announce selected date to screen readers', async () => {
      render(<DatePicker {...defaultProps} />);
      
      await userEvent.click(input);
      await userEvent.click(dateButton);
      
      expect(screen.getByRole('status
}}}