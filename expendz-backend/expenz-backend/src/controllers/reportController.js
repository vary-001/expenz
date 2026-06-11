// src/controllers/reportController.js
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Budget = require('../models/Budget');
const { success, error } = require('../utils/apiResponse');

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

const buildDateFilter = (startDate, endDate) => {
  const filter = {};
  if (startDate) filter.$gte = new Date(startDate);
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    filter.$lte = end;
  }
  return Object.keys(filter).length ? { date: filter } : {};
};

const getDaysBetween = (start, end) => {
  if (!start || !end) return 30;
  const diff = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24);
  return Math.max(Math.round(diff), 1);
};

// ═══════════════════════════════════════════════════════════
// MONEY STORY GENERATOR (Multi-language)
// ═══════════════════════════════════════════════════════════

const generateMoneyStory = (data, lang = 'en') => {
  const {
    totalIncome,
    totalExpense,
    netBalance,
    savingsRate,
    expensesByCategory,
    incomeBySource,
    days,
    dailyAvgExpense,
    budgetAnalysis,
  } = data;

  const tr = {
    en: {
      noActivity: 'No financial activity recorded for this period. Start by adding income and expenses to see insights.',
      incomeOverview: (days, total, sources, topSource, percentage) =>
        `Over ${days} day${days > 1 ? 's' : ''}, you earned a total of ${total.toFixed(2)} across ${sources} income source${sources > 1 ? 's' : ''}. Your largest source was "${topSource}" contributing ${percentage.toFixed(1)}% of total income.`,
      expenseOverview: (total, avg, topCat, percentage, count) =>
        `You spent ${total.toFixed(2)} in total, averaging ${avg.toFixed(2)} per day. The category "${topCat}" accounted for ${percentage.toFixed(1)}% of all expenses with ${count} transaction${count > 1 ? 's' : ''}.`,
      breakdown: (cats, totalPct) =>
        `Your top 3 spending categories were: ${cats}. These three categories represent ${totalPct.toFixed(0)}% of your spending.`,
      positiveBalance: (balance, rate, level) =>
        `You ended the period with a positive balance of ${balance.toFixed(2)}, saving ${rate.toFixed(1)}% of your income. This is ${level} savings rate.`,
      negativeBalance: (amount) =>
        `Your expenses exceeded your income by ${amount.toFixed(2)}. This means you spent more than you earned during this period.`,
      budgetOver: (over, warn, good) =>
        `You exceeded ${over} budget limit${over > 1 ? 's' : ''}, are close to limit on ${warn}, and are within range on ${good} budget${good !== 1 ? 's' : ''}.`,
      budgetAllGood: (count) =>
        `Excellent budget management! All ${count} budget${count > 1 ? 's are' : ' is'} within healthy limits.`,
      excellent: 'an excellent',
      good: 'a good',
      low: 'a low',
    },
    kiny: {
      noActivity: "Nta bikorwa by'amafaranga byanditswe muri iki gihe. Tangira kongeramo amafaranga yinjiye n'ayakoreshejwe kugira ngo ubone isesengura.",
      incomeOverview: (days, total, sources, topSource, percentage) =>
        `Mu minsi ${days}, winjije amafaranga ${total.toFixed(2)} muri inkomoko ${sources}. Inkomoko nyamukuru yawe yari "${topSource}" yatanze ${percentage.toFixed(1)}% by'amafaranga yose yinjiye.`,
      expenseOverview: (total, avg, topCat, percentage, count) =>
        `Wakoresheje amafaranga ${total.toFixed(2)} yose, impuzandengo ${avg.toFixed(2)} ku munsi. Icyiciro "${topCat}" gifite ${percentage.toFixed(1)}% by'amafaranga yose yakoreshejwe mu bikorwa ${count}.`,
      breakdown: (cats, totalPct) =>
        `Ibyiciro 3 bya mbere wakoresheje ni: ${cats}. Ibi byiciro bitatu bihagarariye ${totalPct.toFixed(0)}% by'amafaranga wakoresheje.`,
      positiveBalance: (balance, rate, level) =>
        `Warangije igihe ufite amafaranga ${balance.toFixed(2)}, wizigamye ${rate.toFixed(1)}% by'amafaranga winjije. Iri ni ${level} ryo kuzigama.`,
      negativeBalance: (amount) =>
        `Amafaranga wakoresheje yarenze ayinjiye ku mafaranga ${amount.toFixed(2)}. Bivuze ko wakoresheje kurusha winjije muri iki gihe.`,
      budgetOver: (over, warn, good) =>
        `Warenze ingengo ${over}, uri hafi y'umupaka ku ${warn}, kandi uri mu mubare wemewe ku ${good}.`,
      budgetAllGood: (count) =>
        `Imicungire myiza y'ingengo! Zose ${count} ziri mu mibare myiza.`,
      excellent: 'igipimo cyiza cyane',
      good: 'igipimo cyiza',
      low: 'igipimo gito',
    },
  };

  const t = tr[lang] || tr.en;
  const story = [];

  // No data at all
  if (totalIncome === 0 && totalExpense === 0) {
    story.push({ icon: 'info', text: t.noActivity });
    return story;
  }

  // Income overview
  if (totalIncome > 0) {
    const topSource = incomeBySource[0];
    if (topSource) {
      story.push({
        icon: 'income',
        text: t.incomeOverview(days, totalIncome, incomeBySource.length, topSource.source, topSource.percentage),
      });
    }
  }

  // Expense overview
  if (totalExpense > 0) {
    const topCategory = expensesByCategory[0];
    if (topCategory) {
      story.push({
        icon: 'expense',
        text: t.expenseOverview(totalExpense, dailyAvgExpense, topCategory.category, topCategory.percentage, topCategory.count),
      });
    }

    // Top 3 categories breakdown
    if (expensesByCategory.length >= 3) {
      const top3 = expensesByCategory.slice(0, 3);
      const catsStr = top3.map((c) => `${c.category} (${c.percentage.toFixed(0)}%)`).join(', ');
      const totalPct = top3.reduce((s, c) => s + c.percentage, 0);
      story.push({ icon: 'breakdown', text: t.breakdown(catsStr, totalPct) });
    }
  }

  // Balance result
  if (netBalance > 0) {
    const level = savingsRate >= 20 ? t.excellent : savingsRate >= 10 ? t.good : t.low;
    story.push({ icon: 'positive', text: t.positiveBalance(netBalance, savingsRate, level) });
  } else if (netBalance < 0) {
    story.push({ icon: 'negative', text: t.negativeBalance(Math.abs(netBalance)) });
  }

  // Budget compliance summary
  if (budgetAnalysis.length > 0) {
    const over = budgetAnalysis.filter((b) => b.status === 'over').length;
    const warn = budgetAnalysis.filter((b) => b.status === 'warning').length;
    const good = budgetAnalysis.filter((b) => b.status === 'good').length;

    if (over > 0) {
      story.push({ icon: 'budget', text: t.budgetOver(over, warn, good) });
    } else if (good === budgetAnalysis.length) {
      story.push({ icon: 'budget', text: t.budgetAllGood(good) });
    }
  }

  return story;
};

// ═══════════════════════════════════════════════════════════
// SUGGESTIONS GENERATOR (Multi-language)
// ═══════════════════════════════════════════════════════════

const generateSuggestions = (data, lang = 'en') => {
  const suggestions = [];
  const { totalIncome, totalExpense, expensesByCategory, budgets, savingsRate, incomeSources } = data;

  const tr = {
    en: {
      lowSavings: {
        title: 'Low Savings Rate',
        msg: (rate) => `You're saving only ${rate.toFixed(1)}% of your income. Experts recommend at least 20%.`,
        tip: 'Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.',
      },
      healthySavings: {
        title: 'Healthy Savings',
        msg: (rate) => `Great! You're saving ${rate.toFixed(1)}% of your income.`,
        tip: 'Consider investing your savings for long-term growth.',
      },
      excellentSaver: {
        title: 'Excellent Saver',
        msg: (rate) => `Outstanding! You're saving ${rate.toFixed(1)}% of your income.`,
        tip: 'You could explore investments or diversify income streams.',
      },
      overSpending: {
        title: 'Spending Exceeds Income',
        msg: (over) => `You spent ${over.toFixed(2)} more than you earned this period.`,
        tip: 'Review your expenses and identify non-essential spending to cut.',
      },
      concentrated: {
        title: 'Concentrated Spending',
        msg: (pct, cat) => `${pct.toFixed(0)}% of your spending goes to "${cat}".`,
        tip: 'Diversify your spending or check if this category can be optimized.',
      },
      overBudgets: {
        title: (n) => `${n} Budget${n > 1 ? 's' : ''} Exceeded`,
        msg: (cats) => `Categories over budget: ${cats}.`,
        tip: 'Adjust your spending or increase the budget for these categories.',
      },
      singleIncome: {
        title: 'Single Income Source',
        msg: 'You rely on only one income source.',
        tip: 'Consider building additional income streams for financial security.',
      },
      noActivity: {
        title: 'No Activity Yet',
        msg: 'Start recording your income and expenses to get personalized insights.',
        tip: 'Add a few transactions to unlock smart financial suggestions.',
      },
      healthy: {
        title: 'Financially Healthy',
        msg: 'Your spending is well within your income and budgets are on track.',
        tip: 'Keep up the great work! Consider setting financial goals.',
      },
    },
    kiny: {
      lowSavings: {
        title: 'Igipimo gito cyo Kuzigama',
        msg: (rate) => `Uri kuzigama ${rate.toFixed(1)}% gusa by'amafaranga winjije. Inzobere zisaba 20% nibura.`,
        tip: 'Gerageza uburyo bwa 50/30/20: 50% ibikenewe, 30% ibyifuzwa, 20% kuzigama.',
      },
      healthySavings: {
        title: 'Kuzigama Kwiza',
        msg: (rate) => `Byiza! Uri kuzigama ${rate.toFixed(1)}% by'amafaranga winjije.`,
        tip: 'Tekereza gushora amafaranga wazigamye mu bushinguro burambye.',
      },
      excellentSaver: {
        title: 'Umuzigamye Wikitegure',
        msg: (rate) => `Byiza cyane! Uri kuzigama ${rate.toFixed(1)}% by'amafaranga.`,
        tip: "Ushobora gushakisha ibishoramari cyangwa kongera inkomoko z'amafaranga.",
      },
      overSpending: {
        title: 'Wakoresheje Birenze Wishe Winjije',
        msg: (over) => `Wakoresheje amafaranga ${over.toFixed(2)} kurenza ayo winjije.`,
        tip: 'Reba amafaranga wakoresheje umenye ibitarakenewe ushobora kugabanya.',
      },
      concentrated: {
        title: 'Amafaranga Yibanze hamwe',
        msg: (pct, cat) => `${pct.toFixed(0)}% by'amafaranga wakoresheje ajya muri "${cat}".`,
        tip: 'Tatanga amafaranga yawe cyangwa urebe niba iki cyiciro gishobora gucungwa neza.',
      },
      overBudgets: {
        title: (n) => `Ingengo ${n} Zarenze`,
        msg: (cats) => `Ibyiciro birenze ingengo: ${cats}.`,
        tip: "Hindura uburyo ukoresha cyangwa wongere ingengo z'ibi byiciro.",
      },
      singleIncome: {
        title: "Inkomoko Imwe y'Amafaranga",
        msg: "Ufite inkomoko imwe gusa y'amafaranga.",
        tip: "Tekereza kongera izindi nkomoko z'amafaranga kugira ngo ushinge umutekano w'imari.",
      },
      noActivity: {
        title: 'Nta Bikorwa Burakorwa',
        msg: "Tangira kwandika amafaranga winjije n'ayakoreshejwe kugira ngo ubone isesengura.",
        tip: "Ongeraho ibikorwa bike kugira ngo ubone inama z'amafaranga.",
      },
      healthy: {
        title: 'Imari Yawe Iri Neza',
        msg: "Amafaranga ukoresha ari mu rugero rw'amafaranga winjije kandi ingengo zikurikiranwa neza.",
        tip: "Komeza ukore neza! Tekereza gushyiraho intego z'imari.",
      },
    },
  };

  const T = tr[lang] || tr.en;

  // 1. Savings rate analysis
  if (totalIncome > 0) {
    if (savingsRate < 10) {
      suggestions.push({
        type: 'warning',
        title: T.lowSavings.title,
        message: T.lowSavings.msg(savingsRate),
        tip: T.lowSavings.tip,
      });
    } else if (savingsRate >= 20 && savingsRate < 40) {
      suggestions.push({
        type: 'success',
        title: T.healthySavings.title,
        message: T.healthySavings.msg(savingsRate),
        tip: T.healthySavings.tip,
      });
    } else if (savingsRate >= 40) {
      suggestions.push({
        type: 'success',
        title: T.excellentSaver.title,
        message: T.excellentSaver.msg(savingsRate),
        tip: T.excellentSaver.tip,
      });
    }
  }

  // 2. Overspending check
  if (totalExpense > totalIncome && totalIncome > 0) {
    suggestions.push({
      type: 'danger',
      title: T.overSpending.title,
      message: T.overSpending.msg(totalExpense - totalIncome),
      tip: T.overSpending.tip,
    });
  }

  // 3. Concentrated spending
  if (expensesByCategory.length > 0 && totalExpense > 0) {
    const top = expensesByCategory[0];
    const topPct = (top.amount / totalExpense) * 100;
    if (topPct > 50) {
      suggestions.push({
        type: 'info',
        title: T.concentrated.title,
        message: T.concentrated.msg(topPct, top.category),
        tip: T.concentrated.tip,
      });
    }
  }

  // 4. Over-budget categories
  const overBudgets = budgets.filter((b) => b.spent > b.amount);
  if (overBudgets.length > 0) {
    suggestions.push({
      type: 'warning',
      title: T.overBudgets.title(overBudgets.length),
      message: T.overBudgets.msg(overBudgets.map((b) => b.category).join(', ')),
      tip: T.overBudgets.tip,
    });
  }

  // 5. Single income source
  if (incomeSources && incomeSources.length === 1 && totalIncome > 0) {
    suggestions.push({
      type: 'info',
      title: T.singleIncome.title,
      message: T.singleIncome.msg,
      tip: T.singleIncome.tip,
    });
  }

  // 6. No data
  if (totalExpense === 0 && totalIncome === 0) {
    suggestions.push({
      type: 'info',
      title: T.noActivity.title,
      message: T.noActivity.msg,
      tip: T.noActivity.tip,
    });
  }

  // 7. Healthy pattern
  if (totalExpense > 0 && totalExpense < totalIncome * 0.8 && overBudgets.length === 0) {
    suggestions.push({
      type: 'success',
      title: T.healthy.title,
      message: T.healthy.msg,
      tip: T.healthy.tip,
    });
  }

  return suggestions;
};

// ═══════════════════════════════════════════════════════════
// MAIN REPORT GENERATOR
// ═══════════════════════════════════════════════════════════

/**
 * POST /api/reports/generate
 * Body: { startDate?, endDate?, type?, lang? }
 * Returns: Full analytics report with charts data, suggestions, and money story
 */
const generateReport = async (req, res, next) => {
  try {
    const { startDate, endDate, type = 'overview', lang = 'en' } = req.body;
    const userId = req.user._id;

    const dateFilter = buildDateFilter(startDate, endDate);
    const baseQuery = { user: userId, ...dateFilter };
    const days = getDaysBetween(startDate, endDate);

    // ─── FETCH ALL DATA IN PARALLEL ─── //
    const [expenses, incomes, budgets] = await Promise.all([
      Expense.find(baseQuery).sort({ date: -1 }),
      Income.find(baseQuery).sort({ date: -1 }),
      Budget.find({ user: userId }),
    ]);

    // ─── CORE TOTALS ─── //
    const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
    const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;
    const dailyAvgExpense = totalExpense / days;
    const dailyAvgIncome = totalIncome / days;

    // ─── EXPENSES BY CATEGORY ─── //
    const expensesByCategoryMap = {};
    expenses.forEach((e) => {
      expensesByCategoryMap[e.category] = (expensesByCategoryMap[e.category] || 0) + e.amount;
    });
    const expensesByCategory = Object.entries(expensesByCategoryMap)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
        count: expenses.filter((e) => e.category === category).length,
      }))
      .sort((a, b) => b.amount - a.amount);

    // ─── INCOME BY SOURCE ─── //
    const incomeBySourceMap = {};
    incomes.forEach((i) => {
      incomeBySourceMap[i.source] = (incomeBySourceMap[i.source] || 0) + i.amount;
    });
    const incomeBySource = Object.entries(incomeBySourceMap)
      .map(([source, amount]) => ({
        source,
        amount,
        percentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0,
        count: incomes.filter((i) => i.source === source).length,
      }))
      .sort((a, b) => b.amount - a.amount);

    // ─── DAILY TREND ─── //
    const dailyTrend = [];
    const trendStart = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const trendEnd = endDate ? new Date(endDate) : new Date();

    for (let d = new Date(trendStart); d <= trendEnd; d.setDate(d.getDate() + 1)) {
      const dayStr = d.toISOString().split('T')[0];
      const dayExpenses = expenses
        .filter((e) => e.date.toISOString().split('T')[0] === dayStr)
        .reduce((s, e) => s + e.amount, 0);
      const dayIncomes = incomes
        .filter((i) => i.date.toISOString().split('T')[0] === dayStr)
        .reduce((s, i) => s + i.amount, 0);
      dailyTrend.push({
        date: dayStr,
        expense: dayExpenses,
        income: dayIncomes,
      });
    }
    const recentTrend = dailyTrend.slice(-30);

    // ─── BUDGET ANALYSIS ─── //
    const budgetAnalysis = budgets.map((b) => {
      const spent = expenses
        .filter((e) => e.category === b.category)
        .reduce((s, e) => s + e.amount, 0);
      return {
        category: b.category,
        budgeted: b.amount,
        spent,
        remaining: b.amount - spent,
        percentageUsed: b.amount > 0 ? (spent / b.amount) * 100 : 0,
        status: spent > b.amount ? 'over' : spent / b.amount > 0.8 ? 'warning' : 'good',
      };
    });

    // ─── TOP TRANSACTIONS ─── //
    const topExpenses = [...expenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map((e) => ({
        description: e.description,
        category: e.category,
        amount: e.amount,
        date: e.date,
      }));

    const topIncomes = [...incomes]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map((i) => ({
        source: i.source,
        category: i.category,
        amount: i.amount,
        date: i.date,
      }));

    // ─── GENERATE STORY (in user's language) ─── //
    const moneyStory = generateMoneyStory(
      {
        totalIncome,
        totalExpense,
        netBalance,
        savingsRate,
        expensesByCategory,
        incomeBySource,
        days,
        dailyAvgExpense,
        budgetAnalysis,
      },
      lang
    );

    // ─── GENERATE SUGGESTIONS (in user's language) ─── //
    const suggestions = generateSuggestions(
      {
        totalIncome,
        totalExpense,
        expensesByCategory,
        incomeSources: incomeBySource,
        budgets: budgetAnalysis,
        savingsRate,
      },
      lang
    );

    // ─── BUILD FINAL RESPONSE ─── //
    const report = {
      type,
      period: {
        startDate: startDate || (recentTrend[0]?.date || null),
        endDate: endDate || (recentTrend[recentTrend.length - 1]?.date || null),
        days,
      },
      summary: {
        totalIncome,
        totalExpense,
        netBalance,
        savingsRate,
        dailyAvgExpense,
        dailyAvgIncome,
        transactionCount: expenses.length + incomes.length,
        expenseCount: expenses.length,
        incomeCount: incomes.length,
      },
      expensesByCategory,
      incomeBySource,
      dailyTrend: recentTrend,
      budgetAnalysis,
      topExpenses,
      topIncomes,
      moneyStory,
      suggestions,
    };

    return success(res, 200, 'Report generated successfully', { report });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════

module.exports = { generateReport };