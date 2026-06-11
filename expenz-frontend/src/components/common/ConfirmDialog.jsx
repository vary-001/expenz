// src/components/common/ConfirmDialog.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import Button from './Button';
import AlertIcon from '../../assets/svgs/AlertIcon';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, loading }) => {
  const { t } = useTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center mb-4">
          <AlertIcon size={28} className="text-red-500 dark:text-red-400" />
        </div>
        <p className="body-text mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {t('common.confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;