/**
 * Learning Mock Adapter
 */

import { subDays, format } from 'date-fns';
import { KpiResult, KpiRange } from '../kpiTypes';
import { SeededRandom } from '../utils/format';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getLearning(range: KpiRange): Promise<KpiResult> {
  await sleep(200);

  const rng = new SeededRandom(34567);
  const now = new Date();
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;

  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(now, i);
    const reading = rng.range(0, 2);
    const study = rng.range(0, 1.5);
    series.push({
      date: format(date, 'yyyy-MM-dd'),
      value: parseFloat((reading + study).toFixed(2)),
      reading: parseFloat(reading.toFixed(2)),
      study: parseFloat(study.toFixed(2)),
    });
  }

  const currentWeekTotal = series.slice(-7).reduce((sum, d) => sum + d.value, 0);
  const previousWeekTotal = series.slice(-14, -7).reduce((sum, d) => sum + d.value, 0) || currentWeekTotal;
  const deltaPct = ((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100;

  return {
    stat: parseFloat(currentWeekTotal.toFixed(1)),
    deltaPct,
    series,
    meta: {
      unit: 'hours',
    },
  };
}
