import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  MoreVertical,
  Filter,
  Image as ImageIcon,
  ChevronRight,
  Star,
  Settings2,
  X,
  Camera,
  Layers,
  Tag,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  CookingPot,
  ArrowUpRight,
  Eye,
  Save,
  UploadCloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "../../../utils/cn";
import { getImageUrl } from "../../../utils/imageUtils";
import { useMenu } from "../../../context/MenuContext";

const Menu = () => {
  const { items, categories: backendCategories, addItem, updateItem, deleteItem, addCategory, updateCategory, deleteCategory } = useMenu();
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [toast, setToast] = useState(null);

  // Responsive Category Management Local States
  const [localCategories, setLocalCategories] = useState([
    { id: 1, category_name: 'Breakfast', icon: 'ðŸ³', itemCount: 5 },
    { id: 2, category_name: 'Burgers', icon: 'ðŸ”', itemCount: 8 },
    { id: 3, category_name: 'Drinks', icon: 'ðŸ¥¤', itemCount: 12 },
    { id: 4, category_name: 'Smoothies', icon: 'ðŸ“', itemCount: 4 },
    { id: 5, category_name: 'Salads', icon: 'ðŸ¥—', itemCount: 6 }
  ]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    image: 'ðŸ½ï¸'
  });
  const [inlineEditingId, setInlineEditingId] = useState(null);
  const [inlineEditValue, setInlineEditValue] = useState('');

  // Dynamically sync and merge backend categories to local categories
  useEffect(() => {
    if (backendCategories && backendCategories.length > 0) {
      const dbCategories = backendCategories.map(cat => {
        const itemCount = items.filter(item => {
          const catName = item.category_name || item.category || '';
          return catName.toLowerCase() === cat.category_name.toLowerCase();
        }).length;
        return {
          id: cat.id,
          category_name: cat.category_name,
          icon: cat.icon || 'ðŸ½ï¸',
          itemCount
        };
      });

      setLocalCategories(dbCategories);
    }
  }, [backendCategories, items]);

  const categories = [
    { name: 'All Items', icon: Layers },
    ...localCategories.map(cat => ({
      name: cat.category_name,
      icon: Tag,
      id: cat.id
    }))
  ];

  // Logic Helpers
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveCategory = (data) => {
    const payload = {
      category_name: data.name,
      icon: data.image || 'ðŸ½ï¸'
    };

    if (editingCategory) {
      updateCategory(editingCategory.id, payload).then(res => {
        if (res.success) {
          showToast('Category updated successfully');
          setShowCategoryModal(false);
          setEditingCategory(null);
        } else {
          showToast(res.message || 'Failed to update category', 'error');
        }
      });
    } else {
      addCategory(payload).then(res => {
        if (res.success) {
          showToast('New category created');
          setShowCategoryModal(false);
          setEditingCategory(null);
        } else {
          showToast(res.message || 'Failed to create category', 'error');
        }
      });
    }
  };

  const handleDeleteCategoryClick = (id) => {
    if (confirm('Are you sure you want to delete this category? All items inside will remain in general.')) {
      deleteCategory(id).then(res => {
        if (res.success) {
          showToast('Category removed successfully', 'error');
        } else {
          showToast(res.message || 'Failed to delete category', 'error');
        }
      });
    }
  };

  const handleInlineSave = (id, newName) => {
    if (!newName.trim()) {
      showToast('Category name cannot be empty', 'error');
      return;
    }
    const cat = localCategories.find(c => c.id === id);
    const payload = {
      category_name: newName,
      icon: cat ? cat.icon : 'ðŸ½ï¸'
    };
    updateCategory(id, payload).then(res => {
      if (res.success) {
        showToast('Category name saved');
        setInlineEditingId(null);
      } else {
        showToast(res.message || 'Failed to save category name', 'error');
      }
    });
  };

  const handleSaveItem = (itemData) => {
    // Map category name to category_id
    const category = backendCategories.find(c => c.category_name === itemData.category);
    const payload = {
      item_name: itemData.name,
      description: itemData.description,
      price: itemData.price,
      category_id: category ? category.id : null,
      image: itemData.image,
      available: itemData.status,
      rating: itemData.rating,
      popular: itemData.popular,
      sizes: itemData.sizes && itemData.sizes.length > 0 ? JSON.stringify(itemData.sizes) : null,
      addons: itemData.addons && itemData.addons.length > 0 ? JSON.stringify(itemData.addons) : null
    };

    if (editingItem) {
      updateItem(editingItem.id, payload).then(res => {
        if (res.success) {
          showToast('Item updated successfully');
          setShowAddModal(false);
          setEditingItem(null);
        } else {
          showToast(res.message || 'Failed to update item', 'error');
        }
      });
    } else {
      addItem(payload).then(res => {
        if (res.success) {
          showToast('New item added to menu');
          setShowAddModal(false);
          setEditingItem(null);
        } else {
          showToast(res.message || 'Failed to add item', 'error');
        }
      });
    }
  };

  const handleDelete = (id) => {
    deleteItem(id);
    setShowDeleteConfirm(null);
    showToast('Item removed from menu', 'error');
  };

  const toggleAvailability = (id) => {
    const item = items.find(i => i.id === id);
    if (item) {
      const nextStatus = item.available === 'In Stock' ? 'Out of Stock' : 'In Stock';
      updateItem(id, { available: nextStatus });
      showToast('Availability status updated');
    }
  };

  const processedItems = items.map(item => ({
    ...item,
    name: item.item_name,
    category: item.category_name || item.category, // Handle both cases
    image: item.image || 'ðŸ½ï¸',
    rating: item.rating || 5.0,
    status: item.status || (item.available === '1' || item.available === true ? 'In Stock' : 'Out of Stock')
  }))
    .filter(item => activeCategory === 'All Items' || item.category === activeCategory)
    .filter(item => 
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="space-y-5 flex flex-col h-full overflow-hidden relative">
      {/* Toast Feedback */}
      {toast && (
        <div 
          className={cn(
            "fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest border",
            toast.type === 'success' ? "bg-primary border-primary/20 text-white" : "bg-primary border-primary/20 text-white"
          )}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-xl lg:text-2xl font-black text-text-primary uppercase tracking-tight leading-none">Menu Catalog</h2>
          <p className="text-text-secondary mt-1 text-xs lg:text-sm font-medium">Manage dishes and availability.</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setIsViewOnly(false); setShowAddModal(true); }}
          className="btn-primary flex items-center justify-center gap-2 py-3 lg:py-2.5 px-6 shadow-xl shadow-primary/20 text-[10px] lg:text-sm uppercase tracking-widest font-black transition-all hover:scale-[1.02] active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add Item
        </button>
      </div>

      {/* Premium Glassmorphic Category Management Section */}
      <div className="card p-5 bg-surface/30 backdrop-blur-md border border-slate-100/50 rounded-3xl shadow-sm mb-4 relative overflow-hidden shrink-0">
        <div className="absolute top-[-30%] right-[-10%] w-60 h-60 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-base font-black text-text-primary uppercase tracking-wider leading-none">Category Management</h3>
            <p className="text-text-secondary mt-1 text-[10px] lg:text-xs font-medium">Create and manage food categories</p>
          </div>
          <button 
            onClick={() => { setEditingCategory(null); setCategoryFormData({ name: '', image: 'ðŸ½ï¸' }); setShowCategoryModal(true); }}
            className="btn-primary flex items-center justify-center gap-2 py-2.5 px-5 shadow-xl shadow-primary/20 text-[10px] uppercase tracking-widest font-black transition-all hover:scale-[1.02] active:scale-95 cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Category
          </button>
        </div>

        {/* Categories Grid (2-column adaptive layout on tablet, 3-column on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {localCategories.map(cat => {
            const isInlineEditing = inlineEditingId === cat.id;
            return (
              <div 
                key={cat.id}
                className="flex flex-col sm:flex-row items-center sm:items-stretch gap-4 p-4 rounded-2xl bg-surface/60 backdrop-blur-sm border border-slate-100/80 shadow-sm hover:shadow-xl hover:border-primary/10 transition-all duration-300 hover:-translate-y-1 relative group"
              >
                {/* Image / Icon container */}
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-3xl shrink-0 overflow-hidden shadow-inner border border-slate-100 relative bg-surface">
                  {cat.icon && cat.icon.length > 2 ? (
                    <img src={cat.icon} alt={cat.category_name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{cat.icon || 'ðŸ½ï¸'}</span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-center text-center sm:text-left w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 justify-center sm:justify-start">
                    {isInlineEditing ? (
                      <div className="flex items-center gap-1 w-full max-w-[150px] mx-auto sm:mx-0">
                        <input 
                          type="text" 
                          value={inlineEditValue} 
                          onChange={(e) => setInlineEditValue(e.target.value)}
                          className="px-2.5 py-1 bg-surface border border-primary/30 rounded-lg outline-none font-bold text-xs focus:ring-2 focus:ring-primary/10 w-full"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <h5 className="font-black text-slate-800 text-sm uppercase tracking-wider truncate">{cat.category_name}</h5>
                    )}
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{cat.itemCount} Items</p>
                </div>

                {/* Action Icons with Hover transitions */}
                <div className="flex sm:flex-col justify-center sm:justify-end items-center gap-2 mt-3 sm:mt-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-200">
                  {isInlineEditing ? (
                    <>
                      <button 
                        onClick={() => handleInlineSave(cat.id, inlineEditValue)}
                        title="Save Changes"
                        className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer relative group/save"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded opacity-0 group-hover/save:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-30 shadow-md">Save Category</span>
                      </button>
                      <button 
                        onClick={() => setInlineEditingId(null)}
                        title="Cancel"
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-400 rounded-xl border border-slate-200 transition-all hover:scale-105 active:scale-95 cursor-pointer relative group/cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded opacity-0 group-hover/cancel:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-30 shadow-md">Cancel</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => {
                          setEditingCategory(cat);
                          setCategoryFormData({
                            name: cat.category_name,
                            image: cat.icon
                          });
                          setShowCategoryModal(true);
                        }}
                        title="Edit Category"
                        className="p-2 bg-surface hover:bg-primary-light text-slate-400 hover:text-primary rounded-xl border border-slate-100 hover:border-primary/20 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer relative group/btn"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-30 shadow-md">Edit Category</span>
                      </button>
                      <button 
                        onClick={() => {
                          setInlineEditingId(cat.id);
                          setInlineEditValue(cat.category_name);
                        }}
                        title="Inline Rename"
                        className="p-2 bg-surface hover:bg-indigo-50 text-slate-400 hover:text-primary rounded-xl border border-slate-100 hover:border-primary/20 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer relative group/inline"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded opacity-0 group-hover/inline:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-30 shadow-md">Inline Rename</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteCategoryClick(cat.id)}
                        title="Delete Category"
                        className="p-2 bg-surface hover:bg-rose-50 text-rose-400 hover:text-rose-600 rounded-xl border border-slate-100 hover:border-rose-100 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer relative group/del"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded opacity-0 group-hover/del:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-30 shadow-md">Delete Category</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-3 overflow-x-auto pb-2 lg:pb-4 scrollbar-hide shrink-0 -mx-1 px-1">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            className={cn(
              "px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl lg:rounded-2xl text-[8px] lg:text-[9px] font-black uppercase tracking-widest flex items-center gap-2 lg:gap-2.5 border-2 whitespace-nowrap transition-all",
              activeCategory === cat.name 
                ? "bg-primary text-white border-primary shadow-xl shadow-primary/20" 
                : "bg-surface text-slate-400 border-transparent hover:border-primary/20 hover:text-primary shadow-sm"
            )}
          >
            <cat.icon className={cn("w-3.5 h-3.5 lg:w-4 lg:h-4", activeCategory === cat.name ? "text-white" : "text-slate-300")} />
            {cat.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 flex-1 overflow-hidden">
        {/* Main Content - Full Width */}
        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          <div className="flex items-center gap-3 lg:gap-4 shrink-0">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog..." 
                className="w-full pl-10 lg:pl-11 pr-4 lg:pr-5 py-2.5 lg:py-3.5 bg-surface border border-slate-100 rounded-xl lg:rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none shadow-sm text-[9px] lg:text-[11px] font-bold uppercase tracking-widest placeholder:text-slate-300"
              />
            </div>
            <button 
              onClick={() => showToast('Advanced filters coming soon', 'success')}
              className="p-2.5 lg:p-3.5 bg-surface border border-slate-100 rounded-xl lg:rounded-2xl hover:bg-slate-50 shadow-sm group"
            >
              <Filter className="w-4 h-4 text-slate-400 group-hover:text-primary" />
            </button>
          </div>

          <div className="card p-0 overflow-hidden flex-1 flex flex-col shadow-2xl border-none bg-surface rounded-t-[2.5rem] lg:rounded-[2.5rem]">
            <div className="flex-1 overflow-y-auto scrollbar-hide pb-20 lg:pb-0">
              {/* Desktop Table View */}
              <table className="w-full hidden md:table">
                <thead className="sticky top-0 z-10">
                  <tr className="text-left text-slate-400 text-[9px] font-black uppercase tracking-[0.25em] border-b border-slate-50 bg-slate-50/50">
                    <th className="px-8 py-5">Product Intelligence</th>
                    <th className="px-8 py-5">Category</th>
                    <th className="px-8 py-5">Financials</th>
                    <th className="px-8 py-5">Stock State</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {processedItems.length > 0 ? (
                      processedItems.map((item) => (
                        <tr 
                          key={item.id} 
                          className={cn(
                            "text-xs hover:bg-slate-50/50 group cursor-pointer",
                            item.status === 'Out of Stock' && "bg-slate-50/30"
                          )}
                          onClick={() => setSelectedItem(item)}
                        >
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg border border-slate-50">
                                {getImageUrl(item.image).length > 2 ? (
                                  <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-3xl">{getImageUrl(item.image)}</span>
                                )}
                              </div>
                              <div>
                                 <span className="font-black text-text-primary text-base tracking-tight leading-none">{item.name}</span>
                                 <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest flex items-center gap-2">
                                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /> {item.rating} {item.popular ? 'â€¢ Popular' : ''}
                                 </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                             <span className="badge bg-indigo-50 text-primary font-black border-none text-[8px] uppercase tracking-widest">{item.category}</span>
                          </td>
                          <td className="px-8 py-5 font-black text-text-primary text-lg tracking-tighter">â‚¹{item.price}</td>
                          <td className="px-8 py-5">
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleAvailability(item.id); }}
                              className={cn(
                                "badge font-black border-2 py-1 px-3 text-[8px] uppercase tracking-widest",
                                item.status === 'In Stock' ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-100" :
                                item.status === 'Low Stock' ? "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-100" :
                                "bg-primary text-white border-rose-500 shadow-lg shadow-rose-100"
                              )}
                            >
                              {item.status}
                            </button>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setEditingItem(item); setIsViewOnly(true); setShowAddModal(true); }}
                                className="p-2.5 bg-surface text-slate-400 hover:text-primary hover:shadow-xl rounded-xl border border-slate-100"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setEditingItem(item); setIsViewOnly(false); setShowAddModal(true); }}
                                className="p-2.5 bg-surface text-slate-400 hover:text-primary hover:shadow-xl rounded-xl border border-slate-100"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(item); }}
                                className="p-2.5 bg-surface text-slate-400 hover:text-primary hover:shadow-xl rounded-xl border border-slate-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-20 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                              <Search className="w-8 h-8 text-slate-200" />
                            </div>
                            <h4 className="text-xl font-black text-text-primary uppercase tracking-tight">No menu items found</h4>
                            <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest mt-2">Adjust your search or filter to see more results</p>
                            <button 
                              onClick={() => { setActiveCategory('All Items'); setSearchQuery(''); }}
                              className="mt-6 text-primary font-black uppercase tracking-[0.2em] text-[8px] hover:underline"
                            >
                              Reset All Filters
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 p-4">
                {processedItems.length > 0 ? (
                  processedItems.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={cn(
                        "p-4 rounded-3xl border border-slate-100 bg-surface shadow-sm flex items-center gap-4 active:scale-95 transition-transform",
                        item.status === 'Out of Stock' && "opacity-60 bg-slate-50/50"
                      )}
                    >
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden shadow-inner shrink-0">
                        {getImageUrl(item.image).length > 2 ? (
                          <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl">{getImageUrl(item.image)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-black text-text-primary text-sm uppercase tracking-tight truncate">{item.name}</h4>
                          <p className="font-black text-primary text-sm ml-2">â‚¹{item.price}</p>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.category} â€¢ <Star className="w-2.5 h-2.5 fill-yellow-500 text-yellow-500 inline mb-0.5" /> {item.rating} {item.popular ? 'â€¢ Popular' : ''}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className={cn(
                            "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest",
                            item.status === 'In Stock' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-primary"
                          )}>
                            {item.status}
                          </span>
                          <div className="flex gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setEditingItem(item); setIsViewOnly(true); setShowAddModal(true); }}
                              className="p-2 bg-slate-50 rounded-lg text-slate-400"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setEditingItem(item); setIsViewOnly(false); setShowAddModal(true); }}
                              className="p-2 bg-slate-50 rounded-lg text-slate-400"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(item); }}
                              className="p-2 bg-slate-50 rounded-lg text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-slate-200" />
                    </div>
                    <h4 className="text-lg font-black text-text-primary uppercase">No items found</h4>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

        {showAddModal && (
          <AddItemModal 
            item={editingItem} 
            isViewOnly={isViewOnly}
            onClose={() => { setShowAddModal(false); setEditingItem(null); setIsViewOnly(false); }}
            onSave={handleSaveItem}
            categories={categories.filter(c => c.name !== 'All Items')}
          />
        )}
        {showCategoryModal && (
          <AddCategoryModal 
            category={editingCategory}
            formData={categoryFormData}
            setFormData={setCategoryFormData}
            onClose={() => { setShowCategoryModal(false); setEditingCategory(null); }}
            onSave={handleSaveCategory}
          />
        )}
        {showDeleteConfirm && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
           <div onClick={() => setShowDeleteConfirm(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
           <div 
             className="relative w-full max-w-sm bg-surface rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl self-center animate-in fade-in slide-in-from-bottom-4 sm:zoom-in duration-300"
           >
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-rose-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-center uppercase tracking-tight">Confirm Removal</h3>
              <p className="text-xs sm:text-sm text-center text-slate-400 mt-2 font-medium">Are you sure you want to remove <span className="text-slate-900 font-bold">{showDeleteConfirm.name}</span>?</p>
              <div className="mt-8 flex gap-3">
                <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-3.5 sm:py-4 border-2 border-slate-100 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-slate-50">Cancel</button>
                <button onClick={() => handleDelete(showDeleteConfirm.id)} className="flex-1 py-3.5 sm:py-4 bg-primary text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-xl shadow-rose-200">Delete</button>
              </div>
           </div>
        </div>,
        document.body
      )}
    </div>
  );
};

// Beautiful Glassmorphic Popup & Bottom-Sheet Add/Edit Category Modal
const AddCategoryModal = ({ category, formData, setFormData, onClose, onSave }) => {
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState(formData.image || 'ðŸ½ï¸');
  const [emojiInput, setEmojiInput] = useState(formData.image.length <= 2 ? formData.image : '');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        setFormData({ ...formData, image: reader.result });
        setEmojiInput('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmojiChange = (emoji) => {
    setEmojiInput(emoji);
    setPreviewUrl(emoji);
    setFormData({ ...formData, image: emoji });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Category name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 overflow-hidden">
      {/* Glassmorphic Backdrop overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose} 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-10" 
      />
      
      {/* Modal Container */}
      <motion.div 
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 350 } }}
        exit={{ y: 200, opacity: 0 }}
        className={cn(
          "relative w-full sm:max-w-lg bg-surface/90 backdrop-blur-xl rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl border border-white/20 flex flex-col max-h-[92vh] sm:max-h-[85vh] z-20",
          "fixed bottom-0 left-0 right-0 sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:self-center"
        )}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <Plus className="w-5 h-5 text-primary stroke-[3]" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight leading-none text-text-primary">
                {category ? 'Edit' : 'Add'} Category
              </h3>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 leading-none">
                {category ? 'Modify existing food group' : 'Define a new food category'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl border border-transparent shadow-sm transition-all cursor-pointer">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            {/* Category Icon / Image Preview Circle at Top */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary-hover/5 rounded-3xl flex items-center justify-center text-5xl shadow-lg border-2 border-white relative overflow-hidden group/prev">
                {previewUrl.length > 2 ? (
                  <img src={previewUrl} alt="Category Icon Preview" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <span>{previewUrl}</span>
                )}
                {previewUrl && previewUrl !== 'ðŸ½ï¸' && (
                  <button 
                    type="button"
                    onClick={() => { setPreviewUrl('ðŸ½ï¸'); setFormData({ ...formData, image: 'ðŸ½ï¸' }); setEmojiInput(''); }}
                    className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/prev:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-black uppercase tracking-wider cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Icon / Image Preview</p>
            </div>

            {/* Input Field: Category Name */}
            <div className="space-y-1.5 relative group">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Category Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter category name" 
                className={cn(
                  "w-full px-5 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-bold text-xs transition-all",
                  errors.name ? "border-rose-300 bg-rose-50/20" : "border-slate-100 text-text-primary"
                )}
                required
              />
              {errors.name && <p className="text-[9px] font-bold text-primary ml-1 mt-1">{errors.name}</p>}
            </div>

            {/* Input Field: Category Image Upload & Emoji Picker */}
            <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Category Graphic Setup</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Photo Drag & Drop Zone */}
                <div className="border-2 border-dashed border-slate-200 hover:border-primary/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 text-center relative transition-colors bg-slate-50/50 cursor-pointer min-h-[110px] group/upload">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-6 h-6 text-slate-300 group-hover/upload:text-primary transition-colors" />
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Upload Photo</span>
                  <span className="text-[7px] text-slate-300">Drag or drop files here</span>
                </div>

                {/* Emoji selection grid for instant branding */}
                <div className="border border-slate-100 rounded-2xl p-3 flex flex-col justify-between bg-surface/50">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Quick Icon Choice</span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {['ðŸ³', 'ðŸ”', 'ðŸ¥¤', 'ðŸ“', 'ðŸ¥—', 'ðŸ•', 'ðŸ°', 'ðŸŸ', 'ðŸœ', 'â˜•'].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleEmojiChange(emoji)}
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-primary-light transition-all cursor-pointer active:scale-90 border",
                          emojiInput === emoji ? "border-primary bg-indigo-50/50 scale-105" : "border-slate-50 bg-slate-50/20"
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions Area */}
          <div className="px-6 py-5 border-t border-slate-100 flex flex-row gap-3 bg-surface shrink-0">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-3.5 border-2 border-slate-100 rounded-2xl font-black uppercase tracking-widest text-[9px] text-slate-400 hover:bg-slate-50 transition-all text-center cursor-pointer active:scale-95"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 btn-primary py-3.5 rounded-full font-black uppercase tracking-widest shadow-xl shadow-primary/20 text-[9px] active:scale-95 transition-all text-center cursor-pointer flex items-center justify-center gap-2"
            >
              <Save className="w-3.5 h-3.5" /> Save Category
            </button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  );
};

const AddItemModal = ({ item, isViewOnly, onClose, onSave, categories }) => {
  // Parse sizes/addons safely from item
  const parseSafe = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return []; }
  };

  const [formData, setFormData] = useState({
    name: item?.name || item?.item_name || '',
    category: item?.category || item?.category_name || categories[0]?.name || '',
    price: item?.price || '',
    description: item?.description || '',
    status: item?.status || 'In Stock',
    image: item?.image || '',
    rating: item?.rating || 5,
    popular: !!item?.popular,
    addons: parseSafe(item?.addons),
    sizes: parseSafe(item?.sizes)
  });
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState(item?.image || '');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Sizes helpers
  const addSizeRow = () => setFormData(prev => ({ ...prev, sizes: [...prev.sizes, { name: '', price: 0 }] }));
  const updateSize = (idx, field, val) => setFormData(prev => ({ ...prev, sizes: prev.sizes.map((s, i) => i === idx ? { ...s, [field]: val } : s) }));
  const removeSize = (idx) => setFormData(prev => ({ ...prev, sizes: prev.sizes.filter((_, i) => i !== idx) }));
  const applyRegularLargePreset = () => {
    setFormData(prev => ({ ...prev, sizes: [{ name: 'Regular', price: 0 }, { name: 'Large', price: 0 }] }));
  };

  // Addons helpers
  const addModifierRow = () => setFormData(prev => ({ ...prev, addons: [...prev.addons, { name: '', price: 0 }] }));
  const updateAddon = (idx, field, val) => setFormData(prev => ({ ...prev, addons: prev.addons.map((a, i) => i === idx ? { ...a, [field]: val } : a) }));
  const removeAddon = (idx) => setFormData(prev => ({ ...prev, addons: prev.addons.filter((_, i) => i !== idx) }));

  const QUICK_PRESETS = [
    { label: 'ðŸ¥› Milk Options', items: [{ name: 'Almond Milk', price: 50 }, { name: 'Soy Milk', price: 50 }, { name: 'Oat Milk', price: 60 }] },
    { label: 'ðŸ¬ Sugar Options', items: [{ name: 'Sugar Free', price: 0 }, { name: 'Half Sugar', price: 0 }, { name: 'Extra Sugar', price: 0 }] },
    { label: 'ðŸ Extras', items: [{ name: 'Extra Cheese', price: 50 }, { name: 'Add Egg', price: 30 }, { name: 'Extra Toppings', price: 40 }] },
    { label: 'ðŸª‘ Service Type', items: [{ name: 'Dine In', price: 0 }, { name: 'Takeaway', price: 0 }, { name: 'Delivery', price: 50 }] }
  ];

  const applyQuickPreset = (presetItems) => {
    setFormData(prev => {
      const existing = prev.addons.map(a => a.name.toLowerCase());
      const newItems = presetItems.filter(pi => !existing.includes(pi.name.toLowerCase()));
      return { ...prev, addons: [...prev.addons, ...newItems] };
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Item name is required';
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.category) newErrors.category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  const isAvailable = formData.status === 'In Stock';

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center">
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div
        className="relative w-full sm:max-w-[650px] bg-white rounded-t-[2rem] sm:rounded-[1.75rem] shadow-2xl border border-white/20 self-end sm:self-center flex flex-col max-h-[95vh]"
        style={{ animation: 'slideUpModal 0.32s cubic-bezier(.4,1.4,.6,1) both' }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0 rounded-t-[2rem] sm:rounded-t-[1.75rem]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
              <Plus className="w-5 h-5 text-primary stroke-[3]" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight leading-none text-slate-900">
                {isViewOnly ? 'View' : (item ? 'Edit' : 'Add')} Menu Item
              </h3>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 leading-none">
                {isViewOnly ? 'Product details' : (item ? 'Modify existing entry' : 'Define new experience')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all cursor-pointer">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto scrollbar-hide">

            {/* â”€â”€ Row 1: Image + Title / Price / Category â”€â”€ */}
            <div className="p-6 flex flex-col sm:flex-row gap-5">
              {/* Dashed Upload Box */}
              <div className="shrink-0 self-start">
                <label className="w-28 h-28 rounded-2xl border-2 border-dashed border-slate-200 hover:border-primary flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-slate-50 hover:bg-indigo-50/40 transition-colors relative overflow-hidden group block">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" disabled={isViewOnly} />
                  {previewUrl && previewUrl.length > 2 ? (
                    <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : previewUrl ? (
                    <span className="text-4xl">{previewUrl}</span>
                  ) : (
                    <>
                      <Camera className="w-7 h-7 text-slate-300 group-hover:text-primary transition-colors" />
                      <span className="text-[8px] font-black text-slate-300 group-hover:text-primary uppercase tracking-wider transition-colors text-center leading-tight px-1">Upload Image</span>
                    </>
                  )}
                  {previewUrl && (
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  )}
                </label>
              </div>

              {/* Right: Title + Price + Category */}
              <div className="flex-1 space-y-3.5">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Product Title</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Classic Margherita"
                    disabled={isViewOnly}
                    className={cn(
                      "w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-60",
                      errors.name ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'
                    )}
                  />
                  {errors.name && <p className="text-[9px] text-rose-500 font-bold mt-1">{errors.name}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Base Price (â‚¹)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="299"
                      disabled={isViewOnly}
                      className={cn(
                        "w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-60",
                        errors.price ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'
                      )}
                    />
                    {errors.price && <p className="text-[9px] text-rose-500 font-bold mt-1">{errors.price}</p>}
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Category</label>
                    <div className="relative">
                      <select
                        value={formData.category}
                        onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        disabled={isViewOnly}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all disabled:opacity-60"
                      >
                        {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                      <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100 mx-6" />

            {/* â”€â”€ Row 2: Description + Icon + Availability â”€â”€ */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Description */}
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Product Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe flavors and ingredients..."
                  rows={3}
                  disabled={isViewOnly}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none disabled:opacity-60"
                />
              </div>

              {/* Icon + Availability */}
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Product Icon / Emoji</label>
                  <input
                    type="text"
                    value={formData.image && formData.image.length <= 4 ? formData.image : ''}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, image: val }));
                      if (val && val.length <= 4) setPreviewUrl(val);
                    }}
                    placeholder="e.g. ðŸ” or ðŸŒ®"
                    disabled={isViewOnly}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Availability Status</label>
                  <button
                    type="button"
                    disabled={isViewOnly}
                    onClick={() => setFormData(prev => ({ ...prev, status: prev.status === 'In Stock' ? 'Out of Stock' : 'In Stock' }))}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-60",
                      isAvailable
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    )}
                  >
                    <span className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200",
                      isAvailable ? 'bg-emerald-500' : 'bg-slate-300'
                    )}>
                      <span className={cn(
                        "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
                        isAvailable ? 'translate-x-4' : 'translate-x-0.5'
                      )} />
                    </span>
                    {isAvailable ? 'Available / In Stock' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100 mx-6" />

            {/* â”€â”€ Row 3: Portion Sizes & Variants â”€â”€ */}
            <div className="p-6 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Portion Sizes &amp; Variants</p>
                  <p className="text-[8px] text-slate-300 font-bold mt-0.5">Specify different sizes and their pricing</p>
                </div>
                {!isViewOnly && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={applyRegularLargePreset}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-primary border border-indigo-100 rounded-lg text-[8px] font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
                    >
                      <Sparkles className="w-3 h-3" /> Regular &amp; Large Preset
                    </button>
                    <button
                      type="button"
                      onClick={addSizeRow}
                      className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-[8px] font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-md shadow-primary/25"
                    >
                      <Plus className="w-3 h-3 stroke-[3]" /> Add Size Row
                    </button>
                  </div>
                )}
              </div>

              {/* Size rows */}
              {formData.sizes.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">No portion sizes defined. Item will use the base price directly.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {formData.sizes.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={s.name}
                        onChange={e => updateSize(idx, 'name', e.target.value)}
                        placeholder="e.g. Regular, Large"
                        disabled={isViewOnly}
                        className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-xs font-black text-slate-400">â‚¹</span>
                        <input
                          type="number"
                          value={s.price}
                          onChange={e => updateSize(idx, 'price', e.target.value)}
                          disabled={isViewOnly}
                          className="w-24 pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                      {!isViewOnly && (
                        <button
                          type="button"
                          onClick={() => removeSize(idx)}
                          className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100 mx-6" />

            {/* â”€â”€ Row 4: Custom Modifiers & Add-ons â”€â”€ */}
            <div className="p-6 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Custom Modifiers &amp; Add-ons</p>
                  <p className="text-[8px] text-slate-300 font-bold mt-0.5">Define customization options for this item</p>
                </div>
                {!isViewOnly && (
                  <button
                    type="button"
                    onClick={addModifierRow}
                    className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-[8px] font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-md shadow-primary/25 shrink-0"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" /> Add Modifier Row
                  </button>
                )}
              </div>

              {/* Quick Presets */}
              {!isViewOnly && (
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Quick Presets:</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_PRESETS.map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => applyQuickPreset(preset.items)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-primary/30 text-slate-500 hover:text-primary rounded-lg text-[8px] font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Addon rows */}
              {formData.addons.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">No custom modifiers defined. Beverage will use the defaults.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {formData.addons.map((a, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={a.name}
                        onChange={e => updateAddon(idx, 'name', e.target.value)}
                        placeholder="e.g. Soy Milk, Extra shot"
                        disabled={isViewOnly}
                        className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-xs font-black text-slate-400">â‚¹</span>
                        <input
                          type="number"
                          value={a.price}
                          onChange={e => updateAddon(idx, 'price', e.target.value)}
                          disabled={isViewOnly}
                          className="w-24 pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                      {!isViewOnly && (
                        <button
                          type="button"
                          onClick={() => removeAddon(idx)}
                          className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* â”€â”€ Popular Toggle â”€â”€ */}
            <div className="px-6 pb-5 flex items-center gap-3">
              <button
                type="button"
                disabled={isViewOnly}
                onClick={() => setFormData(prev => ({ ...prev, popular: !prev.popular }))}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-60",
                  formData.popular ? 'bg-primary' : 'bg-slate-200'
                )}
              >
                <span className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
                  formData.popular ? 'translate-x-4' : 'translate-x-0.5'
                )} />
              </button>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mark as Popular Item</span>
            </div>
          </div>

          {/* â”€â”€ Footer Actions â”€â”€ */}
          <div className="px-6 py-4 border-t border-slate-100 bg-white flex gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 border-2 border-slate-200 rounded-2xl font-black uppercase tracking-widest text-[9px] text-slate-400 hover:bg-slate-50 transition-all cursor-pointer active:scale-95"
            >
              {isViewOnly ? 'Close' : 'Cancel'}
            </button>
            {!isViewOnly && (
              <button
                type="submit"
                className="flex-1 btn-primary py-3.5 rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-xl shadow-primary/20 transition-all cursor-pointer active:scale-95"
              >
                {item ? 'Update Entry' : 'Deploy Item'}
              </button>
            )}
          </div>
        </form>
      </div>

      <style>{`
        @keyframes slideUpModal {
          from { opacity: 0; transform: translateY(40px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)  scale(1); }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default Menu;
