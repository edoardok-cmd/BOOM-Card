import styled, { css, keyframes } from 'styled-components';
import { DrawerProps } from './Drawer.types';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100%);
  }
`;

const slideInLeft = keyframes`
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
`;

const slideOutLeft = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
`;

const slideInTop = keyframes`
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
`;

const slideOutTop = keyframes`
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-100%);
  }
`;

const slideInBottom = keyframes`
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
`;

const slideOutBottom = keyframes`
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(100%);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

export const DrawerOverlay = styled.div<{ isOpen: boolean; isClosing: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  cursor: pointer;
  animation: ${props => props.isClosing ? fadeOut : fadeIn} 0.3s ease-in-out forwards;
  
  ${props => !props.isOpen && css`
    pointer-events: none;
  `}
`;

export const DrawerContainer = styled.div<{
  isOpen: boolean;
  isClosing: boolean;
  position: DrawerProps['position'];
  size: DrawerProps['size'];
}>`
  position: fixed;
  background-color: ${props => props.theme.colors.background};
  box-shadow: ${props => props.theme.shadows.large};
  z-index: 1001;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  ${props => {
    const getAnimation = () => {
      if (props.isClosing) {
        switch (props.position) {
          case 'left':
            return slideOutLeft;
          case 'top':
            return slideOutTop;
          case 'bottom':
            return slideOutBottom;
          default:
            return slideOut;
        } else {
        switch (props.position) {
          case 'left':
            return slideInLeft;
          case 'top':
            return slideInTop;
          case 'bottom':
            return slideInBottom;
          default:
            return slideIn;
        }
    };
    
    return css`
      animation: ${getAnimation()} 0.3s ease-in-out forwards;
    `;
  }}
  
  ${props => {
    switch (props.position) {
      case 'left':
        return css`
          top: 0;
          left: 0;
          bottom: 0;
          width: ${props.size === 'small' ? '280px' : props.size === 'large' ? '480px' : '360px'};
          max-width: 90vw;
        `;
      case 'top':
        return css`
          top: 0;
          left: 0;
          right: 0;
          height: ${props.size === 'small' ? '200px' : props.size === 'large' ? '400px' : '300px'};
          max-height: 90vh;
        `;
      case 'bottom':
        return css`
          bottom: 0;
          left: 0;
          right: 0;
          height: ${props.size === 'small' ? '200px' : props.size === 'large' ? '400px' : '300px'};
          max-height: 90vh;
        `;
      default: // right
        return css`
          top: 0;
          right: 0;
          bottom: 0;
          width: ${props.size === 'small' ? '280px' : props.size === 'large' ? '480px' : '360px'};
          max-width: 90vw;
        `;
    }}
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    ${props => (props.position === 'left' || props.position === 'right') && css`
      width: 100%;
      max-width: 100%;
    `}
    
    ${props => (props.position === 'top' || props.position === 'bottom') && css`
      height: auto;
      max-height: 90vh;
    `}
`;

export const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  flex-shrink: 0;
`;

export const DrawerTitle = styled.h2`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.2;
`;

export const DrawerCloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: ${props => props.theme.borderRadius.sm};
  background-color: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  color: ${props => props.theme.colors.text.secondary};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray[100]};
    color: ${props => props.theme.colors.text.primary};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary};
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

export const DrawerBody = styled.div<{ noPadding?: boolean }>`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: ${props => props.noPadding ? '0' : props.theme.spacing.lg};
  
  /* Custom scrollbar styles */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.gray[100]};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.gray[400]};
    border-radius: 4px;
    
    &:hover {
      background: ${props => props.theme.colors.gray[500]};
    }
`;

export const DrawerFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.border};
  flex-shrink: 0;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column-reverse;
    
    & > * {
      width: 100%;
    }
`;

export const DrawerContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const DrawerSection = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const DrawerSectionTitle = styled.h3`
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
`;

export const DrawerDivider = styled.hr`
  margin: ${props => props.theme.spacing.lg} 0;
  border: none;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

}
}
}
}
}
}
