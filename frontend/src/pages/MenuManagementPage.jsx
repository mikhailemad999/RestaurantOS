import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  BookOpen, Plus, Search, Edit3, Trash2, Check, 
  X, AlertTriangle, DollarSign, Percent, Flame, ChefHat
} from 'lucide-react';

export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit / Create Modal
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    cost_price: '',
    sku: '',
    prep_time_minutes: 12,
    station: 'GRILL',
    image_url: '',
    description: '',
    calories: 0,
    allergens: '',
    is_available: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [items, cats] = await Promise.all([
        api.getMenuItems(),
        api.getCategories()
      ]);
      setMenuItems(items);
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load menu data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (id) => {
    try {
      const res = await api.toggleItemAvailability(id);
      setMenuItems(menuItems.map(item => 
        item.id === id ? { ...item, is_available: res.is_available } : item
      ));
    } catch (err) {
      alert(`Error updating availability: ${err.message}`);
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: categories[0]?.id || '',
      price: '',
      cost_price: '',
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      prep_time_minutes: 12,
      station: 'GRILL',
      image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500',
      description: '',
      calories: 450,
      allergens: '',
      is_available: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      cost_price: item.cost_price,
      sku: item.sku,
      prep_time_minutes: item.prep_time_minutes,
      station: item.station,
      image_url: item.image_url,
      description: item.description,
      calories: item.calories,
      allergens: item.allergens,
      is_available: item.is_available
    });
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.updateMenuItem(editingItem.id, formData);
      } else {
        await api.createMenuItem(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert(`Error saving menu item: ${err.message}`);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await api.deleteMenuItem(id);
      setMenuItems(menuItems.filter(item => item.id !== id));
    } catch (err) {
      alert(`Error deleting item: ${err.message}`);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCat = selectedCategory === 'ALL' || item.category_name === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-full p-4 md:p-6 bg-[#131313] flex flex-col space-y-4">
      {/* Header */}
      <div className="bg-[#1c1b1b] p-4 rounded-xl border border-[#2a2a2a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#d4af37]" />
            Menu Management & Recipe Costing
          </h1>
          <p className="text-xs text-[#99907c] font-mono">Catalog pricing, gross margins, and 86 availability control</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-[#d4af37] hover:bg-[#f2ca50] text-black font-bold text-xs rounded-lg flex items-center gap-2 shadow-gold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#1c1b1b] p-3 rounded-xl border border-[#2a2a2a] flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#99907c] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by name, SKU..."
            className="w-full bg-[#131313] border border-[#353535] text-white text-xs rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-[#d4af37]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              selectedCategory === 'ALL'
                ? 'bg-[#d4af37] text-black font-bold'
                : 'bg-[#131313] border border-[#353535] text-[#d0c5af]'
            }`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                selectedCategory === cat.name
                  ? 'bg-[#d4af37] text-black font-bold'
                  : 'bg-[#131313] border border-[#353535] text-[#d0c5af]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#20201f] text-[#99907c] uppercase text-[10px] tracking-wider border-b border-[#2a2a2a]">
              <tr>
                <th className="p-3.5">Item & SKU</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Station</th>
                <th className="p-3.5">Sell Price</th>
                <th className="p-3.5">Cost Price</th>
                <th className="p-3.5">Margin %</th>
                <th className="p-3.5 text-center">86 / Available</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-[#99907c] font-sans">
                    Loading menu catalog...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-[#99907c] font-sans">
                    No items found matching the filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const price = parseFloat(item.price);
                  const cost = parseFloat(item.cost_price || 0);
                  const margin = price > 0 ? (((price - cost) / price) * 100).toFixed(1) : 0;

                  return (
                    <tr key={item.id} className="hover:bg-[#20201f] transition-colors">
                      {/* Image & Title */}
                      <td className="p-3.5 flex items-center gap-3">
                        <img 
                          src={item.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=100'} 
                          alt={item.name} 
                          className="w-10 h-10 rounded object-cover border border-[#353535]"
                        />
                        <div>
                          <span className="font-bold text-white font-sans block">{item.name}</span>
                          <span className="text-[10px] text-[#99907c]">{item.sku}</span>
                        </div>
                      </td>

                      <td className="p-3.5 text-[#d0c5af]">{item.category_name}</td>

                      <td className="p-3.5">
                        <span className="bg-[#131313] border border-[#353535] px-2 py-0.5 rounded text-[10px] text-[#d4af37]">
                          {item.station}
                        </span>
                      </td>

                      <td className="p-3.5 font-bold text-white">${price.toFixed(2)}</td>
                      <td className="p-3.5 text-[#99907c]">${cost.toFixed(2)}</td>

                      <td className="p-3.5">
                        <span className={`font-bold ${margin >= 65 ? 'text-[#4edea3]' : margin >= 50 ? 'text-[#d4af37]' : 'text-[#ff949c]'}`}>
                          {margin}%
                        </span>
                      </td>

                      {/* 86 Toggle */}
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleToggleAvailability(item.id)}
                          className={`px-3 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                            item.is_available
                              ? 'bg-[#005236]/40 text-[#4edea3] border border-[#4edea3]/40'
                              : 'bg-[#92002a]/40 text-[#ffb4ab] border border-[#ffb4ab]/40'
                          }`}
                        >
                          {item.is_available ? 'Active (In Stock)' : '86 / Sold Out'}
                        </button>
                      </td>

                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 bg-[#131313] hover:bg-[#2a2a2a] text-[#d0c5af] hover:text-white rounded border border-[#353535]"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 bg-[#131313] hover:bg-[#92002a]/30 text-[#ffb4ab] rounded border border-[#353535]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-[#1c1b1b] border border-[#d4af37] rounded-xl p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2a2a2a]">
              <h3 className="text-lg font-bold text-white">
                {editingItem ? `Edit Dish: ${editingItem.name}` : 'Create New Menu Item'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#99907c] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Sell Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Kitchen Station</label>
                  <select
                    value={formData.station}
                    onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none"
                  >
                    <option value="GRILL">GRILL</option>
                    <option value="FRYER">FRYER</option>
                    <option value="ASSEMBLY">ASSEMBLY</option>
                    <option value="BAR">BAR</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Prep Time (Mins)</label>
                  <input
                    type="number"
                    value={formData.prep_time_minutes}
                    onChange={(e) => setFormData({ ...formData, prep_time_minutes: Number(e.target.value) })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Image URL</label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-[#2a2a2a] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#20201f] text-white rounded hover:bg-[#2a2a2a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d4af37] hover:bg-[#f2ca50] text-black font-bold rounded shadow-gold uppercase font-mono"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
