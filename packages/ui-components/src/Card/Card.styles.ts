import styled, { css } from 'styled-components';
import { CardVariant, CardSize } from './Card.types';

const sizeStyles = {
  small: css`
    padding: ${({ theme }) => theme.spacing.sm};
  `,
  medium: css`
    padding: ${({ theme }) => theme.spacing.md};
  `,
  large: css`
    padding: ${({ theme }) => theme.spacing.lg};
  `,
};

const variantStyles = {
  elevated: css`
    box-shadow: ${({ theme }) => theme.shadows.sm};
    &:hover {
      box-shadow: ${({ theme }) => theme.shadows.md};
    }
  `,
  outlined: css`
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    box-shadow: none;
  `,
  filled: css`
    background-color: ${({ theme }) => theme.colors.background.paper};
    box-shadow: none;
  `,
};

export const StyledCard = styled.div<{
  $variant: CardVariant;
  $size: CardSize;
  $hoverable: boolean;
  $clickable: boolean;
  $fullHeight: boolean;
}>`
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.background.card};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  transition: all ${({ theme }) => theme.transitions.normal};
  overflow: hidden;
  
  ${({ $size }) => sizeStyles[$size]}
  ${({ $variant }) => variantStyles[$variant]}
  
  ${({ $fullHeight }) =>
    $fullHeight &&
    css`
      height: 100%;
    `}
  
  ${({ $hoverable }) =>
    $hoverable &&
    css`
      &:hover {
        transform: translateY(-2px);
      }
    `}
  
  ${({ $clickable }) =>
    $clickable &&
    css`
      cursor: pointer;
      user-select: none;
      
      &:active {
        transform: scale(0.98);
      }
    `}
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
`;

export const CardTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.2;
`;

export const CardSubtitle = styled.p`
  margin: ${({ theme }) => theme.spacing.xs} 0 0;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.4;
`;

export const CardContent = styled.div`
  flex: 1;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const CardActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
`;

export const CardMedia = styled.div<{ $height?: string }>`
  position: relative;
  width: calc(100% + ${({ theme }) => theme.spacing.md} * 2);
  height: ${({ $height }) => $height || '200px'};
  margin: -${({ theme }) => theme.spacing.md} -${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md};
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform ${({ theme }) => theme.transitions.normal};
  }
  
  ${StyledCard}:hover & img {
    transform: scale(1.05);
  }
`;

export const CardBadge = styled.div<{ $color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' }>`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  background-color: ${({ theme, $color = 'primary' }) => theme.colors[$color].main};
  color: ${({ theme }) => theme.colors.text.white};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  z-index: 1;
`;

export const CardOverlay = styled.div<{ $visible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  visibility: ${({ $visible }) => ($visible ? 'visible' : 'hidden')};
  transition: all ${({ theme }) => theme.transitions.normal};
  z-index: 2;
`;

export const CardSkeleton = styled.div`
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.background.skeleton} 0%,
    ${({ theme }) => theme.colors.background.skeletonHighlight} 50%,
    ${({ theme }) => theme.colors.background.skeleton} 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

export const CardLink = styled.a`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: 2px;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
  }
`;

}
