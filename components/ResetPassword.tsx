import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { databaseService } from '../services/databaseService';
import { toast } from 'sonner';

interface ResetPasswordProps {
  token: string;
  onComplete: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ token, onComplete }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match. Please try again.');
      return;
    }

    setIsAuthenticating(true);
    try {
      const result = await databaseService.resetPassword(token, formData.password);
      if (result.success) {
        toast.success(result.message);
        onComplete();
      } else {
        toast.error(result.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('An error occurred while resetting password');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
      <div className="fixed inset-0 bg-[#261409]/70 backdrop-blur-xs" />
      <div className="relative z-10 w-full max-w-md my-auto animate-in slide-in-from-bottom-6 duration-300">
        <div className="bg-[#FFFCF7] border border-[#EAD8C0] rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-[#4A2B18] text-[#FAF4EC] px-6 pt-7 pb-6 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#E5C9A8] mb-2">
              Account Security
            </p>
            <h1 className="font-serif italic font-black text-4xl leading-none tracking-tight text-[#FAF4EC]">
              B.E.C{' '}
              <span className="font-sans font-extrabold text-2xl text-[#E5C9A8]">
                Footwear
              </span>
            </h1>
            <p className="mt-2 text-xs text-[#E5C9A8]/90 font-medium">
              Set a new password for your account
            </p>
          </div>

          <form onSubmit={handleResetSubmit} className="p-6 sm:p-8 space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="New password"
                className="w-full bg-[#FAF4EC] border border-[#EAD8C0] px-4 py-3.5 rounded-xl text-sm font-medium text-[#261409] focus:bg-white focus:border-[#4A2B18] focus:ring-2 focus:ring-[#4A2B18]/15 outline-none pr-12 placeholder:text-[#8E6D55]"
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

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                className="w-full bg-[#FAF4EC] border border-[#EAD8C0] px-4 py-3.5 rounded-xl text-sm font-medium text-[#261409] focus:bg-white focus:border-[#4A2B18] focus:ring-2 focus:ring-[#4A2B18]/15 outline-none pr-12 placeholder:text-[#8E6D55]"
              />
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              aria-busy={isAuthenticating}
              aria-label="Confirm Password Reset"
              className="w-full min-h-[48px] py-3.5 px-5 rounded-xl font-extrabold uppercase tracking-[0.2em] text-xs bg-[#4A2B18] hover:bg-[#3B2010] text-[#FAF4EC] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <span>Confirm Reset</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
