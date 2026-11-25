import React, { useState, useEffect } from 'react';
import { databaseService } from '../services/databaseService';
import { MarketingCampaign, MarketingMember, MarketingBroadcast, MarketingSettings, MarketingRequest } from '../types';
import { 
  Shield, 
  Megaphone, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  DollarSign, 
  Plus, 
  Sliders, 
  AlertCircle, 
  TrendingUp, 
  Lock, 
  Unlock, 
  Trash2, 
  Key, 
  MessageSquare, 
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminMarketingControl: React.FC = () => {
  const [settings, setSettings] = useState<MarketingSettings | null>(null);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [members, setMembers] = useState<MarketingMember[]>([]);
  const [broadcasts, setBroadcasts] = useState<MarketingBroadcast[]>([]);
  const [requests, setRequests] = useState<MarketingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sub-tabs in Admin Control
  const [adminTab, setAdminTab] = useState<'APPROVALS' | 'GOVERNANCE' | 'ROSTER' | 'CAMPAIGNS'>('APPROVALS');

  // Modals & form state
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    email: '',
    role: 'CAMPAIGN_SPECIALIST',
    accessCode: ''
  });

  const [reviewModal, setReviewModal] = useState<{
    type: 'CAMPAIGN' | 'BROADCAST';
    item: MarketingCampaign | MarketingBroadcast;
    action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';
  } | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [settingsRes, campaignsRes, membersRes, broadcastsRes, requestsRes] = await Promise.all([
        databaseService.getAdminMarketingSettings().catch(() => ({ success: true, settings: { id: 'global', portalEnabled: true, requireCampaignApproval: true, requireBroadcastApproval: true, maxDiscountPercent: 25, monthlyBudgetLimitGhc: 15000, autoApproveVerifiedLeads: false } })),
        databaseService.getMarketingCampaigns().catch(() => ({ success: true, campaigns: [] })),
        databaseService.getAdminMarketingMembers().catch(() => ({ success: true, members: [] })),
        databaseService.getMarketingBroadcasts().catch(() => ({ success: true, broadcasts: [] })),
        databaseService.getAdminMarketingRequests().catch(() => ({ success: true, requests: [] }))
      ]);

      if (settingsRes?.settings) {
        setSettings(settingsRes.settings);
      } else if (settingsRes) {
        setSettings(settingsRes as any);
      }
      if (campaignsRes?.campaigns) setCampaigns(campaignsRes.campaigns);
      if (membersRes?.members) setMembers(membersRes.members);
      if (broadcastsRes?.broadcasts) setBroadcasts(broadcastsRes.broadcasts);
      if (requestsRes?.requests) setRequests(requestsRes.requests);
    } catch (err: any) {
      console.error('Failed to load marketing admin data:', err);
      toast.error('Failed to load marketing governance data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewRequest = async (reqItem: MarketingRequest, action: 'APPROVE' | 'REJECT') => {
    try {
      const res = await databaseService.reviewMarketingRequest(reqItem.id, action);
      if (res?.success) {
        toast.success(`Access request for ${reqItem.name} marked as ${action}!${res.member ? ` Access Code generated: ${res.member.accessCode}` : ''}`);
        loadData();
      }
    } catch {
      toast.error('Failed to review access request.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePortal = async () => {
    const currentStatus = settings ? settings.portalEnabled : false;
    const updatedStatus = !currentStatus;
    try {
      const res = await databaseService.updateAdminMarketingSettings({ 
        portalEnabled: updatedStatus 
      });
      if (res?.settings) {
        setSettings(res.settings);
      } else {
        setSettings({
          id: 'global',
          portalEnabled: updatedStatus,
          requireCampaignApproval: true,
          requireBroadcastApproval: true,
          maxDiscountPercent: 25,
          monthlyBudgetLimitGhc: 15000,
          autoApproveVerifiedLeads: false
        });
      }
      toast.success(`Marketing Portal has been ${updatedStatus ? 'ACTIVATED' : 'DISABLED'}.`);
    } catch (err: any) {
      console.error('Toggle portal error:', err);
      toast.error(err?.message || 'Failed to update portal status.');
    }
  };

  const handleUpdatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await databaseService.updateAdminMarketingSettings(settings);
      toast.success('Marketing policies & budget limits updated.');
    } catch {
      toast.error('Failed to update policies.');
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberForm.name || !newMemberForm.email) {
      toast.error('Please provide name and email.');
      return;
    }

    try {
      const res = await databaseService.createAdminMarketingMember(newMemberForm);
      if (res?.member) {
        setMembers(prev => [res.member, ...prev]);
        toast.success(`Marketer "${res.member.name}" registered successfully.`);
        setShowAddMemberModal(false);
        setNewMemberForm({ name: '', email: '', role: 'CAMPAIGN_SPECIALIST', accessCode: '' });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add marketing member.');
    }
  };

  const handleToggleMemberStatus = async (member: MarketingMember) => {
    const nextStatus = member.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE';
    try {
      await databaseService.updateAdminMarketingMember(member.id, { status: nextStatus });
      setMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: nextStatus } : m));
      toast.success(`Access for ${member.name} updated to ${nextStatus}.`);
    } catch {
      toast.error('Failed to update member status.');
    }
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove marketing member "${name}"?`)) return;
    try {
      await databaseService.deleteAdminMarketingMember(id);
      setMembers(prev => prev.filter(m => m.id !== id));
      toast.success(`Marketer removed.`);
    } catch {
      toast.error('Failed to delete member.');
    }
  };

  const handleConfirmReview = async () => {
    if (!reviewModal) return;
    try {
      if (reviewModal.type === 'CAMPAIGN') {
        await databaseService.reviewMarketingCampaign(reviewModal.item.id, reviewModal.action, reviewFeedback);
        toast.success(`Campaign review complete: ${reviewModal.action}`);
      } else {
        await databaseService.reviewMarketingBroadcast(reviewModal.item.id, reviewModal.action as 'APPROVE' | 'REJECT', reviewFeedback);
        toast.success(`Broadcast review complete: ${reviewModal.action}`);
      }
      setReviewModal(null);
      setReviewFeedback('');
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to execute review action.');
    }
  };

  const pendingCampaigns = campaigns.filter(c => c.status === 'PENDING_APPROVAL');
  const pendingBroadcasts = broadcasts.filter(b => b.status === 'PENDING_APPROVAL');
  const pendingMembers = members.filter(m => m.status === 'PENDING');
  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const totalPending = pendingCampaigns.length + pendingBroadcasts.length + pendingMembers.length + pendingRequests.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Banner */}
      <div className="bg-zinc-950 text-white rounded-[2rem] p-6 sm:p-10 border border-zinc-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-9xl font-serif select-none pointer-events-none">
          MKT
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Governance Center</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif italic tracking-tight">Marketing Portal Control</h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
              Oversee the marketing department, approve promotional drops and broadcasts, enforce discount caps, review access requests, and manage team credentials.
            </p>
          </div>

          {/* Master Portal Switch */}
          <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shrink-0">
            <div>
              <div className="text-xs font-bold text-zinc-200">Marketing Portal Access</div>
              <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                {settings?.portalEnabled ? (
                  <span className="text-emerald-400">● Live & Accessible</span>
                ) : (
                  <span className="text-amber-400">● Locked / Disabled</span>
                )}
              </div>
            </div>
            <button
              onClick={handleTogglePortal}
              className={`p-3 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                settings?.portalEnabled 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
              title={settings?.portalEnabled ? 'Click to Disable Portal' : 'Click to Enable Portal'}
            >
              {settings?.portalEnabled ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-3">
        <button
          onClick={() => setAdminTab('APPROVALS')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            adminTab === 'APPROVALS'
              ? 'bg-zinc-950 text-white shadow-sm'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending Approvals</span>
          {totalPending > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-400 text-black text-[10px] font-black flex items-center justify-center">
              {totalPending}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('GOVERNANCE')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            adminTab === 'GOVERNANCE'
              ? 'bg-zinc-950 text-white shadow-sm'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Policy & Budget Caps</span>
        </button>

        <button
          onClick={() => setAdminTab('ROSTER')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            adminTab === 'ROSTER'
              ? 'bg-zinc-950 text-white shadow-sm'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team Roster ({members.length})</span>
          {pendingMembers.length > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-mono font-bold">
              {pendingMembers.length} new
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('CAMPAIGNS')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            adminTab === 'CAMPAIGNS'
              ? 'bg-zinc-950 text-white shadow-sm'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>All Campaigns ({campaigns.length})</span>
        </button>
      </div>

      {/* TAB 1: APPROVALS QUEUE */}
      {adminTab === 'APPROVALS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif italic text-zinc-950">Pending Marketing Items</h2>
            <span className="text-xs text-zinc-500 font-mono">{totalPending} awaiting clearance</span>
          </div>

          {totalPending === 0 ? (
            <div className="text-center py-16 bg-zinc-50 rounded-3xl border border-zinc-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-zinc-900">Queue is Clear</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                No access requests, campaigns, or broadcasts require your approval right now.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Access Requests from marketing_requests Table */}
              {pendingRequests.map((req) => (
                <div key={req.id} className="bg-white border-2 border-blue-300 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 border border-blue-300 text-blue-900 text-[10px] font-black uppercase tracking-wider">
                          Portal Access Request (`marketing_requests`)
                        </span>
                        <span className="text-xs font-mono text-zinc-500">Status: {req.status}</span>
                      </div>
                      <h3 className="text-lg font-bold text-zinc-950">{req.name}</h3>
                      <p className="text-xs font-mono text-zinc-600">{req.email}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReviewRequest(req, 'APPROVE')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Access</span>
                      </button>
                      <button
                        onClick={() => handleReviewRequest(req, 'REJECT')}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs">
                    <span className="text-[10px] font-bold uppercase text-zinc-400">Proposed Campaign Focus</span>
                    <p className="font-semibold text-zinc-900 mt-0.5 italic">"{req.campaignFocus}"</p>
                  </div>
                </div>
              ))}
              {/* Marketer Applications Pending */}
              {pendingMembers.map((m) => (
                <div key={m.id} className="bg-white border-2 border-amber-300/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                          New Marketer Application
                        </span>
                        <span className="text-xs font-mono text-zinc-500">Access Code: {m.accessCode}</span>
                      </div>
                      <h3 className="text-lg font-bold text-zinc-950">{m.name}</h3>
                      <p className="text-xs font-mono text-zinc-600">{m.email} · Role: {m.role}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleMemberStatus(m)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Marketer</span>
                      </button>
                      <button
                        onClick={() => handleDeleteMember(m.id, m.name)}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Reject Application
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Approving this application will activate their access code and enable their referral promo code for store checkouts!</span>
                  </div>
                </div>
              ))}

              {/* Campaigns pending */}
              {pendingCampaigns.map((camp) => (
                <div key={camp.id} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm hover:border-zinc-300 transition-all space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                          Campaign Approval Request
                        </span>
                        <span className="text-xs font-mono text-zinc-400">Created by {camp.createdBy}</span>
                      </div>
                      <h3 className="text-lg font-bold text-zinc-950">{camp.title}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setReviewModal({ type: 'CAMPAIGN', item: camp, action: 'APPROVE' })}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Drop</span>
                      </button>
                      <button
                        onClick={() => setReviewModal({ type: 'CAMPAIGN', item: camp, action: 'REQUEST_CHANGES' })}
                        className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Request Changes
                      </button>
                      <button
                        onClick={() => setReviewModal({ type: 'CAMPAIGN', item: camp, action: 'REJECT' })}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-zinc-50 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Type & Channel</span>
                      <p className="font-bold text-zinc-900 mt-0.5">{camp.type} · {camp.channel}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Budget</span>
                      <p className="font-bold text-zinc-900 mt-0.5 font-mono">GH₵{camp.budget}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Promo Code</span>
                      <p className="font-bold text-zinc-900 mt-0.5 font-mono">
                        {camp.discountCode ? `${camp.discountCode} (-${camp.discountValue}${camp.discountType === 'PERCENT' ? '%' : ' GHC'})` : 'None'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Target Audience</span>
                      <p className="font-bold text-zinc-900 mt-0.5">{camp.targetAudience}</p>
                    </div>
                  </div>

                  {camp.notes && (
                    <p className="text-xs text-zinc-600 italic bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                      " {camp.notes} "
                    </p>
                  )}
                </div>
              ))}

              {/* Broadcasts pending */}
              {pendingBroadcasts.map((brd) => (
                <div key={brd.id} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm hover:border-zinc-300 transition-all space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-[10px] font-black uppercase tracking-wider">
                          Broadcast Push Notification
                        </span>
                        <span className="text-xs font-mono text-zinc-400">Channel: {brd.channel}</span>
                      </div>
                      <h3 className="text-lg font-bold text-zinc-950">{brd.title}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setReviewModal({ type: 'BROADCAST', item: brd, action: 'APPROVE' })}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Clear for Dispatch</span>
                      </button>
                      <button
                        onClick={() => setReviewModal({ type: 'BROADCAST', item: brd, action: 'REJECT' })}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Block
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs text-zinc-800 leading-relaxed font-sans">
                    {brd.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GOVERNANCE & POLICY CAPS */}
      {adminTab === 'GOVERNANCE' && settings && (
        <form onSubmit={handleUpdatePolicy} className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-10 space-y-8 shadow-sm">
          <div>
            <h2 className="text-xl font-serif italic text-zinc-950">Marketing Guardrails & Budgets</h2>
            <p className="text-xs text-zinc-500 mt-1">Set maximum risk parameters and approval requirements for marketing operations.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Require Campaign Approval */}
            <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-zinc-900">Require Admin Approval on Campaigns</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Campaigns must be cleared before going live or issuing discounts.</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, requireCampaignApproval: !settings.requireCampaignApproval })}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.requireCampaignApproval ? 'bg-blue-600' : 'bg-zinc-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.requireCampaignApproval ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Require Broadcast Approval */}
            <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-zinc-900">Require Broadcast Moderation</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Push notifications & SMS broadcasts must be approved by admin.</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, requireBroadcastApproval: !settings.requireBroadcastApproval })}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.requireBroadcastApproval ? 'bg-blue-600' : 'bg-zinc-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.requireBroadcastApproval ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Max Discount % */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                Max Allowed Promo Discount (%)
              </label>
              <input
                type="number"
                min="5"
                max="70"
                value={settings.maxDiscountPercent}
                onChange={(e) => setSettings({ ...settings, maxDiscountPercent: Number(e.target.value) || 0 })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm font-mono font-bold text-zinc-950 focus:border-zinc-950 outline-none"
              />
              <p className="text-[11px] text-zinc-400">Marketing team cannot create discounts exceeding this ceiling.</p>
            </div>

            {/* Monthly Budget Limit GH₵ */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                Monthly Marketing Budget Limit (GH₵)
              </label>
              <input
                type="number"
                min="500"
                step="500"
                value={settings.monthlyBudgetLimitGhc}
                onChange={(e) => setSettings({ ...settings, monthlyBudgetLimitGhc: Number(e.target.value) || 0 })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm font-mono font-bold text-zinc-950 focus:border-zinc-950 outline-none"
              />
              <p className="text-[11px] text-zinc-400">Total monthly ad spend limit across all active campaigns.</p>
            </div>
          </div>

          <button
            type="submit"
            className="py-3.5 px-6 rounded-2xl bg-zinc-950 hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-widest transition-all cursor-pointer shadow-md"
          >
            Save Governance Policies
          </button>
        </form>
      )}

      {/* TAB 3: TEAM ROSTER */}
      {adminTab === 'ROSTER' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-serif italic text-zinc-950">Marketing Team Directory</h2>
              <p className="text-xs text-zinc-500">Manage credentials and access privileges for the marketing division.</p>
            </div>
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="py-2.5 px-4 bg-zinc-950 hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Marketer</span>
            </button>
          </div>

          <div className="grid gap-4">
            {members.map((m) => (
              <div key={m.id} className="p-5 rounded-2xl bg-white border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-zinc-300 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-zinc-950">{m.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      m.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {m.status}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 font-mono flex items-center gap-3">
                    <span>{m.email}</span>
                    <span>·</span>
                    <span>Role: {m.role}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-100 text-[10px] font-mono text-zinc-700 mt-1">
                    <Key className="w-3 h-3 text-zinc-400" />
                    <span>Access Code: {m.accessCode}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleMemberStatus(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      m.status === 'ACTIVE' 
                        ? 'bg-amber-50 text-amber-800 hover:bg-amber-100' 
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    {m.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDeleteMember(m.id, m.name)}
                    className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove Member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ALL CAMPAIGNS */}
      {adminTab === 'CAMPAIGNS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-serif italic text-zinc-950">All Marketing Campaigns</h2>
              <p className="text-xs text-zinc-500">Live, historical and pending campaigns created by marketing.</p>
            </div>
          </div>

          <div className="grid gap-4">
            {campaigns.map((camp) => (
              <div key={camp.id} className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        camp.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        camp.status === 'PENDING_APPROVAL' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        camp.status === 'PAUSED' ? 'bg-zinc-100 text-zinc-600' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {camp.status}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">{camp.channel}</span>
                    </div>
                    <h3 className="text-lg font-bold text-zinc-950 mt-1">{camp.title}</h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-black text-emerald-600 text-sm">
                      Revenue: GH₵{camp.revenueGenerated || 0}
                    </span>
                    <p className="text-[10px] text-zinc-400">Budget: GH₵{camp.budget}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 p-3 bg-zinc-50 rounded-2xl text-center text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Impressions</span>
                    <p className="font-mono font-bold text-zinc-900 mt-0.5">{camp.impressions || 0}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Clicks</span>
                    <p className="font-mono font-bold text-zinc-900 mt-0.5">{camp.clicks || 0}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Conversions</span>
                    <p className="font-mono font-bold text-zinc-900 mt-0.5">{camp.conversions || 0}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD MARKETING MEMBER */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-zinc-200">
            <div>
              <h3 className="text-xl font-serif italic text-zinc-950">Add Marketing Member</h3>
              <p className="text-xs text-zinc-500">Provide their details and role for portal authorization.</p>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-500">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ama Serwaa"
                  value={newMemberForm.name}
                  onChange={e => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-950 outline-none focus:border-zinc-950"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-500">Official Email</label>
                <input
                  type="email"
                  required
                  placeholder="ama@becfootwear.gh"
                  value={newMemberForm.email}
                  onChange={e => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-950 outline-none focus:border-zinc-950"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-500">Role & Responsibilities</label>
                <select
                  value={newMemberForm.role}
                  onChange={e => setNewMemberForm({ ...newMemberForm, role: e.target.value })}
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-950 outline-none focus:border-zinc-950"
                >
                  <option value="MARKETING_LEAD">Marketing Lead (Full Access)</option>
                  <option value="CAMPAIGN_SPECIALIST">Campaign Specialist (Drops & Promos)</option>
                  <option value="COPYWRITER">Content & Copywriter (Ad Studio)</option>
                  <option value="GROWTH_LEAD">Growth & Influencer Lead</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-500">Custom Access Code (Optional)</label>
                <input
                  type="text"
                  placeholder="Auto-generated if left blank"
                  value={newMemberForm.accessCode}
                  onChange={e => setNewMemberForm({ ...newMemberForm, accessCode: e.target.value.toUpperCase() })}
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono font-bold text-zinc-950 outline-none focus:border-zinc-950 uppercase"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-zinc-950 hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Register Marketer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REVIEW WITH FEEDBACK */}
      {reviewModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-zinc-200">
            <div>
              <h3 className="text-xl font-serif italic text-zinc-950">
                Confirm {reviewModal.action}
              </h3>
              <p className="text-xs text-zinc-500">
                Target: "{reviewModal.item.title}"
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-zinc-500">
                Admin Notes / Feedback to Marketing Team (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Approved for launch. Maintain ad spend under GH₵2,500."
                value={reviewFeedback}
                onChange={e => setReviewFeedback(e.target.value)}
                className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-sans text-zinc-950 outline-none focus:border-zinc-950 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReviewModal(null)}
                className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReview}
                className={`flex-1 py-3 text-white rounded-xl text-xs font-bold shadow-md ${
                  reviewModal.action === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  reviewModal.action === 'REJECT' ? 'bg-red-600 hover:bg-red-700' : 'bg-zinc-950 hover:bg-zinc-800'
                }`}
              >
                Confirm {reviewModal.action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMarketingControl;
