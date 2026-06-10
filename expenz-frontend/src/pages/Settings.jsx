// src/pages/Settings.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import UserIcon from '../assets/svgs/UserIcon';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    currency: user?.currency || 'USD',
  });

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUser({ name: form.name, email: form.email, currency: form.currency });
      addToast('Profile updated successfully', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!form.currentPassword || !form.newPassword) {
      addToast('Please fill in both password fields', 'error');
      return;
    }
    if (form.newPassword.length < 6) {
      addToast('New password must be at least 6 characters', 'error');
      return;
    }
    setLoading(true);
    try {
      await updateUser({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      addToast('Password changed successfully', 'success');
      setForm((p) => ({ ...p, currentPassword: '', newPassword: '' }));
    } catch (err) {
      addToast(err.response?.data?.message || 'Password change failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-forest flex items-center justify-center">
            <span className="text-2xl font-roboto font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-roboto font-bold text-forest-900">{user?.name}</h3>
            <p className="text-sm font-roboto text-sage-500">{user?.email}</p>
          </div>
        </div>
      </Card>

      {/* Profile Settings */}
      <Card delay={0.1}>
        <h3 className="text-base font-roboto font-bold text-gradient-forest mb-4">Profile Information</h3>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <Input label="Full Name" name="name" value={form.name} onChange={handleChange} icon={UserIcon} />
          <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
          <Input label="Preferred Currency" name="currency" value={form.currency} onChange={handleChange} placeholder="e.g., USD, EUR, GBP" />
          <Button type="submit" loading={loading}>Save Changes</Button>
        </form>
      </Card>

      {/* Password */}
      <Card delay={0.2}>
        <h3 className="text-base font-roboto font-bold text-gradient-forest mb-4">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input label="Current Password" name="currentPassword" type="password"
                 value={form.currentPassword} onChange={handleChange} />
          <Input label="New Password" name="newPassword" type="password"
                 value={form.newPassword} onChange={handleChange} placeholder="Min. 6 characters" />
          <Button type="submit" loading={loading} variant="secondary">Update Password</Button>
        </form>
      </Card>
    </div>
  );
};

export default Settings;