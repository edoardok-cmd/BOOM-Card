import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Badge component for displaying status indicators, counts, and labels throughout the BOOM Card platform.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'error', 'info'],
      description: 'The visual style variant of the badge',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the badge',
    },
    rounded: {
      control: 'boolean',
      description: 'Whether the badge should have fully rounded corners',
    },
    pulse: {
      control: 'boolean',
      description: 'Whether the badge should have a pulsing animation',
    },
    dot: {
      control: 'boolean',
      description: 'Whether to show only a dot instead of content',
    },
    removable: {
      control: 'boolean',
      description: 'Whether the badge can be removed',
    },
    icon: {
      control: 'text',
      description: 'Icon to display in the badge',
    },
    children: {
      control: 'text',
      description: 'Content to display in the badge',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variants
export const Default: Story = {
  args: {
    children: 'Default',
    variant: 'default',
  },
};

export const Primary: Story = {
  args: {
    children: 'Primary',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

export const Success: Story = {
  args: {
    children: 'Success',
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    children: 'Warning',
    variant: 'warning',
  },
};

export const Error: Story = {
  args: {
    children: 'Error',
    variant: 'error',
  },
};

export const Info: Story = {
  args: {
    children: 'Info',
    variant: 'info',
  },
};

// Size variations
export const Small: Story = {
  args: {
    children: 'Small',
    size: 'sm',
    variant: 'primary',
  },
};

export const Medium: Story = {
  args: {
    children: 'Medium',
    size: 'md',
    variant: 'primary',
  },
};

export const Large: Story = {
  args: {
    children: 'Large',
    size: 'lg',
    variant: 'primary',
  },
};

// Special states
export const Rounded: Story = {
  args: {
    children: '99+',
    rounded: true,
    variant: 'error',
  },
};

export const Pulsing: Story = {
  args: {
    children: 'New',
    pulse: true,
    variant: 'success',
  },
};

export const DotOnly: Story = {
  args: {
    dot: true,
    variant: 'error',
    pulse: true,
  },
};

export const WithIcon: Story = {
  args: {
    children: 'Premium',
    icon: '👑',
    variant: 'primary',
  },
};

export const Removable: Story = {
  args: {
    children: 'Removable',
    removable: true,
    variant: 'secondary',
    onRemove: () => console.log('Badge removed'),
  },
};

// Business use cases
export const DiscountPercentage: Story = {
  args: {
    children: '-25%',
    variant: 'success',
    size: 'lg',
  },
};

export const PartnerStatus: Story = {
  args: {
    children: 'Verified Partner',
    icon: '✓',
    variant: 'primary',
  },
};

export const NewPartner: Story = {
  args: {
    children: 'NEW',
    variant: 'info',
    pulse: true,
  },
};

export const HotDeal: Story = {
  args: {
    children: '🔥 HOT',
    variant: 'error',
    pulse: true,
  },
};

export const LimitedTime: Story = {
  args: {
    children: 'Limited Time',
    variant: 'warning',
  },
};

export const VenueType: Story = {
  args: {
    children: 'Restaurant',
    variant: 'secondary',
  },
};

export const Rating: Story = {
  args: {
    children: '4.8 ⭐',
    variant: 'default',
  },
};

export const SavedAmount: Story = {
  args: {
    children: 'Saved €250',
    variant: 'success',
    size: 'lg',
  },
};

export const MembershipTier: Story = {
  args: {
    children: 'Gold Member',
    icon: '🏆',
    variant: 'warning',
  },
};

export const ActiveStatus: Story = {
  args: {
    dot: true,
    variant: 'success',
    pulse: true,
  },
};

// Complex combinations
export const CategoryTag: Story = {
  args: {
    children: 'Fine Dining',
    removable: true,
    variant: 'default',
    size: 'sm',
  },
};

export const NotificationBadge: Story = {
  args: {
    children: '3',
    rounded: true,
    variant: 'error',
    size: 'sm',
  },
};

export const FeatureBadge: Story = {
  args: {
    children: 'QR Code Ready',
    icon: '📱',
    variant: 'info',
  },
};

// Showcase all variants
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
      <Badge variant="default">Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),
};

// Showcase all sizes
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
      <Badge size="sm" variant="primary">Small</Badge>
      <Badge size="md" variant="primary">Medium</Badge>
      <Badge size="lg" variant="primary">Large</Badge>
    </div>
  ),
};

// Business scenario showcase
export const BusinessScenarios: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h4 style={{ marginBottom: '8px' }}>Partner Badges</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Badge variant="primary" icon="✓">Verified Partner</Badge>
          <Badge variant="info" pulse>NEW</Badge>
          <Badge variant="success">Active</Badge>
          <Badge variant="warning">Expiring Soon</Badge>
          <Badge variant="error">Expired</Badge>
        </div>
      </div>
      
      <div>
        <h4 style={{ marginBottom: '8px' }}>Discount Indicators</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Badge variant="success" size="lg">-10%</Badge>
          <Badge variant="success" size="lg">-25%</Badge>
          <Badge variant="success" size="lg">-50%</Badge>
          <Badge variant="error" pulse>🔥 -75%</Badge>
        </div>
      </div>
      
      <div>
        <h4 style={{ marginBottom: '8px' }}>Categories</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Badge variant="secondary" removable>Restaurant</Badge>
          <Badge variant="secondary" removable>Hotel</Badge>
          <Badge variant="secondary" removable>Spa</Badge>
          <Badge variant="secondary" removable>Entertainment</Badge>
        </div>
      </div>
      
      <div>
        <h4 style={{ marginBottom: '8px' }}>User Status</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Badge variant="default">Basic</Badge>
          <Badge variant="primary" icon="⭐">Premium</Badge>
          <Badge variant="warning" icon="🏆">Gold</Badge>
          <Badge variant="error" icon="💎">VIP</Badge>
        </div>
      </div>
    </div>
  ),
};

// Interactive example
export const Interactive: Story = {
  render: function Render() {
    const handleRemove = (label: string) => {
      console.log(`Removed: ${label}`);
    };

    return (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Badge variant="primary" removable onRemove={() => handleRemove('Feature 1')}>
          Feature 1
        </Badge>
        <Badge variant="secondary" removable onRemove={() => handleRemove('Feature 2')}>
          Feature 2
        </Badge>
        <Badge variant="info" removable onRemove={() => handleRemove('Feature 3')}>
          Feature 3
        </Badge>
      </div>
    );
  },
};
