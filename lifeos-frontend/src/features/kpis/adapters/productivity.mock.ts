/**
 * Productivity Mock Adapter
 */

import { subDays, format } from 'date-fns';
import { KpiResult, KpiRange } from '../kpiTypes';
import { SeededRandom } from '../utils/format';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getProductivity(range: KpiRange): Promise<KpiResult> {
  await sleep(200);

  const rng = new SeededRandom(56789);
  const now = new Date();
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;

  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(now, i);
    const deepWork = rng.range(2, 5);
    const screenTime = rng.range(6, 12);
    const index = Math.min(100, (deepWork / screenTime) * 100);

    series.push({
      date: format(date, 'yyyy-MM-dd'),
      value: parseFloat(index.toFixed(1)),
    });
  }

  const currentAvg = series.slice(-7).reduce((sum, d) => sum + d.value, 0) / 7;
  const previousAvg = series.slice(-14, -7).reduce((sum, d) => sum + d.value, 0) / 7 || currentAvg;
  const deltaPct = ((currentAvg - previousAvg) / previousAvg) * 100;

  return {
    stat: parseFloat(currentAvg.toFixed(1)),
    deltaPct,
    series,
    meta: {
      unit: '%',
    },
  };
}
