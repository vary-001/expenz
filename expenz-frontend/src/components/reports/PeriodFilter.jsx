// src/components/reports/PeriodFilter.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import CalendarIcon from '../../assets/svgs/CalendarIcon';

const PeriodFilter = ({ active, onChange, customStart, customEnd, setCustomStart, setCustomEnd }) => {
  const { t } = useTranslation();

  const PRESETS = [
    { value: '7d', label: t('reports.period.7d'), days: 7 },
    { value: '30d', label: t('reports.period.30d'), days: 30 },
    { value: '90d', label: t('reports.period.90d'), days: 90 },
    { value: 'month', label: t('reports.period.month'), days: 'thisMonth' },
    { value: 'year', label: t('reports.period.year'), days: 'thisYear' },
    { value: 'all', label: t('reports.period.all'), days: null },
    { value: 'custom', label: t('reports.period.custom'), days: 'custom' },
  ];

  const handlePresetClick = (preset) => {
    const today = new Date();
    let start, end;

    if (preset.days === null) {
      start = ''; end = '';
    } else if (preset.days === 'thisMonth') {
      start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      end = today.toISOString().split('T')[0];
    } else if (preset.days === 'thisYear') {
      start = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
      end = today.toISOString().split('T')[0];
    } else if (preset.days === 'custom') {
      onChange(preset.value, customStart, customEnd);
      return;
    } else {
      const past = new Date(today);
      past.setDate(today.getDate() - preset.days);
      start = past.toISOString().split('T')[0];
      end = today.toISOString().split('T')[0];
    }

    onChange(preset.value, start, end);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <CalendarIcon size={16} className="text-forest-600 dark:text-forest-300" />
        <p className="font-poppins font-semibold text-sm text-forest-800 dark:text-forest-100">
          {t('reports.period.title')}
        </p>
      </div>

      {/* Preset chips - horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {PRESETS.map((p) => (
          <motion.button
            key={p.value}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePresetClick(p)}
            className={`px-3 py-1.5 rounded-lg font-inter text-xs font-medium whitespace-nowrap transition-all flex-shrink-0
              ${active === p.value
                ? 'bg-gradient-forest text-white shadow-forest'
                : 'bg-forest-50 dark:bg-forest-900/40 text-sage-700 dark:text-sage-200 hover:bg-forest-100 dark:hover:bg-forest-900'
              }`}
          >
            {p.label}
          </motion.button>
        ))}
      </div>

      {active === 'custom' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2"
        >
          <div>
            <label className="font-inter text-xs text-sage-500 dark:text-sage-400 mb-1 block">
              {t('reports.period.from')}
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400">
                <CalendarIcon size={16} />
              </div>
              <input
                type="date"
                value={customStart}
                onChange={(e) => { setCustomStart(e.target.value); onChange('custom', e.target.value, customEnd); }}
                className="input-base pl-9 !py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="font-inter text-xs text-sage-500 dark:text-sage-400 mb-1 block">
              {t('reports.period.to')}
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400">
                <CalendarIcon size={16} />
              </div>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => { setCustomEnd(e.target.value); onChange('custom', customStart, e.target.value); }}
                className="input-base pl-9 !py-2 text-sm"
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PeriodFilter;