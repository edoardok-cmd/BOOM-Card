import styled, { css, keyframes } from 'styled-components';
import { motion } from 'framer-motion';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

interface ToastContainerProps {
  $position: ToastPosition;
}

interface ToastWrapperProps {
  $variant: ToastVariant;
  $isClosing?: boolean;
}

interface ProgressBarProps {
  $variant: ToastVariant;
  $duration: number;
}

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const progressAnimation = keyframes`
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
`;

const getPositionStyles = (position: ToastPosition) => {
  const positions = {
    'top-right': css`
      top: 24px;
      right: 24px;
    `,
    'top-left': css`
      top: 24px;
      left: 24px;
    `,
    'bottom-right': css`
      bottom: 24px;
      right: 24px;
    `,
    'bottom-left': css`
      bottom: 24px;
      left: 24px;
    `,
    'top-center': css`
      top: 24px;
      left: 50%;
      transform: translateX(-50%);
    `,
    'bottom-center': css`
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
    `,
  };

  return positions[position];
};

const getVariantStyles = (variant: ToastVariant) => {
  const variants = {
    success: css`
      background-color: #ffffff;
      border: 1px solid #10b981;
      color: #065f46;

      ${ToastIcon} {
        background-color: #d1fae5;
        color: #10b981;
      }

      ${ProgressBar} {
        background-color: #10b981;
      }
    `,
    error: css`
      background-color: #ffffff;
      border: 1px solid #ef4444;
      color: #991b1b;

      ${ToastIcon} {
        background-color: #fee2e2;
        color: #ef4444;
      }

      ${ProgressBar} {
        background-color: #ef4444;
      }
    `,
    warning: css`
      background-color: #ffffff;
      border: 1px solid #f59e0b;
      color: #92400e;

      ${ToastIcon} {
        background-color: #fef3c7;
        color: #f59e0b;
      }

      ${ProgressBar} {
        background-color: #f59e0b;
      }
    `,
    info: css`
      background-color: #ffffff;
      border: 1px solid #3b82f6;
      color: #1e3a8a;

      ${ToastIcon} {
        background-color: #dbeafe;
        color: #3b82f6;
      }

      ${ProgressBar} {
        background-color: #3b82f6;
      }
    `,
  };

  return variants[variant];
};

export const ToastContainer = styled.div<ToastContainerProps>`
  position: fixed;
  ${props => getPositionStyles(props.$position)};
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 420px;
  pointer-events: none;

  @media (max-width: 768px) {
    max-width: calc(100vw - 48px);
    
    ${props => props.$position.includes('right') && css`
      right: 16px;
    `}
    
    ${props => props.$position.includes('left') && css`
      left: 16px;
    `}
    
    ${props => props.$position.includes('top') && css`
      top: 16px;
    `}
    
    ${props => props.$position.includes('bottom') && css`
      bottom: 16px;
    `}
`;

export const ToastWrapper = styled(motion.div)<ToastWrapperProps>`
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  min-width: 320px;
  max-width: 420px;
  position: relative;
  overflow: hidden;
  pointer-events: all;
  animation: ${props => props.$isClosing ? slideOut : slideIn} 0.3s ease-out forwards;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  ${props => getVariantStyles(props.$variant)};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  @media (max-width: 768px) {
    min-width: 280px;
    max-width: 100%;
  }
`;

export const ToastIcon = styled.div`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

export const ToastContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 32px;
`;

export const ToastTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  line-height: 1.25;
  margin: 0;
`;

export const ToastMessage = styled.p`
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  margin: 0;
  opacity: 0.9;
`;

export const ToastActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

export const ToastAction = styled.button`
  background: none;
  border: none;
  color: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  text-decoration: underline;
  opacity: 0.8;

  &:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.05);
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0.6;

  &:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.05);
  }

  &:active {
    transform: scale(0.9);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const ProgressBar = styled.div<ProgressBarProps>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  border-radius: 0 0 12px 12px;
  animation: ${progressAnimation} ${props => props.$duration}ms linear forwards;
  transform-origin: left;
`;

export const ToastProvider = styled.div`
  position: relative;
`;

}
