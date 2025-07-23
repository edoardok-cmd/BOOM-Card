import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';
import { useState } from 'react';
import { action } from '@storybook/addon-actions';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A customizable checkbox component with support for labels, descriptions, validation states, and accessibility features.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'The checked state of the checkbox',
    },
    defaultChecked: {
      control: 'boolean',
      description: 'The default checked state for uncontrolled usage',
    },
    indeterminate: {
      control: 'boolean',
      description: 'Whether the checkbox is in an indeterminate state',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the checkbox is required',
    },
    error: {
      control: 'boolean',
      description: 'Whether the checkbox has an error state',
    },
    label: {
      control: 'text',
      description: 'The label text for the checkbox',
    },
    description: {
      control: 'text',
      description: 'Additional description text',
    },
    errorMessage: {
      control: 'text',
      description: 'Error message to display when error is true',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'The size of the checkbox',
    },
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'success', 'warning', 'error'],
      description: 'The color theme of the checkbox',
    },
    variant: {
      control: { type: 'select' },
      options: ['filled', 'outlined'],
      description: 'The visual variant of the checkbox',
    },
    labelPlacement: {
      control: { type: 'select' },
      options: ['start', 'end', 'top', 'bottom'],
      description: 'The placement of the label relative to the checkbox',
    },
    onChange: {
      action: 'changed',
      description: 'Callback fired when the checkbox value changes',
    },
    onFocus: {
      action: 'focused',
      description: 'Callback fired when the checkbox receives focus',
    },
    onBlur: {
      action: 'blurred',
      description: 'Callback fired when the checkbox loses focus',
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic checkbox without label
export const Default: Story = {
  args: {
    'aria-label': 'Default checkbox',
  },
};

// Checkbox with label
export const WithLabel: Story = {
  args: {
    label: 'Accept terms and conditions',
  },
};

// Checkbox with label and description
export const WithDescription: Story = {
  args: {
    label: 'Subscribe to newsletter',
    description: 'Get the latest BOOM Card deals and offers delivered to your inbox',
  },
};

// Controlled checkbox example
export const Controlled: Story = {
  render: function Render(args) {
    const [checked, setChecked] = useState(false);
    
    return (
      <div className="space-y-4">
        <Checkbox
          {...args}
          checked={checked}
          onChange={(e) => {
            setChecked(e.target.checked);
            action('changed')(e);
          }}
          label="Controlled checkbox"
        />
        <p className="text-sm text-gray-600">
          Checked: {checked ? 'true' : 'false'}
        </p>
      </div>
    );
  },
};

// Size variations
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Checkbox size="small" label="Small checkbox" />
      <Checkbox size="medium" label="Medium checkbox (default)" />
      <Checkbox size="large" label="Large checkbox" />
    </div>
  ),
};

// Color variations
export const Colors: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Checkbox color="primary" defaultChecked label="Primary (default)" />
      <Checkbox color="secondary" defaultChecked label="Secondary" />
      <Checkbox color="success" defaultChecked label="Success" />
      <Checkbox color="warning" defaultChecked label="Warning" />
      <Checkbox color="error" defaultChecked label="Error" />
    </div>
  ),
};

// Variant styles
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Checkbox variant="filled" defaultChecked label="Filled variant (default)" />
      <Checkbox variant="outlined" defaultChecked label="Outlined variant" />
    </div>
  ),
};

// Label placement options
export const LabelPlacement: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8">
      <Checkbox labelPlacement="end" label="Label at end (default)" />
      <Checkbox labelPlacement="start" label="Label at start" />
      <Checkbox labelPlacement="top" label="Label on top" />
      <Checkbox labelPlacement="bottom" label="Label on bottom" />
    </div>
  ),
};

// States
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Checkbox label="Unchecked" />
      <Checkbox defaultChecked label="Checked" />
      <Checkbox indeterminate label="Indeterminate" />
      <Checkbox disabled label="Disabled" />
      <Checkbox disabled defaultChecked label="Disabled checked" />
      <Checkbox disabled indeterminate label="Disabled indeterminate" />
    </div>
  ),
};

// Validation states
export const Validation: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Checkbox
        required
        label="Required field"
        description="This field must be checked"
      />
      <Checkbox
        error
        label="With error"
        errorMessage="You must accept the terms to continue"
      />
      <Checkbox
        error
        required
        label="Required with error"
        description="Please review and accept"
        errorMessage="This field is required"
      />
    </div>
  ),
};

// Real-world examples
export const RealWorldExamples: Story = {
  render: () => {
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [marketingOptIn, setMarketingOptIn] = useState(false);
    const [partnerUpdates, setPartnerUpdates] = useState(true);
    
    return (
      <div className="space-y-6 max-w-md">
        <h3 className="text-lg font-semibold mb-4">BOOM Card Signup Preferences</h3>
        
        <Checkbox
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          required
          error={!termsAccepted}
          errorMessage={!termsAccepted ? "You must accept the terms to continue" : ""}
          label="I accept the Terms of Service and Privacy Policy"
          description="By checking this box, you agree to our terms and conditions"
        />
        
        <Checkbox
          checked={marketingOptIn}
          onChange={(e) => setMarketingOptIn(e.target.checked)}
          label="Send me promotional emails"
          description="Get exclusive BOOM Card deals and early access to new partners"
        />
        
        <Checkbox
          checked={partnerUpdates}
          onChange={(e) => setPartnerUpdates(e.target.checked)}
          label="Notify me about new restaurant partners"
          description="Receive notifications when new restaurants join BOOM Card in your area"
        />
        
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <p className="text-sm font-medium mb-2">Current selections:</p>
          <ul className="text-sm space-y-1">
            <li>Terms accepted: {termsAccepted ? '✓' : '✗'}</li>
            <li>Marketing emails: {marketingOptIn ? '✓' : '✗'}</li>
            <li>Partner updates: {partnerUpdates ? '✓' : '✗'}</li>
          </ul>
        </div>
      </div>
    );
  },
};

// Checkbox group example
export const CheckboxGroup: Story = {
  render: () => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>(['restaurants', 'cafes']);
    
    const categories = [
      { id: 'restaurants', label: 'Restaurants', description: '15% off at 200+ locations' },
      { id: 'cafes', label: 'Cafés & Coffee Shops', description: '10% off beverages' },
      { id: 'bars', label: 'Bars & Pubs', description: '20% off happy hour drinks' },
      { id: 'hotels', label: 'Hotels', description: 'Up to 25% off stays' },
      { id: 'spa', label: 'Spa & Wellness', description: '30% off treatments' },
    ];
    
    const handleCategoryChange = (categoryId: string, checked: boolean) => {
      if (checked) {
        setSelectedCategories([...selectedCategories, categoryId]);
      } else {
        setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
      };
    
    return (
      <div className="space-y-4 max-w-md">
        <h3 className="text-lg font-semibold mb-4">Select your interests</h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose categories to receive personalized BOOM Card offers
        </p>
        
        {categories.map((category) => (
          <Checkbox
            key={category.id}
            checked={selectedCategories.includes(category.id)}
            onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
            label={category.label}
            description={category.description}
          />
        ))}
        
        <div className="mt-6 p-4 bg-blue-50 rounded">
          <p className="text-sm font-medium text-blue-900">
            {selectedCategories.length} categories selected
          </p>
        </div>
      </div>
    );
  },
};

// Accessibility example
export const Accessibility: Story = {
  render: () => (
    <div className="space-y-4">
      <Checkbox
        id="accessibility-example"
        label="Accessible checkbox"
 
}
}
