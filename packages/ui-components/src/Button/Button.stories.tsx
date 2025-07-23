import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { FiSearch, FiDownload, FiMap, FiUser, FiCheck, FiX, FiArrowRight, FiShoppingCart, FiHeart, FiShare2, FiFilter, FiMenu, FiLogIn, FiLogOut, FiSettings, FiCreditCard, FiGift, FiStar, FiCalendar, FiClock, FiMapPin, FiPhone, FiMail, FiGlobe, FiInfo, FiAlertCircle, FiCheckCircle, FiXCircle, FiRefreshCw, FiEdit, FiTrash2, FiPlus, FiMinus, FiChevronLeft, FiChevronRight, FiChevronUp, FiChevronDown, FiExternalLink, FiCopy, FiSave, FiUpload, FiBell, FiLock, FiUnlock, FiEye, FiEyeOff, FiHome, FiGrid, FiList, FiActivity, FiTrendingUp, FiBarChart2, FiPieChart, FiDollarSign, FiPercent, FiTag, FiAward, FiThumbsUp, FiMessageCircle, FiSend, FiPaperclip, FiFileText, FiImage, FiVideo, FiMic, FiCamera, FiWifi, FiNavigation, FiCompass, FiSunrise, FiSunset, FiCoffee, FiShoppingBag, FiPackage, FiTruck, FiZap, FiCpu, FiDatabase, FiServer, FiCloud, FiCloudDownload, FiCloudUpload, FiLink, FiLink2, FiAnchor, FiBookmark, FiFolder, FiFolderPlus, FiFile, FiFilePlus, FiPrinter, FiTerminal, FiCode, FiCommand, FiGitBranch, FiGitCommit, FiGitMerge, FiGitPullRequest, FiGithub, FiGitlab, FiInstagram, FiTwitter, FiFacebook, FiLinkedin, FiYoutube, FiSlack, FiTwitch, FiDroplet, FiFeather, FiHash, FiHeadphones, FiHelpCircle, FiLayers, FiLayout, FiLifeBuoy, FiLoader, FiMaximize, FiMinimize, FiMonitor, FiMoon, FiMoreHorizontal, FiMoreVertical, FiMove, FiMusic, FiPause, FiPlay, FiPower, FiRadio, FiRepeat, FiRewind, FiRotateCcw, FiRotateCw, FiRss, FiSearch as FiSearchAlt, FiSkipBack, FiSkipForward, FiSlash, FiSliders, FiSmartphone, FiSpeaker, FiSquare, FiStar as FiStarAlt, FiStopCircle, FiSun, FiTablet, FiTarget, FiToggleLeft, FiToggleRight, FiTool, FiTv, FiType, FiUmbrella, FiUser as FiUserAlt, FiUserCheck, FiUserMinus, FiUserPlus, FiUserX, FiUsers, FiVolume, FiVolume1, FiVolume2, FiVolumeX, FiWatch, FiWifiOff, FiWind, FiX as FiXAlt, FiXCircle as FiXCircleAlt, FiXSquare, FiZapOff, FiZoomIn, FiZoomOut } from 'react-icons/fi';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component for the BOOM Card platform with multiple variants, sizes, and states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'link', 'danger', 'success', 'warning'],
      description: 'Visual style variant of the button',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size of the button',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Makes the button take full width of its container',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button',
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading spinner and disables the button',
    },
    icon: {
      control: false,
      description: 'Icon to display in the button',
    },
    iconPosition: {
      control: 'radio',
      options: ['left', 'right'],
      description: 'Position of the icon relative to the text',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler function',
    },
    children: {
      control: 'text',
      description: 'Button text content',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      description: 'HTML button type attribute',
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessibility label for screen readers',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Variants
export const Primary: Story = {
  args: {
    children: 'Get BOOM Card',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Learn More',
    variant: 'secondary',
  },
};

export const Outline: Story = {
  args: {
    children: 'View Partners',
    variant: 'outline',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Cancel',
    variant: 'ghost',
  },
};

export const Link: Story = {
  args: {
    children: 'View all offers',
    variant: 'link',
    icon: <FiArrowRight />,
    iconPosition: 'right',
  },
};

export const Danger: Story = {
  args: {
    children: 'Delete Account',
    variant: 'danger',
    icon: <FiTrash2 />,
  },
};

export const Success: Story = {
  args: {
    children: 'Payment Successful',
    variant: 'success',
    icon: <FiCheckCircle />,
  },
};

export const Warning: Story = {
  args: {
    children: 'Subscription Expiring',
    variant: 'warning',
    icon: <FiAlertCircle />,
  },
};

// Sizes
export const ExtraSmall: Story = {
  args: {
    children: 'XS Button',
    size: 'xs',
    variant: 'primary',
  },
};

export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
    variant: 'primary',
  },
};

export const Medium: Story = {
  args: {
    children: 'Medium Button',
    size: 'md',
    variant: 'primary',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
    variant: 'primary',
  },
};

export const ExtraLarge: Story = {
  args: {
    children: 'XL Button',
    size: 'xl',
    variant: 'primary',
  },
};

// States
export const Loading: Story = {
  args: {
    children: 'Processing...',
    loading: true,
    variant: 'primary',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Unavailable',
    disabled: true,
    variant: 'primary',
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Subscribe Now',
    fullWidth: true,
    variant: 'primary',
    size: 'lg',
  },
};

// With Icons
export const WithLeftIcon: Story = {
  args: {
    children: 'Search Partners',
    icon: <FiSearch />,
    iconPosition: 'left',
    variant: 'primary',
  },
};

export const WithRightIcon: Story = {
  args: {
    children: 'Download App',
    icon: <FiDownload />,
    iconPosition: 'right',
    variant: 'primary',
  },
};

export const IconOnly: Story = {
  args: {
    icon: <FiMenu />,
    variant: 'ghost',
    ariaLabel: 'Open menu',
  },
};

// Platform-specific Use Cases
export const LoginButton: Story = {
  args: {
    children: 'Login',
    icon: <FiLogIn />,
    variant: 'outline',
  },
};

export const SignupButton: Story = {
  args: {
    children: 'Start Free Trial',
    variant: 'primary',
    size: 'lg',
    icon: <FiGift />,
  },
};

export const SearchButton: Story = {
  args: {
    children: 'Search',
    icon: <FiSearch />,
    variant: 'primary',
  },
};

export const FilterButton: Story = {
  args: {
    children: 'Filters',
    icon: <FiFilter />,
    variant: 'outline',
  },
};

export const ViewOnMapButton: Story = {
  args: {
    children: 'View on Map',
    icon: <FiMap />,
    variant: 'secondary',
  },
};

export const SaveToFavorites: Story = {
  args: {
    children: 'Save',
    icon: <FiHeart />,
    variant: 'ghost',
  },
};

export const ShareButton: Story = {
  args: {
    children: 'Share',
    icon: <FiShare2 />,
    variant: 'ghost',
  },
};

export const AddToCartButton: Story = {
  args: {
    children: 'Add to Cart',
    icon: <FiShoppingCart />,
    variant: 'primary',
    fullWidth: true,
  },
};

export const SubscribeButton: Story = {
  args: {
    children: 'Subscribe for €9.99/month',
    icon: <FiCreditCard />,
    variant: 'primary',
    size: 'lg',
    fullWidth: true,
  },
};

export const QRCodeButton: Story = {
  args: {
    children: 'Scan QR Code',
    icon: <FiCamera />,
    variant: 'primary',
    size: 'lg',
  },
};

export const PartnerDashboardButton: Story = {
  args: {
    children: 'Partner Dashboard',
    icon: <FiBarChart2 />,
    iconPosition: 'right',
    variant: 'secondary',
  },
};

export const EditProfileButton: Story = {
  args: {
    children: 'Edit Profile',
    icon: <FiEdit />,
    variant: 'outline',
    size: 'sm',
  },
};

export const LogoutButton: Story = {
  args: {
    children: 'Logout',
    icon: <FiLogOut />,
    variant: 'ghost',
    iconPosition: 'right',
  },
};

export const NotificationButton: Story = {
  args: {
    icon: <FiBell />,
    variant: 'ghost',
    ariaLabel: 'View notifications',
  },
};

export const LanguageSwitchButton: Story = {
  args: {
    children: 'EN',
    icon: <FiGlobe />,
    variant: 'ghost',
    size: 'sm',
  },
};

// Group Examples
export const ButtonGroup: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Button variant="outline" size="sm">
        <FiGrid />
        Grid View
      </Button>
      <Button variant="outline" size="sm">
        <FiList />
        List View
      </Button>
      <Button variant="outline" size="sm">
        <FiMap />
        Map View
      </Button>
    </div>
  ),
};

export const PaginationButtons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      <Button variant="ghost" size="sm" icon={<FiChevronLeft />} ariaLabel="Previous page" />
      <Button variant="ghost" size="sm">1</Button>
      <Button variant="primary" size="sm">2</Button>
      <Button variant="ghost" size="sm">3</Button>
      <Button variant="ghost" size="sm">4</Button>
      <Button variant="ghost" size="sm">5</Button>
      <Button variant="ghost" size="sm" icon={<FiChevronRight />} ariaLabel="Next page" />
    </div>
  ),
};

export const SocialMediaButtons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Button variant="outline" size="sm" icon={<FiFacebook />} ariaLabel="Share on Facebook" />
      <Button variant="outline" size="sm" icon={<FiTwitter />} ariaLabel="Share on Twitter" />
      <Button variant="outline" size="sm" icon={<FiInstagram />} ariaLabel="Share on Instagram" />
      <Button varia
}