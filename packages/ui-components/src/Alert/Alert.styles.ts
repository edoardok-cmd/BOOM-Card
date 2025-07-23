import styled, { css, keyframes } from 'styled-components';
import { AlertVariant, AlertSize } from './Alert.types';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const variantStyles = {
  success: css`
    background-color: ${({ theme }) => theme.colors.success.light};
    border-color: ${({ theme }) => theme.colors.success.main};
    color: ${({ theme }) => theme.colors.success.dark};

    svg {
      color: ${({ theme }) => theme.colors.success.main};
    }
  `,
  error: css`
    background-color: ${({ theme }) => theme.colors.error.light};
    border-color: ${({ theme }) => theme.colors.error.main};
    color: ${({ theme }) => theme.colors.error.dark};

    svg {
      color: ${({ theme }) => theme.colors.error.main};
    }
  `,
  warning: css`
    background-color: ${({ theme }) => theme.colors.warning.light};
    border-color: ${({ theme }) => theme.colors.warning.main};
    color: ${({ theme }) => theme.colors.warning.dark};

    svg {
      color: ${({ theme }) => theme.colors.warning.main};
    }
  `,
  info: css`
    background-color: ${({ theme }) => theme.colors.info.light};
    border-color: ${({ theme }) => theme.colors.info.main};
    color: ${({ theme }) => theme.colors.info.dark};

    svg {
      color: ${({ theme }) => theme.colors.info.main};
    }
  `,
  discount: css`
    background: linear-gradient(135deg, 
      ${({ theme }) => theme.colors.primary.light} 0%, 
      ${({ theme }) => theme.colors.secondary.light} 100%
    );
    border-color: ${({ theme }) => theme.colors.primary.main};
    color: ${({ theme }) => theme.colors.primary.dark};
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(
        45deg,
        transparent 30%,
        rgba(255, 255, 255, 0.1) 50%,
        transparent 70%
      );
      transform: rotate(45deg);
      animation: shimmer 3s infinite;
    }

    svg {
      color: ${({ theme }) => theme.colors.primary.main};
    }

    @keyframes shimmer {
      0% {
        transform: translateX(-100%) translateY(-100%) rotate(45deg);
      }
      100% {
        transform: translateX(100%) translateY(100%) rotate(45deg);
      }
  `,
};

const sizeStyles = {
  small: css`
    padding: ${({ theme }) => theme.spacing(1, 2)};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  `,
  medium: css`
    padding: ${({ theme }) => theme.spacing(1.5, 3)};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    border-radius: ${({ theme }) => theme.borderRadius.md};
  `,
  large: css`
    padding: ${({ theme }) => theme.spacing(2, 4)};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
  `,
};

export const StyledAlert = styled.div<{
  $variant: AlertVariant;
  $size: AlertSize;
  $withIcon: boolean;
  $dismissible: boolean;
  $animate: boolean;
}>`
  display: flex;
  align-items: flex-start;
  width: 100%;
  border: 1px solid;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  transition: all ${({ theme }) => theme.transitions.duration.normal} ${({ theme }) => theme.transitions.easing.easeInOut};
  position: relative;
  
  ${({ $variant }) => variantStyles[$variant]}
  ${({ $size }) => sizeStyles[$size]}
  
  ${({ $animate }) => $animate && css`
    animation: ${slideIn} ${({ theme }) => theme.transitions.duration.slow} ${({ theme }) => theme.transitions.easing.easeOut};
  `}

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

export const IconWrapper = styled.div<{ $size: AlertSize }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: ${({ theme, $size }) => 
    $size === 'small' ? theme.spacing(1.5) : 
    $size === 'medium' ? theme.spacing(2) : 
    theme.spacing(2.5)
  };

  svg {
    width: ${({ $size }) => 
      $size === 'small' ? '16px' : 
      $size === 'medium' ? '20px' : 
      '24px'
    };
    height: ${({ $size }) => 
      $size === 'small' ? '16px' : 
      $size === 'medium' ? '20px' : 
      '24px'
    };
  }
`;

export const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const Title = styled.h4<{ $size: AlertSize }>`
  margin: 0;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-size: ${({ theme, $size }) => 
    $size === 'small' ? theme.typography.fontSize.sm : 
    $size === 'medium' ? theme.typography.fontSize.base : 
    theme.typography.fontSize.lg
  };
  line-height: 1.4;
`;

export const Message = styled.p<{ $size: AlertSize }>`
  margin: 0;
  font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
  font-size: ${({ theme, $size }) => 
    $size === 'small' ? theme.typography.fontSize.xs : 
    $size === 'medium' ? theme.typography.fontSize.sm : 
    theme.typography.fontSize.base
  };
  line-height: 1.5;
  opacity: 0.9;
`;

export const Actions = styled.div<{ $size: AlertSize }>`
  display: flex;
  align-items: center;
  gap: ${({ theme, $size }) => 
    $size === 'small' ? theme.spacing(1) : 
    $size === 'medium' ? theme.spacing(1.5) : 
    theme.spacing(2)
  };
  margin-top: ${({ theme, $size }) => 
    $size === 'small' ? theme.spacing(1) : 
    $size === 'medium' ? theme.spacing(1.5) : 
    theme.spacing(2)
  };
`;

export const ActionButton = styled.button<{ $variant: AlertVariant }>`
  background: none;
  border: none;
  padding: ${({ theme }) => theme.spacing(0.5, 1)};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.easeInOut};
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    opacity: 0.8;
    text-decoration: none;
    background-color: rgba(0, 0, 0, 0.05);
  }

  &:focus {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const CloseButton = styled.button<{ $size: AlertSize; $variant: AlertVariant }>`
  position: absolute;
  top: ${({ theme, $size }) => 
    $size === 'small' ? theme.spacing(1) : 
    $size === 'medium' ? theme.spacing(1.5) : 
    theme.spacing(2)
  };
  right: ${({ theme, $size }) => 
    $size === 'small' ? theme.spacing(1) : 
    $size === 'medium' ? theme.spacing(1.5) : 
    theme.spacing(2)
  };
  background: none;
  border: none;
  padding: ${({ theme }) => theme.spacing(0.5)};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.easeInOut};
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  opacity: 0.7;

  svg {
    width: ${({ $size }) => 
      $size === 'small' ? '14px' : 
      $size === 'medium' ? '16px' : 
      '18px'
    };
    height: ${({ $size }) => 
      $size === 'small' ? '14px' : 
      $size === 'medium' ? '16px' : 
      '18px'
    };
  }

  &:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.1);
  }

  &:focus {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  &:active {
    transform: scale(0.9);
  }
`;

export const DiscountBadge = styled.span<{ $size: AlertSize }>`
  position: absolute;
  top: ${({ theme, $size }) => 
    $size === 'small' ? theme.spacing(-1) : 
    $size === 'medium' ? theme.spacing(-1.5) : 
    theme.spacing(-2)
  };
  right: ${({ theme, $size }) => 
    $size === 'small' ? theme.spacing(3) : 
    $size === 'medium' ? theme.spacing(4) : 
    theme.spacing(5)
  };
  background: ${({ theme }) => theme.colors.error.main};
  color: ${({ theme }) => theme.colors.common.white};
  padding: ${({ theme, $size }) => 
    $size === 'small' ? theme.spacing(0.25, 1) : 
    $size === 'medium' ? theme.spacing(0.5, 1.5) : 
    theme.spacing(0.75, 2)
  };
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme, $size }) => 
    $size === 'small' ? theme.typography.fontSize.xs : 
    $size === 'medium' ? theme.typography.fontSize.sm : 
    theme.typography.fontSize.base
  };
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  box-shadow: ${({ theme }) => theme.shadows.md};
  animation: ${fadeIn} ${({ theme }) => theme.transitions.duration.normal} ${({ theme }) => theme.transitions.easing.easeOut};
  z-index: 1;
`;

export const ProgressBar = styled.div<{ $duration: number; $variant: AlertVariant }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: ${({ theme, $variant }) => 
    $variant === 'success' ? theme.colors.success.main :
    $variant === 'error' ? theme.colors.error.main :
    $variant === 'warning' ? theme.colors.warning.main :
    $variant === 'info' ? theme.colors.info.main :
    theme.colors.primary.main
  };
  animation: progress ${({ $duration }) => $duration}ms linear forwards;
  transform-origin: left center;

  @keyframes progress {
    from {
      transform: scaleX(1);
    }
    to {
      transform: scaleX(0);
    }
`;

}
}
