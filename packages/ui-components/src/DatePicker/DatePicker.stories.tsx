import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DatePicker } from './DatePicker';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { action } from '@storybook/addon-actions';

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile date picker component with calendar view, range selection, and internationalization support.'
      }
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'date',
      description: 'Selected date value'
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input'
    },
    format: {
      control: 'text',
      description: 'Date format string (e.g., DD/MM/YYYY)',
      defaultValue: 'DD/MM/YYYY'
    },
    locale: {
      control: 'select',
      options: ['en', 'bg'],
      description: 'Locale for date formatting and calendar'
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the date picker'
    },
    error: {
      control: 'boolean',
      description: 'Show error state'
    },
    helperText: {
      control: 'text',
      description: 'Helper text below the input'
    },
    label: {
      control: 'text',
      description: 'Label for the date picker'
    },
    required: {
      control: 'boolean',
      description: 'Mark field as required'
    },
    minDate: {
      control: 'date',
      description: 'Minimum selectable date'
    },
    maxDate: {
      control: 'date',
      description: 'Maximum selectable date'
    },
    disabledDates: {
      control: 'object',
      description: 'Array of dates to disable'
    },
    showIcon: {
      control: 'boolean',
      description: 'Show calendar icon'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the date picker'
    },
    variant: {
      control: 'select',
      options: ['outlined', 'filled', 'borderless'],
      description: 'Visual variant of the date picker'
    },
    clearable: {
      control: 'boolean',
      description: 'Allow clearing the selected date'
    },
    todayButton: {
      control: 'boolean',
      description: 'Show today button in calendar'
    },
    weekStartsOn: {
      control: 'select',
      options: [0, 1, 2, 3, 4, 5, 6],
      description: 'First day of the week (0 = Sunday, 1 = Monday, etc.)'
    }
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default date picker
export const Default: Story = {
  args: {
    placeholder: 'Select date',
    onChange: action('date-changed')
  };

// With label and helper text
export const WithLabel: Story = {
  args: {
    label: 'Booking Date',
    helperText: 'Select your preferred booking date',
    placeholder: 'DD/MM/YYYY',
    required: true,
    onChange: action('date-changed')
  };

// Controlled component example
export const Controlled: Story = {
  render: (args) => {
    const [date, setDate] = useState<Date | null>(new Date());
    
    return (
      <DatePicker
        {...args}
        value={date}
        onChange={(newDate) => {
          setDate(newDate);
          action('date-changed')(newDate);
        }}
      />
    );
  },
  args: {
    label: 'Controlled Date Picker',
    placeholder: 'Select date'
  };

// Different sizes
export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <DatePicker
        size="sm"
        label="Small"
        placeholder="Select date"
        onChange={action('small-changed')}
      />
      <DatePicker
        size="md"
        label="Medium (Default)"
        placeholder="Select date"
        onChange={action('medium-changed')}
      />
      <DatePicker
        size="lg"
        label="Large"
        placeholder="Select date"
        onChange={action('large-changed')}
      />
    </div>
  )
};

// Different variants
export const Variants: Story = {
  render: () => (
    <div className="space-y-4">
      <DatePicker
        variant="outlined"
        label="Outlined"
        placeholder="Select date"
        onChange={action('outlined-changed')}
      />
      <DatePicker
        variant="filled"
        label="Filled"
        placeholder="Select date"
        onChange={action('filled-changed')}
      />
      <DatePicker
        variant="borderless"
        label="Borderless"
        placeholder="Select date"
        onChange={action('borderless-changed')}
      />
    </div>
  )
};

// With date restrictions
export const WithRestrictions: Story = {
  args: {
    label: 'Restricted Date Range',
    helperText: 'You can only select dates within the next 30 days',
    minDate: new Date(),
    maxDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    placeholder: 'Select date',
    onChange: action('date-changed')
  };

// With disabled specific dates
export const WithDisabledDates: Story = {
  args: {
    label: 'Availability Calendar',
    helperText: 'Some dates are unavailable',
    disabledDates: [
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
    ],
    placeholder: 'Select available date',
    onChange: action('date-changed')
  };

// Error state
export const ErrorState: Story = {
  args: {
    label: 'Check-in Date',
    error: true,
    helperText: 'Please select a valid check-in date',
    placeholder: 'DD/MM/YYYY',
    required: true,
    onChange: action('date-changed')
  };

// Disabled state
export const Disabled: Story = {
  args: {
    label: 'Disabled Date Picker',
    disabled: true,
    value: new Date(),
    placeholder: 'Select date'
  };

// With clear button
export const Clearable: Story = {
  args: {
    label: 'Clearable Date',
    clearable: true,
    value: new Date(),
    placeholder: 'Select date',
    onChange: action('date-changed')
  };

// Localization - English
export const EnglishLocale: Story = {
  args: {
    label: 'English Date Picker',
    locale: 'en',
    value: new Date(),
    placeholder: 'Select date',
    todayButton: true,
    onChange: action('date-changed')
  };

// Localization - Bulgarian
export const BulgarianLocale: Story = {
  args: {
    label: 'Български календар',
    locale: 'bg',
    value: new Date(),
    placeholder: 'Изберете дата',
    todayButton: true,
    weekStartsOn: 1,
    onChange: action('date-changed')
  };

// Date range picker
export const DateRange: Story = {
  render: () => {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    
    return (
      <div className="flex gap-4 items-end">
        <DatePicker
          label="Check-in"
          value={startDate}
          maxDate={endDate || undefined}
          placeholder="Start date"
          onChange={(date) => {
            setStartDate(date);
            action('start-date-changed')(date);
          }}
        />
        <DatePicker
          label="Check-out"
          value={endDate}
          minDate={startDate || undefined}
          placeholder="End date"
          onChange={(date) => {
            setEndDate(date);
            action('end-date-changed')(date);
          }}
        />
      </div>
    );
  };

// Custom format
export const CustomFormat: Story = {
  args: {
    label: 'Custom Format',
    format: 'YYYY-MM-DD',
    value: new Date(),
    placeholder: 'YYYY-MM-DD',
    onChange: action('date-changed')
  };

// With icon
export const WithIcon: Story = {
  args: {
    label: 'Event Date',
    showIcon: true,
    placeholder: 'Select event date',
    onChange: action('date-changed')
  };

// Mobile-friendly
export const MobileFriendly: Story = {
  args: {
    label: 'Mobile Date Picker',
    placeholder: 'Tap to select date',
    size: 'lg',
    showIcon: true,
    todayButton: true,
    onChange: action('date-changed')
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    }
};

// Dark mode
export const DarkMode: Story = {
  args: {
    label: 'Dark Mode Date Picker',
    placeholder: 'Select date',
    showIcon: true,
    onChange: action('date-changed')
  },
  parameters: {
    backgrounds: {
      default: 'dark'
    },
  decorators: [
    (Story) => (
      <div className="dark bg-gray-900 p-8 rounded-lg">
        <Story />
      </div>
    )
  ]
};

// Complex example with validation
export const BookingScenario: Story = {
  render: () => {
    const [checkIn, setCheckIn] = useState<Date | null>(null);
    const [checkOut, setCheckOut] = useState<Date | null>(null);
    const today = new Date();
    const maxDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    
    const disabledDates = [
      new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
      new Date(Date.now() + 12 * 24 * 60 * 60 * 1000)
    ];
    
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg max-w-md">
        <h3 className="text-lg font-semibold mb-4">Hotel Booking</h3>
        <div className="space-y-4">
          <DatePicker
            label="Check-in Date"
            value={checkIn}
            minDate={today}
            maxDate={maxDate}
            disabledDates={disabledDates}
            placeholder="Select check-in"
            required
            showIcon
            todayButton
            onChange={(date) => {
              setCheckIn(date);
              if (checkOut && date && date >= checkOut) {
                setCheckOut(null);
              }}
          />
          <DatePicker
            label="Check-out Date"
            value={checkOut}
            minDate={checkIn || today}
            maxDate={maxDate}
            disabledDates={disabledDates}
            placeholder="Select check-out"
            required
            showIcon
            error={checkIn && checkOut && checkOut <= checkIn}
            helperText={
              checkIn && checkOut && checkOut <= checkIn
                ? 'Check-out must be after check-in'
                : 'Minimum 1 night stay'
            }
            onChange={setCheckOut}
          />
          {checkIn && checkOut && checkOut > checkIn && (
            <div className="mt-4 p-3 bg-green-50 rounded">
              <p className="text-sm text-green-800">
                {Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))} nights selected
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
