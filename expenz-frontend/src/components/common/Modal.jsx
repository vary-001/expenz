// src/components/common/Modal.jsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import CloseIcon from '../../assets/svgs/CloseIcon';

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  closable = true,
  icon: Icon,
  iconColor = 'forest',
  showHeader = true,
  showFooter = false,
  footer = null,
  className = '',
  bodyClassName = '',
  preventScroll = true,
}) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (!preventScroll) return;
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen, preventScroll]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen || !closable) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, closable, onClose]);

  const sizes = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md sm:max-w-lg',
    lg: 'max-w-lg sm:max-w-2xl',
    xl: 'max-w-xl sm:max-w-4xl',
    full: 'max-w-full sm:max-w-6xl',
  };

  const iconColors = {
    forest: 'bg-forest-50 dark:bg-forest-900/40 text-forest-600 dark:text-forest-300',
    orange: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400',
    red: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400',
    blue: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
    sage: 'bg-sage-50 dark:bg-sage-900/40 text-sage-600 dark:text-sage-300',
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
          aria-modal="true"
          role="dialog"
        >
          {/* ── BACKDROP ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-forest-950/60 dark:bg-black/70 backdrop-blur-sm"
            onClick={closable ? onClose : undefined}
          />

          {/* ── MODAL CONTAINER ── */}
          <motion.div
            initial={{ opacity: 0, y: '100%', scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: '100%', scale: 0.95 }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 320,
            }}
            className={`
              relative w-full ${sizes[size]}
              bg-white dark:bg-surface-card-dark
              border border-sage-100 dark:border-surface-border-dark
              shadow-2xl shadow-forest-950/20 dark:shadow-black/50

              rounded-t-3xl sm:rounded-2xl
              max-h-[92vh] sm:max-h-[90vh]
              flex flex-col
              overflow-hidden
              ${className}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── MOBILE GRAB HANDLE ── */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 rounded-full bg-sage-200 dark:bg-surface-border-dark" />
            </div>

            {/* ── HEADER ── */}
            {showHeader && (title || Icon) && (
              <div className="flex items-start justify-between gap-3 px-5 sm:px-6 py-4 sm:py-5 border-b border-sage-100 dark:border-surface-border-dark">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {Icon && (
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${iconColors[iconColor] || iconColors.forest}`}>
                      <Icon size={20} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1 pt-0.5">
                    {title && (
                      <h2 className="font-poppins font-bold text-lg sm:text-xl text-gradient-forest leading-tight truncate">
                        {title}
                      </h2>
                    )}
                    {subtitle && (
                      <p className="font-inter text-xs sm:text-sm text-sage-500 dark:text-sage-400 mt-0.5 line-clamp-2">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {closable && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl flex-shrink-0
                               hover:bg-forest-50 dark:hover:bg-forest-900/40
                               text-sage-400 hover:text-forest-700 dark:hover:text-forest-200
                               transition-colors duration-200"
                    aria-label="Close modal"
                  >
                    <CloseIcon size={20} />
                  </button>
                )}
              </div>
            )}

            {/* ── BODY ── */}
            <div
              className={`
                flex-1 overflow-y-auto overflow-x-hidden
                px-5 sm:px-6 py-5
                custom-scrollbar
                ${bodyClassName}
              `}
            >
              {children}
            </div>

            {/* ── FOOTER ── */}
            {showFooter && footer && (
              <div className="px-5 sm:px-6 py-4 border-t border-sage-100 dark:border-surface-border-dark bg-sage-50/30 dark:bg-surface-dark/50">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;