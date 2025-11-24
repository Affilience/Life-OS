/**
 * Focus Mock Adapter
 * Generates mock deep work session data
 */

import { subDays, format } from 'date-fns';
import { KpiResult, KpiRange } from '../kpiTypes';
import { SeededRandom } from '../utils/format';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getDeepWork(range: KpiRange): Promise<KpiResult> {
  await sleep(200);

  const rng = new SeededRandom(23456);
  const now = new Date();
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;

  // Generate daily deep work hours
  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(now, i);
    const hours = rng.range(0.5, 4.5);
    series.push({
      date: format(date, 'yyyy-MM-dd'),
      value: parseFloat(hours.toFixed(2)),
    });
  }

  // Current week total
  const currentWeekTotal = series.slice(-7).reduce((sum, d) => sum + d.value, 0);
  const previousWeekTotal = series.slice(-14, -7).reduce((sum, d) => sum + d.value, 0) || currentWeekTotal;
  const deltaPct = ((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100;

  return {
    stat: parseFloat(currentWeekTotal.toFixed(1)),
    deltaPct,
    series,
    meta: {
      goal: 20,
      unit: 'hours',
    },
  };
}
