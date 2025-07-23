import styled, { css } from 'styled-components';
import { CheckboxProps } from './Checkbox.types';

export const CheckboxWrapper = styled.div<{ disabled?: boolean; inline?: boolean }>`
  display: ${({ inline }) => (inline ? 'inline-flex' : 'flex')};
  align-items: center;
  position: relative;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  user-select: none;
  margin-bottom: ${({ inline }) => (inline ? '0' : '0.5rem')};
  margin-right: ${({ inline }) => (inline ? '1rem' : '0')};
`;

export const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  position: absolute;
  opacity: 0;
  cursor: inherit;
  height: 0;
  width: 0;
`;

const checkboxSizes = {
  small: css`
    width: 16px;
    height: 16px;
  `,
  medium: css`
    width: 20px;
    height: 20px;
  `,
  large: css`
    width: 24px;
    height: 24px;
  `,
};

const checkmarkSizes = {
  small: css`
    left: 5px;
    top: 2px;
    width: 4px;
    height: 8px;
  `,
  medium: css`
    left: 7px;
    top: 3px;
    width: 5px;
    height: 10px;
  `,
  large: css`
    left: 8px;
    top: 4px;
    width: 6px;
    height: 12px;
  `,
};

export const StyledCheckbox = styled.div<{
  checked?: boolean;
  disabled?: boolean;
  variant?: CheckboxProps['variant'];
  size?: CheckboxProps['size'];
  hasError?: boolean;
  indeterminate?: boolean;
}>`
  ${({ size = 'medium' }) => checkboxSizes[size]}
  border: 2px solid ${({ theme, hasError, checked, variant }) => {
    if (hasError) return theme.colors.error;
    if (checked && variant === 'primary') return theme.colors.primary;
    if (checked && variant === 'secondary') return theme.colors.secondary;
    return theme.colors.gray[400];
  }};
  border-radius: 4px;
  background-color: ${({ theme, checked, disabled, variant }) => {
    if (disabled && checked) return theme.colors.gray[300];
    if (checked && variant === 'primary') return theme.colors.primary;
    if (checked && variant === 'secondary') return theme.colors.secondary;
    if (checked) return theme.colors.primary;
    return 'transparent';
  }};
  transition: all 0.2s ease-in-out;
  position: relative;
  flex-shrink: 0;

  ${({ disabled, theme }) =>
    disabled &&
    css`
      opacity: 0.6;
      background-color: ${theme.colors.gray[100]};
    `}

  &:hover {
    border-color: ${({ theme, checked, disabled, hasError, variant }) => {
      if (disabled || hasError) return undefined;
      if (checked && variant === 'primary') return theme.colors.primaryDark;
      if (checked && variant === 'secondary') return theme.colors.secondaryDark;
      return theme.colors.gray[500];
    }};
    background-color: ${({ theme, checked, disabled, variant }) => {
      if (disabled) return undefined;
      if (checked && variant === 'primary') return theme.colors.primaryDark;
      if (checked && variant === 'secondary') return theme.colors.secondaryDark;
      if (checked) return theme.colors.primaryDark;
      return theme.colors.gray[50];
    }};
  }

  &:focus-within {
    box-shadow: 0 0 0 3px ${({ theme, variant }) => 
      variant === 'secondary' ? theme.colors.secondaryLight : theme.colors.primaryLight
    };
  }

  /* Checkmark */
  &::after {
    content: '';
    position: absolute;
    display: ${({ checked, indeterminate }) => (checked || indeterminate ? 'block' : 'none')};
    ${({ size = 'medium' }) => checkmarkSizes[size]}
    border: solid ${({ theme }) => theme.colors.white};
    border-width: 0 2px 2px 0;
    transform: ${({ indeterminate }) => (indeterminate ? 'rotate(0deg) scale(0.7)' : 'rotate(45deg)')};
    
    ${({ indeterminate }) =>
      indeterminate &&
      css`
        width: 12px;
        height: 2px;
        border-width: 0 0 2px 0;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      `}
`;

export const Label = styled.label<{
  disabled?: boolean;
  size?: CheckboxProps['size'];
}>`
  margin-left: 0.5rem;
  color: ${({ theme, disabled }) => (disabled ? theme.colors.gray[500] : theme.colors.text)};
  font-size: ${({ size = 'medium', theme }) => {
    switch (size) {
      case 'small':
        return theme.typography.body2.fontSize;
      case 'large':
        return theme.typography.body1.fontSize;
      default:
        return theme.typography.body2.fontSize;
    }};
  line-height: 1.5;
  cursor: inherit;
`;

export const ErrorMessage = styled.span`
  display: block;
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  margin-top: 0.25rem;
  margin-left: 1.75rem;
`;

export const HelperText = styled.span`
  display: block;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  margin-top: 0.25rem;
  margin-left: 1.75rem;
`;

export const CheckboxGroup = styled.div<{ inline?: boolean }>`
  display: flex;
  flex-direction: ${({ inline }) => (inline ? 'row' : 'column')};
  gap: ${({ inline }) => (inline ? '1rem' : '0.5rem')};
  flex-wrap: ${({ inline }) => (inline ? 'wrap' : 'nowrap')};
`;

export const CheckboxGroupLabel = styled.div`
  font-weight: ${({ theme }) => theme.typography.subtitle2.fontWeight};
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
`;

}
}
