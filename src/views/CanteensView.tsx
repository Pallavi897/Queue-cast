import React, { useMemo, useState } from 'react';
import {
  Clock,
  Edit3,
  Heart,
  MapPin,
  Plus,
  Radio,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';
import { QueueBadge } from '../components/QueueBadge';
import { useQueueCast } from '../context/QueueCastContext';
import { Canteen, QueueLevel } from '../types/queuecast';
import {
  calculateWaitMinutes,
  formatTimeShort,
  getBestTimeToVisit,
  getQueueLevel,
} from '../utils/calculations';

export const CanteensView: React.FC = () => {
  const {
    currentUser,
    canteens,
    queueHistory,
    favourites,
    settings,
    lastSimulationTick,
    openCanteenDetail,
    toggleFavourite,
    addCanteen,
    editCanteen,
    deleteCanteen,
    toggleSimulation,
    showToast,
  } = useQueueCast();

  const isAdmin = currentUser?.role === 'admin';
  const isAdminOrStaff = isAdmin || currentUser?.role === 'staff';

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'All' | QueueLevel>('All');
  const [onlyFavourites, setOnlyFavourites] = useState(false);

  // Add/Edit Canteen Modal state (Admin)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCanteen, setEditingCanteen] = useState<Canteen | null>(null);
  const [formName, setFormName] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formHours, setFormHours] = useState('8:30 AM – 6:00 PM');
  const [formCounters, setFormCounters] = useState(2);
  const [formServiceTime, setFormServiceTime] = useState(
    settings.defaultServiceTimeMin
  );
  const [formIsOpen, setFormIsOpen] = useState(true);
  const [formError, setFormError] = useState('');

  // Delete confirmation state
  const [canteenToDelete, setCanteenToDelete] = useState<Canteen | null>(null);

  const filteredCanteens = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return canteens.filter((c) => {
      if (onlyFavourites && !favourites.includes(c.id)) return false;
      if (
        q &&
        !c.name.toLowerCase().includes(q) &&
        !c.location.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (levelFilter !== 'All') {
        const wait = calculateWaitMinutes(
          c.peopleInQueue,
          c.avgServiceTimeMin,
          c.openCounters
        );
        const level = getQueueLevel(wait, settings.thresholds);
        if (level !== levelFilter) return false;
      }
      return true;
    });
  }, [canteens, searchQuery, levelFilter, onlyFavourites, favourites, settings.thresholds]);

  const openAddModal = () => {
    setEditingCanteen(null);
    setFormName('');
    setFormLocation('');
    setFormHours('8:30 AM – 6:00 PM');
    setFormCounters(2);
    setFormServiceTime(settings.defaultServiceTimeMin);
    setFormIsOpen(true);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (c: Canteen, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCanteen(c);
    setFormName(c.name);
    setFormLocation(c.location);
    setFormHours(c.openingHours);
    setFormCounters(c.openCounters);
    setFormServiceTime(c.avgServiceTimeMin);
    setFormIsOpen(c.isOpen);
    setFormError('');
    setModalOpen(true);
  };

  const handleSaveCanteen = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (editingCanteen) {
      const res = editCanteen(editingCanteen.id, {
        name: formName,
        location: formLocation,
        openingHours: formHours,
        isOpen: formIsOpen,
        openCounters: Number(formCounters),
        avgServiceTimeMin: Number(formServiceTime),
      });
      if (!res.ok) {
        setFormError(res.message);
        return;
      }
      showToast(res.message, 'success');
      setModalOpen(false);
    } else {
      const res = addCanteen({
        name: formName,
        location: formLocation,
        openingHours: formHours,
        openCounters: Number(formCounters),
        avgServiceTimeMin: Number(formServiceTime),
      });
      if (!res.ok) {
        setFormError(res.message);
        return;
      }
      showToast(res.message, 'success');
      setModalOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (!canteenToDelete) return;
    const res = deleteCanteen(canteenToDelete.id);
    if (res.ok) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
    setCanteenToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#333333]">
            Campus Canteens
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Live estimated wait times ·{' '}
            {settings.simulationEnabled
              ? `Simulated data, no sensors connected${
                  lastSimulationTick
                    ? ` (refreshed ${formatTimeShort(lastSimulationTick)})`
                    : ''
                }`
              : 'Updated manually by canteen staff (sample data)'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isAdminOrStaff && (
            <button
              type="button"
              onClick={() => toggleSimulation()}
              className={`inline-flex items-center gap-2 px-3.5 py-2 min-h-[42px] rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap ${
                settings.simulationEnabled
                  ? 'bg-[#F26A2A]/12 border-[#F26A2A] text-[#8F3406]'
                  : 'bg-white border-neutral-300 text-neutral-700 hover:border-neutral-400'
              }`}
            >
              <Radio className="w-3.5 h-3.5 shrink-0" />
              {settings.simulationEnabled ? 'Simulation ON' : 'Simulate Live Data'}
            </button>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[42px] rounded-xl bg-[#C00000] text-white text-xs font-semibold hover:bg-[#A31621] transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4 shrink-0" />
              Add Canteen
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="rounded-2xl bg-white border border-neutral-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search canteen name or block (e.g. Main Canteen, Ground floor)..."
            className="w-full rounded-xl border border-neutral-200 bg-[#F9F9F9] pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-[#C00000] focus:ring-2 focus:ring-[#C00000]/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F1F1F1]">
            {(['All', 'Low', 'Medium', 'High'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevelFilter(lvl)}
                className={`px-3 py-1.5 min-h-[34px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  levelFilter === lvl
                    ? 'bg-white text-[#C00000] shadow-xs'
                    : 'text-neutral-600 hover:text-[#333333]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setOnlyFavourites((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap ${
              onlyFavourites
                ? 'bg-[#C00000]/10 border-[#C00000] text-[#C00000]'
                : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${onlyFavourites ? 'fill-[#C00000]' : ''}`}
            />
            Favourites
          </button>
        </div>
      </div>

      {/* Canteen Cards Grid */}
      {filteredCanteens.length === 0 ? (
        <div className="rounded-2xl bg-white border border-dashed border-neutral-300 p-10 text-center">
          <p className="font-display text-base font-bold text-[#333333]">
            No canteens match your current filters
          </p>
          <p className="text-sm text-neutral-500 mt-1">
            Try clearing your search query or switching back to All queue levels.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setLevelFilter('All');
              setOnlyFavourites(false);
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-[#C00000] text-white text-xs font-semibold hover:bg-[#A31621] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredCanteens.map((canteen) => {
            const waitMin = calculateWaitMinutes(
              canteen.peopleInQueue,
              canteen.avgServiceTimeMin,
              canteen.openCounters
            );
            const level = getQueueLevel(waitMin, settings.thresholds);
            const best = getBestTimeToVisit(
              queueHistory,
              canteen.id,
              settings.thresholds
            );
            const isFav = favourites.includes(canteen.id);

            return (
              <div
                key={canteen.id}
                onClick={() => openCanteenDetail(canteen.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openCanteenDetail(canteen.id);
                  }
                }}
                className="group rounded-2xl bg-white border border-neutral-200 p-5 hover:border-[#C00000]/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C00000]"
              >
                <div>
                  {/* Card Top */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-display text-lg font-bold text-[#333333] group-hover:text-[#C00000] transition-colors truncate">
                        {canteen.name}
                      </h2>
                      <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                        <span className="truncate">{canteen.location}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavourite(canteen.id);
                      }}
                      className="min-h-[40px] min-w-[40px] -mt-1 -mr-1 flex items-center justify-center rounded-xl hover:bg-neutral-100 transition-colors shrink-0"
                      aria-label={
                        isFav
                          ? `Remove ${canteen.name} from favourites`
                          : `Add ${canteen.name} to favourites`
                      }
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          isFav
                            ? 'fill-[#C00000] text-[#C00000]'
                            : 'text-neutral-400 hover:text-[#C00000]'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Hours & Status */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-neutral-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      {canteen.openingHours}
                    </span>
                    <QueueBadge level={level} isOpen={canteen.isOpen} size="sm" />
                  </div>

                  {/* Wait Metric */}
                  <div className="mt-5 pt-4 border-t border-neutral-100 flex items-end justify-between gap-3">
                    <div>
                      <span className="block text-[11px] font-medium text-neutral-500">
                        Estimated wait right now
                      </span>
                      <span className="font-display text-3xl font-extrabold tabular-nums text-[#333333]">
                        {canteen.isOpen ? `${waitMin} min` : 'Closed'}
                      </span>
                    </div>

                    <div className="text-right text-xs text-neutral-500 tabular-nums">
                      <span className="inline-flex items-center gap-1 font-medium text-[#333333]">
                        <Users className="w-3.5 h-3.5 text-neutral-400" />
                        {canteen.peopleInQueue} in queue
                      </span>
                      <span className="block mt-0.5">
                        {canteen.openCounters} counters open
                      </span>
                    </div>
                  </div>

                  {/* Best Time Hint */}
                  <div className="mt-4 rounded-xl bg-[#F9F9F9] px-3.5 py-2.5 text-xs text-neutral-600 flex items-center justify-between gap-2">
                    <span>
                      Best time to visit:{' '}
                      <strong className="text-[#333333]">{best.hourLabel}</strong>
                    </span>
                    <span className="font-mono tabular-nums text-[#237A4B] font-semibold">
                      ~{best.avgWait} min avg
                    </span>
                  </div>

                  {canteen.lastNote && (
                    <p className="mt-2.5 text-xs text-neutral-500 truncate">
                      Note: {canteen.lastNote}
                    </p>
                  )}
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2 text-xs">
                  <span className="text-neutral-400 tabular-nums">
                    Updated {formatTimeShort(canteen.lastUpdated)}
                    {canteen.isSimulatedData ? ' · Simulated' : ''}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {isAdmin && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => openEditModal(canteen, e)}
                          className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-[#333333] transition-colors"
                          aria-label={`Edit ${canteen.name}`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCanteenToDelete(canteen);
                          }}
                          className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg text-neutral-500 hover:bg-[#C0392B]/10 hover:text-[#C0392B] transition-colors"
                          aria-label={`Delete ${canteen.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <span className="font-semibold text-[#C00000] group-hover:underline">
                      Details →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Canteen Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-[#333333]">
                {editingCanteen ? 'Edit Canteen' : 'Add New Canteen'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-3 rounded-xl bg-[#C0392B]/10 border border-[#C0392B]/30 px-3.5 py-2 text-xs font-medium text-[#C0392B]">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveCanteen} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Canteen Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. North Block Cafe"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm focus:outline-none focus:border-[#C00000]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  required
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="e.g. 2nd Floor · Innovation Wing"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm focus:outline-none focus:border-[#C00000]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Opening Hours
                </label>
                <input
                  type="text"
                  required
                  value={formHours}
                  onChange={(e) => setFormHours(e.target.value)}
                  placeholder="8:30 AM – 6:00 PM"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm focus:outline-none focus:border-[#C00000]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Open Counters
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formCounters}
                    onChange={(e) => setFormCounters(Number(e.target.value))}
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm tabular-nums focus:outline-none focus:border-[#C00000]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Avg Service (min)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min={0.5}
                    required
                    value={formServiceTime}
                    onChange={(e) => setFormServiceTime(Number(e.target.value))}
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm tabular-nums focus:outline-none focus:border-[#C00000]"
                  />
                </div>
              </div>

              {editingCanteen && (
                <label className="flex items-center gap-2.5 pt-1 text-sm font-medium text-[#333333] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsOpen}
                    onChange={(e) => setFormIsOpen(e.target.checked)}
                    className="w-4 h-4 accent-[#C00000]"
                  />
                  Canteen is currently Open
                </label>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 min-h-[42px] rounded-xl bg-neutral-100 text-neutral-700 text-sm font-semibold hover:bg-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 min-h-[42px] rounded-xl bg-[#C00000] text-white text-sm font-semibold hover:bg-[#A31621]"
                >
                  {editingCanteen ? 'Save Changes' : 'Create Canteen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        open={Boolean(canteenToDelete)}
        title="Delete Canteen?"
        message={`Are you sure you want to delete "${canteenToDelete?.name}"? Its menu items and active alerts will also be removed.`}
        confirmLabel="Delete Canteen"
        onConfirm={handleConfirmDelete}
        onCancel={() => setCanteenToDelete(null)}
      />
    </div>
  );
};
