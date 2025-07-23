import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

export interface TableStyleProps {
  variant?: 'default' | 'striped' | 'bordered' | 'hover';
  size?: 'sm' | 'md' | 'lg';
  responsive?: boolean;
  stickyHeader?: boolean;
  maxHeight?: string;
}

const sizeStyles = {
  sm: css`
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    
    th, td {
      padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
    }
  `,
  md: css`
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    
    th, td {
      padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
    }
  `,
  lg: css`
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    
    th, td {
      padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
    }
  `
};

const variantStyles = {
  default: css``,
  striped: css`
    tbody tr:nth-child(even) {
      background-color: ${({ theme }) => theme.colors.background.subtle};
    }
  `,
  bordered: css`
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    
    th, td {
      border: 1px solid ${({ theme }) => theme.colors.border.default};
    }
  `,
  hover: css`
    tbody tr {
      transition: background-color 0.2s ease;
      
      &:hover {
        background-color: ${({ theme }) => theme.colors.background.hover};
      }
  `
};

export const TableWrapper = styled.div<{ responsive?: boolean; maxHeight?: string }>`
  width: 100%;
  ${({ responsive }) => responsive && css`
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  `}
  
  ${({ maxHeight }) => maxHeight && css`
    max-height: ${maxHeight};
    overflow-y: auto;
  `}
`;

export const StyledTable = styled.table<TableStyleProps>`
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  background-color: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  
  ${({ size = 'md' }) => sizeStyles[size]}
  ${({ variant = 'default' }) => variantStyles[variant]}
  
  ${({ stickyHeader }) => stickyHeader && css`
    thead {
      position: sticky;
      top: 0;
      z-index: 10;
      background-color: ${({ theme }) => theme.colors.background.primary};
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  `}
`;

export const TableHead = styled.thead`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border.strong};
`;

export const TableBody = styled.tbody``;

export const TableRow = styled(motion.tr)`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  
  &:last-child {
    border-bottom: none;
  }
`;

export const TableHeader = styled.th<{ align?: 'left' | 'center' | 'right'; sortable?: boolean }>`
  text-align: ${({ align = 'left' }) => align};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: nowrap;
  position: relative;
  
  ${({ sortable }) => sortable && css`
    cursor: pointer;
    user-select: none;
    
    &:hover {
      color: ${({ theme }) => theme.colors.text.primary};
    }
  `}
`;

export const TableCell = styled.td<{ align?: 'left' | 'center' | 'right' }>`
  text-align: ${({ align = 'left' }) => align};
  vertical-align: middle;
`;

export const SortIcon = styled.span<{ direction?: 'asc' | 'desc' | 'none' }>`
  display: inline-flex;
  align-items: center;
  margin-left: ${({ theme }) => theme.spacing.xs};
  opacity: ${({ direction }) => direction === 'none' ? 0.3 : 1};
  transition: opacity 0.2s ease;
  
  svg {
    width: 14px;
    height: 14px;
    transform: ${({ direction }) => direction === 'desc' ? 'rotate(180deg)' : 'none'};
    transition: transform 0.2s ease;
  }
`;

export const EmptyState = styled.div`
  padding: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.md}`};
  text-align: center;
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
`;

export const LoadingOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
`;

export const ExpandableContent = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background.subtle};
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
`;

export const SelectionCheckbox = styled.input.attrs({ type: 'checkbox' })`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.primary.main};
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export const PaginationWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

export const PaginationInfo = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

export const TableFooter = styled.tfoot`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-top: 2px solid ${({ theme }) => theme.colors.border.strong};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

export const ResizeHandle = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  user-select: none;
  touch-action: none;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary.light};
  }
  
  &.resizing {
    background-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

export const FilterIcon = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xxs};
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.tertiary};
  transition: color 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  &.active {
    color: ${({ theme }) => theme.colors.primary.main};
  }
`;

export const BulkActionsBar = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.primary.light};
  color: ${({ theme }) => theme.colors.primary.dark};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

export const SkeletonRow = styled.div`
  display: contents;
  
  td {
    padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  }
`;

export const SkeletonCell = styled.div`
  height: 20px;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.background.secondary} 25%,
    ${({ theme }) => theme.colors.background.hover} 50%,
    ${({ theme }) => theme.colors.background.secondary} 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: ${({ theme }) => theme.borderRadius.xs};
  
  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
`;

}
}
