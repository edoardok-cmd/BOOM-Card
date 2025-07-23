import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './Modal';
import { Button } from '../Button/Button';
import { useState } from 'react';
import { action } from '@storybook/addon-actions';

const meta = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Modal component for BOOM Card platform with various configurations and use cases.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls the visibility of the modal',
    },
    onClose: {
      action: 'closed',
      description: 'Callback function when modal is closed',
    },
    title: {
      control: 'text',
      description: 'Modal title',
    },
    size: {
      control: {
        type: 'select',
        options: ['sm', 'md', 'lg', 'xl', 'full'],
      },
      description: 'Modal size variants',
    },
    closeOnOverlayClick: {
      control: 'boolean',
      description: 'Whether clicking the overlay closes the modal',
    },
    closeOnEsc: {
      control: 'boolean',
      description: 'Whether pressing Escape closes the modal',
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Whether to show the close button',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    overlayClassName: {
      control: 'text',
      description: 'Additional CSS classes for overlay',
    },
    preventScroll: {
      control: 'boolean',
      description: 'Prevent body scroll when modal is open',
    },
    role: {
      control: {
        type: 'select',
        options: ['dialog', 'alertdialog'],
      },
      description: 'ARIA role for accessibility',
    },
    footer: {
      control: false,
      description: 'Modal footer content',
    },
    centered: {
      control: 'boolean',
      description: 'Center modal vertically',
    },
    animation: {
      control: {
        type: 'select',
        options: ['fade', 'slide', 'scale', 'none'],
      },
      description: 'Animation type',
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic modal
export const Default: Story = {
  args: {
    isOpen: true,
    title: 'Welcome to BOOM Card',
    onClose: action('closed'),
    children: (
      <div className="space-y-4">
        <p className="text-gray-600">
          Discover exclusive discounts at restaurants, hotels, spas, and entertainment venues across Bulgaria.
        </p>
        <p className="text-gray-600">
          Join thousands of members saving up to 50% on their favorite experiences.
        </p>
      </div>
    ),
  },
};

// Interactive modal with state management
export const Interactive: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal
          {...args}
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            action('closed')();
          }}
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              This is an interactive modal that can be opened and closed.
            </p>
            <Button onClick={() => setIsOpen(false)} variant="primary" size="sm">
              Close from inside
            </Button>
          </div>
        </Modal>
      </>
    );
  },
  args: {
    title: 'Interactive Modal',
  },
};

// Partner registration modal
export const PartnerRegistration: Story = {
  args: {
    isOpen: true,
    title: 'Become a BOOM Partner',
    size: 'lg',
    onClose: action('closed'),
    children: (
      <form className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Restaurant Sofia"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Type
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option>Restaurant</option>
              <option>Hotel</option>
              <option>Spa & Wellness</option>
              <option>Entertainment</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="contact@business.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="+359 888 123 456"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Discount Percentage
          </label>
          <input
            type="number"
            min="5"
            max="50"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="20"
          />
        </div>
      </form>
    ),
    footer: (
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={action('cancelled')}>
          Cancel
        </Button>
        <Button variant="primary" onClick={action('submitted')}>
          Submit Application
        </Button>
      </div>
    ),
  },
};

// Discount details modal
export const DiscountDetails: Story = {
  args: {
    isOpen: true,
    title: 'Restaurant Sofia - 25% Discount',
    size: 'md',
    onClose: action('closed'),
    children: (
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Offer Details</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• 25% off total bill</li>
            <li>• Valid for dine-in only</li>
            <li>• Maximum 4 people per card</li>
            <li>• Not valid on holidays</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">Location</h3>
          <p className="text-gray-600">123 Vitosha Boulevard, Sofia 1000</p>
          <p className="text-gray-600">Open: Mon-Sun 11:00 - 23:00</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">How to Redeem</h3>
          <ol className="list-decimal list-inside space-y-1 text-gray-600">
            <li>Show your BOOM Card QR code</li>
            <li>Staff will scan and verify</li>
            <li>Discount applied automatically</li>
          </ol>
        </div>
      </div>
    ),
    footer: (
      <div className="flex justify-between items-center">
        <Button variant="ghost" size="sm" onClick={action('share')}>
          Share Offer
        </Button>
        <Button variant="primary" onClick={action('getDirections')}>
          Get Directions
        </Button>
      </div>
    ),
  },
};

// Subscription modal
export const SubscriptionPlans: Story = {
  args: {
    isOpen: true,
    title: 'Choose Your BOOM Card Plan',
    size: 'xl',
    onClose: action('closed'),
    centered: true,
    children: (
      <div className="grid md:grid-cols-3 gap-6">
        {/* Monthly Plan */}
        <div className="border border-gray-200 rounded-lg p-6 hover:border-primary-500 transition-colors">
          <h3 className="text-xl font-semibold mb-2">Monthly</h3>
          <div className="mb-4">
            <span className="text-3xl font-bold">€9.99</span>
            <span className="text-gray-500">/month</span>
          </div>
          <ul className="space-y-2 text-sm text-gray-600 mb-6">
            <li>✓ Access to all partners</li>
            <li>✓ Up to 50% discounts</li>
            <li>✓ Mobile app access</li>
            <li>✓ Cancel anytime</li>
          </ul>
          <Button variant="secondary" className="w-full" onClick={action('monthly-selected')}>
            Select Monthly
          </Button>
        </div>

        {/* Annual Plan */}
        <div className="border-2 border-primary-500 rounded-lg p-6 relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm">
              Best Value
            </span>
          </div>
          <h3 className="text-xl font-semibold mb-2">Annual</h3>
          <div className="mb-4">
            <span className="text-3xl font-bold">€79.99</span>
            <span className="text-gray-500">/year</span>
            <p className="text-sm text-green-600 mt-1">Save €40</p>
          </div>
          <ul className="space-y-2 text-sm text-gray-600 mb-6">
            <li>✓ Everything in Monthly</li>
            <li>✓ Priority support</li>
            <li>✓ Exclusive partner offers</li>
            <li>✓ Gift card options</li>
          </ul>
          <Button variant="primary" className="w-full" onClick={action('annual-selected')}>
            Select Annual
          </Button>
        </div>

        {/* Corporate Plan */}
        <div className="border border-gray-200 rounded-lg p-6 hover:border-primary-500 transition-colors">
          <h3 className="text-xl font-semibold mb-2">Corporate</h3>
          <div className="mb-4">
            <span className="text-3xl font-bold">Custom</span>
            <span className="text-gray-500">/pricing</span>
          </div>
          <ul className="space-y-2 text-sm text-gray-600 mb-6">
            <li>✓ Everything in Annual</li>
            <li>✓ Multiple card management</li>
            <li>✓ Usage analytics</li>
            <li>✓ Dedicated account manager</li>
          </ul>
          <Button variant="secondary" className="w-full" onClick={action('corporate-inquiry')}>
            Contact Sales
          </Button>
        </div>
      </div>
    ),
  },
};

// QR Code modal
export const QRCodeDisplay: Story = {
  args: {
    isOpen: true,
    title: 'Your BOOM Card QR Code',
    size: 'sm',
    centered: true,
    onClose: action('closed'),
    children: (
      <div className="text-center space-y-4">
        <div className="bg-white p-8 rounded-lg shadow-inner mx-auto w-64 h-64 flex items-center justify-center">
          <div className="text-gray-400">
            [QR Code Placeholder]
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Show this code to your server or cashier to redeem your discount
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="ghost" size="sm" onClick={action('download')}>
            Download
          </Button>
          <Button variant="ghost" size="sm" onClick={action('share')}>
            Share
          </Button>
        </div>
      </div>
    ),
  },
};

// Error modal
export const ErrorModal: Story = {
  args: {
    isOpen: true,
    title: 'Payment Failed',
    size: 'sm',
    centered: true,
    onClose: action('closed'),
    children: (
      <div className="text-center space-y-4">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <p cla
}}