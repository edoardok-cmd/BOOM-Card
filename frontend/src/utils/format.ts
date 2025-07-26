// Formatting utilities for display

// Number formatting
export const formatNumber = (
  value: number,
  options?: {
    decimals?: number;
    locale?: string;
    currency?: string;
  }
): string => {
  const { decimals = 0, locale = 'bg-BG', currency } = options || {};
  
  if (currency) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

// Currency formatting
export const formatCurrency = (
  amount: number,
  currency: string = 'BGN',
  locale: string = 'bg-BG'
): string => {
  return formatNumber(amount, { currency, locale, decimals: 2 });
};

// Percentage formatting
export const formatPercentage = (
  value: number,
  decimals: number = 0,
  locale: string = 'bg-BG'
): string => {
  return formatNumber(value, { decimals, locale }) + '%';
};

// Date formatting
export const formatDate = (
  date: string | Date | null | undefined,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium',
  locale: string = 'bg-BG'
): string => {
  if (!date) {
    return 'N/A';
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  const options: Intl.DateTimeFormatOptions = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    medium: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  }[format];
  
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

// Time formatting
export const formatTime = (
  date: string | Date,
  showSeconds: boolean = false,
  locale: string = 'bg-BG'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid time';
  }
  
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...(showSeconds && { second: '2-digit' }),
  };
  
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

// Date and time formatting
export const formatDateTime = (
  date: string | Date,
  locale: string = 'bg-BG'
): string => {
  const dateStr = formatDate(date, 'medium', locale);
  const timeStr = formatTime(date, false, locale);
  return `${dateStr} ${timeStr}`;
};

// Relative time formatting
export const formatRelativeTime = (
  date: string | Date,
  locale: string = 'bg-BG'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  if (diffSeconds < 60) {
    return rtf.format(-diffSeconds, 'second');
  } else if (diffMinutes < 60) {
    return rtf.format(-diffMinutes, 'minute');
  } else if (diffHours < 24) {
    return rtf.format(-diffHours, 'hour');
  } else if (diffDays < 30) {
    return rtf.format(-diffDays, 'day');
  } else if (diffDays < 365) {
    const diffMonths = Math.floor(diffDays / 30);
    return rtf.format(-diffMonths, 'month');
  } else {
    const diffYears = Math.floor(diffDays / 365);
    return rtf.format(-diffYears, 'year');
  }
};

// Duration formatting
export const formatDuration = (
  seconds: number,
  format: 'short' | 'long' = 'short'
): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (format === 'short') {
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
  
  const parts = [];
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs} second${secs !== 1 ? 's' : ''}`);
  
  return parts.join(' ');
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Name formatting
export const formatName = (firstName: string, lastName: string): string => {
  return [firstName, lastName].filter(Boolean).join(' ');
};

// Initials formatting
export const formatInitials = (firstName: string, lastName: string): string => {
  const firstInitial = firstName ? firstName[0].toUpperCase() : '';
  const lastInitial = lastName ? lastName[0].toUpperCase() : '';
  return firstInitial + lastInitial;
};

// Address formatting
export const formatAddress = (address: {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}): string => {
  const parts = [
    address.street,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ].filter(Boolean);
  
  return parts.join(', ');
};

// Truncate text
export const truncateText = (
  text: string,
  maxLength: number,
  suffix: string = '...'
): string => {
  if (text.length <= maxLength) return text;
  
  const truncatedLength = maxLength - suffix.length;
  return text.substring(0, truncatedLength) + suffix;
};

// Pluralize
export const pluralize = (
  count: number,
  singular: string,
  plural?: string
): string => {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || singular + 's'}`;
};

// Format discount
export const formatDiscount = (discount: number | string): string => {
  const value = typeof discount === 'string' ? parseFloat(discount) : discount;
  return formatPercentage(value);
};

// Format membership type
export const formatMembershipType = (type: string): string => {
  const typeMap: Record<string, string> = {
    standard: 'Standard',
    premium: 'Premium',
    vip: 'VIP',
  };
  
  return typeMap[type.toLowerCase()] || type;
};

// Format status
export const formatStatus = (status: string): {
  label: string;
  color: string;
} => {
  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: 'Active', color: 'green' },
    inactive: { label: 'Inactive', color: 'gray' },
    pending: { label: 'Pending', color: 'yellow' },
    expired: { label: 'Expired', color: 'red' },
    suspended: { label: 'Suspended', color: 'orange' },
    completed: { label: 'Completed', color: 'green' },
    failed: { label: 'Failed', color: 'red' },
    cancelled: { label: 'Cancelled', color: 'gray' },
  };
  
  return statusMap[status.toLowerCase()] || { label: status, color: 'gray' };
};

// Format rating
export const formatRating = (rating: number, maxRating: number = 5): string => {
  return `${rating.toFixed(1)}/${maxRating}`;
};