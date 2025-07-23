import styled, { css } from 'styled-components';
import { BadgeProps } from './Badge.types';

const sizeStyles = {
  small: css`
    padding: 0.125rem 0.375rem;
    font-size: 0.75rem;
    line-height: 1rem;
  `,
  medium: css`
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
  `,
  large: css`
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5rem;
  `,
};

const variantStyles = {
  primary: css`
    background-color: var(--color-primary-100);
    color: var(--color-primary-700);
    border: 1px solid var(--color-primary-200);
  `,
  secondary: css`
    background-color: var(--color-secondary-100);
    color: var(--color-secondary-700);
    border: 1px solid var(--color-secondary-200);
  `,
  success: css`
    background-color: var(--color-success-100);
    color: var(--color-success-700);
    border: 1px solid var(--color-success-200);
  `,
  warning: css`
    background-color: var(--color-warning-100);
    color: var(--color-warning-700);
    border: 1px solid var(--color-warning-200);
  `,
  danger: css`
    background-color: var(--color-danger-100);
    color: var(--color-danger-700);
    border: 1px solid var(--color-danger-200);
  `,
  info: css`
    background-color: var(--color-info-100);
    color: var(--color-info-700);
    border: 1px solid var(--color-info-200);
  `,
  neutral: css`
    background-color: var(--color-gray-100);
    color: var(--color-gray-700);
    border: 1px solid var(--color-gray-200);
  `,
  discount: css`
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
    color: white;
    border: none;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(238, 90, 111, 0.2);
  `,
  new: css`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
  `,
  trending: css`
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    border: none;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(245, 87, 108, 0.2);
  `,
  vip: css`
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    color: #333;
    border: none;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
  `,
  partner: css`
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: white;
    border: none;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(79, 172, 254, 0.2);
  `,
};

const outlineVariantStyles = {
  primary: css`
    background-color: transparent;
    color: var(--color-primary-600);
    border: 1px solid var(--color-primary-600);
  `,
  secondary: css`
    background-color: transparent;
    color: var(--color-secondary-600);
    border: 1px solid var(--color-secondary-600);
  `,
  success: css`
    background-color: transparent;
    color: var(--color-success-600);
    border: 1px solid var(--color-success-600);
  `,
  warning: css`
    background-color: transparent;
    color: var(--color-warning-600);
    border: 1px solid var(--color-warning-600);
  `,
  danger: css`
    background-color: transparent;
    color: var(--color-danger-600);
    border: 1px solid var(--color-danger-600);
  `,
  info: css`
    background-color: transparent;
    color: var(--color-info-600);
    border: 1px solid var(--color-info-600);
  `,
  neutral: css`
    background-color: transparent;
    color: var(--color-gray-600);
    border: 1px solid var(--color-gray-600);
  `,
  discount: css`
    background-color: transparent;
    color: #ff6b6b;
    border: 2px solid #ff6b6b;
  `,
  new: css`
    background-color: transparent;
    color: #667eea;
    border: 2px solid #667eea;
  `,
  trending: css`
    background-color: transparent;
    color: #f5576c;
    border: 2px solid #f5576c;
  `,
  vip: css`
    background-color: transparent;
    color: #d4af37;
    border: 2px solid #d4af37;
  `,
  partner: css`
    background-color: transparent;
    color: #4facfe;
    border: 2px solid #4facfe;
  `,
};

export const StyledBadge = styled.span<BadgeProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border-radius: ${({ rounded }) => (rounded ? '9999px' : '0.375rem')};
  white-space: nowrap;
  vertical-align: middle;
  transition: all 0.2s ease-in-out;
  position: relative;
  overflow: hidden;
  font-family: var(--font-family-base);

  /* Size styles */
  ${({ size = 'medium' }) => sizeStyles[size]}

  /* Variant styles */
  ${({ variant = 'primary', outline }) =>
    outline ? outlineVariantStyles[variant] : variantStyles[variant]}

  /* Uppercase styling */
  ${({ uppercase }) =>
    uppercase &&
    css`
      text-transform: uppercase;
      letter-spacing: 0.05em;
    `}

  /* Icon support */
  ${({ hasIcon }) =>
    hasIcon &&
    css`
      gap: 0.25rem;
    `}

  /* Clickable state */
  ${({ onClick }) =>
    onClick &&
    css`
      cursor: pointer;
      user-select: none;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      &:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
    `}

  /* Animation for special badges */
  ${({ variant, animate }) =>
    animate &&
    (variant === 'new' || variant === 'trending' || variant === 'vip') &&
    css`
      &::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: inherit;
        filter: blur(8px);
        opacity: 0.5;
        z-index: -1;
        animation: pulse 2s ease-in-out infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 0.5;
          transform: scale(1);
        }
        50% {
          opacity: 0.8;
          transform: scale(1.05);
        }
    `}

  /* Discount percentage specific styling */
  ${({ variant, children }) =>
    variant === 'discount' &&
    typeof children === 'string' &&
    children.includes('%') &&
    css`
      min-width: 3rem;
      font-weight: 700;
    `}

  /* RTL support */
  [dir='rtl'] & {
    direction: rtl;
  }

  /* Accessibility */
  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    ${({ variant, outline }) => {
      if (outline) return null;
      
      switch (variant) {
        case 'primary':
          return css`
            background-color: var(--color-primary-800);
            color: var(--color-primary-100);
            border-color: var(--color-primary-700);
          `;
        case 'secondary':
          return css`
            background-color: var(--color-secondary-800);
            color: var(--color-secondary-100);
            border-color: var(--color-secondary-700);
          `;
        case 'success':
          return css`
            background-color: var(--color-success-800);
            color: var(--color-success-100);
            border-color: var(--color-success-700);
          `;
        case 'warning':
          return css`
            background-color: var(--color-warning-800);
            color: var(--color-warning-100);
            border-color: var(--color-warning-700);
          `;
        case 'danger':
          return css`
            background-color: var(--color-danger-800);
            color: var(--color-danger-100);
            border-color: var(--color-danger-700);
          `;
        case 'info':
          return css`
            background-color: var(--color-info-800);
            color: var(--color-info-100);
            border-color: var(--color-info-700);
          `;
        case 'neutral':
          return css`
            background-color: var(--color-gray-800);
            color: var(--color-gray-100);
            border-color: var(--color-gray-700);
          `;
        default:
          return null;
      }}

  /* Print styles */
  @media print {
    ${({ variant }) =>
      (variant === 'discount' || 
       variant === 'new' || 
       variant === 'trending' || 
       variant === 'vip' || 
       variant === 'partner') &&
      css`
        background: none !important;
        color: black !important;
        border: 1px solid black !important;
      `}
`;

export const BadgeIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

export const BadgeContent = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
`;

export const BadgeGroup = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
`;

}
}
}
}
