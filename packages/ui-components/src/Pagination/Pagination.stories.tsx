import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from './Pagination';
import { I18nProvider } from '../I18nContext';
import { translations } from '../translations';

const meta: Meta<typeof Pagination> = {
  title: 'Components/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible pagination component with multiple display modes and full i18n support.',
      },
    },
  },
  decorators: [
    (Story, context) => (
      <I18nProvider locale={context.globals.locale} translations={translations}>
        <div style={{ padding: '2rem' }}>
          <Story />
        </div>
      </I18nProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    currentPage: {
      control: { type: 'number', min: 1 },
      description: 'Current active page number',
    },
    totalPages: {
      control: { type: 'number', min: 1 },
      description: 'Total number of pages',
    },
    onPageChange: {
      action: 'page-changed',
      description: 'Callback function called when page changes',
    },
    maxVisiblePages: {
      control: { type: 'number', min: 3, max: 10 },
      description: 'Maximum number of page buttons to display',
      defaultValue: 7,
    },
    showFirstLast: {
      control: 'boolean',
      description: 'Show first and last page buttons',
      defaultValue: true,
    },
    showPrevNext: {
      control: 'boolean',
      description: 'Show previous and next buttons',
      defaultValue: true,
    },
    showPageInfo: {
      control: 'boolean',
      description: 'Show page information text',
      defaultValue: false,
    },
    variant: {
      control: 'select',
      options: ['default', 'compact', 'minimal'],
      description: 'Visual variant of the pagination',
      defaultValue: 'default',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the pagination component',
      defaultValue: 'md',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable all pagination controls',
      defaultValue: false,
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    ariaLabel: {
      control: 'text',
      description: 'ARIA label for accessibility',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default pagination
export const Default: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    maxVisiblePages: 7,
    showFirstLast: true,
    showPrevNext: true,
  },
};

// First page scenario
export const FirstPage: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    maxVisiblePages: 7,
  },
};

// Last page scenario
export const LastPage: Story = {
  args: {
    currentPage: 10,
    totalPages: 10,
    maxVisiblePages: 7,
  },
};

// Many pages scenario
export const ManyPages: Story = {
  args: {
    currentPage: 50,
    totalPages: 100,
    maxVisiblePages: 7,
  },
};

// Few pages scenario
export const FewPages: Story = {
  args: {
    currentPage: 2,
    totalPages: 3,
    maxVisiblePages: 7,
  },
};

// Single page scenario
export const SinglePage: Story = {
  args: {
    currentPage: 1,
    totalPages: 1,
    maxVisiblePages: 7,
  },
};

// Compact variant
export const Compact: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    variant: 'compact',
    maxVisiblePages: 5,
  },
};

// Minimal variant
export const Minimal: Story = {
  args: {
    currentPage: 3,
    totalPages: 10,
    variant: 'minimal',
    showFirstLast: false,
    maxVisiblePages: 3,
  },
};

// With page info
export const WithPageInfo: Story = {
  args: {
    currentPage: 5,
    totalPages: 20,
    showPageInfo: true,
    maxVisiblePages: 7,
  },
};

// Small size
export const SmallSize: Story = {
  args: {
    currentPage: 3,
    totalPages: 10,
    size: 'sm',
    maxVisiblePages: 7,
  },
};

// Large size
export const LargeSize: Story = {
  args: {
    currentPage: 7,
    totalPages: 15,
    size: 'lg',
    maxVisiblePages: 7,
  },
};

// Without first/last buttons
export const WithoutFirstLast: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    showFirstLast: false,
    maxVisiblePages: 7,
  },
};

// Without prev/next buttons
export const WithoutPrevNext: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    showPrevNext: false,
    maxVisiblePages: 7,
  },
};

// Only page numbers
export const OnlyPageNumbers: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    showFirstLast: false,
    showPrevNext: false,
    maxVisiblePages: 7,
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    disabled: true,
    maxVisiblePages: 7,
  },
};

// Mobile view (fewer visible pages)
export const MobileView: Story = {
  args: {
    currentPage: 5,
    totalPages: 20,
    maxVisiblePages: 3,
    variant: 'compact',
    size: 'sm',
  },
};

// Restaurant listing pagination
export const RestaurantListing: Story = {
  args: {
    currentPage: 2,
    totalPages: 15,
    showPageInfo: true,
    maxVisiblePages: 7,
  },
  parameters: {
    docs: {
      description: {
        story: 'Pagination for restaurant listings with page info showing results count',
      },
    },
  },
};

// Partner dashboard pagination
export const PartnerDashboard: Story = {
  args: {
    currentPage: 1,
    totalPages: 5,
    variant: 'default',
    size: 'md',
    showPageInfo: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Pagination used in partner dashboard for transaction history',
      },
    },
  },
};

// Admin panel pagination
export const AdminPanel: Story = {
  args: {
    currentPage: 10,
    totalPages: 50,
    maxVisiblePages: 9,
    showPageInfo: true,
    size: 'sm',
  },
  parameters: {
    docs: {
      description: {
        story: 'Pagination for admin panel with many pages of data',
      },
    },
  },
};

// Search results pagination
export const SearchResults: Story = {
  args: {
    currentPage: 3,
    totalPages: 8,
    variant: 'default',
    showPageInfo: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Pagination for search results with moderate number of pages',
      },
    },
  },
};

// Interactive example with state
export const Interactive: Story = {
  render: (args) => {
    const [currentPage, setCurrentPage] = React.useState(args.currentPage);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
        <div style={{ 
          padding: '1rem', 
          background: '#f5f5f5', 
          borderRadius: '8px',
          minWidth: '200px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Current Page: {currentPage}</p>
        </div>
        <Pagination
          {...args}
          currentPage={currentPage}
          onPageChange={(page) => {
            setCurrentPage(page);
            args.onPageChange?.(page);
          }}
        />
      </div>
    );
  },
  args: {
    currentPage: 1,
    totalPages: 20,
    maxVisiblePages: 7,
    showPageInfo: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive pagination example with state management',
      },
    },
  },
};

// RTL support example
export const RTLSupport: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    maxVisiblePages: 7,
  },
  decorators: [
    (Story) => (
      <div dir="rtl" style={{ width: '100%' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Pagination with RTL (Right-to-Left) support for Arabic/Hebrew languages',
      },
    },
  },
};

// Custom styling example
export const CustomStyling: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    className: 'custom-pagination',
    maxVisiblePages: 7,
  },
  decorators: [
    (Story) => (
      <>
        <style>{`
          .custom-pagination {
            --pagination-primary: #ff6b35;
            --pagination-hover: #ff8555;
            --pagination-active: #e55325;
            --pagination-border-radius: 12px;
          }
          .custom-pagination button {
            font-family: 'Arial', sans-serif;
            font-weight: 600;
          }
        `}</style>
        <Story />
      </>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Example of custom styled pagination using CSS variables',
      },
    },
  },
};

// Loading state simulation
export const LoadingState: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    disabled: true,
    maxVisiblePages: 7,
  },
  decorators: [
    (Story) => (
      <div style={{ opacity: 0.6, pointerEvents: 'none' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Pagination in loading state (disabled with reduced opacity)',
      },
    },
  },
};

// Responsive example
export const Responsive: Story = {
  render: (args) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Desktop View</h3>
          <Pagination {...args} maxVisiblePages={7} />
        </div>
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Tablet View</h3>
          <Pagination {...args} maxVisiblePages={5} size="md" />
        </div>
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Mobile View</h3>
          <Pagination {...args} maxVisiblePages={3} size="sm" variant="compact" />
        </div>
      </div>
    );
  },
  args: {
    currentPage: 5,
    totalPages: 20,
  },
  parameters: {
    docs: {
      description: {
        story: 'Responsive pagination examples for different screen sizes',
      },
    },
  },
};

import React from 'react';
