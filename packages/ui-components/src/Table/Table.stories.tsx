import type { Meta, StoryObj } from '@storybook/react';
import { Table } from './Table';
import { Button } from '../Button/Button';
import { Badge } from '../Badge/Badge';
import { useState } from 'react';

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A flexible and feature-rich table component for displaying tabular data with sorting, filtering, and pagination.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Table>;

// Sample data for stories
const samplePartners = [
  {
    id: '1',
    name: 'La Piazza Restaurant',
    category: 'Fine Dining',
    location: 'Sofia, Bulgaria',
    discount: 20,
    status: 'active',
    joinedDate: '2024-01-15',
    totalTransactions: 156,
    revenue: 3420.50,
  },
  {
    id: '2',
    name: 'Sky Bar Sofia',
    category: 'Bar & Lounge',
    location: 'Sofia, Bulgaria',
    discount: 15,
    status: 'active',
    joinedDate: '2024-02-20',
    totalTransactions: 89,
    revenue: 1890.25,
  },
  {
    id: '3',
    name: 'Wellness Spa Center',
    category: 'Spa & Wellness',
    location: 'Plovdiv, Bulgaria',
    discount: 25,
    status: 'inactive',
    joinedDate: '2023-12-10',
    totalTransactions: 234,
    revenue: 5670.00,
  },
  {
    id: '4',
    name: 'Adventure Park',
    category: 'Entertainment',
    location: 'Varna, Bulgaria',
    discount: 30,
    status: 'active',
    joinedDate: '2024-03-05',
    totalTransactions: 67,
    revenue: 890.75,
  },
  {
    id: '5',
    name: 'Boutique Hotel Central',
    category: 'Accommodation',
    location: 'Sofia, Bulgaria',
    discount: 10,
    status: 'pending',
    joinedDate: '2024-04-01',
    totalTransactions: 0,
    revenue: 0,
  },
];

const columns = [
  {
    id: 'name',
    header: 'Partner Name',
    accessorKey: 'name',
    sortable: true,
    cell: (row: any) => (
      <div className="font-medium text-gray-900">{row.name}</div>
    ),
  },
  {
    id: 'category',
    header: 'Category',
    accessorKey: 'category',
    sortable: true,
    filterable: true,
    filterOptions: ['Fine Dining', 'Bar & Lounge', 'Spa & Wellness', 'Entertainment', 'Accommodation'],
  },
  {
    id: 'location',
    header: 'Location',
    accessorKey: 'location',
    sortable: true,
    filterable: true,
    filterOptions: ['Sofia, Bulgaria', 'Plovdiv, Bulgaria', 'Varna, Bulgaria'],
  },
  {
    id: 'discount',
    header: 'Discount',
    accessorKey: 'discount',
    sortable: true,
    cell: (row: any) => (
      <Badge variant="success" size="sm">
        {row.discount}% OFF
      </Badge>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    sortable: true,
    filterable: true,
    filterOptions: ['active', 'inactive', 'pending'],
    cell: (row: any) => {
      const variants = {
        active: 'success' as const,
        inactive: 'error' as const,
        pending: 'warning' as const,
      };
      return (
        <Badge variant={variants[row.status as keyof typeof variants]} size="sm">
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      );
    },
  },
  {
    id: 'joinedDate',
    header: 'Joined Date',
    accessorKey: 'joinedDate',
    sortable: true,
    cell: (row: any) => new Date(row.joinedDate).toLocaleDateString(),
  },
  {
    id: 'totalTransactions',
    header: 'Transactions',
    accessorKey: 'totalTransactions',
    sortable: true,
    cell: (row: any) => (
      <div className="text-right">{row.totalTransactions.toLocaleString()}</div>
    ),
  },
  {
    id: 'revenue',
    header: 'Revenue',
    accessorKey: 'revenue',
    sortable: true,
    cell: (row: any) => (
      <div className="text-right font-medium">
        €{row.revenue.toFixed(2).toLocaleString()}
      </div>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: (row: any) => (
      <div className="flex gap-2">
        <Button size="sm" variant="ghost">View</Button>
        <Button size="sm" variant="ghost">Edit</Button>
      </div>
    ),
  },
];

export const Default: Story = {
  args: {
    data: samplePartners,
    columns: columns,
    caption: 'Partner Management Table',
  },
};

export const WithPagination: Story = {
  args: {
    data: samplePartners,
    columns: columns,
    pagination: true,
    pageSize: 3,
    caption: 'Partners with Pagination',
  },
};

export const WithSearch: Story = {
  args: {
    data: samplePartners,
    columns: columns,
    searchable: true,
    searchPlaceholder: 'Search partners...',
    caption: 'Searchable Partner Table',
  },
};

export const WithSelectionCheckbox: Story = {
  args: {
    data: samplePartners,
    columns: columns,
    selectable: true,
    onSelectionChange: (selectedRows) => {
      console.log('Selected rows:', selectedRows);
    },
    caption: 'Partner Table with Row Selection',
  },
};

export const WithStickyHeader: Story = {
  args: {
    data: [...samplePartners, ...samplePartners, ...samplePartners],
    columns: columns,
    stickyHeader: true,
    maxHeight: '400px',
    caption: 'Partner Table with Sticky Header',
  },
};

export const WithCustomEmptyState: Story = {
  args: {
    data: [],
    columns: columns,
    emptyStateMessage: 'No partners found',
    emptyStateAction: (
      <Button variant="primary" size="sm">
        Add New Partner
      </Button>
    ),
    caption: 'Empty Partner Table',
  },
};

export const WithLoading: Story = {
  args: {
    data: samplePartners,
    columns: columns,
    loading: true,
    caption: 'Loading Partner Data',
  },
};

export const CompactSize: Story = {
  args: {
    data: samplePartners,
    columns: columns,
    size: 'compact',
    caption: 'Compact Partner Table',
  },
};

export const ComfortableSize: Story = {
  args: {
    data: samplePartners,
    columns: columns,
    size: 'comfortable',
    caption: 'Comfortable Partner Table',
  },
};

export const WithStripedRows: Story = {
  args: {
    data: samplePartners,
    columns: columns,
    striped: true,
    caption: 'Striped Partner Table',
  },
};

export const WithHoverEffect: Story = {
  args: {
    data: samplePartners,
    columns: columns,
    hoverable: true,
    caption: 'Partner Table with Hover Effect',
  },
};

export const ResponsiveTable: Story = {
  args: {
    data: samplePartners,
    columns: columns,
    responsive: true,
    caption: 'Responsive Partner Table',
  },
};

export const WithCustomRowActions: Story = {
  args: {
    data: samplePartners,
    columns: columns.map(col => {)
      if (col.id === 'actions') {
        return {
          ...col,
          cell: (row: any) => (
            <div className="flex gap-1">
              <Button size="xs" variant="ghost" aria-label="View details">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </Button>
              <Button size="xs" variant="ghost" aria-label="Edit">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Button>
              <Button size="xs" variant="ghost" aria-label="Delete">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            </div>
          ),
        };
      }
      return col;
    }),
    caption: 'Partner Table with Icon Actions',
  },
};

export const WithExpandableRows: Story = {
  args: {
    data: samplePartners,
    columns: columns.filter(col => col.id !== 'actions'),
    expandable: true,
    renderExpandedRow: (row: any) => (
      <div className="p-4 bg-gray-50">
        <h4 className="font-semibold mb-2">Additional Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Contact Email:</span>
            <span className="ml-2">contact@{row.name.toLowerCase().replace(/\s+/g, '')}.com</span>
          </div>
          <div>
            <span className="text-gray-600">Phone:</span>
            <span className="ml-2">+359 888 {Math.floor(Math.random() * 900000 + 100000)}</span>
          </div>
          <div>
            <span className="text-gray-600">Contract Type:</span>
            <span className="ml-2">Annual</span>
          </div>
          <div>
            <span className="text-gray-600">Commission Rate:</span>
            <span className="ml-2">5%</span>
          </div>
        </div>
      </div>
    ),
    caption: 'Partner Table with Expandable Rows',
  },
};

export const TransactionHistoryTable: Story = {
  args: {
    data: [
      {
        id: 'TRX001',
        date: '2024-04-15 14:32',
        partner: 'La Piazza Restaurant',
        customer: 'John Doe',
        amount: 85.50,
        discount: 17.10,
        finalAmount: 68.40,
        status: 'completed',
      },
      {
        id: 'TRX002',
        date: '2024-04-15 13:45',
        partner: 'Sky Bar Sofia',
        customer: 'Jane Smith',
        amount: 120.00,
        discount: 18.00,
        finalAmount: 102.00,
        status: 'c
}}}