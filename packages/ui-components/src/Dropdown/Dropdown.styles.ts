import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

export interface DropdownStyleProps {
  isOpen?: boolean;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  fullWidth?: boolean;
  maxHeight?: string;
  minWidth?: string;
  variant?: 'primary' | 'secondary' | 'minimal';
  size?: 'small' | 'medium' | 'large';
  hasError?: boolean;
  isDisabled?: boolean;
}

const positionStyles = {
  'bottom-left': css`
    top: 100%;
    left: 0;
    margin-top: 4px;
  `,
  'bottom-right': css`
    top: 100%;
    right: 0;
    margin-top: 4px;
  `,
  'top-left': css`
    bottom: 100%;
    left: 0;
    margin-bottom: 4px;
  `,
  'top-right': css`
    bottom: 100%;
    right: 0;
    margin-bottom: 4px;
  `,
};

const sizeStyles = {
  small: css`
    padding: 8px 12px;
    font-size: 14px;
    min-height: 32px;
  `,
  medium: css`
    padding: 10px 16px;
    font-size: 16px;
    min-height: 40px;
  `,
  large: css`
    padding: 12px 20px;
    font-size: 18px;
    min-height: 48px;
  `,
};

const variantStyles = {
  primary: css`
    background-color: ${({ theme }) => theme.colors.background.primary};
    border: 1px solid ${({ theme }) => theme.colors.border.primary};
    color: ${({ theme }) => theme.colors.text.primary};

    &:hover:not(:disabled) {
      border-color: ${({ theme }) => theme.colors.primary.main};
    }

    &:focus-within {
      border-color: ${({ theme }) => theme.colors.primary.main};
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.light}33;
    }
  `,
  secondary: css`
    background-color: ${({ theme }) => theme.colors.background.secondary};
    border: 1px solid ${({ theme }) => theme.colors.border.secondary};
    color: ${({ theme }) => theme.colors.text.primary};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.background.hover};
    }

    &:focus-within {
      border-color: ${({ theme }) => theme.colors.secondary.main};
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.secondary.light}33;
    }
  `,
  minimal: css`
    background-color: transparent;
    border: none;
    color: ${({ theme }) => theme.colors.text.primary};
    padding: 8px;

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.background.hover};
    }

    &:focus-within {
      outline: 2px solid ${({ theme }) => theme.colors.primary.main};
      outline-offset: 2px;
    }
  `,
};

export const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
  width: ${({ fullWidth }: DropdownStyleProps) => (fullWidth ? '100%' : 'auto')};
`;

export const DropdownTrigger = styled.button<DropdownStyleProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  min-width: ${({ minWidth }) => minWidth || '200px'};
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;

  ${({ size }) => size && sizeStyles[size]}
  ${({ variant }) => variant && variantStyles[variant]}

  ${({ hasError, theme }) =>
    hasError &&
    css`
      border-color: ${theme.colors.error.main};
      
      &:focus-within {
        border-color: ${theme.colors.error.main};
        box-shadow: 0 0 0 3px ${theme.colors.error.light}33;
      }
    `}

  ${({ isDisabled, theme }) =>
    isDisabled &&
    css`
      cursor: not-allowed;
      opacity: 0.6;
      background-color: ${theme.colors.background.disabled};
      color: ${theme.colors.text.disabled};
      
      &:hover {
        border-color: ${theme.colors.border.primary};
      }
    `}

  &:active:not(:disabled) {
    transform: translateY(1px);
  }
`;

export const DropdownIcon = styled.span<{ isOpen?: boolean }>`
  display: flex;
  align-items: center;
  transition: transform 0.2s ease;
  margin-left: auto;
  flex-shrink: 0;
  
  ${({ isOpen }) =>
    isOpen &&
    css`
      transform: rotate(180deg);
    `}

  svg {
    width: 16px;
    height: 16px;
    color: currentColor;
  }
`;

export const DropdownMenu = styled(motion.div)<DropdownStyleProps>`
  position: absolute;
  z-index: ${({ theme }) => theme.zIndex.dropdown};
  background-color: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.dropdown};
  overflow: hidden;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  min-width: ${({ minWidth }) => minWidth || '200px'};
  max-height: ${({ maxHeight }) => maxHeight || '300px'};
  overflow-y: auto;
  transform-origin: top center;

  ${({ position }) => position && positionStyles[position]}

  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background-color: ${({ theme }) => theme.colors.background.secondary};
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.border.secondary};
    border-radius: 4px;
    
    &:hover {
      background-color: ${({ theme }) => theme.colors.border.primary};
    }
`;

export const DropdownMenuItem = styled.button<{
  isSelected?: boolean;
  isHighlighted?: boolean;
  isDisabled?: boolean;
  hasIcon?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 14px;
  font-weight: 400;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  ${({ hasIcon }) =>
    hasIcon &&
    css`
      padding-left: 12px;
    `}

  ${({ isSelected, theme }) =>
    isSelected &&
    css`
      background-color: ${theme.colors.primary.light}15;
      color: ${theme.colors.primary.main};
      font-weight: 600;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background-color: ${theme.colors.primary.main};
      }
    `}

  ${({ isHighlighted, theme }) =>
    isHighlighted &&
    css`
      background-color: ${theme.colors.background.hover};
    `}

  ${({ isDisabled, theme }) =>
    isDisabled &&
    css`
      cursor: not-allowed;
      opacity: 0.5;
      color: ${theme.colors.text.disabled};
      
      &:hover {
        background-color: transparent;
      }
    `}

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.background.hover};
  }

  &:active:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.background.active};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: -2px;
  }
`;

export const DropdownMenuIcon = styled.span`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  
  svg {
    width: 20px;
    height: 20px;
    color: currentColor;
  }
`;

export const DropdownMenuItemText = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const DropdownMenuDivider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border.secondary};
  margin: 4px 0;
`;

export const DropdownMenuHeader = styled.div`
  padding: 8px 16px 4px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  user-select: none;
`;

export const DropdownSearch = styled.div`
  padding: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.secondary};
  position: sticky;
  top: 0;
  background-color: ${({ theme }) => theme.colors.background.paper};
  z-index: 1;
`;

export const DropdownSearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background-color: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 14px;
  transition: all 0.2s ease;
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.light}33;
  }
`;

export const DropdownEmpty = styled.div`
  padding: 24px 16px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
`;

export const DropdownLabel = styled.label`
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const DropdownHelperText = styled.span<{ hasError?: boolean }>`
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: ${({ hasError, theme }) =>
    hasError ? theme.colors.error.main : theme.colors.text.secondary};
`;

export const DropdownCheckmark = styled.span`
  display: flex;
  align-items: center;
  margin-left: auto;
  color: ${({ theme }) => theme.colors.success.main};
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

}
