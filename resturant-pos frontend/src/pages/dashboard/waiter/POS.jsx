import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus,
  ChefHat,
  CreditCard,
  History,
  Tag,
  Clock,
  MoreVertical,
  X,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Users,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Printer,
  Bed
} from 'lucide-react';
import { cn } from "../../../utils/cn";
import { getImageUrl } from "../../../utils/imageUtils";
import { useAuth } from "../../../context/AuthContext";
import { useMenu } from "../../../context/MenuContext";
import { useHospitality } from "../../../context/HospitalityContext";
import { useOrders } from "../../../context/OrdersContext";
import printContent from '../../../utils/printUtil';

const getCategoryStyles = (categoryName, dbColor = null) => {
  const name = categoryName.trim().toLowerCase();
  if (dbColor) {
    const lowerColor = dbColor.toLowerCase();
    if (lowerColor === '#fff5d7') return { bg: 'bg-[#FFF5D7]', text: 'text-[#9A7D0A]', border: 'border-[#FFEBB3]' };
    if (lowerColor === '#e7f4ff') return { bg: 'bg-[#E7F4FF]', text: 'text-[#2978B5]', border: 'border-[#CDE5FF]' };
    if (lowerColor === '#eafbf3') return { bg: 'bg-[#EAFBF3]', text: 'text-[#1E7F55]', border: 'border-[#CFF5E3]' };
    if (lowerColor === '#fcf1ea') return { bg: 'bg-[#FCF1EA]', text: 'text-[#B85721]', border: 'border-[#FFDFCC]' };
    if (lowerColor === '#fff0f5') return { bg: 'bg-[#FFF0F5]', text: 'text-[#B84C75]', border: 'border-[#FFE0EB]' };
    if (lowerColor === '#f3eeff') return { bg: 'bg-[#F3EEFF]', text: 'text-[#6052D9]', border: 'border-[#E5DBFF]' };
    if (lowerColor === '#fff8e7') return { bg: 'bg-[#FFF8E7]', text: 'text-[#9B7F1C]', border: 'border-[#FFEFCC]' };
    if (lowerColor === '#e5dbff') return { bg: 'bg-[#E5DBFF]', text: 'text-[#6052D9]', border: 'border-[#DED2FF]' };
  }
  if (name.includes('hot drink') || name.includes('tea') || name.includes('coffee')) {
    return { bg: 'bg-[#FFF5D7]', text: 'text-[#9A7D0A]', border: 'border-[#FFEBB3]' };
  }
  if (name.includes('cold drink') || name.includes('juice') || name.includes('beverage') || name.includes('soda') || name.includes('drink')) {
    return { bg: 'bg-[#E7F4FF]', text: 'text-[#2978B5]', border: 'border-[#CDE5FF]' };
  }
  if (name.includes('soup') || name.includes('bowl')) {
    return { bg: 'bg-[#EAFBF3]', text: 'text-[#1E7F55]', border: 'border-[#CFF5E3]' };
  }
  if (name.includes('roll') || name.includes('wrap') || name.includes('sandwich')) {
    return { bg: 'bg-[#FCF1EA]', text: 'text-[#B85721]', border: 'border-[#FFDFCC]' };
  }
  if (name.includes('bakery') || name.includes('cake') || name.includes('dessert') || name.includes('sweet') || name.includes('tooth')) {
    return { bg: 'bg-[#FFF0F5]', text: 'text-[#B84C75]', border: 'border-[#FFE0EB]' };
  }
  if (name.includes('fish') || name.includes('chip') || name.includes('sea')) {
    return { bg: 'bg-[#EAFDFC]', text: 'text-[#228B8F]', border: 'border-[#CDF0EF]' };
  }
  if (name.includes('pizza')) {
    return { bg: 'bg-[#FFF0F5]', text: 'text-[#B84C75]', border: 'border-[#FFE0EB]' };
  }
  if (name.includes('wine') || name.includes('beer') || name.includes('alcohol')) {
    return { bg: 'bg-[#F3EEFF]', text: 'text-[#6052D9]', border: 'border-[#E5DBFF]' };
  }
  if (name.includes('vodka') || name.includes('bar')) {
    return { bg: 'bg-[#F3EEFF]', text: 'text-[#6052D9]', border: 'border-[#E5DBFF]' };
  }
  if (name.includes('salad') || name.includes('veg')) {
    return { bg: 'bg-[#EAFBF3]', text: 'text-[#1E7F55]', border: 'border-[#CFF5E3]' };
  }
  
  // Custom hash fallback based on category name character codes to give unique repeating soft-pastel colors!
  const colors = [
    { bg: 'bg-[#FFF5D7]', text: 'text-[#9A7D0A]', border: 'border-[#FFEBB3]' },
    { bg: 'bg-[#E7F4FF]', text: 'text-[#2978B5]', border: 'border-[#CDE5FF]' },
    { bg: 'bg-[#EAFBF3]', text: 'text-[#1E7F55]', border: 'border-[#CFF5E3]' },
    { bg: 'bg-[#FCF1EA]', text: 'text-[#B85721]', border: 'border-[#FFDFCC]' },
    { bg: 'bg-[#F3EEFF]', text: 'text-[#6052D9]', border: 'border-[#E5DBFF]' },
    { bg: 'bg-[#FFF8E7]', text: 'text-[#9B7F1C]', border: 'border-[#FFEFCC]' },
    { bg: 'bg-[#EAFDFC]', text: 'text-[#228B8F]', border: 'border-[#CDF0EF]' }
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return colors[sum % colors.length];
};

const POS = () => {
  const { user } = useAuth();
  const { items, categories, categoriesList, loading: menuLoading } = useMenu();
  const { rooms, reservations, addToFolio } = useHospitality();
  const { orders, addOrder } = useOrders();

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('pos-cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load cart', e);
      return [];
    }
  });

  // Persist cart changes
  React.useEffect(() => {
    localStorage.setItem('pos-cart', JSON.stringify(cart));
  }, [cart]);

  const [activeCategory, setActiveCategory] = useState('All Items');
  const [viewMode, setViewMode] = useState('categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuickFilter, setActiveQuickFilter] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [serviceChargePercent, setServiceChargePercent] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [selectedItemForAddons, setSelectedItemForAddons] = useState(null);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [selectedGuestId, setSelectedGuestId] = useState('');
  const [orderForReceipt, setOrderForReceipt] = useState(null);

  // Auto switch view mode when searching
  React.useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setViewMode('items');
    }
  }, [searchQuery]);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const discountAmount = Math.round(subtotal * (discount / 100));
  const gst = Math.round((subtotal - discountAmount) * 0.05);
  const serviceChargeAmount = Math.round(subtotal * (serviceChargePercent / 100));
  const total = subtotal - discountAmount + gst + serviceChargeAmount;

  // Sync cart info with MainLayout header
  React.useEffect(() => {
    const count = cart.reduce((acc, item) => acc + item.qty, 0);
    window.dispatchEvent(new CustomEvent('pos-cart-updated', { 
      detail: { count, total } 
    }));
  }, [cart, total]);

  if (menuLoading && items.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Menu...</p>
        </div>
      </div>
    );
  }

  const orderHistory = orders.map(o => ({
    id: o.order_number,
    time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    items: 0, // Simplified for now
    total: o.grand_total,
    status: o.order_status
  })).slice(0, 5);

  const addToCart = (item, selectedSize = null, selectedAddons = []) => {
    const parsedSizes = item.sizes ? (typeof item.sizes === 'string' ? JSON.parse(item.sizes) : item.sizes) : [];
    const parsedAddons = item.addons ? (typeof item.addons === 'string' ? JSON.parse(item.addons) : item.addons) : [];

    // If item has portions or addons, and we haven't selected them yet, open selector
    // selectedSize === null means user clicked the item directly (not via addon modal confirm)
    if ((parsedSizes.length > 0 || parsedAddons.length > 0) && selectedSize === null && selectedAddons.length === 0) {
      setSelectedItemForAddons(item);
      return;
    }

    // Base price = item base price + size delta price (if a size was selected)
    const sizeDelta = selectedSize ? (parseFloat(selectedSize.price) || 0) : 0;
    const itemPrice = parseFloat(item.price) + sizeDelta;
    const itemName = selectedSize
      ? `${item.item_name || item.name} (${selectedSize.name})`
      : (item.item_name || item.name);

    // Make cartId unique per size + addon combination
    const sortedAddonKeys = [...selectedAddons].map(a => a.name).sort().join('|');
    const cartId = `${item.id}-${selectedSize ? selectedSize.name : 'default'}-${sortedAddonKeys}`;

    setCart(prev => {
      const existing = prev.find(i => i.cartId === cartId);
      if (existing) {
        return prev.map(i => i.cartId === cartId ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, {
        ...item,
        cartId,
        name: itemName,
        price: itemPrice,
        qty: 1,
        note: '',
        // Persist addon/size info for order submission
        selectedAddons: selectedAddons.length > 0 ? selectedAddons : null,
        sizeName: selectedSize ? selectedSize.name : null,
        sizePrice: selectedSize ? sizeDelta : null
      }];
    });

    if (selectedItemForAddons) setSelectedItemForAddons(null);
  };


  const removeFromCart = (cartId) => {
    setCart(prev => prev.filter(i => i.cartId !== cartId));
  };

  const updateQty = (cartId, delta) => {
    setCart(prev => prev.map(i => {
      if (i.cartId === cartId) {
        const newQty = Math.max(1, i.qty + delta);
        return { ...i, qty: newQty };
      }
      return i;
    }));
  };

  const updateNote = (cartId, note) => {
    setCart(prev => prev.map(i => i.cartId === cartId ? { ...i, note } : i));
    setEditingNote(null);
  };

  // Calculation functions moved up


  const showToastMessage = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleKDS = async () => {
    setIsProcessing(true);
    try {
      await addOrder(cart, {
        type: 'dine-in',
        total: total,
        discount: discountAmount,
        tax: gst,
        serviceChargePercent: serviceChargePercent,
        serviceChargeAmount: serviceChargeAmount,
        paymentStatus: 'pending'
      });
      showToastMessage('Order sent to Kitchen successfully!');
      setCart([]);
      setDiscount(0);
      setServiceChargePercent(0);
    } catch (err) {
      showToastMessage('Failed to send order to Kitchen', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalPayment = async () => {
    if (paymentMethod === 'Room Service' && !selectedGuestId) {
      showToastMessage('Please select a guest for Room Service', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const extraData = {
        type: paymentMethod === 'Room Service' ? 'delivery' : 'dine-in',
        subtotal: subtotal,
        total: total,
        discount: discountAmount,
        discountPercent: discount,
        tax: gst,
        serviceChargePercent: serviceChargePercent,
        serviceChargeAmount: serviceChargeAmount,
        paymentStatus: 'paid',
        customerId: selectedGuestId || null
      };

      const result = await addOrder(cart, extraData);
      
      if (paymentMethod === 'Room Service') {
        addToFolio(selectedGuestId, {
          description: `Room Service Order`,
          amount: total,
          date: new Date().toLocaleDateString(),
          type: 'Food'
        });
      }

      setOrderForReceipt({ ...extraData, itemsList: cart.map(i => ({ name: i.item_name || i.name, quantity: i.qty, price: i.price })), id: result.id });
      setCart([]);
      setDiscount(0);
      setServiceChargePercent(0);
      setSelectedGuestId('');
      setShowPaymentModal(false);
      showToastMessage(paymentMethod === 'Room Service' ? 'Charge added to guest folio!' : 'Payment Successful!');
    } catch (err) {
      showToastMessage('Order failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintOnly = () => {
    const currentOrder = {
      customer: paymentMethod === 'Room Service' ? 'Guest' : 'Walk-in',
      type: paymentMethod === 'Room Service' ? 'Room Service' : 'Dine-in',
      table: paymentMethod === 'Room Service' ? 'Room Service' : '-',
      amount: `₹${total}`,
      items: cart.reduce((acc, i) => acc + i.qty, 0),
      itemsList: cart.map(i => ({ name: i.item_name || i.name, quantity: i.qty, price: i.price })),
      payment: paymentMethod,
      status: 'Pro-forma',
      serviceChargePercent: serviceChargePercent,
      serviceChargeAmount: serviceChargeAmount,
      discount: discount,
      discountAmount: discountAmount,
      tax: gst
    };
    setOrderForReceipt(currentOrder);
    setTimeout(() => {
      printContent('printable-area');
    }, 500);
  };

  const filteredItems = items.filter(item => {
    const isAll = ['all', 'all items'].includes(activeCategory?.trim().toLowerCase());
    const itemCategory = (item.category_name || item.category || '').trim().toLowerCase();
    const matchesCategory = isAll || itemCategory === activeCategory?.trim().toLowerCase();
    const itemName = item.item_name || item.name;
    const matchesSearch = itemName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Quick Filters logic
    let matchesQuickFilter = true;
    if (activeQuickFilter === 'veg') {
      matchesQuickFilter = item.isVeg === 1;
    } else if (activeQuickFilter === 'vegan') {
      matchesQuickFilter = item.isVegan === 1;
    } else if (activeQuickFilter === 'gf') {
      matchesQuickFilter = item.isGlutenFree === 1;
    } else if (activeQuickFilter === 'beverage') {
      const catLower = itemCategory.toLowerCase();
      matchesQuickFilter = catLower.includes('beverage') || catLower.includes('tea') || 
                           catLower.includes('milkshake') || catLower.includes('smoothie') || 
                           catLower.includes('coffee') || catLower.includes('drink');
    } else if (activeQuickFilter === 'breakfast') {
      const catLower = itemCategory.toLowerCase();
      matchesQuickFilter = catLower.includes('breakfast') || catLower.includes('wrap') || 
                           catLower.includes('classic');
    }

    return matchesCategory && matchesSearch && matchesQuickFilter;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 h-full overflow-hidden relative">
      {/* Toast Feedback */}
      {toast && (
        <div 
          className={cn(
            "fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest border text-white",
            toast.type === 'success' ? "bg-primary border-primary/20" : "bg-primary-hover border-primary/20"
          )}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-white" /> : <AlertCircle className="w-4 h-4 text-white" />}
          {toast.message}
        </div>
      )}
      {/* Menu Area */}
      <div className="flex-1 flex flex-col gap-4 lg:gap-6 overflow-hidden">
        {/* Search & Action Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between shrink-0 gap-3 md:gap-4">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 lg:left-5 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-text-secondary group-focus-within:text-primary" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..." 
              className="w-full pl-10 lg:pl-12 pr-4 lg:pr-5 py-3 lg:py-3.5 bg-surface border border-slate-100 rounded-xl lg:rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/30 outline-none shadow-sm font-bold text-[10px] lg:text-[11px] uppercase tracking-widest placeholder:text-slate-300"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
              <button 
                onClick={() => setShowHistory(true)}
                className="flex-1 md:flex-none p-3 lg:p-4 bg-surface border border-slate-100 rounded-xl lg:rounded-2xl hover:border-primary/20 hover:bg-slate-50 shadow-sm group flex items-center justify-center gap-2 lg:gap-3 transition-all active:scale-95"
              >
                 <History className="w-4 h-4 lg:w-5 lg:h-5 text-text-secondary group-hover:text-primary" />
                 <span className="md:hidden text-[9px] font-black uppercase tracking-widest text-text-secondary group-hover:text-primary">Order History</span>
              </button>
          </div>
        </div>

        {viewMode === 'categories' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3 shrink-0">
              <div>
                <h3 className="text-base font-black text-text-primary uppercase tracking-wider leading-none">Menu Categories</h3>
                <p className="text-text-secondary mt-1.5 text-[10px] lg:text-xs font-medium">Select a category to view items</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pb-24 lg:pb-12 scrollbar-hide pr-1">
              {/* ALL ITEMS CARD */}
              <button
                onClick={() => {
                  setActiveCategory('All Items');
                  setViewMode('items');
                }}
                className="flex flex-col items-center justify-center p-6 rounded-[24px] border border-primary/20 bg-primary/[0.04] shadow-[0_10px_30px_rgba(108,99,255,0.03)] hover:shadow-[0_15px_30px_rgba(108,99,255,0.08)] hover:-translate-y-1.5 duration-300 transition-all active:scale-95 cursor-pointer text-center aspect-[1.1] min-h-[140px] group"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-4xl mb-3 shrink-0 bg-white/70 shadow-sm text-primary group-hover:scale-105 transition-transform duration-300">
                   🍽️
                </div>
                <span className="text-[10px] lg:text-xs font-black uppercase tracking-wider leading-tight text-primary">
                   ALL ITEMS
                </span>
              </button>

              {/* DYNAMIC CATEGORIES */}
              {categories.map(cat => {
                const styles = getCategoryStyles(cat.category_name, cat.color);
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.category_name);
                      setViewMode('items');
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-[24px] border shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.05)] hover:-translate-y-1.5 duration-300 transition-all active:scale-95 cursor-pointer text-center aspect-[1.1] min-h-[140px] group",
                      styles.bg,
                      styles.border
                    )}
                  >
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-4xl mb-3 shrink-0 bg-white/70 shadow-sm group-hover:scale-105 transition-transform duration-300">
                       {cat.icon && cat.icon.length > 2 ? (
                         <img src={cat.icon} alt={cat.category_name} className="w-10 h-10 object-cover rounded-lg" />
                       ) : (
                         <span>{cat.icon || '🍽️'}</span>
                       )}
                    </div>
                    <span className={cn("text-[10px] lg:text-xs font-black uppercase tracking-wider leading-tight", styles.text)}>
                       {cat.category_name}
                    </span>
                  </button>
                );
              })}

              {/* EXTRAS MANUAL CARD */}
              <button 
                onClick={() => showToastMessage('Extras coming soon', 'success')}
                className="flex flex-col items-center justify-center p-6 rounded-[24px] border border-[#E5DBFF] bg-[#F3EEFF] shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.05)] hover:-translate-y-1.5 duration-300 transition-all active:scale-95 cursor-pointer text-center aspect-[1.1] min-h-[140px] group"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-4xl mb-3 shrink-0 bg-white/70 shadow-sm text-[#6052D9] group-hover:scale-105 transition-transform duration-300">
                   <Plus className="w-7 h-7 stroke-[3]" />
                </div>
                <span className="text-[10px] lg:text-xs font-black uppercase tracking-wider leading-tight text-[#6052D9]">
                   EXTRAS
                </span>
              </button>

              {/* DISCOUNTS CARD */}
              <button 
                onClick={() => showToastMessage('Discounts coming soon', 'success')}
                className="flex flex-col items-center justify-center p-6 rounded-[24px] border border-[#CFF5E3] bg-[#EAFBF3] shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.05)] hover:-translate-y-1.5 duration-300 transition-all active:scale-95 cursor-pointer text-center aspect-[1.1] min-h-[140px] group"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-4xl mb-3 shrink-0 bg-white/70 shadow-sm text-[#1E7F55] group-hover:scale-105 transition-transform duration-300">
                   <Tag className="w-7 h-7" />
                </div>
                <span className="text-[10px] lg:text-xs font-black uppercase tracking-wider leading-tight text-[#1E7F55]">
                   DISCOUNTS
                </span>
              </button>

              {/* CUSTOM AMOUNT CARD */}
              <button 
                onClick={() => showToastMessage('Custom amount coming soon', 'success')}
                className="flex flex-col items-center justify-center p-6 rounded-[24px] border border-[#CDE5FF] bg-[#E7F4FF] shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.05)] hover:-translate-y-1.5 duration-300 transition-all active:scale-95 cursor-pointer text-center aspect-[1.1] min-h-[140px] group"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-4xl mb-3 shrink-0 bg-white/70 shadow-sm text-[#2978B5] group-hover:scale-105 transition-transform duration-300">
                   <CreditCard className="w-7 h-7" />
                </div>
                <span className="text-[10px] lg:text-xs font-black uppercase tracking-wider leading-tight text-[#2978B5]">
                   CUSTOM AMOUNT
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header Title Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 shrink-0 px-1">
              <div>
                <h3 className="text-lg font-black text-text-primary uppercase tracking-wider leading-none">{activeCategory}</h3>
                <p className="text-text-secondary mt-1.5 text-[9px] lg:text-[10px] font-bold uppercase tracking-widest leading-none">Browsing items in {activeCategory}</p>
              </div>
              <div className="relative w-full sm:w-[220px] group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-full focus:ring-4 focus:ring-primary/5 focus:border-primary/30 outline-none shadow-sm font-bold text-[10px] uppercase tracking-widest placeholder:text-slate-300"
                />
              </div>
            </div>
            
            {/* Quick Filter Buttons Bar */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1.5 shrink-0 px-1 scrollbar-hide">
              {[
                { id: 'all', label: 'All Items', icon: '🍽️' },
                { id: 'veg', label: 'Vegetarian', icon: '🌱' },
                { id: 'vegan', label: 'Vegan', icon: '🍃' },
                { id: 'gf', label: 'Gluten-Free', icon: '🌾' },
                { id: 'beverage', label: 'Beverages', icon: '☕' },
                { id: 'breakfast', label: 'Breakfast', icon: '🍳' }
              ].map(filter => {
                const isActive = activeQuickFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setActiveQuickFilter(filter.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-sm shrink-0",
                      isActive
                        ? "bg-slate-900 text-white border-slate-900 font-extrabold"
                        : "bg-white border-black/[0.03] text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    )}
                  >
                    <span>{filter.icon}</span>
                    <span>{filter.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Horizontal Sub-Navigation Categories Bar */}
            <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-2 shrink-0 px-1 scrollbar-hide">
              <button 
                onClick={() => { setViewMode('categories'); setSearchQuery(''); }}
                className="w-10 h-10 bg-white border border-black/[0.03] text-slate-400 hover:bg-slate-50 hover:text-primary transition-all rounded-[14px] flex items-center justify-center shadow-sm shrink-0 cursor-pointer active:scale-95"
                title="Back to Grid"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* ALL ITEMS BUTTON */}
              <button
                onClick={() => setActiveCategory('All Items')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-[14px] border text-[9px] font-black uppercase tracking-widest transition-all shrink-0 cursor-pointer active:scale-95 shadow-sm",
                  activeCategory === 'All Items'
                    ? "bg-primary text-white border-primary shadow-md shadow-primary/20 font-extrabold"
                    : "bg-white border-black/[0.03] text-slate-600 hover:bg-slate-50 hover:text-primary"
                )}
              >
                <span>🍽️</span>
                <span>All Items</span>
              </button>

              {/* DYNAMIC CATEGORIES BUTTONS */}
              {categories.map(cat => {
                const styles = getCategoryStyles(cat.category_name, cat.color);
                const isActive = activeCategory === cat.category_name;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.category_name)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-[14px] border text-[9px] font-black uppercase tracking-widest transition-all shrink-0 cursor-pointer active:scale-95 shadow-sm",
                      isActive
                        ? "bg-primary text-white border-primary shadow-md shadow-primary/20 font-extrabold"
                        : "bg-white border-black/[0.03] text-slate-600 hover:bg-slate-50 hover:text-primary"
                    )}
                  >
                    <div className="w-4 h-4 shrink-0 flex items-center justify-center text-xs">
                       {cat.icon && cat.icon.length > 2 ? (
                         <img src={cat.icon} alt={cat.category_name} className="w-4 h-4 object-cover rounded-sm" />
                       ) : (
                         <span>{cat.icon || '🍽️'}</span>
                       )}
                    </div>
                    <span>{cat.category_name}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Menu Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 lg:gap-6 items-start pr-1 pb-32 lg:pb-12 scrollbar-hide">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => addToCart(item)}
                    className="card group cursor-pointer p-4 flex flex-col justify-between relative overflow-hidden bg-white min-h-[260px] h-full transition-all duration-300 hover:shadow-premium-hover hover:-translate-y-1.5 active:scale-[0.98] border border-black/[0.03] rounded-[24px]"
                  >
                    {/* Top Section: Image & Floating Badge */}
                    <div className="relative w-full h-32 rounded-2xl overflow-hidden bg-slate-50 border border-black/[0.01] shrink-0 mb-3.5 transition-transform duration-500 group-hover:scale-102">
                      {/* Floating Price tag */}
                      <div className="absolute top-2.5 right-2.5 z-20">
                         <span className="bg-slate-900 text-white font-extrabold text-[10px] tracking-tight px-3 py-1 shadow-md rounded-full">
                            ₹{item.price}
                         </span>
                      </div>

                      {/* Cover Image/Emoji container */}
                      <div className="w-full h-full flex items-center justify-center">
                          {getImageUrl(item.image).length > 2 ? (
                            <img 
                              src={getImageUrl(item.image)} 
                              alt={item.item_name || item.name} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center text-2xl select-none">
                              {getImageUrl(item.image)}
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Typography info (Left Aligned) */}
                    <div className="relative z-10 flex flex-col flex-1 justify-between">
                      <div className="text-left">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-extrabold text-slate-800 text-[13px] md:text-sm leading-tight uppercase tracking-tight break-words line-clamp-1">
                            {item.item_name || item.name || "Unnamed Item"}
                          </h4>
                          
                          {/* Dietary Badges */}
                          <div className="flex items-center gap-1.5 shrink-0 select-none">
                            {item.isVeg === 1 && (
                              <span className="w-3.5 h-3.5 rounded border border-emerald-500/35 flex items-center justify-center bg-white" title="Vegetarian">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              </span>
                            )}
                            {item.isVegan === 1 && (
                              <span className="text-[8px] font-black text-teal-600 bg-teal-50 border border-teal-100/60 px-1 py-0.2 rounded" title="Vegan">
                                VG
                              </span>
                            )}
                            {item.isGlutenFree === 1 && (
                              <span className="text-[8px] font-black text-amber-600 bg-amber-50 border border-amber-100/60 px-1 py-0.2 rounded" title="Gluten Free Option">
                                GF
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-slate-400 text-[10px] font-medium leading-relaxed line-clamp-2 mt-1">
                          {item.description || "Prepared fresh with premium ingredients."}
                        </p>
                      </div>

                      {/* Footer Info Row */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/[0.01]">
                        <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          Ready
                        </span>
                        <button 
                          type="button"
                          className="w-7 h-7 rounded-xl bg-gradient-premium text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/10 select-none cursor-pointer"
                        >
                          <span className="text-xs font-black">+</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                   <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner">
                      <Search className="w-8 h-8 text-slate-200" />
                   </div>
                   <h4 className="text-xl font-black text-text-primary uppercase tracking-tight">No Items Found</h4>
                   <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest mt-2">No products available in this category</p>
                   <button 
                     onClick={() => { setViewMode('categories'); setSearchQuery(''); }}
                     className="mt-6 text-primary font-black uppercase tracking-[0.2em] text-[8px] hover:underline transition-all"
                   >
                     Show All Categories
                   </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Row */}
        <div className="flex justify-between items-center bg-slate-50/50 p-4 border-t border-slate-100 -mx-4 md:-mx-6 mt-auto shrink-0 rounded-b-3xl">
          <div className="flex gap-2">
             <button 
               onClick={() => setViewMode('categories')} 
               className={cn(
                 "px-4 py-2.5 rounded-xl font-black uppercase tracking-widest text-[9px] cursor-pointer transition-all active:scale-95", 
                 viewMode === 'categories' 
                   ? "bg-primary text-white shadow-md shadow-primary/20" 
                   : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
               )}
             >
               Categories
             </button>
             <button onClick={() => showToastMessage('Hold Order coming soon', 'success')} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl font-black uppercase tracking-widest text-[9px] cursor-pointer transition-all active:scale-95">Hold Order</button>
             <button onClick={() => showToastMessage('Print Bill coming soon', 'success')} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl font-black uppercase tracking-widest text-[9px] cursor-pointer transition-all active:scale-95">Print Bill</button>
          </div>
          <div className="flex gap-2">
             <button onClick={() => showToastMessage('Custom Amount coming soon', 'success')} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl font-black uppercase tracking-widest text-[9px] cursor-pointer transition-all active:scale-95">Custom Amount</button>
             <button 
               onClick={() => { if(cart.length > 0 && confirm('Clear all items from cart?')) setCart([]); }}
               className="px-4 py-2.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-500 rounded-xl font-black uppercase tracking-widest text-[9px] cursor-pointer transition-all active:scale-95"
             >
               Clear Cart
             </button>
          </div>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isMobileCartOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[300] lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileCartOpen(false)}
        />
      )}

      {/* Cart & Billing Section */}
      <div className={cn(
        "fixed inset-x-0 bottom-0 lg:relative lg:inset-auto z-[400] transition-transform duration-300 lg:translate-y-0 shadow-2xl lg:shadow-none",
        "w-full lg:w-[320px] xl:w-[380px] flex flex-col shrink-0 h-[85vh] lg:h-full",
        isMobileCartOpen ? "translate-y-0" : "translate-y-full lg:translate-y-0",
        cart.length === 0 ? "opacity-95" : "opacity-100"
      )}>
        <div className="card flex-1 flex flex-col p-0 overflow-hidden border border-black/5 bg-surface rounded-t-[2.5rem] lg:rounded-[2rem]">
          {/* Mobile Close Handle */}
          <div className="lg:hidden flex justify-center py-2 shrink-0" onClick={() => setIsMobileCartOpen(false)}>
            <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
          </div>
          {/* Cart Header */}
          <div className="pl-5 pr-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white shrink-0 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                 <div 
                   className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-2xl relative shrink-0"
                 >
                    <ShoppingCart className="w-6 h-6" />
                    {cart.length > 0 && (
                      <div 
                        className="absolute -top-1 -right-1 w-5 h-5 bg-primary border-2 border-white rounded-full flex items-center justify-center text-[9px] font-black shadow-lg"
                      >
                        {cart.reduce((acc, item) => acc + item.qty, 0)}
                      </div>
                    )}
                 </div>
                 <div className="min-w-0">
                    <h3 className="font-black text-xl tracking-tighter uppercase leading-none whitespace-nowrap">Active Cart</h3>
                    <div className="flex items-center gap-1.5 mt-1.5">
                       <span className="w-1 h-1 rounded-full bg-primary" />
                       <p className="text-text-secondary text-[8px] font-black uppercase tracking-[0.2em] opacity-60 truncate">#ORD-202605</p>
                    </div>
                 </div>
              </div>
              
              <button 
                onClick={() => {
                  if(cart.length > 0 && confirm('Clear all items from cart?')) setCart([]);
                }}
                className={cn(
                  "p-2.5 rounded-xl border border-transparent group/trash shrink-0",
                  cart.length > 0 ? "text-slate-400 hover:text-primary" : "text-slate-200 cursor-not-allowed"
                )}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Items Scroll */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-4 scrollbar-hide">
            {cart.length > 0 ? (
              cart.map(item => {
                const baseName = item.item_name || item.name.split(' (')[0];
                const modifiersText = item.addons 
                  ? item.addons.map(a => a.name).join(', ') 
                  : (item.name.includes('(') ? item.name.split('(')[1].replace(')', '') : '');

                return (
                  <div 
                    key={item.cartId} 
                    className="flex flex-col gap-2.5 bg-white shadow-sm border border-slate-100/50 p-4 rounded-[20px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.01)] transition-all relative group"
                  >
                    {/* Top Row: Name and Total Price */}
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                          <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-tight truncate">
                            {baseName}
                          </h5>
                          
                          {/* Dietary Badges */}
                          <div className="flex items-center gap-1 shrink-0 select-none scale-[0.8] origin-left">
                            {item.isVeg === 1 && (
                              <span className="w-3.5 h-3.5 rounded border border-emerald-500/35 flex items-center justify-center bg-white" title="Vegetarian">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              </span>
                            )}
                            {item.isVegan === 1 && (
                              <span className="text-[8px] font-black text-teal-600 bg-teal-50 border border-teal-100/60 px-1 py-0.2 rounded" title="Vegan">
                                VG
                              </span>
                            )}
                            {item.isGlutenFree === 1 && (
                              <span className="text-[8px] font-black text-amber-600 bg-amber-50 border border-amber-100/60 px-1 py-0.2 rounded" title="Gluten Free Option">
                                GF
                              </span>
                            )}
                          </div>
                       </div>
                       <span className="font-black text-slate-800 text-xs">
                         ₹{item.price * item.qty}
                       </span>
                    </div>

                    {/* Middle Row: Modifiers and Notes */}
                    {modifiersText && (
                      <p className="text-slate-400 text-[9px] font-bold tracking-tight leading-relaxed">
                        {modifiersText}
                      </p>
                    )}
                    {item.note && (
                      <p className="text-primary text-[8px] font-extrabold uppercase tracking-wider bg-primary-light px-2 py-0.5 rounded-md w-fit">
                        Note: {item.note}
                      </p>
                    )}

                    {/* Bottom Row: Adjusters and Actions */}
                    <div className="flex items-center justify-between mt-1 shrink-0">
                       <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-xl p-0.5 shadow-inner">
                          <button onClick={() => updateQty(item.cartId, -1)} className="w-7 h-7 flex items-center justify-center bg-white border border-slate-100/50 rounded-lg hover:text-primary text-slate-400 transition-all cursor-pointer">
                             <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center text-[10px] font-black text-slate-700">{item.qty}</span>
                          <button onClick={() => updateQty(item.cartId, 1)} className="w-7 h-7 flex items-center justify-center bg-white border border-slate-100/50 rounded-lg hover:text-primary text-slate-400 transition-all cursor-pointer">
                             <Plus className="w-3 h-3" />
                          </button>
                       </div>
                       
                       <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setEditingNote(item.cartId)}
                            className={cn(
                              "p-2 rounded-xl transition-all text-xs font-bold uppercase cursor-pointer",
                              item.note ? "bg-primary-light text-primary border border-primary/20" : "text-slate-300 hover:text-primary hover:bg-slate-50"
                            )}
                            title="Add special instructions"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button onClick={() => removeFromCart(item.cartId)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer">
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </div>

                    {editingNote === item.cartId && (
                      <div className="overflow-hidden">
                        <div className="pt-2 flex flex-col gap-2">
                           <textarea 
                             autoFocus
                             onBlur={(e) => updateNote(item.cartId, e.target.value)}
                             defaultValue={item.note}
                             placeholder="e.g. Extra spicy, No onions..."
                             className="w-full p-4 bg-surface border-2 border-primary/20 rounded-2xl outline-none text-xs font-bold text-text-primary placeholder:text-slate-300 min-h-[80px] shadow-inner"
                           />
                           <button onClick={() => setEditingNote(null)} className="btn-primary py-2 text-[8px] uppercase tracking-widest cursor-pointer">Save Note</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12 opacity-40">
                <ShoppingCart className="w-10 h-10 text-slate-300 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Cart is empty</p>
              </div>
            )}
          </div>

          {/* Billing Summary Panel */}
          <div className="p-5 lg:p-6 bg-slate-50/80 border-t border-slate-100 rounded-t-[2rem] shadow-[0_-10px_35px_rgba(0,0,0,0.02)]">
            <div className="space-y-2.5 mb-4">
              <div className="flex justify-between items-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                <span>Subtotal</span>
                <span className="text-slate-700 font-extrabold">₹{subtotal}</span>
              </div>
              
              <div className="flex justify-between items-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                <span>Tax (GST 5%)</span>
                <span className="text-slate-700 font-extrabold">₹{gst}</span>
              </div>

              {/* Discount Selector */}
              <div className="py-2">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-3 h-3 text-primary/40" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Apply Discount</span>
                </div>
                <div className="flex gap-2">
                  {[0, 5, 10, 15, 20].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDiscount(d)}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all border cursor-pointer",
                        discount === d 
                          ? "bg-primary text-white border-primary shadow-sm" 
                          : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                      )}
                    >
                      {d}%
                    </button>
                  ))}
                </div>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-emerald-600 text-[10px] font-bold uppercase tracking-[0.2em]">
                  <span>Discount ({discount}%)</span>
                  <span>- ₹{discountAmount}</span>
                </div>
              )}

              {/* Service Charge Selector */}
              <div className="py-2 border-t border-black/[0.03]">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-3 h-3 text-primary/40" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Service Charge</span>
                </div>
                <div className="flex gap-2">
                  {[
                    { label: 'No Charge', value: 0 },
                    { label: '+5%', value: 5 },
                    { label: '+10%', value: 10 },
                    { label: '+30%', value: 30 }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setServiceChargePercent(opt.value)}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg text-[8px] font-bold transition-all border whitespace-nowrap cursor-pointer",
                        serviceChargePercent === opt.value 
                          ? "bg-primary text-white border-primary shadow-sm" 
                          : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {serviceChargePercent > 0 && (
                <div className="flex justify-between items-center text-amber-600 text-[10px] font-bold uppercase tracking-[0.2em]">
                  <span>Service Charge ({serviceChargePercent}%)</span>
                  <span>+ ₹{serviceChargeAmount}</span>
                </div>
              )}
              <div className="pt-4 mt-2 border-t border-black/[0.03] flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mb-1.5">Grand Total</span>
                  <div className="flex items-baseline gap-2">
                     <h4 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tighter">₹{total}</h4>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">INR</span>
                  </div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm text-slate-500">
                   <Users className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                disabled={cart.length === 0 || isProcessing}
                onClick={handleKDS}
                className="flex flex-col items-center justify-center gap-2 py-4 bg-[#F3EEFF] text-[#6C63FF] border border-[#6C63FF]/10 rounded-[18px] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#6C63FF]/15 disabled:opacity-50 transition-all group active:scale-95 cursor-pointer"
              >
                <ChefHat className={cn("w-5 h-5 text-[#6C63FF]")} /> 
                {isProcessing ? 'Sending...' : 'Send to KDS'}
              </button>
              <button 
                onClick={() => setShowPaymentModal(true)}
                disabled={cart.length === 0 || isProcessing}
                className="flex flex-col items-center justify-center gap-2 py-4 bg-gradient-premium text-white rounded-[18px] text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-primary/15 hover:opacity-95 disabled:opacity-50 transition-all group active:scale-95 cursor-pointer"
              >
                <CreditCard className="w-5 h-5" /> 
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Cart Toggle */}
      {/* Floating cart bar removed - now in Header */}

      {/* History Modal */}
      {showHistory && (
         <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div onClick={() => setShowHistory(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-[95%] md:max-w-[560px] max-h-[90vh] bg-surface rounded-[2rem] md:rounded-[2.5rem] overflow-hidden flex flex-col self-center">
             <div className="px-5 py-4 md:px-6 md:py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 shrink-0">
                <div>
                  <h3 className="text-lg md:text-2xl font-black tracking-tight uppercase">Order History</h3>
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Today's Transactions</p>
                </div>
                <button onClick={() => setShowHistory(false)} className="p-2 md:p-3 hover:bg-surface rounded-xl md:rounded-2xl transition-all shadow-sm"><X className="w-5 h-5 md:w-6 md:h-6" /></button>
             </div>
             <div className="px-5 md:px-6 py-6 space-y-4 overflow-y-auto scrollbar-hide">
                {orderHistory.map(order => (
                  <div key={order.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between hover:bg-surface transition-all cursor-pointer group">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center shadow-sm"><Receipt className="w-5 h-5 text-primary" /></div>
                        <div>
                           <h5 className="font-bold text-sm text-text-primary">{order.id}</h5>
                           <p className="text-[10px] font-bold text-slate-400">{order.time} • {order.items} Items</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="font-black text-sm text-text-primary">₹{order.total}</p>
                        <span className={cn("text-[8px] font-black uppercase px-2 py-0.5 rounded-full", order.status === 'Completed' ? "bg-emerald-50 text-emerald-600" : "bg-primary/10 text-primary")}>{order.status}</span>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* Compact & Interactive Payment Modal */}
      {showPaymentModal && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 overflow-hidden">
          <div 
            onClick={() => !isProcessing && setShowPaymentModal(false)} 
            className="absolute inset-0 bg-slate-900/60" 
          />
           <div 
            className="relative w-full max-w-[95%] md:max-w-[560px] bg-surface rounded-[2rem] md:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] border border-white/20 self-center"
          >
            {/* Header */}
            <div className="px-5 py-5 sm:px-6 sm:py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 shrink-0">
              <div className="flex items-center gap-3 sm:gap-5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl">
                  <Receipt className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-black text-text-primary tracking-tight uppercase leading-none">Final Settlement</h3>
                  <p className="text-[8px] sm:text-[10px] text-text-secondary font-black uppercase tracking-[0.2em] mt-1 opacity-60">Invoice #POS-2026-X49</p>
                </div>
              </div>
              <button 
                onClick={() => !isProcessing && setShowPaymentModal(false)} 
                className="p-2 sm:p-3 hover:bg-surface rounded-xl sm:rounded-2xl border border-transparent hover:border-slate-100 shadow-sm"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-text-secondary" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 scrollbar-hide">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="p-5 sm:p-6 bg-primary rounded-[1.25rem] sm:rounded-[1.5rem] flex flex-col items-center text-center shadow-xl border border-white/20">
                    <p className="text-[8px] sm:text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mb-1 sm:mb-2">Amount Due</p>
                    <h4 className="text-2xl sm:text-3xl font-black text-white tracking-tighter">₹{total}</h4>
                    <div className="mt-2 sm:mt-3 px-2 py-0.5 bg-surface/20 text-white rounded-full text-[6px] sm:text-[7px] font-black uppercase tracking-widest">Tax Included</div>
                 </div>
                 <div className="p-5 sm:p-6 bg-slate-50 rounded-[1.25rem] sm:rounded-[1.5rem] border-2 border-slate-100 flex flex-col items-center text-center">
                    <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1 sm:mb-2">Cart Summary</p>
                    <h4 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tighter">{cart.reduce((a, b) => a + b.qty, 0)}</h4>
                    <p className="mt-1 text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-widest">Items Count</p>
                 </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[9px] font-black text-text-secondary uppercase tracking-[0.3em] px-1">Payment Method</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
                  {[
                    { name: 'Cash', icon: Receipt, color: 'text-success', bg: 'bg-mint-dark/20' },
                    { name: 'Card', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { name: 'UPI', icon: ChevronRight, color: 'text-primary', bg: 'bg-primary-light' },
                    { name: 'Room Service', icon: Bed, color: 'text-primary-hover', bg: 'bg-primary-light' },
                  ].map((method) => (
                    <button 
                      onClick={() => setPaymentMethod(method.name)}
                      key={method.name} 
                      className={cn(
                        "relative p-3 lg:p-5 rounded-xl lg:rounded-[1.5rem] border-2 flex flex-col items-center justify-center gap-2 lg:gap-3 transition-all overflow-hidden active:scale-95", 
                        paymentMethod === method.name 
                          ? "border-primary bg-indigo-50/30 shadow-md" 
                          : "border-slate-50 bg-slate-50/50 hover:border-primary/20 hover:bg-surface"
                      )}
                    >
                      <div className={cn("w-9 h-9 lg:w-12 lg:h-12 rounded-lg lg:rounded-2xl flex items-center justify-center shadow-sm shrink-0", method.bg)}>
                        <method.icon className={cn("w-4 h-4 lg:w-6 lg:h-6 stroke-[2.5]", method.color)} />
                      </div>
                      <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.1em] text-center">{method.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'Room Service' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <h4 className="text-[9px] font-black text-text-secondary uppercase tracking-[0.3em] px-1">Select Active Guest</h4>
                  <div className="space-y-2">
                    <select 
                      value={selectedGuestId}
                      onChange={(e) => setSelectedGuestId(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm appearance-none focus:border-primary/20"
                    >
                      <option value="">Select Guest (In-House Only)</option>
                      {reservations
                        .filter(r => r.reservation_status === 'checked_in')
                        .map(res => (
                          <option key={res.id} value={res.guest_id}>
                            {res.guest_name} • {res.room_code || res.targetId}
                          </option>
                        ))}
                    </select>
                    {reservations.filter(r => r.reservation_status === 'checked_in').length === 0 && (
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest px-1">
                        No checked-in guests found
                      </p>
                    )}
                  </div>
                </div>
              )}

              <p className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em] pt-4">
                 Secure 256-bit Encrypted Transaction
              </p>
            </div>

            {/* Bottom Actions Area */}
            <div className="px-5 py-5 lg:px-6 lg:py-6 border-t border-slate-50 bg-surface shrink-0">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  disabled={isProcessing}
                  onClick={handlePrintOnly}
                  className="w-full py-4 bg-slate-50 text-slate-400 hover:text-primary border border-slate-100 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                   <Printer className="w-4 h-4" /> Print Invoice
                </button>
                <button 
                  disabled={isProcessing}
                  onClick={handleFinalPayment}
                  className={cn(
                    "w-full py-4 shadow-xl rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all active:scale-95",
                    isProcessing 
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                      : "btn-primary shadow-primary/20"
                  )}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isProcessing ? 'Processing...' : 'Pay & Settle'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Addon / Portion Selection Modal */}
      {selectedItemForAddons && (() => {
        const item = selectedItemForAddons;
        const parsedSizes = item.sizes ? (typeof item.sizes === 'string' ? JSON.parse(item.sizes) : item.sizes) : [];
        const parsedAddons = item.addons ? (typeof item.addons === 'string' ? JSON.parse(item.addons) : item.addons) : [];

        return (
          <AddonSelectionModal 
            item={item}
            sizes={parsedSizes}
            addons={parsedAddons}
            onClose={() => setSelectedItemForAddons(null)}
            onSave={(chosenSize, chosenAddons) => {
              // Base price = item price + size delta (size price is an ADD-ON delta, not replacement)
              const sizeDelta = chosenSize ? (parseFloat(chosenSize.price) || 0) : 0;
              const basePrice = parseFloat(item.price) + sizeDelta;
              // Display price in cart = base + addon prices (for visual only)
              const addonsPrice = chosenAddons.reduce((sum, a) => sum + (parseFloat(a.price) || 0), 0);
              const finalPrice = basePrice + addonsPrice;

              // Generate name with size and addon suffix
              const nameSuffix = [
                chosenSize ? chosenSize.name : '',
                ...chosenAddons.map(a => a.name)
              ].filter(Boolean).join(' + ');

              const finalName = nameSuffix ? `${item.item_name || item.name} (${nameSuffix})` : (item.item_name || item.name);
              
              // Sort addons to get a deterministic cartId
              const sortedAddonKeys = chosenAddons.map(a => a.name).sort().join('|');
              const cartId = `${item.id}-${chosenSize ? chosenSize.name : 'default'}-${sortedAddonKeys}`;

              setCart(prev => {
                const existing = prev.find(i => i.cartId === cartId);
                if (existing) {
                  return prev.map(i => i.cartId === cartId ? { ...i, qty: i.qty + 1 } : i);
                }
                return [...prev, { 
                  ...item, 
                  cartId, 
                  name: finalName, 
                  price: finalPrice,   // shown in cart UI (base + addons)
                  qty: 1, 
                  note: '', 
                  // Separate fields for order submission
                  selectedAddons: chosenAddons.length > 0 ? chosenAddons : null,
                  sizeName: chosenSize ? chosenSize.name : null,
                  sizePrice: sizeDelta > 0 ? sizeDelta : null
                }];
              });

              setSelectedItemForAddons(null);
            }}
          />
        );
      })()}
      {/* Hidden Printable Receipt - 80mm Thermal Style */}
      {orderForReceipt && (
        <div id="printable-area" className="hidden print:block printable-area receipt-print active-print">
          <div className="text-center space-y-1 mb-4">
            <h1 className="text-2xl font-black uppercase tracking-tight">Gila House</h1>
            <p className="text-[10px] font-bold">Main Branch</p>
            <p className="text-[10px] font-bold">GST: 22AAAAA0000A1Z5</p>
            <p className="text-[10px] font-bold">Ph: +91 12345 67890</p>
          </div>
          
          <div className="border-b-2 border-dashed border-slate-900 my-4"></div>
          
          <div className="space-y-1.5 text-[11px] font-bold uppercase">
            <div className="flex justify-between">
              <span>Bill No:</span>
              <span className="font-black">{orderForReceipt.id ? String(orderForReceipt.id).split('-').pop() : `INV${Math.floor(Math.random()*1000)}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{user?.name || 'Admin'}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span>{orderForReceipt.customer || 'Walk-in'}</span>
            </div>
          </div>

          <div className="border-b-2 border-dashed border-slate-900 my-4"></div>

          <table className="w-full text-[11px] font-bold uppercase mb-4">
            <thead>
              <tr className="border-b-2 border-slate-900">
                <th className="text-left py-2">Item Description</th>
                <th className="text-center py-2 px-2">Qty</th>
                <th className="text-right py-2">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dashed divide-slate-200">
              {orderForReceipt.itemsList?.map((item, i) => (
                <tr key={i}>
                  <td className="py-3 pr-2 leading-tight">{item.name}</td>
                  <td className="py-3 text-center px-2">{item.quantity}</td>
                  <td className="py-3 text-right">{item.price.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t-2 border-dashed border-slate-900 pt-4 space-y-2">
            <div className="flex justify-between text-[11px] font-bold uppercase">
              <span>Subtotal:</span>
              <span>{(orderForReceipt.subtotal !== undefined ? orderForReceipt.subtotal : subtotal).toLocaleString()}</span>
            </div>
            {((orderForReceipt.discountPercent !== undefined ? orderForReceipt.discountPercent : discount) > 0) && (
              <div className="flex justify-between text-[11px] font-bold uppercase text-slate-500">
                <span>Discount ({(orderForReceipt.discountPercent !== undefined ? orderForReceipt.discountPercent : discount)}%):</span>
                <span>-{(orderForReceipt.discount !== undefined ? orderForReceipt.discount : discountAmount).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-[11px] font-bold uppercase">
              <span>Tax (GST 5%):</span>
              <span>{(orderForReceipt.tax !== undefined ? orderForReceipt.tax : gst).toLocaleString()}</span>
            </div>
            {((orderForReceipt.serviceChargePercent !== undefined ? orderForReceipt.serviceChargePercent : serviceChargePercent) > 0) && (
              <div className="flex justify-between text-[11px] font-bold uppercase">
                <span>Service Charge ({(orderForReceipt.serviceChargePercent !== undefined ? orderForReceipt.serviceChargePercent : serviceChargePercent)}%):</span>
                <span>+{(orderForReceipt.serviceChargeAmount !== undefined ? orderForReceipt.serviceChargeAmount : serviceChargeAmount).toLocaleString()}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-slate-900">
              <span className="text-lg font-black uppercase tracking-tighter">Grand Total:</span>
              <span className="text-xl font-black tracking-tighter">Rs.{(orderForReceipt.total !== undefined ? orderForReceipt.total : total).toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-8 space-y-1.5 text-[11px] font-bold uppercase">
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <span>{orderForReceipt.payment || 'CASH'}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Items:</span>
              <span>{orderForReceipt.itemsList?.length || 0}</span>
            </div>
          </div>

          <div className="text-center pt-12 space-y-2">
            <p className="text-sm font-black uppercase tracking-[0.2em]">*** THANK YOU ***</p>
            <p className="text-[10px] font-bold uppercase tracking-widest">Visit Again!</p>
            <p className="text-[8px] font-black text-slate-400 mt-8 uppercase tracking-tighter">Powered by Gila House POS</p>
          </div>
        </div>
      )}
    </div>
  );
};

const AddonSelectionModal = ({ item, sizes, addons, onClose, onSave }) => {
  const [selectedSize, setSelectedSize] = useState(sizes[0] || null);
  const [selectedAddons, setSelectedAddons] = useState([]);

  const toggleAddon = (addon) => {
    setSelectedAddons(prev => {
      const exists = prev.some(a => a.name === addon.name);
      if (exists) return prev.filter(a => a.name !== addon.name);
      return [...prev, addon];
    });
  };

  const basePrice = parseFloat(item.price) + (selectedSize ? parseFloat(selectedSize.price) || 0 : 0);
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + (parseFloat(a.price) || 0), 0);
  const totalPrice = basePrice + addonsTotal;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-10" />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-[32px] p-8 shadow-2xl border border-black/[0.04] z-20 animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header Row */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-50 shrink-0">
          <div className="flex items-center">
            {/* Rounded square container for image/emoji */}
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0 select-none">
              {getImageUrl(item.image).length > 2 ? (
                <img 
                  src={getImageUrl(item.image)} 
                  alt={item.item_name || item.name} 
                  className="w-full h-full object-cover rounded-2xl" 
                />
              ) : (
                <span className="text-2xl">{getImageUrl(item.image)}</span>
              )}
            </div>
            
            {/* Header typography info */}
            <div className="flex flex-col text-left pl-4">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-tight">
                {item.item_name || item.name}
              </h3>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5 leading-none">
                Customize Portion & Modifiers
              </p>
            </div>
          </div>

          {/* Close Button "X" */}
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer select-none"
          >
            ✕
          </button>
        </div>

        {/* Modal Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-6 pr-1 space-y-8 scrollbar-hide">
          
          {/* Portion Size selection */}
          {sizes.length > 0 && (
            <div className="space-y-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] block text-left">
                Select Portion Size
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {sizes.map(s => {
                  const isSelected = selectedSize?.name === s.name;
                  const deltaPrice = parseFloat(s.price) || 0;
                  return (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={cn(
                        "p-4 rounded-[14px] border flex flex-col items-center justify-center min-h-[72px] transition-all cursor-pointer active:scale-95 text-center",
                        isSelected 
                          ? "border-primary bg-primary-light/35 text-primary font-black shadow-sm" 
                          : "border-slate-100 bg-white text-slate-600 hover:bg-slate-50/50 hover:border-slate-200"
                      )}
                    >
                      <span className="text-[10.5px] font-black uppercase tracking-wider leading-tight">{s.name}</span>
                      {deltaPrice > 0 && (
                        <span className="text-[9.5px] font-extrabold text-primary tracking-tight mt-1">
                          +₹{deltaPrice.toFixed(2)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Addons / Toppings selection */}
          {addons.length > 0 && (
            <div className="space-y-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] block text-left">
                Select Modifiers
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {addons.map(a => {
                  const isSelected = selectedAddons.some(addon => addon.name === a.name);
                  const addonPrice = parseFloat(a.price) || 0;
                  return (
                    <button
                      key={a.name}
                      type="button"
                      onClick={() => toggleAddon(a)}
                      className={cn(
                        "p-4 rounded-[14px] border flex flex-col items-center justify-center min-h-[72px] transition-all cursor-pointer active:scale-95 text-center",
                        isSelected 
                          ? "border-primary bg-primary-light/35 text-primary font-black shadow-sm" 
                          : "border-slate-100 bg-white text-slate-600 hover:bg-slate-50/50 hover:border-slate-200"
                      )}
                    >
                      <span className="text-[10.5px] font-black uppercase tracking-wider leading-tight break-words px-1">{a.name}</span>
                      {addonPrice > 0 && (
                        <span className="text-[9.5px] font-extrabold text-primary tracking-tight mt-1">
                          +₹{addonPrice.toFixed(2)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Final Pricing & Actions Bottom Bar */}
        <div className="mt-auto border-t border-slate-100 pt-6 flex items-center justify-between shrink-0 bg-white w-full">
          {/* Price Label (Left Aligned) */}
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
              Calculated Price
            </span>
            <span className="text-2xl font-black text-slate-800 tracking-tight leading-none mt-1.5">
              ₹{totalPrice.toFixed(2)}
            </span>
          </div>
          
          {/* Side-by-Side Action Buttons (Right Aligned) */}
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-bold uppercase tracking-wider text-[10px] rounded-xl cursor-pointer active:scale-95 transition-all select-none"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={() => onSave(selectedSize, selectedAddons)}
              className="px-8 py-3 bg-primary hover:bg-primary-hover text-white font-bold uppercase tracking-wider text-[10px] rounded-xl cursor-pointer active:scale-95 shadow-md shadow-primary/10 transition-all select-none"
            >
              Add To Bill
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default POS;
