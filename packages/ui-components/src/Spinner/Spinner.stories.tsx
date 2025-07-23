import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './Spinner';

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A customizable loading spinner component used throughout the BOOM Card platform to indicate loading states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size of the spinner',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'error', 'warning', 'info', 'white', 'current'],
      description: 'Color variant of the spinner',
      table: {
        defaultValue: { summary: 'primary' },
      },
    },
    speed: {
      control: 'select',
      options: ['slow', 'normal', 'fast'],
      description: 'Animation speed of the spinner',
      table: {
        defaultValue: { summary: 'normal' },
      },
    },
    thickness: {
      control: 'select',
      options: ['thin', 'normal', 'thick'],
      description: 'Thickness of the spinner stroke',
      table: {
        defaultValue: { summary: 'normal' },
      },
    },
    label: {
      control: 'text',
      description: 'Accessible label for screen readers',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    fullscreen: {
      control: 'boolean',
      description: 'Display spinner in fullscreen overlay',
      table: {
        defaultValue: { summary: false },
      },
    },
    overlay: {
      control: 'boolean',
      description: 'Display spinner with semi-transparent overlay',
      table: {
        defaultValue: { summary: false },
      },
    },
    text: {
      control: 'text',
      description: 'Loading text to display below spinner',
    },
    textPosition: {
      control: 'select',
      options: ['bottom', 'right'],
      description: 'Position of loading text relative to spinner',
      table: {
        defaultValue: { summary: 'bottom' },
      },
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default spinner
export const Default: Story = {
  args: {
    size: 'md',
    color: 'primary',
    speed: 'normal',
    thickness: 'normal',
  },
};

// Size variations
export const ExtraSmall: Story = {
  args: {
    size: 'xs',
    color: 'primary',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    color: 'primary',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    color: 'primary',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    color: 'primary',
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
    color: 'primary',
  },
};

// Color variations
export const Primary: Story = {
  args: {
    size: 'md',
    color: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    size: 'md',
    color: 'secondary',
  },
};

export const Success: Story = {
  args: {
    size: 'md',
    color: 'success',
  },
};

export const Error: Story = {
  args: {
    size: 'md',
    color: 'error',
  },
};

export const Warning: Story = {
  args: {
    size: 'md',
    color: 'warning',
  },
};

export const Info: Story = {
  args: {
    size: 'md',
    color: 'info',
  },
};

export const White: Story = {
  args: {
    size: 'md',
    color: 'white',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

// Speed variations
export const SlowSpeed: Story = {
  args: {
    size: 'md',
    color: 'primary',
    speed: 'slow',
  },
};

export const NormalSpeed: Story = {
  args: {
    size: 'md',
    color: 'primary',
    speed: 'normal',
  },
};

export const FastSpeed: Story = {
  args: {
    size: 'md',
    color: 'primary',
    speed: 'fast',
  },
};

// Thickness variations
export const ThinStroke: Story = {
  args: {
    size: 'lg',
    color: 'primary',
    thickness: 'thin',
  },
};

export const NormalStroke: Story = {
  args: {
    size: 'lg',
    color: 'primary',
    thickness: 'normal',
  },
};

export const ThickStroke: Story = {
  args: {
    size: 'lg',
    color: 'primary',
    thickness: 'thick',
  },
};

// With loading text
export const WithText: Story = {
  args: {
    size: 'md',
    color: 'primary',
    text: 'Loading...',
  },
};

export const WithTextRight: Story = {
  args: {
    size: 'md',
    color: 'primary',
    text: 'Processing payment...',
    textPosition: 'right',
  },
};

export const WithLongText: Story = {
  args: {
    size: 'lg',
    color: 'primary',
    text: 'Finding the best deals near you...',
  },
};

// Overlay variations
export const WithOverlay: Story = {
  args: {
    size: 'lg',
    color: 'primary',
    overlay: true,
    text: 'Loading partners...',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px', height: '300px', position: 'relative', border: '1px solid #ddd' }}>
        <div style={{ padding: '20px' }}>
          <h3>Partner List</h3>
          <p>This content is behind the overlay</p>
          <button>Cannot click me</button>
        </div>
        <Story />
      </div>
    ),
  ],
};

export const FullscreenSpinner: Story = {
  args: {
    size: 'xl',
    color: 'primary',
    fullscreen: true,
    text: 'Loading BOOM Card platform...',
  },
};

// Custom styled spinner
export const CustomStyled: Story = {
  args: {
    size: 'lg',
    color: 'primary',
    className: 'custom-spinner-story',
  },
  decorators: [
    (Story) => (
      <>
        <style>{`
          .custom-spinner-story {
            filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.5));
          }
        `}</style>
        <Story />
      </>
    ),
  ],
};

// Accessibility example
export const WithAriaLabel: Story = {
  args: {
    size: 'md',
    color: 'primary',
    label: 'Loading restaurant partners',
  },
};

// Real-world usage examples
export const ButtonLoading: Story = {
  args: {
    size: 'sm',
    color: 'white',
  },
  decorators: [
    (Story) => (
      <button 
        style={{ 
          backgroundColor: '#3B82F6', 
          color: 'white', 
          padding: '8px 16px', 
          borderRadius: '6px',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'not-allowed',
          opacity: 0.8,
        }}
        disabled
      >
        <Story />
        <span>Saving...</span>
      </button>
    ),
  ],
};

export const CardLoading: Story = {
  args: {
    size: 'lg',
    color: 'primary',
    overlay: true,
  },
  decorators: [
    (Story) => (
      <div style={{ 
        width: '300px', 
        height: '200px', 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Story />
      </div>
    ),
  ],
};

export const InlineLoading: Story = {
  args: {
    size: 'xs',
    color: 'secondary',
  },
  decorators: [
    (Story) => (
      <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Story />
        <span>Checking discount availability...</span>
      </p>
    ),
  ],
};

// All variations showcase
export const AllVariations: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '40px', padding: '20px' }}>
      <div style={{ textAlign: 'center' }}>
        <Spinner size="xs" color="primary" />
        <p style={{ marginTop: '10px', fontSize: '12px' }}>Extra Small</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Spinner size="sm" color="secondary" />
        <p style={{ marginTop: '10px', fontSize: '12px' }}>Small Secondary</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Spinner size="md" color="success" />
        <p style={{ marginTop: '10px', fontSize: '12px' }}>Medium Success</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Spinner size="lg" color="error" />
        <p style={{ marginTop: '10px', fontSize: '12px' }}>Large Error</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Spinner size="xl" color="warning" />
        <p style={{ marginTop: '10px', fontSize: '12px' }}>Extra Large Warning</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Spinner size="md" color="info" thickness="thin" />
        <p style={{ marginTop: '10px', fontSize: '12px' }}>Thin Info</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Spinner size="md" color="primary" thickness="thick" />
        <p style={{ marginTop: '10px', fontSize: '12px' }}>Thick Primary</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Spinner size="md" color="primary" speed="slow" />
        <p style={{ marginTop: '10px', fontSize: '12px' }}>Slow Speed</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Spinner size="md" color="primary" speed="fast" />
        <p style={{ marginTop: '10px', fontSize: '12px' }}>Fast Speed</p>
      </div>
    </div>
  ),
};
