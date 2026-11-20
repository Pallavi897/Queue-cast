import React, { useState } from 'react';
import {
  BarChart3,
  Check,
  Clock,
  Info,
  ShieldCheck,
  Utensils,
} from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';
import { useQueueCast } from '../context/QueueCastContext';
import { formatDateTimeShort, formatINR } from '../utils/calculations';

export const SubscriptionView: React.FC = () => {
  const {
    collegeProfile,
    subscription,
    upgradeSubscriptionDemo,
    downgradeSubscriptionDemo,
    showToast,
  } = useQueueCast();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const isCollegeProActive =
    subscription.plan === 'college_pro' && subscription.status === 'active';

  const handleConfirmUpgrade = () => {
    const res = upgradeSubscriptionDemo();
    if (res.ok) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
    setConfirmOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#333333]">
          Subscription & Why QueueCast
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Campus pricing model and institutional benefits for {collegeProfile.collegeName}
        </p>
      </div>

      {/* Demo Billing Disclaimer */}
      <div className="rounded-2xl bg-[#F26A2A]/10 border border-[#F26A2A]/30 px-4 py-3.5 flex items-start gap-3 text-sm text-[#8F3406]">
        <Info className="w-4 h-4 text-[#F26A2A] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Demo Billing Only:</span> No real payment gateway or credit card processing is connected. Upgrading simulates a college subscription confirmation and saves the plan status locally.
        </div>
      </div>

      {/* Current Plan Status Strip */}
      <div className="rounded-2xl bg-white border border-neutral-200 p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-neutral-500">
            Current Campus Plan Status
          </span>
          <p className="font-display text-lg font-bold text-[#333333] mt-0.5">
            {subscription.plan === 'college_pro'
              ? `College Plan (${formatINR(5000)}/month) — ${
                  subscription.status === 'active' ? 'Active (Demo)' : 'Campus Trial (Demo)'
                }`
              : 'Free Student Tier (Demo)'}
          </p>
          <p className="text-xs text-neutral-500 mt-0.5">
            Updated {formatDateTimeShort(subscription.activatedAt)}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {!isCollegeProActive ? (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="px-5 py-2.5 min-h-[44px] rounded-xl bg-[#C00000] text-white text-sm font-semibold hover:bg-[#A31621] transition-colors whitespace-nowrap"
            >
              Upgrade to College Plan (Demo)
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                const res = downgradeSubscriptionDemo();
                if (res.ok) showToast(res.message, 'info');
              }}
              className="px-4 py-2.5 min-h-[44px] rounded-xl bg-neutral-100 text-neutral-700 text-xs font-semibold hover:bg-neutral-200 transition-colors whitespace-nowrap"
            >
              Switch to Free Tier (Demo)
            </button>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl bg-white border border-neutral-200 p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral-500">
              For Students & Campus Visitors
            </p>
            <h2 className="font-display text-xl font-bold text-[#333333] mt-1">
              Free (Students)
            </h2>
            <p className="font-display text-3xl font-extrabold tabular-nums text-[#333333] mt-4">
              {formatINR(0)}
              <span className="text-sm font-normal text-neutral-500"> / month</span>
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Always free for every student on campus
            </p>

            <ul className="mt-5 space-y-2.5 text-sm text-neutral-700">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#4CAF7A] shrink-0" />
                Live queue levels (Low / Medium / High)
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#4CAF7A] shrink-0" />
                Real-time calculated wait times
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#4CAF7A] shrink-0" />
                Best time to visit recommendations
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#4CAF7A] shrink-0" />
                Daily canteen menu & ₹ pricing
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#4CAF7A] shrink-0" />
                In-app wait-drop alerts
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl bg-white border-2 border-[#C00000] p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-[#C00000]">
                For Colleges & Universities
              </p>
              <span className="text-xs font-bold text-[#C00000]">
                {isCollegeProActive ? 'Active Plan' : 'Recommended'}
              </span>
            </div>
            <h2 className="font-display text-xl font-bold text-[#333333] mt-1">
              College Plan
            </h2>
            <p className="font-display text-3xl font-extrabold tabular-nums text-[#333333] mt-4">
              {formatINR(5000)}
              <span className="text-sm font-normal text-neutral-500"> / month per college</span>
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Flat campus-wide license regardless of student count
            </p>

            <ul className="mt-5 space-y-2.5 text-sm text-neutral-700">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#4CAF7A] shrink-0" />
                Unlimited campus canteens & counters
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#4CAF7A] shrink-0" />
                Mobile-ready Canteen Staff Panel
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#4CAF7A] shrink-0" />
                Admin Dashboard & peak-hour charts
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#4CAF7A] shrink-0" />
                Daily/weekly analytics & CSV export
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#4CAF7A] shrink-0" />
                Menu management & campus onboarding support
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={isCollegeProActive}
            className={`mt-6 w-full min-h-[44px] rounded-xl text-sm font-semibold transition-colors ${
              isCollegeProActive
                ? 'bg-[#4CAF7A]/15 text-[#237A4B] cursor-default'
                : 'bg-[#C00000] text-white hover:bg-[#A31621]'
            }`}
          >
            {isCollegeProActive
              ? 'College Plan Active (Demo)'
              : `Upgrade to College Plan · ${formatINR(5000)}/mo`}
          </button>
        </div>
      </div>

      {/* Why QueueCast Value Section */}
      <div className="rounded-2xl bg-white border border-neutral-200 p-6">
        <h2 className="font-display text-lg font-bold text-[#333333]">
          Why QueueCast for Your Campus?
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Measurable operational impact without hardware installation or privacy concerns.
        </p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl bg-[#F9F9F9] border border-neutral-200 p-4">
            <Clock className="w-5 h-5 text-[#C00000] mb-2.5" />
            <h3 className="font-display font-bold text-sm text-[#333333]">
              Fewer Queues
            </h3>
            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
              Students see busy spots before walking over and spread evenly across open outlets.
            </p>
          </div>

          <div className="rounded-xl bg-[#F9F9F9] border border-neutral-200 p-4">
            <BarChart3 className="w-5 h-5 text-[#F26A2A] mb-2.5" />
            <h3 className="font-display font-bold text-sm text-[#333333]">
              Better Staff Planning
            </h3>
            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
              Peak-hour reports show exact windows (12 PM – 2 PM) when an extra billing counter pays off.
            </p>
          </div>

          <div className="rounded-xl bg-[#F9F9F9] border border-neutral-200 p-4">
            <Utensils className="w-5 h-5 text-[#4CAF7A] mb-2.5" />
            <h3 className="font-display font-bold text-sm text-[#333333]">
              Less Food Waste
            </h3>
            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
              Real-time menu availability updates guide demand toward freshly prepared batches.
            </p>
          </div>

          <div className="rounded-xl bg-[#F9F9F9] border border-neutral-200 p-4">
            <ShieldCheck className="w-5 h-5 text-[#A31621] mb-2.5" />
            <h3 className="font-display font-bold text-sm text-[#333333]">
              Zero Camera Tracking
            </h3>
            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
              Works purely on quick counter counts entered by staff — zero hardware cost, zero student surveillance.
            </p>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Confirm Demo Subscription Upgrade"
        message={`Activate the College Plan (${formatINR(
          5000
        )}/month) for ${collegeProfile.collegeName}? This is a prototype demonstration — no real payment will be charged.`}
        confirmLabel="Confirm Demo Upgrade"
        destructive={false}
        onConfirm={handleConfirmUpgrade}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};
