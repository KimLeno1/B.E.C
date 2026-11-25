import React, { useState, useEffect } from 'react';
import { Product, ViewState, RankBenefits } from '../types';
import ProductCard from './ProductCard';
import { toast } from 'sonner';
import {
  Heart,
  ShoppingCart,
  Trash2,
  FolderPlus,
  Edit3,
  Search,
  ArrowRight,
  Check,
  X,
  Folder,
  Tag
} from 'lucide-react';

interface WishlistFolder {
  id: string;
  name: string;
  productIds: string[];
  colorIndex?: number;
}

const FOLDER_COLORS = [
  { name: 'Espresso', text: 'text-[#4A2B18]', bg: 'bg-[#F5EAD8]', border: 'border-[#EAD8C0]', bullet: 'bg-[#4A2B18]', hoverBg: 'hover:bg-[#4A2B18]' },
  { name: 'Saddle', text: 'text-[#8C532B]', bg: 'bg-[#FAF4EC]', border: 'border-[#E5C9A8]', bullet: 'bg-[#8C532B]', hoverBg: 'hover:bg-[#8C532B]' },
  { name: 'Emerald', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', bullet: 'bg-emerald-600', hoverBg: 'hover:bg-emerald-600' },
  { name: 'Amber Gold', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', bullet: 'bg-amber-600', hoverBg: 'hover:bg-amber-600' },
  { name: 'Terracotta', text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', bullet: 'bg-rose-600', hoverBg: 'hover:bg-rose-600' },
  { name: 'Walnut', text: 'text-[#5A331C]', bg: 'bg-[#EFE2CF]', border: 'border-[#D8BFA0]', bullet: 'bg-[#5A331C]', hoverBg: 'hover:bg-[#5A331C]' },
];

const getFolderColor = (index: number) => {
  return FOLDER_COLORS[index % FOLDER_COLORS.length];
};

interface WishlistViewProps {
  products: Product[];
  wishlistIds: string[];
  onAddToCart: (p: Product, size?: string, colorVariant?: { main: string; secondary: string }) => void;
  onToggleWishlist: (p: Product) => void;
  onProductClick: (p: Product) => void;
  onNavigate?: (view: ViewState) => void;
  rank: RankBenefits;
  limitedOfferEnd?: number | null;
  onToggleCompare?: (product: Product) => void;
  comparisonList?: Product[];
  onQuickBuy?: (product: Product) => void;
}

const WishlistView: React.FC<WishlistViewProps> = ({
  products,
  wishlistIds,
  onAddToCart,
  onToggleWishlist,
  onProductClick,
  onNavigate,
  rank,
  limitedOfferEnd,
  onToggleCompare,
  comparisonList = [],
  onQuickBuy
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHandle, setSearchHandle] = useState('');

  // Preserve localStorage key so existing saved folders remain intact
  const [folders, setFolders] = useState<WishlistFolder[]>(() => {
    try {
      const saved = localStorage.getItem('closet-kraze-wishlist-folders');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [activeFolderId, setActiveFolderId] = useState<string>('all');
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [organizingProductId, setOrganizingProductId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [confirmDeleteFolderId, setConfirmDeleteFolderId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('closet-kraze-wishlist-folders', JSON.stringify(folders));
  }, [folders]);

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const newFolder: WishlistFolder = {
      id: `folder-${Date.now()}`,
      name: newFolderName.trim(),
      productIds: [],
      colorIndex: selectedColorIndex
    };
    setFolders([...folders, newFolder]);
    setNewFolderName('');
    setSelectedColorIndex(0);
    setShowCreateForm(false);
    toast.success(`Collection "${newFolder.name}" created!`);
  };

  const handleDeleteFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;
    if (confirmDeleteFolderId !== folderId) {
      setConfirmDeleteFolderId(folderId);
      setTimeout(() => setConfirmDeleteFolderId(prev => (prev === folderId ? null : prev)), 4000);
      return;
    }
    setFolders(folders.filter(f => f.id !== folderId));
    if (activeFolderId === folderId) {
      setActiveFolderId('all');
    }
    setConfirmDeleteFolderId(null);
    toast.success(`Collection "${folder.name}" removed.`);
  };

  const handleRenameFolder = (folderId: string) => {
    if (!editName.trim()) return;
    setFolders(folders.map(f => f.id === folderId ? { ...f, name: editName.trim() } : f));
    setEditingFolderId(null);
    setEditName('');
    toast.success('Collection renamed!');
  };

  const handleToggleItemInFolder = (productId: string, folderId: string) => {
    setFolders(folders.map(f => {
      if (f.id === folderId) {
        const exists = f.productIds.includes(productId);
        const updatedIds = exists
          ? f.productIds.filter(id => id !== productId)
          : [...f.productIds, productId];
        return { ...f, productIds: updatedIds };
      }
      return f;
    }));
  };

  const wishlistItems = products.filter(p => wishlistIds.includes(p.id));
  const activeFolder = folders.find(f => f.id === activeFolderId);

  let filteredItems = wishlistItems.filter(p => {
    if (activeFolderId === 'all') return true;
    return activeFolder ? activeFolder.productIds.includes(p.id) : false;
  });

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filteredItems = filteredItems.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
    );
  }

  const handleMoveAllToCart = () => {
    if (filteredItems.length === 0) return;
    filteredItems.forEach(p => {
      onAddToCart(p);
    });
    toast.success(`Moved ${filteredItems.length} pair${filteredItems.length > 1 ? 's' : ''} to your bag!`);
  };

  const handleClearAllWishlist = () => {
    if (filteredItems.length === 0) return;
    if (!confirmClearAll) {
      setConfirmClearAll(true);
      setTimeout(() => setConfirmClearAll(false), 4000);
      return;
    }
    filteredItems.forEach(p => {
      onToggleWishlist(p);
    });
    setConfirmClearAll(false);
    toast.success('Pairs removed from wishlist.');
  };

  return (
    <div className="px-4 py-6 sm:px-6 md:px-8 space-y-8 animate-in fade-in duration-500 pb-40 max-w-7xl mx-auto text-[#3B2010]">

      {/* Main Header Banner */}
      <header className="bg-gradient-to-br from-[#FAF4EC] via-[#F5EAD8]/80 to-[#FAF4EC] border border-[#EAD8C0] rounded-[2rem] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8C532B] animate-pulse"></span>
              <span className="text-[10px] font-black text-[#8C532B] uppercase tracking-widest font-mono">
                {rank.tier} Member • B.E.C Footwear
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif italic text-[#3B2010] tracking-tight flex items-center gap-3">
              My Saved <span className="not-italic font-sans font-black text-[#4A2B18] uppercase">Pairs</span>
            </h1>

            <p className="text-[#5A331C]/80 text-xs sm:text-sm font-medium leading-relaxed">
              Keep track of your favorite clogs, slides, sandals, and slippers, organize custom shoe collections, or move your saved pairs straight to your bag for Nationwide Delivery.
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {filteredItems.length > 0 && (
              <>
                <button
                  onClick={handleMoveAllToCart}
                  className="flex-1 md:flex-initial px-5 py-3 bg-[#4A2B18] hover:bg-[#3B2010] text-[#FAF4EC] rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Move All to Bag</span>
                </button>

                <button
                  onClick={handleClearAllWishlist}
                  className={`px-4 py-3 border rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                    confirmClearAll
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-[#FAF4EC] hover:bg-rose-50 text-rose-600 border-rose-200'
                  }`}
                  title="Clear items"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{confirmClearAll ? 'Confirm Clear?' : 'Clear'}</span>
                </button>
              </>
            )}

            {onNavigate && (
              <button
                onClick={() => onNavigate(ViewState.LOBBY)}
                className="px-5 py-3 bg-[#FAF4EC] border border-[#EAD8C0] hover:border-[#4A2B18] text-[#3B2010] rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <span>Browse Footwear</span>
                <ArrowRight className="w-4 h-4 text-[#8C532B]" />
              </button>
            )}
          </div>
        </div>

        {/* Live Search Bar */}
        <div className="pt-4 border-t border-[#EAD8C0] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#8C532B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter saved footwear..."
              className="w-full bg-white border border-[#EAD8C0] rounded-full pl-9 pr-4 py-2 text-xs font-medium text-[#3B2010] focus:border-[#4A2B18] focus:outline-none shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C532B] hover:text-[#3B2010] text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {rank.canSeeOtherWishlists && (
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-[10px] font-bold text-[#5A331C] uppercase tracking-wider hidden lg:inline">Find Friend&apos;s Pairs:</span>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={searchHandle}
                  onChange={e => setSearchHandle(e.target.value)}
                  placeholder="@handle or user ID"
                  className="bg-white border border-[#EAD8C0] px-3 py-1.5 rounded-full text-xs text-[#3B2010] focus:border-[#4A2B18] outline-none w-36 font-mono"
                />
                <button
                  onClick={() => {
                    if (searchHandle.trim()) {
                      toast.info(`Viewing public wishlist for ${searchHandle}`);
                    }
                  }}
                  className="bg-[#4A2B18] text-[#FAF4EC] px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider hover:bg-[#3B2010] transition-all cursor-pointer"
                >
                  Inspect
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Wishlist Collections Hub */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#EAD8C0] pb-3">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-[#8C532B]" />
            <h2 className="text-sm font-black uppercase tracking-wider text-[#3B2010]">My Shoe Collections</h2>
            <span className="text-xs text-[#8C532B] font-bold">({folders.length + 1})</span>
          </div>

          <button
            onClick={() => { setShowCreateForm(!showCreateForm); setEditingFolderId(null); }}
            className="px-4 py-2 bg-[#F5EAD8] hover:bg-[#EAD8C0]/70 text-[#4A2B18] border border-[#EAD8C0] text-xs font-black uppercase tracking-wider rounded-full transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Collection</span>
          </button>
        </div>

        {/* Create Collection Inline Form */}
        {showCreateForm && (
          <form onSubmit={handleCreateFolder} className="p-5 bg-[#FAF4EC] rounded-2xl border border-[#EAD8C0] shadow-md space-y-4 animate-in slide-in-from-top-3 duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#3B2010]">Create New Collection</span>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="text-[#8C532B] hover:text-[#3B2010]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                placeholder="Collection Name (e.g. Weekend Clogs, Vacation Slides)"
                className="flex-1 bg-white border border-[#EAD8C0] px-4 py-2.5 rounded-xl text-xs font-bold text-[#3B2010] focus:border-[#4A2B18] outline-none"
                maxLength={24}
                required
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#4A2B18] text-[#FAF4EC] text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#3B2010] transition-all cursor-pointer shadow-sm"
              >
                Save Collection
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A331C] block">Select Color Tag</span>
              <div className="flex gap-3">
                {FOLDER_COLORS.map((col, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedColorIndex(idx)}
                    className={`w-7 h-7 rounded-full ${col.bullet} transition-all relative flex items-center justify-center ${
                      selectedColorIndex === idx
                        ? 'ring-2 ring-offset-2 ring-[#4A2B18] scale-110 shadow-md'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                    title={col.name}
                  >
                    {selectedColorIndex === idx && <Check className="w-4 h-4 text-white stroke-[3px]" />}
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}

        {/* Collections Tabs Grid */}
        <div className="flex flex-wrap gap-2.5 pt-1">
          <button
            onClick={() => { setActiveFolderId('all'); setEditingFolderId(null); }}
            className={`px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border shadow-xs ${
              activeFolderId === 'all'
                ? 'bg-[#4A2B18] text-[#FAF4EC] border-[#4A2B18] shadow-md'
                : 'bg-[#FAF4EC] hover:bg-[#F5EAD8] text-[#3B2010] border-[#EAD8C0]'
            }`}
          >
            <span>All Saved</span>
            <span className={`px-2 py-0.5 text-[10px] rounded-full font-black ${
              activeFolderId === 'all' ? 'bg-white/20 text-[#FAF4EC]' : 'bg-[#F5EAD8] text-[#5A331C]'
            }`}>
              {wishlistItems.length}
            </span>
          </button>

          {folders.map((f, idx) => {
            const folderColor = getFolderColor(f.colorIndex !== undefined ? f.colorIndex : idx);
            const isActive = activeFolderId === f.id;
            const itemCount = f.productIds.filter(id => wishlistIds.includes(id)).length;

            return (
              <div key={f.id} className="relative group flex items-center">
                <button
                  onClick={() => { setActiveFolderId(f.id); setEditingFolderId(null); }}
                  className={`pl-4 pr-12 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border ${
                    isActive
                      ? `${folderColor.bg} ${folderColor.text} ${folderColor.border} ring-1 ${folderColor.border} shadow-sm`
                      : 'bg-[#FAF4EC] hover:bg-[#F5EAD8] text-[#3B2010] border-[#EAD8C0]'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${folderColor.bullet}`} />
                  <span>{f.name}</span>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-black ${
                    isActive ? 'bg-black/10' : 'bg-[#F5EAD8] text-[#5A331C]'
                  }`}>
                    {itemCount}
                  </span>
                </button>

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingFolderId(f.id); setEditName(f.name); }}
                    className="p-1 text-[#8C532B] hover:text-[#4A2B18] rounded-full hover:bg-[#F5EAD8] transition-colors"
                    title="Rename Collection"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteFolder(f.id); }}
                    className={`p-1 rounded-full transition-colors ${
                      confirmDeleteFolderId === f.id
                        ? 'text-white bg-rose-600'
                        : 'text-[#8C532B] hover:text-rose-600 hover:bg-rose-50'
                    }`}
                    title={confirmDeleteFolderId === f.id ? 'Click again to delete' : 'Delete Collection'}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rename Collection Dialog */}
        {editingFolderId && (
          <div className="flex gap-2 max-w-md p-3 bg-[#FAF4EC] rounded-xl border border-[#EAD8C0] shadow-md animate-in slide-in-from-top-2 duration-150">
            <input
              type="text"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="flex-1 bg-white border border-[#EAD8C0] px-3 py-1.5 rounded-lg text-xs font-bold text-[#3B2010] focus:border-[#4A2B18] outline-none"
              maxLength={24}
              required
            />
            <button
              onClick={() => handleRenameFolder(editingFolderId)}
              className="px-4 py-1.5 bg-[#4A2B18] text-[#FAF4EC] text-xs font-black uppercase tracking-wider rounded-lg hover:bg-[#3B2010] transition-all cursor-pointer"
            >
              Save
            </button>
            <button
              onClick={() => setEditingFolderId(null)}
              className="px-3 py-1.5 bg-[#F5EAD8] text-[#3B2010] text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#EAD8C0] transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Main Wishlist Products Grid */}
      {wishlistItems.length === 0 ? (
        <div className="py-24 px-4 text-center flex flex-col items-center justify-center gap-6 bg-[#FAF4EC] rounded-[2.5rem] border border-dashed border-[#EAD8C0] shadow-xs">
          <div className="w-20 h-20 rounded-full bg-[#F5EAD8] border border-[#EAD8C0] flex items-center justify-center text-[#8C532B] shadow-inner">
            <Heart className="w-10 h-10 stroke-[1.5px] fill-[#8C532B]/15 text-[#8C532B]" />
          </div>

          <div className="space-y-2 max-w-md">
            <h3 className="text-xl font-bold text-[#3B2010]">Your Wishlist is Empty</h3>
            <p className="text-[#5A331C]/80 text-xs font-medium leading-relaxed">
              Save your favorite all-terrain clogs, studded slides, classic slides, and sandals while browsing B.E.C Footwear by tapping the heart icon.
            </p>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate(ViewState.LOBBY)}
              className="px-6 py-3 bg-[#4A2B18] hover:bg-[#3B2010] text-[#FAF4EC] font-black text-xs uppercase tracking-wider rounded-full shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>Explore Footwear</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-4 bg-[#FAF4EC] rounded-[2rem] border border-dashed border-[#EAD8C0]">
          <Folder className="w-12 h-12 text-[#D8BFA0]" />
          <div className="space-y-1">
            <h4 className="text-base font-bold text-[#3B2010]">No pairs found</h4>
            <p className="text-[#5A331C]/80 text-xs">
              {searchQuery ? `No footwear matching "${searchQuery}"` : 'No pairs categorized in this collection yet.'}
            </p>
          </div>
          <button
            onClick={() => { setActiveFolderId('all'); setSearchQuery(''); }}
            className="px-4 py-2 bg-[#F5EAD8] hover:bg-[#EAD8C0] text-[#3B2010] rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            View All Saved Pairs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(p => (
            <div key={p.id} className="flex flex-col gap-3 group relative bg-[#FAF4EC] border border-[#EAD8C0] rounded-[2rem] p-3 shadow-xs hover:shadow-md transition-shadow">
              <ProductCard
                product={p}
                isWishlisted={true}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                onClick={onProductClick}
                saleTimerEnd={p.price < p.originalPrice ? limitedOfferEnd : null}
                onToggleCompare={onToggleCompare}
                isComparing={comparisonList.some(cp => cp.id === p.id)}
                onQuickBuy={onQuickBuy}
              />

              {/* Product Wishlist Quick Actions Bar */}
              <div className="pt-2 border-t border-[#EAD8C0] flex items-center justify-between gap-2 px-1">
                <button
                  onClick={() => {
                    onAddToCart(p);
                    toast.success(`Added ${p.name} to bag!`);
                  }}
                  className="flex-1 py-2 px-3 bg-[#4A2B18] hover:bg-[#3B2010] text-[#FAF4EC] rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Move to Bag</span>
                </button>

                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOrganizingProductId(organizingProductId === p.id ? null : p.id);
                    }}
                    className="px-2.5 py-2 bg-[#F5EAD8] hover:bg-[#EAD8C0] text-[#4A2B18] border border-[#EAD8C0] text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1"
                    title="Organize in Collection"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Collection</span>
                  </button>

                  {organizingProductId === p.id && (
                    <div className="absolute right-0 bottom-full mb-2 w-52 bg-[#FAF4EC] border border-[#EAD8C0] rounded-2xl p-3 shadow-2xl z-50 space-y-2 animate-in fade-in zoom-in-95 duration-150 text-left">
                      <div className="flex items-center justify-between text-[10px] font-black text-[#5A331C] uppercase tracking-wider pb-1.5 border-b border-[#EAD8C0]">
                        <span>Add to Collection</span>
                        <button onClick={() => setOrganizingProductId(null)} className="text-[#8C532B] hover:text-[#3B2010]">✕</button>
                      </div>

                      {folders.length === 0 ? (
                        <div className="text-[#5A331C]/80 text-[10px] italic py-2 text-center">
                          No custom collections created yet. Create one at the top of your Wishlist!
                        </div>
                      ) : (
                        <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                          {folders.map(f => {
                            const isMember = f.productIds.includes(p.id);
                            return (
                              <button
                                key={f.id}
                                onClick={() => handleToggleItemInFolder(p.id, f.id)}
                                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                                  isMember
                                    ? 'bg-[#F5EAD8] text-[#4A2B18] font-black'
                                    : 'hover:bg-white text-[#3B2010]'
                                }`}
                              >
                                <span>{f.name}</span>
                                {isMember && <Check className="w-3.5 h-3.5 text-[#4A2B18]" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      <button
                        onClick={() => setOrganizingProductId(null)}
                        className="w-full text-center py-1.5 bg-[#4A2B18] text-[#FAF4EC] text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-[#3B2010] transition-all cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    onToggleWishlist(p);
                    toast.info(`Removed ${p.name} from wishlist.`);
                  }}
                  className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-all cursor-pointer"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistView;
