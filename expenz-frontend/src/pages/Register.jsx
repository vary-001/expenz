// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Logo from '../assets/svgs/Logo';
import WaveBackground from '../assets/svgs/WaveBackground';
import LoginIllustration from '../assets/svgs/LoginIllustration';
import UserIcon from '../assets/svgs/UserIcon';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      addToast('Please fill in all required fields', 'error');
      return;
    }
    if (password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      addToast('Account created successfully! Welcome to Expenz!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden flex min-h-[650px] relative"
      >
        {/* Left - Illustration */}
        <div className="hidden lg:block w-1/2 relative overflow-hidden">
          <WaveBackground className="absolute inset-0 w-full h-full transform scale-x-[-1]" />
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              <LoginIllustration className="w-80 h-80 drop-shadow-lg" />
            </motion.div>
          </div>
        </div>

        {/* Right - Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center relative z-10">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-8"
          >
            <Logo size={40} />
            <div>
              <h1 className="text-2xl font-roboto font-bold text-gradient-forest">Expenz</h1>
              <p className="text-[10px] font-roboto text-sage-400 -mt-0.5">Smart Finance Manager</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl font-roboto font-bold text-forest-900 mb-2">Create Account</h2>
            <p className="text-sm font-roboto text-sage-400 mb-6">Start your smart financial journey today.</p>
          </motion.div>

          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              icon={UserIcon}
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
            />
            <Button type="submit" loading={loading} fullWidth className="!rounded-full !py-3.5">
              Create Account
            </Button>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-center text-sm font-roboto text-sage-400"
          >
            Already have an account?{' '}
            <Link to="/login" className="text-forest-600 font-medium hover:text-forest-700 transition-colors">
              Log in
            </Link>
          </motion.p>
        </div>

        {/* Mobile wave */}
        <div className="lg:hidden absolute top-0 left-0 w-full h-24 pointer-events-none opacity-30">
          <svg viewBox="0 0 400 80" fill="none" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,0 C100,60 300,20 400,50 L400,0 Z" fill="#d9ece2" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;