import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from './Progress';

const meta = {
  title: 'Components/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Progress indicator component for showing completion status, loading states, and data visualization.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Progress value (0-100)',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Progress bar size',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'success', 'warning', 'error', 'info'],
      description: 'Progress bar variant',
    },
    showLabel: {
      control: 'boolean',
      description: 'Show percentage label',
    },
    label: {
      control: 'text',
      description: 'Custom label text',
    },
    animated: {
      control: 'boolean',
      description: 'Enable progress animation',
    },
    striped: {
      control: 'boolean',
      description: 'Show striped pattern',
    },
    indeterminate: {
      control: 'boolean',
      description: 'Indeterminate loading state',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 60,
    showLabel: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 w-64">
      <div>
        <p className="text-sm text-gray-600 mb-2">Small</p>
        <Progress value={75} size="sm" showLabel />
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-2">Medium</p>
        <Progress value={75} size="md" showLabel />
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-2">Large</p>
        <Progress value={75} size="lg" showLabel />
      </div>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-4 w-64">
      <div>
        <p className="text-sm text-gray-600 mb-2">Default</p>
        <Progress value={60} variant="default" showLabel />
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-2">Success</p>
        <Progress value={90} variant="success" showLabel />
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-2">Warning</p>
        <Progress value={50} variant="warning" showLabel />
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-2">Error</p>
        <Progress value={30} variant="error" showLabel />
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-2">Info</p>
        <Progress value={70} variant="info" showLabel />
      </div>
    </div>
  ),
};

export const WithCustomLabel: Story = {
  args: {
    value: 45,
    label: 'Processing... 45%',
    showLabel: true,
  },
};

export const Animated: Story = {
  args: {
    value: 80,
    animated: true,
    showLabel: true,
  },
};

export const Striped: Story = {
  args: {
    value: 65,
    striped: true,
    animated: true,
    showLabel: true,
  },
};

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
    animated: true,
  },
};

export const DiscountSavings: Story = {
  name: 'Discount Savings Progress',
  render: () => {
    const savings = 850;
    const target = 1000;
    const percentage = (savings / target) * 100;
    
    return (
      <div className="w-80 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Monthly Savings Goal</h3>
        <p className="text-sm text-gray-600 mb-4">
          €{savings} of €{target} saved
        </p>
        <Progress 
          value={percentage} 
          variant={percentage >= 80 ? 'success' : 'default'}
          showLabel
          animated
        />
      </div>
    );
  },
};

export const SubscriptionUsage: Story = {
  name: 'Subscription Usage',
  render: () => {
    const used = 12;
    const total = 20;
    
    return (
      <div className="w-80 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Monthly Discount Uses</h3>
        <p className="text-sm text-gray-600 mb-4">
          {used} of {total} discounts used
        </p>
        <Progress 
          value={percentage} 
          variant={percentage >= 90 ? 'warning' : 'info'}
          label={`${used}/${total} uses`}
          showLabel
        />
      </div>
    );
  },
};

export const PartnerPerformance: Story = {
  name: 'Partner Performance Metrics',
  render: () => (
    <div className="w-96 p-4 bg-white rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold">Restaurant Performance</h3>
      
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">Customer Satisfaction</span>
          <span className="text-sm text-gray-600">92%</span>
        </div>
        <Progress value={92} variant="success" size="sm" />
      </div>
      
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">Repeat Customers</span>
          <span className="text-sm text-gray-600">78%</span>
        </div>
        <Progress value={78} variant="info" size="sm" />
      </div>
      
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">Monthly Revenue Goal</span>
          <span className="text-sm text-gray-600">65%</span>
        </div>
        <Progress value={65} variant="warning" size="sm" />
      </div>
    </div>
  ),
};

export const LoadingStates: Story = {
  name: 'Loading States',
  render: () => (
    <div className="space-y-4 w-64">
      <div>
        <p className="text-sm text-gray-600 mb-2">Determinate Loading</p>
        <Progress value={35} animated striped />
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-2">Indeterminate Loading</p>
        <Progress indeterminate animated />
      </div>
    </div>
  ),
};

export const MultiProgress: Story = {
  name: 'Category Distribution',
  render: () => {
    const categories = [
      { name: 'Restaurants', value: 45, color: 'bg-blue-500' },
      { name: 'Hotels', value: 25, color: 'bg-green-500' },
      { name: 'Entertainment', value: 20, color: 'bg-purple-500' },
      { name: 'Spa & Wellness', value: 10, color: 'bg-pink-500' },
    ];
    
    return (
      <div className="w-96 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Partner Distribution</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.name}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{category.name}</span>
                <span className="text-sm text-gray-600">{category.value}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${category.color} transition-all duration-500`}
                  style={{ width: `${category.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export const WithTooltip: Story = {
  args: {
    value: 75,
    showLabel: true,
    tooltip: '75% of your monthly goal achieved!',
  },
};

export const AccessibilityExample: Story = {
  args: {
    value: 60,
    showLabel: true,
    'aria-label': 'Download progress: 60%',
    role: 'progressbar',
    'aria-valuenow': 60,
    'aria-valuemin': 0,
    'aria-valuemax': 100,
  },
};
