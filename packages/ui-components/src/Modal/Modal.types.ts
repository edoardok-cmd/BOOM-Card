import { ReactNode, MouseEvent, KeyboardEvent } from 'react';

export interface ModalProps {
  /**
   * Controls the visibility of the modal
   */
  isOpen: boolean;

  /**
   * Callback function called when the modal should be closed
   */
  onClose: () => void;

  /**
   * Modal title displayed in the header
   */
  title?: string;

  /**
   * Modal content
   */
  children: ReactNode;

  /**
   * Size variant of the modal
   * @default 'medium'
   */
  size?: ModalSize;

  /**
   * Whether the modal can be closed by clicking the overlay
   * @default true
   */
  closeOnOverlayClick?: boolean;

  /**
   * Whether the modal can be closed by pressing Escape key
   * @default true
   */
  closeOnEscape?: boolean;

  /**
   * Whether to show the close button in the header
   * @default true
   */
  showCloseButton?: boolean;

  /**
   * Custom footer content
   */
  footer?: ReactNode;

  /**
   * Additional CSS class names for the modal container
   */
  className?: string;

  /**
   * Additional CSS class names for the modal overlay
   */
  overlayClassName?: string;

  /**
   * Additional CSS class names for the modal content
   */
  contentClassName?: string;

  /**
   * Z-index for the modal
   * @default 1000
   */
  zIndex?: number;

  /**
   * Animation type for modal entrance/exit
   * @default 'fade'
   */
  animation?: ModalAnimation;

  /**
   * Callback fired after the modal has opened
   */
  onAfterOpen?: () => void;

  /**
   * Callback fired before the modal closes
   */
  onBeforeClose?: () => void;

  /**
   * Whether to lock body scroll when modal is open
   * @default true
   */
  lockBodyScroll?: boolean;

  /**
   * Whether to trap focus within the modal
   * @default true
   */
  trapFocus?: boolean;

  /**
   * Initial focus element selector
   */
  initialFocus?: string;

  /**
   * Whether the modal is fullscreen on mobile
   * @default false
   */
  fullscreenOnMobile?: boolean;

  /**
   * Custom aria-label for accessibility
   */
  ariaLabel?: string;

  /**
   * Custom aria-describedby for accessibility
   */
  ariaDescribedBy?: string;

  /**
   * Role attribute for the modal
   * @default 'dialog'
   */
  role?: 'dialog' | 'alertdialog';

  /**
   * Whether to render the modal in a portal
   * @default true
   */
  usePortal?: boolean;

  /**
   * Portal container element or selector
   * @default document.body
   */
  portalTarget?: HTMLElement | string;

  /**
   * Custom close button component
   */
  customCloseButton?: ReactNode;

  /**
   * Whether to show a loading state
   */
  isLoading?: boolean;

  /**
   * Loading component to display
   */
  loadingComponent?: ReactNode;

  /**
   * Test ID for testing purposes
   */
  testId?: string;
}

export type ModalSize = 'small' | 'medium' | 'large' | 'xlarge' | 'fullscreen';

export type ModalAnimation = 'fade' | 'slide' | 'zoom' | 'none';

export interface ModalHeaderProps {
  /**
   * Modal title
   */
  title?: string;

  /**
   * Whether to show the close button
   */
  showCloseButton?: boolean;

  /**
   * Close button click handler
   */
  onClose: () => void;

  /**
   * Custom close button component
   */
  customCloseButton?: ReactNode;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Test ID for testing purposes
   */
  testId?: string;
}

export interface ModalBodyProps {
  /**
   * Body content
   */
  children: ReactNode;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Whether content is loading
   */
  isLoading?: boolean;

  /**
   * Loading component
   */
  loadingComponent?: ReactNode;

  /**
   * Test ID for testing purposes
   */
  testId?: string;
}

export interface ModalFooterProps {
  /**
   * Footer content
   */
  children: ReactNode;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Alignment of footer content
   * @default 'right'
   */
  align?: 'left' | 'center' | 'right' | 'space-between';

  /**
   * Test ID for testing purposes
   */
  testId?: string;
}

export interface ModalOverlayProps {
  /**
   * Click handler for overlay
   */
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Z-index for the overlay
   */
  zIndex?: number;

  /**
   * Animation type
   */
  animation?: ModalAnimation;

  /**
   * Whether the modal is open
   */
  isOpen: boolean;

  /**
   * Test ID for testing purposes
   */
  testId?: string;
}

export interface UseModalReturn {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;

  /**
   * Function to open the modal
   */
  open: () => void;

  /**
   * Function to close the modal
   */
  close: () => void;

  /**
   * Function to toggle the modal
   */
  toggle: () => void;
}

export interface ModalContextValue {
  /**
   * Function to open a modal by ID
   */
  openModal: (modalId: string, props?: Partial<ModalProps>) => void;

  /**
   * Function to close a modal by ID
   */
  closeModal: (modalId: string) => void;

  /**
   * Function to close all modals
   */
  closeAllModals: () => void;

  /**
   * Get the state of a specific modal
   */
  getModalState: (modalId: string) => ModalState | undefined;

  /**
   * Check if a modal is open
   */
  isModalOpen: (modalId: string) => boolean;

  /**
   * Update modal props
   */
  updateModal: (modalId: string, props: Partial<ModalProps>) => void;
}

export interface ModalState {
  /**
   * Unique identifier for the modal
   */
  id: string;

  /**
   * Whether the modal is open
   */
  isOpen: boolean;

  /**
   * Modal props
   */
  props?: Partial<ModalProps>;

  /**
   * Order in the stack (for multiple modals)
   */
  stackOrder?: number;
}

export interface ModalActionButtonProps {
  /**
   * Button text
   */
  text: string;

  /**
   * Click handler
   */
  onClick: () => void;

  /**
   * Button variant
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';

  /**
   * Whether the button is disabled
   */
  disabled?: boolean;

  /**
   * Whether to show a loading state
   */
  loading?: boolean;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Test ID for testing purposes
   */
  testId?: string;
}

export interface ConfirmModalProps extends Omit<ModalProps, 'children' | 'footer'> {
  /**
   * Confirmation message
   */
  message: string | ReactNode;

  /**
   * Confirm button text
   * @default 'Confirm'
   */
  confirmText?: string;

  /**
   * Cancel button text
   * @default 'Cancel'
   */
  cancelText?: string;

  /**
   * Callback when confirmed
   */
  onConfirm: () => void | Promise<void>;

  /**
   * Callback when cancelled
   */
  onCancel?: () => void;

  /**
   * Variant of the confirm button
   * @default 'primary'
   */
  confirmVariant?: 'primary' | 'danger';

  /**
   * Whether to show a loading state on confirm
   */
  confirmLoading?: boolean;

  /**
   * Icon to display
   */
  icon?: ReactNode;

  /**
   * Type of confirmation modal
   * @default 'info'
   */
  type?: 'info' | 'warning' | 'error' | 'success';
}
