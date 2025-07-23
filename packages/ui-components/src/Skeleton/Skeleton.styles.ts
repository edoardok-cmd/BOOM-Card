import styled, { keyframes, css } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
`;

export const skeletonAnimation = css<{ $animation?: 'shimmer' | 'pulse' }>`
  ${({ $animation = 'shimmer' }) =>
    $animation === 'shimmer'
      ? css`
          background: linear-gradient(
            90deg,
            ${({ theme }) => theme.colors.skeleton.base} 25%,
            ${({ theme }) => theme.colors.skeleton.highlight} 50%,
            ${({ theme }) => theme.colors.skeleton.base} 75%
          );
          background-size: 200% 100%;
          animation: ${shimmer} 1.5s infinite;
        `
      : css`
          background: ${({ theme }) => theme.colors.skeleton.base};
          animation: ${pulse} 1.5s ease-in-out infinite;
        `}
`;

export const SkeletonBase = styled.div<{
  $width?: string | number;
  $height?: string | number;
  $borderRadius?: string | number;
  $animation?: 'shimmer' | 'pulse';
  $marginBottom?: string | number;
  $marginTop?: string | number;
  $marginLeft?: string | number;
  $marginRight?: string | number;
}>`
  display: inline-block;
  width: ${({ $width }) => (typeof $width === 'number' ? `${$width}px` : $width || '100%')};
  height: ${({ $height }) => (typeof $height === 'number' ? `${$height}px` : $height || '20px')};
  border-radius: ${({ $borderRadius }) =>
    typeof $borderRadius === 'number' ? `${$borderRadius}px` : $borderRadius || '4px'};
  margin-bottom: ${({ $marginBottom }) =>
    typeof $marginBottom === 'number' ? `${$marginBottom}px` : $marginBottom || '0'};
  margin-top: ${({ $marginTop }) =>
    typeof $marginTop === 'number' ? `${$marginTop}px` : $marginTop || '0'};
  margin-left: ${({ $marginLeft }) =>
    typeof $marginLeft === 'number' ? `${$marginLeft}px` : $marginLeft || '0'};
  margin-right: ${({ $marginRight }) =>
    typeof $marginRight === 'number' ? `${$marginRight}px` : $marginRight || '0'};
  ${skeletonAnimation}
`;

export const SkeletonText = styled(SkeletonBase)<{
  $lines?: number;
  $lineHeight?: string | number;
  $lastLineWidth?: string;
}>`
  ${({ $lines = 1, $lineHeight = 20, $lastLineWidth = '100%' }) =>
    $lines > 1 &&
    css`
      display: block;
      
      &::after {
        content: '';
        display: block;
        height: ${typeof $lineHeight === 'number' ? `${$lineHeight}px` : $lineHeight};
        margin-bottom: ${typeof $lineHeight === 'number' ? `${$lineHeight * 0.4}px` : '8px'};
        ${skeletonAnimation}
        
        ${Array.from({ length: $lines - 1 }, (_, i) => {
          const isLastLine = i === $lines - 2;
          return css`
            &:nth-child(${i + 2}) {
              width: ${isLastLine ? $lastLineWidth : '100%'};
              ${isLastLine && 'margin-bottom: 0;'}
          `;
        })}
    `}
`;

export const SkeletonCircle = styled(SkeletonBase)<{
  $size?: string | number;
}>`
  width: ${({ $size = 40 }) => (typeof $size === 'number' ? `${$size}px` : $size)};
  height: ${({ $size = 40 }) => (typeof $size === 'number' ? `${$size}px` : $size)};
  border-radius: 50%;
`;

export const SkeletonImage = styled(SkeletonBase)<{
  $aspectRatio?: string;
}>`
  ${({ $aspectRatio }) =>
    $aspectRatio &&
    css`
      position: relative;
      height: 0;
      padding-bottom: ${$aspectRatio};
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        ${skeletonAnimation}
    `}
`;

export const SkeletonButton = styled(SkeletonBase)`
  height: ${({ theme }) => theme.components.button.height.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

export const SkeletonCard = styled.div<{
  $padding?: string | number;
  $animation?: 'shimmer' | 'pulse';
}>`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  padding: ${({ $padding = 16 }) => (typeof $padding === 'number' ? `${$padding}px` : $padding)};
  box-shadow: ${({ theme }) => theme.shadows.small};
`;

export const SkeletonCardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

export const SkeletonCardContent = styled.div`
  & > * + * {
    margin-top: ${({ theme }) => theme.spacing.small};
  }
`;

export const SkeletonList = styled.div<{
  $gap?: string | number;
}>`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap = 12 }) => (typeof $gap === 'number' ? `${$gap}px` : $gap)};
`;

export const SkeletonListItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.medium};
`;

export const SkeletonGrid = styled.div<{
  $columns?: number;
  $gap?: string | number;
}>`
  display: grid;
  grid-template-columns: repeat(${({ $columns = 3 }) => $columns}, 1fr);
  gap: ${({ $gap = 16 }) => (typeof $gap === 'number' ? `${$gap}px` : $gap)};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

export const SkeletonForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.large};
`;

export const SkeletonFormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
`;

export const SkeletonInput = styled(SkeletonBase)`
  height: ${({ theme }) => theme.components.input.height.medium};
  border-radius: ${({ theme }) => theme.borderRadius.small};
`;

export const SkeletonLabel = styled(SkeletonBase)`
  width: 120px;
  height: 16px;
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

export const SkeletonAvatar = styled(SkeletonCircle)<{
  $showStatus?: boolean;
}>`
  position: relative;
  
  ${({ $showStatus }) =>
    $showStatus &&
    css`
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        right: 0;
        width: 25%;
        height: 25%;
        border-radius: 50%;
        background: ${({ theme }) => theme.colors.skeleton.base};
        border: 2px solid ${({ theme }) => theme.colors.background.paper};
        ${skeletonAnimation}
    `}
`;

export const SkeletonTable = styled.div`
  width: 100%;
`;

export const SkeletonTableRow = styled.div<{
  $columns?: number;
}>`
  display: grid;
  grid-template-columns: ${({ $columns = 4 }) => `repeat(${$columns}, 1fr)`};
  gap: ${({ theme }) => theme.spacing.medium};
  padding: ${({ theme }) => theme.spacing.medium} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  
  &:last-child {
    border-bottom: none;
  }
`;

export const SkeletonBadge = styled(SkeletonBase)`
  width: 60px;
  height: 24px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
`;

export const SkeletonProgress = styled(SkeletonBase)`
  height: 8px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.skeleton.base};
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: 60%;
    border-radius: ${({ theme }) => theme.borderRadius.full};
    ${skeletonAnimation}
`;

export const SkeletonChart = styled(SkeletonBase)`
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60%;
    background: linear-gradient(
      180deg,
      transparent 0%,
      ${({ theme }) => theme.colors.skeleton.highlight} 100%
    );
    opacity: 0.3;
  }
`;

export const SkeletonRating = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const SkeletonStar = styled(SkeletonBase)`
  width: 20px;
  height: 20px;
  clip-path: polygon(
    50% 0%,
    61% 35%,
    98% 35%,
    68% 57%,
    79% 91%,
    50% 70%,
    21% 91%,
    32% 57%,
    2% 35%,
    39% 35%
  );
`;

export const SkeletonWrapper = styled.div<{
  $isLoading?: boolean;
}>`
  ${({ $isLoading = true }) =>
    !$isLoading &&
    css`
      ${SkeletonBase},
      ${SkeletonText},
      ${SkeletonCircle},
      ${SkeletonImage},
      ${SkeletonButton},
      ${SkeletonInput},
      ${SkeletonLabel},
      ${SkeletonAvatar},
      ${SkeletonBadge},
      ${SkeletonProgress},
      ${SkeletonChart},
      ${SkeletonStar} {
        animation: none;
        background: transparent;
        
        &::before,
        &::after {
          display: none;
        }
    `}
`;

}
}
}
}
}
}
