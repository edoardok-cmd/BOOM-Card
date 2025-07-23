import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

interface TimePickerContainerProps {
  isOpen?: boolean;
  hasError?: boolean;
  isDisabled?: boolean;
  isFocused?: boolean;
}

interface TimeSlotProps {
  isSelected?: boolean;
  isDisabled?: boolean;
  isCurrentTime?: boolean;
}

interface TimePickerDropdownProps {
  position?: 'top' | 'bottom';
  maxHeight?: number;
}

export const TimePickerContainer = styled.div<TimePickerContainerProps>`
  position: relative;
  width: 100%;
  font-family: ${({ theme }) => theme.fonts.primary};
`;

export const TimePickerInput = styled.div<TimePickerContainerProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.background.paper};
  border: 2px solid ${({ theme, hasError, isFocused }) =>
    hasError
      ? theme.colors.error.main
      : isFocused
      ? theme.colors.primary.main
      : theme.colors.border.main};
  border-radius: 12px;
  cursor: ${({ isDisabled }) => (isDisabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  min-height: 48px;

  ${({ isDisabled, theme }) =>
    isDisabled &&
    css`
      background: ${theme.colors.background.disabled};
      opacity: 0.6;
      pointer-events: none;
    `}

  &:hover {
    ${({ isDisabled, theme }) =>
      !isDisabled &&
      css`
        border-color: ${theme.colors.primary.main};
        background: ${theme.colors.background.hover};
      `}

  ${({ isOpen, theme }) =>
    isOpen &&
    css`
      border-color: ${theme.colors.primary.main};
      box-shadow: 0 0 0 3px ${theme.colors.primary.light}33;
    `}
`;

export const TimePickerValue = styled.span<{ hasValue: boolean }>`
  flex: 1;
  color: ${({ theme, hasValue }) =>
    hasValue ? theme.colors.text.primary : theme.colors.text.secondary};
  font-size: 16px;
  font-weight: ${({ hasValue }) => (hasValue ? 500 : 400)};
  user-select: none;
`;

export const TimePickerIcon = styled.div<{ isOpen?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: transform 0.2s ease;

  ${({ isOpen }) =>
    isOpen &&
    css`
      transform: rotate(180deg);
    `}

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const TimePickerDropdown = styled(motion.div)<TimePickerDropdownProps>`
  position: absolute;
  ${({ position }) => (position === 'top' ? 'bottom: 100%' : 'top: 100%')};
  left: 0;
  right: 0;
  margin-top: ${({ position }) => (position === 'top' ? '-8px' : '8px')};
  margin-bottom: ${({ position }) => (position === 'top' ? '8px' : '-8px')};
  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadows.dropdown};
  z-index: 1000;
  overflow: hidden;
`;

export const TimePickerContent = styled.div`
  display: flex;
  height: 280px;
`;

export const TimeColumn = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background.default};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.main};
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.border.dark};
  }

  &:not(:last-child) {
    border-right: 1px solid ${({ theme }) => theme.colors.border.light};
  }
`;

export const TimeColumnHeader = styled.div`
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  position: sticky;
  top: 0;
  background: ${({ theme }) => theme.colors.background.paper};
  z-index: 1;
`;

export const TimeSlot = styled.button<TimeSlotProps>`
  width: 100%;
  padding: 10px 12px;
  margin: 2px 0;
  background: ${({ theme, isSelected, isCurrentTime }) =>
    isSelected
      ? theme.colors.primary.main
      : isCurrentTime
      ? theme.colors.primary.light + '20'
      : 'transparent'};
  color: ${({ theme, isSelected, isDisabled }) =>
    isSelected
      ? theme.colors.common.white
      : isDisabled
      ? theme.colors.text.disabled
      : theme.colors.text.primary};
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: ${({ isSelected }) => (isSelected ? 600 : 400)};
  cursor: ${({ isDisabled }) => (isDisabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  text-align: center;
  position: relative;

  ${({ isDisabled }) =>
    isDisabled &&
    css`
      opacity: 0.4;
      pointer-events: none;
    `}

  ${({ isCurrentTime, theme }) =>
    isCurrentTime &&
    css`
      &::after {
        content: '';
        position: absolute;
        left: 4px;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: ${theme.colors.primary.main};
      }
    `}

  &:hover {
    ${({ isDisabled, isSelected, theme }) =>
      !isDisabled &&
      !isSelected &&
      css`
        background: ${theme.colors.background.hover};
      `}

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: 2px;
  }
`;

export const QuickSelectContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
  background: ${({ theme }) => theme.colors.background.default};
`;

export const QuickSelectButton = styled.button`
  padding: 6px 12px;
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary.main};
    color: ${({ theme }) => theme.colors.common.white};
    border-color: ${({ theme }) => theme.colors.primary.main};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: 2px;
  }
`;

export const TimePickerLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const TimePickerError = styled.span`
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.error.main};
`;

export const TimePickerHelperText = styled.span`
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const ClearButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  margin-left: 8px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background.hover};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: 2px;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const TimeZoneIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  padding: 2px 8px;
  background: ${({ theme }) => theme.colors.background.default};
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const TimePickerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
`;

}
}
