import React from 'react';
import { styled, keyframes } from '@mui/material/styles';
import { Box, BoxProps } from '@mui/material';

export interface SkeletonProps extends Omit<BoxProps, 'children'> {
  variant?: 'text' | 'rectangular' | 'rounded' | 'circular';
  animation?: 'pulse' | 'wave' | false;
  width?: number | string;
  height?: number | string;
  animationDuration?: number;
}

const pulseKeyframe = keyframes`
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

const waveKeyframe = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`;

const StyledSkeleton = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== 'variant' &&
    prop !== 'animation' &&
    prop !== 'animationDuration',
})<SkeletonProps>(({ theme, variant, animation, width, height, animationDuration }) => ({
  display: 'block',
  backgroundColor: theme.palette.action.hover,
  position: 'relative',
  overflow: 'hidden',
  width: width || '100%',
  height: height || 'auto',
  
  // Handle text variant
  ...(variant === 'text' && {
    marginTop: 0,
    marginBottom: 0,
    height: height || '1.2em',
    borderRadius: theme.shape.borderRadius / 2,
    transform: 'scale(1, 0.60)',
    transformOrigin: '0 60%',
    '&:before': {
      content: '"\\00a0"',
    },
  }),
  
  // Handle rectangular variant
  ...(variant === 'rectangular' && {
    borderRadius: 0,
  }),
  
  // Handle rounded variant
  ...(variant === 'rounded' && {
    borderRadius: theme.shape.borderRadius,
  }),
  
  // Handle circular variant
  ...(variant === 'circular' && {
    borderRadius: '50%',
  }),
  
  // Handle pulse animation
  ...(animation === 'pulse' && {
    animation: `${pulseKeyframe} ${animationDuration || 1.5}s ease-in-out infinite`,
  }),
  
  // Handle wave animation
  ...(animation === 'wave' && {
    position: 'relative',
    overflow: 'hidden',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(
        90deg,
        transparent,
        ${theme.palette.action.hover},
        transparent
      )`,
      transform: 'translateX(-100%)',
      animation: `${waveKeyframe} ${animationDuration || 1.6}s linear infinite`,
    },
  }),
}));

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  animation = 'pulse',
  width,
  height,
  animationDuration,
  ...rest
}) => {
  return (
    <StyledSkeleton
      variant={variant}
      animation={animation}
      width={width}
      height={height}
      animationDuration={animationDuration}
      role="status"
      aria-live="polite"
      aria-label="Loading content"
      {...rest}
    />
  );
};

// Compound components for common use cases
export const SkeletonText: React.FC<Omit<SkeletonProps, 'variant'>> = (props) => (
  <Skeleton variant="text" {...props} />
);

export const SkeletonRectangular: React.FC<Omit<SkeletonProps, 'variant'>> = (props) => (
  <Skeleton variant="rectangular" {...props} />
);

export const SkeletonRounded: React.FC<Omit<SkeletonProps, 'variant'>> = (props) => (
  <Skeleton variant="rounded" {...props} />
);

export const SkeletonCircular: React.FC<Omit<SkeletonProps, 'variant'>> = (props) => (
  <Skeleton variant="circular" {...props} />
);

// Card skeleton preset
export interface SkeletonCardProps {
  showMedia?: boolean;
  mediaHeight?: number | string;
  lines?: number;
  animation?: 'pulse' | 'wave' | false;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showMedia = true,
  mediaHeight = 200,
  lines = 3,
  animation = 'pulse',
}) => {
  return (
    <Box>
      {showMedia && (
        <SkeletonRectangular
          height={mediaHeight}
          animation={animation}
          sx={{ mb: 2 }}
        />
      )}
      {Array.from({ length: lines }, (_, index) => (
        <SkeletonText
          key={index}
          animation={animation}
          sx={{
            mb: 1,
            width: index === lines - 1 ? '60%' : '100%',
          }}
        />
      ))}
    </Box>
  );
};

// List item skeleton preset
export interface SkeletonListItemProps {
  showAvatar?: boolean;
  avatarSize?: number;
  lines?: number;
  animation?: 'pulse' | 'wave' | false;
}

export const SkeletonListItem: React.FC<SkeletonListItemProps> = ({
  showAvatar = true,
  avatarSize = 40,
  lines = 2,
  animation = 'pulse',
}) => {
  return (
    <Box display="flex" alignItems="flex-start" gap={2}>
      {showAvatar && (
        <SkeletonCircular
          width={avatarSize}
          height={avatarSize}
          animation={animation}
        />
      )}
      <Box flex={1}>
        {Array.from({ length: lines }, (_, index) => (
          <SkeletonText
            key={index}
            animation={animation}
            sx={{
              mb: index < lines - 1 ? 0.5 : 0,
              width: index === 0 ? '50%' : '100%',
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

// Table skeleton preset
export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  animation?: 'pulse' | 'wave' | false;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  animation = 'pulse',
}) => {
  return (
    <Box>
      {showHeader && (
        <Box display="flex" gap={2} mb={2} pb={2} borderBottom={1} borderColor="divider">
          {Array.from({ length: columns }, (_, index) => (
            <SkeletonText
              key={index}
              animation={animation}
              sx={{ flex: 1 }}
            />
          ))}
        </Box>
      )}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <Box key={rowIndex} display="flex" gap={2} py={1.5}>
          {Array.from({ length: columns }, (_, colIndex) => (
            <SkeletonText
              key={colIndex}
              animation={animation}
              sx={{ flex: 1 }}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default Skeleton;
