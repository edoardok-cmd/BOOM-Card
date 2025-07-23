import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Input } from './Input';
import { SearchIcon, MailIcon, LockIcon, UserIcon, PhoneIcon, CreditCardIcon, CalendarIcon, MapPinIcon } from 'lucide-react';

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile input component with support for icons, validation, and various states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'search', 'url', 'date', 'time', 'datetime-local'],
      description: 'The type of the input field',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the input field',
    },
    variant: {
      control: 'select',
      options: ['default', 'filled', 'flushed', 'unstyled'],
      description: 'The visual style variant of the input',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the input is read-only',
    },
    required: {
      control: 'boolean',
      description: 'Whether the input is required',
    },
    error: {
      control: 'boolean',
      description: 'Whether the input has an error state',
    },
    success: {
      control: 'boolean',
      description: 'Whether the input has a success state',
    },
    loading: {
      control: 'boolean',
      description: 'Whether the input is in a loading state',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input',
    },
    label: {
      control: 'text',
      description: 'Label text for the input',
    },
    helperText: {
      control: 'text',
      description: 'Helper text displayed below the input',
    },
    errorMessage: {
      control: 'text',
      description: 'Error message displayed when error is true',
    },
    successMessage: {
      control: 'text',
      description: 'Success message displayed when success is true',
    },
    showPasswordToggle: {
      control: 'boolean',
      description: 'Whether to show password visibility toggle for password inputs',
    },
    clearable: {
      control: 'boolean',
      description: 'Whether to show a clear button when input has value',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether the input should take full width of its container',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
    label: 'Default Input',
  },
};

// Size variations
export const SmallSize: Story = {
  args: {
    size: 'sm',
    placeholder: 'Small input',
    label: 'Small Size',
  },
};

export const MediumSize: Story = {
  args: {
    size: 'md',
    placeholder: 'Medium input',
    label: 'Medium Size (Default)',
  },
};

export const LargeSize: Story = {
  args: {
    size: 'lg',
    placeholder: 'Large input',
    label: 'Large Size',
  },
};

// Variant styles
export const FilledVariant: Story = {
  args: {
    variant: 'filled',
    placeholder: 'Filled style input',
    label: 'Filled Variant',
  },
};

export const FlushedVariant: Story = {
  args: {
    variant: 'flushed',
    placeholder: 'Flushed style input',
    label: 'Flushed Variant',
  },
};

// Input types
export const EmailInput: Story = {
  args: {
    type: 'email',
    placeholder: 'john@example.com',
    label: 'Email Address',
    leftIcon: <MailIcon className="w-5 h-5" />,
    helperText: 'We\'ll never share your email',
  },
};

export const PasswordInput: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
    label: 'Password',
    leftIcon: <LockIcon className="w-5 h-5" />,
    showPasswordToggle: true,
    helperText: 'Must be at least 8 characters',
  },
};

export const SearchInput: Story = {
  args: {
    type: 'search',
    placeholder: 'Search restaurants, hotels, spas...',
    label: 'Search',
    leftIcon: <SearchIcon className="w-5 h-5" />,
    clearable: true,
  },
};

export const PhoneInput: Story = {
  args: {
    type: 'tel',
    placeholder: '+359 88 123 4567',
    label: 'Phone Number',
    leftIcon: <PhoneIcon className="w-5 h-5" />,
  },
};

export const DateInput: Story = {
  args: {
    type: 'date',
    label: 'Reservation Date',
    leftIcon: <CalendarIcon className="w-5 h-5" />,
  },
};

// States
export const DisabledState: Story = {
  args: {
    placeholder: 'Disabled input',
    label: 'Disabled Input',
    value: 'Cannot edit this',
    disabled: true,
  },
};

export const ReadOnlyState: Story = {
  args: {
    placeholder: 'Read-only input',
    label: 'Read-Only Input',
    value: 'Read-only value',
    readOnly: true,
  },
};

export const LoadingState: Story = {
  args: {
    placeholder: 'Loading...',
    label: 'Loading State',
    loading: true,
  },
};

export const ErrorState: Story = {
  args: {
    placeholder: 'Enter email',
    label: 'Email with Error',
    type: 'email',
    value: 'invalid-email',
    error: true,
    errorMessage: 'Please enter a valid email address',
    leftIcon: <MailIcon className="w-5 h-5" />,
  },
};

export const SuccessState: Story = {
  args: {
    placeholder: 'Enter username',
    label: 'Username',
    value: 'johndoe',
    success: true,
    successMessage: 'Username is available!',
    leftIcon: <UserIcon className="w-5 h-5" />,
  },
};

// With icons
export const WithLeftIcon: Story = {
  args: {
    placeholder: 'Enter location',
    label: 'Location',
    leftIcon: <MapPinIcon className="w-5 h-5" />,
  },
};

export const WithRightIcon: Story = {
  args: {
    placeholder: 'Enter amount',
    label: 'Discount Amount',
    rightIcon: <span className="text-gray-500">%</span>,
    type: 'number',
  },
};

export const WithBothIcons: Story = {
  args: {
    placeholder: '0.00',
    label: 'Total Savings',
    leftIcon: <span className="text-gray-500">BGN</span>,
    rightIcon: <CreditCardIcon className="w-5 h-5" />,
    type: 'number',
  },
};

// Required field
export const RequiredField: Story = {
  args: {
    placeholder: 'Enter your name',
    label: 'Full Name',
    required: true,
    helperText: 'This field is required',
    leftIcon: <UserIcon className="w-5 h-5" />,
  },
};

// Full width
export const FullWidth: Story = {
  args: {
    placeholder: 'Search for discounts...',
    label: 'Search Discounts',
    fullWidth: true,
    leftIcon: <SearchIcon className="w-5 h-5" />,
    clearable: true,
  },
};

// Interactive example with validation
export const InteractiveValidation = () => {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value === '') {
      setIsValid(null);
    } else {
      setIsValid(emailRegex.test(value));
    };

  return (
    <div className="w-96">
      <Input
        type="email"
        label="Email Validation Example"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          validateEmail(e.target.value);
        }}
        leftIcon={<MailIcon className="w-5 h-5" />}
        error={isValid === false}
        success={isValid === true}
        errorMessage={isValid === false ? 'Invalid email format' : undefined}
        successMessage={isValid === true ? 'Valid email!' : undefined}
        helperText="We'll validate as you type"
        clearable
      />
    </div>
  );
};

// Complex form example
export const ComplexFormExample = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    location: '',
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="space-y-4 w-96">
      <h3 className="text-lg font-semibold mb-4">Partner Registration Form</h3>
      
      <Input
        label="Business Name"
        placeholder="Enter business name"
        value={formData.name}
        onChange={handleChange('name')}
        leftIcon={<UserIcon className="w-5 h-5" />}
        required
      />
      
      <Input
        type="email"
        label="Business Email"
        placeholder="business@example.com"
        value={formData.email}
        onChange={handleChange('email')}
        leftIcon={<MailIcon className="w-5 h-5" />}
        required
      />
      
      <Input
        type="tel"
        label="Phone Number"
        placeholder="+359 88 123 4567"
        value={formData.phone}
        onChange={handleChange('phone')}
        leftIcon={<PhoneIcon className="w-5 h-5" />}
      />
      
      <Input
        type="password"
        label="Password"
        placeholder="Create a password"
        value={formData.password}
        onChange={handleChange('password')}
        leftIcon={<LockIcon className="w-5 h-5" />}
        showPasswordToggle
        required
        helperText="Minimum 8 characters"
      />
      
      <Input
        label="Business Location"
        placeholder="Sofia, Bulgaria"
        value={formData.location}
        onChange={handleChange('location')}
        leftIcon={<MapPinIcon className="w-5 h-5" />}
        clearable
      />
    </div>
  );
};

// Discount card specific examples
export const DiscountSearchInput: Story = {
  args: {
    type: 'search',
    placeholder: 'Search restaurants with 20% discount...',
    label: 'Find Discounts',
    leftIcon: <SearchIcon className="w-5 h-5" />,
    clearable: true,
    fullWidth: true,
    helperText: 'Search by business name, location, or discount percentage',
  },
};

export const PromoCodeInput: Story = {
  args: {
    placeholder: 'BOOM2024',
    label: 'Promo Code',
    value: 'SUMMER25',
    success: true,
    successMessage: '25% discount applied!',
    rightIcon: <span className="text-green-600 font-semibold">-25%</span>,
  },
};

export const CardNumberInput: Story = {
  args: {
    placeholder: '1234 5678 9012 3456',
    label: 'BOOM Card Number',
    leftIcon: <CreditCardIcon className="w-5 h-5" />,
    helperText: 'Enter your 16-digit card number',
    maxLength: 19,
  },
};

}
