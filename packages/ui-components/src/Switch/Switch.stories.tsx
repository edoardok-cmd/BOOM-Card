import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './Switch';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A customizable switch component for toggling boolean states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'The checked state of the switch',
    },
    defaultChecked: {
      control: 'boolean',
      description: 'The default checked state when uncontrolled',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the switch is disabled',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the switch',
    },
    label: {
      control: 'text',
      description: 'Label text for the switch',
    },
    labelPosition: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Position of the label relative to the switch',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'error'],
      description: 'Color variant of the switch',
    },
    onChange: {
      action: 'changed',
      description: 'Callback fired when the switch state changes',
    },
    onFocus: {
      action: 'focused',
      description: 'Callback fired when the switch is focused',
    },
    onBlur: {
      action: 'blurred',
      description: 'Callback fired when the switch loses focus',
    },
    name: {
      control: 'text',
      description: 'Name attribute for form submission',
    },
    value: {
      control: 'text',
      description: 'Value attribute for form submission',
    },
    required: {
      control: 'boolean',
      description: 'Whether the switch is required in a form',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    id: {
      control: 'text',
      description: 'HTML id attribute',
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessibility label',
    },
    ariaDescribedby: {
      control: 'text',
      description: 'ID of element that describes the switch',
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default switch
export const Default: Story = {
  args: {
    label: 'Enable notifications',
  },
};

// Checked state
export const Checked: Story = {
  args: {
    checked: true,
    label: 'Email alerts',
  },
};

// Disabled states
export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Disabled switch',
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    checked: true,
    label: 'Disabled checked',
  },
};

// Size variations
export const Small: Story = {
  args: {
    size: 'sm',
    label: 'Small switch',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    label: 'Medium switch',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    label: 'Large switch',
  },
};

// Color variations
export const Primary: Story = {
  args: {
    color: 'primary',
    checked: true,
    label: 'Primary color',
  },
};

export const Secondary: Story = {
  args: {
    color: 'secondary',
    checked: true,
    label: 'Secondary color',
  },
};

export const Success: Story = {
  args: {
    color: 'success',
    checked: true,
    label: 'Success color',
  },
};

export const Warning: Story = {
  args: {
    color: 'warning',
    checked: true,
    label: 'Warning color',
  },
};

export const Error: Story = {
  args: {
    color: 'error',
    checked: true,
    label: 'Error color',
  },
};

// Label positions
export const LabelLeft: Story = {
  args: {
    label: 'Label on the left',
    labelPosition: 'left',
  },
};

export const LabelRight: Story = {
  args: {
    label: 'Label on the right',
    labelPosition: 'right',
  },
};

export const NoLabel: Story = {
  args: {
    ariaLabel: 'Toggle setting',
  },
};

// Form integration
export const InForm: Story = {
  args: {
    name: 'marketing_emails',
    value: 'yes',
    label: 'Receive marketing emails',
    required: true,
  },
};

// Use cases for BOOM Card platform
export const PartnerVisibility: Story = {
  args: {
    label: 'Make restaurant visible',
    checked: true,
    color: 'success',
  },
};

export const NotificationSettings: Story = {
  args: {
    label: 'Push notifications',
    defaultChecked: true,
  },
};

export const DiscountActive: Story = {
  args: {
    label: 'Discount active',
    checked: true,
    color: 'primary',
    size: 'lg',
  },
};

export const AutoRenewal: Story = {
  args: {
    label: 'Auto-renewal',
    checked: false,
    color: 'warning',
  },
};

// Accessibility
export const WithDescription: Story = {
  args: {
    label: 'Enable location services',
    ariaDescribedby: 'location-help',
  },
  decorators: [
    (Story) => (
      <div>
        <Story />
        <p id="location-help" style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
          This allows us to show nearby restaurants and deals
        </p>
      </div>
    ),
  ],
};

// Interactive example
export const Interactive: Story = {
  render: () => {
    const [checked, setChecked] = React.useState(false);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Switch
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          label={checked ? 'Notifications enabled' : 'Notifications disabled'}
          color={checked ? 'success' : 'default'}
        />
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
          Status: {checked ? 'Active' : 'Inactive'}
        </p>
      </div>
    );
  },
};

// Multiple switches
export const SwitchGroup: Story = {
  render: () => {
    const [settings, setSettings] = React.useState({
      emailNotifications: true,
      pushNotifications: false,
      smsNotifications: false,
      marketingEmails: true,
    });

    const handleChange = (key: keyof typeof settings) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setSettings({ ...settings, [key]: e.target.checked });
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '18px' }}>Notification Settings</h3>
        <Switch
          checked={settings.emailNotifications}
          onChange={handleChange('emailNotifications')}
          label="Email notifications"
        />
        <Switch
          checked={settings.pushNotifications}
          onChange={handleChange('pushNotifications')}
          label="Push notifications"
        />
        <Switch
          checked={settings.smsNotifications}
          onChange={handleChange('smsNotifications')}
          label="SMS notifications"
        />
        <Switch
          checked={settings.marketingEmails}
          onChange={handleChange('marketingEmails')}
          label="Marketing emails"
          color="secondary"
        />
      </div>
    );
  },
};

// Loading state simulation
export const LoadingState: Story = {
  render: () => {
    const [loading, setLoading] = React.useState(false);
    const [checked, setChecked] = React.useState(false);

      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setChecked(e.target.checked);
      setLoading(false);
    };

    return (
      <Switch
        checked={checked}
        onChange={handleChange}
        disabled={loading}
        label={loading ? 'Updating...' : 'Save preference'}
      />
    );
  },
};

// Error state
export const ErrorState: Story = {
  args: {
    label: 'Failed to update',
    color: 'error',
    checked: false,
    disabled: true,
  },
};

// Custom styling
export const CustomStyled: Story = {
  args: {
    label: 'Custom styled switch',
    className: 'custom-switch',
  },
  decorators: [
    (Story) => (
      <>
        <style>{`
          .custom-switch {
            --switch-track-bg: #e0e0e0;
            --switch-track-bg-checked: #4caf50;
            --switch-thumb-bg: #ffffff;
            --switch-thumb-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
        `}</style>
        <Story />
      </>
    ),
  ],
};
