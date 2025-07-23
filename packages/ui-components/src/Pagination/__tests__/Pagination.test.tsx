import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { Pagination } from '../Pagination';
import { lightTheme } from '../../../styles/theme';
import '@testing-library/jest-dom';

// Mock i18n
i18n.init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: {
      translation: {
        'pagination.page': 'Page',
        'pagination.of': 'of',
        'pagination.previous': 'Previous',
        'pagination.next': 'Next',
        'pagination.first': 'First',
        'pagination.last': 'Last',
        'pagination.goToPage': 'Go to page',
        'pagination.showingResults': 'Showing {{start}} to {{end}} of {{total}} results',
        'pagination.itemsPerPage': 'Items per page',
        'pagination.jumpToPage': 'Jump to page'
      },
    bg: {
      translation: {
        'pagination.page': 'Страница',
        'pagination.of': 'от',
        'pagination.previous': 'Предишна',
        'pagination.next': 'Следваща',
        'pagination.first': 'Първа',
        'pagination.last': 'Последна',
        'pagination.goToPage': 'Отиди на страница',
        'pagination.showingResults': 'Показване на {{start}} до {{end}} от {{total}} резултата',
        'pagination.itemsPerPage': 'Елементи на страница',
        'pagination.jumpToPage': 'Отиди на страница'
      }
  });

// Helper function to render with providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={lightTheme}>
        {component}
      </ThemeProvider>
    </I18nextProvider>
  );
};

describe('Pagination', () => {
  const mockOnPageChange = jest.fn();
  const mockOnPageSizeChange = jest.fn();

  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    onPageChange: mockOnPageChange,
    totalItems: 100,
    itemsPerPage: 10,
    onPageSizeChange: mockOnPageSizeChange
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render pagination component', () => {
      renderWithProviders(<Pagination {...defaultProps} />);
      
      expect(screen.getByLabelText(/pagination/i)).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should show correct page numbers for first page', () => {
      renderWithProviders(<Pagination {...defaultProps} />);
      
      // Should show pages 1-5 and last page
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should show correct page numbers for middle page', () => {
      renderWithProviders(<Pagination {...defaultProps} currentPage={5} />);
      
      // Should show first page, pages 3-7, and last page
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should show correct page numbers for last page', () => {
      renderWithProviders(<Pagination {...defaultProps} currentPage={10} />);
      
      // Should show first page and pages 6-10
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('9')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should show ellipsis for hidden pages', () => {
      renderWithProviders(<Pagination {...defaultProps} totalPages={20} currentPage={10} />);
      
      const ellipses = screen.getAllByText('...');
      expect(ellipses).toHaveLength(2); // One before and one after current range
    });

    it('should show results information', () => {
      renderWithProviders(<Pagination {...defaultProps} showResultsInfo />);
      
      expect(screen.getByText('Showing 1 to 10 of 100 results')).toBeInTheDocument();
    });

    it('should show page size selector', () => {
      renderWithProviders(<Pagination {...defaultProps} showPageSizeSelector />);
      
      expect(screen.getByLabelText(/items per page/i)).toBeInTheDocument();
    });

    it('should render minimal variant', () => {
      renderWithProviders(<Pagination {...defaultProps} variant="minimal" />);
      
      // Should only show prev/next buttons and current page info
      expect(screen.getByLabelText(/previous/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/next/i)).toBeInTheDocument();
      expect(screen.getByText('Page 1 of 10')).toBeInTheDocument();
      
      // Should not show page numbers
      expect(screen.queryByText('2')).not.toBeInTheDocument();
    });

    it('should render simple variant', () => {
      renderWithProviders(<Pagination {...defaultProps} variant="simple" />);
      
      // Should show limited page numbers
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      renderWithProviders(<Pagination {...defaultProps} className="custom-pagination" />);
      
      const pagination = screen.getByLabelText(/pagination/i);
      expect(pagination).toHaveClass('custom-pagination');
    });
  });

  describe('Navigation', () => {
    it('should navigate to next page', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Pagination {...defaultProps} />);
      
      const nextButton = screen.getByLabelText(/next/i);
      await user.click(nextButton);
      
      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('should navigate to previous page', async () => {
      renderWithProviders(<Pagination {...defaultProps} currentPage={5} />);
      
      const prevButton = screen.getByLabelText(/previous/i);
      await user.click(prevButton);
      
      expect(mockOnPageChange).toHaveBeenCalledWith(4);
    });

    it('should navigate to first page', async () => {
      renderWithProviders(<Pagination {...defaultProps} currentPage={5} showFirstLast />);
      
      const firstButton = screen.getByLabelText(/first/i);
      await user.click(firstButton);
      
      expect(mockOnPageChange).toHaveBeenCalledWith(1);
    });

    it('should navigate to last page', async () => {
      renderWithProviders(<Pagination {...defaultProps} showFirstLast />);
      
      const lastButton = screen.getByLabelText(/last/i);
      await user.click(lastButton);
      
      expect(mockOnPageChange).toHaveBeenCalledWith(10);
    });

    it('should navigate to specific page', async () => {
      renderWithProviders(<Pagination {...defaultProps} />);
      
      const page3 = screen.getByText('3');
      await user.click(page3);
      
      expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });

    it('should disable previous button on first page', () => {
      renderWithProviders(<Pagination {...defaultProps} />);
      
      expect(prevButton).toBeDisabled();
    });

    it('should disable next button on last page', () => {
      renderWithProviders(<Pagination {...defaultProps} currentPage={10} />);
      
      expect(nextButton).toBeDisabled();
    });

    it('should handle keyboard navigation', async () => {
      renderWithProviders(<Pagination {...defaultProps} />);
      
      const page2 = screen.getByText('2');
      page2.focus();
      await user.keyboard('{Enter}');
      
      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('should handle keyboard navigation with arrow keys', async () => {
      renderWithProviders(<Pagination {...defaultProps} currentPage={5} />);
      
      const currentPage = screen.getByText('5');
      currentPage.focus();
      
      await user.keyboard('{ArrowLeft}');
      expect(mockOnPageChange).toHaveBeenCalledWith(4);
      
      await user.keyboard('{ArrowRight}');
      expect(mockOnPageChange).toHaveBeenCalledWith(6);
    });
  });

  describe('Page Jump', () => {
    it('should show page jump input', () => {
      renderWithProviders(<Pagination {...defaultProps} showPageJump />);
      
      expect(screen.getByLabelText(/jump to page/i)).toBeInTheDocument();
    });

    it('should jump to entered page', async () => {
      renderWithProviders(<Pagination {...defaultProps} showPageJump />);
      
      const input = screen.getByLabelText(/jump to page/i);
      await user.clear(input);
      await user.type(input, '7{Enter}');
      
      expect(mockOnPageChange).toHaveBeenCalledWith(7);
    });

    it('should validate page jump input', async () => {
      renderWithProviders(<Pagination {...defaultProps} showPageJump />);
      
}}}
}
}
}
