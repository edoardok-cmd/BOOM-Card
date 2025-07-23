import styled, { css } from 'styled-components';
import { TabsProps, TabProps, TabPanelProps } from './Tabs.types';

export const TabsContainer = styled.div<{ variant?: TabsProps['variant'] }>`
  width: 100%;
  display: flex;
  flex-direction: column;
  font-family: ${({ theme }) => theme.fonts.primary};
`;

export const TabList = styled.div<{ 
  variant?: TabsProps['variant'];
  align?: TabsProps['align'];
  fullWidth?: boolean;
}>`
  display: flex;
  position: relative;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: 0 ${({ theme }) => theme.spacing.xs};
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => `${theme.colors.primary.main} ${theme.colors.background.tertiary}`};
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background.tertiary};
    border-radius: ${({ theme }) => theme.borderRadius.full};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.primary.main};
    border-radius: ${({ theme }) => theme.borderRadius.full};
  }

  ${({ variant }) => variant === 'pills' && css`
    background-color: transparent;
    gap: ${({ theme }) => theme.spacing.sm};
    padding: 0;
  `}

  ${({ variant }) => variant === 'underline' && css`
    background-color: transparent;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
    border-radius: 0;
    gap: 0;
    padding: 0;
  `}

  ${({ align }) => align === 'center' && css`
    justify-content: center;
  `}

  ${({ align }) => align === 'right' && css`
    justify-content: flex-end;
  `}

  ${({ fullWidth }) => fullWidth && css`
    & > * {
      flex: 1;
    }
  `}

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    gap: ${({ theme }) => theme.spacing.xxs};
    padding: 0 ${({ theme }) => theme.spacing.xxs};
    
    ${({ variant }) => variant === 'pills' && css`
      gap: ${({ theme }) => theme.spacing.xs};
    `}
`;

export const Tab = styled.button<TabProps & { 
  variant?: TabsProps['variant'];
  isActive: boolean;
}>`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background: none;
  border: none;
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.body.fontSize};
  font-weight: ${({ theme }) => theme.typography.body.fontWeight};
  color: ${({ theme, isActive }) => isActive ? theme.colors.text.primary : theme.colors.text.secondary};
  transition: all 0.2s ease-in-out;
  white-space: nowrap;
  user-select: none;
  outline: none;
  min-height: 44px;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: 2px;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ variant, isActive, theme }) => variant === 'default' && css`
    ${isActive && css`
      background-color: ${theme.colors.background.primary};
      box-shadow: ${theme.shadows.sm};
      border-radius: ${theme.borderRadius.md};
    `}
  `}

  ${({ variant, isActive, theme }) => variant === 'pills' && css`
    border-radius: ${theme.borderRadius.full};
    padding: ${`${theme.spacing.xs} ${theme.spacing.lg}`};
    background-color: ${isActive ? theme.colors.primary.main : theme.colors.background.secondary};
    color: ${isActive ? theme.colors.text.inverse : theme.colors.text.secondary};
    font-weight: ${theme.typography.fontWeights.medium};

    &:hover:not(:disabled) {
      background-color: ${isActive ? theme.colors.primary.dark : theme.colors.background.tertiary};
      color: ${isActive ? theme.colors.text.inverse : theme.colors.text.primary};
    }
  `}

  ${({ variant, isActive, theme }) => variant === 'underline' && css`
    padding: ${`${theme.spacing.sm} ${theme.spacing.lg}`};
    margin-bottom: -1px;
    background: none;
    border-bottom: 2px solid transparent;
    border-radius: 0;

    ${isActive && css`
      color: ${theme.colors.primary.main};
      border-bottom-color: ${theme.colors.primary.main};
    `}

    &:hover:not(:disabled) {
      color: ${theme.colors.primary.main};
      border-bottom-color: ${theme.colors.border.secondary};
    }

    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 50%;
      transform: translateX(-50%) scaleX(0);
      width: 100%;
      height: 2px;
      background-color: ${theme.colors.primary.main};
      transition: transform 0.3s ease-in-out;
    }

    ${isActive && css`
      &::after {
        transform: translateX(-50%) scaleX(1);
      }
    `}
  `}

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: ${({ theme }) => theme.typography.caption.fontSize};
    padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
    min-height: 40px;

    ${({ variant, theme }) => variant === 'pills' && css`
      padding: ${`${theme.spacing.xxs} ${theme.spacing.md}`};
    `}

    ${({ variant, theme }) => variant === 'underline' && css`
      padding: ${`${theme.spacing.xs} ${theme.spacing.md}`};
    `}
`;

export const TabIcon = styled.span<{ position?: 'left' | 'right' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  order: ${({ position }) => position === 'right' ? 1 : 0};

  svg {
    width: 100%;
    height: 100%;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    width: 16px;
    height: 16px;
  }
`;

export const TabBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 ${({ theme }) => theme.spacing.xs};
  background-color: ${({ theme }) => theme.colors.status.error};
  color: ${({ theme }) => theme.colors.text.inverse};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  margin-left: ${({ theme }) => theme.spacing.xs};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    min-width: 16px;
    height: 16px;
    font-size: 10px;
    padding: 0 ${({ theme }) => theme.spacing.xxs};
  }
`;

export const TabPanels = styled.div<{ animated?: boolean }>`
  position: relative;
  width: 100%;
  overflow: hidden;
`;

export const TabPanel = styled.div<TabPanelProps & { 
  isActive: boolean;
  animated?: boolean;
}>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.background.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  
  ${({ isActive, animated }) => !isActive && css`
    display: ${animated ? 'block' : 'none'};
    position: ${animated ? 'absolute' : 'static'};
    top: 0;
    left: 0;
    opacity: ${animated ? 0 : 1};
    transform: ${animated ? 'translateX(20px)' : 'none'};
    pointer-events: none;
  `}

  ${({ isActive, animated }) => isActive && animated && css`
    animation: tabFadeIn 0.3s ease-in-out forwards;
  `}

  @keyframes tabFadeIn {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing.md};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

export const TabContent = styled.div`
  width: 100%;
  
  h1, h2, h3, h4, h5, h6 {
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  p {
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    
    &:last-child {
      margin-bottom: 0;
    }

  ul, ol {
    margin-bottom: ${({ theme }) => theme.spacing.md};
    padding-left: ${({ theme }) => theme.spacing.lg};
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: ${({ theme }) => theme.borderRadius.md};
  }

  pre {
    background-color: ${({ theme }) => theme.colors.background.secondary};
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    overflow-x: auto;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  code {
    background-color: ${({ theme }) => theme.colors.background.secondary};
    padding: ${({ theme }) => `${theme.spacing.xxs} ${theme.spacing.xs}`};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: 0.9em;
  }

  blockquote {
    border-left: 4px solid ${({ theme }) => theme.colors.primary.main};
    padding-left: ${({ theme }) => theme.spacing.md};
    margin: ${({ theme }) => `${theme.spacing.md} 0`};
    color: ${({ theme }) => theme.colors.text.secondary};
    font-style: italic;
  }
`;

export const TabIndicator = styled.div<{ 
  variant?: TabsProps['variant'];
  width: number;
  offset: number;
}>`
  position: absolute;
  bottom: 0;
  height: 2px;
  background-color: ${({ theme }) => theme.colors.primary.main};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: ${({ width }) => width}px;
  transform: translateX(${({ offset }) => offset}px);

  ${({ variant }) => variant !== 'underline' && css`
    display: none;
  `}
`;

export const TabsScrollButton = styled.button<{ direction: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ direction }) => direction === 'left' ? 'left: 0;' : 'right: 0;'}
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  back
}
}
}
}
