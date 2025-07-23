import type { Meta, StoryObj } from '@storybook/react';
import { Toast } from './Toast';
import { ToastProvider } from './ToastProvider';
import { useToast } from './useToast';
import { Button } from '../Button';

const meta: Meta<typeof Toast> = {
  title: 'Components/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Toast notifications for BOOM Card platform with multiple variants and positions',
      },
    },
  },
  decorators: [
    (Story) => (
      <ToastProvider>
        <div style={{ minHeight: '400px', width: '100vw', padding: '2rem' }}>
          <Story />
        </div>
      </ToastProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Toast>;

// Helper component to trigger toasts
const ToastTrigger = ({ variant, position, duration, title, description }: any) => {
  const { toast } = useToast();

  return (
    <Button
      onClick={() =>
        toast({
          variant,
          position,
          duration,
          title,
          description,
        })
      }
    >
      Show {variant} Toast
    </Button>
  );
};

export const Default: Story = {
  render: () => (
    <ToastTrigger
      variant="default"
      title="Notification"
      description="Your discount card has been activated successfully."
    />
  ),
};

export const Success: Story = {
  render: () => (
    <ToastTrigger
      variant="success"
      title="Success!"
      description="You've saved 20% at Restaurant Sofia. Total savings: 12.50 BGN"
    />
  ),
};

export const Error: Story = {
  render: () => (
    <ToastTrigger
      variant="error"
      title="Error"
      description="Failed to process payment. Please try again or contact support."
    />
  ),
};

export const Warning: Story = {
  render: () => (
    <ToastTrigger
      variant="warning"
      title="Warning"
      description="Your subscription expires in 3 days. Renew now to keep your benefits."
    />
  ),
};

export const Info: Story = {
  render: () => (
    <ToastTrigger
      variant="info"
      title="New Partners Added"
      description="5 new restaurants joined BOOM Card this week in your area!"
    />
  ),
};

export const LongContent: Story = {
  render: () => (
    <ToastTrigger
      variant="success"
      title="Transaction Complete"
      description="Your payment has been processed successfully. You saved 25% (15.00 BGN) at Sky Bar Sofia. Your total savings this month: 127.50 BGN. Keep using BOOM Card to unlock exclusive rewards!"
    />
  ),
};

export const NoDescription: Story = {
  render: () => (
    <ToastTrigger
      variant="success"
      title="Saved successfully"
    />
  ),
};

export const CustomDuration: Story = {
  render: () => (
    <ToastTrigger
      variant="info"
      title="Custom Duration (10s)"
      description="This toast will stay visible for 10 seconds"
      duration={10000}
    />
  ),
};

export const AllPositions: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
      <ToastTrigger
        variant="default"
        position="top-left"
        title="Top Left"
        description="Toast positioned at top-left"
      />
      <ToastTrigger
        variant="info"
        position="top-center"
        title="Top Center"
        description="Toast positioned at top-center"
      />
      <ToastTrigger
        variant="success"
        position="top-right"
        title="Top Right"
        description="Toast positioned at top-right"
      />
      <ToastTrigger
        variant="warning"
        position="bottom-left"
        title="Bottom Left"
        description="Toast positioned at bottom-left"
      />
      <ToastTrigger
        variant="error"
        position="bottom-center"
        title="Bottom Center"
        description="Toast positioned at bottom-center"
      />
      <ToastTrigger
        variant="default"
        position="bottom-right"
        title="Bottom Right"
        description="Toast positioned at bottom-right"
      />
    </div>
  ),
};

export const MultipleToasts: Story = {
  render: () => {
    const MultipleToastTrigger = () => {
      const { toast } = useToast();

      const showMultipleToasts = () => {
        toast({
          variant: 'success',
          title: 'First Toast',
          description: 'Payment processed successfully',
        });
        
        setTimeout(() => {
          toast({
            variant: 'info',
            title: 'Second Toast',
            description: 'New discount available at nearby restaurant',
          });
        }, 500);
        
        setTimeout(() => {
          toast({
            variant: 'warning',
            title: 'Third Toast',
            description: 'Limited time offer expires soon',
          });
        }, 1000);
      };

      return (
        <Button onClick={showMultipleToasts}>
          Show Multiple Toasts
        </Button>
      );
    };

    return <MultipleToastTrigger />;
  },
};

export const WithAction: Story = {
  render: () => {
    const ActionToastTrigger = () => {
      const { toast } = useToast();

      return (
        <Button
          onClick={() =>
            toast({
              variant: 'default',
              title: 'New Feature Available',
              description: 'Try our new QR code scanner for faster checkouts',
              action: {
                label: 'Try Now',
                onClick: () => console.log('Action clicked'),
              },
            })
          }
        >
          Show Toast with Action
        </Button>
      );
    };

    return <ActionToastTrigger />;
  },
};

export const PersistentToast: Story = {
  render: () => {
    const PersistentToastTrigger = () => {
      const { toast } = useToast();

      return (
        <Button
          onClick={() =>
            toast({
              variant: 'error',
              title: 'Action Required',
              description: 'Please verify your email address to continue using BOOM Card',
              duration: Infinity,
              action: {
                label: 'Verify Email',
                onClick: () => console.log('Verify email clicked'),
              },
            })
          }
        >
          Show Persistent Toast
        </Button>
      );
    };

    return <PersistentToastTrigger />;
  },
};

export const Playground: Story = {
  render: () => {
    const PlaygroundComponent = () => {
      const { toast } = useToast();

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '600px' }}>
          <div>
            <h3>Toast Playground</h3>
            <p>Experiment with different toast configurations</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <Button
              variant="default"
              onClick={() =>
                toast({
                  title: 'Welcome to BOOM Card!',
                  description: 'Start saving at thousands of locations',
                })
              }
            >
              Default Toast
            </Button>
            
            <Button
              variant="primary"
              onClick={() =>
                toast({
                  variant: 'success',
                  title: 'QR Code Scanned',
                  description: 'Discount applied successfully',
                })
              }
            >
              Success Toast
            </Button>
            
            <Button
              variant="destructive"
              onClick={() =>
                toast({
                  variant: 'error',
                  title: 'Invalid QR Code',
                  description: 'Please try scanning again',
                })
              }
            >
              Error Toast
            </Button>
            
            <Button
              variant="outline"
              onClick={() =>
                toast({
                  variant: 'warning',
                  title: 'Low Balance',
                  description: 'Add funds to continue using premium features',
                  action: {
                    label: 'Add Funds',
                    onClick: () => console.log('Add funds clicked'),
                  },
                })
              }
            >
              Warning with Action
            </Button>
            
            <Button
              variant="secondary"
              onClick={() =>
                toast({
                  variant: 'info',
                  title: 'Partner Update',
                  description: '10 new restaurants added in Sofia',
                  position: 'top-center',
                })
              }
            >
              Info (Top Center)
            </Button>
            
            <Button
              variant="ghost"
              onClick={() =>
                toast({
                  title: 'Subscription Active',
                  description: 'Valid until December 31, 2024',
                  duration: 8000,
                  position: 'bottom-left',
                })
              }
            >
              Custom Duration (8s)
            </Button>
          </div>
        </div>
      );
    };

    return <PlaygroundComponent />;
  },
};
