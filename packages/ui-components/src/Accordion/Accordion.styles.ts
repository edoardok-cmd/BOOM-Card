import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

export interface AccordionStyleProps {
  isOpen?: boolean;
  variant?: 'default' | 'bordered' | 'separated' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const AccordionContainer = styled.div<{ variant?: AccordionStyleProps['variant'] }>`
  width: 100%;
  
  ${({ variant }) => variant === 'separated' && css`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
  `}
`;

export const AccordionItem = styled.div<AccordionStyleProps>`
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
  transition: all 0.2s ease-in-out;
  
  ${({ variant, theme }) => {
    switch (variant) {
      case 'bordered':
        return css`
          border: 1px solid ${theme.colors.border.default};
          
          &:not(:last-child) {
            border-bottom: none;
          }
          
          &:first-child {
            border-top-left-radius: ${theme.borderRadius.md};
            border-top-right-radius: ${theme.borderRadius.md};
          }
          
          &:last-child {
            border-bottom-left-radius: ${theme.borderRadius.md};
            border-bottom-right-radius: ${theme.borderRadius.md};
            border-bottom: 1px solid ${theme.colors.border.default};
          }
        `;
      case 'separated':
        return css`
          border: 1px solid ${theme.colors.border.default};
          box-shadow: ${theme.shadows.sm};
          
          &:hover {
            box-shadow: ${theme.shadows.md};
          }
        `;
      case 'compact':
        return css`
          border-radius: 0;
          border-bottom: 1px solid ${theme.colors.border.light};
          
          &:last-child {
            border-bottom: none;
          }
        `;
      default:
        return css`
          border: 1px solid transparent;
          
          &:not(:last-child) {
            border-bottom: 1px solid ${theme.colors.border.light};
          }
        `;
    }}
  
  ${({ disabled }) => disabled && css`
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  `}
  
  ${({ isOpen, theme }) => isOpen && css`
    ${({ variant }) => variant === 'separated' && css`
      box-shadow: ${theme.shadows.lg};
      transform: translateY(-2px);
    `}
  `}
`;

export const AccordionHeader = styled.button<AccordionStyleProps>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease-in-out;
  
  ${({ size, theme }) => {
    switch (size) {
      case 'sm':
        return css`
          padding: ${theme.spacing.sm} ${theme.spacing.md};
          min-height: 40px;
        `;
      case 'lg':
        return css`
          padding: ${theme.spacing.lg} ${theme.spacing.xl};
          min-height: 64px;
        `;
      default:
        return css`
          padding: ${theme.spacing.md} ${theme.spacing.lg};
          min-height: 52px;
        `;
    }}
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.hover};
  }
  
  &:focus {
    outline: none;
    background-color: ${({ theme }) => theme.colors.background.hover};
  }
  
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: -2px;
  }
  
  ${({ isOpen, theme }) => isOpen && css`
    background-color: ${theme.colors.background.hover};
  `}
  
  ${({ disabled }) => disabled && css`
    cursor: not-allowed;
    
    &:hover {
      background-color: transparent;
    }
  `}
`;

export const AccordionTitle = styled.div<{ size?: AccordionStyleProps['size'] }>`
  flex: 1;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  
  ${({ size, theme }) => {
    switch (size) {
      case 'sm':
        return css`
          font-size: ${theme.typography.fontSize.sm};
          line-height: ${theme.typography.lineHeight.sm};
        `;
      case 'lg':
        return css`
          font-size: ${theme.typography.fontSize.lg};
          line-height: ${theme.typography.lineHeight.lg};
        `;
      default:
        return css`
          font-size: ${theme.typography.fontSize.md};
          line-height: ${theme.typography.lineHeight.md};
        `;
    }}
`;

export const AccordionIcon = styled(motion.div)<{ isOpen?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-left: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: transform 0.2s ease-in-out;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

export const AccordionContent = styled(motion.div)<AccordionStyleProps>`
  overflow: hidden;
  
  ${({ size, theme }) => {
    switch (size) {
      case 'sm':
        return css`
          padding: 0 ${theme.spacing.md};
        `;
      case 'lg':
        return css`
          padding: 0 ${theme.spacing.xl};
        `;
      default:
        return css`
          padding: 0 ${theme.spacing.lg};
        `;
    }}
`;

export const AccordionContentInner = styled.div<{ size?: AccordionStyleProps['size'] }>`
  color: ${({ theme }) => theme.colors.text.secondary};
  
  ${({ size, theme }) => {
    switch (size) {
      case 'sm':
        return css`
          padding: ${theme.spacing.sm} 0 ${theme.spacing.md};
          font-size: ${theme.typography.fontSize.sm};
          line-height: ${theme.typography.lineHeight.md};
        `;
      case 'lg':
        return css`
          padding: ${theme.spacing.md} 0 ${theme.spacing.xl};
          font-size: ${theme.typography.fontSize.md};
          line-height: ${theme.typography.lineHeight.lg};
        `;
      default:
        return css`
          padding: ${theme.spacing.md} 0 ${theme.spacing.lg};
          font-size: ${theme.typography.fontSize.md};
          line-height: ${theme.typography.lineHeight.md};
        `;
    }}
  
  p {
    margin: 0;
    
    &:not(:last-child) {
      margin-bottom: ${({ theme }) => theme.spacing.sm};
    }
  
  ul, ol {
    margin: ${({ theme }) => theme.spacing.sm} 0;
    padding-left: ${({ theme }) => theme.spacing.lg};
  }
  
  a {
    color: ${({ theme }) => theme.colors.primary.main};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
`;

export const AccordionDivider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border.light};
  margin: 0 ${({ theme }) => theme.spacing.lg};
`;

// Additional styled components for enhanced features
export const AccordionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  margin-left: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: 1;
  color: ${({ theme }) => theme.colors.primary.contrastText};
  background-color: ${({ theme }) => theme.colors.primary.main};
  border-radius: ${({ theme }) => theme.borderRadius.full};
`;

export const AccordionSubtitle = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

export const AccordionActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-left: ${({ theme }) => theme.spacing.md};
`;

}
}
}
}
}
}
}
