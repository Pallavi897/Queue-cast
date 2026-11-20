import React, { useState } from 'react';
import { Building2, GraduationCap, ShieldCheck, UtensilsCrossed, X } from 'lucide-react';
import { useQueueCast } from '../context/QueueCastContext';

export type AuthModalMode = 'login' | 'student-register' | 'college-register';

interface AuthModalProps {
  open: boolean;
  initialMode: AuthModalMode;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  open,
  initialMode,
  onClose,
}) => {
  const {
    collegeProfile,
    loginWithCredentials,
    loginAsDemoRole,
    registerStudent,
    registerCollegeAdmin,
    showToast,
  } = useQueueCast();

  const [mode, setMode] = useState<AuthModalMode>(initialMode);
  const [error, setError] = useState<string>('');

  // Sync mode when initialMode changes on open
  React.useEffect(() => {
    if (open) {
      setMode(initialMode);
      setError('');
    }
  }, [open, initialMode]);

  // Login state
  const [loginEmail, setLoginEmail] = useState('aarav.kumar@sreenidhi.edu.in');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Student Register state
  const [stuName, setStuName] = useState('');
  const [stuEmail, setStuEmail] = useState('');
  const [stuDept, setStuDept] = useState('CSE · 2nd Year');
  const [stuPassword, setStuPassword] = useState('');

  // College Register state (pre-filled per requirements)
  const [colName, setColName] = useState(
    collegeProfile.collegeName || 'Sreenidhi Institute of Science and Technology'
  );
  const [colCity, setColCity] = useState(collegeProfile.city || 'Hyderabad');
  const [adminName, setAdminName] = useState(collegeProfile.adminName || '');
  const [phone, setPhone] = useState(collegeProfile.phone || '');
  const [colEmail, setColEmail] = useState(collegeProfile.email || '');
  const [colPassword, setColPassword] = useState('admin123');
  const [studentCount, setStudentCount] = useState<number>(
    collegeProfile.studentCount || 6500
  );
  const [canteenCount, setCanteenCount] = useState<number>(
    collegeProfile.canteenCount || 3
  );

  if (!open) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = loginWithCredentials(loginEmail, loginPassword);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    showToast(res.message, 'success');
    onClose();
  };

  const handleStudentRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = registerStudent(stuName, stuEmail, stuPassword, stuDept);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    showToast(res.message, 'success');
    onClose();
  };

  const handleCollegeRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = registerCollegeAdmin({
      collegeName: colName,
      city: colCity,
      adminName,
      phone,
      email: colEmail,
      password: colPassword,
      studentCount: Number(studentCount),
      canteenCount: Number(canteenCount),
    });
    if (!res.ok) {
      setError(res.message);
      return;
    }
    showToast(res.message, 'success');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-heading"
    >
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-neutral-200 my-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-[#F9F9F9]">
          <div>
            <h2
              id="auth-modal-heading"
              className="font-display text-lg font-bold text-[#333333]"
            >
              {mode === 'login'
                ? 'Sign in to QueueCast'
                : mode === 'student-register'
                ? 'Student Free Account'
                : 'Register Your College'}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Demo authentication · All data saved locally in your browser
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-neutral-500 hover:bg-neutral-200/70 hover:text-neutral-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#F1F1F1]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`py-2 px-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                mode === 'login'
                  ? 'bg-white text-[#C00000] shadow-xs'
                  : 'text-neutral-600 hover:text-[#333333]'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('student-register');
                setError('');
              }}
              className={`py-2 px-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                mode === 'student-register'
                  ? 'bg-white text-[#C00000] shadow-xs'
                  : 'text-neutral-600 hover:text-[#333333]'
              }`}
            >
              Student Sign Up
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('college-register');
                setError('');
              }}
              className={`py-2 px-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                mode === 'college-register'
                  ? 'bg-white text-[#C00000] shadow-xs'
                  : 'text-neutral-600 hover:text-[#333333]'
              }`}
            >
              College Setup
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-xl bg-[#C0392B]/10 border border-[#C0392B]/30 px-4 py-2.5 text-sm text-[#C0392B] font-medium"
            >
              {error}
            </div>
          )}

          {mode === 'login' && (
            <>
              {/* Quick Demo Role Buttons */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-neutral-500 mb-2">
                  Instant Demo Access by Role
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      loginAsDemoRole('student');
                      onClose();
                    }}
                    className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-left hover:border-[#C00000] hover:bg-[#C00000]/5 transition-colors"
                  >
                    <GraduationCap className="w-4 h-4 text-[#C00000] shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-[#333333] truncate">
                        Student (Free)
                      </span>
                      <span className="block text-[11px] text-neutral-500 truncate">
                        Aarav Kumar
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      loginAsDemoRole('staff');
                      onClose();
                    }}
                    className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-left hover:border-[#F26A2A] hover:bg-[#F26A2A]/5 transition-colors"
                  >
                    <UtensilsCrossed className="w-4 h-4 text-[#F26A2A] shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-[#333333] truncate">
                        Canteen Staff
                      </span>
                      <span className="block text-[11px] text-neutral-500 truncate">
                        Ramesh Verma
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      loginAsDemoRole('admin');
                      onClose();
                    }}
                    className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-left hover:border-[#A31621] hover:bg-[#A31621]/5 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#A31621] shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-[#333333] truncate">
                        College Admin
                      </span>
                      <span className="block text-[11px] text-neutral-500 truncate">
                        Dr. Kavitha Reddy
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="relative my-4 flex items-center">
                <div className="flex-grow border-t border-neutral-200" />
                <span className="mx-3 text-xs text-neutral-400">or sign in with email</span>
                <div className="flex-grow border-t border-neutral-200" />
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Campus Email
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@sreenidhi.edu.in"
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#C00000] focus:ring-2 focus:ring-[#C00000]/15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#C00000] focus:ring-2 focus:ring-[#C00000]/15"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full min-h-[44px] rounded-xl bg-[#C00000] text-white text-sm font-semibold hover:bg-[#A31621] transition-colors"
                >
                  Login
                </button>
              </form>
            </>
          )}

          {mode === 'student-register' && (
            <form onSubmit={handleStudentRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={stuName}
                  onChange={(e) => setStuName(e.target.value)}
                  placeholder="e.g. Rohan Sharma"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#C00000] focus:ring-2 focus:ring-[#C00000]/15"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    College Email
                  </label>
                  <input
                    type="email"
                    required
                    value={stuEmail}
                    onChange={(e) => setStuEmail(e.target.value)}
                    placeholder="rohan@sreenidhi.edu.in"
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#C00000] focus:ring-2 focus:ring-[#C00000]/15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Department & Year
                  </label>
                  <input
                    type="text"
                    value={stuDept}
                    onChange={(e) => setStuDept(e.target.value)}
                    placeholder="CSE · 2nd Year"
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#C00000] focus:ring-2 focus:ring-[#C00000]/15"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Password (min 6 characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={stuPassword}
                  onChange={(e) => setStuPassword(e.target.value)}
                  placeholder="Create password"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#C00000] focus:ring-2 focus:ring-[#C00000]/15"
                />
              </div>
              <button
                type="submit"
                className="w-full min-h-[44px] rounded-xl bg-[#C00000] text-white text-sm font-semibold hover:bg-[#A31621] transition-colors"
              >
                Create Free Student Account
              </button>
            </form>
          )}

          {mode === 'college-register' && (
            <form onSubmit={handleCollegeRegister} className="space-y-3.5">
              <div className="flex items-center gap-2 rounded-xl bg-[#F1F1F1] px-3.5 py-2 text-xs text-neutral-700">
                <Building2 className="w-4 h-4 text-[#C00000] shrink-0" />
                <span>
                  Pre-filled with sample campus details. Edit any field to register your institution.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    College Name
                  </label>
                  <input
                    type="text"
                    required
                    value={colName}
                    onChange={(e) => setColName(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm focus:outline-none focus:border-[#C00000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={colCity}
                    onChange={(e) => setColCity(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm focus:outline-none focus:border-[#C00000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Admin Name
                  </label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="e.g. Dr. Kavitha Reddy"
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm focus:outline-none focus:border-[#C00000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98490 11234"
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm focus:outline-none focus:border-[#C00000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    required
                    value={colEmail}
                    onChange={(e) => setColEmail(e.target.value)}
                    placeholder="admin@college.edu.in"
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm focus:outline-none focus:border-[#C00000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={colPassword}
                    onChange={(e) => setColPassword(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm focus:outline-none focus:border-[#C00000]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Students
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={studentCount}
                      onChange={(e) => setStudentCount(Number(e.target.value))}
                      className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm tabular-nums focus:outline-none focus:border-[#C00000]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Canteens
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={canteenCount}
                      onChange={(e) => setCanteenCount(Number(e.target.value))}
                      className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm tabular-nums focus:outline-none focus:border-[#C00000]"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full min-h-[44px] rounded-xl bg-[#C00000] text-white text-sm font-semibold hover:bg-[#A31621] transition-colors mt-2"
              >
                Save College Profile & Launch Admin Portal
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
