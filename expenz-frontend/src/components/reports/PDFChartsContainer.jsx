// src/components/reports/PDFChartsContainer.jsx
import React from 'react';
import SimplePieChart from './charts/SimplePieChart';
import SimpleTrendChart from './charts/SimpleTrendChart';
import { formatCurrency } from '../../utils/formatters';

/**
 * Hidden container with white-background versions of charts
 * Used by PDF generator to capture clean images
 */
const PDFChartsContainer = ({ report }) => {
  if (!report) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: '-9999px',
        top: 0,
        width: '700px',
        backgroundColor: '#ffffff',
        padding: '20px',
      }}
    >
      {/* Expense Pie */}
      {report.expensesByCategory?.length > 0 && (
        <div id="pdf-expense-chart" style={{ background: '#fff', padding: '20px', width: '660px' }}>
          <h3 style={{ fontFamily: 'sans-serif', fontSize: '16px', color: '#1c392d', marginBottom: '15px', fontWeight: 600 }}>
            Expenses by Category
          </h3>
          <SimplePieChart data={report.expensesByCategory} size={200} strokeWidth={28} />
        </div>
      )}

      {/* Income Pie */}
      {report.incomeBySource?.length > 0 && (
        <div id="pdf-income-chart" style={{ background: '#fff', padding: '20px', width: '660px', marginTop: '20px' }}>
          <h3 style={{ fontFamily: 'sans-serif', fontSize: '16px', color: '#1c392d', marginBottom: '15px', fontWeight: 600 }}>
            Income by Source
          </h3>
          <SimplePieChart data={report.incomeBySource} size={200} strokeWidth={28} />
        </div>
      )}

      {/* Trend Chart */}
      {report.dailyTrend?.length > 0 && (
        <div id="pdf-trend-chart" style={{ background: '#fff', padding: '20px', width: '660px', marginTop: '20px' }}>
          <h3 style={{ fontFamily: 'sans-serif', fontSize: '16px', color: '#1c392d', marginBottom: '15px', fontWeight: 600 }}>
            Daily Income vs Expenses
          </h3>
          <SimpleTrendChart data={report.dailyTrend} height={180} />
        </div>
      )}
    </div>
  );
};

export default PDFChartsContainer;