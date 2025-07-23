import styled, { css } from 'styled-components';
import { InputProps } from './Input.types';

const sizeStyles = {
  small: css`
    padding: 8px 12px;
    font-size: 14px;
    line-height: 20px;
  `,
  medium: css`
    padding: 10px 16px;
    font-size: 16px;
    line-height: 24px;
  `,
  large: css`
    padding: 12px 20px;
    font-size: 18px;
    line-height: 28px;
  `,
};

const variantStyles = {
  default: css`
    background-color: ${({ theme }) => theme.colors.background.primary};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    color: ${({ theme }) => theme.colors.text.primary};

    &:hover:not(:disabled) {
      border-color: ${({ theme }) => theme.colors.border.hover};
    }

    &:focus {
      border-color: ${({ theme }) => theme.colors.primary.main};
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.light}33;
    }
  `,
  filled: css`
    background-color: ${({ theme }) => theme.colors.background.secondary};
    border: 1px solid transparent;
    color: ${({ theme }) => theme.colors.text.primary};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.background.tertiary};
    }

    &:focus {
      background-color: ${({ theme }) => theme.colors.background.primary};
      border-color: ${({ theme }) => theme.colors.primary.main};
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.light}33;
    }
  `,
  outlined: css`
    background-color: transparent;
    border: 2px solid ${({ theme }) => theme.colors.border.default};
    color: ${({ theme }) => theme.colors.text.primary};

    &:hover:not(:disabled) {
      border-color: ${({ theme }) => theme.colors.primary.main};
      background-color: ${({ theme }) => theme.colors.primary.light}0A;
    }

    &:focus {
      border-color: ${({ theme }) => theme.colors.primary.main};
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.light}33;
    }
  `,
};

export const InputWrapper = styled.div<{ fullWidth?: boolean }>`
  position: relative;
  display: ${({ fullWidth }) => (fullWidth ? 'block' : 'inline-block')};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

export const Label = styled.label<{ required?: boolean }>`
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 20px;

  ${({ required }) =>
    required &&
    css`
      &::after {
        content: ' *';
        color: ${({ theme }) => theme.colors.error.main};
      }
    `}
`;

export const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const StyledInput = styled.input<{
  size?: InputProps['size'];
  variant?: InputProps['variant'];
  hasError?: boolean;
  hasIcon?: boolean;
  hasEndAdornment?: boolean;
  isLoading?: boolean;
}>`
  width: 100%;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  transition: all 0.2s ease-in-out;
  outline: none;

  ${({ size }) => sizeStyles[size || 'medium']}
  ${({ variant }) => variantStyles[variant || 'default']}

  ${({ hasIcon }) =>
    hasIcon &&
    css`
      padding-left: 40px;
    `}

  ${({ hasEndAdornment }) =>
    hasEndAdornment &&
    css`
      padding-right: 40px;
    `}

  ${({ hasError, theme }) =>
    hasError &&
    css`
      border-color: ${theme.colors.error.main};
      color: ${theme.colors.error.main};

      &:focus {
        border-color: ${theme.colors.error.main};
        box-shadow: 0 0 0 3px ${theme.colors.error.light}33;
      }
    `}

  ${({ isLoading }) =>
    isLoading &&
    css`
      color: transparent;
      cursor: wait;
    `}

  &:disabled {
    background-color: ${({ theme }) => theme.colors.background.disabled};
    border-color: ${({ theme }) => theme.colors.border.disabled};
    color: ${({ theme }) => theme.colors.text.disabled};
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
    opacity: 0.7;
  }

  /* Remove number input arrows */
  &[type='number'] {
    -moz-appearance: textfield;
  }

  &[type='number']::-webkit-outer-spin-button,
  &[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Autofill styles */
  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-text-fill-color: ${({ theme }) => theme.colors.text.primary};
    -webkit-box-shadow: 0 0 0px 1000px
      ${({ theme }) => theme.colors.background.primary} inset;
    transition: background-color 5000s ease-in-out 0s;
  }
`;

export const IconWrapper = styled.div<{ position?: 'start' | 'end' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: ${({ theme }) => theme.colors.text.secondary};
  pointer-events: none;

  ${({ position }) =>
    position === 'end'
      ? css`
          right: 12px;
        `
      : css`
          left: 12px;
        `}

  svg {
    width: 100%;
    height: 100%;
  }
`;

export const LoadingSpinner = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border: 2px solid ${({ theme }) => theme.colors.primary.light};
  border-top-color: ${({ theme }) => theme.colors.primary.main};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: translate(-50%, -50%) rotate(360deg);
    }
`;

export const HelperText = styled.span<{ error?: boolean }>`
  display: block;
  margin-top: 4px;
  font-size: 12px;
  line-height: 16px;
  color: ${({ error, theme }) =>
    error ? theme.colors.error.main : theme.colors.text.secondary};
`;

export const CharacterCount = styled.span<{ isOverLimit?: boolean }>`
  position: absolute;
  bottom: -20px;
  right: 0;
  font-size: 12px;
  color: ${({ isOverLimit, theme }) =>
    isOverLimit ? theme.colors.error.main : theme.colors.text.secondary};
`;

export const ClearButton = styled.button`
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  background: none;
  border: none;
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.secondary};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.main};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

export const PasswordToggleButton = styled.button`
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: none;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.secondary};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.main};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const PrefixSuffix = styled.span<{ type: 'prefix' | 'suffix' }>`
  display: flex;
  align-items: center;
  padding: 0 12px;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
  white-space: nowrap;

  ${({ type }) =>
    type === 'prefix'
      ? css`
          border-right: none;
          border-radius: ${({ theme }) =>
            `${theme.borderRadius.md} 0 0 ${theme.borderRadius.md}`};
        `
      : css`
          border-left: none;
          border-radius: ${({ theme }) =>
            `0 ${theme.borderRadius.md} ${theme.borderRadius.md} 0`};
        `}
`;

export const InputGroup = styled.div<{ hasPrefix?: boolean; hasSuffix?: boolean }>`
  display: flex;
  width: 100%;

  ${StyledInput} {
    ${({ hasPrefix, theme }) =>
      hasPrefix &&
      css`
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      `}

    ${({ hasSuffix, theme }) =>
      hasSuffix &&
      css`
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      `}
`;

}
}
