import type { Meta, StoryObj } from '@storybook/react';
import { Popover, PopoverTrigger, PopoverContent, PopoverArrow } from './Popover';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import { Avatar } from '../Avatar/Avatar';
import { Badge } from '../Badge/Badge';
import { IconButton } from '../IconButton/IconButton';
import { useState } from 'react';
import { Info, Settings, User, ChevronDown, MapPin, Clock, Star, Check } from 'lucide-react';

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A floating panel that appears on demand, providing contextual information or actions for BOOM Card platform.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Discount Details</h4>
            <p className="text-sm text-muted-foreground">
              View and manage your discount card benefits.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm">Status</span>
              <Badge variant="success" className="col-span-2 justify-center">
                Active
              </Badge>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm">Discount</span>
              <span className="col-span-2 text-sm font-medium">20% off dining</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const WithArrow: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <IconButton variant="ghost" size="sm">
          <Info className="h-4 w-4" />
        </IconButton>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <PopoverArrow />
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">How BOOM Card Works</h4>
          <p className="text-sm text-muted-foreground">
            Show your QR code at participating venues to receive instant discounts. 
            No pre-booking required!
          </p>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const RestaurantInfo: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <Avatar src="/restaurant-logo.jpg" alt="Restaurant" size="lg" />
            <div className="flex-1">
              <h3 className="font-semibold">Sofia's Garden Restaurant</h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                <span>Sofia Center</span>
              </div>
            </div>
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <Avatar src="/restaurant-logo.jpg" alt="Restaurant" size="xl" />
            <div className="flex-1 space-y-1">
              <h3 className="font-semibold text-lg">Sofia's Garden Restaurant</h3>
              <div className="flex items-center space-x-2">
                <Badge variant="success">20% off</Badge>
                <Badge variant="outline">Fine Dining</Badge>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>123 Vitosha Blvd, Sofia 1000</span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Mon-Sun: 11:00 AM - 11:00 PM</span>
            </div>
            <div className="flex items-center text-sm">
              <Star className="h-4 w-4 mr-2 text-yellow-500" />
              <span className="font-medium">4.8</span>
              <span className="text-muted-foreground ml-1">(324 reviews)</span>
            </div>
          </div>
          
          <div className="pt-3 border-t">
            <h4 className="font-medium text-sm mb-2">Discount Details</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-center">
                <Check className="h-3 w-3 mr-2 text-green-600" />
                20% off total bill
              </li>
              <li className="flex items-center">
                <Check className="h-3 w-3 mr-2 text-green-600" />
                Valid for dine-in only
              </li>
              <li className="flex items-center">
                <Check className="h-3 w-3 mr-2 text-green-600" />
                Maximum 4 people per card
              </li>
            </ul>
          </div>
          
          <div className="flex gap-2 pt-3">
            <Button className="flex-1">View Details</Button>
            <Button variant="outline" className="flex-1">Get Directions</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const UserProfile: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar src="/user-avatar.jpg" alt="User" size="sm" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Avatar src="/user-avatar.jpg" alt="User" size="lg" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">John Doe</h4>
              <p className="text-xs text-muted-foreground">john.doe@example.com</p>
              <Badge variant="premium" className="text-xs">Premium Member</Badge>
            </div>
          </div>
          
          <div className="border-t pt-3 space-y-2">
            <Button variant="ghost" className="w-full justify-start text-sm">
              <User className="mr-2 h-4 w-4" />
              My Profile
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm">
              <Settings className="mr-2 h-4 w-4" />
              Account Settings
            </Button>
          </div>
          
          <div className="border-t pt-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Savings this month</span>
                <span className="font-semibold text-green-600">€124.50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active discounts</span>
                <span className="font-semibold">47</span>
              </div>
            </div>
          </div>
          
          <Button variant="outline" className="w-full text-sm">
            Sign Out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const ControlledPopover: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <div className="flex items-center gap-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              {open ? 'Close' : 'Open'} Controlled Popover
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-3">
              <h4 className="font-medium">Controlled Popover</h4>
              <p className="text-sm text-muted-foreground">
                This popover's open state is controlled programmatically.
              </p>
              <Button onClick={() => setOpen(false)} size="sm">
                Close Popover
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <span className="text-sm text-muted-foreground">
          Status: {open ? 'Open' : 'Closed'}
        </span>
      </div>
    );
  },
};

export const Placements: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-8 p-20">
      {(['top', 'right', 'bottom', 'left', 'top-start', 'top-end', 'bottom-start', 'bottom-end'] as const).map((placement) => (
        <Popover key={placement}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              {placement}
            </Button>
          </PopoverTrigger>
          <PopoverContent side={placement.includes('-') ? placement.split('-')[0] as any : placement as any} align={placement.includes('-') ? placement.split('-')[1] as any : undefined}>
            <PopoverArrow />
            <p className="text-sm">Popover placed at {placement}</p>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
};

export const NestedPopovers: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Open First Popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <h4 className="font-medium">First Level Popover</h4>
          <p className="text-sm text-muted-foreground">
            T
}