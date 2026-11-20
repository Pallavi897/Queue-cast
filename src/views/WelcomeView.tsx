import React, { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Clock,
  ShieldCheck,
  TrendingDown,
  Users,
  Utensils,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { QueueBadge } from '../components/QueueBadge';
import { useQueueCast } from '../context/QueueCastContext';
import {
  calculateWaitMinutes,
  formatIndianNumber,
  formatINR,
  getBestTimeToVisit,
  getQueueLevel,
} from '../utils/calculations';
import { AuthModal, AuthModalMode } from './AuthModal';

export const WelcomeView: React.FC = () => {
  const {
    canteens,
    queueHistory,
    settings,
    collegeProfile,
    loginAsDemoRole,
  } = useQueueCast();

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthModalMode>('login');
  const [imageError, setImageError] = useState(false);

  const openModal = (mode: AuthModalMode) => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F1F1F1] text-[#333333] flex flex-col">
      {/* Top Bar Contract: [Brand] — [4 nav links] — [1 primary CTA] */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <a href="#top" className="shrink-0">
            <Logo size="md" />
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
            <a
              href="#live-preview"
              className="hover:text-[#C00000] transition-colors whitespace-nowrap shrink-0"
            >
              Live Queues
            </a>
            <a
              href="#how-it-works"
              className="hover:text-[#C00000] transition-colors whitespace-nowrap shrink-0"
            >
              How It Works
            </a>
            <a
              href="#why-queuecast"
              className="hover:text-[#C00000] transition-colors whitespace-nowrap shrink-0"
            >
              Why QueueCast
            </a>
            <a
              href="#pricing"
              className="hover:text-[#C00000] transition-colors whitespace-nowrap shrink-0"
            >
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => openModal('login')}
              className="px-4 py-2 min-h-[40px] rounded-xl bg-[#C00000] text-white text-sm font-semibold hover:bg-[#A31621] transition-colors whitespace-nowrap shrink-0"
            >
              Login
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left Copy */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-sm font-semibold text-[#C00000] mb-3">
                {collegeProfile.collegeName} · {collegeProfile.city}
              </p>

              <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-[#333333] leading-[1.12] [text-wrap:balance]">
                Know the Queue. Plan Your Meal.
              </h1>

              <p className="mt-4 text-lg font-semibold text-[#A31621]">
                Less Waiting, More Learning.
              </p>

              <p className="mt-4 text-base text-neutral-600 leading-relaxed max-w-xl">
                QueueCast helps students avoid canteen queues by showing live crowd levels and waiting times. Check real-time wait minutes, today&apos;s menu, and the quietest hour before leaving your classroom.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => loginAsDemoRole('student')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[48px] rounded-xl bg-[#C00000] text-white text-sm font-semibold hover:bg-[#A31621] transition-colors shadow-sm whitespace-nowrap"
                >
                  Continue as Student (Free)
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => openModal('college-register')}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 min-h-[48px] rounded-xl bg-white text-[#333333] border border-neutral-300 text-sm font-semibold hover:border-[#C00000] hover:text-[#C00000] transition-colors whitespace-nowrap"
                >
                  Get Started (College Admin)
                </button>

                <button
                  type="button"
                  onClick={() => openModal('login')}
                  className="inline-flex items-center justify-center px-4 py-3.5 min-h-[48px] rounded-xl text-sm font-semibold text-neutral-700 hover:bg-white transition-colors whitespace-nowrap"
                >
                  Staff / Role Login
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-neutral-200/80 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="block font-display text-xl font-bold tabular-nums text-[#333333]">
                    {formatIndianNumber(collegeProfile.studentCount)}+
                  </span>
                  <span className="text-xs text-neutral-500">Campus Students</span>
                </div>
                <div>
                  <span className="block font-display text-xl font-bold tabular-nums text-[#333333]">
                    {canteens.length}
                  </span>
                  <span className="text-xs text-neutral-500">Active Canteens</span>
                </div>
                <div>
                  <span className="block font-display text-xl font-bold text-[#333333]">
                    Zero Cameras
                  </span>
                  <span className="text-xs text-neutral-500">Privacy-First Updates</span>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="lg:col-span-6 flex">
              <div className="relative w-full rounded-3xl overflow-hidden bg-white shadow-md border border-neutral-200 min-h-[300px] lg:h-full">
                {!imageError ? (
                  <img
                    src="/src/assets/images/welcome_campus_canteen_1795183050365.jpg"
                    alt="Students checking live queue times at a bright college canteen"
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover min-h-[320px]"
                  />
                ) : (
                  <div className="w-full h-full min-h-[320px] bg-gradient-to-br from-[#C00000]/10 via-white to-[#F26A2A]/15 flex flex-col items-center justify-center p-8 text-center">
                    <Utensils className="w-12 h-12 text-[#C00000] mb-3" />
                    <p className="font-display font-bold text-lg text-[#333333]">
                      Live Campus Canteen Pulse
                    </p>
                    <p className="text-sm text-neutral-500 mt-1">
                      Real-time wait estimation powered by counter telemetry
                    </p>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 text-white">
                  <p className="text-xs font-medium text-white/85">
                    Sample Campus Preview · Simulated & Staff-Entered Data
                  </p>
                  <p className="font-display text-base font-bold mt-0.5">
                    Skip the 1 PM Lunch Bottleneck at {collegeProfile.collegeName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Sample Canteens Preview */}
        <section id="live-preview" className="bg-white border-y border-neutral-200 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#333333]">
                  Live Campus Canteen Snapshot
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Sample data entered by canteen staff or simulated — click any card to explore as a student.
                </p>
              </div>
              <button
                type="button"
                onClick={() => loginAsDemoRole('student')}
                className="text-sm font-semibold text-[#C00000] hover:underline whitespace-nowrap"
              >
                Open Full Student Directory →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {canteens.map((canteen) => {
                const wait = calculateWaitMinutes(
                  canteen.peopleInQueue,
                  canteen.avgServiceTimeMin,
                  canteen.openCounters
                );
                const level = getQueueLevel(wait, settings.thresholds);
                const best = getBestTimeToVisit(
                  queueHistory,
                  canteen.id,
                  settings.thresholds
                );

                return (
                  <button
                    key={canteen.id}
                    type="button"
                    onClick={() => loginAsDemoRole('student')}
                    className="text-left rounded-2xl bg-[#F9F9F9] border border-neutral-200 p-5 hover:border-[#C00000]/50 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-display text-base font-bold text-[#333333] truncate">
                          {canteen.name}
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5 truncate">
                          {canteen.location}
                        </p>
                      </div>
                      <QueueBadge level={level} isOpen={canteen.isOpen} size="sm" />
                    </div>

                    <div className="mt-4 flex items-baseline justify-between">
                      <div>
                        <span className="font-display text-3xl font-extrabold tabular-nums text-[#333333]">
                          {canteen.isOpen ? `${wait} min` : 'Closed'}
                        </span>
                        <span className="block text-xs text-neutral-500 mt-0.5 tabular-nums">
                          {canteen.peopleInQueue} in queue · {canteen.openCounters} counters
                        </span>
                      </div>
                      <div className="text-right text-xs text-neutral-500">
                        <span className="block font-medium text-[#333333]">
                          Best: {best.hourLabel}
                        </span>
                        <span>~{best.avgWait} min avg</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* How Wait Time Works */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl mb-8">
            <h2 className="font-display text-2xl font-bold text-[#333333]">
              Transparent Wait-Time Calculation
            </h2>
            <p className="text-sm text-neutral-600 mt-1.5">
              No guesswork or hardware sensors. Canteen staff tap + or − at the counter and QueueCast computes live wait times instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-2xl bg-white p-6 border border-neutral-200">
              <div className="w-10 h-10 rounded-xl bg-[#C00000]/10 text-[#C00000] flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-base text-[#333333]">
                1. Staff Update Counter Count
              </h3>
              <p className="text-sm text-neutral-600 mt-1.5 leading-relaxed">
                Canteen staff update people in queue, active counters, and dish availability in seconds from any phone.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 border border-neutral-200">
              <div className="w-10 h-10 rounded-xl bg-[#F26A2A]/12 text-[#F26A2A] flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-base text-[#333333]">
                2. Live Formula Calculation
              </h3>
              <p className="text-sm text-neutral-600 mt-1.5 leading-relaxed">
                Wait (min) = (People × Avg Service Time) ÷ Open Counters. Updates student cards, charts, and alerts immediately.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 border border-neutral-200">
              <div className="w-10 h-10 rounded-xl bg-[#4CAF7A]/15 text-[#237A4B] flex items-center justify-center mb-4">
                <TrendingDown className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-base text-[#333333]">
                3. Students Beat the Rush
              </h3>
              <p className="text-sm text-neutral-600 mt-1.5 leading-relaxed">
                Students pick less crowded canteens, view today&apos;s menu, and set in-app alerts when wait time drops.
              </p>
            </div>
          </div>
        </section>

        {/* Why QueueCast & Pricing */}
        <section id="why-queuecast" className="bg-white border-t border-neutral-200 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-6">
                <h2 className="font-display text-2xl font-bold text-[#333333]">
                  Why Colleges Adopt QueueCast
                </h2>
                <p className="text-sm text-neutral-600 mt-1.5">
                  Built for Indian college campuses to streamline peak lunch breaks without expensive cameras or turnstiles.
                </p>

                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#C00000]/10 text-[#C00000] flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-[#333333]">
                        Fewer Queues, On-Time Lectures
                      </h3>
                      <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                        Students distribute naturally across Main Canteen and Juice Corner instead of crowding one counter.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#F26A2A]/12 text-[#F26A2A] flex items-center justify-center shrink-0">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-[#333333]">
                        Smarter Staff & Counter Scheduling
                      </h3>
                      <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                        Historical peak-hour analytics show admins exactly when to open an extra billing counter.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#4CAF7A]/15 text-[#237A4B] flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-[#333333]">
                        Less Food Waste & Total Privacy
                      </h3>
                      <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                        Live menu availability reduces wasted prep, and zero personal tracking or cameras keep student privacy intact.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing summary */}
              <div id="pricing" className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-neutral-200 bg-[#F9F9F9] p-5 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-semibold text-neutral-500">For Students & Faculty</p>
                    <h3 className="font-display text-lg font-bold text-[#333333] mt-1">
                      Student Free Tier
                    </h3>
                    <p className="font-display text-3xl font-extrabold text-[#333333] mt-3 tabular-nums">
                      {formatINR(0)}
                      <span className="text-xs font-normal text-neutral-500"> / forever</span>
                    </p>
                    <ul className="mt-4 space-y-2 text-xs text-neutral-600">
                      <li>· Live queue levels & calculated waits</li>
                      <li>· Best time to visit insights</li>
                      <li>· Daily canteen menus & prices</li>
                      <li>· In-app queue drop alerts</li>
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => loginAsDemoRole('student')}
                    className="mt-5 w-full min-h-[42px] rounded-xl border border-neutral-300 bg-white text-xs font-semibold text-[#333333] hover:border-[#C00000] hover:text-[#C00000] transition-colors"
                  >
                    Continue as Student
                  </button>
                </div>

                <div className="rounded-2xl border-2 border-[#C00000] bg-white p-5 flex flex-col justify-between shadow-sm">
                  <div>
                    <p className="text-xs font-semibold text-[#C00000]">For Institutions</p>
                    <h3 className="font-display text-lg font-bold text-[#333333] mt-1">
                      College Plan
                    </h3>
                    <p className="font-display text-3xl font-extrabold text-[#333333] mt-3 tabular-nums">
                      {formatINR(5000)}
                      <span className="text-xs font-normal text-neutral-500"> / month</span>
                    </p>
                    <ul className="mt-4 space-y-2 text-xs text-neutral-600">
                      <li>· Unlimited campus canteens & counters</li>
                      <li>· Mobile Staff Queue & Menu Panel</li>
                      <li>· Admin Analytics & CSV Report Export</li>
                      <li>· Demo billing only (no real payment)</li>
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => openModal('college-register')}
                    className="mt-5 w-full min-h-[42px] rounded-xl bg-[#C00000] text-white text-xs font-semibold hover:bg-[#A31621] transition-colors"
                  >
                    Register Your College
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#F1F1F1] border-t border-neutral-200 py-6 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <span>
            QueueCast Campus Prototype · Sample & simulated data only (no physical sensors connected)
          </span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => loginAsDemoRole('staff')}
              className="hover:text-[#333333] underline"
            >
              Demo Staff View
            </button>
            <button
              type="button"
              onClick={() => loginAsDemoRole('admin')}
              className="hover:text-[#333333] underline"
            >
              Demo Admin View
            </button>
          </div>
        </div>
      </footer>

      <AuthModal
        open={authOpen}
        initialMode={authMode}
        onClose={() => setAuthOpen(false)}
      />
    </div>
  );
};
