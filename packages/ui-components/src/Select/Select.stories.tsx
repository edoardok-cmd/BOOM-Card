import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';
import { useState } from 'react';
import { action } from '@storybook/addon-actions';

const meta = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A customizable select dropdown component with support for search, multi-select, and various styling options.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text displayed above the select',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when no option is selected',
    },
    value: {
      control: false,
      description: 'Currently selected value(s)',
    },
    options: {
      control: false,
      description: 'Array of options to display in the dropdown',
    },
    onChange: {
      action: 'changed',
      description: 'Callback fired when selection changes',
    },
    onBlur: {
      action: 'blurred',
      description: 'Callback fired when select loses focus',
    },
    onFocus: {
      action: 'focused',
      description: 'Callback fired when select gains focus',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    helperText: {
      control: 'text',
      description: 'Helper text displayed below the select',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the select is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the select is required',
    },
    multiple: {
      control: 'boolean',
      description: 'Whether multiple options can be selected',
    },
    searchable: {
      control: 'boolean',
      description: 'Whether the select has a search input',
    },
    clearable: {
      control: 'boolean',
      description: 'Whether the select can be cleared',
    },
    loading: {
      control: 'boolean',
      description: 'Whether the select is in loading state',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of the select',
    },
    variant: {
      control: 'select',
      options: ['outlined', 'filled', 'standard'],
      description: 'Visual variant of the select',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    maxHeight: {
      control: 'number',
      description: 'Maximum height of the dropdown in pixels',
    },
    renderOption: {
      control: false,
      description: 'Custom render function for options',
    },
    renderValue: {
      control: false,
      description: 'Custom render function for selected value',
    },
    filterOptions: {
      control: false,
      description: 'Custom filter function for search',
    },
    getOptionLabel: {
      control: false,
      description: 'Function to get option label',
    },
    getOptionValue: {
      control: false,
      description: 'Function to get option value',
    },
    isOptionDisabled: {
      control: false,
      description: 'Function to determine if option is disabled',
    },
    groupBy: {
      control: false,
      description: 'Function to group options',
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample options for stories
const cuisineOptions = [
  { value: 'bulgarian', label: 'Bulgarian' },
  { value: 'italian', label: 'Italian' },
  { value: 'asian', label: 'Asian' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'greek', label: 'Greek' },
  { value: 'french', label: 'French' },
  { value: 'american', label: 'American' },
  { value: 'indian', label: 'Indian' },
];

const categoryOptions = [
  { value: 'restaurants', label: 'Restaurants', icon: '🍽️' },
  { value: 'cafes', label: 'Cafés & Coffee', icon: '☕' },
  { value: 'bars', label: 'Bars & Pubs', icon: '🍺' },
  { value: 'hotels', label: 'Hotels', icon: '🏨' },
  { value: 'spa', label: 'Spa & Wellness', icon: '💆' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎭' },
  { value: 'activities', label: 'Activities', icon: '🎯' },
  { value: 'transport', label: 'Transportation', icon: '🚗' },
];

const locationOptions = [
  { value: 'sofia', label: 'Sofia', group: 'Major Cities' },
  { value: 'plovdiv', label: 'Plovdiv', group: 'Major Cities' },
  { value: 'varna', label: 'Varna', group: 'Major Cities' },
  { value: 'burgas', label: 'Burgas', group: 'Major Cities' },
  { value: 'bansko', label: 'Bansko', group: 'Mountain Resorts' },
  { value: 'borovets', label: 'Borovets', group: 'Mountain Resorts' },
  { value: 'pamporovo', label: 'Pamporovo', group: 'Mountain Resorts' },
  { value: 'golden-sands', label: 'Golden Sands', group: 'Sea Resorts' },
  { value: 'sunny-beach', label: 'Sunny Beach', group: 'Sea Resorts' },
  { value: 'albena', label: 'Albena', group: 'Sea Resorts' },
];

const discountOptions = [
  { value: '10', label: '10% Discount' },
  { value: '15', label: '15% Discount' },
  { value: '20', label: '20% Discount' },
  { value: '25', label: '25% Discount' },
  { value: '30', label: '30% Discount' },
  { value: '50', label: '50% Discount' },
];

// Controlled component wrapper for stories
const ControlledSelect = (props: any) => {
  const [value, setValue] = useState(props.value || null);
  
  return (
    <Select
      {...props}
      value={value}
      onChange={(newValue: any) => {
        setValue(newValue);
        action('onChange')(newValue);
      }}
    />
  );
};

export const Default: Story = {
  args: {
    label: 'Select Category',
    placeholder: 'Choose a category',
    options: categoryOptions,
  },
  render: (args) => <ControlledSelect {...args} />,
};

export const WithHelperText: Story = {
  args: {
    label: 'Cuisine Type',
    placeholder: 'Select cuisine',
    options: cuisineOptions,
    helperText: 'Choose your preferred cuisine type',
  },
  render: (args) => <ControlledSelect {...args} />,
};

export const Required: Story = {
  args: {
    label: 'Location',
    placeholder: 'Select location',
    options: locationOptions,
    required: true,
    helperText: 'This field is required',
  },
  render: (args) => <ControlledSelect {...args} />,
};

export const WithError: Story = {
  args: {
    label: 'Discount Level',
    placeholder: 'Select discount',
    options: discountOptions,
    error: 'Please select a valid discount level',
    value: null,
  },
  render: (args) => <ControlledSelect {...args} />,
};

export const Disabled: Story = {
  args: {
    label: 'Category',
    placeholder: 'Select category',
    options: categoryOptions,
    disabled: true,
    value: 'restaurants',
  },
  render: (args) => <ControlledSelect {...args} />,
};

export const Loading: Story = {
  args: {
    label: 'Loading Categories',
    placeholder: 'Loading...',
    options: [],
    loading: true,
  },
  render: (args) => <ControlledSelect {...args} />,
};

export const Searchable: Story = {
  args: {
    label: 'Search Location',
    placeholder: 'Type to search...',
    options: locationOptions,
    searchable: true,
    helperText: 'Start typing to filter locations',
  },
  render: (args) => <ControlledSelect {...args} />,
};

export const Clearable: Story = {
  args: {
    label: 'Category',
    placeholder: 'Select category',
    options: categoryOptions,
    clearable: true,
    value: 'restaurants',
  },
  render: (args) => <ControlledSelect {...args} />,
};

export const MultiSelect: Story = {
  args: {
    label: 'Select Multiple Categories',
    placeholder: 'Choose categories',
    options: categoryOptions,
    multiple: true,
    clearable: true,
    helperText: 'You can select multiple categories',
  },
  render: (args) => {
    const [value, setValue] = useState<string[]>([]);
    
    return (
      <Select
        {...args}
        value={value}
        onChange={(newValue: string[]) => {
          setValue(newValue);
          action('onChange')(newValue);
        }}
      />
    );
  },
};

export const GroupedOptions: Story = {
  args: {
    label: 'Select Location',
    placeholder: 'Choose location',
    options: locationOptions,
    groupBy: (option: any) => option.group,
  },
  render: (args) => <ControlledSelect {...args} />,
};

export const CustomRenderOption: Story = {
  args: {
    label: 'Category',
    placeholder: 'Select category',
    options: categoryOptions,
    renderOption: (option: any) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '20px' }}>{option.icon}</span>
        <span>{option.label}</span>
      </div>
    ),
  },
  render: (args) => <ControlledSelect {...args} />,
};

export const CustomRenderValue: Story = {
  args: {
    label: 'Category',
    placeholder: 'Select category',
    options: categoryOptions,
    value: 'restaurants',
    renderValue: (value: any, option: any) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>{option?.icon}</span>
        <span>{option?.label}</span>
      </div>
    ),
  },
  render: (args) => <ControlledSelect {...args} />,
};

export const SmallSize: Story = {
  args: {
    label: 'Small Select',
    placeholder: 'Select option',
    options: discountOptions,
    size: 'small',
  },
  render: (args) => <ControlledSelect {...args} />,
};

export const LargeSize: Story = {
  args: {
    label: 'Large Select',
    placeholder: 'Select option',
    options: cuisineOptions,
    size: 'large',
  },
  render: (args) => <ControlledSelect {...args} />,
};

export const OutlinedVariant: Story = {
  args: {
    label: 'Outlined Select',
    placeholder: 'Select option',
    options: categoryOptions,
    variant: 'outlined',
  },
  render: (args) => <ControlledSelect {...args} />,
};

export const FilledVariant: Story = {
  args: {
    label: 'Filled Select',
    placeholder: 'Select option',
    options: categoryOptions,
    variant: 'filled',
  },
  render: (args) => <ControlledSelect {...args} />,
};

export const StandardVariant: Story = {
  args: {
    label: 'Standard Select',
    placeholder: 'Select option',
    options: categoryOptions,
    variant: 'standard',
  },
  render: (args) => <ControlledSelect {...args} />,
};

export const WithMaxHeight: Story = {
  args: {
    label: 'Limited Height Dropdown',
    placeholder: 'Select location',
    options: locationOptions,
    maxHeight: 200,
    helperText: 'Dropdown has a maximum height of 200px',
  },
  render: (args) => <ControlledSelect {...args} />,
};

export const DisabledOptions: Story = {
  args: {
    label: 'Some Disabled Options',
    placeholder: 'Select discount',
    options: discountOptions,
    isOptionDisabled: (option: any) => option.value === '50',
    helperText: '50% discount is currently unavailable',
  },
  render: (args) => <ControlledSelect {...args} />,
};

export const AsyncOptions: Story = {
  render: () => {
    const [options, setOptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [value, setValue] = useState(null);
    
    const loadOptions = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setOptions(categoryOptions);
      setLoading(false);
    };
    
    return (
      <div style={{ width: '300px' }}>
        <button 
          onClick={loadOptions}
          style={{
            marginBottom: '16px',
            padding: '8px 16px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          Load Options
        </button>
        <Select
          label="Async Categories"
          placeholder={loading ? "Loading..." : "Select category"}
          options={options}
          loading={loading}
          value={value}
       
}
}
