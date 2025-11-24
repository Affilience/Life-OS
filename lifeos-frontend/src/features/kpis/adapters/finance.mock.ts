/**
 * Finance Mock Adapter
 * Generates mock financial data
 */

import { subMonths, format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { KpiResult, KpiRange } from '../kpiTypes';
import { SeededRandom } from '../utils/format';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getMonthlyIncome(range: KpiRange): Promise<KpiResult> {
  await sleep(200);

  const rng = new SeededRandom(12345);
  const now = new Date();
  const months = range === '12m' ? 12 : 6;

  // Generate monthly income data
  const series = [];
  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(now, i);
    const baseIncome = 2500 + rng.range(-300, 500);
    series.push({
      date: format(startOfMonth(date), 'yyyy-MM-dd'),
      value: Math.round(baseIncome),
    });
  }

  // Current month to date (projected)
  const currentMonthIncome = 2900;
  const previousMonthIncome = series[series.length - 1]?.value || 2500;
  const deltaPct = ((currentMonthIncome - previousMonthIncome) / previousMonthIncome) * 100;

  return {
    stat: currentMonthIncome,
    deltaPct,
    series,
    meta: {
      unit: '£',
    },
  };
}

export async function getSpendingByCategory(range: KpiRange): Promise<KpiResult> {
  await sleep(200);

  const totalSpending = 1840;

  return {
    stat: totalSpending,
    deltaPct: -8.3,
    series: [],
    meta: {
      unit: '£',
      breakdown: [
        { label: 'Essentials', value: 980, color: '#7A5CFF' },
        { label: 'Discretionary', value: 520, color: '#A78BFA' },
        { label: 'Investing', value: 240, color: '#C4B5FD' },
        { label: 'Other', value: 100, color: '#DDD6FE' },
      ],
    },
  };
}
