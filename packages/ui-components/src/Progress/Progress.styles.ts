import styled, { css, keyframes } from 'styled-components';
import { ProgressProps } from './Progress.types';

const stripeAnimation = keyframes`
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 40px 40px;
  }
`;

const pulseAnimation = keyframes`
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
`;

const progressAnimation = keyframes`
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
`;

export const ProgressContainer = styled.div<{ $size: ProgressProps['size'] }>`
  position: relative;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.full};
  overflow: hidden;
  
  ${({ $size }) => {
    switch ($size) {
      case 'xs':
        return css`
          height: 4px;
        `;
      case 'sm':
        return css`
          height: 6px;
        `;
      case 'md':
        return css`
          height: 8px;
        `;
      case 'lg':
        return css`
          height: 12px;
        `;
      case 'xl':
        return css`
          height: 16px;
        `;
      default:
        return css`
          height: 8px;
        `;
    }}
`;

export const ProgressBar = styled.div<{
  $value: number;
  $variant: ProgressProps['variant'];
  $animated: boolean;
  $striped: boolean;
  $showValue: boolean;
}>`
  height: 100%;
  width: ${({ $value }) => `${$value}%`};
  border-radius: ${({ theme }) => theme.radii.full};
  transition: width 0.3s ease-in-out, background-color 0.2s ease;
  transform-origin: left;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  
  ${({ $animated }) =>
    $animated &&
    css`
      animation: ${progressAnimation} 0.5s ease-out;
    `}
  
  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary':
        return css`
          background-color: ${theme.colors.primary[500]};
        `;
      case 'success':
        return css`
          background-color: ${theme.colors.success[500]};
        `;
      case 'warning':
        return css`
          background-color: ${theme.colors.warning[500]};
        `;
      case 'error':
        return css`
          background-color: ${theme.colors.error[500]};
        `;
      case 'info':
        return css`
          background-color: ${theme.colors.info[500]};
        `;
      default:
        return css`
          background-color: ${theme.colors.primary[500]};
        `;
    }}
  
  ${({ $striped }) =>
    $striped &&
    css`
      background-image: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.15) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.15) 50%,
        rgba(255, 255, 255, 0.15) 75%,
        transparent 75%,
        transparent
      );
      background-size: 40px 40px;
      animation: ${stripeAnimation} 1s linear infinite;
    `}
`;

export const ProgressValue = styled.span<{
  $size: ProgressProps['size'];
  $value: number;
}>`
  position: absolute;
  right: 8px;
  color: white;
  font-weight: 600;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  
  ${({ $size }) => {
    switch ($size) {
      case 'xs':
        return css`
          font-size: 10px;
          line-height: 1;
        `;
      case 'sm':
        return css`
          font-size: 11px;
          line-height: 1;
        `;
      case 'md':
        return css`
          font-size: 12px;
          line-height: 1;
        `;
      case 'lg':
        return css`
          font-size: 14px;
          line-height: 1;
        `;
      case 'xl':
        return css`
          font-size: 16px;
          line-height: 1;
        `;
      default:
        return css`
          font-size: 12px;
          line-height: 1;
        `;
    }}
  
  ${({ $value }) =>
    $value < 20 &&
    css`
      right: -30px;
      color: ${({ theme }) => theme.colors.gray[700]};
      text-shadow: none;
    `}
`;

export const ProgressLabel = styled.div<{ $size: ProgressProps['size'] }>`
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  color: ${({ theme }) => theme.colors.gray[700]};
  font-weight: 500;
  
  ${({ $size }) => {
    switch ($size) {
      case 'xs':
      case 'sm':
        return css`
          font-size: ${({ theme }) => theme.fontSizes.sm};
        `;
      case 'md':
        return css`
          font-size: ${({ theme }) => theme.fontSizes.base};
        `;
      case 'lg':
      case 'xl':
        return css`
          font-size: ${({ theme }) => theme.fontSizes.lg};
        `;
      default:
        return css`
          font-size: ${({ theme }) => theme.fontSizes.base};
        `;
    }}
`;

export const ProgressWrapper = styled.div`
  width: 100%;
`;

export const ProgressBuffer = styled.div<{ $value: number }>`
  position: absolute;
  height: 100%;
  width: ${({ $value }) => `${$value}%`};
  background-color: ${({ theme }) => theme.colors.gray[300]};
  opacity: 0.5;
  border-radius: ${({ theme }) => theme.radii.full};
`;

export const IndeterminateBar = styled.div<{
  $variant: ProgressProps['variant'];
}>`
  position: absolute;
  height: 100%;
  width: 30%;
  border-radius: ${({ theme }) => theme.radii.full};
  animation: ${pulseAnimation} 1.5s ease-in-out infinite;
  
  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary':
        return css`
          background-color: ${theme.colors.primary[500]};
        `;
      case 'success':
        return css`
          background-color: ${theme.colors.success[500]};
        `;
      case 'warning':
        return css`
          background-color: ${theme.colors.warning[500]};
        `;
      case 'error':
        return css`
          background-color: ${theme.colors.error[500]};
        `;
      case 'info':
        return css`
          background-color: ${theme.colors.info[500]};
        `;
      default:
        return css`
          background-color: ${theme.colors.primary[500]};
        `;
    }}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    height: 100%;
    width: 100%;
    border-radius: ${({ theme }) => theme.radii.full};
    background: inherit;
    animation: ${stripeAnimation} 1.5s ease-in-out infinite;
  }
`;

export const SegmentedContainer = styled.div<{ $segments: number }>`
  display: flex;
  gap: 2px;
  width: 100%;
`;

export const Segment = styled.div<{
  $active: boolean;
  $variant: ProgressProps['variant'];
  $size: ProgressProps['size'];
}>`
  flex: 1;
  background-color: ${({ $active, $variant, theme }) => {
    if (!$active) return theme.colors.gray[200];
    
    switch ($variant) {
      case 'primary':
        return theme.colors.primary[500];
      case 'success':
        return theme.colors.success[500];
      case 'warning':
        return theme.colors.warning[500];
      case 'error':
        return theme.colors.error[500];
      case 'info':
        return theme.colors.info[500];
      default:
        return theme.colors.primary[500];
    }};
  
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: background-color 0.3s ease;
  
  ${({ $size }) => {
    switch ($size) {
      case 'xs':
        return css`
          height: 4px;
        `;
      case 'sm':
        return css`
          height: 6px;
        `;
      case 'md':
        return css`
          height: 8px;
        `;
      case 'lg':
        return css`
          height: 12px;
        `;
      case 'xl':
        return css`
          height: 16px;
        `;
      default:
        return css`
          height: 8px;
        `;
    }}
  
  &:first-child {
    border-top-left-radius: ${({ theme }) => theme.radii.full};
    border-bottom-left-radius: ${({ theme }) => theme.radii.full};
  }
  
  &:last-child {
    border-top-right-radius: ${({ theme }) => theme.radii.full};
    border-bottom-right-radius: ${({ theme }) => theme.radii.full};
  }
`;

}
}
}
}
}
}
}
