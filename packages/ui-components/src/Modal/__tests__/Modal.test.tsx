import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Modal } from '../Modal';
import { ModalProvider } from '../ModalContext';
import { useModal } from '../useModal';

expect.extend(toHaveNoViolations);

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  ...jest.requireActual('framer-motion'),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Helper component for testing modal with context
const TestModalWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ModalProvider>{children}</ModalProvider>;
};

// Test component that uses useModal hook
const TestModalComponent: React.FC<{
  modalId: string;
  children: React.ReactNode;
}> = ({ modalId, children }) => {
  const { openModal, closeModal } = useModal();

  return (
    <>
      <button onClick={() => openModal(modalId)}>Open Modal</button>
      <button onClick={() => closeModal(modalId)}>Close Modal</button>
      {children}
    </>
  );
};

describe('Modal', () => {
  const defaultProps = {
    id: 'test-modal',
    title: 'Test Modal',
    children: <div>Modal Content</div>,
  };

  beforeEach(() => {
    // Clear body styles that might be set by modal
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(
        <TestModalWrapper>
          <Modal {...defaultProps} isOpen />
        </TestModalWrapper>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(
        <TestModalWrapper>
          <Modal {...defaultProps} isOpen={false} />
        </TestModalWrapper>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <TestModalWrapper>
          <Modal {...defaultProps} isOpen className="custom-modal" />
        </TestModalWrapper>
      );

      const modalContent = screen.getByRole('dialog').firstChild;
      expect(modalContent).toHaveClass('custom-modal');
    });

    it('should render footer when provided', () => {
      const footer = <div>Custom Footer</div>;
      render(
        <TestModalWrapper>
          <Modal {...defaultProps} isOpen footer={footer} />
        </TestModalWrapper>
      );

      expect(screen.getByText('Custom Footer')).toBeInTheDocument();
    });

    it('should not render header when showHeader is false', () => {
      render(
        <TestModalWrapper>
          <Modal {...defaultProps} isOpen showHeader={false} />
        </TestModalWrapper>
      );

      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    it('should not render close button when showCloseButton is false', () => {
      render(
        <TestModalWrapper>
          <Modal {...defaultProps} isOpen showCloseButton={false} />
        </TestModalWrapper>
      );

      expect(screen.queryByLabelText(/close/i)).not.toBeInTheDocument();
    });
  });

  describe('Size variants', () => {
    const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const;

    sizes.forEach((size) => {
      it(`should render with ${size} size`, () => {
        render(
          <TestModalWrapper>
            <Modal {...defaultProps} isOpen size={size} />
          </TestModalWrapper>
        );

        expect(modalContent).toHaveClass(`modal-${size}`);
      });
    });
  });

  describe('Interactions', () => {
    it('should call onClose when close button is clicked', async () => {
      const onClose = jest.fn();
      const user = userEvent.setup();

      render(
        <TestModalWrapper>
          <Modal {...defaultProps} isOpen onClose={onClose} />
        </TestModalWrapper>
      );

      const closeButton = screen.getByLabelText(/close/i);
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking overlay if closeOnOverlayClick is true', async () => {

      render(
        <TestModalWrapper>
          <Modal {...defaultProps} isOpen onClose={onClose} closeOnOverlayClick />
        </TestModalWrapper>
      );

      const overlay = screen.getByRole('dialog').parentElement;
      await user.click(overlay!);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when clicking overlay if closeOnOverlayClick is false', async () => {

      render(
        <TestModalWrapper>
          <Modal {...defaultProps} isOpen onClose={onClose} closeOnOverlayClick={false} />
        </TestModalWrapper>
      );

      await user.click(overlay!);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should not call onClose when clicking modal content', async () => {

      render(
        <TestModalWrapper>
          <Modal {...defaultProps} isOpen onClose={onClose} closeOnOverlayClick />
        </TestModalWrapper>
      );

      await user.click(modalContent);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should call onClose when pressing Escape key if closeOnEsc is true', () => {

      render(
        <TestModalWrapper>
          <Modal {...defaultProps} isOpen onClose={onClose} closeOnEsc />
        </TestModalWrapper>
      );

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when pressing Escape key if closeOnEsc is false', () => {

      render(
        <TestModalWrapper>
          <Modal {...defaultProps} isOpen onClose={onClose} closeOnEsc={false} />
        </TestModalWrapper>
      );

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Modal Context Integration', () => {
    it('should open modal using context', async () => {

      render(
        <TestModalWrapper>
          <TestModalComponent modalId="test-modal">
            <Modal {...defaultProps} />
          </TestModalComponent>
        </TestModalWrapper>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      const openButton = screen.getByText('Open Modal');
      await user.click(openButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should close modal using context', async () => {

      render(
        <TestModalWrapper>
          <TestModalComponent modalId="test-modal">
            <Modal {...defaultProps} />
          </TestModalComponent>
        </TestModalWrapper>
      );

      // Open modal first
      await user.click(openButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Close modal
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Body scroll lock', () => {
    it('should prevent body scroll when modal is open and preventScroll is true', () => {
      render(
        <TestModalWrapper>
          <Modal {...defaultProps} isOpen preventScroll />
        </TestModalWrapper>
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should not prevent body scroll when preventScroll is false', () => {
      render(
        <TestModalWrapper>
          <Modal {...defaultProps} isOpen preventScroll={false} />
        </TestModalWrapper>
      );

      expect(document.body.style.overflow).toBe('');
    });

    it('should restore body scroll when modal is closed', () => {
      const { rerender } = render(
        <TestModalWrapper>
          <Modal {...defaultProps} isOpen preventScroll />
        </TestModalWrapper>
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <TestModalWrapper>
          <Modal {...defaultProps} isOpen={false} preventScroll />
        </TestModalWrapper>
      );

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Focus management', () => {
    it('should focus on modal when opened', async () => {
      render(
        <TestModalWrapper>
          <Modal {...defaultProps} isOpen />
        </TestModalWrapper>
      );

      await waitFor(() => {
        const modal = screen.getByRole('dialog');
        expect(modal).toHaveFocus();
      });
    });

    it('should trap focus within modal', async () => {

      render(
        <TestModalWrapper>
          <Modal
            {...defaultProps}
            isOpen
            footer={
              <>
                <button>Cancel</button>
                <button>Confirm</button>
             
}}}}