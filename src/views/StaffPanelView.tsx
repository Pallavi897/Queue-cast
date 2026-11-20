import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Edit3,
  Minus,
  Plus,
  Radio,
  Trash2,
  Utensils,
} from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';
import { QueueBadge } from '../components/QueueBadge';
import { useQueueCast } from '../context/QueueCastContext';
import { MenuItem } from '../types/queuecast';
import {
  calculateWaitMinutes,
  formatINR,
  formatTimeShort,
  getQueueLevel,
} from '../utils/calculations';

const QUICK_NOTES = [
  'Samosas finished',
  'Veg Thali fresh batch ready',
  'Extra counter opened',
  'Tea & coffee counter clear',
];

export const StaffPanelView: React.FC = () => {
  const {
    canteens,
    menuItems,
    settings,
    updateQueue,
    addMenuItem,
    editMenuItem,
    deleteMenuItem,
    toggleSimulation,
    showToast,
  } = useQueueCast();

  const [subTab, setSubTab] = useState<'queue' | 'menu'>('queue');
  const [selectedCanteenId, setSelectedCanteenId] = useState<string>(
    canteens[0]?.id || ''
  );

  const selectedCanteen =
    canteens.find((c) => c.id === selectedCanteenId) || canteens[0];

  // Queue form state
  const [people, setPeople] = useState<number>(
    selectedCanteen?.peopleInQueue ?? 0
  );
  const [serviceTime, setServiceTime] = useState<number>(
    selectedCanteen?.avgServiceTimeMin ?? settings.defaultServiceTimeMin
  );
  const [counters, setCounters] = useState<number>(
    selectedCanteen?.openCounters ?? 1
  );
  const [isOpen, setIsOpen] = useState<boolean>(selectedCanteen?.isOpen ?? true);
  const [note, setNote] = useState<string>(selectedCanteen?.lastNote ?? '');
  const [validationError, setValidationError] = useState<string>('');
  const [savedNotice, setSavedNotice] = useState<string>('');

  // Sync local form when selected canteen changes
  useEffect(() => {
    if (selectedCanteen) {
      setPeople(selectedCanteen.peopleInQueue);
      setServiceTime(selectedCanteen.avgServiceTimeMin);
      setCounters(selectedCanteen.openCounters);
      setIsOpen(selectedCanteen.isOpen);
      setNote(selectedCanteen.lastNote || '');
      setValidationError('');
      setSavedNotice('');
    }
  }, [selectedCanteenId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Menu form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<
    'Meals' | 'Snacks' | 'Beverages'
  >('Snacks');
  const [newItemPrice, setNewItemPrice] = useState<string>('30');
  const [newItemAvailable, setNewItemAvailable] = useState(true);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  if (!selectedCanteen) {
    return (
      <div className="rounded-2xl bg-white border border-neutral-200 p-8 text-center">
        <p className="font-display text-lg font-bold text-[#333333]">
          No canteens available
        </p>
        <p className="text-sm text-neutral-500 mt-1">
          Ask a College Admin to add a canteen first.
        </p>
      </div>
    );
  }

  const previewWait = calculateWaitMinutes(people, serviceTime, counters);
  const previewLevel = getQueueLevel(previewWait, settings.thresholds);

  const handleQueueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setSavedNotice('');

    if (people < 0 || !Number.isFinite(people)) {
      setValidationError('People in queue cannot be negative.');
      return;
    }
    if (serviceTime <= 0 || !Number.isFinite(serviceTime)) {
      setValidationError('Average service time must be greater than 0 minutes.');
      return;
    }
    if (counters < 1 || !Number.isFinite(counters)) {
      setValidationError('Open counters must be at least 1.');
      return;
    }

    const res = updateQueue(
      selectedCanteen.id,
      people,
      serviceTime,
      counters,
      isOpen,
      note
    );

    if (!res.ok) {
      setValidationError(res.message);
      showToast(res.message, 'error');
      return;
    }

    setSavedNotice(
      `Saved at ${new Date().toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
      })} — ${res.message}`
    );
    showToast(res.message, 'success');
  };

  const canteenMenuItems = menuItems.filter(
    (m) => m.canteenId === selectedCanteen.id
  );

  const handleMenuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = Number(newItemPrice);
    if (editingItem) {
      const res = editMenuItem(editingItem.id, {
        name: newItemName,
        category: newItemCategory,
        price: parsedPrice,
        available: newItemAvailable,
      });
      if (!res.ok) {
        showToast(res.message, 'error');
        return;
      }
      showToast(res.message, 'success');
      setEditingItem(null);
      setNewItemName('');
      setNewItemPrice('30');
      setNewItemAvailable(true);
    } else {
      const res = addMenuItem({
        canteenId: selectedCanteen.id,
        name: newItemName,
        category: newItemCategory,
        price: parsedPrice,
        available: newItemAvailable,
      });
      if (!res.ok) {
        showToast(res.message, 'error');
        return;
      }
      showToast(res.message, 'success');
      setNewItemName('');
      setNewItemPrice('30');
      setNewItemAvailable(true);
    }
  };

  const startEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setNewItemName(item.name);
    setNewItemCategory(item.category);
    setNewItemPrice(String(item.price));
    setNewItemAvailable(item.available);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#333333]">
            Canteen Staff Panel
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Fast counter updates & menu availability · Changes reflect instantly for students
          </p>
        </div>

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
          {settings.simulationEnabled
            ? 'Simulation ON (No sensors)'
            : 'Simulate Live Data'}
        </button>
      </div>

      {/* Canteen Picker + Sub-Tab Switch */}
      <div className="rounded-2xl bg-white border border-neutral-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <label
            htmlFor="staff-canteen-select"
            className="text-xs font-semibold text-neutral-600 whitespace-nowrap"
          >
            Active Canteen:
          </label>
          <select
            id="staff-canteen-select"
            value={selectedCanteen.id}
            onChange={(e) => setSelectedCanteenId(e.target.value)}
            className="flex-1 max-w-xs rounded-xl border border-neutral-300 bg-[#F9F9F9] px-3.5 py-2 text-sm font-semibold text-[#333333] focus:outline-none focus:border-[#C00000]"
          >
            {canteens.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.isOpen ? 'Open' : 'Closed'})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F1F1F1] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSubTab('queue')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              subTab === 'queue'
                ? 'bg-white text-[#C00000] shadow-xs'
                : 'text-neutral-600 hover:text-[#333333]'
            }`}
          >
            Queue Updater
          </button>
          <button
            type="button"
            onClick={() => setSubTab('menu')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              subTab === 'menu'
                ? 'bg-white text-[#C00000] shadow-xs'
                : 'text-neutral-600 hover:text-[#333333]'
            }`}
          >
            Menu Management ({canteenMenuItems.length})
          </button>
        </div>
      </div>

      {subTab === 'queue' ? (
        <form onSubmit={handleQueueSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Controls Column */}
          <div className="lg:col-span-7 rounded-2xl bg-white border border-neutral-200 p-6 space-y-6">
            {validationError && (
              <div
                role="alert"
                className="rounded-xl bg-[#C0392B]/10 border border-[#C0392B]/30 px-4 py-3 text-sm font-medium text-[#C0392B]"
              >
                {validationError}
              </div>
            )}

            {savedNotice && (
              <div className="rounded-xl bg-[#4CAF7A]/12 border border-[#4CAF7A]/35 px-4 py-3 text-sm font-medium text-[#1F5E3B] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{savedNotice}</span>
              </div>
            )}

            {/* Open / Closed Toggle */}
            <div className="flex items-center justify-between gap-4 pb-5 border-b border-neutral-100">
              <div>
                <h2 className="font-display text-base font-bold text-[#333333]">
                  Canteen Status
                </h2>
                <p className="text-xs text-neutral-500">
                  Toggle Closed when counters stop serving for the day
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                className={`min-h-[44px] px-5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${
                  isOpen
                    ? 'bg-[#4CAF7A] text-white hover:bg-[#3e9767]'
                    : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                }`}
              >
                {isOpen ? 'Open for Service' : 'Marked Closed'}
              </button>
            </div>

            {/* People in Queue Stepper (Large Mobile Buttons) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-[#333333]">
                  People in Queue
                </label>
                <span className="text-xs text-neutral-500">
                  Current saved: {selectedCanteen.peopleInQueue}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setPeople((p) => Math.max(0, p - 5))}
                  className="min-h-[52px] px-3.5 rounded-xl border border-neutral-300 bg-[#F9F9F9] text-sm font-bold text-[#333333] hover:bg-neutral-200 active:scale-95 transition-all"
                  aria-label="Decrease queue by 5"
                >
                  −5
                </button>
                <button
                  type="button"
                  onClick={() => setPeople((p) => Math.max(0, p - 1))}
                  className="min-h-[52px] min-w-[56px] flex items-center justify-center rounded-xl bg-[#F1F1F1] text-[#333333] hover:bg-neutral-200 active:scale-95 transition-all"
                  aria-label="Decrease queue by 1"
                >
                  <Minus className="w-6 h-6" />
                </button>

                <input
                  type="number"
                  min={0}
                  value={people}
                  onChange={(e) => setPeople(Math.max(0, Number(e.target.value)))}
                  className="flex-1 min-w-0 min-h-[52px] rounded-xl border border-neutral-300 text-center font-display text-2xl font-extrabold tabular-nums text-[#333333] focus:outline-none focus:border-[#C00000]"
                />

                <button
                  type="button"
                  onClick={() => setPeople((p) => p + 1)}
                  className="min-h-[52px] min-w-[56px] flex items-center justify-center rounded-xl bg-[#C00000] text-white hover:bg-[#A31621] active:scale-95 transition-all"
                  aria-label="Increase queue by 1"
                >
                  <Plus className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() => setPeople((p) => p + 5)}
                  className="min-h-[52px] px-3.5 rounded-xl border border-[#C00000]/30 bg-[#C00000]/8 text-sm font-bold text-[#C00000] hover:bg-[#C00000]/15 active:scale-95 transition-all"
                  aria-label="Increase queue by 5"
                >
                  +5
                </button>
              </div>
            </div>

            {/* Service Time & Open Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Avg Service Time / Person (min)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min={0.5}
                  value={serviceTime}
                  onChange={(e) => setServiceTime(Number(e.target.value))}
                  className="w-full min-h-[46px] rounded-xl border border-neutral-300 px-3.5 py-2 text-base font-mono tabular-nums focus:outline-none focus:border-[#C00000]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Open Counters (min 1)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCounters((c) => Math.max(1, c - 1))}
                    className="min-h-[46px] min-w-[46px] flex items-center justify-center rounded-xl bg-[#F1F1F1] hover:bg-neutral-200"
                    aria-label="Decrease open counters"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={counters}
                    onChange={(e) =>
                      setCounters(Math.max(1, Math.floor(Number(e.target.value))))
                    }
                    className="flex-1 min-w-0 min-h-[46px] rounded-xl border border-neutral-300 text-center font-mono text-base font-bold tabular-nums focus:outline-none focus:border-[#C00000]"
                  />
                  <button
                    type="button"
                    onClick={() => setCounters((c) => c + 1)}
                    className="min-h-[46px] min-w-[46px] flex items-center justify-center rounded-xl bg-[#F1F1F1] hover:bg-neutral-200"
                    aria-label="Increase open counters"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Note */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                Quick Staff Note (visible to students)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Samosas finished, Counter 3 opened"
                className="w-full min-h-[44px] rounded-xl border border-neutral-300 px-3.5 py-2 text-sm focus:outline-none focus:border-[#C00000]"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {QUICK_NOTES.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setNote(preset)}
                    className="px-2.5 py-1 rounded-lg bg-[#F1F1F1] hover:bg-neutral-200 text-xs text-neutral-700 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[52px] rounded-xl bg-[#C00000] text-white font-display text-base font-bold hover:bg-[#A31621] transition-colors shadow-sm"
            >
              Update Queue & Save Record
            </button>
          </div>

          {/* Live Calculation Preview */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-2xl bg-white border border-neutral-200 p-6">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-neutral-500">
                  Live Calculation Preview
                </span>
                <QueueBadge level={previewLevel} isOpen={isOpen} />
              </div>

              <div className="mt-4">
                <span className="font-display text-5xl font-extrabold tabular-nums text-[#333333]">
                  {isOpen ? `${previewWait} min` : 'Closed'}
                </span>
                <p className="mt-2 text-xs font-mono tabular-nums text-neutral-500">
                  ({people} people × {serviceTime} min) ÷ {Math.max(1, counters)}{' '}
                  counters = {previewWait} min
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100 text-xs text-neutral-500 space-y-1.5">
                <p>
                  Saving creates a timestamped entry in Queue History for the 9 AM – 4 PM Peak Hours chart and Admin Reports.
                </p>
                <p>
                  Last saved update: {formatTimeShort(selectedCanteen.lastUpdated)}
                </p>
              </div>
            </div>
          </div>
        </form>
      ) : (
        /* Menu Management Sub-Tab */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Add / Edit Form */}
          <form
            onSubmit={handleMenuSubmit}
            className="lg:col-span-4 rounded-2xl bg-white border border-neutral-200 p-6 space-y-4 self-start"
          >
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-[#C00000]" />
              <h2 className="font-display text-base font-bold text-[#333333]">
                {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Item Name
              </label>
              <input
                type="text"
                required
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="e.g. Masala Dosa"
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#C00000]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Category
                </label>
                <select
                  value={newItemCategory}
                  onChange={(e) =>
                    setNewItemCategory(
                      e.target.value as 'Meals' | 'Snacks' | 'Beverages'
                    )
                  }
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#C00000]"
                >
                  <option value="Meals">Meals</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Beverages">Beverages</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm font-mono tabular-nums focus:outline-none focus:border-[#C00000]"
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 text-sm text-[#333333] cursor-pointer">
              <input
                type="checkbox"
                checked={newItemAvailable}
                onChange={(e) => setNewItemAvailable(e.target.checked)}
                className="w-4 h-4 accent-[#C00000]"
              />
              Available right now
            </label>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 min-h-[44px] rounded-xl bg-[#C00000] text-white text-sm font-semibold hover:bg-[#A31621] transition-colors"
              >
                {editingItem ? 'Save Item' : 'Add to Menu'}
              </button>
              {editingItem && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setNewItemName('');
                    setNewItemPrice('30');
                    setNewItemAvailable(true);
                  }}
                  className="px-4 min-h-[44px] rounded-xl bg-neutral-100 text-neutral-700 text-sm font-semibold hover:bg-neutral-200"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Menu Table */}
          <div className="lg:col-span-8 rounded-2xl bg-white border border-neutral-200 p-6">
            <h2 className="font-display text-base font-bold text-[#333333] mb-4">
              {selectedCanteen.name} Menu Items
            </h2>

            {canteenMenuItems.length === 0 ? (
              <div className="rounded-xl bg-[#F9F9F9] border border-dashed border-neutral-200 p-8 text-center text-sm text-neutral-500">
                No items yet for {selectedCanteen.name}. Add your first dish using the form.
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {canteenMenuItems.map((item) => (
                  <div
                    key={item.id}
                    className="py-3.5 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#333333]">
                        {item.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {item.category} ·{' '}
                        <span className="font-mono tabular-nums font-semibold text-[#333333]">
                          {formatINR(item.price)}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const res = editMenuItem(item.id, {
                            available: !item.available,
                          });
                          if (res.ok) {
                            showToast(
                              `${item.name} marked ${
                                !item.available ? 'Available' : 'Sold Out'
                              }`,
                              'info'
                            );
                          }
                        }}
                        className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                          item.available
                            ? 'bg-[#4CAF7A]/15 text-[#237A4B] hover:bg-[#4CAF7A]/25'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {item.available ? 'Available' : 'Sold Out'}
                      </button>

                      <button
                        type="button"
                        onClick={() => startEditItem(item)}
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-[#333333]"
                        aria-label={`Edit ${item.name}`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setItemToDelete(item)}
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-neutral-500 hover:bg-[#C0392B]/10 hover:text-[#C0392B]"
                        aria-label={`Delete ${item.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(itemToDelete)}
        title="Delete Menu Item?"
        message={`Remove "${itemToDelete?.name}" from ${selectedCanteen.name}'s menu?`}
        confirmLabel="Remove Item"
        onConfirm={() => {
          if (itemToDelete) {
            const res = deleteMenuItem(itemToDelete.id);
            if (res.ok) showToast(res.message, 'success');
            else showToast(res.message, 'error');
          }
          setItemToDelete(null);
        }}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
