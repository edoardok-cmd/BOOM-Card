import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ThemeProvider } from '@emotion/react';
import { Slider } from '../Slider';
import { theme } from '../../../theme';
import type { SliderProps } from '../Slider.types';

expect.extend(toHaveNoViolations);

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

const defaultProps: SliderProps = {
  min: 0,
  max: 100,
  step: 1,
  defaultValue: 50,
  'aria-label': 'Test slider',
};

const renderSlider = (props: Partial<SliderProps> = {}) => {
  return render(
    <ThemeProvider theme={theme}>
      <Slider {...defaultProps} {...props} />
    </ThemeProvider>
  );
};

describe('Slider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render slider component', () => {
      renderSlider();
      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
    });

    it('should render with correct default value', () => {
      renderSlider({ defaultValue: 30 });
      expect(slider).toHaveAttribute('aria-valuenow', '30');
    });

    it('should render with controlled value', () => {
      renderSlider({ value: 75 });
      expect(slider).toHaveAttribute('aria-valuenow', '75');
    });

    it('should render with label', () => {
      renderSlider({ label: 'Discount Percentage' });
      expect(screen.getByText('Discount Percentage')).toBeInTheDocument();
    });

    it('should render with helper text', () => {
      renderSlider({ helperText: 'Select discount amount' });
      expect(screen.getByText('Select discount amount')).toBeInTheDocument();
    });

    it('should render value label when showValueLabel is true', () => {
      renderSlider({ showValueLabel: true, value: 25 });
      expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('should render with custom value formatter', () => {
      const formatValue = (value: number) => `${value}%`;
      renderSlider({ 
        showValueLabel: true, 
        value: 50,)
        formatValue 
      });
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should render marks when provided', () => {
      const marks = [
        { value: 0, label: '0%' },
        { value: 50, label: '50%' },
        { value: 100, label: '100%' },
      ];
      renderSlider({ marks });
      
      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should render range slider with two thumbs', () => {
      renderSlider({ 
        range: true, 
        defaultValue: [20, 80],
        'aria-label': ['Min value', 'Max value']
      });
      
      const sliders = screen.getAllByRole('slider');
      expect(sliders).toHaveLength(2);
      expect(sliders[0]).toHaveAttribute('aria-valuenow', '20');
      expect(sliders[1]).toHaveAttribute('aria-valuenow', '80');
    });
  });

  describe('Interactions', () => {
    it('should update value on keyboard navigation', async () => {
      const onChange = jest.fn();
      renderSlider({ onChange });
      
      slider.focus();
      
      // Arrow right increases value
      fireEvent.keyDown(slider, { key: 'ArrowRight' });
      expect(onChange).toHaveBeenCalledWith(51);
      
      // Arrow left decreases value
      fireEvent.keyDown(slider, { key: 'ArrowLeft' });
      expect(onChange).toHaveBeenCalledWith(49);
    });

    it('should respect step value on keyboard navigation', () => {
      renderSlider({ 
        step: 10, 
        value: 50,
        onChange 
      });
      
      slider.focus();
      
      fireEvent.keyDown(slider, { key: 'ArrowRight' });
      expect(onChange).toHaveBeenCalledWith(60);
    });

    it('should jump to min/max with Home/End keys', () => {
      renderSlider({ 
        value: 50,
        onChange 
      });
      
      slider.focus();
      
      fireEvent.keyDown(slider, { key: 'Home' });
      expect(onChange).toHaveBeenCalledWith(0);
      
      fireEvent.keyDown(slider, { key: 'End' });
      expect(onChange).toHaveBeenCalledWith(100);
    });

    it('should handle mouse drag', async () => {
      const { container } = renderSlider({ onChange });
      
      const track = container.querySelector('.boom-slider-track');
      const thumb = screen.getByRole('slider');
      
      if (track && thumb) {
        // Mock getBoundingClientRect
        track.getBoundingClientRect = jest.fn(() => ({
          left: 0,
          right: 200,
          width: 200,
          top: 0,
          bottom: 20,
          height: 20,
          x: 0,
          y: 0,
          toJSON: jest.fn(),
        }));
        
        // Simulate mouse down and drag
        fireEvent.mouseDown(thumb);
        fireEvent.mouseMove(document, { clientX: 100 });
        fireEvent.mouseUp(document);
        
        expect(onChange).toHaveBeenCalled();
      });

    it('should handle touch events', async () => {
      const { container } = renderSlider({ onChange });
      
      
      if (track && thumb) {
        track.getBoundingClientRect = jest.fn(() => ({
          left: 0,
          right: 200,
          width: 200,
          top: 0,
          bottom: 20,
          height: 20,
          x: 0,
          y: 0,
          toJSON: jest.fn(),
        }));
        
        // Simulate touch events
        fireEvent.touchStart(thumb, { 
          touches: [{ clientX: 50, clientY: 10 }] 
        });
        fireEvent.touchMove(document, { 
          touches: [{ clientX: 150, clientY: 10 }] 
        });
        fireEvent.touchEnd(document);
        
        expect(onChange).toHaveBeenCalled();
      });

    it('should prevent interaction when disabled', () => {
      renderSlider({ 
        disabled: true, 
        onChange 
      });
      
      expect(slider).toHaveAttribute('aria-disabled', 'true');
      
      fireEvent.keyDown(slider, { key: 'ArrowRight' });
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should handle range slider interactions', () => {
      renderSlider({ 
        range: true,
        value: [30, 70],
        onChange,
        'aria-label': ['Min', 'Max']
      });
      
      
      // Move first thumb
      sliders[0].focus();
      fireEvent.keyDown(sliders[0], { key: 'ArrowRight' });
      expect(onChange).toHaveBeenCalledWith([31, 70]);
      
      // Move second thumb
      sliders[1].focus();
      fireEvent.keyDown(sliders[1], { key: 'ArrowLeft' });
      expect(onChange).toHaveBeenCalledWith([30, 69]);
    });

    it('should not allow range values to cross', () => {
      renderSlider({ 
        range: true,
        value: [40, 60],
        onChange,
        'aria-label': ['Min', 'Max']
      });
      
      
      // Try to move first thumb beyond second
      sliders[0].focus();
      for (let i = 0; i < 25; i++) {
        fireEvent.keyDown(sliders[0], { key: 'ArrowRight' });
      }
      
      // Value should be clamped
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
      expect(lastCall[0][0]).toBeLessThanOrEqual(60);
    });
  });

  describe('States', () => {
    it('should show error state', () => {
      renderSlider({ 
        error: true,
        helperText: 'Value out of range' 
      });
      
      const helperText = screen.getByText('Value out of range');
      expect(helperText).toHaveClass('error');
    });

    it('should show disabled state', () => {
      const { container } = renderSlider({ disabled: true });
      
      expect(slider).toHaveAttribute('aria-disabled', 'true');
      expect(container.firstChild).toHaveClass('disabled');
    });

    it('should show readonly state', () => {
      renderSlider({ 
        readOnly: true,
        onChange 
      });
      
      expect(slider).toHaveAttribute('aria-readonly', 'true');
      
      fireEvent.keyDown(slider, { key: 'ArrowRight' });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('should clamp value within min/max bounds', () => {
      const { rerender } = renderSlider({ 
        value: 50,
        onChange 
      });
      
      // Try to set value above max
      rerender(
        <ThemeProvider theme={theme}>
          <Slider {...defaultProps} value={150} onChange={onChange} />
        </ThemeProvider>
      );
      
      expect(slider).toHaveAttribute('aria-valuenow', '100');
    });

    it('should snap to step values', () => {
      renderSlider({ 
        step: 10,
        value: 43,
        onChange 
      });
      
      // Value should snap to nearest step
      expect(slider).toHaveAttribute('aria-valuenow', '40');
    });

    it('should validate range values', () => {
      renderSlider({ 
        range: true,
        value: [60, 40], // Invalid: min > max
        onChange,
        'aria-label': ['Min', 'Max']
      });
      
      // Values should be swapped
      expect(sliders[0]).toHaveAttribute('aria-valuenow', '40');
      expect(sliders[1]).toHaveAttribute('aria-valuenow', '60');
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderSlider();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes', () => {
      renderSlider({
        min: 0,
        max: 100,
        value: 75,
        'aria-label': 'Discount percentage'
      });
      
      expect(slider).toHaveAttribute('aria-label', 'Discount percentage');
      expect(slider).toHaveAttribute('aria-valuemin', '0');
      expect(slider).toHaveAttribute('aria-valuemax', '100');
      expect(slider).toHaveAttribute('aria-valuenow', '75');
    });

    it('should announce value changes', async () => {
      const { container } = renderSlider({
        showValueLabel: true,
        value: 50,
        'aria-label': 'Price range'
      });
      
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
    });

    it('should support custom aria-describedby', () => {
      renderSlider({
        'aria-describedby': 'custom-description'
      });
      
      expect(slider).toHaveAttribute('aria-describedby', 'custom-description');
    });
  });

  describe('Theming', () => {
    it('should apply custom colors', () => {
      const { container } = renderSlide
}}}
}
}
