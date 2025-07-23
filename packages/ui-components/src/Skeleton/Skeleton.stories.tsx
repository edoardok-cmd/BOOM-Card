import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './Skeleton';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Skeleton component for loading states in the BOOM Card discount platform.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'circular', 'rectangular', 'rounded'],
      description: 'The shape variant of the skeleton',
    },
    width: {
      control: 'text',
      description: 'Width of the skeleton (CSS value)',
    },
    height: {
      control: 'text',
      description: 'Height of the skeleton (CSS value)',
    },
    animation: {
      control: 'select',
      options: ['pulse', 'wave', 'none'],
      description: 'Animation type for the skeleton',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic skeleton variants
export const Text: Story = {
  args: {
    variant: 'text',
    width: '200px',
  },
};

export const Circular: Story = {
  args: {
    variant: 'circular',
    width: '60px',
    height: '60px',
  },
};

export const Rectangular: Story = {
  args: {
    variant: 'rectangular',
    width: '300px',
    height: '200px',
  },
};

export const Rounded: Story = {
  args: {
    variant: 'rounded',
    width: '300px',
    height: '200px',
  },
};

// Animation variants
export const PulseAnimation: Story = {
  args: {
    variant: 'rectangular',
    width: '300px',
    height: '100px',
    animation: 'pulse',
  },
};

export const WaveAnimation: Story = {
  args: {
    variant: 'rectangular',
    width: '300px',
    height: '100px',
    animation: 'wave',
  },
};

export const NoAnimation: Story = {
  args: {
    variant: 'rectangular',
    width: '300px',
    height: '100px',
    animation: 'none',
  },
};

// Common use cases for BOOM Card platform
export const RestaurantCard: Story = {
  render: () => (
    <div style={{ width: '320px', padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
      <Skeleton variant="rectangular" width="100%" height="180px" style={{ marginBottom: '16px' }} />
      <Skeleton variant="text" width="80%" height="24px" style={{ marginBottom: '8px' }} />
      <Skeleton variant="text" width="60%" height="16px" style={{ marginBottom: '12px' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Skeleton variant="circular" width="20px" height="20px" />
        <Skeleton variant="text" width="100px" height="16px" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton variant="text" width="80px" height="20px" />
        <Skeleton variant="rounded" width="100px" height="36px" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Restaurant card skeleton for loading state',
      },
    },
  },
};

export const UserProfile: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px' }}>
      <Skeleton variant="circular" width="80px" height="80px" />
      <div style={{ flex: 1 }}>
        <Skeleton variant="text" width="150px" height="24px" style={{ marginBottom: '8px' }} />
        <Skeleton variant="text" width="200px" height="16px" style={{ marginBottom: '4px' }} />
        <Skeleton variant="text" width="180px" height="16px" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'User profile skeleton for loading state',
      },
    },
  },
};

export const PartnerList: Story = {
  render: () => (
    <div style={{ width: '100%', maxWidth: '600px' }}>
      {[1, 2, 3].map((index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Skeleton variant="rectangular" width="100px" height="80px" />
          <div style={{ flex: 1 }}>
            <Skeleton variant="text" width="200px" height="20px" style={{ marginBottom: '8px' }} />
            <Skeleton variant="text" width="150px" height="16px" style={{ marginBottom: '4px' }} />
            <Skeleton variant="text" width="100px" height="16px" />
          </div>
          <Skeleton variant="text" width="60px" height="24px" />
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Partner list skeleton for loading state',
      },
    },
  },
};

export const DiscountBadge: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px' }}>
      <Skeleton variant="rounded" width="80px" height="32px" />
      <Skeleton variant="rounded" width="80px" height="32px" />
      <Skeleton variant="rounded" width="80px" height="32px" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Discount badge skeleton for loading state',
      },
    },
  },
};

export const MapCard: Story = {
  render: () => (
    <div style={{ width: '400px', padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
      <Skeleton variant="rectangular" width="100%" height="250px" style={{ marginBottom: '16px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <Skeleton variant="text" width="120px" height="20px" />
        <Skeleton variant="text" width="80px" height="20px" />
      </div>
      <Skeleton variant="text" width="100%" height="16px" style={{ marginBottom: '8px' }} />
      <Skeleton variant="text" width="80%" height="16px" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Map card skeleton for loading state',
      },
    },
  },
};

export const TransactionHistory: Story = {
  render: () => (
    <div style={{ width: '100%', maxWidth: '800px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
            <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Partner</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Amount</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Discount</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Saved</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map((index) => (
            <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
              <td style={{ padding: '12px' }}>
                <Skeleton variant="text" width="100px" height="16px" />
              </td>
              <td style={{ padding: '12px' }}>
                <Skeleton variant="text" width="150px" height="16px" />
              </td>
              <td style={{ padding: '12px' }}>
                <Skeleton variant="text" width="80px" height="16px" />
              </td>
              <td style={{ padding: '12px' }}>
                <Skeleton variant="text" width="60px" height="16px" />
              </td>
              <td style={{ padding: '12px' }}>
                <Skeleton variant="text" width="80px" height="16px" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Transaction history table skeleton for loading state',
      },
    },
  },
};

export const CategoryGrid: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', maxWidth: '800px' }}>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
        <div key={index} style={{ textAlign: 'center' }}>
          <Skeleton variant="circular" width="80px" height="80px" style={{ margin: '0 auto 12px' }} />
          <Skeleton variant="text" width="100%" height="16px" />
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Category grid skeleton for loading state',
      },
    },
  },
};

export const SubscriptionCard: Story = {
  render: () => (
    <div style={{ width: '320px', padding: '24px', border: '1px solid #e0e0e0', borderRadius: '12px' }}>
      <Skeleton variant="text" width="120px" height="28px" style={{ margin: '0 auto 16px' }} />
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Skeleton variant="text" width="100px" height="48px" style={{ margin: '0 auto 8px' }} />
        <Skeleton variant="text" width="80px" height="16px" style={{ margin: '0 auto' }} />
      </div>
      <div style={{ marginBottom: '24px' }}>
        {[1, 2, 3, 4].map((index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Skeleton variant="circular" width="20px" height="20px" />
            <Skeleton variant="text" width="200px" height="16px" />
          </div>
        ))}
      </div>
      <Skeleton variant="rounded" width="100%" height="48px" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Subscription plan card skeleton for loading state',
      },
    },
  },
};

export const QRCodeDisplay: Story = {
  render: () => (
    <div style={{ textAlign: 'center', padding: '24px' }}>
      <Skeleton variant="rectangular" width="200px" height="200px" style={{ margin: '0 auto 16px' }} />
      <Skeleton variant="text" width="160px" height="20px" style={{ margin: '0 auto 8px' }} />
      <Skeleton variant="text" width="120px" height="16px" style={{ margin: '0 auto' }} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'QR code display skeleton for loading state',
      },
    },
  },
};
