// src/components/common/ConfirmDialog.jsx
import React from 'react';
import Modal from './Modal';
import Button from './Button';
import AlertIcon from '../../assets/svgs/AlertIcon';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, loading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <div className="text-center">
      <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertIcon size={28} className="text-red-500" />
      </div>
      <p className="text-sm font-roboto text-sage-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-center">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>Confirm</Button>
      </div>
    </div>
  </Modal>
);

export default ConfirmDialog;