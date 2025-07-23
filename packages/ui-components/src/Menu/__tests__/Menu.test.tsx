import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Menu } from '../Menu';
import { MenuItem } from '../MenuItem';
import { MenuDivider } from '../MenuDivider';
import { MenuGroup } from '../MenuGroup';
import { ThemeProvider } from '../../theme';
import { vi } from 'vitest';

// Mock framer-motion for testing
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('Menu Component', () => {
  const defaultProps = {
    'aria-label': 'Test menu',
  };

  const renderMenu = (ui: React.ReactElement, props = {}) => {
    return render(
      <ThemeProvider>
        <Menu {...defaultProps} {...props}>
          {ui}
        </Menu>
      </ThemeProvider>
    );
  };

  describe('Basic Rendering', () => {
    it('should render menu with items', () => {
      renderMenu(
        <>
          <MenuItem>Item 1</MenuItem>
          <MenuItem>Item 2</MenuItem>
          <MenuItem>Item 3</MenuItem>
        </>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('should render menu with dividers', () => {
      const { container } = renderMenu(
        <>
          <MenuItem>Item 1</MenuItem>
          <MenuDivider />
          <MenuItem>Item 2</MenuItem>
        </>
      );

      const divider = container.querySelector('hr');
      expect(divider).toBeInTheDocument();
    });

    it('should render menu groups', () => {
      renderMenu(
        <>
          <MenuGroup title="Group 1">
            <MenuItem>Item 1</MenuItem>
            <MenuItem>Item 2</MenuItem>
          </MenuGroup>
          <MenuGroup title="Group 2">
            <MenuItem>Item 3</MenuItem>
            <MenuItem>Item 4</MenuItem>
          </MenuGroup>
        </>
      );

      expect(screen.getByText('Group 1')).toBeInTheDocument();
      expect(screen.getByText('Group 2')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 4')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = renderMenu(<MenuItem>Item</MenuItem>, {)
        className: 'custom-menu',
      });

      expect(container.querySelector('.custom-menu')).toBeInTheDocument();
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <ThemeProvider>
          <Menu ref={ref} aria-label="Test menu">
            <MenuItem>Item</MenuItem>
          </Menu>
        </ThemeProvider>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate with arrow keys', async () => {
      const user = userEvent.setup();
      renderMenu(
        <>
          <MenuItem>Item 1</MenuItem>
          <MenuItem>Item 2</MenuItem>
          <MenuItem>Item 3</MenuItem>
        </>
      );

      const item1 = screen.getByText('Item 1');
      const item2 = screen.getByText('Item 2');
      const item3 = screen.getByText('Item 3');

      // Focus first item
      await user.tab();
      expect(item1).toHaveFocus();

      // Navigate down
      await user.keyboard('{ArrowDown}');
      expect(item2).toHaveFocus();

      await user.keyboard('{ArrowDown}');
      expect(item3).toHaveFocus();

      // Navigate up
      await user.keyboard('{ArrowUp}');
      expect(item2).toHaveFocus();
    });

    it('should wrap navigation at boundaries', async () => {
      renderMenu(
        <>
          <MenuItem>Item 1</MenuItem>
          <MenuItem>Item 2</MenuItem>
          <MenuItem>Item 3</MenuItem>
        </>
      );


      // Focus first item
      await user.tab();
      expect(item1).toHaveFocus();

      // Navigate up from first item should go to last
      await user.keyboard('{ArrowUp}');
      expect(item3).toHaveFocus();

      // Navigate down from last item should go to first
      await user.keyboard('{ArrowDown}');
      expect(item1).toHaveFocus();
    });

    it('should skip disabled items during navigation', async () => {
      renderMenu(
        <>
          <MenuItem>Item 1</MenuItem>
          <MenuItem disabled>Item 2</MenuItem>
          <MenuItem>Item 3</MenuItem>
        </>
      );


      // Focus first item
      await user.tab();
      expect(item1).toHaveFocus();

      // Navigate down should skip disabled item
      await user.keyboard('{ArrowDown}');
      expect(item3).toHaveFocus();
    });

    it('should navigate with Home and End keys', async () => {
      renderMenu(
        <>
          <MenuItem>Item 1</MenuItem>
          <MenuItem>Item 2</MenuItem>
          <MenuItem>Item 3</MenuItem>
        </>
      );


      // Focus first item
      await user.tab();
      expect(item1).toHaveFocus();

      // Navigate to end
      await user.keyboard('{End}');
      expect(item3).toHaveFocus();

      // Navigate to home
      await user.keyboard('{Home}');
      expect(item1).toHaveFocus();
    });

    it('should handle Tab key navigation', async () => {
      const { container } = renderMenu(
        <>
          <MenuItem>Item 1</MenuItem>
          <MenuItem>Item 2</MenuItem>
        </>
      );

      const menu = container.querySelector('[role="menu"]');

      // Tab into menu
      await user.tab();
      expect(item1).toHaveFocus();

      // Tab out of menu
      await user.tab();
      expect(menu).not.toContainElement(document.activeElement);
    });
  });

  describe('Item Selection', () => {
    it('should handle item click', async () => {
      const handleClick = vi.fn();
      
      renderMenu(
        <>
          <MenuItem onClick={handleClick}>Item 1</MenuItem>
          <MenuItem>Item 2</MenuItem>
        </>
      );

      await user.click(screen.getByText('Item 1'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should handle Enter key press', async () => {
      
      renderMenu(
        <>
          <MenuItem onClick={handleClick}>Item 1</MenuItem>
          <MenuItem>Item 2</MenuItem>
        </>
      );

      await user.tab();
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should handle Space key press', async () => {
      
      renderMenu(
        <>
          <MenuItem onClick={handleClick}>Item 1</MenuItem>
          <MenuItem>Item 2</MenuItem>
        </>
      );

      await user.tab();
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not trigger click on disabled items', async () => {
      
      renderMenu(
        <MenuItem disabled onClick={handleClick}>
          Disabled Item
        </MenuItem>
      );

      await user.click(screen.getByText('Disabled Item'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Variants', () => {
    it('should render primary variant', () => {
      const { container } = renderMenu(<MenuItem>Item</MenuItem>, {)
        variant: 'primary',
      });

      expect(menu).toHaveClass('menu-primary');
    });

    it('should render secondary variant', () => {
      const { container } = renderMenu(<MenuItem>Item</MenuItem>, {)
        variant: 'secondary',
      });

      expect(menu).toHaveClass('menu-secondary');
    });

    it('should render contextual variant', () => {
      const { container } = renderMenu(<MenuItem>Item</MenuItem>, {)
        variant: 'contextual',
      });

      expect(menu).toHaveClass('menu-contextual');
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      const { container } = renderMenu(<MenuItem>Item</MenuItem>, {
        size: 'sm',
      });

      expect(menu).toHaveClass('menu-sm');
    });

    it('should render medium size', () => {
      const { container } = renderMenu(<MenuItem>Item</MenuItem>, {
        size: 'md',
      });

      expect(menu).toHaveClass('menu-md');
    });

    it('should render large size', () => {
      const { container } = renderMenu(<MenuItem>Item</MenuItem>, {
        size: 'lg',
      });

      expect(menu).toHaveClass('menu-lg');
    });
  });

  describe('Icons and Shortcuts', () => {
    it('should render menu items with icons', () => {
      const Icon = () => <span data-testid="icon">Icon</span>;
      
      renderMenu(
        <>
          <MenuItem icon={<Icon />}>Item with Icon</MenuItem>
          <MenuItem>Item without Icon</MenuItem>
        </>
      );

      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(scre
}}}