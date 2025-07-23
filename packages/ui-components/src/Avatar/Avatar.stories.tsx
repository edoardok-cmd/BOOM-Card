import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Avatar component for displaying user profile images, partner logos, or placeholder initials in the BOOM Card platform.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: 'text',
      description: 'Image source URL',
    },
    alt: {
      control: 'text',
      description: 'Alternative text for the image',
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Avatar size variant',
    },
    variant: {
      control: { type: 'select' },
      options: ['circle', 'rounded', 'square'],
      description: 'Avatar shape variant',
    },
    status: {
      control: { type: 'select' },
      options: ['online', 'offline', 'away', 'busy', undefined],
      description: 'Status indicator',
    },
    statusPosition: {
      control: { type: 'select' },
      options: ['top-right', 'bottom-right', 'top-left', 'bottom-left'],
      description: 'Position of the status indicator',
    },
    initials: {
      control: 'text',
      description: 'Initials to display when no image is provided',
    },
    name: {
      control: 'text',
      description: 'Full name for generating initials automatically',
    },
    fallbackIcon: {
      control: 'boolean',
      description: 'Show default icon when no image or initials',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading skeleton',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    badge: {
      control: 'object',
      description: 'Badge configuration',
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default avatar with image
export const Default: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop',
    alt: 'John Doe',
    size: 'md',
  },
};

// Avatar with initials
export const WithInitials: Story = {
  args: {
    initials: 'JD',
    size: 'md',
    variant: 'circle',
  },
};

// Avatar with auto-generated initials from name
export const WithName: Story = {
  args: {
    name: 'Maria Petrova',
    size: 'md',
    variant: 'circle',
  },
};

// Different sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar
        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop"
        alt="User"
        size="xs"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop"
        alt="User"
        size="sm"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop"
        alt="User"
        size="md"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop"
        alt="User"
        size="lg"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop"
        alt="User"
        size="xl"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop"
        alt="User"
        size="2xl"
      />
    </div>
  ),
};

// Different variants
export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar
        src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop"
        alt="Circle"
        variant="circle"
        size="lg"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop"
        alt="Rounded"
        variant="rounded"
        size="lg"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop"
        alt="Square"
        variant="square"
        size="lg"
      />
    </div>
  ),
};

// With status indicators
export const WithStatus: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar
        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop"
        alt="Online user"
        status="online"
        size="lg"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop"
        alt="Offline user"
        status="offline"
        size="lg"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop"
        alt="Away user"
        status="away"
        size="lg"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop"
        alt="Busy user"
        status="busy"
        size="lg"
      />
    </div>
  ),
};

// Status positions
export const StatusPositions: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar
        initials="TR"
        status="online"
        statusPosition="top-right"
        size="lg"
      />
      <Avatar
        initials="BR"
        status="online"
        statusPosition="bottom-right"
        size="lg"
      />
      <Avatar
        initials="TL"
        status="online"
        statusPosition="top-left"
        size="lg"
      />
      <Avatar
        initials="BL"
        status="online"
        statusPosition="bottom-left"
        size="lg"
      />
    </div>
  ),
};

// With badges
export const WithBadges: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar
        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop"
        alt="Premium user"
        badge={{
          content: '✓',
          variant: 'success',
        }}
        size="lg"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop"
        alt="Partner"
        badge={{
          content: 'P',
          variant: 'primary',
        }}
        size="lg"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop"
        alt="New user"
        badge={{
          content: '5',
          variant: 'danger',
        }}
        size="lg"
      />
    </div>
  ),
};

// Loading states
export const Loading: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar loading size="xs" />
      <Avatar loading size="sm" />
      <Avatar loading size="md" />
      <Avatar loading size="lg" />
      <Avatar loading size="xl" />
    </div>
  ),
};

// Fallback states
export const FallbackStates: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="text-center">
        <Avatar size="lg" />
        <p className="mt-2 text-sm text-gray-600">Default icon</p>
      </div>
      <div className="text-center">
        <Avatar size="lg" fallbackIcon={false} />
        <p className="mt-2 text-sm text-gray-600">No icon</p>
      </div>
      <div className="text-center">
        <Avatar src="invalid-url.jpg" alt="Failed to load" size="lg" />
        <p className="mt-2 text-sm text-gray-600">Failed image</p>
      </div>
    </div>
  ),
};

// Interactive avatar
export const Interactive: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
    alt: 'Click me',
    size: 'lg',
    onClick: () => alert('Avatar clicked!'),
  },
};

// Avatar group example
export const AvatarGroup: Story = {
  render: () => (
    <div className="flex -space-x-4">
      <Avatar
        src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?w=300&h=300&fit=crop"
        alt="User 1"
        className="ring-2 ring-white"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1550525811-e5869dd03032?w=300&h=300&fit=crop"
        alt="User 2"
        className="ring-2 ring-white"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop"
        alt="User 3"
        className="ring-2 ring-white"
      />
      <Avatar
        initials="+5"
        className="ring-2 ring-white bg-gray-300"
      />
    </div>
  ),
};

// Restaurant partner avatars
export const RestaurantPartners: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Avatar
          src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=300&h=300&fit=crop"
          alt="Restaurant Milano"
          variant="rounded"
          size="lg"
        />
        <div>
          <p className="font-semibold">Restaurant Milano</p>
          <p className="text-sm text-gray-600">Fine Dining • 20% off</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Avatar
          src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=300&h=300&fit=crop"
          alt="The Burger House"
          variant="rounded"
          size="lg"
        />
        <div>
          <p className="font-semibold">The Burger House</p>
          <p className="text-sm text-gray-600">Fast Food • 15% off</p>
        </div>
      </div>
    </div>
  ),
};

// Hotel partner avatars
export const HotelPartners: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center">
        <Avatar
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=300&fit=crop"
          alt="Grand Hotel Sofia"
          variant="sq
}