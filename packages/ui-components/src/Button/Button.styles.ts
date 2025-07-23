import styled, { css } from 'styled-components';
import { ButtonProps } from './Button.types';

const sizeStyles = {
  small: css`
    padding: 8px 16px;
    font-size: 14px;
    line-height: 20px;
    min-height: 32px;
  `,
  medium: css`
    padding: 10px 20px;
    font-size: 16px;
    line-height: 24px;
    min-height: 40px;
  `,
  large: css`
    padding: 12px 24px;
    font-size: 18px;
    line-height: 28px;
    min-height: 48px;
  `,
};

const variantStyles = {
  primary: css`
    background-color: var(--color-primary, #FF6B6B);
    color: var(--color-white, #FFFFFF);
    border: 2px solid var(--color-primary, #FF6B6B);

    &:hover:not(:disabled) {
      background-color: var(--color-primary-dark, #E55555);
      border-color: var(--color-primary-dark, #E55555);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(255, 107, 107, 0.2);
    }

    &:focus-visible {
      outline: 3px solid var(--color-primary-light, #FF8E8E);
      outline-offset: 2px;
    }
  `,
  secondary: css`
    background-color: var(--color-secondary, #4ECDC4);
    color: var(--color-white, #FFFFFF);
    border: 2px solid var(--color-secondary, #4ECDC4);

    &:hover:not(:disabled) {
      background-color: var(--color-secondary-dark, #3DB8AF);
      border-color: var(--color-secondary-dark, #3DB8AF);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(78, 205, 196, 0.2);
    }

    &:focus-visible {
      outline: 3px solid var(--color-secondary-light, #6FD8D0);
      outline-offset: 2px;
    }
  `,
  outline: css`
    background-color: transparent;
    color: var(--color-primary, #FF6B6B);
    border: 2px solid var(--color-primary, #FF6B6B);

    &:hover:not(:disabled) {
      background-color: var(--color-primary, #FF6B6B);
      color: var(--color-white, #FFFFFF);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(255, 107, 107, 0.2);
    }

    &:focus-visible {
      outline: 3px solid var(--color-primary-light, #FF8E8E);
      outline-offset: 2px;
    }
  `,
  ghost: css`
    background-color: transparent;
    color: var(--color-text-primary, #2D3748);
    border: 2px solid transparent;

    &:hover:not(:disabled) {
      background-color: var(--color-gray-100, #F7FAFC);
      border-color: var(--color-gray-300, #E2E8F0);
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      background-color: var(--color-gray-200, #EDF2F7);
      transform: translateY(0);
    }

    &:focus-visible {
      outline: 3px solid var(--color-primary-light, #FF8E8E);
      outline-offset: 2px;
    }
  `,
  danger: css`
    background-color: var(--color-danger, #E53E3E);
    color: var(--color-white, #FFFFFF);
    border: 2px solid var(--color-danger, #E53E3E);

    &:hover:not(:disabled) {
      background-color: var(--color-danger-dark, #C53030);
      border-color: var(--color-danger-dark, #C53030);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(229, 62, 62, 0.2);
    }

    &:focus-visible {
      outline: 3px solid var(--color-danger-light, #FC8181);
      outline-offset: 2px;
    }
  `,
  success: css`
    background-color: var(--color-success, #48BB78);
    color: var(--color-white, #FFFFFF);
    border: 2px solid var(--color-success, #48BB78);

    &:hover:not(:disabled) {
      background-color: var(--color-success-dark, #38A169);
      border-color: var(--color-success-dark, #38A169);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(72, 187, 120, 0.2);
    }

    &:focus-visible {
      outline: 3px solid var(--color-success-light, #68D391);
      outline-offset: 2px;
    }
  `,
};

export const StyledButton = styled.button<ButtonProps>`
  /* Base styles */
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  white-space: nowrap;
  text-decoration: none;
  outline: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  /* Apply size styles */
  ${({ size = 'medium' }) => sizeStyles[size]}

  /* Apply variant styles */
  ${({ variant = 'primary' }) => variantStyles[variant]}

  /* Full width modifier */
  ${({ fullWidth }) =>
    fullWidth &&
    css`
      width: 100%;
      justify-content: center;
    `}

  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  /* Loading state */
  ${({ isLoading }) =>
    isLoading &&
    css`
      color: transparent;
      pointer-events: none;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        top: 50%;
        left: 50%;
        margin-left: -8px;
        margin-top: -8px;
        border: 2px solid currentColor;
        border-radius: 50%;
        border-color: var(--color-white, #FFFFFF) transparent
          var(--color-white, #FFFFFF) transparent;
        animation: button-loading-spinner 1s linear infinite;
      }
    `}

  /* Icon styles */
  svg {
    width: 1em;
    height: 1em;
    flex-shrink: 0;
  }

  /* Ripple effect on click */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  &:active:not(:disabled)::before {
    width: 300px;
    height: 300px;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    ${({ size = 'medium' }) =>
      size === 'large' &&
      css`
        padding: 10px 20px;
        font-size: 16px;
        line-height: 24px;
        min-height: 44px;
      `}

  /* Animation keyframes */
  @keyframes button-loading-spinner {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
`;

export const ButtonIcon = styled.span<{ position?: 'left' | 'right' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  order: ${({ position = 'left' }) => (position === 'left' ? -1 : 1)};
`;

export const ButtonContent = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

}
}
