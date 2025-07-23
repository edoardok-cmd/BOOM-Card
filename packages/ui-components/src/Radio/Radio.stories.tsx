import type { Meta, StoryObj } from '@storybook/react';
import { Radio } from './Radio';
import { RadioGroup } from './RadioGroup';
import { useState } from 'react';

const meta: Meta<typeof Radio> = {
  title: 'Components/Radio',
  component: Radio,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Radio buttons allow users to select a single option from a set of mutually exclusive choices.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Whether the radio button is checked',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the radio button is disabled',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the radio button',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'error'],
      description: 'Color variant of the radio button',
    },
    label: {
      control: 'text',
      description: 'Label text for the radio button',
    },
    helperText: {
      control: 'text',
      description: 'Helper text displayed below the radio button',
    },
    error: {
      control: 'boolean',
      description: 'Whether the radio button is in error state',
    },
    required: {
      control: 'boolean',
      description: 'Whether the radio button is required',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Radio>;

// Basic Radio
export const Default: Story = {
  args: {
    label: 'Select this option',
    name: 'default-radio',
    value: 'option1',
  },
};

// Checked Radio
export const Checked: Story = {
  args: {
    label: 'Selected option',
    name: 'checked-radio',
    value: 'option1',
    checked: true,
  },
};

// Disabled Radio
export const Disabled: Story = {
  args: {
    label: 'Disabled option',
    name: 'disabled-radio',
    value: 'option1',
    disabled: true,
  },
};

// Disabled Checked Radio
export const DisabledChecked: Story = {
  args: {
    label: 'Disabled selected option',
    name: 'disabled-checked-radio',
    value: 'option1',
    checked: true,
    disabled: true,
  },
};

// Sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col space-y-4">
      <Radio label="Small radio" size="sm" name="size-radio" value="small" />
      <Radio label="Medium radio (default)" size="md" name="size-radio" value="medium" />
      <Radio label="Large radio" size="lg" name="size-radio" value="large" />
    </div>
  ),
};

// Colors
export const Colors: Story = {
  render: () => (
    <div className="flex flex-col space-y-4">
      <Radio label="Primary" color="primary" name="color-radio" value="primary" defaultChecked />
      <Radio label="Secondary" color="secondary" name="color-radio-2" value="secondary" defaultChecked />
      <Radio label="Success" color="success" name="color-radio-3" value="success" defaultChecked />
      <Radio label="Warning" color="warning" name="color-radio-4" value="warning" defaultChecked />
      <Radio label="Error" color="error" name="color-radio-5" value="error" defaultChecked />
    </div>
  ),
};

// With Helper Text
export const WithHelperText: Story = {
  args: {
    label: 'Premium subscription',
    helperText: 'Get unlimited access to all partner discounts',
    name: 'helper-radio',
    value: 'premium',
  },
};

// Error State
export const ErrorState: Story = {
  args: {
    label: 'Accept terms',
    helperText: 'You must accept the terms to continue',
    error: true,
    name: 'error-radio',
    value: 'terms',
  },
};

// Required
export const Required: Story = {
  args: {
    label: 'Required option',
    required: true,
    name: 'required-radio',
    value: 'required',
  },
};

// Radio Group
export const GroupExample: Story = {
  render: () => {
    const [value, setValue] = useState('standard');
    
    return (
      <RadioGroup
        name="subscription-type"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        label="Select subscription type"
        helperText="Choose the plan that best fits your needs"
      >
        <Radio
          value="basic"
          label="Basic Plan"
          helperText="10% discount at selected partners"
        />
        <Radio
          value="standard"
          label="Standard Plan"
          helperText="15% discount at all partners"
        />
        <Radio
          value="premium"
          label="Premium Plan"
          helperText="20% discount + exclusive offers"
        />
        <Radio
          value="vip"
          label="VIP Plan"
          helperText="25% discount + priority booking + exclusive events"
        />
      </RadioGroup>
    );
  },
};

// Horizontal Radio Group
export const HorizontalGroup: Story = {
  render: () => {
    const [value, setValue] = useState('monthly');
    
    return (
      <RadioGroup
        name="billing-period"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        label="Billing period"
        orientation="horizontal"
      >
        <Radio value="monthly" label="Monthly" />
        <Radio value="quarterly" label="Quarterly" />
        <Radio value="yearly" label="Yearly" />
      </RadioGroup>
    );
  },
};

// Partner Categories
export const PartnerCategories: Story = {
  render: () => {
    const [value, setValue] = useState('restaurants');
    
    return (
      <RadioGroup
        name="partner-category"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        label="Filter by category"
        helperText="Show only partners from selected category"
      >
        <Radio
          value="restaurants"
          label="Restaurants & Cafés"
          helperText="Fine dining, casual dining, coffee shops"
        />
        <Radio
          value="entertainment"
          label="Entertainment & Nightlife"
          helperText="Clubs, bars, theaters, events"
        />
        <Radio
          value="accommodation"
          label="Hotels & Accommodation"
          helperText="Hotels, B&Bs, vacation rentals"
        />
        <Radio
          value="wellness"
          label="Wellness & Spa"
          helperText="Spas, fitness centers, beauty salons"
        />
        <Radio
          value="all"
          label="All Categories"
          helperText="Show partners from all categories"
        />
      </RadioGroup>
    );
  },
};

// Discount Percentage Filter
export const DiscountFilter: Story = {
  render: () => {
    const [value, setValue] = useState('all');
    
    return (
      <RadioGroup
        name="discount-filter"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        label="Minimum discount"
        orientation="horizontal"
        size="sm"
      >
        <Radio value="all" label="All" />
        <Radio value="10" label="10%+" />
        <Radio value="15" label="15%+" />
        <Radio value="20" label="20%+" />
        <Radio value="25" label="25%+" />
      </RadioGroup>
    );
  },
};

// Language Selection
export const LanguageSelection: Story = {
  render: () => {
    const [value, setValue] = useState('en');
    
    return (
      <RadioGroup
        name="language"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        label="Select language"
      >
        <Radio value="en" label="English" />
        <Radio value="bg" label="Български" />
      </RadioGroup>
    );
  },
};

// Payment Method
export const PaymentMethod: Story = {
  render: () => {
    const [value, setValue] = useState('card');
    
    return (
      <RadioGroup
        name="payment-method"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        label="Payment method"
        required
      >
        <Radio
          value="card"
          label="Credit/Debit Card"
          helperText="Visa, Mastercard, American Express"
        />
        <Radio
          value="paypal"
          label="PayPal"
          helperText="Pay with your PayPal account"
        />
        <Radio
          value="bank"
          label="Bank Transfer"
          helperText="Direct bank transfer (3-5 business days)"
        />
        <Radio
          value="crypto"
          label="Cryptocurrency"
          helperText="Bitcoin, Ethereum, USDT"
        />
      </RadioGroup>
    );
  },
};

// Notification Preferences
export const NotificationPreferences: Story = {
  render: () => {
    const [value, setValue] = useState('all');
    
    return (
      <RadioGroup
        name="notifications"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        label="Email notifications"
        helperText="Control how often you receive promotional emails"
      >
        <Radio
          value="all"
          label="All notifications"
          helperText="Receive all updates and promotions"
        />
        <Radio
          value="weekly"
          label="Weekly digest"
          helperText="Summary of new partners and deals"
        />
        <Radio
          value="monthly"
          label="Monthly newsletter"
          helperText="Monthly highlights and exclusive offers"
        />
        <Radio
          value="none"
          label="No promotional emails"
          helperText="Only transactional emails"
        />
      </RadioGroup>
    );
  },
};

// Error State Group
export const ErrorGroup: Story = {
  render: () => {
    const [value, setValue] = useState('');
    
    return (
      <RadioGroup
        name="terms"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        label="Terms and conditions"
        error={!value}
        helperText={!value ? 'You must select an option to continue' : 'Thank you for your selection'}
        required
      >
        <Radio
          value="accept"
          label="I accept the terms and conditions"
        />
        <Radio
          value=
}}