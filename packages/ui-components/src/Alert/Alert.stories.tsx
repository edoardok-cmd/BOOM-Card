import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './Alert';
import { AlertCircle, CheckCircle2, XCircle, Info } from 'lucide-react';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Alert component for displaying important messages, notifications, and feedback to users.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error', 'info'],
      description: 'Visual style variant of the alert',
    },
    title: {
      control: 'text',
      description: 'Alert title text',
    },
    description: {
      control: 'text',
      description: 'Alert description or body text',
    },
    icon: {
      control: false,
      description: 'Custom icon component',
    },
    dismissible: {
      control: 'boolean',
      description: 'Whether the alert can be dismissed',
    },
    onDismiss: {
      action: 'dismissed',
      description: 'Callback when alert is dismissed',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Welcome to BOOM Card',
    description: 'Start saving at thousands of restaurants, hotels, and entertainment venues.',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Payment Successful',
    description: 'Your BOOM Card subscription has been activated. Enjoy exclusive discounts!',
    icon: <CheckCircle2 className="h-5 w-5" />,
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Subscription Expiring Soon',
    description: 'Your BOOM Card subscription will expire in 7 days. Renew now to keep your benefits.',
    icon: <AlertCircle className="h-5 w-5" />,
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Payment Failed',
    description: 'We couldn\'t process your payment. Please check your card details and try again.',
    icon: <XCircle className="h-5 w-5" />,
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'New Partners Added',
    description: '15 new restaurants and 3 hotels joined BOOM Card this week. Check them out!',
    icon: <Info className="h-5 w-5" />,
  },
};

export const Dismissible: Story = {
  args: {
    variant: 'info',
    title: 'Limited Time Offer',
    description: 'Get 20% extra discount at all spa partners this weekend only!',
    dismissible: true,
  },
};

export const WithoutIcon: Story = {
  args: {
    variant: 'default',
    title: 'System Maintenance',
    description: 'We\'ll be performing scheduled maintenance on Sunday, 2-4 AM.',
  },
};

export const LongContent: Story = {
  args: {
    variant: 'info',
    title: 'How to Use Your BOOM Card',
    description: 'Show your QR code at checkout to receive instant discounts. Partners scan the code, apply your discount, and you save money immediately. No vouchers, no hassle. Your savings are tracked automatically in your account dashboard.',
    icon: <Info className="h-5 w-5" />,
  },
};

export const MultipleAlerts: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-2xl">
      <Alert
        variant="success"
        title="Discount Applied"
        description="You saved €15 at Restaurant Sofia!"
        icon={<CheckCircle2 className="h-5 w-5" />}
      />
      <Alert
        variant="info"
        title="New Feature"
        description="Now you can filter partners by dietary preferences."
        icon={<Info className="h-5 w-5" />}
      />
      <Alert
        variant="warning"
        title="Action Required"
        description="Please update your payment method before renewal."
        icon={<AlertCircle className="h-5 w-5" />}
        dismissible
      />
    </div>
  ),
};

export const CustomStyling: Story = {
  args: {
    variant: 'default',
    title: 'Custom Styled Alert',
    description: 'This alert has custom styling applied via className.',
    className: 'border-2 border-purple-500 bg-purple-50 text-purple-900',
  },
};

export const CompactAlert: Story = {
  args: {
    variant: 'info',
    description: 'Quick tip: Use filters to find vegan-friendly restaurants.',
    icon: <Info className="h-4 w-4" />,
  },
};

export const PartnerNotification: Story = {
  args: {
    variant: 'success',
    title: 'New Partner Nearby',
    description: 'Sky Bar Sofia just joined BOOM Card. Get 25% off all cocktails!',
    icon: <CheckCircle2 className="h-5 w-5" />,
    dismissible: true,
  },
};

export const ValidationError: Story = {
  args: {
    variant: 'error',
    title: 'Invalid QR Code',
    description: 'The scanned QR code is not valid. Please ensure you\'re using the official BOOM Card app.',
    icon: <XCircle className="h-5 w-5" />,
  },
};

export const SubscriptionStatus: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-2xl">
      <Alert
        variant="success"
        title="Active Subscription"
        description="Your BOOM Card is active until December 31, 2024"
        icon={<CheckCircle2 className="h-5 w-5" />}
      />
      <Alert
        variant="info"
        description="You've saved €342 this month with BOOM Card"
        icon={<Info className="h-5 w-5" />}
      />
    </div>
  ),
};

export const LocalizedContent: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-2xl">
      <Alert
        variant="info"
        title="English Content"
        description="This alert shows content in English for international users."
        icon={<Info className="h-5 w-5" />}
      />
      <Alert
        variant="info"
        title="Българско съдържание"
        description="Това известие показва съдържание на български език за местни потребители."
        icon={<Info className="h-5 w-5" />}
      />
    </div>
  ),
};

export const PartnerDashboardAlerts: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-2xl">
      <Alert
        variant="success"
        title="Transaction Processed"
        description="Customer discount of 20% applied successfully. Transaction ID: #12345"
        icon={<CheckCircle2 className="h-5 w-5" />}
      />
      <Alert
        variant="warning"
        title="Monthly Report Available"
        description="Your October 2024 analytics report is ready for download."
        icon={<AlertCircle className="h-5 w-5" />}
        dismissible
      />
      <Alert
        variant="info"
        title="Peak Hours Alert"
        description="Based on your data, Fridays 7-9 PM see the most BOOM Card usage."
        icon={<Info className="h-5 w-5" />}
      />
    </div>
  ),
};

export const AdminPanelAlerts: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-2xl">
      <Alert
        variant="error"
        title="API Rate Limit Exceeded"
        description="Partner POS integration API has exceeded rate limits. Investigating..."
        icon={<XCircle className="h-5 w-5" />}
      />
      <Alert
        variant="warning"
        title="Pending Partner Applications"
        description="23 new partner applications are awaiting review."
        icon={<AlertCircle className="h-5 w-5" />}
        dismissible
      />
      <Alert
        variant="success"
        title="System Health Check"
        description="All systems operational. Uptime: 99.9%"
        icon={<CheckCircle2 className="h-5 w-5" />}
      />
    </div>
  ),
};
