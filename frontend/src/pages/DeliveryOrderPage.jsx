import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { 
  Phone, Search, User, MapPin, Plus, Check, RotateCcw, 
  ShoppingBag, Sparkles, AlertCircle, DollarSign, Clock, 
  Truck, ArrowRight, X, Edit3, Heart, CheckCircle2, ShieldAlert
} from 'lucide-react';

export default function DeliveryOrderPage() {
  const { addToast } = useToast();
  const { currentStaff } = useAuth();

  // Search & Customer State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Repeat Order & Favorites State
  const [lastOrder, setLastOrder] = useState(null);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [loadingLastOrder, setLoadingLastOrder] = useState(false);

  // Menu & Cart State
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [cart, setCart] = useState([]);

  // Delivery Zones & Notes
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [kitchenNote, setKitchenNote] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // CASH (COD), CARD, ONLINE

  // Modals
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  // Form State
  const [newCustForm, setNewCustForm] = useState({
    name: '',
    phone: '',
    secondary_phone: '',
    email: '',
    area: 'New Cairo',
    street: '',
    building: '',
    floor: '',
    apartment: '',
    landmark: '',
    instructions: '',
    notes: ''
  });

  const [newAddressForm, setNewAddressForm] = useState({
    label: 'HOME',
    city: 'Cairo',
    area: 'New Cairo',
    street: '',
    building: '',
    floor: '',
    apartment: '',
    landmark: '',
    instructions: '',
    is_default: true
  });

  // Initial Load
  useEffect(() => {
    loadMenuAndZones();
  }, []);

  const loadMenuAndZones = async () => {
    try {
      const [catsRes, itemsRes, zonesRes] = await Promise.all([
        api.getCategories(),
        api.getMenuItems(),
        api.getDeliveryZones()
      ]);
      setCategories(catsRes);
      setMenuItems(itemsRes);
      setZones(zonesRes);
      if (zonesRes.length > 0) {
        setSelectedZone(zonesRes[0]);
      }
    } catch (err) {
      console.error('Failed to load menu/zones:', err);
    }
  };

  // Debounced Phone / Name Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await api.getCustomers(searchQuery.trim());
        setSearchResults(res);
      } catch (err) {
        console.error('Customer search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Select Customer Workflow
  const handleSelectCustomer = async (cust) => {
    setSelectedCustomer(cust);
    setSearchQuery('');
    setSearchResults([]);

    // Select default address if exists
    if (cust.addresses && cust.addresses.length > 0) {
      const def = cust.addresses.find(a => a.is_default) || cust.addresses[0];
      setSelectedAddress(def);
      // Auto-match delivery zone
      const matchedZone = zones.find(z => z.name.toLowerCase().includes(def.area.toLowerCase()));
      if (matchedZone) setSelectedZone(matchedZone);
    } else {
      setSelectedAddress(null);
    }

    // Load Last Order & Favorites
    try {
      setLoadingLastOrder(true);
      const [lastOrdRes, favsRes] = await Promise.all([
        api.getCustomerLastOrder(cust.id),
        api.getCustomerFavorites(cust.id)
      ]);
      setLastOrder(lastOrdRes.order_id ? lastOrdRes : null);
      setFavoriteItems(favsRes || []);
    } catch (err) {
      console.error('Failed to load customer history:', err);
    } finally {
      setLoadingLastOrder(false);
    }

    addToast(`Customer ${cust.name} loaded. History retrieved.`, 'info');
  };

  // Repeat Last Order
  const handleRepeatLastOrder = () => {
    if (!lastOrder || !lastOrder.items) return;

    const newItems = lastOrder.items
      .filter(item => item.is_available)
      .map(item => ({
        menu_item_id: item.menu_item_id,
        name: item.name,
        unit_price: item.current_unit_price,
        quantity: item.quantity,
        total_price: item.current_total_price,
        selected_modifiers: item.selected_modifiers || [],
        notes: item.notes || '',
        station: item.station || 'KITCHEN'
      }));

    setCart(newItems);
    if (lastOrder.delivery_note) setDeliveryNote(lastOrder.delivery_note);
    addToast('Last order items revalidated and added to cart!', 'success');
  };

  // Add Item to Cart
  const handleAddToCart = (item) => {
    setCart(prev => {
      const exists = prev.find(i => i.menu_item_id === item.id);
      if (exists) {
        return prev.map(i => i.menu_item_id === item.id
          ? { ...i, quantity: i.quantity + 1, total_price: (i.quantity + 1) * parseFloat(item.price) }
          : i
        );
      } else {
        return [...prev, {
          menu_item_id: item.id,
          name: item.name,
          unit_price: parseFloat(item.price),
          quantity: 1,
          total_price: parseFloat(item.price),
          selected_modifiers: [],
          notes: '',
          station: item.category_details?.name?.toUpperCase().includes('BAR') ? 'BAR' : 'KITCHEN'
        }];
      }
    });
  };

  const updateQuantity = (menuItemId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.menu_item_id === menuItemId) {
        const newQty = Math.max(0, item.quantity + delta);
        return newQty === 0 ? null : {
          ...item,
          quantity: newQty,
          total_price: newQty * item.unit_price
        };
      }
      return item;
    }).filter(Boolean));
  };

  // Financial Calculations
  const subtotal = cart.reduce((s, i) => s + i.total_price, 0);
  const deliveryFee = selectedZone ? parseFloat(selectedZone.delivery_fee) : 30.00;
  const isFreeDelivery = selectedZone && subtotal >= parseFloat(selectedZone.min_order_free_delivery);
  const actualDeliveryFee = isFreeDelivery ? 0 : deliveryFee;
  const tax = subtotal * 0.14; // Standard 14% VAT
  const totalAmount = subtotal + actualDeliveryFee + tax;

  // Create Customer Action
  const handleCreateCustomerSubmit = async (e) => {
    e.preventDefault();
    if (!newCustForm.name || !newCustForm.phone) {
      addToast('Name and phone number are required', 'warning');
      return;
    }

    try {
      // Check duplicate
      const dupCheck = await api.checkDuplicateCustomer(newCustForm.phone, newCustForm.name);
      if (dupCheck.is_duplicate && !duplicateWarning) {
        setDuplicateWarning(dupCheck);
        return;
      }

      // Create Customer
      const cust = await api.createCustomer({
        name: newCustForm.name,
        phone: newCustForm.phone,
        secondary_phone: newCustForm.secondary_phone,
        email: newCustForm.email,
        notes: newCustForm.notes
      });

      // Create Initial Address if street provided
      if (newCustForm.street) {
        const addr = await api.createCustomerAddress({
          customer: cust.id,
          label: 'HOME',
          city: 'Cairo',
          area: newCustForm.area,
          street: newCustForm.street,
          building: newCustForm.building,
          floor: newCustForm.floor,
          apartment: newCustForm.apartment,
          landmark: newCustForm.landmark,
          instructions: newCustForm.instructions,
          is_default: true
        });
        cust.addresses = [addr];
      }

      addToast(`Customer ${cust.name} created!`, 'success');
      setIsNewCustomerOpen(false);
      setDuplicateWarning(null);
      handleSelectCustomer(cust);
    } catch (err) {
      addToast(`Failed to create customer: ${err.message}`, 'error');
    }
  };

  // Create Delivery Order Action
  const handleCreateDeliveryOrder = async () => {
    if (!selectedCustomer) {
      addToast('Please select or create a customer first.', 'warning');
      return;
    }
    if (!selectedAddress) {
      addToast('Please select or add a delivery address.', 'warning');
      return;
    }
    if (cart.length === 0) {
      addToast('Cart is empty. Please add items to the delivery order.', 'warning');
      return;
    }

    try {
      const orderPayload = {
        order_type: 'DELIVERY',
        customer_id: selectedCustomer.id,
        server_id: currentStaff?.id || 1,
        guest_count: 1,
        payment_method: paymentMethod,
        special_instructions: kitchenNote,
        items: cart.map(i => ({
          menu_item_id: i.menu_item_id,
          quantity: i.quantity,
          selected_modifiers: i.selected_modifiers,
          notes: i.notes
        }))
      };

      const order = await api.createPosOrder(orderPayload);

      // Create or update Delivery record
      const fullAddressStr = `${selectedAddress.street}, ${selectedAddress.building ? 'Bldg ' + selectedAddress.building + ', ' : ''}${selectedAddress.apartment ? 'Apt ' + selectedAddress.apartment + ', ' : ''}${selectedAddress.area}, ${selectedAddress.city}`;

      await api.createDeliveryOrder?.({
        order_id: order.id,
        customer_id: selectedCustomer.id,
        customer_address_id: selectedAddress.id,
        delivery_zone_id: selectedZone?.id,
        delivery_address: fullAddressStr,
        customer_phone: selectedCustomer.phone,
        customer_name: selectedCustomer.name,
        delivery_fee: actualDeliveryFee,
        delivery_note: deliveryNote,
        estimated_minutes: selectedZone?.estimated_minutes || 35
      });

      addToast(`Delivery Order #${order.order_number} created & sent to kitchen!`, 'success');

      // Reset state for next phone call
      setCart([]);
      setSelectedCustomer(null);
      setSelectedAddress(null);
      setLastOrder(null);
      setDeliveryNote('');
      setKitchenNote('');
    } catch (err) {
      addToast(`Failed to create delivery order: ${err.message}`, 'error');
    }
  };

  const filteredMenuItems = activeCategory === 'ALL'
    ? menuItems
    : menuItems.filter(i => i.category === Number(activeCategory) || i.category_details?.id === Number(activeCategory));

  return (
    <div className="min-h-full p-4 md:p-6 bg-[#131313] flex flex-col space-y-5">
      {/* Top Header Bar */}
      <div className="bg-[#1c1b1b] p-4 rounded-xl border border-[#2a2a2a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#d4af37]" />
            Delivery Customer Terminal & Repeat Order System
          </h1>
          <p className="text-xs text-[#99907c] font-mono">
            High-speed phone-first ordering • Address book • BCG repeat order intelligence • Instant dispatch
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewCustomerOpen(true)}
            className="px-4 py-2 bg-[#d4af37] hover:bg-[#f2ca50] text-black font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-gold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Customer</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: 3 Columns (Customer & Addresses / Menu & History / Cart & Dispatch) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN: Customer Phone Search & Address Management (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Phone Search Box */}
          <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-4 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-[#99907c] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
                1. Customer Phone / Name Search
              </span>
              {isSearching && <span className="text-[10px] text-[#d4af37] font-mono animate-pulse">Searching...</span>}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Enter phone (e.g. 01012345678) or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#131313] border-2 border-[#d4af37]/60 focus:border-[#d4af37] text-white text-sm font-mono p-3 pl-10 rounded-xl focus:outline-none transition-colors"
                autoFocus
              />
              <Search className="w-4 h-4 text-[#99907c] absolute left-3.5 top-3.5" />
            </div>

            {/* Dropdown Live Results */}
            {searchResults.length > 0 && (
              <div className="bg-[#131313] border border-[#d4af37] rounded-xl overflow-hidden shadow-2xl max-h-64 overflow-y-auto divide-y divide-[#2a2a2a]">
                {searchResults.map(cust => (
                  <div
                    key={cust.id}
                    onClick={() => handleSelectCustomer(cust)}
                    className="p-3 hover:bg-[#20201f] cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-white flex items-center gap-2">
                        {cust.name}
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#005236] text-[#4edea3]">
                          {cust.vip_tier}
                        </span>
                      </h4>
                      <p className="text-[11px] font-mono text-[#d4af37] mt-0.5">{cust.phone}</p>
                      <p className="text-[10px] text-[#99907c] truncate max-w-xs">
                        {cust.addresses?.[0]?.area || 'No address'} • {cust.visit_count} Orders
                      </p>
                    </div>
                    <button className="px-2.5 py-1 bg-[#d4af37] text-black font-bold text-[11px] rounded font-mono">
                      SELECT
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Customer Card */}
          {selectedCustomer ? (
            <div className="bg-[#1c1b1b] border-2 border-[#d4af37] rounded-2xl p-5 shadow-gold space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-mono uppercase text-[#99907c] tracking-widest">ACTIVE CALLER / CUSTOMER</span>
                  <h3 className="text-base font-extrabold text-white">{selectedCustomer.name}</h3>
                  <p className="text-xs font-mono text-[#d4af37]">{selectedCustomer.phone}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#20201f] text-[#d4af37] border border-[#d4af37]/30">
                    {selectedCustomer.vip_tier}
                  </span>
                  <p className="text-[10px] font-mono text-[#4edea3] mt-1">{selectedCustomer.loyalty_points} Points</p>
                </div>
              </div>

              {/* Customer Lifetime Summary */}
              <div className="grid grid-cols-3 gap-2 bg-[#131313] p-2.5 rounded-xl text-center text-xs font-mono border border-[#2a2a2a]">
                <div>
                  <span className="text-[9px] text-[#99907c] block">ORDERS</span>
                  <span className="font-bold text-white">{selectedCustomer.visit_count}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#99907c] block">SPENT</span>
                  <span className="font-bold text-[#d4af37]">${parseFloat(selectedCustomer.total_spent || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#99907c] block">STATUS</span>
                  <span className="font-bold text-[#4edea3]">ACTIVE</span>
                </div>
              </div>

              {/* Saved Address Selection */}
              <div className="space-y-2 pt-2 border-t border-[#2a2a2a]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#99907c] uppercase flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                    Delivery Addresses ({selectedCustomer.addresses?.length || 0})
                  </span>
                  <button
                    onClick={() => setIsAddAddressOpen(true)}
                    className="text-[11px] text-[#d4af37] hover:underline font-mono"
                  >
                    + Add Address
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedCustomer.addresses?.map(addr => {
                    const isSelected = selectedAddress?.id === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddress(addr)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#005236]/30 border-[#4edea3] text-white'
                            : 'bg-[#131313] border-[#2a2a2a] text-[#d0c5af] hover:border-[#353535]'
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            {addr.label === 'HOME' ? '🏠' : addr.label === 'WORK' ? '🏢' : '📍'} {addr.label}
                            {addr.is_default && <span className="text-[9px] text-[#d4af37]">(Default)</span>}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#4edea3]" />}
                        </div>
                        <p className="mt-1 font-sans text-xs">
                          {addr.street}, {addr.building ? `Bldg ${addr.building}, ` : ''}{addr.apartment ? `Apt ${addr.apartment}` : ''}
                        </p>
                        <p className="text-[10px] text-[#99907c] font-mono mt-0.5">
                          {addr.area}, {addr.city} {addr.landmark ? `• Near ${addr.landmark}` : ''}
                        </p>
                        {addr.instructions && (
                          <p className="text-[10px] text-[#d4af37] italic mt-1 font-mono">
                            Note: {addr.instructions}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  {(!selectedCustomer.addresses || selectedCustomer.addresses.length === 0) && (
                    <div className="p-3 bg-[#131313] border border-dashed border-[#ff949c]/40 rounded-xl text-center text-xs text-[#ff949c]">
                      No delivery address on file. Please add an address below.
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Notes */}
              {selectedCustomer.notes && (
                <div className="p-2.5 bg-[#131313] rounded-xl border border-[#2a2a2a] text-[11px] text-[#99907c] font-mono">
                  <span className="text-[#d4af37] font-bold">Preferences: </span>
                  {selectedCustomer.notes}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#1c1b1b] border border-dashed border-[#353535] rounded-2xl p-8 text-center text-xs text-[#99907c] space-y-2">
              <User className="w-8 h-8 mx-auto text-[#353535]" />
              <p>No customer active. Search by phone number above or create a new customer.</p>
            </div>
          )}

          {/* Repeat Last Order Banner (When Selected) */}
          {selectedCustomer && lastOrder && (
            <div className="bg-gradient-to-br from-[#1c1b1b] to-[#20201f] border border-[#d4af37] rounded-2xl p-4 shadow-gold space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#d4af37] flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4" />
                  Repeat Last Order ({lastOrder.order_number})
                </span>
                <span className="text-[10px] text-[#99907c] font-mono">
                  {new Date(lastOrder.order_date).toLocaleDateString()}
                </span>
              </div>

              <div className="space-y-1.5 bg-[#131313] p-2.5 rounded-xl border border-[#2a2a2a] text-xs font-mono">
                {lastOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[#d0c5af]">
                    <span>{it.quantity}x {it.name}</span>
                    <span className="text-white">${it.current_total_price.toFixed(2)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-[#2a2a2a] flex justify-between font-bold text-white">
                  <span>Revalidated Total:</span>
                  <span className="text-[#d4af37]">${lastOrder.recalculated_subtotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleRepeatLastOrder}
                className="w-full py-2.5 bg-[#d4af37] hover:bg-[#f2ca50] text-black font-extrabold text-xs font-mono uppercase rounded-xl flex items-center justify-center gap-2 shadow-gold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>1-Click Repeat Order</span>
              </button>
            </div>
          )}

        </div>

        {/* MIDDLE COLUMN: Live Menu & Favorite Items (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Favorite Items Quick Add Bar */}
          {favoriteItems.length > 0 && (
            <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-4 shadow-card space-y-2">
              <span className="text-xs font-mono uppercase text-[#d4af37] flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 fill-[#d4af37]" />
                Customer Favorites (Quick Add)
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {favoriteItems.map(fav => (
                  <button
                    key={fav.menu_item_id}
                    onClick={() => handleAddToCart({ id: fav.menu_item_id, name: fav.name, price: fav.price })}
                    className="shrink-0 bg-[#131313] hover:bg-[#20201f] border border-[#353535] hover:border-[#d4af37] p-2 rounded-xl text-left text-xs transition-colors cursor-pointer"
                  >
                    <p className="font-bold text-white truncate max-w-[120px]">{fav.name}</p>
                    <div className="flex justify-between items-center text-[10px] font-mono mt-1">
                      <span className="text-[#d4af37]">${fav.price}</span>
                      <span className="text-[#99907c]">x{fav.times_ordered}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Menu Category Filter */}
          <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-4 shadow-card space-y-3">
            <span className="text-xs font-mono uppercase text-[#99907c] flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-[#d4af37]" />
              2. Add Menu Items
            </span>

            <div className="flex gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveCategory('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors ${
                  activeCategory === 'ALL' ? 'bg-[#d4af37] text-black' : 'bg-[#131313] text-[#99907c] border border-[#2a2a2a]'
                }`}
              >
                All
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono whitespace-nowrap transition-colors ${
                    activeCategory === c.id ? 'bg-[#d4af37] text-black' : 'bg-[#131313] text-[#99907c] border border-[#2a2a2a]'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-2 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredMenuItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleAddToCart(item)}
                  className="bg-[#131313] border border-[#2a2a2a] hover:border-[#d4af37] p-3 rounded-xl cursor-pointer flex flex-col justify-between space-y-2 transition-colors group"
                >
                  <div>
                    <h4 className="font-bold text-xs text-white group-hover:text-[#d4af37] transition-colors">{item.name}</h4>
                    <p className="text-[10px] text-[#99907c] font-sans line-clamp-2 mt-0.5">{item.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-[#20201f]">
                    <span className="font-bold font-mono text-xs text-[#d4af37]">${parseFloat(item.price).toFixed(2)}</span>
                    <span className="p-1 bg-[#20201f] text-[#d4af37] rounded group-hover:bg-[#d4af37] group-hover:text-black transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Order Cart, Delivery Zone, Notes & Dispatch (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Order Summary & Cart */}
          <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-4 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#2a2a2a]">
              <span className="text-xs font-mono uppercase text-[#99907c]">3. Delivery Order Cart ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
              {cart.length > 0 && (
                <button onClick={() => setCart([])} className="text-[10px] text-[#ff949c] hover:underline font-mono">
                  Clear
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {cart.map(item => (
                <div key={item.menu_item_id} className="p-2.5 bg-[#131313] rounded-xl border border-[#2a2a2a] flex items-center justify-between text-xs font-mono">
                  <div>
                    <h5 className="font-bold text-white">{item.name}</h5>
                    <span className="text-[10px] text-[#99907c]">${item.unit_price.toFixed(2)} each</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.menu_item_id, -1)}
                      className="w-6 h-6 rounded bg-[#20201f] text-white hover:bg-[#353535] flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="font-bold text-white w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.menu_item_id, 1)}
                      className="w-6 h-6 rounded bg-[#20201f] text-white hover:bg-[#353535] flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                    <span className="font-bold text-[#d4af37] ml-2 w-12 text-right">
                      ${item.total_price.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="py-8 text-center text-xs text-[#99907c] font-mono">
                  Cart is empty. Select items from the menu or repeat last order.
                </div>
              )}
            </div>

            {/* Delivery Zone & Fee Selector */}
            <div className="space-y-2 pt-2 border-t border-[#2a2a2a]">
              <label className="text-[10px] font-mono uppercase text-[#99907c] block">Delivery Area & Zone Fee</label>
              <select
                value={selectedZone?.id || ''}
                onChange={(e) => {
                  const z = zones.find(item => item.id === Number(e.target.value));
                  if (z) setSelectedZone(z);
                }}
                className="w-full bg-[#131313] border border-[#353535] text-white text-xs font-mono p-2.5 rounded-xl focus:border-[#d4af37] focus:outline-none"
              >
                {zones.map(z => (
                  <option key={z.id} value={z.id}>
                    {z.name} • Fee: ${z.delivery_fee} (Est: {z.estimated_minutes}m)
                  </option>
                ))}
              </select>
            </div>

            {/* Notes Section (Separated) */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[9px] font-mono uppercase text-[#99907c] block mb-1">Driver Delivery Note</label>
                <input
                  type="text"
                  placeholder="e.g. Call before arrival..."
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded text-[11px] focus:border-[#d4af37] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-mono uppercase text-[#99907c] block mb-1">Kitchen / Chef Note</label>
                <input
                  type="text"
                  placeholder="e.g. Extra spicy, sauce on side..."
                  value={kitchenNote}
                  onChange={(e) => setKitchenNote(e.target.value)}
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded text-[11px] focus:border-[#d4af37] focus:outline-none"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-[#99907c] block">Payment Collection Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'CASH', label: 'Cash on Delivery' },
                  { id: 'CARD', label: 'Card on Arrival' },
                  { id: 'ONLINE', label: 'Paid Online' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPaymentMethod(p.id)}
                    className={`py-2 rounded-xl text-[11px] font-mono font-bold transition-colors ${
                      paymentMethod === p.id
                        ? 'bg-[#d4af37] text-black shadow-gold'
                        : 'bg-[#131313] text-[#99907c] border border-[#2a2a2a]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Financial Ledger Breakdown */}
            <div className="bg-[#131313] p-3 rounded-xl border border-[#2a2a2a] space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[#99907c]">
                <span>Subtotal</span>
                <span className="text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#99907c]">
                <span>Delivery Fee ({selectedZone?.name || 'Standard'})</span>
                <span className={isFreeDelivery ? 'text-[#4edea3] font-bold' : 'text-white'}>
                  {isFreeDelivery ? 'FREE (Over threshold)' : `$${actualDeliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-[#99907c]">
                <span>VAT (14%)</span>
                <span className="text-white">${tax.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-[#2a2a2a] flex justify-between font-extrabold text-sm text-white">
                <span className="text-[#d4af37]">TOTAL:</span>
                <span className="text-[#d4af37]">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* 1-Click Order Dispatch Button */}
            <button
              onClick={handleCreateDeliveryOrder}
              disabled={cart.length === 0 || !selectedCustomer}
              className={`w-full py-3 rounded-xl font-extrabold text-xs font-mono uppercase flex items-center justify-center gap-2 shadow-2xl transition-all ${
                cart.length === 0 || !selectedCustomer
                  ? 'bg-[#20201f] text-[#99907c] cursor-not-allowed'
                  : 'bg-[#4edea3] hover:bg-[#6ef5ba] text-black shadow-emerald cursor-pointer'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Confirm & Send to Kitchen & Dispatch</span>
            </button>
          </div>

        </div>

      </div>

      {/* CREATE NEW CUSTOMER MODAL */}
      {isNewCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#1c1b1b] border border-[#d4af37] rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2a2a2a]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-[#d4af37]" />
                New Delivery Customer Onboarding
              </h3>
              <button onClick={() => { setIsNewCustomerOpen(false); setDuplicateWarning(null); }} className="text-[#99907c] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Duplicate Warning Alert */}
            {duplicateWarning && (
              <div className="mb-4 p-3 bg-[#ff949c]/20 border border-[#ff949c] rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-2 text-[#ff949c] font-bold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Possible Duplicate Customer Detected</span>
                </div>
                <p className="text-white">{duplicateWarning.message}</p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectCustomer(duplicateWarning.existing_customer);
                      setIsNewCustomerOpen(false);
                      setDuplicateWarning(null);
                    }}
                    className="px-3 py-1.5 bg-[#4edea3] text-black font-bold rounded font-mono text-[11px]"
                  >
                    Use Existing Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setDuplicateWarning(null)}
                    className="px-3 py-1.5 bg-[#20201f] text-white rounded font-mono text-[11px]"
                  >
                    Create New Anyway
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateCustomerSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ahmed Mohamed"
                    value={newCustForm.name}
                    onChange={(e) => setNewCustForm({ ...newCustForm, name: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded-xl focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Primary Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 01012345678"
                    value={newCustForm.phone}
                    onChange={(e) => setNewCustForm({ ...newCustForm, phone: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded-xl font-mono focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Secondary Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. 01199887766"
                    value={newCustForm.secondary_phone}
                    onChange={(e) => setNewCustForm({ ...newCustForm, secondary_phone: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded-xl font-mono focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="customer@email.com"
                    value={newCustForm.email}
                    onChange={(e) => setNewCustForm({ ...newCustForm, email: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded-xl focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              </div>

              {/* Address Subform */}
              <div className="pt-2 border-t border-[#2a2a2a] space-y-3">
                <span className="text-[10px] font-mono uppercase text-[#d4af37]">Primary Delivery Address</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#99907c] font-mono uppercase block mb-1">Area / District</label>
                    <select
                      value={newCustForm.area}
                      onChange={(e) => setNewCustForm({ ...newCustForm, area: e.target.value })}
                      className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded-xl font-mono focus:border-[#d4af37] focus:outline-none"
                    >
                      <option value="New Cairo">New Cairo</option>
                      <option value="Maadi">Maadi</option>
                      <option value="Nasr City">Nasr City</option>
                      <option value="Heliopolis">Heliopolis</option>
                      <option value="Downtown">Downtown / Zamalek</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[#99907c] font-mono uppercase block mb-1">Street Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Street 90 South"
                      value={newCustForm.street}
                      onChange={(e) => setNewCustForm({ ...newCustForm, street: e.target.value })}
                      className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded-xl focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[#99907c] font-mono uppercase block mb-1">Building</label>
                    <input
                      type="text"
                      placeholder="e.g. 15"
                      value={newCustForm.building}
                      onChange={(e) => setNewCustForm({ ...newCustForm, building: e.target.value })}
                      className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[#99907c] font-mono uppercase block mb-1">Floor</label>
                    <input
                      type="text"
                      placeholder="e.g. 2nd"
                      value={newCustForm.floor}
                      onChange={(e) => setNewCustForm({ ...newCustForm, floor: e.target.value })}
                      className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[#99907c] font-mono uppercase block mb-1">Apartment</label>
                    <input
                      type="text"
                      placeholder="e.g. 6"
                      value={newCustForm.apartment}
                      onChange={(e) => setNewCustForm({ ...newCustForm, apartment: e.target.value })}
                      className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Landmark / Delivery Instructions</label>
                  <input
                    type="text"
                    placeholder="e.g. Next to Seif Pharmacy, ring bell twice"
                    value={newCustForm.landmark}
                    onChange={(e) => setNewCustForm({ ...newCustForm, landmark: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded-xl focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">VIP & Food Preference Notes</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Prefers no spicy food, extra crispy fries..."
                  value={newCustForm.notes}
                  onChange={(e) => setNewCustForm({ ...newCustForm, notes: e.target.value })}
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded-xl focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#2a2a2a] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewCustomerOpen(false)}
                  className="px-4 py-2 bg-[#20201f] text-white rounded-xl font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d4af37] text-black font-bold rounded-xl shadow-gold uppercase font-mono cursor-pointer"
                >
                  Save & Select Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW ADDRESS MODAL */}
      {isAddAddressOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-[#d4af37] rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2a2a2a]">
              <h3 className="text-base font-bold text-white">Add Delivery Address for {selectedCustomer.name}</h3>
              <button onClick={() => setIsAddAddressOpen(false)} className="text-[#99907c] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const addr = await api.createCustomerAddress({
                    ...newAddressForm,
                    customer: selectedCustomer.id
                  });
                  addToast('New address saved!', 'success');
                  setIsAddAddressOpen(false);
                  // Refresh customer
                  const refreshed = await api.getCustomerById(selectedCustomer.id);
                  handleSelectCustomer(refreshed);
                } catch (err) {
                  addToast(`Failed to add address: ${err.message}`, 'error');
                }
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Address Label</label>
                  <select
                    value={newAddressForm.label}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, label: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded-xl font-mono focus:border-[#d4af37] focus:outline-none"
                  >
                    <option value="HOME">Home</option>
                    <option value="WORK">Work / Office</option>
                    <option value="FAMILY">Family / Parents</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Area / Zone</label>
                  <select
                    value={newAddressForm.area}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, area: e.target.value })}
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
                  value={newAddressForm.street}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, street: e.target.value })}
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded-xl focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Building</label>
                  <input
                    type="text"
                    value={newAddressForm.building}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, building: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Floor</label>
                  <input
                    type="text"
                    value={newAddressForm.floor}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, floor: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Apt</label>
                  <input
                    type="text"
                    value={newAddressForm.apartment}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, apartment: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Landmark / Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Next to Seif Pharmacy"
                  value={newAddressForm.landmark}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, landmark: e.target.value })}
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

    </div>
  );
}
