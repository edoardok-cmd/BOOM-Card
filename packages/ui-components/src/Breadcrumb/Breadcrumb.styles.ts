import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const BreadcrumbContainer = styled.nav`
  display: flex;
  align-items: center;
  padding: 16px 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 8px;
  margin-bottom: 24px;
  overflow-x: auto;
  white-space: nowrap;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: 12px 0;
    font-size: 13px;
    margin-bottom: 16px;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 8px 0;
    font-size: 12px;
    margin-bottom: 12px;
  }
`;

export const BreadcrumbList = styled.ol`
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0 20px;
  flex-wrap: nowrap;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 0 16px;
  }
`;

export const BreadcrumbItem = styled.li`
  display: flex;
  align-items: center;
  position: relative;
  
  &:not(:last-child) {
    margin-right: 8px;
    
    &::after {
      content: '/';
      margin: 0 8px;
      color: ${({ theme }) => theme.colors.text.disabled};
      font-weight: 300;
    }
  
  &:last-child {
    max-width: 200px;
    
    @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
      max-width: 150px;
    }
    
    @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
      max-width: 120px;
    }
`;

export const BreadcrumbLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary.main};
  text-decoration: none;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary.dark};
    background-color: ${({ theme }) => theme.colors.primary.light}20;
    text-decoration: none;
  }
  
  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: 2px;
  }
  
  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

export const BreadcrumbText = styled.span<{ $isActive?: boolean }>`
  color: ${({ theme, $isActive }) => 
    $isActive ? theme.colors.text.primary : theme.colors.text.secondary};
  font-weight: ${({ $isActive }) => $isActive ? 600 : 400};
  padding: 4px 8px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  display: inline-block;
`;

export const BreadcrumbIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

export const BreadcrumbSeparator = styled.span`
  color: ${({ theme }) => theme.colors.text.disabled};
  margin: 0 8px;
  font-weight: 300;
  display: inline-flex;
  align-items: center;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

export const BreadcrumbDropdown = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

export const BreadcrumbDropdownButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary.main};
  cursor: pointer;
  padding: 4px 8px;
  font-size: inherit;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary.light}20;
    color: ${({ theme }) => theme.colors.primary.dark};
  }
  
  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: 2px;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

export const BreadcrumbDropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  background-color: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: 8px 0;
  min-width: 200px;
  z-index: 1000;
  opacity: ${({ $isOpen }) => $isOpen ? 1 : 0};
  visibility: ${({ $isOpen }) => $isOpen ? 'visible' : 'hidden'};
  transform: translateY(${({ $isOpen }) => $isOpen ? '4px' : '-4px'});
  transition: all 0.2s ease;
  max-height: 300px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background.secondary};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.text.disabled};
    border-radius: 3px;
    
    &:hover {
      background: ${({ theme }) => theme.colors.text.secondary};
    }
`;

export const BreadcrumbDropdownItem = styled(Link)`
  display: block;
  padding: 8px 16px;
  color: ${({ theme }) => theme.colors.text.primary};
  text-decoration: none;
  transition: background-color 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.secondary};
    color: ${({ theme }) => theme.colors.primary.main};
  }
  
  &:focus {
    outline: none;
    background-color: ${({ theme }) => theme.colors.primary.light}20;
    color: ${({ theme }) => theme.colors.primary.dark};
  }
`;

export const BreadcrumbHome = styled(BreadcrumbLink)`
  padding: 4px;
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary.light}20;
  }
`;

export const BreadcrumbSkeleton = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 20px;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 0 16px;
  }
`;

export const BreadcrumbSkeletonItem = styled.div<{ width?: number }>`
  height: 20px;
  background-color: ${({ theme }) => theme.colors.background.skeleton};
  border-radius: 4px;
  width: ${({ width }) => width || 80}px;
  animation: pulse 1.5s ease-in-out infinite;
  
  @keyframes pulse {
    0% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.6;
    }
`;

export const BreadcrumbMobileToggle = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary.main};
  cursor: pointer;
  padding: 4px;
  margin-left: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary.light}20;
  }
  
  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: 2px;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

export const BreadcrumbMobileMenu = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.background.overlay};
  z-index: 9999;
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  align-items: flex-end;
  justify-content: center;
  animation: fadeIn 0.2s ease;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
`;

export const BreadcrumbMobileMenuContent = styled.div`
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: 16px 16px 0 0;
  padding: 24px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
  
  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
`;

export const BreadcrumbMobileMenuItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: ${({ theme }) => theme.colors.text.primary};
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  margin-bottom: 8px;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.secondary};
    color: ${({ theme }) => theme.colors.primary.main};
  }
  
  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
`;

export const BreadcrumbMobileMenuClose = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.secondary};
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

}
}
}
}
}
}
