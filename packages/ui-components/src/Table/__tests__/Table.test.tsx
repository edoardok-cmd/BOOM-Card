import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Table } from '../Table';
import { TableColumn, TableProps } from '../types';
import '@testing-library/jest-dom';

// Mock data for testing
const mockData = [
  {
    id: 1,
    name: 'Restaurant Sofia',
    category: 'Fine Dining',
    discount: 20,
    location: 'Sofia Center',
    rating: 4.5,
    active: true,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    name: 'Spa Paradise',
    category: 'Wellness',
    discount: 15,
    location: 'Boyana',
    rating: 4.8,
    active: true,
    createdAt: '2024-01-14T09:00:00Z',
  },
  {
    id: 3,
    name: 'Hotel Grand',
    category: 'Accommodation',
    discount: 25,
    location: 'Sofia',
    rating: 4.2,
    active: false,
    createdAt: '2024-01-13T08:00:00Z',
  },
];

const mockColumns: TableColumn<typeof mockData[0]>[] = [
  {
    id: 'name',
    header: 'Partner Name',
    accessor: 'name',
    sortable: true,
  },
  {
    id: 'category',
    header: 'Category',
    accessor: 'category',
    sortable: true,
    filterable: true,
  },
  {
    id: 'discount',
    header: 'Discount %',
    accessor: 'discount',
    sortable: true,
    render: (value) => `${value}%`,
  },
  {
    id: 'location',
    header: 'Location',
    accessor: 'location',
    filterable: true,
  },
  {
    id: 'rating',
    header: 'Rating',
    accessor: 'rating',
    sortable: true,
    render: (value) => `⭐ ${value}`,
  },
  {
    id: 'active',
    header: 'Status',
    accessor: 'active',
    render: (value) => (
      <span className={value ? 'status-active' : 'status-inactive'}>
        {value ? 'Active' : 'Inactive'}
      </span>
    ),
  },
];

describe('Table Component', () => {
  const defaultProps: TableProps<typeof mockData[0]> = {
    data: mockData,
    columns: mockColumns,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render table with headers', () => {
      render(<Table {...defaultProps} />);
      
      mockColumns.forEach(column => {
        expect(screen.getByText(column.header)).toBeInTheDocument();
      });
    });

    it('should render all data rows', () => {
      render(<Table {...defaultProps} />);
      
      mockData.forEach(row => {
        expect(screen.getByText(row.name)).toBeInTheDocument();
      });
    });

    it('should render custom cell content', () => {
      render(<Table {...defaultProps} />);
      
      expect(screen.getByText('20%')).toBeInTheDocument();
      expect(screen.getByText('⭐ 4.5')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('should render loading state', () => {
      render(<Table {...defaultProps} loading />);
      
      expect(screen.getByTestId('table-loading')).toBeInTheDocument();
      expect(screen.queryByText(mockData[0].name)).not.toBeInTheDocument();
    });

    it('should render empty state', () => {
      const emptyMessage = 'No partners found';
      render(<Table {...defaultProps} data={[]} emptyMessage={emptyMessage} />);
      
      expect(screen.getByText(emptyMessage)).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = render(<Table {...defaultProps} className="custom-table" />);
      
      expect(container.querySelector('.custom-table')).toBeInTheDocument();
    });

    it('should render with striped rows when enabled', () => {
      const { container } = render(<Table {...defaultProps} striped />);
      
      expect(container.querySelector('.table-striped')).toBeInTheDocument();
    });

    it('should render with hover effect when enabled', () => {
      const { container } = render(<Table {...defaultProps} hoverable />);
      
      expect(container.querySelector('.table-hoverable')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should sort data by column when header clicked', async () => {
      const onSort = jest.fn();
      render(<Table {...defaultProps} onSort={onSort} />);
      
      const nameHeader = screen.getByText('Partner Name');
      fireEvent.click(nameHeader);
      
      expect(onSort).toHaveBeenCalledWith('name', 'asc');
    });

    it('should toggle sort direction on subsequent clicks', async () => {
      render(<Table {...defaultProps} onSort={onSort} sortBy="name" sortDirection="asc" />);
      
      fireEvent.click(nameHeader);
      
      expect(onSort).toHaveBeenCalledWith('name', 'desc');
    });

    it('should display sort indicators', () => {
      render(<Table {...defaultProps} sortBy="name" sortDirection="asc" />);
      
      expect(nameHeader).toHaveClass('sort-asc');
    });

    it('should not sort non-sortable columns', () => {
      render(<Table {...defaultProps} onSort={onSort} />);
      
      const locationHeader = screen.getByText('Location');
      fireEvent.click(locationHeader);
      
      expect(onSort).not.toHaveBeenCalled();
    });
  });

  describe('Selection', () => {
    it('should render checkboxes when selectable', () => {
      render(<Table {...defaultProps} selectable />);
      
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(mockData.length + 1); // +1 for header checkbox
    });

    it('should select individual rows', async () => {
      const onSelectionChange = jest.fn();
      render(<Table {...defaultProps} selectable onSelectionChange={onSelectionChange} />);
      
      const firstRowCheckbox = screen.getAllByRole('checkbox')[1];
      await userEvent.click(firstRowCheckbox);
      
      expect(onSelectionChange).toHaveBeenCalledWith([mockData[0].id]);
    });

    it('should select all rows with header checkbox', async () => {
      render(<Table {...defaultProps} selectable onSelectionChange={onSelectionChange} />);
      
      const headerCheckbox = screen.getAllByRole('checkbox')[0];
      await userEvent.click(headerCheckbox);
      
      expect(onSelectionChange).toHaveBeenCalledWith(mockData.map(d => d.id));
    });

    it('should handle controlled selection', () => {
      const selectedIds = [1, 3];
      const { rerender } = render(
        <Table {...defaultProps} selectable selectedRows={selectedIds} />
      );
      
      expect(checkboxes[1]).toBeChecked();
      expect(checkboxes[2]).not.toBeChecked();
      expect(checkboxes[3]).toBeChecked();
      
      // Update selection
      rerender(<Table {...defaultProps} selectable selectedRows={[2]} />);
      
      expect(checkboxes[1]).not.toBeChecked();
      expect(checkboxes[2]).toBeChecked();
      expect(checkboxes[3]).not.toBeChecked();
    });
  });

  describe('Pagination', () => {
    const paginationProps = {
      ...defaultProps,
      paginated: true,
      pageSize: 2,
      currentPage: 1,
      totalItems: mockData.length,
    };

    it('should render pagination controls', () => {
      render(<Table {...paginationProps} />);
      
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should handle page change', async () => {
      const onPageChange = jest.fn();
      render(<Table {...paginationProps} onPageChange={onPageChange} />);
      
      const page2Button = screen.getByText('2');
      await userEvent.click(page2Button);
      
      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('should disable previous button on first page', () => {
      render(<Table {...paginationProps} />);
      
      const prevButton = screen.getByLabelText('Previous page');
      expect(prevButton).toBeDisabled();
    });

    it('should disable next button on last page', () => {
      render(<Table {...paginationProps} currentPage={2} />);
      
      const nextButton = screen.getByLabelText('Next page');
      expect(nextButton).toBeDisabled();
    });

    it('should handle page size change', async () => {
      const onPageSizeChange = jest.fn();
      render(<Table {...paginationProps} onPageSizeChange={onPageSizeChange} />);
      
      const pageSizeSelect = screen.getByLabelText('Items per page');
      fireEvent.change(pageSizeSelect, { target: { value: '10' } });
      
      expect(onPageSizeChange).toHaveBeenCalledWith(10);
    });
  });

  describe('Filtering', () => {
    it('should render filter inputs for filterable columns', () => {
      render(<Table {...defaultProps} filterable />);
      
      expect(screen.getByPlaceholderText('Filter by Category')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Filter by Location')).toBeInTheDocument();
    });

    it('should handle filter change', async () => {
      const onFilterChange = jest.fn();
      render(<Table {...defaultProps} filterable onFilterChange={onFilterChange} />);
      
      const categoryFilter = screen.getByPlaceholderText('Filter by Category');
      await userEvent.type(categoryFilter, 'Wellness');
      
      await waitFor(() => {
        expect(onFilterChange).toHaveBeenCalledWith({
          category: 'Wellness',
        });
      });
    });

    it('should debounce filter input', async () => {
      render(<Table {...defaultProps} filterable onFilterChange={onFilterChange} />);
      
      await userEvent.type(categoryFilter, 'Well');
      
      expect(onFilterChange).no
}}}