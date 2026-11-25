import * as React from 'react';
import { useState } from 'react';
import { Eye, EyeOff, X, ArrowRight, Truck } from 'lucide-react';
import { databaseService } from '../services/databaseService';
import PolicyModal from './PolicyModal';
import { toast } from 'sonner';

interface LandingScreenProps {
  onComplete: (archetype: string, isNewUser: boolean) => void;
  onAdminAccess?: () => void;
  onClose?: () => void;
}

const LandingScreen: React.FC<LandingScreenProps> = ({ onComplete, onAdminAccess, onClose }) => {
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD'>('LOGIN');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [adminClicks, setAdminClicks] = useState(0);
  const [brandPulse, setBrandPulse] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPolicy, setShowPolicy] = useState<{ open: boolean; type: 'TERMS' | 'REFUND' }>({ open: false, type: 'TERMS' });
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    referralCode: ''
  });
  const [refValidation, setRefValidation] = useState<{ isValid: boolean; message: string; referrerName?: string } | null>(null);

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refFromUrl = urlParams.get('ref') || localStorage.getItem('ck-ref-code');
    if (refFromUrl) {
      setFormData(prev => ({ ...prev, referralCode: refFromUrl.toUpperCase() }));
      setAuthMode('SIGNUP');
      validateCode(refFromUrl);
    }
  }, []);

  const validateCode = async (code: string) => {
    if (!code.trim()) {
      setRefValidation(null);
      return;
    }
    try {
      const res = await databaseService.validateReferralCode(code.trim());
      if (res && res.valid) {
        setRefValidation({
          isValid: true,
          message: res.message || `Valid referral from @${res.referrerName}. Enjoy GH₵20 off your first order over GH₵100.`,
          referrerName: res.referrerName
        });
      } else {
        setRefValidation({
          isValid: false,
          message: res?.message || 'Invalid or expired referral code'
        });
      }
    } catch {
      setRefValidation({ isValid: false, message: 'Could not validate code' });
    }
  };

  const handleAdminClick = () => {
    const nextClicks = adminClicks + 1;
    setBrandPulse(true);
    setTimeout(() => setBrandPulse(false), 160);
    if (nextClicks >= 5) {
      onAdminAccess?.();
      setAdminClicks(0);
    } else {
      setAdminClicks(nextClicks);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (authMode === 'FORGOT_PASSWORD') {
      setIsAuthenticating(true);
      try {
        const result = await databaseService.requestPasswordReset(formData.email);
        if (result.success) {
          toast.success(result.message);
          setAuthMode('LOGIN');
        } else {
          toast.error(result.message || 'Failed to request password reset');
        }
      } catch (error) {
        console.error('Password reset request error:', error);
        toast.error('An error occurred while requesting password reset');
      } finally {
        setIsAuthenticating(false);
      }
      return;
    }

    if (authMode === 'SIGNUP' && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match. Please try again.');
      return;
    }

    setIsAuthenticating(true);
    try {
      let result;
      if (authMode === 'LOGIN') {
        result = await databaseService.login({
          email: formData.email,
          password: formData.password
        });
      } else {
        result = await databaseService.signup({
          email: formData.email,
          password: formData.password,
          gender: formData.gender,
          referralCode: formData.referralCode
        });
      }

      if (result.success) {
        localStorage.setItem('cc-auth-token', 'true');
        localStorage.setItem('cc-user-id', result.userId);
        localStorage.setItem('userId', result.userId);
        if (result.handle) localStorage.setItem('cc-user-handle', result.handle);
        onComplete('CYBER', authMode === 'SIGNUP');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(
        authMode === 'LOGIN'
          ? 'Invalid email or password. Please try again.'
          : 'Could not create account. An account with this email may already exist.'
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bec-auth-title"
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300"
    >
      <div className="fixed inset-0 bg-[#261409]/70 backdrop-blur-xs" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md my-auto animate-in slide-in-from-bottom-6 duration-300">
        <div className="bg-[#FFFCF7] border border-[#EAD8C0] rounded-3xl overflow-hidden shadow-2xl">
          {/* Deep Espresso Brand Header Matching B.E.C Flyer */}
          <div className="relative bg-[#4A2B18] text-[#FAF4EC] px-6 pt-7 pb-6 text-center overflow-hidden">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-10 -left-10 w-64 h-16 rounded-[100%] bg-[#FFFCF7]/10 rotate-[3deg]"
            />

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close sign in dialog"
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#3B2010] hover:bg-[#261409] text-[#FAF4EC] border border-[#FAF4EC]/15 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#E5C9A8] mb-2">
              Member Access · Ghana
            </p>
            <h1
              id="bec-auth-title"
              onClick={handleAdminClick}
              className={`font-serif italic font-black text-4xl leading-none tracking-tight text-[#FAF4EC] select-none cursor-default transition-transform ${
                brandPulse ? 'scale-95' : ''
              }`}
            >
              B.E.C{' '}
              <span className="font-sans font-extrabold text-2xl text-[#E5C9A8]">
                Footwear
              </span>
            </h1>
            <p className="mt-2.5 text-xs text-[#E5C9A8]/90 font-medium inline-flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              <span>Track orders, save EU sizes &amp; shop nationwide</span>
            </p>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8">
            <div className="flex bg-[#F5EAD8] p-1 rounded-xl mb-6 border border-[#EAD8C0]">
              <button
                type="button"
                onClick={() => setAuthMode('LOGIN')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  authMode === 'LOGIN'
                    ? 'bg-[#4A2B18] text-[#FAF4EC] shadow-xs'
                    : 'text-[#5A331C] hover:text-[#261409]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('SIGNUP')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  authMode === 'SIGNUP'
                    ? 'bg-[#4A2B18] text-[#FAF4EC] shadow-xs'
                    : 'text-[#5A331C] hover:text-[#261409]'
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              <div>
                <label htmlFor="bec-auth-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="bec-auth-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email address"
                  className="w-full bg-[#FAF4EC] border border-[#EAD8C0] px-4 py-3.5 rounded-xl text-sm font-medium text-[#261409] focus:bg-white focus:border-[#4A2B18] focus:ring-2 focus:ring-[#4A2B18]/15 outline-none placeholder:text-[#8E6D55] transition-colors"
                />
              </div>

              {authMode !== 'FORGOT_PASSWORD' && (
                <div className="relative">
                  <label htmlFor="bec-auth-password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="bec-auth-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Password"
                    className="w-full bg-[#FAF4EC] border border-[#EAD8C0] px-4 py-3.5 rounded-xl text-sm font-medium text-[#261409] focus:bg-white focus:border-[#4A2B18] focus:ring-2 focus:ring-[#4A2B18]/15 outline-none pr-12 placeholder:text-[#8E6D55] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-[#7C5A43] hover:text-[#261409] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              )}

              {authMode === 'SIGNUP' && (
                <div className="space-y-3.5">
                  <div>
                    <label htmlFor="bec-auth-confirm" className="sr-only">
                      Confirm password
                    </label>
                    <input
                      id="bec-auth-confirm"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Confirm password"
                      className="w-full bg-[#FAF4EC] border border-[#EAD8C0] px-4 py-3.5 rounded-xl text-sm font-medium text-[#261409] focus:bg-white focus:border-[#4A2B18] focus:ring-2 focus:ring-[#4A2B18]/15 outline-none placeholder:text-[#8E6D55] transition-colors"
                    />
                  </div>

                  <div className="relative">
                    <label htmlFor="bec-auth-gender" className="sr-only">
                      Gender
                    </label>
                    <select
                      id="bec-auth-gender"
                      required
                      value={formData.gender}
                      onChange={e => setFormData({ ...formData, gender: e.target.value })}
                      className={`w-full bg-[#FAF4EC] border border-[#EAD8C0] px-4 py-3.5 rounded-xl text-sm font-medium focus:bg-white focus:border-[#4A2B18] focus:ring-2 focus:ring-[#4A2B18]/15 outline-none appearance-none transition-colors ${
                        formData.gender ? 'text-[#261409]' : 'text-[#8E6D55]'
                      }`}
                    >
                      <option value="" disabled>
                        Select gender
                      </option>
                      <option value="Male" className="text-[#261409]">
                        Male
                      </option>
                      <option value="Female" className="text-[#261409]">
                        Female
                      </option>
                      <option value="Prefer not to say" className="text-[#261409]">
                        Prefer not to say
                      </option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#7C5A43]">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="bec-auth-referral" className="sr-only">
                      Referral code
                    </label>
                    <input
                      id="bec-auth-referral"
                      type="text"
                      value={formData.referralCode}
                      onChange={e => {
                        const code = e.target.value.toUpperCase();
                        setFormData({ ...formData, referralCode: code });
                        validateCode(code);
                      }}
                      placeholder="Referral code (optional, e.g. BEC-AMA1234)"
                      className="w-full bg-[#FAF4EC] border border-[#EAD8C0] px-4 py-3.5 rounded-xl text-sm font-medium text-[#261409] focus:bg-white focus:border-[#4A2B18] focus:ring-2 focus:ring-[#4A2B18]/15 outline-none placeholder:text-[#8E6D55] font-mono transition-colors"
                    />
                    {refValidation && (
                      <p
                        className={`text-xs font-semibold px-3 py-2 rounded-lg ${
                          refValidation.isValid
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {refValidation.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-start gap-2.5 pt-1">
                    <input
                      type="checkbox"
                      id="terms"
                      required
                      className="mt-0.5 w-4 h-4 rounded border-[#C5A482] accent-[#4A2B18] cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-xs text-[#5A331C] leading-relaxed cursor-pointer select-none">
                      I accept the{' '}
                      <button
                        type="button"
                        onClick={() => setShowPolicy({ open: true, type: 'TERMS' })}
                        className="font-bold text-[#4A2B18] underline hover:text-[#261409] cursor-pointer"
                      >
                        Terms and Conditions
                      </button>{' '}
                      and the{' '}
                      <button
                        type="button"
                        onClick={() => setShowPolicy({ open: true, type: 'REFUND' })}
                        className="font-bold text-[#4A2B18] underline hover:text-[#261409] cursor-pointer"
                      >
                        Refund and Shipping Policy
                      </button>
                      .
                    </label>
                  </div>
                </div>
              )}

              {authMode === 'LOGIN' && (
                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={() => setAuthMode('FORGOT_PASSWORD')}
                    className="text-xs font-semibold text-[#7C5A43] hover:text-[#4A2B18] transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {authMode === 'FORGOT_PASSWORD' && (
                <div className="text-center py-1 space-y-1.5">
                  <p className="text-xs text-[#5A331C]">
                    Enter your account email and we will send a password reset link.
                  </p>
                  <button
                    type="button"
                    onClick={() => setAuthMode('LOGIN')}
                    className="text-xs font-bold text-[#4A2B18] hover:underline cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full min-h-[48px] mt-2 py-3.5 px-5 rounded-xl font-extrabold uppercase tracking-[0.2em] text-xs bg-[#4A2B18] hover:bg-[#3B2010] text-[#FAF4EC] transition-all active:scale-[0.98] disabled:opacity-50 shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {isAuthenticating
                    ? 'Please wait...'
                    : authMode === 'LOGIN'
                    ? 'Sign In'
                    : authMode === 'SIGNUP'
                    ? 'Create Account'
                    : 'Send Reset Link'}
                </span>
                {!isAuthenticating && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      </div>

      <PolicyModal
        isOpen={showPolicy.open}
        onClose={() => setShowPolicy({ ...showPolicy, open: false })}
        type={showPolicy.type}
      />
    </div>
  );
};

export default LandingScreen;
