import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

export interface SelectStyleProps {
  isOpen?: boolean;
  hasError?: boolean;
  isDisabled?: boolean;
  isFocused?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'outlined' | 'filled' | 'standard';
  fullWidth?: boolean;
}

const sizeStyles = {
  small: css`
    min-height: 32px;
    padding: 6px 12px;
    font-size: 0.875rem;
  `,
  medium: css`
    min-height: 40px;
    padding: 8px 16px;
    font-size: 1rem;
  `,
  large: css`
    min-height: 48px;
    padding: 10px 20px;
    font-size: 1.125rem;
  `,
};

const variantStyles = {
  outlined: css<SelectStyleProps>`
    border: 1px solid ${({ theme, hasError, isFocused }) => 
      hasError ? theme.colors.error : isFocused ? theme.colors.primary : theme.colors.border};
    background-color: ${({ theme }) => theme.colors.background};
    
    &:hover:not(:disabled) {
      border-color: ${({ theme, hasError }) => 
        hasError ? theme.colors.error : theme.colors.primary};
    }
  `,
  filled: css<SelectStyleProps>`
    border: none;
    background-color: ${({ theme, hasError }) => 
      hasError ? `${theme.colors.error}10` : theme.colors.surface};
    border-bottom: 2px solid ${({ theme, hasError, isFocused }) => 
      hasError ? theme.colors.error : isFocused ? theme.colors.primary : theme.colors.border};
    
    &:hover:not(:disabled) {
      background-color: ${({ theme, hasError }) => 
        hasError ? `${theme.colors.error}15` : theme.colors.surfaceHover};
    }
  `,
  standard: css<SelectStyleProps>`
    border: none;
    border-bottom: 1px solid ${({ theme, hasError, isFocused }) => 
      hasError ? theme.colors.error : isFocused ? theme.colors.primary : theme.colors.border};
    background-color: transparent;
    padding-left: 0;
    padding-right: 32px;
    
    &:hover:not(:disabled) {
      border-bottom-color: ${({ theme, hasError }) => 
        hasError ? theme.colors.error : theme.colors.primary};
    }
  `,
};

export const SelectWrapper = styled.div<{ fullWidth?: boolean }>`
  position: relative;
  display: ${({ fullWidth }) => fullWidth ? 'block' : 'inline-block'};
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  min-width: 200px;
`;

export const SelectContainer = styled.div<SelectStyleProps>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: ${({ isDisabled }) => isDisabled ? 'not-allowed' : 'pointer'};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: all 0.2s ease-in-out;
  width: 100%;
  
  ${({ size = 'medium' }) => sizeStyles[size]}
  ${({ variant = 'outlined' }) => variantStyles[variant]}
  
  opacity: ${({ isDisabled }) => isDisabled ? 0.6 : 1};
  
  &:focus {
    outline: none;
    box-shadow: ${({ theme, hasError }) => 
      `0 0 0 2px ${hasError ? theme.colors.error : theme.colors.primary}25`};
  }
`;

export const SelectValue = styled.span<{ hasPlaceholder?: boolean }>`
  flex: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ theme, hasPlaceholder }) => 
    hasPlaceholder ? theme.colors.textSecondary : theme.colors.text};
  user-select: none;
`;

export const SelectIcon = styled.div<{ isOpen?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  transition: transform 0.2s ease-in-out;
  transform: ${({ isOpen }) => isOpen ? 'rotate(180deg)' : 'rotate(0)'};
  color: ${({ theme }) => theme.colors.textSecondary};
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

export const SelectDropdown = styled(motion.div)<{ maxHeight?: string }>`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  overflow: hidden;
  z-index: 1000;
  max-height: ${({ maxHeight }) => maxHeight || '300px'};
`;

export const SelectOptionsList = styled.div`
  overflow-y: auto;
  max-height: inherit;
  padding: 4px 0;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.surface};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    
    &:hover {
      background: ${({ theme }) => theme.colors.textSecondary};
    }
`;

export const SelectOption = styled.div<{ 
  isSelected?: boolean; 
  isHighlighted?: boolean;
  isDisabled?: boolean;
}>`
  padding: 10px 16px;
  cursor: ${({ isDisabled }) => isDisabled ? 'not-allowed' : 'pointer'};
  transition: all 0.15s ease-in-out;
  display: flex;
  align-items: center;
  gap: 12px;
  opacity: ${({ isDisabled }) => isDisabled ? 0.5 : 1};
  
  background-color: ${({ theme, isSelected, isHighlighted }) => 
    isSelected ? `${theme.colors.primary}15` : 
    isHighlighted ? theme.colors.surface : 
    'transparent'};
  
  color: ${({ theme, isSelected }) => 
    isSelected ? theme.colors.primary : theme.colors.text};
  
  &:hover:not([disabled]) {
    background-color: ${({ theme, isSelected }) => 
      isSelected ? `${theme.colors.primary}20` : theme.colors.surface};
  }
`;

export const SelectOptionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
`;

export const SelectOptionText = styled.span`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const SelectLabel = styled.label<{ hasError?: boolean; required?: boolean }>`
  display: block;
  margin-bottom: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme, hasError }) => 
    hasError ? theme.colors.error : theme.colors.textSecondary};
  
  ${({ required }) => required && css`
    &::after {
      content: ' *';
      color: ${({ theme }) => theme.colors.error};
    }
  `}
`;

export const SelectError = styled.span`
  display: block;
  margin-top: 4px;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.error};
`;

export const SelectHelperText = styled.span`
  display: block;
  margin-top: 4px;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const SelectSearch = styled.input`
  width: 100%;
  padding: 8px 12px;
  margin: 4px 8px;
  width: calc(100% - 16px);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s ease-in-out;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const SelectNoOptions = styled.div`
  padding: 16px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.875rem;
`;

export const SelectLoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

export const SelectClearButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 4px;
  margin-right: 4px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: color 0.2s ease-in-out;
  outline: none;
  
  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
  
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

export const SelectGroupLabel = styled.div`
  padding: 8px 16px 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background-color: ${({ theme }) => theme.colors.surface};
  position: sticky;
  top: 0;
  z-index: 1;
`;

export const SelectDivider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
  margin: 4px 0;
`;

export const SelectChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  margin: 2px;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.875rem;
  
  button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    padding: 2px;
    cursor: pointer;
    color: ${({ theme }) => theme.colors.textSecondary};
    transition: color 0.2s ease-in-out;
    
    &:hover {
      color: ${({ theme }) => theme.colors.error};
    }
    
    svg {
      width: 14px;
      height: 14px;
    }
`;

export const SelectMultipleValues = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
  align-items: center;
`;

}
}
