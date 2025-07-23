import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ThemeProvider } from 'styled-components';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '../Tabs';
import { lightTheme, darkTheme } from '../../theme';

expect.extend(toHaveNoViolations);

const renderWithTheme = (component: React.ReactElement, theme = lightTheme) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('Tabs Component', () => {
  const defaultTabs = [
    { id: 'tab1', label: 'Tab 1', content: 'Content 1' },
    { id: 'tab2', label: 'Tab 2', content: 'Content 2' },
    { id: 'tab3', label: 'Tab 3', content: 'Content 3' },
  ];

  describe('Basic Rendering', () => {
    it('should render tabs with correct structure', () => {
      renderWithTheme(
        <Tabs defaultValue="tab1">
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
            <Tab value="tab2">Tab 2</Tab>
            <Tab value="tab3">Tab 3</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="tab1">Content 1</TabPanel>
            <TabPanel value="tab2">Content 2</TabPanel>
            <TabPanel value="tab3">Content 3</TabPanel>
          </TabPanels>
        </Tabs>
      );

      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getAllByRole('tab')).toHaveLength(3);
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = renderWithTheme(
        <Tabs defaultValue="tab1" className="custom-tabs">
          <TabList className="custom-tablist">
            <Tab value="tab1" className="custom-tab">Tab 1</Tab>
          </TabList>
          <TabPanels className="custom-panels">
            <TabPanel value="tab1" className="custom-panel">Content 1</TabPanel>
          </TabPanels>
        </Tabs>
      );

      expect(container.querySelector('.custom-tabs')).toBeInTheDocument();
      expect(container.querySelector('.custom-tablist')).toBeInTheDocument();
      expect(container.querySelector('.custom-tab')).toBeInTheDocument();
      expect(container.querySelector('.custom-panels')).toBeInTheDocument();
      expect(container.querySelector('.custom-panel')).toBeInTheDocument();
    });

    it('should render with custom styles', () => {
      const customStyle = { backgroundColor: 'red', padding: '20px' };
      
      const { container } = renderWithTheme(
        <Tabs defaultValue="tab1" style={customStyle}>
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="tab1">Content 1</TabPanel>
          </TabPanels>
        </Tabs>
      );

      const tabsElement = container.firstChild as HTMLElement;
      expect(tabsElement).toHaveStyle('background-color: red');
      expect(tabsElement).toHaveStyle('padding: 20px');
    });
  });

  describe('Tab Selection', () => {
    it('should handle tab selection on click', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(
        <Tabs defaultValue="tab1">
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
            <Tab value="tab2">Tab 2</Tab>
            <Tab value="tab3">Tab 3</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="tab1">Content 1</TabPanel>
            <TabPanel value="tab2">Content 2</TabPanel>
            <TabPanel value="tab3">Content 3</TabPanel>
          </TabPanels>
        </Tabs>
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();

      await user.click(screen.getByRole('tab', { name: 'Tab 2' }));

      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('should handle controlled tabs', async () => {
      const handleChange = jest.fn();
      
      const ControlledTabs = () => {
        const [value, setValue] = React.useState('tab1');
        
        return (
          <Tabs 
            value={value} 
            onChange={(newValue) => {
              setValue(newValue);
              handleChange(newValue);
            }}
          >
            <TabList>
              <Tab value="tab1">Tab 1</Tab>
              <Tab value="tab2">Tab 2</Tab>
            </TabList>
            <TabPanels>
              <TabPanel value="tab1">Content 1</TabPanel>
              <TabPanel value="tab2">Content 2</TabPanel>
            </TabPanels>
          </Tabs>
        );
      };

      renderWithTheme(<ControlledTabs />);

      await user.click(screen.getByRole('tab', { name: 'Tab 2' }));

      expect(handleChange).toHaveBeenCalledWith('tab2');
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('should not change tab when disabled', async () => {
      
      renderWithTheme(
        <Tabs defaultValue="tab1">
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
            <Tab value="tab2" disabled>Tab 2</Tab>
            <Tab value="tab3">Tab 3</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="tab1">Content 1</TabPanel>
            <TabPanel value="tab2">Content 2</TabPanel>
            <TabPanel value="tab3">Content 3</TabPanel>
          </TabPanels>
        </Tabs>
      );

      const disabledTab = screen.getByRole('tab', { name: 'Tab 2' });
      expect(disabledTab).toHaveAttribute('aria-disabled', 'true');

      await user.click(disabledTab);

      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate tabs with arrow keys', async () => {
      
      renderWithTheme(
        <Tabs defaultValue="tab1">
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
            <Tab value="tab2">Tab 2</Tab>
            <Tab value="tab3">Tab 3</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="tab1">Content 1</TabPanel>
            <TabPanel value="tab2">Content 2</TabPanel>
            <TabPanel value="tab3">Content 3</TabPanel>
          </TabPanels>
        </Tabs>
      );

      const firstTab = screen.getByRole('tab', { name: 'Tab 1' });
      firstTab.focus();

      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('tab', { name: 'Tab 3' })).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveFocus();

      await user.keyboard('{ArrowLeft}');
      expect(screen.getByRole('tab', { name: 'Tab 3' })).toHaveFocus();
    });

    it('should skip disabled tabs during keyboard navigation', async () => {
      
      renderWithTheme(
        <Tabs defaultValue="tab1">
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
            <Tab value="tab2" disabled>Tab 2</Tab>
            <Tab value="tab3">Tab 3</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="tab1">Content 1</TabPanel>
            <TabPanel value="tab2">Content 2</TabPanel>
            <TabPanel value="tab3">Content 3</TabPanel>
          </TabPanels>
        </Tabs>
      );

      firstTab.focus();

      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('tab', { name: 'Tab 3' })).toHaveFocus();

      await user.keyboard('{ArrowLeft}');
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveFocus();
    });

    it('should navigate to first/last tab with Home/End keys', async () => {
      
      renderWithTheme(
        <Tabs defaultValue="tab2">
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
            <Tab value="tab2">Tab 2</Tab>
            <Tab value="tab3">Tab 3</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="tab1">Content 1</TabPanel>
            <TabPanel value="tab2">Content 2</TabPanel>
            <TabPanel value="tab3">Content 3</TabPanel>
          </TabPanels>
        </Tabs>
      );

      const secondTab = screen.getByRole('tab', { name: 'Tab 2' });
      secondTab.focus();

      await user.keyboard('{Home}');
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveFocus();

      await user.keyboard('{End}');
      expect(screen.getByRole('tab', { name: 'Tab 3' })).toHaveFocus();
    });

    it('should activate tab on Enter or Space key', async () => {
      
      renderWithTheme(
        <Tabs defaultValue="tab1">
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
            <Tab value="tab2">Tab 2</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="tab1">Content 1</TabPanel>
            <TabPanel value="tab2">Content 2</TabPanel>
          </TabPanels>
        </Tabs>
      );

      firstTab.focus();

      await user.keyboard('{ArrowRight}');
      await user.keyboard('{Enter}');

      expect(screen.getByText('Content 2')).toBeInTheDocument();

      await user.keyboard('{ArrowLeft}');
      await user.keyboard(' ');

      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });
  });

  describe('Orientation', () => {
    it('should render vertical tabs', () => {
     
}}}