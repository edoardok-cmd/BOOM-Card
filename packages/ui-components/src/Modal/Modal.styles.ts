import styled, { css, keyframes } from 'styled-components';
import { motion } from 'framer-motion';

export interface ModalStyleProps {
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  hasCloseButton?: boolean;
  noPadding?: boolean;
  transparent?: boolean;
  blur?: boolean;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideIn = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const sizeConfig = {
  small: css`
    max-width: 400px;
    max-height: 80vh;
  `,
  medium: css`
    max-width: 600px;
    max-height: 85vh;
  `,
  large: css`
    max-width: 900px;
    max-height: 90vh;
  `,
  fullscreen: css`
    width: 100vw;
    height: 100vh;
    max-width: 100%;
    max-height: 100%;
    border-radius: 0;
  `
};

const positionConfig = {
  center: css`
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  `,
  top: css`
    top: 10%;
    left: 50%;
    transform: translateX(-50%);
  `,
  bottom: css`
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 16px 16px 0 0;
  `,
  left: css`
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    border-radius: 0 16px 16px 0;
  `,
  right: css`
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    border-radius: 16px 0 0 16px;
  `
};

const variantConfig = {
  default: css`
    border: 1px solid ${({ theme }) => theme.colors.border.default};
  `,
  success: css`
    border: 2px solid ${({ theme }) => theme.colors.status.success};
    box-shadow: 0 0 20px rgba(46, 213, 115, 0.15);
  `,
  warning: css`
    border: 2px solid ${({ theme }) => theme.colors.status.warning};
    box-shadow: 0 0 20px rgba(241, 196, 15, 0.15);
  `,
  error: css`
    border: 2px solid ${({ theme }) => theme.colors.status.error};
    box-shadow: 0 0 20px rgba(235, 59, 90, 0.15);
  `,
  info: css`
    border: 2px solid ${({ theme }) => theme.colors.status.info};
    box-shadow: 0 0 20px rgba(52, 152, 219, 0.15);
  `
};

export const ModalOverlay = styled(motion.div)<{ blur?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: ${({ blur }) => blur ? 'blur(4px)' : 'none'};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: ${fadeIn} 0.2s ease-out;
`;

export const ModalContainer = styled(motion.div)<ModalStyleProps>`
  position: fixed;
  background-color: ${({ theme, transparent }) => 
    transparent ? 'transparent' : theme.colors.background.paper};
  border-radius: 16px;
  overflow: hidden;
  width: 90%;
  animation: ${slideIn} 0.3s ease-out;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  
  ${({ size }) => size && sizeConfig[size]}
  ${({ position }) => position && positionConfig[position]}
  ${({ variant }) => variant && variantConfig[variant]}
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    width: 95%;
    max-width: 100%;
    
    ${({ size }) => size === 'large' && css`
      max-width: 100%;
      height: 100vh;
      border-radius: 0;
    `}
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    ${({ position }) => position === 'bottom' && css`
      width: 100%;
      max-height: 85vh;
    `}
`;

export const ModalHeader = styled.div<{ variant?: string }>`
  padding: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme, variant }) => {
    switch (variant) {
      case 'success': return 'rgba(46, 213, 115, 0.05)';
      case 'warning': return 'rgba(241, 196, 15, 0.05)';
      case 'error': return 'rgba(235, 59, 90, 0.05)';
      case 'info': return 'rgba(52, 152, 219, 0.05)';
      default: return 'transparent';
    }};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 20px;
  }
`;

export const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 1.25rem;
  }
`;

export const ModalCloseButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.hover};
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

export const ModalBody = styled.div<{ noPadding?: boolean }>`
  padding: ${({ noPadding }) => noPadding ? '0' : '24px'};
  overflow-y: auto;
  flex: 1;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ noPadding }) => noPadding ? '0' : '20px'};
  }
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background.default};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.default};
    border-radius: 4px;
    
    &:hover {
      background: ${({ theme }) => theme.colors.border.hover};
    }
`;

export const ModalFooter = styled.div`
  padding: 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border.default};
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  background-color: ${({ theme }) => theme.colors.background.subtle};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 16px 20px;
    flex-direction: column-reverse;
    
    & > * {
      width: 100%;
    }
`;

export const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 100%;
    flex-direction: column-reverse;
    
    & > * {
      width: 100%;
    }
`;

export const ModalLoader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  
  &::after {
    content: '';
    width: 48px;
    height: 48px;
    border: 4px solid ${({ theme }) => theme.colors.border.default};
    border-top-color: ${({ theme }) => theme.colors.primary};
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
`;

export const ModalEmpty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
  gap: 16px;
  
  svg {
    width: 64px;
    height: 64px;
    color: ${({ theme }) => theme.colors.text.disabled};
  }
  
  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 1rem;
    margin: 0;
  }
`;

export const ModalDivider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border.default};
  margin: 24px 0;
`;

export const ModalSection = styled.section`
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const ModalSectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 16px 0;
`;

export const ModalAlert = styled.div<{ type: 'success' | 'warning' | 'error' | 'info' }>`
  padding: 16px;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
  
  ${({ type, theme }) => {
    const colors = {
      success: { bg: 'rgba(46, 213, 115, 0.1)', border: theme.colors.status.success },
      warning: { bg: 'rgba(241, 196, 15, 0.1)', border: theme.colors.status.warning },
      error: { bg: 'rgba(235, 59, 90, 0.1)', border: theme.colors.status.error },
      info: { bg: 'rgba(52, 152, 219, 0.1)', border: theme.colors.status.info };
    
    return css`
      background-color: ${colors[type].bg};
      border: 1px solid ${colors[type].border};
      
      svg {
        color: ${colors[type].border};
        flex-shrink: 0;
      }
    `;
  }}
`;

export const ModalGrid = styled.div<{ columns?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ columns = 2 }) => columns}, 1fr);
  gap: 16px;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

export const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const ModalFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ModalLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const ModalInput = styled.input`
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: 8px;
  font-size: 1rem;
  background-color: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.border.hover};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.background.disabled};
    cursor: not-allowed;
  }
`;

export const ModalTextarea = styled.textarea`
  padding: 12px
}
}
}
}
}
}
}
}
