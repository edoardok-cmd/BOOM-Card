import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Drawer } from './Drawer';
import { Button } from '../Button';
import { Typography } from '../Typography';
import { IconButton } from '../IconButton';
import { CloseIcon, MenuIcon, FilterIcon, ShoppingCartIcon, UserIcon } from '../Icons';
import { TextField } from '../TextField';
import { Switch } from '../Switch';
import { Divider } from '../Divider';
import { List, ListItem, ListItemText, ListItemIcon } from '../List';
import { Badge } from '../Badge';
import { Avatar } from '../Avatar';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A sliding panel component that can be anchored to any side of the viewport. Perfect for navigation menus, filters, shopping carts, and user profiles in the BOOM Card platform.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    anchor: {
      control: 'select',
      options: ['left', 'right', 'top', 'bottom'],
      description: 'The side from which the drawer will appear',
    },
    open: {
      control: 'boolean',
      description: 'If true, the drawer is open',
    },
    variant: {
      control: 'select',
      options: ['temporary', 'persistent', 'permanent'],
      description: 'The variant to use',
    },
    onClose: {
      action: 'closed',
      description: 'Callback fired when the drawer requests to be closed',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

// Default story
export const Default: Story = {
  args: {
    anchor: 'left',
    open: true,
    variant: 'temporary',
  },
  render: (args) => {
    const [open, setOpen] = useState(args.open);
    
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Drawer</Button>
        <Drawer {...args} open={open} onClose={() => setOpen(false)}>
          <div style={{ width: 250, padding: '20px' }}>
            <Typography variant="h6" gutterBottom>
              Drawer Content
            </Typography>
            <Typography variant="body2" color="textSecondary">
              This is a simple drawer example
            </Typography>
          </div>
        </Drawer>
      </>
    );
  },
};

// Navigation Menu Story
export const NavigationMenu: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    const menuItems = [
      { icon: '🍽️', label: 'Food & Drink', badge: '15% OFF' },
      { icon: '🎉', label: 'Entertainment', badge: 'NEW' },
      { icon: '🏨', label: 'Accommodation' },
      { icon: '💆', label: 'Experiences' },
      { icon: '🎁', label: 'Special Offers', badge: '3' },
    ];
    
    return (
      <>
        <IconButton onClick={() => setOpen(true)} aria-label="open menu">
          <MenuIcon />
        </IconButton>
        
        <Drawer
          anchor="left"
          open={open}
          onClose={() => setOpen(false)}
          variant="temporary"
        >
          <div style={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e0e0e0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">BOOM Card</Typography>
                <IconButton onClick={() => setOpen(false)} size="small">
                  <CloseIcon />
                </IconButton>
              </div>
            </div>
            
            <List style={{ flex: 1, padding: '8px 0' }}>
              {menuItems.map((item, index) => (
                <ListItem button key={index} onClick={() => setOpen(false)}>
                  <ListItemIcon>
                    <span style={{ fontSize: '24px' }}>{item.icon}</span>
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                  {item.badge && (
                    <Badge 
                      color={item.badge === 'NEW' ? 'primary' : 'secondary'} 
                      variant={item.badge === 'NEW' ? 'dot' : 'standard'}
                    >
                      {item.badge !== 'NEW' && item.badge}
                    </Badge>
                  )}
                </ListItem>
              ))}
            </List>
            
            <Divider />
            
            <div style={{ padding: '16px 20px' }}>
              <Button fullWidth variant="contained" color="primary">
                Get Premium
              </Button>
            </div>
          </div>
        </Drawer>
      </>
    );
  },
};

// Filter Panel Story
export const FilterPanel: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [priceRange, setPriceRange] = useState([0, 100]);
    const [categories, setCategories] = useState({
      restaurants: true,
      cafes: false,
      bars: true,
      hotels: false,
    });
    
    return (
      <>
        <Button 
          startIcon={<FilterIcon />} 
          onClick={() => setOpen(true)}
          variant="outlined"
        >
          Filters
        </Button>
        
        <Drawer
          anchor="right"
          open={open}
          onClose={() => setOpen(false)}
          variant="temporary"
        >
          <div style={{ width: 320, padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <Typography variant="h6">Filters</Typography>
              <IconButton onClick={() => setOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <Typography variant="subtitle2" gutterBottom>
                Location
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter city or area"
                variant="outlined"
                size="small"
              />
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <Typography variant="subtitle2" gutterBottom>
                Categories
              </Typography>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(categories).map(([key, value]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" style={{ textTransform: 'capitalize' }}>
                      {key}
                    </Typography>
                    <Switch
                      checked={value}
                      onChange={(e) => setCategories({ ...categories, [key]: e.target.checked })}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <Typography variant="subtitle2" gutterBottom>
                Discount Range
              </Typography>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <TextField
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  label="Min %"
                  variant="outlined"
                  size="small"
                />
                <TextField
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  label="Max %"
                  variant="outlined"
                  size="small"
                />
              </div>
            </div>
            
            <Divider style={{ margin: '24px 0' }} />
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => {
                  setPriceRange([0, 100]);
                  setCategories({
                    restaurants: false,
                    cafes: false,
                    bars: false,
                    hotels: false,
                  });
                }}
              >
                Clear All
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth
                onClick={() => setOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </Drawer>
      </>
    );
  },
};

// Shopping Cart Story
export const ShoppingCart: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    const cartItems = [
      {
        id: 1,
        name: 'Premium Monthly',
        description: 'Full access to all partners',
        price: 19.99,
        quantity: 1,
      },
      {
        id: 2,
        name: 'Restaurant Bundle',
        description: 'Extra 5% off at restaurants',
        price: 4.99,
        quantity: 1,
      },
    ];
    
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    return (
      <>
        <IconButton onClick={() => setOpen(true)}>
          <Badge badgeContent={cartItems.length} color="primary">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
        
        <Drawer
          anchor="right"
          open={open}
          onClose={() => setOpen(false)}
          variant="temporary"
        >
          <div style={{ width: 360, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e0e0e0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">Shopping Cart</Typography>
                <IconButton onClick={() => setOpen(false)} size="small">
                  <CloseIcon />
                </IconButton>
              </div>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {cartItems.map((item) => (
                <div key={item.id} style={{ marginBottom: '16px', padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {item.description}
                  </Typography>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                    <Typography variant="h6" color="primary">
                      ${item.price.toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                      Qty: {item.quantity}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ padding: '16px', borderTop: '1px solid #e0e0e0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary">
                  ${total.toFixed(2)}
                </Typography>
              </div>
              <Button fullWidth variant="contained" color="primary" size="large">
                Checkout
              </Button>
            </div>
          </div>
        </Drawer>
      </>
    );
  },
};

// User Profile Story
export const UserProfile: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <>
        <IconButton onClick={() => setOpen(true)}>
          <Avatar>
            <UserIcon />
          </Avatar>
        </IconButton>
        
        <Drawer
          anchor="right"
          open={open}
          onClose={() => setOpen(false)}
          variant="temporary"
        >
          <div style={{ width: 320, padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <Typography variant="h6">Profile</Typography>
              <IconButton onClick={() => setOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
              <Avatar size="large" style={{ marginBottom: '16px' }}>
                JD
              </Avatar>
              <Typography variant="h6">John Doe</Typography>
              <Typography variant="body2" color="textSecondary">
                Premium Member
              </Typography>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <Typography variant="subtitle2" gutterBottom>
                Account Settings
              </Typography>
              <List>
                <ListItem button>
                  <ListItemText primary="Personal Information" />
                </ListItem>
                <ListItem button>
                  <ListItemText primary="Payment Methods" />
                </ListItem>
                <ListItem button>
                  <ListItemText primary="Subscription" />
                </ListItem>
                <ListItem button>
                  <ListItemText primary="Preferences" />
                </ListItem>
              </List>
            </div>
            
            <Divider style={{ margin: '24px 0' }} /
}}