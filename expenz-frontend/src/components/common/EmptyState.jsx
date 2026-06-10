// src/components/common/EmptyState.jsx
import React from 'react';
import EmptyStateIcon from '../../assets/svgs/EmptyStateIcon';
import Button from './Button';
import PlusIcon from '../../assets/svgs/PlusIcon';

const EmptyState = ({ title, description, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
    <EmptyStateIcon className="w-48 h-40 mb-6" />
    <h3 className="text-lg font-roboto font-bold text-forest-800 mb-2">{title}</h3>
    <p className="text-sm font-roboto text-sage-500 mb-6 text-center max-w-sm">{description}</p>
    {actionLabel && onAction && (
      <Button onClick={onAction} icon={PlusIcon} size="md">{actionLabel}</Button>
    )}
  </div>
);

export default EmptyState;