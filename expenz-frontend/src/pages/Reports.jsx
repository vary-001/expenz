// src/pages/Reports.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import API from '../api/axios';
import { useToast } from '../hooks/useToast';
import { useLanguage } from '../hooks/useLanguage';
import { generateReportPDF } from '../utils/pdfGenerator';

import Card from '../components/common/Card';
import Loader from '../components/common/Loader';

import PeriodFilter from '../components/reports/PeriodFilter';
import StatCard from '../components/reports/StatCard';
import SimplePieChart from '../components/reports/charts/SimplePieChart';
import SimpleTrendChart from '../components/reports/charts/SimpleTrendChart';
import SimpleBarChart from '../components/reports/charts/SimpleBarChart';
import SuggestionCard from '../components/reports/SuggestionCard';
import MoneyStory from '../components/reports/MoneyStory';
import PDFChartsContainer from '../components/reports/PDFChartsContainer';

import DownloadIcon from '../assets/svgs/DownloadIcon';
import RefreshIcon from '../assets/svgs/RefreshIcon';
import TrendUpIcon from '../assets/svgs/TrendUpIcon';
import TrendDownIcon from '../assets/svgs/TrendDownIcon';
import WalletIcon from '../assets/svgs/WalletIcon';
import PieChartIcon from '../assets/svgs/PieChartIcon';
import StoryIcon from '../assets/svgs/StoryIcon';
import SparkleIcon from '../assets/svgs/SparkleIcon';
import BudgetIcon from '../assets/svgs/BudgetIcon';
import BarChartIcon from '../assets/svgs/BarChartIcon';
import LoaderIcon from '../assets/svgs/LoaderIcon';
import { formatCurrency, formatDate, formatPercentage } from '../utils/formatters';

const Reports = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [report, setReport] = useState(null);
  const [period, setPeriod] = useState('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const past = new Date(today);
    past.setDate(today.getDate() - 30);
    return {
      startDate: past.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    };
  });

  const fetchReport = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await API.post('/reports/generate', {
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
        lang: language,
      });
      setReport(res.data?.data?.report);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to generate report', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange, addToast, language]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handlePeriodChange = (newPeriod, start, end) => {
    setPeriod(newPeriod);
    setDateRange({ startDate: start, endDate: end });
  };

  const handleDownload = async () => {
    if (!report) return;
    setDownloading(true);

    try {
      // Small delay to ensure charts are rendered
      await new Promise(resolve => setTimeout(resolve, 500));

      await generateReportPDF(report, {
        title: t('reports.pdf.title'),
        subtitle: t('reports.subtitle'),
        footerText: t('reports.pdf.footer'),
        period: report.period,
        captureCharts: true,
        translations: {
          generatedOn: t('reports.pdf.generatedOn').toUpperCase(),
          period: t('reports.pdf.period').toUpperCase(),
          summary: t('reports.pdf.summary'),
          moneyStory: t('reports.pdf.moneyStory'),
          categoryBreakdown: t('reports.pdf.categoryBreakdown'),
          suggestions: t('reports.pdf.suggestions'),
          totalIncome: t('reports.metrics.totalIncome'),
          totalExpenses: t('reports.metrics.totalExpenses'),
          netBalance: t('reports.metrics.netBalance'),
          savingsRate: t('reports.metrics.savingsRate'),
          transactions: t('reports.metrics.transactions'),
          expenseBreakdown: t('reports.charts.expenseBreakdown'),
          incomeBreakdown: t('reports.charts.incomeBreakdown'),
          dailyTrend: t('reports.charts.dailyTrend'),
          tip: t('reports.suggestions.tip'),
        },
      });

      addToast(t('reports.downloaded'), 'success');
    } catch (err) {
      console.error('PDF generation error:', err);
      addToast(t('reports.downloadFailed'), 'error');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <Loader text={t('reports.analyzing')} />;
  if (!report) return null;

  const {
    summary,
    expensesByCategory,
    incomeBySource,
    dailyTrend,
    budgetAnalysis,
    topExpenses,
    topIncomes,
    moneyStory,
    suggestions,
    period: rPeriod,
  } = report;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hidden PDF charts container */}
      <PDFChartsContainer report={report} />

      {/* ─── HEADER ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-forest rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden"
      >
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-inter text-xs sm:text-sm text-white/70 mb-1">
              {t('reports.subtitle')}
            </p>
            <h2 className="font-poppins font-bold text-xl sm:text-2xl">
              {t('reports.title')}
            </h2>
            <p className="font-inter text-[10px] sm:text-xs text-white/60 mt-1">
              {rPeriod.days} {t('reports.period.days')}
              {rPeriod.startDate && ` • ${formatDate(rPeriod.startDate)} → ${formatDate(rPeriod.endDate)}`}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => fetchReport(true)}
              disabled={refreshing}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-inter text-xs sm:text-sm font-medium transition-all backdrop-blur-sm border border-white/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <motion.div
                animate={refreshing ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: refreshing ? Infinity : 0 }}
              >
                <RefreshIcon size={14} />
              </motion.div>
              <span>{t('reports.refresh')}</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-white text-forest-700 font-poppins text-xs sm:text-sm font-semibold transition-all hover:bg-forest-50 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {downloading ? (
                <>
                  <LoaderIcon size={14} />
                  <span className="hidden sm:inline">{t('reports.downloading')}</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <DownloadIcon size={14} />
                  <span>{t('reports.download')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ─── PERIOD FILTER ─── */}
      <Card hover={false} delay={0.05}>
        <PeriodFilter
          active={period}
          onChange={handlePeriodChange}
          customStart={customStart}
          customEnd={customEnd}
          setCustomStart={setCustomStart}
          setCustomEnd={setCustomEnd}
        />
      </Card>

      {/* ─── KEY METRICS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <StatCard
          label={t('reports.metrics.totalIncome')}
          value={summary.totalIncome}
          icon={TrendUpIcon}
          color="emerald"
          index={0}
        />
        <StatCard
          label={t('reports.metrics.totalExpenses')}
          value={summary.totalExpense}
          icon={TrendDownIcon}
          color="orange"
          index={1}
        />
        <StatCard
          label={t('reports.metrics.netBalance')}
          value={summary.netBalance}
          icon={WalletIcon}
          color="forest"
          index={2}
        />
        <StatCard
          label={t('reports.metrics.savingsRate')}
          value={formatPercentage(summary.savingsRate)}
          icon={SparkleIcon}
          color={summary.savingsRate >= 20 ? 'forest' : summary.savingsRate >= 10 ? 'blue' : 'orange'}
          index={3}
          isCurrency={false}
          secondary={t('reports.metrics.avgDaily', { amount: formatCurrency(summary.dailyAvgExpense) })}
        />
      </div>

      {/* ─── MONEY STORY ─── */}
      <Card delay={0.1}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-forest-50 dark:bg-forest-900/40 text-forest-600 dark:text-forest-300 flex-shrink-0">
            <StoryIcon size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="heading-3">{t('reports.story.title')}</h3>
            <p className="body-text text-xs">{t('reports.story.subtitle')}</p>
          </div>
        </div>
        <MoneyStory story={moneyStory} />
      </Card>

      {/* ─── CHARTS GRID ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card delay={0.15}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex-shrink-0">
              <PieChartIcon size={20} />
            </div>
            <h3 className="heading-3">{t('reports.charts.expenseBreakdown')}</h3>
          </div>
          {expensesByCategory.length ? (
            <SimplePieChart data={expensesByCategory} />
          ) : (
            <p className="body-text text-center py-12">{t('reports.charts.noData')}</p>
          )}
        </Card>

        <Card delay={0.2}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-forest-50 dark:bg-forest-900/40 text-forest-600 dark:text-forest-300 flex-shrink-0">
              <PieChartIcon size={20} />
            </div>
            <h3 className="heading-3">{t('reports.charts.incomeBreakdown')}</h3>
          </div>
          {incomeBySource.length ? (
            <SimplePieChart data={incomeBySource} />
          ) : (
            <p className="body-text text-center py-12">{t('reports.charts.noData')}</p>
          )}
        </Card>
      </div>

      {/* ─── TREND CHART ─── */}
      <Card delay={0.25}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex-shrink-0">
            <BarChartIcon size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="heading-3">{t('reports.charts.dailyTrend')}</h3>
            <p className="body-text text-xs">{t('reports.charts.trendSubtitle')}</p>
          </div>
        </div>
        <SimpleTrendChart data={dailyTrend} />
      </Card>

      {/* ─── BUDGET ANALYSIS ─── */}
      {budgetAnalysis.length > 0 && (
        <Card delay={0.3}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 flex-shrink-0">
              <BudgetIcon size={20} />
            </div>
            <h3 className="heading-3">{t('reports.charts.budgetAnalysis')}</h3>
          </div>
          <SimpleBarChart data={budgetAnalysis} />
        </Card>
      )}

      {/* ─── SUGGESTIONS ─── */}
      {suggestions.length > 0 && (
        <Card delay={0.35}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-forest text-white flex-shrink-0">
              <SparkleIcon size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="heading-3">{t('reports.suggestions.title')}</h3>
              <p className="body-text text-xs">{t('reports.suggestions.subtitle')}</p>
            </div>
          </div>
          <div className="space-y-3">
            {suggestions.map((s, i) => (
              <SuggestionCard key={i} suggestion={s} index={i} />
            ))}
          </div>
        </Card>
      )}

      {/* ─── TOP TRANSACTIONS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {topExpenses.length > 0 && (
          <Card delay={0.4}>
            <h3 className="heading-3 mb-4">{t('reports.topTransactions.expenses')}</h3>
            <div className="space-y-2">
              {topExpenses.map((e, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg hover:bg-forest-50/50 dark:hover:bg-forest-900/20 transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-inter font-medium text-xs sm:text-sm text-forest-800 dark:text-forest-100 truncate">
                      {e.description}
                    </p>
                    <p className="font-inter text-[10px] sm:text-xs text-sage-500 dark:text-sage-400 truncate">
                      {e.category} • {formatDate(e.date)}
                    </p>
                  </div>
                  <p className="money text-xs sm:text-sm text-orange-500 whitespace-nowrap">
                    -{formatCurrency(e.amount)}
                  </p>
                </motion.div>
              ))}
            </div>
          </Card>
        )}

        {topIncomes.length > 0 && (
          <Card delay={0.45}>
            <h3 className="heading-3 mb-4">{t('reports.topTransactions.incomes')}</h3>
            <div className="space-y-2">
              {topIncomes.map((inc, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg hover:bg-forest-50/50 dark:hover:bg-forest-900/20 transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-inter font-medium text-xs sm:text-sm text-forest-800 dark:text-forest-100 truncate">
                      {inc.source}
                    </p>
                    <p className="font-inter text-[10px] sm:text-xs text-sage-500 dark:text-sage-400 truncate">
                      {inc.category} • {formatDate(inc.date)}
                    </p>
                  </div>
                  <p className="money text-xs sm:text-sm text-forest-600 dark:text-forest-300 whitespace-nowrap">
                    +{formatCurrency(inc.amount)}
                  </p>
                </motion.div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Reports;