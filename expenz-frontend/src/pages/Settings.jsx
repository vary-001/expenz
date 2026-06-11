// src/pages/Settings.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../hooks/useToast';

import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import UserIcon from '../assets/svgs/UserIcon';
import SunIcon from '../assets/svgs/SunIcon';
import MoonIcon from '../assets/svgs/MoonIcon';
import CheckIcon from '../assets/svgs/CheckIcon';

const Settings = () => {
  const { t } = useTranslation();
  const { user, updateUser, updatePreferences } = useAuth();
  const { theme, setTheme } = useTheme();
  const { changeLanguage } = useLanguage();
  const { addToast } = useToast();

  const [profileLoading, setProfileLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' });

  const handleProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await updateUser(profile);
      addToast('Profile updated', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (!pwd.currentPassword || !pwd.newPassword) {
      addToast('Fill both password fields', 'error');
      return;
    }
    if (pwd.newPassword.length < 6) {
      addToast('Password must be at least 6 chars', 'error');
      return;
    }
    setPwdLoading(true);
    try {
      await updateUser(pwd);
      addToast('Password changed', 'success');
      setPwd({ currentPassword: '', newPassword: '' });
    } catch (err) {
      addToast(err.response?.data?.message || 'Password change failed', 'error');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleCurrency = async (currency) => {
    try {
      await updatePreferences({ currency });
      addToast(`Currency changed to ${currency}`, 'success');
    } catch (err) {
      addToast('Failed to update currency', 'error');
    }
  };

  const handleLanguage = async (language) => {
    try {
      await updatePreferences({ language });
      changeLanguage(language);
      addToast('Language updated', 'success');
    } catch (err) {
      addToast('Failed to update language', 'error');
    }
  };

  const handleTheme = async (newTheme) => {
    setTheme(newTheme);
    try {
      await updatePreferences({ theme: newTheme });
    } catch {}
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile header */}
      <Card hover={false}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-forest flex items-center justify-center">
            <span className="font-poppins font-bold text-2xl text-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h3 className="font-poppins font-bold text-lg text-forest-900 dark:text-forest-50">
              {user?.name}
            </h3>
            <p className="body-text">{user?.email}</p>
          </div>
        </div>
      </Card>

      {/* Profile Info */}
      <Card delay={0.1}>
        <h3 className="heading-3 mb-4">{t('settings.profile')}</h3>
        <form onSubmit={handleProfile} className="space-y-4">
          <Input
            label={t('auth.name')}
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            icon={UserIcon}
          />
          <Input
            label={t('auth.email')}
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          />
          <Button type="submit" loading={profileLoading}>{t('common.save')}</Button>
        </form>
      </Card>

      {/* Preferences */}
      <Card delay={0.15}>
        <h3 className="heading-3 mb-4">{t('settings.preferences')}</h3>

        {/* Currency */}
        <div className="mb-6">
          <p className="label-text mb-3">{t('settings.currency')}</p>
          <div className="grid grid-cols-2 gap-3">
            {['USD', 'RWF'].map((curr) => (
              <button
                key={curr}
                onClick={() => handleCurrency(curr)}
                className={`p-3 rounded-xl border-2 transition-all flex items-center justify-between
                  ${user?.preferences?.currency === curr
                    ? 'border-forest-500 bg-forest-50 dark:bg-forest-900/40'
                    : 'border-sage-200 dark:border-surface-border-dark hover:border-forest-300'
                  }`}
              >
                <span className="font-poppins font-semibold text-sm text-forest-800 dark:text-forest-100">
                  {curr === 'USD' ? '$ US Dollar' : 'FRw Rwandan Franc'}
                </span>
                {user?.preferences?.currency === curr && (
                  <CheckIcon size={16} className="text-forest-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="mb-6">
          <p className="label-text mb-3">{t('settings.language')}</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { code: 'en', label: 'English' },
              { code: 'kiny', label: 'Ikinyarwanda' },
            ].map((l) => (
              <button
                key={l.code}
                onClick={() => handleLanguage(l.code)}
                className={`p-3 rounded-xl border-2 transition-all flex items-center justify-between
                  ${user?.preferences?.language === l.code
                    ? 'border-forest-500 bg-forest-50 dark:bg-forest-900/40'
                    : 'border-sage-200 dark:border-surface-border-dark hover:border-forest-300'
                  }`}
              >
                <span className="font-poppins font-semibold text-sm text-forest-800 dark:text-forest-100">
                  {l.label}
                </span>
                {user?.preferences?.language === l.code && (
                  <CheckIcon size={16} className="text-forest-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div>
          <p className="label-text mb-3">{t('settings.theme')}</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleTheme('light')}
              className={`p-4 rounded-xl border-2 transition-all
                ${theme === 'light'
                  ? 'border-forest-500 bg-forest-50'
                  : 'border-sage-200 dark:border-surface-border-dark hover:border-forest-300'
                }`}
            >
              <SunIcon size={24} className="mx-auto mb-2 text-forest-500" />
              <span className="font-poppins font-semibold text-sm text-forest-800 dark:text-forest-100">
                {t('settings.lightMode')}
              </span>
            </button>
            <button
              onClick={() => handleTheme('dark')}
              className={`p-4 rounded-xl border-2 transition-all
                ${theme === 'dark'
                  ? 'border-forest-500 bg-forest-50 dark:bg-forest-900/40'
                  : 'border-sage-200 dark:border-surface-border-dark hover:border-forest-300'
                }`}
            >
              <MoonIcon size={24} className="mx-auto mb-2 text-forest-500 dark:text-forest-300" />
              <span className="font-poppins font-semibold text-sm text-forest-800 dark:text-forest-100">
                {t('settings.darkMode')}
              </span>
            </button>
          </div>
        </div>
      </Card>

      {/* Password */}
      <Card delay={0.2}>
        <h3 className="heading-3 mb-4">{t('settings.changePassword')}</h3>
        <form onSubmit={handlePassword} className="space-y-4">
          <Input
            label={t('settings.currentPassword')}
            type="password"
            value={pwd.currentPassword}
            onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })}
          />
          <Input
            label={t('settings.newPassword')}
            type="password"
            value={pwd.newPassword}
            onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })}
            placeholder="Min. 6 characters"
          />
          <Button type="submit" variant="secondary" loading={pwdLoading}>
            {t('settings.changePassword')}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Settings;