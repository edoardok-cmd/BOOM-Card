import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Slider } from './Slider';

const meta = {
  title: 'Components/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A customizable slider component for selecting numeric values or ranges.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'number',
      description: 'Current value of the slider',
    },
    min: {
      control: 'number',
      description: 'Minimum value',
      defaultValue: 0,
    },
    max: {
      control: 'number',
      description: 'Maximum value',
      defaultValue: 100,
    },
    step: {
      control: 'number',
      description: 'Step increment',
      defaultValue: 1,
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the slider is disabled',
      defaultValue: false,
    },
    label: {
      control: 'text',
      description: 'Label for the slider',
    },
    showValue: {
      control: 'boolean',
      description: 'Whether to show the current value',
      defaultValue: true,
    },
    showMinMax: {
      control: 'boolean',
      description: 'Whether to show min/max values',
      defaultValue: true,
    },
    marks: {
      control: 'object',
      description: 'Custom marks on the slider',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'error'],
      description: 'Color theme of the slider',
      defaultValue: 'primary',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of the slider',
      defaultValue: 'medium',
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Orientation of the slider',
      defaultValue: 'horizontal',
    },
    formatValue: {
      description: 'Function to format the displayed value',
    },
    onChange: {
      action: 'changed',
      description: 'Callback when value changes',
    },
    onChangeCommitted: {
      action: 'changeCommitted',
      description: 'Callback when value change is committed',
    },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default slider
export const Default: Story = {
  args: {
    min: 0,
    max: 100,
    step: 1,
    label: 'Discount Percentage',
  },
  render: (args) => {
    const [value, setValue] = useState(50);
    return (
      <div style={{ width: '300px' }}>
        <Slider
          {...args}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
            args.onChange?.(newValue);
          }}
        />
      </div>
    );
  },
};

// Price range slider
export const PriceRange: Story = {
  args: {
    min: 0,
    max: 500,
    step: 10,
    label: 'Price Range (BGN)',
    formatValue: (value: number) => `${value} BGN`,
    marks: {
      0: '0',
      100: '100',
      250: '250',
      500: '500+',
    },
  },
  render: (args) => {
    const [value, setValue] = useState(250);
    return (
      <div style={{ width: '400px' }}>
        <Slider
          {...args}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
            args.onChange?.(newValue);
          }}
        />
      </div>
    );
  },
};

// Distance slider
export const Distance: Story = {
  args: {
    min: 0,
    max: 50,
    step: 1,
    label: 'Maximum Distance',
    formatValue: (value: number) => value === 50 ? '50+ km' : `${value} km`,
    marks: {
      0: '0 km',
      10: '10 km',
      25: '25 km',
      50: '50+ km',
    },
  },
  render: (args) => {
    const [value, setValue] = useState(10);
    return (
      <div style={{ width: '400px' }}>
        <Slider
          {...args}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
            args.onChange?.(newValue);
          }}
        />
      </div>
    );
  },
};

// Rating slider
export const Rating: Story = {
  args: {
    min: 0,
    max: 5,
    step: 0.5,
    label: 'Minimum Rating',
    formatValue: (value: number) => `${value} ★`,
    marks: {
      0: '0 ★',
      1: '1 ★',
      2: '2 ★',
      3: '3 ★',
      4: '4 ★',
      5: '5 ★',
    },
    color: 'warning',
  },
  render: (args) => {
    const [value, setValue] = useState(3.5);
    return (
      <div style={{ width: '400px' }}>
        <Slider
          {...args}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
            args.onChange?.(newValue);
          }}
        />
      </div>
    );
  },
};

// Discount percentage slider
export const DiscountPercentage: Story = {
  args: {
    min: 5,
    max: 50,
    step: 5,
    label: 'Minimum Discount',
    formatValue: (value: number) => `${value}%`,
    marks: {
      5: '5%',
      15: '15%',
      25: '25%',
      35: '35%',
      50: '50%',
    },
    color: 'success',
  },
  render: (args) => {
    const [value, setValue] = useState(20);
    return (
      <div style={{ width: '400px' }}>
        <Slider
          {...args}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
            args.onChange?.(newValue);
          }}
        />
      </div>
    );
  },
};

// Time range slider
export const TimeRange: Story = {
  args: {
    min: 0,
    max: 24,
    step: 0.5,
    label: 'Opening Hours',
    formatValue: (value: number) => {
      const hours = Math.floor(value);
      const minutes = (value % 1) * 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    },
    marks: {
      0: '00:00',
      6: '06:00',
      12: '12:00',
      18: '18:00',
      24: '24:00',
    },
  },
  render: (args) => {
    const [value, setValue] = useState(12);
    return (
      <div style={{ width: '500px' }}>
        <Slider
          {...args}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
            args.onChange?.(newValue);
          }}
        />
      </div>
    );
  },
};

// Disabled slider
export const Disabled: Story = {
  args: {
    min: 0,
    max: 100,
    value: 75,
    disabled: true,
    label: 'Disabled Slider',
  },
};

// Small size slider
export const SmallSize: Story = {
  args: {
    min: 0,
    max: 100,
    size: 'small',
    label: 'Small Slider',
  },
  render: (args) => {
    const [value, setValue] = useState(30);
    return (
      <div style={{ width: '300px' }}>
        <Slider
          {...args}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
            args.onChange?.(newValue);
          }}
        />
      </div>
    );
  },
};

// Large size slider
export const LargeSize: Story = {
  args: {
    min: 0,
    max: 100,
    size: 'large',
    label: 'Large Slider',
  },
  render: (args) => {
    const [value, setValue] = useState(70);
    return (
      <div style={{ width: '300px' }}>
        <Slider
          {...args}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
            args.onChange?.(newValue);
          }}
        />
      </div>
    );
  },
};

// Vertical slider
export const Vertical: Story = {
  args: {
    min: 0,
    max: 100,
    orientation: 'vertical',
    label: 'Volume',
    formatValue: (value: number) => `${value}%`,
  },
  render: (args) => {
    const [value, setValue] = useState(60);
    return (
      <div style={{ height: '300px', display: 'flex', alignItems: 'center' }}>
        <Slider
          {...args}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
            args.onChange?.(newValue);
          }}
        />
      </div>
    );
  },
};

// Without labels
export const WithoutLabels: Story = {
  args: {
    min: 0,
    max: 100,
    showValue: false,
    showMinMax: false,
  },
  render: (args) => {
    const [value, setValue] = useState(40);
    return (
      <div style={{ width: '300px' }}>
        <Slider
          {...args}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
            args.onChange?.(newValue);
          }}
        />
      </div>
    );
  },
};

// Multiple sliders example
export const FilterExample: Story = {
  render: () => {
    const [price, setPrice] = useState(100);
    const [distance, setDistance] = useState(5);
    const [discount, setDiscount] = useState(15);
    const [rating, setRating] = useState(3);

    return (
      <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <Slider
          label="Maximum Price (BGN)"
          min={0}
          max={300}
          step={10}
          value={price}
          onChange={setPrice}
          formatValue={(value) => `${value} BGN`}
          marks={{
            0: '0',
            100: '100',
            200: '200',
            300: '300+',
          }}
        />
        
        <Slider
          label="Maximum Distance"
          min={0}
          max={20}
          step={1}
          value={distance}
          onChange={setDistance}
          formatValue={(value) => `${value} km`}
          marks={{
            0: '0 km',
            5: '5 km',
            10: '10 km',
            20: '20+ km',
          }}
          color="secondary"
        />
        
        <Slider
          label="Minimum Discount"
          min={5}
          max={50}
          step={5}
          value={discount}
          onChange={setDiscount}
          formatValue={(value) => `${value}%`}
          marks={{
            5: '5%',
            20: '20%',
            35: '35%',
            50: '50%',
          }}
          color="success"
        />
        
        <Slider
          label="Minimum Rating"
          min={1}
          max={5}
          step={0.5}
          value={rating}
          onChange={setRating}
          formatValue={(value) => `${value} ★`}
          marks={{
            1: '1 ★',
            3: '3 ★',
            5: '5 ★',
          }}
          color="warning"
        />
      </div>
    );
  },
};

// Custom styled slider
export const CustomStyled: Story = {
  args: {
    min: 0,
    max: 100,
    label: 'Custom Styled Slider',
    className: 'custom-slider',
  },
  parameters: {
    docs: {
      source: {
        code: `
// Custom CSS
.custom-slider {
  --slider-track-color: #e0e0e0;
  --slider-fill-color: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  --slider-thumb-color: #764ba2;
  --slider-thumb-shadow: 0 2px 8px rgba(118, 75, 162, 0.3);
}
        `,
      },
    },
  },
  render: (args) => {
    const [value, setValue] = useState(65);
    return (
      <div style={{ width: '400px' }}>
        <style>{`
          .custom-slider {
            --slider-track-color: #e0e0e0;
            --slider-fill-color: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            --slider-thumb-color: #764ba2;
            --slider-thumb-shadow: 0 2px 8px rgba(118, 75, 162, 0.3);
          }
        `}</style>
        <Slider
          {...args}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
            args.onChange?.(newValue);
          }}
        />
      </div>
    );
  },
};
