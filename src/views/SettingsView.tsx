import React, { useState } from 'react';
import {
  Building2,
  LogOut,
  RotateCcw,
  Save,
  ShieldCheck,
  Sliders,
  User,
} from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';
import { useQueueCast } from '../context/QueueCastContext';
import { formatINR } from '../utils/calculations';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    collegeProfile,
    settings,
    subscription,
    updateCollegeProfile,
    updateCurrentUserProfile,
    updateSettings,
    setActiveTab,
    resetAllSampleData,
    logout,
    showToast,
  } = useQueueCast();

  const isAdmin = currentUser?.role === 'admin';

  // User profile form
  const [userName, setUserName] = useState(currentUser?.name || '');
  const [userEmail, setUserEmail] = useState(currentUser?.email || '');
  const [userDept, setUserDept] = useState(currentUser?.department || '');

  // College profile form
  const [colName, setColName] = useState(collegeProfile.collegeName);
  const [colCity, setColCity] = useState(collegeProfile.city);
  const [colAdmin, setColAdmin] = useState(collegeProfile.adminName);
  const [colPhone, setColPhone] = useState(collegeProfile.phone);
  const [colEmail, setColEmail] = useState(collegeProfile.email);
  const [colStudents, setColStudents] = useState(collegeProfile.studentCount);

  // Queue rules & preferences
  const [lowMax, setLowMax] = useState(settings.thresholds.lowMaxMinutes);
  const [mediumMax, setMediumMax] = useState(
    settings.thresholds.mediumMaxMinutes
  );
  const [defaultServiceTime, setDefaultServiceTime] = useState(
    settings.defaultServiceTimeMin
  );
  const [inAppAlertsEnabled, setInAppAlertsEnabled] = useState(
    settings.inAppAlertsEnabled
  );

  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const res = updateCurrentUserProfile(userName, userEmail, userDept);
    showToast(res.message, res.ok ? 'success' : 'error');
  };

  const handleSaveCollege = (e: React.FormEvent) => {
    e.preventDefault();
    const res = updateCollegeProfile({
      ...collegeProfile,
      collegeName: colName,
      city: colCity,
      adminName: colAdmin,
      phone: colPhone,
      email: colEmail,
      studentCount: Number(colStudents),
    });
    showToast(res.message, res.ok ? 'success' : 'error');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const res = updateSettings({
      ...settings,
      thresholds: {
        lowMaxMinutes: Number(lowMax),
        mediumMaxMinutes: Number(mediumMax),
      },
      defaultServiceTimeMin: Number(defaultServiceTime),
      inAppAlertsEnabled,
    });
    showToast(res.message, res.ok ? 'success' : 'error');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#333333]">
            Settings & Profile
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Manage account details, college profile, queue thresholds, and notification preferences
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] rounded-xl bg-white border border-neutral-300 text-sm font-semibold text-[#C0392B] hover:bg-[#C0392B]/8 hover:border-[#C0392B] transition-colors whitespace-nowrap"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* User Profile */}
        <form
          onSubmit={handleSaveUser}
          className="rounded-2xl bg-white border border-neutral-200 p-6 space-y-4"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#C00000]" />
              <h2 className="font-display text-base font-bold text-[#333333]">
                Your Profile
              </h2>
            </div>
            <span className="text-xs font-semibold text-neutral-500 capitalize">
              Role: {currentUser?.role}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm focus:outline-none focus:border-[#C00000]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm focus:outline-none focus:border-[#C00000]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Department / Designation
            </label>
            <input
              type="text"
              value={userDept}
              onChange={(e) => setUserDept(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm focus:outline-none focus:border-[#C00000]"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] rounded-xl bg-[#C00000] text-white text-sm font-semibold hover:bg-[#A31621] transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Profile
          </button>
        </form>

        {/* Queue Level Thresholds & Preferences */}
        <form
          onSubmit={handleSaveSettings}
          className="rounded-2xl bg-white border border-neutral-200 p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#F26A2A]" />
            <h2 className="font-display text-base font-bold text-[#333333]">
              Queue Thresholds & Preferences
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Low Queue: Under (min)
              </label>
              <input
                type="number"
                min={2}
                max={30}
                required
                value={lowMax}
                onChange={(e) => setLowMax(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm font-mono tabular-nums focus:outline-none focus:border-[#C00000]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Medium Queue: Up to (min)
              </label>
              <input
                type="number"
                min={3}
                max={60}
                required
                value={mediumMax}
                onChange={(e) => setMediumMax(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm font-mono tabular-nums focus:outline-none focus:border-[#C00000]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Default Avg Service Time per Person (min)
            </label>
            <input
              type="number"
              step="0.5"
              min={0.5}
              required
              value={defaultServiceTime}
              onChange={(e) => setDefaultServiceTime(Number(e.target.value))}
              className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm font-mono tabular-nums focus:outline-none focus:border-[#C00000]"
            />
          </div>

          <label className="flex items-center gap-2.5 text-sm text-[#333333] cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={inAppAlertsEnabled}
              onChange={(e) => setInAppAlertsEnabled(e.target.checked)}
              className="w-4 h-4 accent-[#C00000]"
            />
            Enable in-app wait-drop notification banners
          </label>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] rounded-xl bg-[#C00000] text-white text-sm font-semibold hover:bg-[#A31621] transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Thresholds
          </button>
        </form>

        {/* College Profile */}
        <form
          onSubmit={handleSaveCollege}
          className="rounded-2xl bg-white border border-neutral-200 p-6 space-y-4 lg:col-span-2"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#C00000]" />
              <h2 className="font-display text-base font-bold text-[#333333]">
                Registered College Profile
              </h2>
            </div>
            {!isAdmin && (
              <span className="text-xs text-neutral-500">
                View-only (Admin can edit)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                College Name
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={colName}
                onChange={(e) => setColName(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm disabled:bg-neutral-50 disabled:text-neutral-600 focus:outline-none focus:border-[#C00000]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                City
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={colCity}
                onChange={(e) => setColCity(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm disabled:bg-neutral-50 disabled:text-neutral-600 focus:outline-none focus:border-[#C00000]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Admin Contact
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={colAdmin}
                onChange={(e) => setColAdmin(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm disabled:bg-neutral-50 disabled:text-neutral-600 focus:outline-none focus:border-[#C00000]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={colPhone}
                onChange={(e) => setColPhone(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm disabled:bg-neutral-50 disabled:text-neutral-600 focus:outline-none focus:border-[#C00000]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Students Count
              </label>
              <input
                type="number"
                min={1}
                disabled={!isAdmin}
                value={colStudents}
                onChange={(e) => setColStudents(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm font-mono tabular-nums disabled:bg-neutral-50 disabled:text-neutral-600 focus:outline-none focus:border-[#C00000]"
              />
            </div>
          </div>

          {isAdmin && (
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] rounded-xl bg-[#C00000] text-white text-sm font-semibold hover:bg-[#A31621] transition-colors"
            >
              <Save className="w-4 h-4" />
              Save College Profile
            </button>
          )}
        </form>
      </div>

      {/* Privacy & Subscription & Demo Reset */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl bg-white border border-neutral-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-[#4CAF7A]" />
            <h2 className="font-display text-base font-bold text-[#333333]">
              Privacy & Data Notice
            </h2>
          </div>
          <p className="text-sm text-neutral-600 leading-relaxed">
            QueueCast only stores aggregate queue counts, service times, menu items, and demo preferences in your browser&apos;s LocalStorage. No cameras, hardware sensors, or personal location tracking are used.
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-neutral-200 p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-[#333333]">
              Subscription & Demo Data
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Current Plan:{' '}
              <strong>
                {subscription.plan === 'college_pro'
                  ? `College Plan (${formatINR(5000)}/mo · Demo)`
                  : 'Free Student Tier'}
              </strong>
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('subscription')}
                className="px-4 py-2 min-h-[40px] rounded-xl bg-[#F1F1F1] text-xs font-semibold text-[#333333] hover:bg-neutral-200 transition-colors"
              >
                Manage Plan (Demo)
              </button>
            )}
            <button
              type="button"
              onClick={() => setResetConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:border-[#C0392B] hover:text-[#C0392B] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restore Sample Data
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={resetConfirmOpen}
        title="Restore Sample Campus Data?"
        message="This will reset all canteens, queue history, menu items, alerts, and settings back to the preloaded Sreenidhi Institute sample dataset."
        confirmLabel="Restore Sample Data"
        onConfirm={() => {
          const res = resetAllSampleData();
          showToast(res.message, res.ok ? 'success' : 'error');
          setResetConfirmOpen(false);
        }}
        onCancel={() => setResetConfirmOpen(false)}
      />
    </div>
  );
};
