// src/utils/formatters.js
import { format, parseISO, isValid } from 'date-fns';

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

export const formatDate = (date) => {
  if (!date) return '';
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return isValid(parsed) ? format(parsed, 'MMM dd, yyyy') : '';
};

export const formatDateShort = (date) => {
  if (!date) return '';
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return isValid(parsed) ? format(parsed, 'MM/dd/yy') : '';
};

export const formatPercentage = (value) => {
  return `${(value || 0).toFixed(1)}%`;
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export const getCategoryColor = (category) => {
  const colors = {
    food: '#5a9f7e',
    transport: '#3d8365',
    utilities: '#2d6a50',
    entertainment: '#85bfa3',
    health: '#265541',
    education: '#4c5440',
    shopping: '#969f82',
    rent: '#1c392d',
    salary: '#3d8365',
    freelance: '#5a9f7e',
    investment: '#2d6a50',
    business: '#265541',
    other: '#b4bba3',
  };
  return colors[category?.toLowerCase()] || colors.other;
};