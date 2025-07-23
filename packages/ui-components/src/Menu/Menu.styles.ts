import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

export interface MenuStyleProps {
  isOpen?: boolean;
  position?: 'left' | 'right' | 'center';
  fullWidth?: boolean;
  maxHeight?: string;
  minWidth?: string;
  maxWidth?: string;
  variant?: 'default' | 'dark' | 'light';
  elevation?: 'none' | 'low' | 'medium' | 'high';
  hasIcon?: boolean;
  isCompact?: boolean;
}

export interface MenuItemStyleProps {
  isActive?: boolean;
  isDisabled?: boolean;
  hasIcon?: boolean;
  hasSubMenu?: boolean;
  variant?: 'default' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
}

const elevationStyles = {
  none: css`
    box-shadow: none;
  `,
  low: css`
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  `,
  medium: css`
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  `,
  high: css`
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  `
};

const variantStyles = {
  default: css`
    background-color: ${({ theme }) => theme.colors.background.paper};
    color: ${({ theme }) => theme.colors.text.primary};
    border: 1px solid ${({ theme }) => theme.colors.divider};
  `,
  dark: css`
    background-color: ${({ theme }) => theme.colors.grey[900]};
    color: ${({ theme }) => theme.colors.common.white};
    border: 1px solid ${({ theme }) => theme.colors.grey[800]};
  `,
  light: css`
    background-color: ${({ theme }) => theme.colors.common.white};
    color: ${({ theme }) => theme.colors.text.primary};
    border: 1px solid ${({ theme }) => theme.colors.grey[200]};
  `
};

const positionStyles = {
  left: css`
    left: 0;
    transform-origin: top left;
  `,
  right: css`
    right: 0;
    transform-origin: top right;
  `,
  center: css`
    left: 50%;
    transform: translateX(-50%);
    transform-origin: top center;
  `
};

export const MenuContainer = styled.div`
  position: relative;
  display: inline-block;
`;

export const MenuWrapper = styled(motion.div)<MenuStyleProps>`
  position: absolute;
  top: 100%;
  margin-top: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  overflow: hidden;
  z-index: ${({ theme }) => theme.zIndex.dropdown};
  
  ${({ position = 'left' }) => positionStyles[position]};
  ${({ variant = 'default' }) => variantStyles[variant]};
  ${({ elevation = 'medium' }) => elevationStyles[elevation]};
  
  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
    min-width: 100%;
  `};
  
  ${({ minWidth }) => minWidth && css`
    min-width: ${minWidth};
  `};
  
  ${({ maxWidth }) => maxWidth && css`
    max-width: ${maxWidth};
  `};
  
  ${({ maxHeight }) => maxHeight && css`
    max-height: ${maxHeight};
    overflow-y: auto;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: ${({ theme }) => theme.colors.grey[100]};
    }
    
    &::-webkit-scrollbar-thumb {
      background: ${({ theme }) => theme.colors.grey[400]};
      border-radius: 3px;
      
      &:hover {
        background: ${({ theme }) => theme.colors.grey[500]};
      }
  `};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}px) {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 0;
    border-radius: ${({ theme }) => theme.shape.borderRadius}px ${({ theme }) => theme.shape.borderRadius}px 0 0;
    max-height: 70vh;
    overflow-y: auto;
  }
`;

export const MenuList = styled.ul<{ isCompact?: boolean }>`
  list-style: none;
  margin: 0;
  padding: ${({ theme, isCompact }) => 
    isCompact ? theme.spacing(0.5, 0) : theme.spacing(1, 0)};
`;

const itemSizeStyles = {
  small: css`
    padding: ${({ theme }) => theme.spacing(1, 2)};
    font-size: ${({ theme }) => theme.typography.body2.fontSize};
  `,
  medium: css`
    padding: ${({ theme }) => theme.spacing(1.5, 3)};
    font-size: ${({ theme }) => theme.typography.body1.fontSize};
  `,
  large: css`
    padding: ${({ theme }) => theme.spacing(2, 3)};
    font-size: ${({ theme }) => theme.typography.h6.fontSize};
  `
};

const itemVariantStyles = {
  default: css`
    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.action.hover};
    }
    
    &:active:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.action.selected};
    }
  `,
  danger: css`
    color: ${({ theme }) => theme.colors.error.main};
    
    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.error.main}12;
      color: ${({ theme }) => theme.colors.error.dark};
    }
  `,
  success: css`
    color: ${({ theme }) => theme.colors.success.main};
    
    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.success.main}12;
      color: ${({ theme }) => theme.colors.success.dark};
    }
  `
};

export const MenuItem = styled.li<MenuItemStyleProps>`
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.duration.short}ms;
  user-select: none;
  white-space: nowrap;
  position: relative;
  
  ${({ size = 'medium' }) => itemSizeStyles[size]};
  ${({ variant = 'default' }) => itemVariantStyles[variant]};
  
  ${({ isActive, theme }) => isActive && css`
    background-color: ${theme.colors.primary.main}12;
    color: ${theme.colors.primary.main};
    font-weight: ${theme.typography.fontWeightMedium};
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 60%;
      background-color: ${theme.colors.primary.main};
      border-radius: 0 2px 2px 0;
    }
  `};
  
  ${({ isDisabled, theme }) => isDisabled && css`
    color: ${theme.colors.text.disabled};
    cursor: not-allowed;
    pointer-events: none;
    opacity: 0.6;
  `};
  
  ${({ hasSubMenu, theme }) => hasSubMenu && css`
    &::after {
      content: '›';
      margin-left: auto;
      padding-left: ${theme.spacing(2)};
      font-size: 1.2em;
      opacity: 0.6;
    }
  `};
`;

export const MenuItemIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing(1.5)};
  flex-shrink: 0;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

export const MenuItemText = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const MenuItemShortcut = styled.span`
  margin-left: ${({ theme }) => theme.spacing(3)};
  opacity: 0.6;
  font-size: 0.85em;
  font-family: ${({ theme }) => theme.typography.fontFamilyMonospace};
`;

export const MenuDivider = styled.hr`
  margin: ${({ theme }) => theme.spacing(1, 0)};
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.divider};
`;

export const MenuHeader = styled.div`
  padding: ${({ theme }) => theme.spacing(1.5, 3)};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const MenuFooter = styled.div`
  padding: ${({ theme }) => theme.spacing(2, 3)};
  border-top: 1px solid ${({ theme }) => theme.colors.divider};
  background-color: ${({ theme }) => theme.colors.grey[50]};
`;

export const SubMenuWrapper = styled(MenuWrapper)`
  position: absolute;
  top: 0;
  left: 100%;
  margin-top: 0;
  margin-left: ${({ theme }) => theme.spacing(0.5)};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}px) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
  }
`;

export const MenuSearch = styled.div`
  padding: ${({ theme }) => theme.spacing(1.5, 3)};
  border-bottom: 1px solid ${({ theme }) => theme.colors.divider};
  
  input {
    width: 100%;
    padding: ${({ theme }) => theme.spacing(1, 1.5)};
    border: 1px solid ${({ theme }) => theme.colors.grey[300]};
    border-radius: ${({ theme }) => theme.shape.borderRadius}px;
    font-size: ${({ theme }) => theme.typography.body2.fontSize};
    outline: none;
    transition: border-color ${({ theme }) => theme.transitions.duration.short}ms;
    
    &:focus {
      border-color: ${({ theme }) => theme.colors.primary.main};
    }
    
    &::placeholder {
      color: ${({ theme }) => theme.colors.text.disabled};
    }
`;

export const MenuBackdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: transparent;
  z-index: ${({ theme }) => theme.zIndex.backdrop};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}px) {
    background-color: rgba(0, 0, 0, 0.5);
  }
`;

export const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing(4, 3)};
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  
  svg {
    width: 48px;
    height: 48px;
    margin-bottom: ${({ theme }) => theme.spacing(2)};
    opacity: 0.3;
  }
`;

}
}
