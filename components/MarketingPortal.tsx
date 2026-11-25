import React, { useState, useEffect } from 'react';
import { databaseService } from '../services/databaseService';
import { MarketingCampaign, MarketingMember, MarketingBroadcast, MarketingSettings, ViewState } from '../types';
import { 
  Megaphone, 
  Sparkles, 
  Plus, 
  TrendingUp, 
  Users, 
  Copy, 
  Check, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  DollarSign, 
  Share2, 
  Download, 
  LogOut, 
  Store, 
  Sliders, 
  Radio, 
  Tag, 
  ShieldCheck, 
  ArrowRight,
  Filter,
  Play,
  Pause,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

interface MarketingPortalProps {
  member: MarketingMember;
  onLogout: () => void;
  onNavigate: (view: ViewState) => void;
}

export const MarketingPortal: React.FC<MarketingPortalProps> = ({ member, onLogout, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'CAMPAIGNS' | 'AD_STUDIO' | 'BROADCASTS' | 'INFLUENCERS' | 'ASSETS'>('CAMPAIGNS');
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [broadcasts, setBroadcasts] = useState<MarketingBroadcast[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [settings, setSettings] = useState<MarketingSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Campaign filter
  const [campaignFilter, setCampaignFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING_APPROVAL' | 'PAUSED'>('ALL');

  // Create Campaign Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    type: 'DROP_LAUNCH',
    objective: 'REVENUE',
    targetAudience: 'STREETWEAR_FANS',
    budget: 1500,
    discountCode: '',
    discountValue: 15,
    discountType: 'PERCENT' as 'PERCENT' | 'AMOUNT',
    channel: 'INSTAGRAM',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: ''
  });

  // AI Copy Studio state
  const [adTheme, setAdTheme] = useState('New Accra Night-Life Capsule');
  const [adTone, setAdTone] = useState<'Hype' | 'Luxury' | 'Urgent' | 'Cultural'>('Hype');
  const [adPlatform, setAdPlatform] = useState('Instagram');
  const [adPromo, setAdPromo] = useState('HEATWAVE20');
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Create Broadcast Modal
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    channel: 'IN_APP',
    targetAudience: 'ALL',
    ctaUrl: '/shop'
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [campRes, broadRes, overRes, statusRes] = await Promise.all([
        databaseService.getMarketingCampaigns(),
        databaseService.getMarketingBroadcasts(),
        databaseService.getMarketingOverview(),
        databaseService.getMarketingStatus()
      ]);

      if (campRes?.campaigns) setCampaigns(campRes.campaigns);
      if (broadRes?.broadcasts) setBroadcasts(broadRes.broadcasts);
      if (overRes?.data) setOverview(overRes.data);
      if (statusRes) {
        setSettings({
          id: 'global',
          portalEnabled: statusRes.portalEnabled,
          requireCampaignApproval: statusRes.requireCampaignApproval,
          requireBroadcastApproval: statusRes.requireBroadcastApproval,
          maxDiscountPercent: statusRes.maxDiscountPercent,
          monthlyBudgetLimitGhc: 10000,
          autoApproveVerifiedLeads: false
        });
      }
    } catch (err) {
      console.error('Failed to load marketing portal data:', err);
      toast.error('Could not refresh marketing portal.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignForm.title) {
      toast.error('Please enter a campaign title.');
      return;
    }

    if (settings && campaignForm.discountType === 'PERCENT' && campaignForm.discountValue > settings.maxDiscountPercent) {
      toast.error(`Admin Policy Limit: Max discount permitted is ${settings.maxDiscountPercent}%.`);
      return;
    }

    try {
      const res = await databaseService.createMarketingCampaign({
        ...campaignForm,
        creatorName: member.name
      });

      if (res?.campaign) {
        setCampaigns(prev => [res.campaign, ...prev]);
        toast.success(res.message);
        setShowCreateModal(false);
        setCampaignForm({
          title: '',
          type: 'DROP_LAUNCH',
          objective: 'REVENUE',
          targetAudience: 'STREETWEAR_FANS',
          budget: 1500,
          discountCode: '',
          discountValue: 15,
          discountType: 'PERCENT',
          channel: 'INSTAGRAM',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          notes: ''
        });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit campaign.');
    }
  };

  const handleToggleStatus = async (camp: MarketingCampaign) => {
    const nextStatus = camp.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await databaseService.updateMarketingCampaignStatus(camp.id, nextStatus);
      setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, status: nextStatus } : c));
      toast.success(`Campaign marked as ${nextStatus}.`);
    } catch {
      toast.error('Failed to change status.');
    }
  };

  const handleGenerateCopy = async () => {
    setIsGeneratingCopy(true);
    try {
      const res = await databaseService.generateMarketingCopy({
        productOrTheme: adTheme,
        tone: adTone,
        platform: adPlatform,
        promoCode: adPromo
      });

      if (res?.captions) {
        setGeneratedCaptions(res.captions);
        toast.success('Generated new high-conversion fashion copy!');
      }
    } catch {
      toast.error('Failed to generate ad copy.');
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCreateBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) {
      toast.error('Title and message are required.');
      return;
    }

    try {
      const res = await databaseService.createMarketingBroadcast({
        ...broadcastForm,
        creatorName: member.name
      });

      if (res?.broadcast) {
        setBroadcasts(prev => [res.broadcast, ...prev]);
        toast.success(res.message);
        setShowBroadcastModal(false);
        setBroadcastForm({
          title: '',
          message: '',
          channel: 'IN_APP',
          targetAudience: 'ALL',
          ctaUrl: '/shop'
        });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit broadcast announcement.');
    }
  };

  const filteredCampaigns = campaigns.filter(c => {
    if (campaignFilter === 'ALL') return true;
    return c.status === campaignFilter;
  });

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 font-sans pb-24">
      {/* Top Suite Bar */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4A2B18] text-[#FAF4EC] flex items-center justify-center font-serif font-black text-base shadow-sm">
              B.E.C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif italic font-bold text-lg text-zinc-950">B.E.C Footwear Marketing</span>
                <span className="text-[10px] text-zinc-400 font-mono">Suite v3.8</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span>{member.name}</span>
                <span aria-hidden="true">·</span>
                <span className="text-blue-600 font-semibold">{member.role}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Admin Governance Status Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Admin Governance: Active</span>
            </div>

            <button
              onClick={() => onNavigate(ViewState.LOBBY)}
              className="py-2 px-3 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-zinc-500" />
              <span>Storefront</span>
            </button>

            <button
              onClick={onLogout}
              className="py-2 px-3 rounded-xl bg-zinc-100 hover:bg-red-50 hover:text-red-600 text-zinc-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Sign Out of Marketing Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Suite Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Performance KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-xs space-y-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Influenced Revenue</span>
            <div className="text-2xl sm:text-3xl font-mono font-black text-zinc-950">
              GH₵{overview?.totalRevenue ? Number(overview.totalRevenue).toLocaleString() : '18,800'}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+24.8% vs last cycle</span>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-xs space-y-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Impressions</span>
            <div className="text-2xl sm:text-3xl font-mono font-black text-zinc-950">
              {overview?.totalImpressions ? Number(overview.totalImpressions).toLocaleString() : '14,200'}
            </div>
            <div className="text-[11px] text-zinc-500">
              Across Instagram & TikTok drops
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-xs space-y-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Conversions & Orders</span>
            <div className="text-2xl sm:text-3xl font-mono font-black text-zinc-950">
              {overview?.totalConversions || 94}
            </div>
            <div className="text-[11px] text-zinc-500 font-mono">
              Avg CTR: 12.9%
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-xs space-y-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Active Campaigns</span>
            <div className="text-2xl sm:text-3xl font-mono font-black text-blue-600">
              {campaigns.filter(c => c.status === 'ACTIVE').length}
            </div>
            <div className="text-[11px] text-zinc-500">
              {campaigns.filter(c => c.status === 'PENDING_APPROVAL').length} awaiting Admin clearance
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-200 overflow-x-auto scrollbar-hide gap-1">
          <button
            onClick={() => setActiveTab('CAMPAIGNS')}
            className={`py-3 px-5 text-xs font-bold transition-all flex items-center gap-2 border-b-2 shrink-0 ${
              activeTab === 'CAMPAIGNS'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-950'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Campaigns & Drops</span>
            <span className="text-zinc-400 font-mono text-[10px]">({campaigns.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('AD_STUDIO')}
            className={`py-3 px-5 text-xs font-bold transition-all flex items-center gap-2 border-b-2 shrink-0 ${
              activeTab === 'AD_STUDIO'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-950'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Copy & Ad Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('BROADCASTS')}
            className={`py-3 px-5 text-xs font-bold transition-all flex items-center gap-2 border-b-2 shrink-0 ${
              activeTab === 'BROADCASTS'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-950'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Broadcast Announcements</span>
            <span className="text-zinc-400 font-mono text-[10px]">({broadcasts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('INFLUENCERS')}
            className={`py-3 px-5 text-xs font-bold transition-all flex items-center gap-2 border-b-2 shrink-0 ${
              activeTab === 'INFLUENCERS'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-950'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Promo & Influencer Tracking</span>
          </button>

          <button
            onClick={() => setActiveTab('ASSETS')}
            className={`py-3 px-5 text-xs font-bold transition-all flex items-center gap-2 border-b-2 shrink-0 ${
              activeTab === 'ASSETS'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-950'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Lookbook Assets</span>
          </button>
        </div>

        {/* TAB 1: CAMPAIGNS & DROPS */}
        {activeTab === 'CAMPAIGNS' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Segmented Filter */}
              <div className="flex items-center gap-1 p-1 bg-zinc-200/60 rounded-2xl w-fit">
                {(['ALL', 'ACTIVE', 'PENDING_APPROVAL', 'PAUSED'] as const).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setCampaignFilter(filter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      campaignFilter === filter 
                        ? 'bg-white text-zinc-950 shadow-xs' 
                        : 'text-zinc-600 hover:text-zinc-950'
                    }`}
                  >
                    {filter === 'ALL' ? 'All' : filter === 'PENDING_APPROVAL' ? 'Pending Approval' : filter === 'ACTIVE' ? 'Live Active' : 'Paused'}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="py-3 px-5 rounded-2xl bg-zinc-950 hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Create Marketing Campaign</span>
              </button>
            </div>

            {/* Campaign Cards Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {filteredCampaigns.map((camp) => (
                <div 
                  key={camp.id}
                  className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs space-y-4 hover:border-zinc-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span>{camp.type}</span>
                        <span aria-hidden="true">·</span>
                        <span>{camp.channel}</span>
                        <span aria-hidden="true">·</span>
                        <span className={`font-bold ${
                          camp.status === 'ACTIVE' ? 'text-emerald-600' :
                          camp.status === 'PENDING_APPROVAL' ? 'text-amber-600' : 'text-zinc-500'
                        }`}>
                          {camp.status === 'PENDING_APPROVAL' ? 'Awaiting Admin Approval' : camp.status}
                        </span>
                      </div>
                      <h3 className="text-xl font-serif italic text-zinc-950">{camp.title}</h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {camp.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleToggleStatus(camp)}
                          className="p-2 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                          title="Pause Campaign"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      )}
                      {camp.status === 'PAUSED' && (
                        <button
                          onClick={() => handleToggleStatus(camp)}
                          className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                          title="Resume Campaign"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Campaign stats strip */}
                  <div className="grid grid-cols-4 gap-2 p-3 bg-zinc-50 rounded-2xl text-center text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">Budget</span>
                      <p className="font-mono font-bold text-zinc-900 mt-0.5">GH₵{camp.budget}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">Revenue</span>
                      <p className="font-mono font-bold text-emerald-600 mt-0.5">GH₵{camp.revenueGenerated || 0}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">Reach</span>
                      <p className="font-mono font-bold text-zinc-900 mt-0.5">{camp.impressions || 0}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">Orders</span>
                      <p className="font-mono font-bold text-zinc-900 mt-0.5">{camp.conversions || 0}</p>
                    </div>
                  </div>

                  {camp.discountCode && (
                    <div className="flex items-center justify-between text-xs py-2 px-3 bg-blue-50/60 border border-blue-100 rounded-xl">
                      <span className="text-blue-900 font-medium">Linked Promo Code</span>
                      <span className="font-mono font-bold text-blue-700">
                        {camp.discountCode} (-{camp.discountValue}{camp.discountType === 'PERCENT' ? '%' : ' GHC'})
                      </span>
                    </div>
                  )}

                  {camp.adminFeedback && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                      <p className="font-bold flex items-center gap-1.5 text-amber-800">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Administrator Feedback:</span>
                      </p>
                      <p className="text-[11px] leading-relaxed italic">{camp.adminFeedback}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-100 pt-3">
                    <span>Target: {camp.targetAudience}</span>
                    <span>Created by {camp.createdBy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: AI COPY & AD STUDIO */}
        {activeTab === 'AD_STUDIO' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form Column */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs space-y-5">
              <div>
                <h3 className="text-xl font-serif italic text-zinc-950">AI Creative Ad Studio</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Generate high-conversion captions and promotional copy tailored for Ghanaian fashion shoppers.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-zinc-500">Garment, Theme or Drop Name</label>
                  <input
                    type="text"
                    value={adTheme}
                    onChange={e => setAdTheme(e.target.value)}
                    placeholder="e.g. Accra Heatwave Oversized Linen Tee"
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-950 outline-none focus:border-zinc-950"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-zinc-500">Tone of Voice</label>
                  <select
                    value={adTone}
                    onChange={e => setAdTone(e.target.value as any)}
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-950 outline-none focus:border-zinc-950"
                  >
                    <option value="Hype">Hype & High Urgency (Drop Culture)</option>
                    <option value="Luxury">Quiet Luxury (Refined & Editorial)</option>
                    <option value="Urgent">Final Call (Scarcity & Low Stock)</option>
                    <option value="Cultural">Ghanaian Streetstyle & Identity</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-zinc-500">Platform Channel</label>
                  <select
                    value={adPlatform}
                    onChange={e => setAdPlatform(e.target.value)}
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-950 outline-none focus:border-zinc-950"
                  >
                    <option value="Instagram">Instagram (Feed & Story Caption)</option>
                    <option value="TikTok">TikTok (Hook & Visual Script)</option>
                    <option value="WhatsApp">WhatsApp Broadcast (Community Blast)</option>
                    <option value="SMS">SMS Notification (160 Chars)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-zinc-500">Linked Promo Code (Optional)</label>
                  <input
                    type="text"
                    value={adPromo}
                    onChange={e => setAdPromo(e.target.value.toUpperCase())}
                    placeholder="e.g. HEATWAVE20"
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono font-bold text-zinc-950 outline-none focus:border-zinc-950 uppercase"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleGenerateCopy}
                  disabled={isGeneratingCopy}
                  className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGeneratingCopy ? 'Synthesizing Copy...' : 'Generate 3 Ad Captions'}</span>
                </button>
              </div>
            </div>

            {/* Results Column */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                Generated Creatives ({generatedCaptions.length || 0})
              </h3>

              {generatedCaptions.length === 0 ? (
                <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-blue-500 mx-auto" />
                  <p className="text-sm font-bold text-zinc-800">Ready to Draft Ad Copy</p>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Select your garment theme and desired tone, then tap "Generate" to produce copy for Instagram, TikTok, and WhatsApp.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {generatedCaptions.map((caption, idx) => (
                    <div 
                      key={idx}
                      className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs space-y-4 hover:border-zinc-300 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                          Option {idx + 1} · {adTone} Style
                        </span>
                        <button
                          onClick={() => handleCopyText(caption, idx)}
                          className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-zinc-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedIndex === idx ? 'Copied' : 'Copy Text'}</span>
                        </button>
                      </div>

                      <pre className="text-xs text-zinc-800 font-sans whitespace-pre-wrap leading-relaxed bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                        {caption}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: BROADCAST ANNOUNCEMENTS */}
        {activeTab === 'BROADCASTS' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-serif italic text-zinc-950">Broadcast Announcements</h2>
                <p className="text-xs text-zinc-500">Dispatch push alerts, sticky promotional banners, and WhatsApp blast notices.</p>
              </div>

              <button
                onClick={() => setShowBroadcastModal(true)}
                className="py-3 px-5 rounded-2xl bg-zinc-950 hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Draft New Broadcast</span>
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {broadcasts.map((brd) => (
                <div key={brd.id} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs space-y-4 hover:border-zinc-300 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span>Channel: {brd.channel}</span>
                        <span aria-hidden="true">·</span>
                        <span className={`font-bold ${
                          brd.status === 'APPROVED' ? 'text-emerald-600' :
                          brd.status === 'PENDING_APPROVAL' ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {brd.status === 'PENDING_APPROVAL' ? 'Pending Admin Clearance' : brd.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-zinc-950 mt-1">{brd.title}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-700 leading-relaxed bg-zinc-50 p-4 rounded-2xl border border-zinc-100 font-sans">
                    {brd.message}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-100 pt-3">
                    <span>Audience: {brd.targetAudience}</span>
                    <span>Link: {brd.ctaUrl}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PROMO & INFLUENCER TRACKING */}
        {activeTab === 'INFLUENCERS' && (
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div>
              <h2 className="text-xl font-serif italic text-zinc-950">Active Marketing Promo Codes</h2>
              <p className="text-xs text-zinc-500">Track redemptions and attribution across campaigns and creator partnerships.</p>
            </div>

            <div className="divide-y divide-zinc-100">
              {[
                { code: 'HEATWAVE20', discount: '20% OFF', creator: 'Accra Drop Campaign', conversions: 94, revenue: 'GH₵18,800', status: 'ACTIVE' },
                { code: 'KFAMVIP', discount: 'GH₵25 OFF', creator: 'KFam Creator Challenge', conversions: 42, revenue: 'GH₵7,400', status: 'ACTIVE' },
                { code: 'VAULTDROP', discount: '15% OFF', creator: 'Instagram Story Ads', conversions: 18, revenue: 'GH₵3,950', status: 'ACTIVE' }
              ].map((promo, idx) => (
                <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-zinc-950">{promo.code}</span>
                      <span className="text-xs font-semibold text-emerald-600">({promo.discount})</span>
                    </div>
                    <p className="text-xs text-zinc-500">Assigned: {promo.creator}</p>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-right">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-bold">Redemptions</span>
                      <p className="font-mono font-bold text-zinc-900">{promo.conversions}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-bold">Revenue</span>
                      <p className="font-mono font-bold text-emerald-600">{promo.revenue}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: LOOKBOOK ASSETS */}
        {activeTab === 'ASSETS' && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { title: 'All-Terrain & Clog Lookbook', desc: 'High-res product photos and footwear cutouts for social stories.', tag: 'Lookbook Kit' },
              { title: 'Nationwide Delivery Banner Suite', desc: '1080x1920 Instagram Story and 1080x1080 WhatsApp status assets.', tag: 'Ad Kit' },
              { title: 'B.E.C Footwear Brand Identity', desc: 'Vector SVG logos, espresso & warm cream palette tokens, and typography.', tag: 'Brand Media' }
            ].map((asset, idx) => (
              <div key={idx} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs space-y-4 hover:border-zinc-300 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{asset.tag}</span>
                  <h3 className="text-lg font-bold text-zinc-950">{asset.title}</h3>
                  <p className="text-xs text-zinc-600 leading-relaxed">{asset.desc}</p>
                </div>

                <button
                  type="button"
                  onClick={() => toast.success(`Media package "${asset.title}" download triggered.`)}
                  className="w-full py-3 px-4 rounded-xl bg-zinc-950 hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Media Package</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL: CREATE MARKETING CAMPAIGN */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-zinc-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-serif italic text-zinc-950">New Marketing Campaign</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Design promotional drop or seasonal campaign. Submits to Admin for clearance.
                </p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-black hover:bg-zinc-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-500">Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Easter Y2K Streetwear Blast"
                  value={campaignForm.title}
                  onChange={e => setCampaignForm({ ...campaignForm, title: e.target.value })}
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-950 outline-none focus:border-zinc-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-zinc-500">Drop Type</label>
                  <select
                    value={campaignForm.type}
                    onChange={e => setCampaignForm({ ...campaignForm, type: e.target.value })}
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-950 outline-none focus:border-zinc-950"
                  >
                    <option value="DROP_LAUNCH">New Drop Launch</option>
                    <option value="FLASH_SALE">Flash Friday Sale</option>
                    <option value="INFLUENCER_PUSH">Creator Partnership</option>
                    <option value="COMMUNITY_VIRAL">KFam Viral Referral</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-zinc-500">Primary Channel</label>
                  <select
                    value={campaignForm.channel}
                    onChange={e => setCampaignForm({ ...campaignForm, channel: e.target.value })}
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-950 outline-none focus:border-zinc-950"
                  >
                    <option value="INSTAGRAM">Instagram (Reels & Feed)</option>
                    <option value="TIKTOK">TikTok (Creator Push)</option>
                    <option value="WHATSAPP">WhatsApp Community</option>
                    <option value="OMNICHANNEL">Omnichannel (Cross-Platform)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-zinc-500">Target Audience</label>
                  <select
                    value={campaignForm.targetAudience}
                    onChange={e => setCampaignForm({ ...campaignForm, targetAudience: e.target.value })}
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-950 outline-none focus:border-zinc-950"
                  >
                    <option value="STREETWEAR_FANS">Streetwear & Y2K Enthusiasts</option>
                    <option value="ALL">All Registered Shoppers</option>
                    <option value="VIP_SPENDERS">VIP Kraze Legend Tier</option>
                    <option value="DORMANT">Dormant Shoppers (Win-back)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-zinc-500">Ad Budget (GH₵)</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={campaignForm.budget}
                    onChange={e => setCampaignForm({ ...campaignForm, budget: Number(e.target.value) || 0 })}
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono font-bold text-zinc-950 outline-none focus:border-zinc-950"
                  />
                </div>
              </div>

              {/* Promo Code section */}
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-900">Linked Campaign Promo Discount</span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Admin Cap: Max {settings?.maxDiscountPercent || 30}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="CODE (e.g. Y2KVIBES)"
                      value={campaignForm.discountCode}
                      onChange={e => setCampaignForm({ ...campaignForm, discountCode: e.target.value.toUpperCase() })}
                      className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-mono font-bold text-zinc-950 outline-none focus:border-zinc-950 uppercase"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max={settings?.maxDiscountPercent || 30}
                      value={campaignForm.discountValue}
                      onChange={e => setCampaignForm({ ...campaignForm, discountValue: Number(e.target.value) || 0 })}
                      className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-mono font-bold text-zinc-950 outline-none focus:border-zinc-950"
                    />
                    <span className="text-xs font-bold text-zinc-600">%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-500">Campaign Notes & Strategy</label>
                <textarea
                  rows={2}
                  placeholder="Outline key creator deliverables and hashtags..."
                  value={campaignForm.notes}
                  onChange={e => setCampaignForm({ ...campaignForm, notes: e.target.value })}
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-950 outline-none focus:border-zinc-950 resize-none font-sans"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-zinc-950 hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Submit for Admin Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DRAFT BROADCAST */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-zinc-200">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-serif italic text-zinc-950">Draft Broadcast Push</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Dispatches customer notification after Admin clearance.</p>
              </div>
              <button 
                onClick={() => setShowBroadcastModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-black hover:bg-zinc-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBroadcast} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-500">Broadcast Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flash Drop: Cyber Core Series Live"
                  value={broadcastForm.title}
                  onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-950 outline-none focus:border-zinc-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-zinc-500">Channel</label>
                  <select
                    value={broadcastForm.channel}
                    onChange={e => setBroadcastForm({ ...broadcastForm, channel: e.target.value })}
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-950 outline-none focus:border-zinc-950"
                  >
                    <option value="IN_APP">In-App Notification Center</option>
                    <option value="WHATSAPP_COMMUNITY">WhatsApp VIP Broadcast</option>
                    <option value="STICKY_BANNER">Top Sticky Banner</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-zinc-500">Audience</label>
                  <select
                    value={broadcastForm.targetAudience}
                    onChange={e => setBroadcastForm({ ...broadcastForm, targetAudience: e.target.value })}
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-950 outline-none focus:border-zinc-950"
                  >
                    <option value="ALL">All App Users</option>
                    <option value="ACTIVE_RECENT">Active within 7 Days</option>
                    <option value="SAVED_GARMENTS">Users with Saved Items</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-500">Broadcast Message</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Craft your announcement copy..."
                  value={broadcastForm.message}
                  onChange={e => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-950 outline-none focus:border-zinc-950 resize-none font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-500">CTA Destination Route</label>
                <input
                  type="text"
                  placeholder="/shop or /kits"
                  value={broadcastForm.ctaUrl}
                  onChange={e => setBroadcastForm({ ...broadcastForm, ctaUrl: e.target.value })}
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono text-zinc-950 outline-none focus:border-zinc-950"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="flex-1 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-zinc-950 hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Submit for Clearance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingPortal;
