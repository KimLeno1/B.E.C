import React, { useState, useEffect } from 'react';
import { databaseService } from '../services/databaseService';
import { MarketingMember } from '../types';
import { 
  Megaphone, 
  Lock, 
  ArrowLeft, 
  Key, 
  Mail, 
  ShieldCheck, 
  UserPlus, 
  CheckCircle2, 
  Phone, 
  Instagram, 
  Tag, 
  Clock, 
  Sparkles,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

interface MarketingLoginProps {
  onSuccess: (member: MarketingMember) => void;
  onCancel: () => void;
}

export const MarketingLogin: React.FC<MarketingLoginProps> = ({ onSuccess, onCancel }) => {
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'APPLY'>('LOGIN');
  
  // Login State
  const [accessCode, setAccessCode] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [portalStatus, setPortalStatus] = useState<{ portalEnabled: boolean } | null>(null);

  // Application / Request State
  const [requestForm, setRequestForm] = useState({
    name: '',
    email: '',
    campaignFocus: ''
  });

  // Success Application Card
  const [requestSubmitted, setRequestSubmitted] = useState<{
    name: string;
    email: string;
    campaignFocus: string;
    status: string;
  } | null>(null);

  useEffect(() => {
    databaseService.getMarketingStatus()
      .then(res => {
        if (res) setPortalStatus({ portalEnabled: res.portalEnabled });
      })
      .catch(() => setPortalStatus({ portalEnabled: true }));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode && !loginEmail) {
      toast.error('Please enter your team access code or marketing email.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await databaseService.marketingLogin({
        accessCode: accessCode.trim().toUpperCase(),
        email: loginEmail.trim().toLowerCase()
      });

      if (res?.member) {
        localStorage.setItem('ck-marketing-member', JSON.stringify(res.member));
        toast.success(`Welcome back, ${res.member.name}!`);
        onSuccess(res.member);
      } else {
        toast.error('Invalid marketing credentials.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Access denied or portal disabled.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm.name.trim() || !requestForm.email.trim() || !requestForm.campaignFocus.trim()) {
      toast.error('Please fill in your Name, Email, and Proposed Campaign Focus.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await databaseService.submitMarketingRequest({
        name: requestForm.name.trim(),
        email: requestForm.email.trim().toLowerCase(),
        campaignFocus: requestForm.campaignFocus.trim()
      });

      if (res?.success) {
        toast.success('Marketing portal access request submitted!');
        setRequestSubmitted({
          name: requestForm.name.trim(),
          email: requestForm.email.trim().toLowerCase(),
          campaignFocus: requestForm.campaignFocus.trim(),
          status: 'PENDING'
        });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', 
          backgroundSize: '32px 32px' 
        }}
      />

      <div className="w-full max-w-md relative z-10 space-y-6 animate-in fade-in duration-500">
        {/* Top Branding */}
        <div className="text-center space-y-3">
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Store</span>
          </button>

          <div className="w-14 h-14 rounded-2xl bg-[#4A2B18] border border-[#E5C9A8]/30 text-[#E5C9A8] mx-auto flex items-center justify-center shadow-lg">
            <Megaphone className="w-7 h-7" />
          </div>

          <h1 className="text-3xl font-serif italic tracking-tight">Marketing &amp; Referral Portal</h1>
          <p className="text-xs text-[#E5C9A8]/80">
            B.E.C Footwear Ambassador Network &amp; Growth Division
          </p>
        </div>

        {/* Portal Status Warning if disabled */}
        {portalStatus && !portalStatus.portalEnabled && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
            <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="font-bold">Portal Access Paused by Administration</p>
              <p className="text-[11px] text-amber-200/80 mt-0.5">
                The administrator has temporarily paused the marketing portal. Please check with your supervisor.
              </p>
            </div>
          </div>
        )}

        {/* Card Container */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Mode Selector Tabs */}
          {!requestSubmitted && (
            <div className="grid grid-cols-2 p-1.5 bg-zinc-950 rounded-2xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveTab('LOGIN')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'LOGIN' 
                    ? 'bg-[#4A2B18] text-[#FAF4EC] border border-[#E5C9A8]/30 shadow-md' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Team Login</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('APPLY')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'APPLY' 
                    ? 'bg-[#4A2B18] text-[#FAF4EC] border border-[#E5C9A8]/30 shadow-md' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Request Access</span>
              </button>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {activeTab === 'LOGIN' && !requestSubmitted && (
            <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Key className="w-3 h-3 text-[#E5C9A8]" />
                  <span>Team Access Code</span>
                </label>
                <input
                  type="text"
                  value={accessCode}
                  onChange={e => setAccessCode(e.target.value.toUpperCase())}
                  placeholder="e.g. BEC-MKT-2026"
                  className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm font-mono font-bold text-white placeholder:text-zinc-600 outline-none focus:border-[#E5C9A8] uppercase tracking-wider"
                />
              </div>

              <div className="relative py-2 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800" />
                </div>
                <span className="relative bg-zinc-900 px-3 text-[10px] uppercase font-bold text-zinc-500">
                  Or With Registered Email
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-zinc-400" />
                  <span>Official Marketing Email</span>
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="name@becfootwear.gh"
                  className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs font-bold text-white placeholder:text-zinc-600 outline-none focus:border-[#E5C9A8]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || (portalStatus !== null && !portalStatus.portalEnabled)}
                className="w-full py-4 rounded-2xl bg-[#4A2B18] hover:bg-[#5A331C] border border-[#E5C9A8]/30 disabled:opacity-40 text-[#FAF4EC] text-xs font-bold uppercase tracking-widest transition-all shadow-lg active:scale-98 cursor-pointer mt-2"
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}
              </button>
            </form>
          )}

          {/* TAB 2: ACCESS REGISTRATION REQUEST FORM */}
          {activeTab === 'APPLY' && !requestSubmitted && (
            <form onSubmit={handleRequestSubmit} className="space-y-4 animate-in fade-in">
              <div className="text-center py-1">
                <p className="text-xs text-zinc-400">
                  Submit your request to gain access to the B.E.C Footwear Marketing &amp; Drops Portal. All requests are saved for admin review.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={requestForm.name}
                  onChange={e => setRequestForm({ ...requestForm, name: e.target.value })}
                  placeholder="e.g. Kwesi Mensah"
                  className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs font-bold text-white placeholder:text-zinc-600 outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={requestForm.email}
                  onChange={e => setRequestForm({ ...requestForm, email: e.target.value })}
                  placeholder="kwesi@gmail.com"
                  className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs font-bold text-white placeholder:text-zinc-600 outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Proposed Campaign Focus *
                </label>
                <textarea
                  required
                  rows={3}
                  value={requestForm.campaignFocus}
                  onChange={e => setRequestForm({ ...requestForm, campaignFocus: e.target.value })}
                  placeholder="e.g. Legon & KNUST Footwear Showcase, Slide & Clog Video Drops, or Accra Pop-up..."
                  className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs font-bold text-white placeholder:text-zinc-600 outline-none focus:border-[#E5C9A8] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-[#4A2B18] hover:bg-[#5A331C] border border-[#E5C9A8]/30 disabled:opacity-40 text-[#FAF4EC] text-xs font-bold uppercase tracking-widest transition-all shadow-lg active:scale-98 cursor-pointer mt-2"
              >
                {isSubmitting ? 'Saving Request...' : 'Submit Request for Admin Review'}
              </button>
            </form>
          )}

          {/* APPLICATION CONFIRMATION SCREEN */}
          {requestSubmitted && (
            <div className="space-y-6 text-center animate-in zoom-in-95 duration-300">
              <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center">
                <Clock className="w-7 h-7 animate-pulse" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-serif italic text-white">Request Submitted!</h3>
                <p className="text-xs text-amber-300 font-semibold">
                  Saved to database (`marketing_requests`) with status PENDING
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-left space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500">Applicant:</span>
                  <span className="font-bold text-white">{requestSubmitted.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500">Email:</span>
                  <span className="font-mono text-zinc-300">{requestSubmitted.email}</span>
                </div>
                <div className="space-y-1 text-xs pt-1 border-t border-zinc-800">
                  <span className="text-zinc-500">Proposed Campaign Focus:</span>
                  <p className="font-sans text-zinc-200 bg-zinc-900 p-2.5 rounded-xl border border-zinc-800 italic">
                    "{requestSubmitted.campaignFocus}"
                  </p>
                </div>
                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-zinc-500">Review Status:</span>
                  <span className="font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                    PENDING ADMIN REVIEW
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Your request has been saved in the database under <code className="text-blue-400">marketing_requests</code>. Upon store admin review and approval, an access code will be generated for login.
              </p>

              <button
                type="button"
                onClick={() => {
                  setRequestSubmitted(null);
                  setActiveTab('LOGIN');
                }}
                className="w-full py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Return to Login
              </button>
            </div>
          )}
        </div>

        {/* Security badge */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Protected by B.E.C Footwear Admin Handshake
          </span>
        </div>
      </div>
    </div>
  );
};

export default MarketingLogin;
