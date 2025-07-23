import styled from '@emotion/styled';
import { css } from '@emotion/react';

interface SliderContainerProps {
  disabled?: boolean;
}

interface SliderTrackProps {
  disabled?: boolean;
}

interface SliderRailProps {
  disabled?: boolean;
}

interface SliderThumbProps {
  isDragging?: boolean;
  disabled?: boolean;
  value: number;
  min: number;
  max: number;
}

interface SliderMarkProps {
  active?: boolean;
  disabled?: boolean;
}

interface SliderLabelProps {
  active?: boolean;
  disabled?: boolean;
}

export const SliderContainer = styled.div<SliderContainerProps>`
  position: relative;
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  user-select: none;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
  
  ${({ disabled }) => disabled && css`
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  `}
`;

export const SliderRail = styled.div<SliderRailProps>`
  position: absolute;
  width: 100%;
  height: 4px;
  background-color: ${({ theme }) => theme.colors?.gray[300] || '#e2e8f0'};
  border-radius: 2px;
  cursor: pointer;
  
  ${({ disabled }) => disabled && css`
    background-color: ${({ theme }) => theme.colors?.gray[200] || '#f7fafc'};
    cursor: not-allowed;
  `}
`;

export const SliderTrack = styled.div<SliderTrackProps>`
  position: absolute;
  height: 4px;
  background-color: ${({ theme }) => theme.colors?.primary[500] || '#3182ce'};
  border-radius: 2px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  ${({ disabled }) => disabled && css`
    background-color: ${({ theme }) => theme.colors?.gray[400] || '#cbd5e0'};
    cursor: not-allowed;
  `}
  
  &:hover {
    ${({ disabled }) => !disabled && css`
      background-color: ${({ theme }) => theme.colors?.primary[600] || '#2b6cb0'};
    `}
`;

export const SliderThumb = styled.div<SliderThumbProps>`
  position: absolute;
  width: 20px;
  height: 20px;
  background-color: ${({ theme }) => theme.colors?.white || '#ffffff'};
  border: 2px solid ${({ theme }) => theme.colors?.primary[500] || '#3182ce'};
  border-radius: 50%;
  cursor: grab;
  transform: translate(-50%, -50%);
  top: 50%;
  left: ${({ value, min, max }) => `${((value - min) / (max - min)) * 100}%`};
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  
  &:hover {
    ${({ disabled }) => !disabled && css`
      width: 24px;
      height: 24px;
      border-color: ${({ theme }) => theme.colors?.primary[600] || '#2b6cb0'};
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    `}
  
  &:focus {
    outline: none;
    ${({ disabled }) => !disabled && css`
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors?.primary[100] || '#dbeafe'};
    `}
  
  ${({ isDragging, disabled }) => isDragging && !disabled && css`
    cursor: grabbing;
    width: 24px;
    height: 24px;
    border-color: ${({ theme }) => theme.colors?.primary[600] || '#2b6cb0'};
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  `}
  
  ${({ disabled }) => disabled && css`
    background-color: ${({ theme }) => theme.colors?.gray[100] || '#f7fafc'};
    border-color: ${({ theme }) => theme.colors?.gray[400] || '#cbd5e0'};
    cursor: not-allowed;
  `}
`;

export const SliderMarkContainer = styled.div`
  position: absolute;
  width: 100%;
  top: 50%;
  transform: translateY(-50%);
`;

export const SliderMark = styled.div<SliderMarkProps>`
  position: absolute;
  width: 2px;
  height: 8px;
  background-color: ${({ active, theme }) => 
    active ? theme.colors?.primary[500] || '#3182ce' : theme.colors?.gray[400] || '#cbd5e0'};
  transform: translate(-50%, -50%);
  top: 50%;
  transition: background-color 0.2s ease;
  
  ${({ disabled }) => disabled && css`
    background-color: ${({ theme }) => theme.colors?.gray[300] || '#e2e8f0'};
  `}
`;

export const SliderLabelContainer = styled.div`
  position: absolute;
  width: 100%;
  top: 100%;
  margin-top: 8px;
`;

export const SliderLabel = styled.span<SliderLabelProps>`
  position: absolute;
  font-size: 12px;
  color: ${({ active, theme }) => 
    active ? theme.colors?.gray[700] || '#4a5568' : theme.colors?.gray[500] || '#a0aec0'};
  transform: translateX(-50%);
  white-space: nowrap;
  user-select: none;
  transition: color 0.2s ease;
  
  ${({ disabled }) => disabled && css`
    color: ${({ theme }) => theme.colors?.gray[400] || '#cbd5e0'};
  `}
`;

export const SliderTooltip = styled.div<{ visible: boolean }>`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-8px);
  background-color: ${({ theme }) => theme.colors?.gray[800] || '#2d3748'};
  color: ${({ theme }) => theme.colors?.white || '#ffffff'};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  opacity: ${({ visible }) => visible ? 1 : 0};
  transition: opacity 0.2s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 4px 4px 0 4px;
    border-color: ${({ theme }) => theme.colors?.gray[800] || '#2d3748'} transparent transparent transparent;
  }
`;

export const SliderInput = styled.input`
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  pointer-events: none;
`;

export const SliderValueDisplay = styled.div`
  position: absolute;
  top: -32px;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${({ theme }) => theme.colors?.primary[500] || '#3182ce'};
  color: ${({ theme }) => theme.colors?.white || '#ffffff'};
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 4px 4px 0 4px;
    border-color: ${({ theme }) => theme.colors?.primary[500] || '#3182ce'} transparent transparent transparent;
  }
`;

export const RangeSliderThumbContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
`;

export const SliderWrapper = styled.div`
  width: 100%;
  padding: 20px 10px 40px;
  
  @media (max-width: 768px) {
    padding: 20px 5px 40px;
  }
`;

}
}
}
