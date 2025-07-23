import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimePicker } from '../TimePicker';
import { vi } from 'vitest';

// Mock date utility functions
vi.mock('@/utils/date', () => ({
  formatTime: (date: Date, format: string) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return format === '24h' ? `${hours}:${minutes}` : 
      `${hours > 12 ? hours - 12 : hours || 12}:${minutes} ${hours >= 12 ? 'PM' : 'AM'}`;
  },
  parseTime: (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }));

describe('TimePicker', () => {
  const defaultProps = {
    value: new Date(2024, 0, 1, 14, 30),
    onChange: vi.fn(),
    label: 'Select Time'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with label', () => {
      render(<TimePicker {...defaultProps} />);
      expect(screen.getByText('Select Time')).toBeInTheDocument();
    });

    it('should render without label when not provided', () => {
      const { container } = render(<TimePicker {...defaultProps} label={undefined} />);
      expect(container.querySelector('label')).not.toBeInTheDocument();
    });

    it('should display formatted time value', () => {
      render(<TimePicker {...defaultProps} />);
      expect(screen.getByDisplayValue('14:30')).toBeInTheDocument();
    });

    it('should display time in 12-hour format when specified', () => {
      render(<TimePicker {...defaultProps} format="12h" />);
      expect(screen.getByDisplayValue('2:30 PM')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = render(<TimePicker {...defaultProps} className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should render disabled state', () => {
      render(<TimePicker {...defaultProps} disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('should render with error state', () => {
      render(<TimePicker {...defaultProps} error="Invalid time" />);
      expect(screen.getByText('Invalid time')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveClass('error');
    });

    it('should render with helper text', () => {
      render(<TimePicker {...defaultProps} helperText="Select a valid time" />);
      expect(screen.getByText('Select a valid time')).toBeInTheDocument();
    });

    it('should render required indicator', () => {
      render(<TimePicker {...defaultProps} required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(<TimePicker {...defaultProps} value={undefined} placeholder="HH:MM" />);
      expect(screen.getByPlaceholderText('HH:MM')).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should open time picker on input click', async () => {
      render(<TimePicker {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      await userEvent.click(input);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should open time picker on icon click', async () => {
      render(<TimePicker {...defaultProps} />);
      const icon = screen.getByTestId('time-picker-icon');
      
      await userEvent.click(icon);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not open picker when disabled', async () => {
      render(<TimePicker {...defaultProps} disabled />);
      
      await userEvent.click(input);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should close picker on outside click', async () => {
      render(<TimePicker {...defaultProps} />);
      
      await userEvent.click(input);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      
      await userEvent.click(document.body);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should close picker on escape key', async () => {
      render(<TimePicker {...defaultProps} />);
      
      await userEvent.click(input);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      
      await userEvent.keyboard('{Escape}');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should navigate hours with arrow keys', async () => {
      render(<TimePicker {...defaultProps} />);
      
      await userEvent.click(input);
      const hoursInput = screen.getByLabelText('Hours');
      
      fireEvent.focus(hoursInput);
      await userEvent.keyboard('{ArrowUp}');
      
      expect(defaultProps.onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          getHours: expect.any(Function),
          getMinutes: expect.any(Function)
        })
      );
    });

    it('should navigate minutes with arrow keys', async () => {
      render(<TimePicker {...defaultProps} />);
      
      await userEvent.click(input);
      const minutesInput = screen.getByLabelText('Minutes');
      
      fireEvent.focus(minutesInput);
      await userEvent.keyboard('{ArrowUp}');
      
      expect(defaultProps.onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          getHours: expect.any(Function),
          getMinutes: expect.any(Function)
        })
      );
    });
  });

  describe('Time Selection', () => {
    it('should update hours on input', async () => {
      render(<TimePicker {...defaultProps} />);
      
      await userEvent.click(input);
      
      await userEvent.clear(hoursInput);
      await userEvent.type(hoursInput, '16');
      
      expect(defaultProps.onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          getHours: expect.any(Function),
          getMinutes: expect.any(Function)
        })
      );
    });

    it('should update minutes on input', async () => {
      render(<TimePicker {...defaultProps} />);
      
      await userEvent.click(input);
      
      await userEvent.clear(minutesInput);
      await userEvent.type(minutesInput, '45');
      
      expect(defaultProps.onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          getHours: expect.any(Function),
          getMinutes: expect.any(Function)
        })
      );
    });

    it('should handle AM/PM toggle in 12-hour format', async () => {
      render(<TimePicker {...defaultProps} format="12h" />);
      
      await userEvent.click(input);
      const amPmToggle = screen.getByRole('button', { name: /PM/i });
      
      await userEvent.click(amPmToggle);
      
      expect(defaultProps.onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          getHours: expect.any(Function),
          getMinutes: expect.any(Function)
        })
      );
    });

    it('should select time from dropdown list', async () => {
      render(<TimePicker {...defaultProps} />);
      
      await userEvent.click(input);
      const timeOption = screen.getByText('15:00');
      
      await userEvent.click(timeOption);
      
      expect(defaultProps.onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          getHours: expect.any(Function),
          getMinutes: expect.any(Function)
        })
      );
    });

    it('should respect min time constraint', async () => {
      const minTime = new Date(2024, 0, 1, 10, 0);
      render(<TimePicker {...defaultProps} minTime={minTime} />);
      
      await userEvent.click(input);
      
      await userEvent.clear(hoursInput);
      await userEvent.type(hoursInput, '08');
      
      // Should not update to invalid time
      expect(defaultProps.onChange).not.toHaveBeenCalled();
    });

    it('should respect max time constraint', async () => {
      const maxTime = new Date(2024, 0, 1, 18, 0);
      render(<TimePicker {...defaultProps} maxTime={maxTime} />);
      
      await userEvent.click(input);
      
      await userEvent.clear(hoursInput);
      await userEvent.type(hoursInput, '20');
      
      // Should not update to invalid time
      expect(defaultProps.onChange).not.toHaveBeenCalled();
    });

    it('should use custom step interval', async () => {
      render(<TimePicker {...defaultProps} step={15} />);
      
      await userEvent.click(input);
      
      // Should show times at 15-minute intervals
      expect(screen.getByText('14:00')).toBeInTheDocument();
      expect(screen.getByText('14:15')).toBeInTheDocument();
      expect(screen.getByText('14:30')).toBeInTheDocument();
      expect(screen.getByText('14:45')).toBeInTheDocument();
      expect(screen.queryByText('14:05')).not.toBeInTheDocument();
    });
  });

  describe('Manual Input', () => {
    it('should allow manual time input', async () => {
      render(<TimePicker {...defaultProps} />);
      
      await userEvent.clear(input);
      await userEvent.type(input, '16:45');
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(defaultProps.onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            getHours: expect.any(Function),
            getMinutes: expect.any(Function)
          })
        );
      });
    });

    it('should validate manual input format', async () => {
      render(<TimePicker {...defaultProps} />);
      
      await userEvent.clear(input);
      await userEvent.type(input, 'invalid');
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(defaultProps.onChange).not.toHaveBeenCalled();
        expect(input.value).toBe('14:30'); // Should revert to original value
      });
    });

    it('should handle partial time input', async () => {
      render(<TimePicker {...defaultProps} />);
      
      await userEvent.clear(input);
      await userEvent.type(input, '9:5');
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(defaultProps.onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            getHours: expect.any(Function),
            getMinutes: expect.any(Function)
          })
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<TimePicker {...defaultProps} />);
      
      expect(input).toHaveAttribute('aria-label', 'Select Time');
      expect(input).toHaveAttribute('aria-haspopup', 'dialog');
    });

    it('should announce errors to screen readers', () => {
      render(<TimePicker {...defaultProps} error="Invalid time format" />);
      
      expect(input).toHaveAttribute('aria-invalid', 'true');
  
}
}
}
}
