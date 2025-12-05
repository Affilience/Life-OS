import React, { useState, useMemo } from 'react';
import {
  Pill,
  Plus,
  Check,
  Clock,
  Flame,
  AlertTriangle,
  Edit2,
  Trash2,
  Info,
} from 'lucide-react';
import { useHealthStore } from '../../../stores/healthStore';
import { EmptyState } from '../../ui';
import AddSupplementModal from './AddSupplementModal';

const TIMING_GROUPS = {
  morning: { label: 'Morning', emoji: '🌅', order: 1 },
  afternoon: { label: 'Afternoon', emoji: '☀️', order: 2 },
  evening: { label: 'Evening', emoji: '🌙', order: 3 },
  any: { label: 'Any Time', emoji: '⏰', order: 4 },
};

export default function SupplementSchedule() {
  const {
    supplements,
    supplementLog,
    selectedDate,
    deleteSupplement,
    logSupplementTaken,
    unlogSupplementTaken,
    isSupplementTaken,
    getSupplementStats,
    getSupplementInteractions,
  } = useHealthStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSupplement, setEditingSupplement] = useState(null);
  const [showInteractions, setShowInteractions] = useState(false);

  const stats = getSupplementStats();

  // Group supplements by timing
  const groupedSupplements = useMemo(() => {
    const groups = {};
    supplements.forEach((supp) => {
      const timing = supp.timing || 'any';
      if (!groups[timing]) groups[timing] = [];
      groups[timing].push(supp);
    });

    // Sort groups by timing order
    return Object.entries(groups)
      .sort(([a], [b]) => (TIMING_GROUPS[a]?.order || 99) - (TIMING_GROUPS[b]?.order || 99))
      .map(([timing, supps]) => ({ timing, supplements: supps }));
  }, [supplements]);

  // Check for interactions
  const interactions = useMemo(() => {
    const supplementIds = supplements.map((s) => s.id);
    return getSupplementInteractions(supplementIds);
  }, [supplements, getSupplementInteractions]);

  const handleToggle = (supplementId) => {
    if (isSupplementTaken(supplementId)) {
      unlogSupplementTaken(supplementId);
    } else {
      logSupplementTaken(supplementId);
    }
  };

  const handleEdit = (supplement) => {
    setEditingSupplement(supplement);
    setShowAddModal(true);
  };

  const handleDelete = (supplementId) => {
    if (confirm('Delete this supplement?')) {
      deleteSupplement(supplementId);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingSupplement(null);
  };

  return (
    <div className="supplement-schedule">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Pill className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Supplement Stack</h3>
          {supplements.length > 0 && (
            <span className="text-sm text-white/50">
              ({stats.takenToday}/{stats.totalSupplements})
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Stats Bar */}
      {supplements.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-purple-500/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.completionRate}%</div>
            <div className="text-xs text-white/50">Today</div>
          </div>
          <div className="bg-orange-500/10 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-2xl font-bold text-orange-400">{stats.streak}</span>
            </div>
            <div className="text-xs text-white/50">Day Streak</div>
          </div>
          <div className="bg-emerald-500/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-emerald-400">{stats.totalSupplements}</div>
            <div className="text-xs text-white/50">Supplements</div>
          </div>
        </div>
      )}

      {/* Interaction Warnings */}
      {interactions.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowInteractions(!showInteractions)}
            className="w-full flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-400 font-medium">
                {interactions.length} Interaction Warning{interactions.length > 1 ? 's' : ''}
              </span>
            </div>
            <span className="text-xs text-amber-400/70">
              {showInteractions ? 'Hide' : 'View'}
            </span>
          </button>

          {showInteractions && (
            <div className="mt-2 space-y-2">
              {interactions.map((interaction, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg"
                >
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-white/70">{interaction.warning}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Supplement List by Timing */}
      {supplements.length > 0 ? (
        <div className="space-y-4">
          {groupedSupplements.map(({ timing, supplements: timingSupps }) => {
            const group = TIMING_GROUPS[timing] || TIMING_GROUPS.any;
            const allTaken = timingSupps.every((s) => isSupplementTaken(s.id));

            return (
              <div key={timing}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">{group.emoji}</span>
                  <span className="text-sm font-medium text-white/70">{group.label}</span>
                  {allTaken && (
                    <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                      Done
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {timingSupps.map((supplement) => {
                    const taken = isSupplementTaken(supplement.id);
                    const log = supplementLog[selectedDate]?.[supplement.id];

                    return (
                      <div
                        key={supplement.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          taken
                            ? 'bg-purple-500/10 border-purple-500/30'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        {/* Checkbox */}
                        <button
                          onClick={() => handleToggle(supplement.id)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            taken
                              ? 'bg-purple-500 border-purple-500'
                              : 'border-white/30 hover:border-purple-500'
                          }`}
                        >
                          {taken && <Check className="w-4 h-4 text-white" />}
                        </button>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div
                            className={`font-medium ${
                              taken ? 'text-purple-300' : 'text-white'
                            }`}
                          >
                            {supplement.name}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/50">
                            {supplement.dosage && (
                              <span>
                                {supplement.dosage} {supplement.unit}
                              </span>
                            )}
                            {supplement.withFood && (
                              <span className="text-amber-400">with food</span>
                            )}
                            {taken && log?.time && (
                              <span className="flex items-center gap-1 text-emerald-400">
                                <Clock className="w-3 h-3" />
                                {log.time}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(supplement)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(supplement.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          type="supplements"
          title="No supplements tracked"
          description="Add your daily supplements to track your intake and get reminders. We'll also warn you about potential interactions."
          variant="purple"
          size="sm"
          action={
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Supplement
            </button>
          }
        />
      )}

      {/* Progress message */}
      {supplements.length > 0 && stats.completionRate === 100 && (
        <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
          <span className="text-emerald-400 font-medium">
            All supplements taken for today!
          </span>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <AddSupplementModal onClose={handleCloseModal} editSupplement={editingSupplement} />
      )}
    </div>
  );
}
