import type { Meta, StoryObj } from '@storybook/react';
import { Form } from './Form';
import { Input } from '../Input/Input';
import { Select } from '../Select/Select';
import { Checkbox } from '../Checkbox/Checkbox';
import { Radio } from '../Radio/Radio';
import { Textarea } from '../Textarea/Textarea';
import { Button } from '../Button/Button';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const meta: Meta<typeof Form> = {
  title: 'Components/Form',
  component: Form,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Form component for BOOM Card platform with validation and error handling',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Form>;

// Basic form example
export const Default: Story = {
  render: () => {
    const [formData, setFormData] = useState<any>(null);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const data = new FormData(e.target as HTMLFormElement);
      setFormData(Object.fromEntries(data));
    };

    return (
      <div className="w-full max-w-md">
        <Form onSubmit={handleSubmit}>
          <Form.Field>
            <Form.Label htmlFor="email">Email</Form.Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              required
            />
          </Form.Field>

          <Form.Field>
            <Form.Label htmlFor="password">Password</Form.Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </Form.Field>

          <Button type="submit" className="w-full">
            Submit
          </Button>
        </Form>

        {formData && (
          <pre className="mt-4 p-4 bg-gray-100 rounded">
            {JSON.stringify(formData, null, 2)}
          </pre>
        )}
      </div>
    );
  },
};

// Partner registration form
export const PartnerRegistration: Story = {
  render: () => {
    const partnerSchema = z.object({
      businessName: z.string().min(2, 'Business name must be at least 2 characters'),
      businessType: z.string().min(1, 'Please select a business type'),
      email: z.string().email('Invalid email address'),
      phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
      address: z.string().min(5, 'Address must be at least 5 characters'),
      city: z.string().min(2, 'City must be at least 2 characters'),
      postalCode: z.string().min(4, 'Invalid postal code'),
      contactPerson: z.string().min(2, 'Contact person name is required'),
      discountPercentage: z.number().min(5).max(50),
      description: z.string().min(50, 'Description must be at least 50 characters'),
      terms: z.boolean().refine((val) => val === true, 'You must accept the terms'),
    });

    type PartnerFormData = z.infer<typeof partnerSchema>;

    const {
      register,
      handleSubmit,
      formState: { errors },
      watch,
    } = useForm<PartnerFormData>({
      resolver: zodResolver(partnerSchema),
    });

    const onSubmit = (data: PartnerFormData) => {
      console.log('Partner registration data:', data);
    };

    const businessTypes = [
      { value: 'restaurant', label: 'Restaurant' },
      { value: 'cafe', label: 'Café' },
      { value: 'bar', label: 'Bar' },
      { value: 'hotel', label: 'Hotel' },
      { value: 'spa', label: 'Spa & Wellness' },
      { value: 'entertainment', label: 'Entertainment' },
      { value: 'other', label: 'Other' },
    ];

    return (
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">Partner Registration</h2>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Field>
              <Form.Label htmlFor="businessName">Business Name *</Form.Label>
              <Input
                id="businessName"
                {...register('businessName')}
                placeholder="Your Business Name"
              />
              {errors.businessName && (
                <Form.Error>{errors.businessName.message}</Form.Error>
              )}
            </Form.Field>

            <Form.Field>
              <Form.Label htmlFor="businessType">Business Type *</Form.Label>
              <Select
                id="businessType"
                {...register('businessType')}
                defaultValue=""
              >
                <option value="" disabled>
                  Select business type
                </option>
                {businessTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
              {errors.businessType && (
                <Form.Error>{errors.businessType.message}</Form.Error>
              )}
            </Form.Field>

            <Form.Field>
              <Form.Label htmlFor="email">Email *</Form.Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="business@email.com"
              />
              {errors.email && <Form.Error>{errors.email.message}</Form.Error>}
            </Form.Field>

            <Form.Field>
              <Form.Label htmlFor="phone">Phone *</Form.Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="+359 88 123 4567"
              />
              {errors.phone && <Form.Error>{errors.phone.message}</Form.Error>}
            </Form.Field>

            <Form.Field>
              <Form.Label htmlFor="contactPerson">Contact Person *</Form.Label>
              <Input
                id="contactPerson"
                {...register('contactPerson')}
                placeholder="John Doe"
              />
              {errors.contactPerson && (
                <Form.Error>{errors.contactPerson.message}</Form.Error>
              )}
            </Form.Field>

            <Form.Field>
              <Form.Label htmlFor="discountPercentage">
                Discount Percentage (5-50%) *
              </Form.Label>
              <Input
                id="discountPercentage"
                type="number"
                min="5"
                max="50"
                {...register('discountPercentage', { valueAsNumber: true })}
                placeholder="15"
              />
              {errors.discountPercentage && (
                <Form.Error>{errors.discountPercentage.message}</Form.Error>
              )}
            </Form.Field>

            <Form.Field className="md:col-span-2">
              <Form.Label htmlFor="address">Address *</Form.Label>
              <Input
                id="address"
                {...register('address')}
                placeholder="123 Main Street"
              />
              {errors.address && <Form.Error>{errors.address.message}</Form.Error>}
            </Form.Field>

            <Form.Field>
              <Form.Label htmlFor="city">City *</Form.Label>
              <Input id="city" {...register('city')} placeholder="Sofia" />
              {errors.city && <Form.Error>{errors.city.message}</Form.Error>}
            </Form.Field>

            <Form.Field>
              <Form.Label htmlFor="postalCode">Postal Code *</Form.Label>
              <Input
                id="postalCode"
                {...register('postalCode')}
                placeholder="1000"
              />
              {errors.postalCode && (
                <Form.Error>{errors.postalCode.message}</Form.Error>
              )}
            </Form.Field>

            <Form.Field className="md:col-span-2">
              <Form.Label htmlFor="description">
                Business Description *
              </Form.Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Tell us about your business (minimum 50 characters)"
                rows={4}
              />
              {errors.description && (
                <Form.Error>{errors.description.message}</Form.Error>
              )}
            </Form.Field>

            <Form.Field className="md:col-span-2">
              <div className="flex items-start">
                <Checkbox
                  id="terms"
                  {...register('terms')}
                  className="mt-1"
                />
                <Form.Label
                  htmlFor="terms"
                  className="ml-2 text-sm font-normal"
                >
                  I agree to the terms and conditions and privacy policy *
                </Form.Label>
              </div>
              {errors.terms && <Form.Error>{errors.terms.message}</Form.Error>}
            </Form.Field>
          </div>

          <div className="mt-6 flex gap-4">
            <Button type="submit" size="lg">
              Register as Partner
            </Button>
            <Button type="button" variant="outline" size="lg">
              Cancel
            </Button>
          </div>
        </Form>
      </div>
    );
  },
};

// User subscription form
export const UserSubscription: Story = {
  render: () => {
    const [selectedPlan, setSelectedPlan] = useState('monthly');

    const subscriptionPlans = [
      { id: 'monthly', name: 'Monthly', price: '9.99', period: 'month' },
      { id: 'quarterly', name: 'Quarterly', price: '24.99', period: '3 months' },
      { id: 'annual', name: 'Annual', price: '89.99', period: 'year' },
    ];

    return (
      <div className="w-full max-w-lg">
        <h2 className="text-2xl font-
}}