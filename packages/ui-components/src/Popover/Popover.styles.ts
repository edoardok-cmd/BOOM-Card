import styled, { css, keyframes } from 'styled-components';
import { PopoverPosition } from './Popover.types';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-8px);
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
    transform: translateY(-8px);
  }
`;

export const PopoverWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

export const PopoverTrigger = styled.div`
  display: inline-block;
  cursor: pointer;
`;

const getPositionStyles = (position: PopoverPosition) => {
  switch (position) {
    case 'top':
      return css`
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        margin-bottom: 8px;
      `;
    case 'bottom':
      return css`
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        margin-top: 8px;
      `;
    case 'left':
      return css`
        right: 100%;
        top: 50%;
        transform: translateY(-50%);
        margin-right: 8px;
      `;
    case 'right':
      return css`
        left: 100%;
        top: 50%;
        transform: translateY(-50%);
        margin-left: 8px;
      `;
    case 'top-start':
      return css`
        bottom: 100%;
        left: 0;
        margin-bottom: 8px;
      `;
    case 'top-end':
      return css`
        bottom: 100%;
        right: 0;
        margin-bottom: 8px;
      `;
    case 'bottom-start':
      return css`
        top: 100%;
        left: 0;
        margin-top: 8px;
      `;
    case 'bottom-end':
      return css`
        top: 100%;
        right: 0;
        margin-top: 8px;
      `;
    case 'left-start':
      return css`
        right: 100%;
        top: 0;
        margin-right: 8px;
      `;
    case 'left-end':
      return css`
        right: 100%;
        bottom: 0;
        margin-right: 8px;
      `;
    case 'right-start':
      return css`
        left: 100%;
        top: 0;
        margin-left: 8px;
      `;
    case 'right-end':
      return css`
        left: 100%;
        bottom: 0;
        margin-left: 8px;
      `;
    default:
      return css`
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        margin-top: 8px;
      `;
  };

const getArrowStyles = (position: PopoverPosition, arrowSize: number) => {
  const baseArrowStyles = css`
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
    border-color: transparent;
  `;

  switch (position) {
    case 'top':
    case 'top-start':
    case 'top-end':
      return css`
        ${baseArrowStyles}
        bottom: -${arrowSize}px;
        left: ${position === 'top-start' ? '16px' : position === 'top-end' ? 'auto' : '50%'};
        right: ${position === 'top-end' ? '16px' : 'auto'};
        transform: ${position === 'top' ? 'translateX(-50%)' : 'none'};
        border-width: ${arrowSize}px ${arrowSize}px 0;
        border-top-color: ${({ theme }) => theme.colors.surface};
      `;
    case 'bottom':
    case 'bottom-start':
    case 'bottom-end':
      return css`
        ${baseArrowStyles}
        top: -${arrowSize}px;
        left: ${position === 'bottom-start' ? '16px' : position === 'bottom-end' ? 'auto' : '50%'};
        right: ${position === 'bottom-end' ? '16px' : 'auto'};
        transform: ${position === 'bottom' ? 'translateX(-50%)' : 'none'};
        border-width: 0 ${arrowSize}px ${arrowSize}px;
        border-bottom-color: ${({ theme }) => theme.colors.surface};
      `;
    case 'left':
    case 'left-start':
    case 'left-end':
      return css`
        ${baseArrowStyles}
        right: -${arrowSize}px;
        top: ${position === 'left-start' ? '16px' : position === 'left-end' ? 'auto' : '50%'};
        bottom: ${position === 'left-end' ? '16px' : 'auto'};
        transform: ${position === 'left' ? 'translateY(-50%)' : 'none'};
        border-width: ${arrowSize}px 0 ${arrowSize}px ${arrowSize}px;
        border-left-color: ${({ theme }) => theme.colors.surface};
      `;
    case 'right':
    case 'right-start':
    case 'right-end':
      return css`
        ${baseArrowStyles}
        left: -${arrowSize}px;
        top: ${position === 'right-start' ? '16px' : position === 'right-end' ? 'auto' : '50%'};
        bottom: ${position === 'right-end' ? '16px' : 'auto'};
        transform: ${position === 'right' ? 'translateY(-50%)' : 'none'};
        border-width: ${arrowSize}px ${arrowSize}px ${arrowSize}px 0;
        border-right-color: ${({ theme }) => theme.colors.surface};
      `;
    default:
      return '';
  };

interface PopoverContentProps {
  $isOpen: boolean;
  $position: PopoverPosition;
  $hasArrow: boolean;
  $arrowSize: number;
  $maxWidth?: string;
  $minWidth?: string;
  $customStyles?: string;
}

export const PopoverContent = styled.div<PopoverContentProps>`
  position: absolute;
  z-index: ${({ theme }) => theme.zIndex.popover};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.large};
  padding: ${({ theme }) => theme.spacing.medium};
  min-width: ${({ $minWidth }) => $minWidth || '200px'};
  max-width: ${({ $maxWidth }) => $maxWidth || '400px'};
  animation: ${({ $isOpen }) => ($isOpen ? fadeIn : fadeOut)} 0.2s ease-in-out;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  pointer-events: ${({ $isOpen }) => ($isOpen ? 'auto' : 'none')};
  
  ${({ $position }) => getPositionStyles($position)}
  
  ${({ $hasArrow, $position, $arrowSize }) =>
    $hasArrow &&
    css`
      &::before {
        ${getArrowStyles($position, $arrowSize)}
    `}
  
  ${({ $customStyles }) => $customStyles && css`${$customStyles}`}
`;

export const PopoverHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.small};
  padding-bottom: ${({ theme }) => theme.spacing.small};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const PopoverTitle = styled.h4`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.sizes.medium};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const PopoverCloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: none;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.hover};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

export const PopoverBody = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.small};
  line-height: ${({ theme }) => theme.typography.lineHeights.normal};
`;

export const PopoverOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${({ theme }) => theme.zIndex.overlay};
  background-color: rgba(0, 0, 0, 0.3);
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  pointer-events: ${({ $isOpen }) => ($isOpen ? 'auto' : 'none')};
  transition: opacity 0.2s ease-in-out;
`;

export const PopoverActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.small};
  margin-top: ${({ theme }) => theme.spacing.medium};
  padding-top: ${({ theme }) => theme.spacing.medium};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

export const PopoverLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  font-size: ${({ theme }) => theme.typography.sizes.small};
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryDark};
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    border-radius: ${({ theme }) => theme.borderRadius.small};
  }
`;

export const PopoverDivider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
  margin: ${({ theme }) => theme.spacing.medium} 0;
`;

export const PopoverList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const PopoverListItem = styled.li`
  padding: ${({ theme }) => theme.spacing.small} 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

}
}
}
