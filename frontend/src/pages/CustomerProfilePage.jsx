import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  User, Phone, Mail, MapPin, Star, Clock, ShoppingBag, 
  DollarSign, Plus, Check, Trash2, ArrowLeft, Heart, 
  Calendar, RotateCcw, Truck, FileText, AlertCircle, X
} from 'lucide-react';

export default function CustomerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [customer, setCustomer] = useState(null);
  const [stats, setStats] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Address & Note Modals
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);

  const [newAddress, setNewAddress] = useState({
    label: 'HOME',
    city: 'Cairo',
    area: 'New Cairo',
    street: '',
    building: '',
    floor: '',
    apartment: '',
    landmark: '',
    instructions: '',
    is_default: false
  });

  const [newNote, setNewNote] = useState({
    note_type: 'DELIVERY',
    content: ''
  });

  useEffect(() => {
    if (id) {
      loadCustomerDetails();
    }
  }, [id]);

  const loadCustomerDetails = async () => {
    try {
      setLoading(true);
      const [custRes, statsRes, favsRes, allOrdersRes] = await Promise.all([
        api.getCustomerById(id),
        api.getCustomerProfileStats(id),
        api.getCustomerFavorites(id),
        api.getOrders()
      ]);

      setCustomer(custRes);
      setStats(statsRes);
      setFavorites(favsRes || []);
      const custOrders = allOrdersRes.filter(o => o.customer === Number(id) || o.customer_id === Number(id));
      setOrders(custOrders);
    } catch (err) {
      console.error('Failed to load customer profile:', err);
      addToast(`Error loading customer: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultAddress = async (addrId) => {
    try {
      await api.setDefaultAddress(addrId);
      addToast('Default address updated!', 'success');
      loadCustomerDetails();
    } catch (err) {
      addToast(`Failed to set default: ${err.message}`, 'error');
    }
  };

  const handleDeleteAddress = async (addrId) => {
    try {
      await api.deleteCustomerAddress(addrId);
      addToast('Address removed', 'info');
      loadCustomerDetails();
    } catch (err) {
      addToast(`Failed to delete address: ${err.message}`, 'error');
    }
  };

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    try {
      await api.createCustomerAddress({
        ...newAddress,
        customer: id
      });
      addToast('New address saved to address book!', 'success');
      setIsAddAddressOpen(false);
      loadCustomerDetails();
    } catch (err) {
      addToast(`Failed to add address: ${err.message}`, 'error');
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    try {
      await api.createCustomerNote({
        ...newNote,
        customer: id
      });
      addToast('Customer note added!', 'success');
      setIsAddNoteOpen(false);
      setNewNote({ note_type: 'DELIVERY', content: '' });
      loadCustomerDetails();
    } catch (err) {
      addToast(`Failed to add note: ${err.message}`, 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-full p-8 flex items-center justify-center text-[#d4af37] font-mono">
        Loading Customer Profile #{id}...
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-full p-8 text-center text-white space-y-4">
        <p>Customer not found.</p>
        <button onClick={() => navigate('/crm')} className="px-4 py-2 bg-[#d4af37] text-black font-bold rounded">
          Back to CRM
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-full p-4 md:p-6 bg-[#131313] flex flex-col space-y-5">
      {/* Top Breadcrumb & Action Bar */}
      <div className="bg-[#1c1b1b] p-4 rounded-xl border border-[#2a2a2a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-[#131313] hover:bg-[#2a2a2a] border border-[#353535] rounded-xl text-[#99907c] hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-wide">{customer.name}</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#005236] text-[#4edea3] font-bold">
                {customer.vip_tier} VIP
              </span>
              <span className="text-[10px] font-mono text-[#99907c]">{customer.customer_code || `CUST-${customer.id}`}</span>
            </div>
            <p className="text-xs text-[#99907c] font-mono">
              {customer.phone} {customer.email ? `• ${customer.email}` : ''} • Member since {new Date(customer.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/delivery-order')}
            className="px-4 py-2 bg-[#d4af37] hover:bg-[#f2ca50] text-black font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-gold cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>+ Start Delivery Order</span>
          </button>
        </div>
      </div>

      {/* 4-KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-4 shadow-card">
          <span className="text-[10px] font-mono uppercase text-[#99907c]">Lifetime Spend</span>
          <div className="text-2xl font-extrabold text-[#d4af37] font-mono mt-1">
            ${parseFloat(customer.total_spent || 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-[#4edea3] font-mono">AOV: ${stats?.average_order_value?.toFixed(2) || '0.00'}</span>
        </div>

        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-4 shadow-card">
          <span className="text-[10px] font-mono uppercase text-[#99907c]">Total Order Volume</span>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            {stats?.total_orders || customer.visit_count} Orders
          </div>
          <span className="text-[10px] text-[#99907c] font-mono">
            {stats?.delivery_orders_count || 0} Delivery • {stats?.dine_in_count || 0} Dine-in
          </span>
        </div>

        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-4 shadow-card">
          <span className="text-[10px] font-mono uppercase text-[#99907c]">Loyalty Points Balance</span>
          <div className="text-2xl font-extrabold text-[#4edea3] font-mono mt-1 flex items-center gap-2">
            {customer.loyalty_points} <Star className="w-5 h-5 fill-[#4edea3]" />
          </div>
          <span className="text-[10px] text-[#99907c] font-mono">Redeemable in POS</span>
        </div>

        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-4 shadow-card">
          <span className="text-[10px] font-mono uppercase text-[#99907c]">Favorite Menu Category</span>
          <div className="text-xl font-bold text-white font-mono mt-1 truncate">
            {stats?.favorite_category || 'Gourmet Entrees'}
          </div>
          <span className="text-[10px] text-[#d4af37] font-mono">Top repeat category</span>
        </div>
      </div>

      {/* Main Grid: Addresses & Notes / Order Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Address Book & Notes (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Saved Addresses */}
          <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#d4af37]" />
                Saved Delivery Addresses ({customer.addresses?.length || 0})
              </h3>
              <button
                onClick={() => setIsAddAddressOpen(true)}
                className="px-3 py-1 bg-[#20201f] hover:bg-[#353535] text-[#d4af37] rounded-lg text-xs font-mono font-bold"
              >
                + Add Address
              </button>
            </div>

            <div className="space-y-3">
              {customer.addresses?.map(addr => (
                <div key={addr.id} className="p-3 bg-[#131313] border border-[#2a2a2a] rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      {addr.label === 'HOME' ? '🏠' : addr.label === 'WORK' ? '🏢' : '📍'} {addr.label}
                      {addr.is_default && (
                        <span className="px-1.5 py-0.5 rounded bg-[#005236] text-[#4edea3] text-[9px]">DEFAULT</span>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      {!addr.is_default && (
                        <button
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="text-[10px] text-[#99907c] hover:text-[#4edea3] font-mono"
                        >
                          Make Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-[#99907c] hover:text-[#ff949c]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="font-sans text-xs text-[#d0c5af]">
                    {addr.street}, {addr.building ? `Bldg ${addr.building}, ` : ''}{addr.apartment ? `Apt ${addr.apartment}` : ''}
                  </p>
                  <p className="text-[10px] text-[#99907c] font-mono">
                    {addr.area}, {addr.city} {addr.landmark ? `• Near ${addr.landmark}` : ''}
                  </p>
                  {addr.instructions && (
                    <p className="text-[10px] text-[#d4af37] italic font-mono">
                      Instruction: {addr.instructions}
                    </p>
                  )}
                </div>
              ))}
              {(!customer.addresses || customer.addresses.length === 0) && (
                <div className="py-6 text-center text-xs text-[#99907c] font-mono">
                  No delivery address saved yet.
                </div>
              )}
            </div>
          </div>

          {/* Categorized Customer Notes */}
          <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#d4af37]" />
                Customer Notes & Preferences ({customer.customer_notes?.length || 0})
              </h3>
              <button
                onClick={() => setIsAddNoteOpen(true)}
                className="px-3 py-1 bg-[#20201f] hover:bg-[#353535] text-[#d4af37] rounded-lg text-xs font-mono font-bold"
              >
                + Add Note
              </button>
            </div>

            <div className="space-y-2.5">
              {customer.customer_notes?.map(note => (
                <div key={note.id} className="p-3 bg-[#131313] border border-[#2a2a2a] rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-[#20201f] text-[#d4af37] font-bold">
                      {note.note_type}
                    </span>
                    <span className="text-[#99907c]">{new Date(note.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-white font-sans text-xs pt-1">{note.content}</p>
                </div>
              ))}
              {(!customer.customer_notes || customer.customer_notes.length === 0) && (
                <div className="py-4 text-center text-xs text-[#99907c] font-mono">
                  No special notes logged.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right: Favorite Dishes & Order History Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Favorite Dishes Bar */}
          {favorites.length > 0 && (
            <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-5 shadow-card space-y-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Heart className="w-4 h-4 fill-[#d4af37] text-[#d4af37]" />
                Top Frequently Ordered Dishes
              </h3>

              <div className="grid grid-cols-3 gap-3">
                {favorites.map(fav => (
                  <div key={fav.menu_item_id} className="bg-[#131313] border border-[#2a2a2a] p-3 rounded-xl text-xs space-y-1">
                    <h4 className="font-bold text-white truncate">{fav.name}</h4>
                    <div className="flex justify-between items-center text-[10px] font-mono text-[#99907c]">
                      <span className="text-[#d4af37] font-bold">${fav.price}</span>
                      <span>Ordered {fav.times_ordered}x</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order History Timeline */}
          <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-5 shadow-card space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#d4af37]" />
              Order History & Delivery Timeline ({orders.length})
            </h3>

            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {orders.map(ord => (
                <div key={ord.id} className="p-4 bg-[#131313] border border-[#2a2a2a] rounded-xl text-xs space-y-2 hover:border-[#353535] transition-colors">
                  <div className="flex items-center justify-between font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white">#{ord.order_number}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#20201f] text-[#d4af37] font-bold">
                        {ord.order_type}
                      </span>
                    </div>
                    <span className="font-bold text-white text-sm text-[#d4af37]">
                      ${parseFloat(ord.total_amount).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#99907c] font-mono">
                    <span>{new Date(ord.created_at).toLocaleString()}</span>
                    <span className={`font-bold ${ord.status === 'COMPLETED' ? 'text-[#4edea3]' : 'text-[#d4af37]'}`}>
                      ● {ord.status} ({ord.payment_status})
                    </span>
                  </div>

                  {ord.items && ord.items.length > 0 && (
                    <div className="pt-2 border-t border-[#20201f] text-[11px] text-[#d0c5af] font-mono space-y-0.5">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{it.quantity}x {it.menu_item_name || it.name}</span>
                          <span className="text-[#99907c]">${parseFloat(it.total_price || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {orders.length === 0 && (
                <div className="py-8 text-center text-xs text-[#99907c] font-mono">
                  No past orders on record.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ADD ADDRESS MODAL */}
      {isAddAddressOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-[#d4af37] rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2a2a2a]">
              <h3 className="text-base font-bold text-white">Add Delivery Address</h3>
              <button onClick={() => setIsAddAddressOpen(false)} className="text-[#99907c] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAddress} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Label</label>
                  <select
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded-xl font-mono focus:border-[#d4af37] focus:outline-none"
                  >
                    <option value="HOME">Home</option>
                    <option value="WORK">Work / Office</option>
                    <option value="FAMILY">Family / Parents</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Area</label>
                  <select
                    value={newAddress.area}
                    onChange={(e) => setNewAddress({ ...newAddress, area: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded-xl font-mono focus:border-[#d4af37] focus:outline-none"
                  >
                    <option value="New Cairo">New Cairo</option>
                    <option value="Maadi">Maadi</option>
                    <option value="Nasr City">Nasr City</option>
                    <option value="Heliopolis">Heliopolis</option>
                    <option value="Downtown">Downtown / Zamalek</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Street 90 South"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded-xl focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Building</label>
                  <input
                    type="text"
                    value={newAddress.building}
                    onChange={(e) => setNewAddress({ ...newAddress, building: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Floor</label>
                  <input
                    type="text"
                    value={newAddress.floor}
                    onChange={(e) => setNewAddress({ ...newAddress, floor: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Apartment</label>
                  <input
                    type="text"
                    value={newAddress.apartment}
                    onChange={(e) => setNewAddress({ ...newAddress, apartment: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Landmark</label>
                <input
                  type="text"
                  value={newAddress.landmark}
                  onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded-xl focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#2a2a2a] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAddressOpen(false)}
                  className="px-4 py-2 bg-[#20201f] text-white rounded-xl font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d4af37] text-black font-bold rounded-xl shadow-gold uppercase font-mono cursor-pointer"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NOTE MODAL */}
      {isAddNoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-[#d4af37] rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2a2a2a]">
              <h3 className="text-base font-bold text-white">Add Customer Note</h3>
              <button onClick={() => setIsAddNoteOpen(false)} className="text-[#99907c] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-3 text-xs">
              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Note Category</label>
                <select
                  value={newNote.note_type}
                  onChange={(e) => setNewNote({ ...newNote, note_type: e.target.value })}
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded-xl font-mono focus:border-[#d4af37] focus:outline-none"
                >
                  <option value="DELIVERY">Delivery Note</option>
                  <option value="FOOD_PREFERENCE">Food & Dietary Preference</option>
                  <option value="VIP">VIP / Service Touchpoint</option>
                  <option value="ADDRESS">Address Guidance</option>
                  <option value="OTHER">Other Note</option>
                </select>
              </div>

              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Note Content *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Enter notes on preferences, dietary restrictions, or delivery details..."
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded-xl focus:border-[#d4af37] focus:outline-none font-sans"
                />
              </div>

              <div className="pt-3 border-t border-[#2a2a2a] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddNoteOpen(false)}
                  className="px-4 py-2 bg-[#20201f] text-white rounded-xl font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d4af37] text-black font-bold rounded-xl shadow-gold uppercase font-mono cursor-pointer"
                >
                  Add Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
