import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './Tooltip';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import { Badge } from '../Badge/Badge';
import { IconInfo, IconHelp, IconWarning } from '../Icons';
import React from 'react';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Tooltips display informative text when users hover over, focus on, or tap an element.',
      },
    },
  },
  argTypes: {
    content: {
      control: 'text',
      description: 'The content to display in the tooltip',
    },
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right', 'top-start', 'top-end', 'bottom-start', 'bottom-end', 'left-start', 'left-end', 'right-start', 'right-end'],
      description: 'Placement of the tooltip relative to the trigger element',
    },
    trigger: {
      control: 'radio',
      options: ['hover', 'click', 'focus'],
      description: 'Event that triggers the tooltip',
    },
    delay: {
      control: 'number',
      description: 'Delay in milliseconds before showing the tooltip',
    },
    arrow: {
      control: 'boolean',
      description: 'Whether to show an arrow pointing to the trigger element',
    },
    offset: {
      control: 'object',
      description: 'Offset from the trigger element',
    },
    maxWidth: {
      control: 'number',
      description: 'Maximum width of the tooltip',
    },
    theme: {
      control: 'select',
      options: ['dark', 'light', 'primary', 'error', 'warning', 'success'],
      description: 'Theme variant of the tooltip',
    },
    interactive: {
      control: 'boolean',
      description: 'Whether the tooltip should remain open when hovering over it',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the tooltip is disabled',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '100px', minHeight: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

// Basic usage
export const Default: Story = {
  args: {
    content: 'Save 20% on your next visit!',
    children: <Button>Hover me</Button>,
  },
};

// Different placements
export const Placements: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(3, 1fr)' }}>
      <Tooltip content="Top placement" placement="top">
        <Button variant="outline">Top</Button>
      </Tooltip>
      <Tooltip content="Bottom placement" placement="bottom">
        <Button variant="outline">Bottom</Button>
      </Tooltip>
      <Tooltip content="Left placement" placement="left">
        <Button variant="outline">Left</Button>
      </Tooltip>
      <Tooltip content="Right placement" placement="right">
        <Button variant="outline">Right</Button>
      </Tooltip>
      <Tooltip content="Top start placement" placement="top-start">
        <Button variant="outline">Top Start</Button>
      </Tooltip>
      <Tooltip content="Bottom end placement" placement="bottom-end">
        <Button variant="outline">Bottom End</Button>
      </Tooltip>
    </div>
  ),
};

// Different triggers
export const Triggers: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem' }}>
      <Tooltip content="Hover to see tooltip" trigger="hover">
        <Button>Hover</Button>
      </Tooltip>
      <Tooltip content="Click to see tooltip" trigger="click">
        <Button>Click</Button>
      </Tooltip>
      <Tooltip content="Focus to see tooltip" trigger="focus">
        <Button>Focus</Button>
      </Tooltip>
    </div>
  ),
};

// Theme variants
export const Themes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
      <Tooltip content="Dark theme tooltip" theme="dark">
        <Button variant="outline">Dark</Button>
      </Tooltip>
      <Tooltip content="Light theme tooltip" theme="light">
        <Button variant="outline">Light</Button>
      </Tooltip>
      <Tooltip content="Primary theme tooltip" theme="primary">
        <Button variant="outline">Primary</Button>
      </Tooltip>
      <Tooltip content="Error theme tooltip" theme="error">
        <Button variant="outline">Error</Button>
      </Tooltip>
      <Tooltip content="Warning theme tooltip" theme="warning">
        <Button variant="outline">Warning</Button>
      </Tooltip>
      <Tooltip content="Success theme tooltip" theme="success">
        <Button variant="outline">Success</Button>
      </Tooltip>
    </div>
  ),
};

// Rich content
export const RichContent: Story = {
  args: {
    content: (
      <div>
        <strong>Exclusive Discount!</strong>
        <p style={{ margin: '0.5rem 0' }}>Get 25% off your total bill</p>
        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
          <li>Valid Monday - Thursday</li>
          <li>Maximum discount: 50 BGN</li>
          <li>Cannot be combined with other offers</li>
        </ul>
      </div>
    ),
    maxWidth: 300,
    children: <Button variant="primary">View Offer Details</Button>,
  },
};

// With icons
export const WithIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
      <Tooltip content="Information about discounts">
        <IconInfo size={24} style={{ cursor: 'pointer' }} />
      </Tooltip>
      <Tooltip content="Need help? Contact support" theme="primary">
        <IconHelp size={24} style={{ cursor: 'pointer', color: '#0066cc' }} />
      </Tooltip>
      <Tooltip content="Limited time offer!" theme="warning">
        <IconWarning size={24} style={{ cursor: 'pointer', color: '#ff9800' }} />
      </Tooltip>
    </div>
  ),
};

// Interactive tooltip
export const Interactive: Story = {
  args: {
    content: (
      <div>
        <p>This tooltip stays open when you hover over it</p>
        <Button size="sm" style={{ marginTop: '0.5rem' }}>
          Click to apply discount
        </Button>
      </div>
    ),
    interactive: true,
    children: <Button>Interactive Tooltip</Button>,
  },
};

// With delay
export const WithDelay: Story = {
  args: {
    content: 'This tooltip appears after 1 second',
    delay: 1000,
    children: <Button>Delayed Tooltip</Button>,
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    content: 'This tooltip is disabled',
    disabled: true,
    children: <Button disabled>Disabled Button</Button>,
  },
};

// Complex use case - Restaurant card
export const RestaurantCard: Story = {
  render: () => (
    <Card style={{ padding: '1.5rem', maxWidth: '350px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>La Bella Vita</h3>
          <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Italian Restaurant</p>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Badge variant="success">-20%</Badge>
            <Tooltip 
              content="Discount applies to food only, beverages excluded"
              placement="right"
            >
              <IconInfo size={16} style={{ cursor: 'pointer', color: '#666' }} />
            </Tooltip>
          </div>
        </div>
        <Tooltip
          content={
            <div>
              <strong>Opening Hours:</strong>
              <div style={{ marginTop: '0.5rem' }}>
                Mon-Fri: 11:00 - 23:00<br />
                Sat-Sun: 10:00 - 24:00
              </div>
            </div>
          }
          placement="left"
        >
          <Button variant="ghost" size="sm">Hours</Button>
        </Tooltip>
      </div>
    </Card>
  ),
};

// Multilingual support
export const Multilingual: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem' }}>
      <Tooltip content="20% discount on all menu items">
        <Button>English</Button>
      </Tooltip>
      <Tooltip content="20% отстъпка на всички артикули от менюто">
        <Button>Български</Button>
      </Tooltip>
    </div>
  ),
};

// Mobile-friendly tooltip
export const MobileFriendly: Story = {
  args: {
    content: 'On mobile devices, this tooltip is triggered by tap',
    trigger: 'click',
    children: (
      <Button>
        Tap for info (Mobile friendly)
      </Button>
    ),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

// Custom styling
export const CustomStyling: Story = {
  args: {
    content: 'Custom styled tooltip with gradient background',
    className: 'custom-tooltip',
    children: <Button>Custom Styled</Button>,
  },
  decorators: [
    (Story) => (
      <>
        <style>{`
          .custom-tooltip {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }
        `}</style>
        <Story />
      </>
    ),
  ],
};

// Arrow variations
export const ArrowOptions: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem' }}>
      <Tooltip content="Tooltip with arrow" arrow={true}>
        <Button variant="outline">With Arrow</Button>
      </Tooltip>
      <Tooltip content="Tooltip without arrow" arrow={false}>
        <Button variant="outline">Without Arrow</Button>
      </Tooltip>
    </div>
  ),
};

// Long content handling
export const LongContent: Story = {
  args: {
    content: 'This is a very long tooltip content that demonstrates how the component handles lengthy text. The tooltip will have a maximum width and the text will wrap appropriately to ensure readability while maintaining a good visual appearance.',
    maxWidth: 250,
    children: <Button>Long Content</Button>,
  },
};

// Accessibility