import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

export const DatePickerContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const DatePickerInput = styled.input<{ hasError?: boolean; isFocused?: boolean }>`
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 2px solid ${({ theme, hasError, isFocused }) =>
    hasError
      ? theme.colors.error
      : isFocused
      ? theme.colors.primary
      : theme.colors.border};
  border-radius: 8px;
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.body};
  color: ${({ theme }) => theme.colors.text.primary};
  background-color: ${({ theme }) => theme.colors.background.paper};
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme, hasError }) =>
      hasError ? theme.colors.error : theme.colors.primary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme, hasError }) =>
      hasError ? theme.colors.error : theme.colors.primary};
    box-shadow: 0 0 0 3px
      ${({ theme, hasError }) =>
        hasError
          ? `${theme.colors.error}20`
          : `${theme.colors.primary}20`};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.background.disabled};
    color: ${({ theme }) => theme.colors.text.disabled};
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

export const CalendarIcon = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  padding: 4px;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }

  &:focus {
    outline: none;
    color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.text.disabled};
    cursor: not-allowed;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const CalendarDropdown = styled(motion.div)`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 1000;
  background-color: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadows.large};
  padding: 16px;
  min-width: 320px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    min-width: 280px;
    padding: 12px;
  }
`;

export const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const CalendarTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const NavigationButton = styled.button`
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.secondary};
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.hover};
    color: ${({ theme }) => theme.colors.primary};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.primary}40`};
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.text.disabled};
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
`;

export const DayLabel = styled.div`
  padding: 8px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
`;

export const DayButton = styled.button<{
  isSelected?: boolean;
  isToday?: boolean;
  isDisabled?: boolean;
  isOutsideMonth?: boolean;
  isInRange?: boolean;
  isRangeStart?: boolean;
  isRangeEnd?: boolean;
}>`
  padding: 8px;
  min-height: 36px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  border-radius: 6px;
  position: relative;
  transition: all 0.2s ease;
  color: ${({ theme, isOutsideMonth, isDisabled }) =>
    isDisabled
      ? theme.colors.text.disabled
      : isOutsideMonth
      ? theme.colors.text.tertiary
      : theme.colors.text.primary};

  ${({ isInRange, theme }) =>
    isInRange &&
    css`
      background-color: ${theme.colors.primary}10;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -2px;
        right: -2px;
        bottom: 0;
        background-color: ${theme.colors.primary}10;
        z-index: -1;
      }
    `}

  ${({ isRangeStart }) =>
    isRangeStart &&
    css`
      &::before {
        left: 50%;
        border-top-left-radius: 6px;
        border-bottom-left-radius: 6px;
      }
    `}

  ${({ isRangeEnd }) =>
    isRangeEnd &&
    css`
      &::before {
        right: 50%;
        border-top-right-radius: 6px;
        border-bottom-right-radius: 6px;
      }
    `}

  ${({ isToday, theme }) =>
    isToday &&
    css`
      font-weight: 600;
      color: ${theme.colors.primary};
    `}

  ${({ isSelected, theme }) =>
    isSelected &&
    css`
      background-color: ${theme.colors.primary};
      color: white;
      font-weight: 600;

      &:hover {
        background-color: ${theme.colors.primary};
      }
    `}

  &:hover {
    background-color: ${({ theme, isDisabled, isSelected }) =>
      isDisabled
        ? 'transparent'
        : isSelected
        ? theme.colors.primary
        : theme.colors.background.hover};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.primary}40`};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export const MonthYearSelector = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

export const SelectorButton = styled.button`
  flex: 1;
  padding: 8px 12px;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.hover};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}20`};
  }

  svg {
    width: 16px;
    height: 16px;
    margin-left: 8px;
  }
`;

export const SelectorDropdown = styled(motion.div)`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 1001;
  background-color: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  max-height: 240px;
  overflow-y: auto;
`;

export const SelectorOption = styled.button<{ isSelected?: boolean }>`
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  text-align: left;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ isSelected, theme }) =>
    isSelected &&
    css`
      background-color: ${theme.colors.primary}10;
      color: ${theme.colors.primary};
      font-weight: 600;
    `}

  &:hover {
    background-color: ${({ theme, isSelected }) =>
      isSelected
        ? `${theme.colors.primary}10`
        : theme.colors.background.hover};
  }

  &:focus {
    outline: none;
    background-color: ${({ theme }) => theme.colors.background.hover};
  }
`;

export const PresetButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  flex-wrap: wrap;
`;

export const PresetButton = styled.button`
  padding: 6px 12px;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 20px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
    color: white;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.primary}40`};
  }
`;

export const TimeSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

export const TimeInput = styled.input`
  width: 60px;
  padding: 6px 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.primary};
  background-color: ${({ theme }) => theme.colors.background.paper};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}20`};
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

export const TimeSeparator = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const ErrorMessage = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.col
}