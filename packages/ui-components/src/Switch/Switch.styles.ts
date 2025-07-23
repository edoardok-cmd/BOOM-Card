import styled, { css } from 'styled-components';

export interface SwitchStyleProps {
  checked?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
}

const sizeVariants = {
  small: {
    width: '32px',
    height: '16px',
    thumbSize: '12px',
    thumbTranslate: '16px',
  },
  medium: {
    width: '48px',
    height: '24px',
    thumbSize: '20px',
    thumbTranslate: '24px',
  },
  large: {
    width: '64px',
    height: '32px',
    thumbSize: '28px',
    thumbTranslate: '32px',
  },
};

const colorVariants = {
  primary: '#FF6B35',
  secondary: '#2C3E50',
  success: '#27AE60',
  error: '#E74C3C',
  warning: '#F39C12',
};

export const SwitchContainer = styled.label`
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  position: relative;
  
  &[data-disabled='true'] {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const SwitchInput = styled.input.attrs({ type: 'checkbox' })`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  
  &:focus-visible + span {
    outline: 2px solid ${({ theme }) => theme.colors?.primary || '#FF6B35'};
    outline-offset: 2px;
  }
`;

export const SwitchTrack = styled.span<SwitchStyleProps>`
  position: relative;
  display: inline-block;
  width: ${({ size = 'medium' }) => sizeVariants[size].width};
  height: ${({ size = 'medium' }) => sizeVariants[size].height};
  background-color: ${({ checked, color = 'primary', theme }) =>
    checked
      ? theme.colors?.[color] || colorVariants[color]
      : theme.colors?.gray300 || '#CBD5E0'};
  border-radius: 999px;
  transition: background-color 0.2s ease-in-out;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  
  ${({ disabled }) =>
    disabled &&
    css`
      background-color: ${({ theme }) => theme.colors?.gray200 || '#E2E8F0'};
    `}
  
  &:hover {
    ${({ disabled, checked, color = 'primary', theme }) =>
      !disabled &&
      css`
        background-color: ${checked
          ? `${theme.colors?.[color] || colorVariants[color]}dd`
          : theme.colors?.gray400 || '#A0AEC0'};
      `}
`;

export const SwitchThumb = styled.span<SwitchStyleProps>`
  position: absolute;
  top: 50%;
  left: 2px;
  transform: translateY(-50%)
    ${({ checked, size = 'medium' }) =>
      checked ? `translateX(${sizeVariants[size].thumbTranslate})` : 'translateX(0)'};
  width: ${({ size = 'medium' }) => sizeVariants[size].thumbSize};
  height: ${({ size = 'medium' }) => sizeVariants[size].thumbSize};
  background-color: ${({ theme }) => theme.colors?.white || '#FFFFFF'};
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease-in-out;
  
  ${({ disabled }) =>
    disabled &&
    css`
      background-color: ${({ theme }) => theme.colors?.gray100 || '#F7FAFC'};
    `}
`;

export const SwitchLabel = styled.span<{ position?: 'left' | 'right' }>`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors?.text || '#2C3E50'};
  margin-left: ${({ position }) => (position === 'left' ? '0' : '8px')};
  margin-right: ${({ position }) => (position === 'left' ? '8px' : '0')};
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

export const SwitchWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

export const SwitchGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const SwitchGroupLabel = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text || '#2C3E50'};
  margin-bottom: 8px;
`;

export const SwitchDescription = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors?.textSecondary || '#718096'};
  margin-top: 4px;
  line-height: 1.4;
`;

export const SwitchError = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors?.error || '#E74C3C'};
  margin-top: 4px;
  display: block;
`;

// Additional styled components for enhanced functionality
export const SwitchIcon = styled.span<{ checked?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: ${({ theme }) => theme.colors?.white || '#FFFFFF'};
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: ${({ checked }) => (checked ? '4px' : 'auto')};
  right: ${({ checked }) => (checked ? 'auto' : '4px')};
  opacity: ${({ checked }) => (checked ? 0 : 1)};
  transition: opacity 0.2s ease-in-out;
`;

export const SwitchLoadingSpinner = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  border: 2px solid ${({ theme }) => theme.colors?.white || '#FFFFFF'};
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  
  @keyframes spin {
    to {
      transform: translate(-50%, -50%) rotate(360deg);
    }
`;

}
}
