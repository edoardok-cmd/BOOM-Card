import styled, { css } from 'styled-components';
import { AvatarSize, AvatarVariant } from './Avatar.types';

const sizeStyles = {
  xs: css`
    width: 24px;
    height: 24px;
    font-size: 10px;
  `,
  sm: css`
    width: 32px;
    height: 32px;
    font-size: 12px;
  `,
  md: css`
    width: 40px;
    height: 40px;
    font-size: 14px;
  `,
  lg: css`
    width: 56px;
    height: 56px;
    font-size: 20px;
  `,
  xl: css`
    width: 72px;
    height: 72px;
    font-size: 24px;
  `,
  xxl: css`
    width: 96px;
    height: 96px;
    font-size: 32px;
  `,
};

const variantStyles = {
  circular: css`
    border-radius: 50%;
  `,
  rounded: css`
    border-radius: ${({ theme }) => theme.borderRadius.lg};
  `,
  square: css`
    border-radius: 0;
  `,
};

export const StyledAvatarContainer = styled.div<{
  size: AvatarSize;
  variant: AvatarVariant;
  clickable?: boolean;
}>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  user-select: none;
  vertical-align: middle;
  background-color: ${({ theme }) => theme.colors.gray[200]};
  color: ${({ theme }) => theme.colors.gray[700]};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  transition: all ${({ theme }) => theme.transitions.normal};
  
  ${({ size }) => sizeStyles[size]}
  ${({ variant }) => variantStyles[variant]}
  
  ${({ clickable }) =>
    clickable &&
    css`
      cursor: pointer;
      
      &:hover {
        transform: scale(1.05);
        box-shadow: ${({ theme }) => theme.shadows.md};
      }
      
      &:active {
        transform: scale(0.98);
      }
    `}
  
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary[500]};
    outline-offset: 2px;
  }
`;

export const StyledAvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

export const StyledAvatarFallback = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  text-transform: uppercase;
  letter-spacing: 0.025em;
`;

export const StyledAvatarBadge = styled.div<{
  position: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  size: AvatarSize;
}>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  
  ${({ position }) => {
    const offset = '0';
    switch (position) {
      case 'top-right':
        return css`
          top: ${offset};
          right: ${offset};
        `;
      case 'bottom-right':
        return css`
          bottom: ${offset};
          right: ${offset};
        `;
      case 'top-left':
        return css`
          top: ${offset};
          left: ${offset};
        `;
      case 'bottom-left':
        return css`
          bottom: ${offset};
          left: ${offset};
        `;
    }}
  
  ${({ size }) => {
    const badgeSizes = {
      xs: css`
        width: 8px;
        height: 8px;
      `,
      sm: css`
        width: 10px;
        height: 10px;
      `,
      md: css`
        width: 12px;
        height: 12px;
      `,
      lg: css`
        width: 16px;
        height: 16px;
      `,
      xl: css`
        width: 20px;
        height: 20px;
      `,
      xxl: css`
        width: 24px;
        height: 24px;
      `,
    };
    return badgeSizes[size];
  }}
`;

export const StyledAvatarGroup = styled.div<{
  max?: number;
  spacing?: 'tight' | 'normal' | 'loose';
}>`
  display: inline-flex;
  align-items: center;
  
  ${StyledAvatarContainer} {
    border: 2px solid ${({ theme }) => theme.colors.white};
    
    &:not(:first-child) {
      margin-left: ${({ spacing }) => {
        switch (spacing) {
          case 'tight':
            return '-12px';
          case 'loose':
            return '-4px';
          case 'normal':
          default:
            return '-8px';
        }};
    }
`;

export const StyledAvatarOverflow = styled(StyledAvatarContainer)`
  background-color: ${({ theme }) => theme.colors.gray[300]};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
  z-index: 1;
`;

export const StyledAvatarSkeleton = styled.div<{
  size: AvatarSize;
  variant: AvatarVariant;
}>`
  ${({ size }) => sizeStyles[size]}
  ${({ variant }) => variantStyles[variant]}
  
  background: ${({ theme }) => theme.colors.gray[200]};
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      ${({ theme }) => theme.colors.gray[100]},
      transparent
    );
    animation: shimmer 1.5s infinite;
  }
  
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
`;

}
}
}
}
