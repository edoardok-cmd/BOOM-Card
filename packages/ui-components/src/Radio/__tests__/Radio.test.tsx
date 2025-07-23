import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ThemeProvider } from 'styled-components';
import { Radio } from '../Radio';
import { RadioGroup } from '../RadioGroup';
import { defaultTheme } from '../../../theme';

expect.extend(toHaveNoViolations);

// Helper function to render with theme
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={defaultTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('Radio', () => {
  describe('Basic Rendering', () => {
    it('should render radio input', () => {
      renderWithTheme(<Radio name="test" value="option1" />);
      const radio = screen.getByRole('radio');
      expect(radio).toBeInTheDocument();
      expect(radio).toHaveAttribute('type', 'radio');
    });

    it('should render with label', () => {
      renderWithTheme(<Radio name="test" value="option1" label="Option 1" />);
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
    });

    it('should render with custom id', () => {
      renderWithTheme(<Radio id="custom-radio" name="test" value="option1" />);
      expect(radio).toHaveAttribute('id', 'custom-radio');
    });

    it('should generate id when not provided', () => {
      renderWithTheme(<Radio name="test" value="option1" />);
      expect(radio).toHaveAttribute('id');
      expect(radio.id).toMatch(/radio-/);
    });
  });

  describe('States', () => {
    it('should handle checked state', () => {
      renderWithTheme(<Radio name="test" value="option1" checked onChange={() => {}} />);
      expect(radio).toBeChecked();
    });

    it('should handle unchecked state', () => {
      renderWithTheme(<Radio name="test" value="option1" checked={false} onChange={() => {}} />);
      expect(radio).not.toBeChecked();
    });

    it('should handle disabled state', () => {
      renderWithTheme(<Radio name="test" value="option1" disabled />);
      expect(radio).toBeDisabled();
    });

    it('should handle required state', () => {
      renderWithTheme(<Radio name="test" value="option1" required />);
      expect(radio).toBeRequired();
    });

    it('should handle error state', () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="option1" error label="Option 1" />
      );
      const wrapper = container.querySelector('[data-error="true"]');
      expect(wrapper).toBeInTheDocument();
    });

    it('should show error message', () => {
      renderWithTheme(
        <Radio 
          name="test" 
          value="option1" 
          error 
          errorMessage="Please select an option"
          label="Option 1"
        />
      );
      expect(screen.getByText('Please select an option')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onChange when clicked', async () => {
      const handleChange = jest.fn();
      renderWithTheme(
        <Radio name="test" value="option1" onChange={handleChange} label="Option 1" />
      );
      
      await userEvent.click(radio);
      
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            checked: true,
            value: 'option1'
          })
        })
      );
    });

    it('should not call onChange when disabled', async () => {
      renderWithTheme(
        <Radio name="test" value="option1" onChange={handleChange} disabled />
      );
      
      await userEvent.click(radio);
      
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should handle keyboard navigation', async () => {
      renderWithTheme(
        <Radio name="test" value="option1" onChange={handleChange} label="Option 1" />
      );
      
      radio.focus();
      
      fireEvent.keyDown(radio, { key: ' ', code: 'Space' });
      expect(handleChange).toHaveBeenCalled();
    });

    it('should call onFocus when focused', async () => {
      const handleFocus = jest.fn();
      renderWithTheme(
        <Radio name="test" value="option1" onFocus={handleFocus} />
      );
      
      await userEvent.click(radio);
      
      expect(handleFocus).toHaveBeenCalled();
    });

    it('should call onBlur when blurred', async () => {
      const handleBlur = jest.fn();
      renderWithTheme(
        <Radio name="test" value="option1" onBlur={handleBlur} />
      );
      
      await userEvent.click(radio);
      await userEvent.tab();
      
      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('RadioGroup', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' }
    ];

    it('should render all options', () => {
      renderWithTheme(
        <RadioGroup name="test" options={options} />
      );
      
      expect(screen.getAllByRole('radio')).toHaveLength(3);
      expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Option 2')).toBeInTheDocument();
      expect(screen.getByLabelText('Option 3')).toBeInTheDocument();
    });

    it('should handle value selection', async () => {
      renderWithTheme(
        <RadioGroup 
          name="test" 
          options={options} 
          value="option2"
          onChange={handleChange}
        />
      );
      
      const option1 = screen.getByLabelText('Option 1');
      await userEvent.click(option1);
      
      expect(handleChange).toHaveBeenCalledWith('option1');
    });

    it('should render with label', () => {
      renderWithTheme(
        <RadioGroup name="test" options={options} label="Select an option" />
      );
      
      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });

    it('should show error state', () => {
      const { container } = renderWithTheme(
        <RadioGroup 
          name="test" 
          options={options} 
          error 
          errorMessage="Selection required"
        />
      );
      
      expect(screen.getByText('Selection required')).toBeInTheDocument();
      expect(container.querySelector('[data-error="true"]')).toBeInTheDocument();
    });

    it('should disable all options when group is disabled', () => {
      renderWithTheme(
        <RadioGroup name="test" options={options} disabled />
      );
      
      const radios = screen.getAllByRole('radio');
      radios.forEach(radio => {
        expect(radio).toBeDisabled();
      });
    });

    it('should handle horizontal layout', () => {
      const { container } = renderWithTheme(
        <RadioGroup name="test" options={options} orientation="horizontal" />
      );
      
      expect(wrapper).toBeInTheDocument();
    });

    it('should handle vertical layout', () => {
      const { container } = renderWithTheme(
        <RadioGroup name="test" options={options} orientation="vertical" />
      );
      
      expect(wrapper).toBeInTheDocument();
    });

    it('should handle required state', () => {
      renderWithTheme(
        <RadioGroup name="test" options={options} required />
      );
      
      radios.forEach(radio => {
        expect(radio).toBeRequired();
      });
    });
  });

  describe('Variants', () => {
    it('should render default variant', () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="option1" variant="default" />
      );
      
      expect(wrapper).toBeInTheDocument();
    });

    it('should render primary variant', () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="option1" variant="primary" />
      );
      
      expect(wrapper).toBeInTheDocument();
    });

    it('should render secondary variant', () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="option1" variant="secondary" />
      );
      
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="option1" size="small" />
      );
      
      expect(wrapper).toBeInTheDocument();
    });

    it('should render medium size', () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="option1" size="medium" />
      );
      
      expect(wrapper).toBeInTheDocument();
    });

    it('should render large size', () => {
      const { container } = renderWithTheme(
        <
}}}