/**
 * Health Mock Adapter
 */

import { subDays, format } from 'date-fns';
import { KpiResult, KpiRange } from '../kpiTypes';
import { SeededRandom } from '../utils/format';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getHealthComposite(range: KpiRange): Promise<KpiResult> {
  await sleep(200);

  const rng = new SeededRandom(45678);
  const now = new Date();
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;

  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(now, i);
    const sleepScore = rng.range(65, 95);
    const hrvZ = rng.range(-1, 2);
    const stepsNorm = rng.range(0.4, 1.0);

    // Composite = 0.4*sleepScore + 0.3*((hrvZ+2)/4*100) + 0.3*stepsNorm*100
    const composite = 0.4 * sleepScore + 0.3 * ((hrvZ + 2) / 4 * 100) + 0.3 * stepsNorm * 100;

    series.push({
      date: format(date, 'yyyy-MM-dd'),
      value: parseFloat(composite.toFixed(1)),
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
      radarData: [
        { label: 'Sleep', value: 82, max: 100 },
        { label: 'HRV', value: 75, max: 100 },
        { label: 'Steps', value: 68, max: 100 },
      ],
    },
  };
}
