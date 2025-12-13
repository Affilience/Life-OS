/**
 * Nova Statistics Service
 *
 * Provides proper statistical analysis instead of simple averages:
 * - Statistical significance testing
 * - Confidence intervals
 * - Trend detection with regression
 * - Anomaly detection
 * - Time series analysis
 */

/**
 * Calculate mean of an array
 */
export function mean(arr) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

/**
 * Calculate standard deviation
 */
export function standardDeviation(arr) {
  if (!arr || arr.length < 2) return 0;
  const avg = mean(arr);
  const squareDiffs = arr.map(val => Math.pow(val - avg, 2));
  return Math.sqrt(mean(squareDiffs));
}

/**
 * Calculate median
 */
export function median(arr) {
  if (!arr || arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Calculate percentile
 */
export function percentile(arr, p) {
  if (!arr || arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * Welch's t-test for comparing two groups
 * Returns { tStat, pValue, significant }
 */
export function welchTTest(group1, group2, alpha = 0.05) {
  if (!group1?.length || !group2?.length || group1.length < 3 || group2.length < 3) {
    return { tStat: 0, pValue: 1, significant: false, insufficient: true };
  }

  const n1 = group1.length;
  const n2 = group2.length;
  const mean1 = mean(group1);
  const mean2 = mean(group2);
  const var1 = Math.pow(standardDeviation(group1), 2);
  const var2 = Math.pow(standardDeviation(group2), 2);

  // Welch's t-statistic
  const se = Math.sqrt(var1 / n1 + var2 / n2);
  if (se === 0) return { tStat: 0, pValue: 1, significant: false };

  const tStat = (mean1 - mean2) / se;

  // Welch-Satterthwaite degrees of freedom
  const df = Math.pow(var1 / n1 + var2 / n2, 2) /
    (Math.pow(var1 / n1, 2) / (n1 - 1) + Math.pow(var2 / n2, 2) / (n2 - 1));

  // Approximate p-value using Student's t distribution
  // Using a simplified approximation for the CDF
  const pValue = approximateTwoTailedPValue(Math.abs(tStat), df);

  return {
    tStat: Math.round(tStat * 100) / 100,
    pValue: Math.round(pValue * 1000) / 1000,
    significant: pValue < alpha,
    meanDifference: Math.round((mean1 - mean2) * 100) / 100,
    effectSize: calculateCohenD(group1, group2)
  };
}

/**
 * Approximate p-value for t-distribution
 */
function approximateTwoTailedPValue(t, df) {
  // Approximation using the normal distribution for large df
  if (df > 30) {
    // Use normal approximation
    const z = t;
    return 2 * (1 - normalCDF(Math.abs(z)));
  }

  // For smaller df, use a rough approximation
  const x = df / (df + t * t);
  // Incomplete beta function approximation
  return x ** (df / 2);
}

/**
 * Normal CDF approximation
 */
function normalCDF(x) {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

/**
 * Cohen's d effect size
 */
export function calculateCohenD(group1, group2) {
  const pooledStd = Math.sqrt(
    ((group1.length - 1) * Math.pow(standardDeviation(group1), 2) +
      (group2.length - 1) * Math.pow(standardDeviation(group2), 2)) /
    (group1.length + group2.length - 2)
  );

  if (pooledStd === 0) return 0;

  const d = (mean(group1) - mean(group2)) / pooledStd;

  return {
    value: Math.round(d * 100) / 100,
    interpretation: interpretCohenD(d)
  };
}

function interpretCohenD(d) {
  const absD = Math.abs(d);
  if (absD < 0.2) return 'negligible';
  if (absD < 0.5) return 'small';
  if (absD < 0.8) return 'medium';
  return 'large';
}

/**
 * Linear regression for trend analysis
 * Returns { slope, intercept, rSquared, trend }
 */
export function linearRegression(data) {
  if (!data || data.length < 3) {
    return { slope: 0, intercept: 0, rSquared: 0, trend: 'insufficient_data' };
  }

  const n = data.length;
  const xValues = data.map((_, i) => i);
  const yValues = data;

  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((total, x, i) => total + x * yValues[i], 0);
  const sumXX = xValues.reduce((total, x) => total + x * x, 0);
  const sumYY = yValues.reduce((total, y) => total + y * y, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared
  const yMean = sumY / n;
  const ssTotal = yValues.reduce((total, y) => total + Math.pow(y - yMean, 2), 0);
  const ssResidual = yValues.reduce((total, y, i) => {
    const predicted = slope * i + intercept;
    return total + Math.pow(y - predicted, 2);
  }, 0);

  const rSquared = ssTotal > 0 ? 1 - (ssResidual / ssTotal) : 0;

  // Determine trend significance
  const slopePercent = yMean !== 0 ? (slope / yMean) * 100 : 0;
  let trend;
  if (rSquared < 0.3) {
    trend = 'no_clear_trend';
  } else if (slopePercent > 5) {
    trend = 'increasing';
  } else if (slopePercent < -5) {
    trend = 'decreasing';
  } else {
    trend = 'stable';
  }

  return {
    slope: Math.round(slope * 1000) / 1000,
    intercept: Math.round(intercept * 100) / 100,
    rSquared: Math.round(rSquared * 1000) / 1000,
    trend,
    confidence: rSquared > 0.7 ? 'high' : rSquared > 0.4 ? 'medium' : 'low',
    weeklyChange: Math.round(slope * 7 * 100) / 100 // For daily data
  };
}

/**
 * Detect anomalies using IQR method
 */
export function detectAnomalies(data, sensitivity = 1.5) {
  if (!data || data.length < 5) return { anomalies: [], threshold: null };

  const q1 = percentile(data, 25);
  const q3 = percentile(data, 75);
  const iqr = q3 - q1;

  const lowerBound = q1 - sensitivity * iqr;
  const upperBound = q3 + sensitivity * iqr;

  const anomalies = data
    .map((value, index) => ({ value, index }))
    .filter(d => d.value < lowerBound || d.value > upperBound);

  return {
    anomalies,
    bounds: { lower: lowerBound, upper: upperBound },
    iqr,
    q1,
    q3
  };
}

/**
 * Calculate confidence interval for mean
 */
export function confidenceInterval(data, confidence = 0.95) {
  if (!data || data.length < 3) {
    return { lower: 0, upper: 0, mean: 0, insufficient: true };
  }

  const n = data.length;
  const m = mean(data);
  const sd = standardDeviation(data);
  const se = sd / Math.sqrt(n);

  // Z-scores for common confidence levels
  const zScores = { 0.90: 1.645, 0.95: 1.96, 0.99: 2.576 };
  const z = zScores[confidence] || 1.96;

  return {
    lower: Math.round((m - z * se) * 100) / 100,
    upper: Math.round((m + z * se) * 100) / 100,
    mean: Math.round(m * 100) / 100,
    marginOfError: Math.round(z * se * 100) / 100
  };
}

/**
 * Analyze time-of-day distribution
 * Returns peak hours with statistical confidence
 */
export function analyzeTimeDistribution(timestamps) {
  if (!timestamps || timestamps.length < 10) {
    return { peakHours: [], distribution: [], insufficient: true };
  }

  // Count events per hour
  const hourCounts = new Array(24).fill(0);
  timestamps.forEach(ts => {
    const hour = new Date(ts).getHours();
    hourCounts[hour]++;
  });

  const total = timestamps.length;
  const expectedPerHour = total / 24;

  // Chi-squared test for non-uniform distribution
  const chiSquared = hourCounts.reduce((sum, count) => {
    return sum + Math.pow(count - expectedPerHour, 2) / expectedPerHour;
  }, 0);

  // Find significant peaks (more than 2 standard deviations above mean)
  const sd = standardDeviation(hourCounts);
  const avg = mean(hourCounts);
  const threshold = avg + 1.5 * sd;

  const peakHours = hourCounts
    .map((count, hour) => ({ hour, count, percentage: (count / total) * 100 }))
    .filter(h => h.count > threshold)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    peakHours,
    distribution: hourCounts,
    chiSquared: Math.round(chiSquared * 10) / 10,
    isSignificant: chiSquared > 36.42, // df=23, alpha=0.05
    evenlyDistributed: chiSquared < 36.42
  };
}

/**
 * Analyze day-of-week distribution
 */
export function analyzeDayDistribution(timestamps) {
  if (!timestamps || timestamps.length < 14) {
    return { bestDays: [], distribution: [], insufficient: true };
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayCounts = new Array(7).fill(0);

  timestamps.forEach(ts => {
    const day = new Date(ts).getDay();
    dayCounts[day]++;
  });

  const total = timestamps.length;
  const sd = standardDeviation(dayCounts);
  const avg = mean(dayCounts);

  const bestDays = dayCounts
    .map((count, day) => ({
      day: dayNames[day],
      dayIndex: day,
      count,
      percentage: (count / total) * 100,
      zScore: sd > 0 ? (count - avg) / sd : 0
    }))
    .sort((a, b) => b.count - a.count);

  return {
    bestDays: bestDays.slice(0, 3),
    worstDays: [...bestDays].reverse().slice(0, 2),
    distribution: dayCounts,
    weekdayVsWeekend: {
      weekday: mean(dayCounts.slice(1, 6)),
      weekend: mean([dayCounts[0], dayCounts[6]])
    }
  };
}

/**
 * Comprehensive analysis combining multiple methods
 */
export function comprehensiveAnalysis(data, timestamps = null) {
  const result = {
    basicStats: {
      count: data.length,
      mean: mean(data),
      median: median(data),
      stdDev: standardDeviation(data),
      min: Math.min(...data),
      max: Math.max(...data)
    },
    trend: linearRegression(data),
    confidence: confidenceInterval(data),
    anomalies: detectAnomalies(data)
  };

  if (timestamps) {
    result.timePatterns = analyzeTimeDistribution(timestamps);
    result.dayPatterns = analyzeDayDistribution(timestamps);
  }

  return result;
}

export const statisticsService = {
  mean,
  median,
  standardDeviation,
  percentile,
  welchTTest,
  calculateCohenD,
  linearRegression,
  detectAnomalies,
  confidenceInterval,
  analyzeTimeDistribution,
  analyzeDayDistribution,
  comprehensiveAnalysis
};

export default statisticsService;
