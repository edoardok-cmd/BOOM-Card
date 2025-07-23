import styled, { css } from 'styled-components';
import { RadioProps } from './Radio.types';

export const RadioWrapper = styled.div<{ disabled?: boolean; error?: boolean }>`
  display: inline-flex;
  align-items: flex-start;
  position: relative;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  user-select: none;
  transition: all 0.2s ease;

  &:hover {
    ${({ disabled }) =>
      !disabled &&
      css`
        .radio-input {
          border-color: var(--boom-color-primary-hover, #ff4757);
          box-shadow: 0 0 0 3px rgba(255, 71, 87, 0.1);
        }
      `}

  ${({ error }) =>
    error &&
    css`
      .radio-input {
        border-color: var(--boom-color-error, #e74c3c);
      }
    `}
`;

export const RadioInput = styled.input`
  position: absolute;
  opacity: 0;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  height: 0;
  width: 0;

  &:checked ~ .radio-input {
    border-color: var(--boom-color-primary, #ff6b6b);
    background-color: var(--boom-color-primary, #ff6b6b);

    &::after {
      transform: scale(1);
      opacity: 1;
    }

  &:focus-visible ~ .radio-input {
    outline: 2px solid var(--boom-color-primary, #ff6b6b);
    outline-offset: 2px;
  }

  &:disabled ~ .radio-input {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:disabled ~ .radio-label {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const sizeStyles = {
  small: css`
    width: 16px;
    height: 16px;

    &::after {
      width: 6px;
      height: 6px;
    }
  `,
  medium: css`
    width: 20px;
    height: 20px;

    &::after {
      width: 8px;
      height: 8px;
    }
  `,
  large: css`
    width: 24px;
    height: 24px;

    &::after {
      width: 10px;
      height: 10px;
    }
  `,
};

export const RadioVisual = styled.span<{ size?: RadioProps['size'] }>`
  display: inline-block;
  position: relative;
  flex-shrink: 0;
  border-radius: 50%;
  border: 2px solid var(--boom-color-border, #e0e0e0);
  background-color: var(--boom-color-background, #ffffff);
  transition: all 0.2s ease;
  margin-top: 2px;

  ${({ size = 'medium' }) => sizeStyles[size]}

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    border-radius: 50%;
    background-color: var(--boom-color-white, #ffffff);
    opacity: 0;
    transition: all 0.2s ease;
  }
`;

export const RadioLabel = styled.span<{ size?: RadioProps['size'] }>`
  display: inline-block;
  margin-left: 8px;
  color: var(--boom-color-text-primary, #2c3e50);
  transition: color 0.2s ease;

  ${({ size }) => {
    switch (size) {
      case 'small':
        return css`
          font-size: 14px;
          line-height: 20px;
        `;
      case 'large':
        return css`
          font-size: 18px;
          line-height: 24px;
        `;
      default:
        return css`
          font-size: 16px;
          line-height: 22px;
        `;
    }}
`;

export const RadioGroup = styled.div<{ direction?: 'horizontal' | 'vertical'; gap?: number }>`
  display: flex;
  flex-direction: ${({ direction = 'vertical' }) =>
    direction === 'horizontal' ? 'row' : 'column'};
  gap: ${({ gap = 12 }) => `${gap}px`};
  flex-wrap: ${({ direction }) => (direction === 'horizontal' ? 'wrap' : 'nowrap')};
`;

export const RadioGroupLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--boom-color-text-secondary, #718096);
`;

export const RadioHelperText = styled.span<{ error?: boolean }>`
  display: block;
  margin-top: 4px;
  margin-left: 28px;
  font-size: 14px;
  line-height: 20px;
  color: ${({ error }) =>
    error ? 'var(--boom-color-error, #e74c3c)' : 'var(--boom-color-text-muted, #a0aec0)'};
  transition: color 0.2s ease;
`;

export const RadioContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

// Custom styled radio for different variants
export const RadioVariants = {
  primary: css`
    &:checked ~ .radio-input {
      border-color: var(--boom-color-primary, #ff6b6b);
      background-color: var(--boom-color-primary, #ff6b6b);
    }
  `,
  secondary: css`
    &:checked ~ .radio-input {
      border-color: var(--boom-color-secondary, #4ecdc4);
      background-color: var(--boom-color-secondary, #4ecdc4);
    }
  `,
  success: css`
    &:checked ~ .radio-input {
      border-color: var(--boom-color-success, #2ecc71);
      background-color: var(--boom-color-success, #2ecc71);
    }
  `,
  warning: css`
    &:checked ~ .radio-input {
      border-color: var(--boom-color-warning, #f39c12);
      background-color: var(--boom-color-warning, #f39c12);
    }
  `,
  danger: css`
    &:checked ~ .radio-input {
      border-color: var(--boom-color-danger, #e74c3c);
      background-color: var(--boom-color-danger, #e74c3c);
    }
  `,
};

// Animation for radio selection
export const RadioAnimation = styled.div`
  @keyframes radioSelect {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }

  .radio-input::after {
    animation: radioSelect 0.2s ease-out;
  }
`;

// Styled component for custom radio designs
export const CustomRadio = styled.div<{ variant?: string }>`
  ${({ variant = 'primary' }) => RadioVariants[variant as keyof typeof RadioVariants]}
`;

}
}
}
}
