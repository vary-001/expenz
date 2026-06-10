// src/components/archives/ArchiveList.jsx
import React from 'react';
import ArchiveItem from './ArchiveItem';
import EmptyState from '../common/EmptyState';

const ArchiveList = ({ archives = [], onRestore, onDelete }) => {
  if (!archives.length) {
    return (
      <EmptyState
        title="Archive is empty"
        description="Deleted transactions will appear here. You can restore them anytime."
      />
    );
  }

  return (
    <div className="space-y-2">
      {archives.map((item, i) => (
        <ArchiveItem key={item._id || i} item={item} onRestore={onRestore} onDelete={onDelete} index={i} />
      ))}
    </div>
  );
};

export default ArchiveList;