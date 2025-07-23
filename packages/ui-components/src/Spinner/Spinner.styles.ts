import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

export const SpinnerContainer = styled.div<{
  $fullScreen?: boolean;
  $overlay?: boolean;
  $inline?: boolean;
}>`
  display: ${({ $inline }) => ($inline ? 'inline-flex' : 'flex')};
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  
  ${({ $fullScreen }) =>
    $fullScreen &&
    `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
  `}
  
  ${({ $overlay }) =>
    $overlay &&
    `
    background-color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
  `}
`;

export const SpinnerWrapper = styled.div<{
  $size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}>`
  position: relative;
  display: inline-flex;
  
  ${({ $size }) => {
    const sizes = {
      xs: '16px',
      sm: '24px',
      md: '32px',
      lg: '48px',
      xl: '64px'
    };
    return `
      width: ${sizes[$size]};
      height: ${sizes[$size]};
    `;
  }}
`;

export const SpinnerCircle = styled.div<{
  $color?: string;
  $thickness?: number;
}>`
  box-sizing: border-box;
  position: absolute;
  width: 100%;
  height: 100%;
  border: ${({ $thickness }) => $thickness || 3}px solid transparent;
  border-radius: 50%;
  border-top-color: ${({ $color, theme }) => $color || theme.colors.primary};
  animation: ${spin} 0.8s linear infinite;
`;

export const SpinnerDots = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const SpinnerDot = styled.div<{
  $color?: string;
  $delay?: number;
}>`
  position: absolute;
  width: 25%;
  height: 25%;
  background-color: ${({ $color, theme }) => $color || theme.colors.primary};
  border-radius: 50%;
  animation: ${pulse} 1.4s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay || 0}s;
  
  &:nth-child(1) {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
  }
  
  &:nth-child(2) {
    top: 50%;
    right: 0;
    transform: translateY(-50%);
  }
  
  &:nth-child(3) {
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }
  
  &:nth-child(4) {
    top: 50%;
    left: 0;
    transform: translateY(-50%);
  }
`;

export const SpinnerRing = styled.div<{
  $color?: string;
}>`
  display: inline-block;
  position: relative;
  width: 100%;
  height: 100%;
  
  div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 80%;
    height: 80%;
    margin: 10%;
    border: 3px solid ${({ $color, theme }) => $color || theme.colors.primary};
    border-radius: 50%;
    animation: ${spin} 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: ${({ $color, theme }) => $color || theme.colors.primary} transparent transparent transparent;
    
    &:nth-child(1) {
      animation-delay: -0.45s;
    }
    
    &:nth-child(2) {
      animation-delay: -0.3s;
    }
    
    &:nth-child(3) {
      animation-delay: -0.15s;
    }
`;

export const SpinnerBars = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 100%;
`;

const barAnimation = keyframes`
  0%, 40%, 100% {
    transform: scaleY(0.4);
  }
  20% {
    transform: scaleY(1);
  }
`;

export const SpinnerBar = styled.div<{
  $color?: string;
  $delay?: number;
}>`
  width: 4px;
  height: 100%;
  background-color: ${({ $color, theme }) => $color || theme.colors.primary};
  animation: ${barAnimation} 1.2s infinite ease-in-out;
  animation-delay: ${({ $delay }) => $delay || 0}s;
`;

export const SpinnerText = styled.div<{
  $size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}>`
  margin-top: ${({ theme }) => theme.spacing.sm};
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  ${({ $size }) => {
    const fontSizes = {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem'
    };
    return `font-size: ${fontSizes[$size]};`;
  }}
`;

export const SpinnerPulse = styled.div<{
  $color?: string;
}>`
  position: relative;
  width: 100%;
  height: 100%;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: ${({ $color, theme }) => $color || theme.colors.primary};
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(0);
    animation: ${pulse} 2s infinite;
  }
  
  &::after {
    animation-delay: -1s;
  }
`;

const pulsateAnimation = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
`;

export const SpinnerPulsate = styled.div<{
  $color?: string;
}>`
  position: relative;
  width: 100%;
  height: 100%;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 40%;
    height: 40%;
    background-color: ${({ $color, theme }) => $color || theme.colors.primary};
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 3px solid ${({ $color, theme }) => $color || theme.colors.primary};
    transform: translate(-50%, -50%) scale(0);
    animation: ${pulsateAnimation} 1.5s ease-out infinite;
  }
`;

export const SpinnerCube = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  animation: ${spin} 1.5s infinite ease-in-out;
`;

const cubeAnimation = keyframes`
  0%, 10% {
    transform: perspective(140px) rotateX(-180deg);
    opacity: 0;
  }
  25%, 75% {
    transform: perspective(140px) rotateX(0deg);
    opacity: 1;
  }
  90%, 100% {
    transform: perspective(140px) rotateY(180deg);
    opacity: 0;
  }
`;

export const SpinnerCubeFace = styled.div<{
  $color?: string;
  $delay?: number;
}>`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: ${({ $color, theme }) => $color || theme.colors.primary};
  animation: ${cubeAnimation} 2.4s infinite ease-in-out;
  animation-delay: ${({ $delay }) => $delay || 0}s;
`;

}
