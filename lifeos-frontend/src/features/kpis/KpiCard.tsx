/**
 * KPI Card Component
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KpiDefinition, KpiResult, KpiRange } from './kpiTypes';
import { formatCurrency, formatHours, formatDelta, formatNumber } from './utils/format';
import { useKpiStore } from './useKpiStore';
import { KpiLine } from './charts/KpiLine';
import { KpiBar } from './charts/KpiBar';
import { KpiArea } from './charts/KpiArea';
import { KpiRing } from './charts/KpiRing';
import { KpiGauge } from './charts/KpiGauge';
import { KpiRadar } from './charts/KpiRadar';
import { getMonthlyIncome, getSpendingByCategory } from './adapters/finance.mock';
import { getDeepWork } from './adapters/focus.mock';
import { getLearning } from './adapters/learning.mock';
import { getHealthComposite } from './adapters/health.mock';
import { getProductivity } from './adapters/productivity.mock';

interface KpiCardProps {
  definition: KpiDefinition;
}

export function KpiCard({ definition }: KpiCardProps) {
  const navigate = useNavigate();
  const { rangeByKpi, setRange } = useKpiStore();
  const [data, setData] = useState<KpiResult | null>(null);
  const [loading, setLoading] = useState(true);

  const currentRange = rangeByKpi[definition.id] || definition.ranges[0];

  useEffect(() => {
    loadData();
  }, [currentRange, definition.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      let result: KpiResult;

      switch (definition.adapter) {
        case 'finance.income':
          result = await getMonthlyIncome(currentRange);
          break;
        case 'finance.spendSplit':
          result = await getSpendingByCategory(currentRange);
          break;
        case 'focus.deepWork':
          result = await getDeepWork(currentRange);
          break;
        case 'learning.hours':
          result = await getLearning(currentRange);
          break;
        case 'health.composite':
          result = await getHealthComposite(currentRange);
          break;
        case 'productivity.index':
          result = await getProductivity(currentRange);
          break;
        default:
          result = { stat: 0, deltaPct: 0, series: [] };
      }

      setData(result);
    } catch (error) {
      console.error('Failed to load KPI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatStat = (stat: number, meta?: any) => {
    if (definition.id === 'income' || definition.id === 'spendSplit') {
      return formatCurrency(stat);
    }
    if (definition.id === 'deepWork' || definition.id === 'knowledge') {
      return formatHours(stat);
    }
    if (definition.id === 'productivity' || definition.id === 'health') {
      return stat.toFixed(0);
    }
    return formatNumber(stat);
  };

  const delta = data ? formatDelta(data.deltaPct) : null;

  return (
    <div
      onClick={() => navigate(definition.detailRoute)}
      className="bg-[#12101a] rounded-xl border border-white/10 p-6 hover:border-white/15 hover:shadow-lg transition-all duration-200 cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && navigate(definition.detailRoute)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{definition.label}</h3>
        <div className="flex items-center gap-3">
          {delta && (
            <span
              className={`text-xs font-medium ${delta.color} ${delta.muted ? 'opacity-50' : ''}`}
            >
              {delta.text}
            </span>
          )}
          {definition.ranges.length > 1 && (
            <select
              value={currentRange}
              onChange={(e) => {
                e.stopPropagation();
                setRange(definition.id, e.target.value as KpiRange);
              }}
              className="text-xs bg-[#1a1724] text-white/60 rounded px-2 py-1 border border-white/15 focus:border-violet-500 focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              {definition.ranges.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Stat */}
      {!loading && data && (
        <div className="mb-4">
          <div className="text-4xl font-bold text-white">
            {formatStat(data.stat, data.meta)}
          </div>
          <div className="text-sm text-white/50 mt-1">{definition.description}</div>
        </div>
      )}

      {loading && (
        <div className="h-32 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
        </div>
      )}

      {/* Chart */}
      {!loading && data && (
        <div className="mt-4">
          {definition.type === 'bar' && <KpiBar data={data.series} />}
          {definition.type === 'line' && <KpiLine data={data.series} />}
          {definition.type === 'stackedArea' && (
            <KpiArea data={data.series} dataKeys={['reading', 'study']} />
          )}
          {definition.type === 'ring' && data.meta?.breakdown && (
            <KpiRing data={data.meta.breakdown} />
          )}
          {definition.type === 'gauge+line' && (
            <div>
              <KpiGauge value={data.stat} />
              <KpiLine data={data.series} height={80} showArea={false} />
            </div>
          )}
          {definition.type === 'line+ring' && (
            <div>
              <KpiLine data={data.series} height={100} />
              {data.meta?.goal && (
                <div className="mt-2 text-xs text-white/50">
                  Goal: {formatHours(data.meta.goal)}/week
                </div>
              )}
            </div>
          )}
          {definition.type === 'radar+area' && data.meta?.radarData && (
            <KpiRadar data={data.meta.radarData} height={140} />
          )}
        </div>
      )}
    </div>
  );
}
