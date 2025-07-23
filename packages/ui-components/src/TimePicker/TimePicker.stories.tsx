import type { Meta, StoryObj } from '@storybook/react';
import { TimePicker } from './TimePicker';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { bg, enUS } from 'date-fns/locale';
import { useState } from 'react';
import { createTheme } from '@mui/material/styles';
import { Box, Typography, Stack } from '@mui/material';

const meta: Meta<typeof TimePicker> = {
  title: 'Components/TimePicker',
  component: TimePicker,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A time picker component for selecting business hours, reservation times, and scheduling in the BOOM Card platform.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      description: 'The selected time value',
      control: 'date',
    },
    onChange: {
      description: 'Callback fired when the value changes',
    },
    label: {
      description: 'The label content',
      control: 'text',
    },
    error: {
      description: 'If true, the component is in error state',
      control: 'boolean',
    },
    helperText: {
      description: 'The helper text content',
      control: 'text',
    },
    disabled: {
      description: 'If true, the component is disabled',
      control: 'boolean',
    },
    readOnly: {
      description: 'If true, the component is read only',
      control: 'boolean',
    },
    required: {
      description: 'If true, the component is required',
      control: 'boolean',
    },
    format: {
      description: 'Time format (12h or 24h)',
      control: 'radio',
      options: ['12h', '24h'],
    },
    minTime: {
      description: 'Minimum selectable time',
      control: 'date',
    },
    maxTime: {
      description: 'Maximum selectable time',
      control: 'date',
    },
    locale: {
      description: 'Locale for date formatting',
      control: 'radio',
      options: ['en', 'bg'],
    },
    size: {
      description: 'Size of the input',
      control: 'radio',
      options: ['small', 'medium'],
    },
    variant: {
      description: 'Input variant',
      control: 'radio',
      options: ['outlined', 'filled', 'standard'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF6B35',
    },
    secondary: {
      main: '#004E89',
    },
  },
});

// Helper function to create a date with specific time
const createTime = (hours: number, minutes: number = 0): Date => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// Wrapper component for stories with state
const TimePickerWithState = (args: any) => {
  const [value, setValue] = useState<Date | null>(args.value || null);
  const locale = args.locale === 'bg' ? bg : enUS;

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={locale}>
        <Box sx={{ minWidth: 300 }}>
          <TimePicker
            {...args}
            value={value}
            onChange={(newValue) => {
              setValue(newValue);
              args.onChange?.(newValue);
            }}
          />
          {value && (
            <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>
              Selected: {value.toLocaleTimeString(args.locale === 'bg' ? 'bg-BG' : 'en-US')}
            </Typography>
          )}
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export const Default: Story = {
  args: {
    label: 'Select Time',
    placeholder: 'HH:MM',
  },
  render: (args) => <TimePickerWithState {...args} />,
};

export const WithValue: Story = {
  args: {
    label: 'Reservation Time',
    value: createTime(14, 30),
    format: '24h',
  },
  render: (args) => <TimePickerWithState {...args} />,
};

export const TwelveHourFormat: Story = {
  args: {
    label: 'Opening Time',
    value: createTime(9, 0),
    format: '12h',
  },
  render: (args) => <TimePickerWithState {...args} />,
};

export const TwentyFourHourFormat: Story = {
  args: {
    label: 'Closing Time',
    value: createTime(22, 0),
    format: '24h',
  },
  render: (args) => <TimePickerWithState {...args} />,
};

export const WithMinMaxTime: Story = {
  args: {
    label: 'Business Hours',
    minTime: createTime(9, 0),
    maxTime: createTime(18, 0),
    format: '24h',
    helperText: 'Select time between 9:00 and 18:00',
  },
  render: (args) => <TimePickerWithState {...args} />,
};

export const Required: Story = {
  args: {
    label: 'Check-in Time',
    required: true,
    helperText: 'This field is required',
  },
  render: (args) => <TimePickerWithState {...args} />,
};

export const WithError: Story = {
  args: {
    label: 'Appointment Time',
    error: true,
    helperText: 'Please select a valid time',
    value: createTime(8, 0),
  },
  render: (args) => <TimePickerWithState {...args} />,
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Time',
    disabled: true,
    value: createTime(12, 0),
  },
  render: (args) => <TimePickerWithState {...args} />,
};

export const ReadOnly: Story = {
  args: {
    label: 'Read Only Time',
    readOnly: true,
    value: createTime(15, 30),
  },
  render: (args) => <TimePickerWithState {...args} />,
};

export const SmallSize: Story = {
  args: {
    label: 'Small Time Picker',
    size: 'small',
  },
  render: (args) => <TimePickerWithState {...args} />,
};

export const FilledVariant: Story = {
  args: {
    label: 'Filled Variant',
    variant: 'filled',
  },
  render: (args) => <TimePickerWithState {...args} />,
};

export const StandardVariant: Story = {
  args: {
    label: 'Standard Variant',
    variant: 'standard',
  },
  render: (args) => <TimePickerWithState {...args} />,
};

export const BulgarianLocale: Story = {
  args: {
    label: 'Изберете час',
    locale: 'bg',
    helperText: 'Работно време на ресторанта',
    format: '24h',
  },
  render: (args) => <TimePickerWithState {...args} />,
};

export const BusinessHoursExample: Story = {
  render: () => {
    const [openTime, setOpenTime] = useState<Date | null>(createTime(9, 0));
    const [closeTime, setCloseTime] = useState<Date | null>(createTime(22, 0));

    return (
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enUS}>
          <Stack spacing={3} sx={{ minWidth: 300 }}>
            <Typography variant="h6">Restaurant Business Hours</Typography>
            <TimePicker
              label="Opening Time"
              value={openTime}
              onChange={setOpenTime}
              format="24h"
              maxTime={closeTime || undefined}
            />
            <TimePicker
              label="Closing Time"
              value={closeTime}
              onChange={setCloseTime}
              format="24h"
              minTime={openTime || undefined}
            />
            {openTime && closeTime && (
              <Typography variant="body2" color="text.secondary">
                Open from {openTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} 
                {' '}to {closeTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            )}
          </Stack>
        </LocalizationProvider>
      </ThemeProvider>
    );
  },
};

export const ReservationTimeSlots: Story = {
  render: () => {
    const [selectedTime, setSelectedTime] = useState<Date | null>(null);
    const timeSlots = [
      createTime(12, 0),
      createTime(12, 30),
      createTime(13, 0),
      createTime(13, 30),
      createTime(14, 0),
    ];

    return (
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enUS}>
          <Stack spacing={2} sx={{ minWidth: 300 }}>
            <Typography variant="h6">Select Reservation Time</Typography>
            <TimePicker
              label="Preferred Time"
              value={selectedTime}
              onChange={setSelectedTime}
              format="12h"
              minTime={createTime(12, 0)}
              maxTime={createTime(22, 0)}
              helperText="Lunch: 12:00-15:00, Dinner: 18:00-22:00"
            />
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Quick Selection:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {timeSlots.map((slot, index) => (
                  <Box
                    key={index}
                    onClick={() => setSelectedTime(slot)}
                    sx={{
                      cursor: 'pointer',
                      padding: '4px 8px',
                      border: '1px solid',
                      borderColor: selectedTime?.getTime() === slot.getTime() ? 'primary.main' : 'divider',
                      borderRadius: 1,
                      backgroundColor: selectedTime?.getTime() === slot.getTime() ? 'primary.light' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <Typography variant="caption">
                      {slot.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack>
        </LocalizationProvider>
      </ThemeProvider>
    );
  },
};

export const MultipleTimeInputs: Story = {
  render: () => {
    const [weekdayOpen, setWeekdayOpen] = useState<Date | null>(createTime(9, 0));
    const [weekdayClose, setWeekdayClose] = useState<Date | null>(createTime(22, 0));
    const [weekendOpen, setWeekendOpen] = useState<Date | null>(createTime(10, 0));
    const [weekendClose, setWeekendClose] = useState<Date | null>(createTime(23, 0));

    return (
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enUS}>
          <Stack spacing={3} sx={{ minWidth: 400 }}>
            <Typography variant="h6">Business Hours Configuration</Typography>
            
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Weekdays (Mon-Fri)
              </Typography>
              <Stack direction="row" spacing={2}>
                <TimePicker
                  label="Open"
                  value={weekdayOpen}
                  onChange={setWeekdayOpen}
                  format="24h"
                  size="small"
                />
                <TimePicker
                  label="Close"
                  value={weekdayClose}
                  onChange={setWeekdayClose}
                  format="24h"
                  size="small"
                />
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Weekends (Sat-Sun)
              </Typography>
              <Stack direction="row" spacing={2}>
                <TimePicker
                  label="Open"
                  value={weekendOpen}
                  onChange={setWeekendOpen}
                  format="24h"
                  size="small"
                />
                <TimePicker
                  label="Close"
                  value={weekendClose}
                  onChange={setWeekendClose}
                  format="24h"
                  size="small"
                />
              </Stack>
            </Box>
          </Stack>
        </LocalizationProvider>
      </ThemeProvider>
    );
  },
};

export const ValidationExample: Story = {
  render: () => {
    const [time, setTime] = useState<Date | null>(null);
    const [error, setError] = useState(false);
    const [he
}}