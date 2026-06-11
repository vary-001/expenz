// src/components/common/EmptyState.jsx
import React from 'react';
import Button from './Button';
import PlusIcon from '../../assets/svgs/PlusIcon';
import EmptyStateIcon from '../../assets/svgs/EmptyStateIcon';

const EmptyState = ({ title, description, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
    <EmptyStateIcon className="w-44 h-36 mb-6 opacity-80" />
    <h3 className="heading-3 mb-2">{title}</h3>
    <p className="body-text text-center max-w-sm mb-6">{description}</p>
    {actionLabel && onAction && (
      <Button onClick={onAction} icon={PlusIcon}>{actionLabel}</Button>
    )}
  </div>
);

export default EmptyState;