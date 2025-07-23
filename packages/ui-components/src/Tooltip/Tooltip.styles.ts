import styled, { css, keyframes } from 'styled-components';
import { TooltipProps } from './Tooltip.types';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(4px);
  }
`;

const getPlacementStyles = (placement: TooltipProps['placement']) => {
  const offset = '8px';
  
  switch (placement) {
    case 'top':
      return css`
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        margin-bottom: ${offset};
      `;
    case 'bottom':
      return css`
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        margin-top: ${offset};
      `;
    case 'left':
      return css`
        right: 100%;
        top: 50%;
        transform: translateY(-50%);
        margin-right: ${offset};
      `;
    case 'right':
      return css`
        left: 100%;
        top: 50%;
        transform: translateY(-50%);
        margin-left: ${offset};
      `;
    case 'top-start':
      return css`
        bottom: 100%;
        left: 0;
        margin-bottom: ${offset};
      `;
    case 'top-end':
      return css`
        bottom: 100%;
        right: 0;
        margin-bottom: ${offset};
      `;
    case 'bottom-start':
      return css`
        top: 100%;
        left: 0;
        margin-top: ${offset};
      `;
    case 'bottom-end':
      return css`
        top: 100%;
        right: 0;
        margin-top: ${offset};
      `;
    default:
      return css``;
  };

const getArrowStyles = (placement: TooltipProps['placement']) => {
  const size = '6px';
  const color = 'var(--tooltip-bg, #2c2c2c)';
  
  switch (placement) {
    case 'top':
    case 'top-start':
    case 'top-end':
      return css`
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-left: ${size} solid transparent;
        border-right: ${size} solid transparent;
        border-top: ${size} solid ${color};
      `;
    case 'bottom':
    case 'bottom-start':
    case 'bottom-end':
      return css`
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-left: ${size} solid transparent;
        border-right: ${size} solid transparent;
        border-bottom: ${size} solid ${color};
      `;
    case 'left':
      return css`
        left: 100%;
        top: 50%;
        transform: translateY(-50%);
        border-top: ${size} solid transparent;
        border-bottom: ${size} solid transparent;
        border-left: ${size} solid ${color};
      `;
    case 'right':
      return css`
        right: 100%;
        top: 50%;
        transform: translateY(-50%);
        border-top: ${size} solid transparent;
        border-bottom: ${size} solid transparent;
        border-right: ${size} solid ${color};
      `;
    default:
      return css``;
  };

const getVariantStyles = (variant: TooltipProps['variant']) => {
  switch (variant) {
    case 'light':
      return css`
        --tooltip-bg: #ffffff;
        --tooltip-color: #2c2c2c;
        --tooltip-border: rgba(0, 0, 0, 0.1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      `;
    case 'error':
      return css`
        --tooltip-bg: #dc2626;
        --tooltip-color: #ffffff;
        --tooltip-border: #dc2626;
      `;
    case 'success':
      return css`
        --tooltip-bg: #16a34a;
        --tooltip-color: #ffffff;
        --tooltip-border: #16a34a;
      `;
    case 'warning':
      return css`
        --tooltip-bg: #f59e0b;
        --tooltip-color: #ffffff;
        --tooltip-border: #f59e0b;
      `;
    case 'info':
      return css`
        --tooltip-bg: #3b82f6;
        --tooltip-color: #ffffff;
        --tooltip-border: #3b82f6;
      `;
    case 'dark':
    default:
      return css`
        --tooltip-bg: #2c2c2c;
        --tooltip-color: #ffffff;
        --tooltip-border: #2c2c2c;
      `;
  };

export const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

export const TooltipContent = styled.div<{
  $visible: boolean;
  $placement: TooltipProps['placement'];
  $variant: TooltipProps['variant'];
  $maxWidth?: number;
  $animation?: boolean;
}>`
  position: absolute;
  z-index: 9999;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.5;
  white-space: nowrap;
  pointer-events: none;
  background-color: var(--tooltip-bg);
  color: var(--tooltip-color);
  border: 1px solid var(--tooltip-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  
  ${({ $variant }) => getVariantStyles($variant)}
  ${({ $placement }) => getPlacementStyles($placement)}
  
  ${({ $maxWidth }) =>
    $maxWidth &&
    css`
      max-width: ${$maxWidth}px;
      white-space: normal;
      word-wrap: break-word;
    `}
  
  ${({ $visible, $animation }) =>
    $animation
      ? css`
          animation: ${$visible ? fadeIn : fadeOut} 0.2s ease-in-out;
          opacity: ${$visible ? 1 : 0};
          visibility: ${$visible ? 'visible' : 'hidden'};
        `
      : css`
          opacity: ${$visible ? 1 : 0};
          visibility: ${$visible ? 'visible' : 'hidden'};
          transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
        `}
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    border-width: 2px;
    font-weight: 500;
  }
  
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transition: none;
  }
`;

export const TooltipArrow = styled.div<{
  $placement: TooltipProps['placement'];
}>`
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
  ${({ $placement }) => getArrowStyles($placement)}
`;

export const TooltipTrigger = styled.div<{
  $inline?: boolean;
}>`
  ${({ $inline }) =>
    $inline
      ? css`
          display: inline-block;
        `
      : css`
          display: block;
        `}
  
  /* Ensure interactive elements remain accessible */
  button&,
  a&,
  [role="button"]& {
    cursor: pointer;
  }
`;

export const TooltipPortal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  pointer-events: none;
  z-index: 9999;
`;

}
}
}
