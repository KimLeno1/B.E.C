import React, { useState, useEffect } from 'react';
import { Product, ViewState } from '../types';
import { databaseService } from '../services/databaseService';
import { Sparkles, ArrowLeft, Send, CheckCircle2, Clock, XCircle, ChevronRight, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CustomRequestsViewProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  onNavigate: (view: ViewState) => void;
  userId: string;
}

interface CustomRequest {
  id: string;
  userId: string;
  userHandle: string;
  email: string;
  itemName: string;
  category: string;
  budget: number;
  description: string;
  referenceImage: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PRODUCTION' | 'SHIPPED' | 'COMPLETED';
  timestamp: string;
  adminNotes?: string;
}

const CustomRequestsView: React.FC<CustomRequestsViewProps> = ({ 
  products, 
  onProductClick, 
  onNavigate,
  userId
}) => {
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [referenceImage, setReferenceImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const customizableProducts = products.filter(p => p.isCustom);

  useEffect(() => {
    fetchRequests();
    const userPhone = localStorage.getItem('cc-user-phone') || '';
    if (userPhone) {
      setEmail(userPhone);
    }
  }, [userId]);

  const fetchRequests = async () => {
    if (!userId || userId === 'guest') return;
    setIsLoading(true);
    try {
      const list = await databaseService.getCustomRequests();
      setRequests(list);
    } catch (err) {
      console.error('Error fetching custom requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName) return;

    setIsSubmitting(true);
    try {
      const handle = localStorage.getItem('cc-user-handle') || 'Guest';
      const uid = localStorage.getItem('cc-user-id') || userId || 'guest';

      await databaseService.submitCustomRequest({
        userId: uid,
        userHandle: handle,
        email,
        itemName,
        category: category || 'All-terrain clogs',
        budget: budget ? parseFloat(budget) : 0,
        description,
        referenceImage
      });

      setSuccessMessage('Your custom footwear request has been submitted! Our B.E.C Footwear workshop will reach out on WhatsApp/call shortly.');
      
      setItemName('');
      setCategory('');
      setBudget('');
      setDescription('');
      setReferenceImage('');
      
      fetchRequests();

      setTimeout(() => {
        setShowFormModal(false);
        setSuccessMessage('');
      }, 3500);

    } catch (err) {
      console.error('Failed to submit custom request:', err);
      toast.error('Failed to submit custom footwear request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'border-green-500/50 bg-green-500/10 text-green-700';
      case 'REJECTED':
        return 'border-red-500/50 bg-red-500/10 text-red-700';
      case 'IN_PRODUCTION':
        return 'border-[#8C532B]/50 bg-[#8C532B]/10 text-[#8C532B]';
      case 'SHIPPED':
        return 'border-[#4A2B18]/50 bg-[#4A2B18]/10 text-[#4A2B18]';
      case 'COMPLETED':
        return 'border-emerald-500 bg-emerald-500/10 text-emerald-700';
      default:
        return 'border-amber-500/50 bg-amber-500/10 text-amber-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'COMPLETED':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'REJECTED':
        return <XCircle className="w-3.5 h-3.5" />;
      default:
        return <Clock className="w-3.5 h-3.5 animate-pulse" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF4EC] text-[#261409] pb-32 animate-in fade-in duration-500">
      {/* Top Banner and Navigation */}
      <header className="py-4 sm:py-6 md:py-8 px-4 sm:px-6 md:px-20 border-b border-[#EAD8C0] bg-gradient-to-b from-[#4A2B18]/8 to-transparent">
        <div className="max-w-7xl mx-auto space-y-6">
          <button 
            onClick={() => onNavigate(ViewState.LOBBY)}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#5A331C] hover:text-[#4A2B18] transition-all cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Store
          </button>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="px-2.5 py-1 bg-[#4A2B18] text-[8px] font-black text-[#FAF4EC] uppercase tracking-[0.4em] rounded shadow-sm flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> B.E.C Special Orders
              </div>
              <div className="h-px w-20 bg-[#EAD8C0]"></div>
            </div>

            <h1 className="text-4xl md:text-7xl font-serif italic tracking-tighter leading-none text-[#261409]">
              Custom <span className="text-[#4A2B18] not-italic font-sans font-black">Footwear</span>
            </h1>

            <p className="text-[#5A331C] text-xs md:text-sm max-w-2xl leading-relaxed">
              Looking for a specific clog colorway, studded slide finish, or EU size 38–45 sourcing request? Submit a special order to our Accra workshop—nationwide delivery across Ghana.
            </p>

            <div className="pt-4">
              <button
                onClick={() => setShowFormModal(true)}
                className="px-6 py-3 bg-[#4A2B18] text-[#FAF4EC] text-[10px] font-black uppercase tracking-widest hover:bg-[#3B2010] hover:scale-105 transition-all duration-300 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" /> Request Custom Pair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-20 py-6 sm:py-8 space-y-12">
        {/* Section 1: Customizable Base items */}
        <section className="space-y-6">
          <div className="flex justify-between items-baseline border-b border-[#EAD8C0] pb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-serif italic text-[#261409]">Customizable Footwear</h2>
              <p className="text-[9px] text-[#8C532B] font-black tracking-widest uppercase mt-1">Select a base pair below to request custom colors or EU sizing</p>
            </div>
          </div>

          {customizableProducts.length === 0 ? (
            <div className="text-center py-16 bg-[#F5EAD8] border border-[#EAD8C0] rounded-3xl p-10">
              <HelpCircle className="w-10 h-10 mx-auto text-[#8C532B] mb-3" />
              <p className="text-sm font-serif italic text-[#3B2010]">No customizable pairs listed right now.</p>
              <p className="text-[9px] text-[#8C532B] font-black uppercase tracking-widest mt-1">Use &ldquo;Request Custom Pair&rdquo; above to source a clog, slide, or sandal style!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {customizableProducts.map(product => (
                <div 
                  key={product.id}
                  onClick={() => onProductClick(product)}
                  className="group bg-white border border-[#EAD8C0] rounded-3xl overflow-hidden cursor-pointer hover:border-[#4A2B18] transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#F5EAD8]">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 px-2.5 py-1 bg-[#FAF4EC]/95 rounded-full text-[8px] font-black text-[#4A2B18] uppercase tracking-widest border border-[#EAD8C0] shadow-sm">
                      Custom Ready
                    </div>
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="text-[9px] font-black text-[#8C532B] uppercase tracking-widest">{product.category}</div>
                    <h3 className="text-xs font-bold text-[#261409] group-hover:text-[#4A2B18] transition-colors">{product.name}</h3>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs font-mono font-black text-[#261409]">GH₵ {product.price.toFixed(2)}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-[#4A2B18] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Customize <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: User requests history */}
        {userId && userId !== 'guest' && (
          <section className="space-y-6">
            <div className="border-b border-[#EAD8C0] pb-4">
              <h2 className="text-xl md:text-2xl font-serif italic text-[#261409]">Your Special Order Requests</h2>
              <p className="text-[9px] text-[#8C532B] font-black tracking-widest uppercase mt-1">Track your custom footwear inquiries here</p>
            </div>

            {isLoading ? (
              <div className="grid gap-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-[#F5EAD8] p-6 rounded-3xl border border-[#EAD8C0] h-32"></div>
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-16 bg-[#F5EAD8] border border-[#EAD8C0] rounded-3xl p-10 text-[#5A331C]">
                <Clock className="w-10 h-10 mx-auto text-[#8C532B] mb-3" />
                <p className="text-sm font-serif italic text-[#261409]">Your request board is empty.</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-[#8C532B] mt-1">Any special pair requests you submit will appear here.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {requests.map(req => (
                  <div 
                    key={req.id}
                    className="bg-white border border-[#EAD8C0] hover:border-[#8C532B] p-6 rounded-3xl flex flex-col md:flex-row gap-6 justify-between transition-all shadow-xs"
                  >
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[9px] font-mono text-[#8C532B]">{new Date(req.timestamp).toLocaleDateString()}</span>
                        <span className="text-[8px] bg-[#F5EAD8] px-2 py-0.5 rounded text-[#4A2B18] font-black uppercase tracking-widest">{req.category}</span>
                        {req.budget > 0 && (
                          <span className="text-[9px] font-mono font-black text-[#4A2B18]">Target Budget: GH₵ {req.budget.toFixed(2)}</span>
                        )}
                        <span className={`text-[8px] font-black uppercase tracking-widest border px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${getStatusStyle(req.status)}`}>
                          {getStatusIcon(req.status)}
                          {req.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-[#261409]">{req.itemName}</h4>
                        <p className="text-xs text-[#5A331C] mt-1 font-mono whitespace-pre-wrap leading-relaxed">{req.description}</p>
                      </div>

                      {req.adminNotes && (
                        <div className="border-t border-[#EAD8C0] pt-3 mt-3">
                          <div className="text-[8px] font-black uppercase tracking-widest text-[#4A2B18] mb-1">B.E.C Workshop Response</div>
                          <p className="text-xs italic text-[#3B2010] pl-3 border-l-2 border-[#4A2B18]/40">{req.adminNotes}</p>
                        </div>
                      )}
                    </div>

                    {req.referenceImage && (
                      <div className="w-full md:w-28 h-28 shrink-0 rounded-2xl overflow-hidden border border-[#EAD8C0] bg-[#F5EAD8]">
                        <img 
                          src={req.referenceImage} 
                          alt="Footwear Reference"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Form Dialog Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E0F06]/65 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#FAF4EC] border border-[#EAD8C0] w-full max-w-lg rounded-[2.5rem] shadow-2xl p-6 md:p-8 space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-xl font-serif italic text-[#261409]">Custom Footwear Request Form</h3>
                <p className="text-[8px] text-[#8C532B] font-black tracking-widest uppercase">Tell us the clog, slide, sandal, or slipper pair you want us to source</p>
              </div>
              <button 
                onClick={() => setShowFormModal(false)}
                className="w-8 h-8 rounded-full bg-[#F5EAD8] hover:bg-[#EAD8C0] text-[#4A2B18] flex items-center justify-center transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {successMessage ? (
              <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-2xl">
                  ✓
                </div>
                <h4 className="text-md font-bold text-[#261409]">Request Submitted!</h4>
                <p className="text-xs text-[#5A331C] max-w-sm mx-auto leading-relaxed">{successMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-[#5A331C] uppercase tracking-widest pl-1">Footwear Style / Pair Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Black Studded Slides or Khaki All-Terrain Clogs" 
                      value={itemName}
                      onChange={e => setItemName(e.target.value)}
                      className="w-full bg-white border border-[#EAD8C0] px-4 py-3 text-xs text-[#261409] focus:border-[#4A2B18] outline-none rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-[#5A331C] uppercase tracking-widest pl-1">Collection *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Clogs, Slides, Sandals" 
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full bg-white border border-[#EAD8C0] px-4 py-3 text-xs text-[#261409] focus:border-[#4A2B18] outline-none rounded-xl"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-[#5A331C] uppercase tracking-widest pl-1">Target Budget (GH₵)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 320" 
                        value={budget}
                        onChange={e => setBudget(e.target.value)}
                        className="w-full bg-white border border-[#EAD8C0] px-4 py-3 text-xs text-[#261409] focus:border-[#4A2B18] outline-none rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-[#5A331C] uppercase tracking-widest pl-1">Your WhatsApp / Phone Number *</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="e.g. 0244122075 or 0260584440" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-white border border-[#EAD8C0] px-4 py-3 text-xs text-[#261409] focus:border-[#4A2B18] outline-none rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-[#5A331C] uppercase tracking-widest pl-1">Upload Reference Picture (Optional)</label>
                    <div className="flex flex-col gap-2">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          setIsUploading(true);
                          setUploadError('');
                          try {
                            const res = await databaseService.uploadFeedImage(file);
                            if (res && res.url) {
                              setReferenceImage(res.url);
                            } else {
                              setUploadError('Failed to upload picture. Please try again.');
                            }
                          } catch (err) {
                            console.error('Error uploading picture:', err);
                            setUploadError('Failed to upload. Make sure it is an image file.');
                          } finally {
                            setIsUploading(false);
                          }
                        }}
                        className="w-full bg-white border border-[#EAD8C0] px-4 py-3 text-xs text-[#3B2010] focus:border-[#4A2B18] outline-none rounded-xl file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-[#4A2B18]/10 file:text-[#4A2B18] hover:file:bg-[#4A2B18]/20"
                      />
                      {isUploading && <p className="text-[10px] text-[#8C532B] animate-pulse">Uploading your picture...</p>}
                      {uploadError && <p className="text-[10px] text-red-600">{uploadError}</p>}
                      {referenceImage && (
                        <div className="mt-2 relative w-20 h-20 rounded-xl overflow-hidden border border-[#EAD8C0] bg-[#F5EAD8]">
                          <img src={referenceImage} alt="Uploaded reference" className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => setReferenceImage('')}
                            className="absolute top-1 right-1 bg-[#261409]/80 hover:bg-[#261409] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]"
                            title="Remove picture"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-[#5A331C] uppercase tracking-widest pl-1">EU Size (38–45), Color & Notes *</label>
                    <textarea 
                      required
                      rows={4}
                      placeholder="Specify EU size (e.g. EU 42), preferred color, strap style, and delivery region in Ghana." 
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full bg-white border border-[#EAD8C0] p-4 text-xs text-[#261409] focus:border-[#4A2B18] outline-none rounded-xl font-mono leading-relaxed"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowFormModal(false)}
                    className="px-5 py-2.5 bg-[#F5EAD8] hover:bg-[#EAD8C0] text-[#3B2010] text-[9px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#4A2B18] text-[#FAF4EC] hover:bg-[#3B2010] text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" /> {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomRequestsView;
