import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import CustomerNavbar from '../components/CustomerNavbar';
import { 
  ShoppingBag, Truck, MapPin, Plus, Minus, Trash2, Check, 
  Search, Utensils, CheckCircle2, ChevronRight, Sparkles, 
  Clock, Flame, Star, Tag, X, ShieldCheck, ArrowRight, 
  Percent, CreditCard, Banknote, QrCode
} from 'lucide-react';

export default function OnlineOrderingPage() {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();

  // Menu & Data
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deliveryZones, setDeliveryZones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState('ALL'); // ALL, CHEF_STAR, VEG

  // Customization Modal
  const [customizingItem, setCustomizingItem] = useState(null);
  const [selectedDoneness, setSelectedDoneness] = useState('Medium Rare');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [itemSpecialNotes, setItemSpecialNotes] = useState('');
  const [customQuantity, setCustomQuantity] = useState(1);

  // Cart & Drawer State
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('restaurant_customer_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Checkout Fields
  const [orderType, setOrderType] = useState('DELIVERY'); // DELIVERY, TAKEOUT
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('14 El-Gezira Street, Zamalek');
  const [buildingFloorApt, setBuildingFloorApt] = useState('Tower 2, Floor 8, Apt 804');
  const [customerName, setCustomerName] = useState('Clara Beauchamp');
  const [customerPhone, setCustomerPhone] = useState('+20 101 234 5678');
  const [deliveryInstructions, setDeliveryInstructions] = useState('Please ring bell 804 or leave with concierge.');
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // CARD, CASH

  // Promo Code
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');

  // Submitting
  const [submitting, setSubmitting] = useState(false);

  // Available Add-ons for customization
  const availableAddons = [
    { name: 'Shaved Winter Black Truffle', name_ar: 'كمأة سوداء طازجة', price: 12.00 },
    { name: 'House Béarnaise Sauce', name_ar: 'صلصة بيرنيز خاصة', price: 4.00 },
    { name: 'Sautéed Wild Forest Mushrooms', name_ar: 'فطر بري سوتيه', price: 6.00 },
    { name: 'Extra Brioche & Cultured Butter', name_ar: 'خبز بريوش إضافي مع زبدة', price: 3.50 },
    { name: 'Fresh Burrata Pugliese', name_ar: 'جبنة بوراتا طازجة', price: 5.00 },
  ];

  const donenessOptions = ['Rare', 'Medium Rare', 'Medium', 'Medium Well', 'Well Done'];

  useEffect(() => {
    loadCatalog();
  }, []);

  useEffect(() => {
    localStorage.setItem('restaurant_customer_cart', JSON.stringify(cart));
  }, [cart]);

  const loadCatalog = async () => {
    try {
      setLoading(true);
      const [items, cats, zones] = await Promise.all([
        api.getMenuItems(),
        api.getCategories(),
        api.getDeliveryZones().catch(() => [])
      ]);
      setMenuItems(items);
      setCategories(cats);
      setDeliveryZones(zones);
      if (zones.length > 0) {
        setSelectedZoneId(zones[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to load menu catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  // Customization Handler
  const openCustomization = (item) => {
    setCustomizingItem(item);
    setSelectedDoneness('Medium Rare');
    setSelectedAddons([]);
    setItemSpecialNotes('');
    setCustomQuantity(1);
  };

  const toggleAddon = (addon) => {
    if (selectedAddons.some(a => a.name === addon.name)) {
      setSelectedAddons(selectedAddons.filter(a => a.name !== addon.name));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const handleAddCustomizedToCart = () => {
    if (!customizingItem) return;

    const addonsExtra = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = parseFloat(customizingItem.price) + addonsExtra;

    const modifiersList = [
      ...((customizingItem.station === 'GRILL' || customizingItem.category_name?.includes('Steak'))
        ? [{ name: selectedDoneness, price_extra: 0 }]
        : []),
      ...selectedAddons.map(a => ({ name: a.name, price_extra: a.price }))
    ];

    const cartEntry = {
      cartId: `${customizingItem.id}-${Date.now()}`,
      id: customizingItem.id,
      name: customizingItem.name,
      name_ar: customizingItem.name_ar,
      image_url: customizingItem.image_url,
      unitPrice: unitPrice,
      basePrice: parseFloat(customizingItem.price),
      quantity: customQuantity,
      selected_modifiers: modifiersList,
      notes: itemSpecialNotes,
      station: customizingItem.station
    };

    setCart(prev => [...prev, cartEntry]);
    setCustomizingItem(null);
    setIsCartOpen(true);
  };

  // Quick 1-click Add
  const handleQuickAdd = (item, e) => {
    e?.stopPropagation();
    const existingIndex = cart.findIndex(c => c.id === item.id && (!c.selected_modifiers || c.selected_modifiers.length === 0) && !c.notes);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      const cartEntry = {
        cartId: `${item.id}-${Date.now()}`,
        id: item.id,
        name: item.name,
        name_ar: item.name_ar,
        image_url: item.image_url,
        unitPrice: parseFloat(item.price),
        basePrice: parseFloat(item.price),
        quantity: 1,
        selected_modifiers: [],
        notes: '',
        station: item.station
      };
      setCart(prev => [...prev, cartEntry]);
    }
    setIsCartOpen(true);
  };

  // Cart Qty adjustments
  const updateCartQty = (cartId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.cartId === cartId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeCartItem = (cartId) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  // Promo Code Validation
  const handleApplyPromo = (e) => {
    e.preventDefault();
    const code = promoCodeInput.trim().toUpperCase();
    if (code === 'LUXE20') {
      setAppliedPromo({ code: 'LUXE20', type: 'PERCENT', value: 0.20, label: '20% Haute Dining Discount' });
      setPromoError('');
    } else if (code === 'WELCOME10') {
      setAppliedPromo({ code: 'WELCOME10', type: 'FLAT', value: 10.00, label: '$10 Welcome Privilege' });
      setPromoError('');
    } else {
      setPromoError(isRTL ? 'الرمز الترويجي غير صالح' : 'Invalid promo code. Try LUXE20 or WELCOME10');
    }
  };

  // Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  
  // Selected Delivery Zone
  const currentZone = deliveryZones.find(z => z.id.toString() === selectedZoneId.toString());
  const rawDeliveryFee = orderType === 'DELIVERY' ? (currentZone ? parseFloat(currentZone.delivery_fee) : 15.00) : 0.00;
  // Free delivery threshold: if subtotal > $80, delivery is complimentary!
  const deliveryFee = (orderType === 'DELIVERY' && cartSubtotal >= 80) ? 0.00 : rawDeliveryFee;

  let promoDiscount = 0.00;
  if (appliedPromo) {
    if (appliedPromo.type === 'PERCENT') {
      promoDiscount = cartSubtotal * appliedPromo.value;
    } else {
      promoDiscount = Math.min(cartSubtotal, appliedPromo.value);
    }
  }

  const taxAmount = (cartSubtotal - promoDiscount) * 0.0825;
  const cartTotal = Math.max(0, cartSubtotal - promoDiscount + taxAmount + deliveryFee);
  const totalItemsCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  // Submit Order
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    if (orderType === 'DELIVERY' && (!deliveryAddress.trim() || !customerPhone.trim())) {
      alert(isRTL ? 'يرجى إدخال عنوان التوصيل ورقم الهاتف' : 'Please provide a valid delivery address and contact phone.');
      return;
    }

    setSubmitting(true);
    try {
      const fullAddress = `${deliveryAddress} (${buildingFloorApt})${currentZone ? ` [Zone: ${currentZone.name}]` : ''}`;
      
      const payload = {
        order_type: orderType,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'CARD' ? 'PAID' : 'UNPAID',
        delivery_address: fullAddress,
        customer_name: customerName || 'Valued Guest',
        customer_phone: customerPhone || '+201012345678',
        special_instructions: `${deliveryInstructions ? `Drop-off: ${deliveryInstructions}. ` : ''}${appliedPromo ? `Promo applied: ${appliedPromo.code}. ` : ''}`,
        discount_amount: promoDiscount.toFixed(2),
        items: cart.map(c => ({
          menu_item_id: c.id,
          quantity: c.quantity,
          selected_modifiers: c.selected_modifiers || [],
          notes: c.notes || ''
        }))
      };

      const createdOrder = await api.createPosOrder(payload);
      
      // Clear cart
      setCart([]);
      localStorage.removeItem('restaurant_customer_cart');
      setIsCartOpen(false);

      // Redirect immediately to live tracking page
      navigate(`/order-tracking/${createdOrder.id}`);
    } catch (err) {
      console.error('Error creating customer order:', err);
      alert(isRTL ? `خطأ في إرسال الطلب: ${err.message}` : `Failed to place order: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter Dishes
  const filteredItems = menuItems.filter(item => {
    const matchesCat = activeCategory === 'ALL' || item.category_name === activeCategory;
    const matchesQuery = !searchQuery.trim() || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.name_ar && item.name_ar.includes(searchQuery)) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesDietary = true;
    if (dietaryFilter === 'CHEF_STAR') {
      matchesDietary = parseFloat(item.price) > 35 || item.station === 'GRILL';
    } else if (dietaryFilter === 'VEG') {
      matchesDietary = item.category_name?.includes('Dessert') || item.category_name?.includes('Starter') || item.station === 'COLD';
    }

    return matchesCat && matchesQuery && matchesDietary;
  });

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] flex flex-col font-sans">
      {/* Customer Header */}
      <CustomerNavbar 
        cartCount={totalItemsCount} 
        cartTotal={cartTotal} 
        onOpenCart={() => setIsCartOpen(true)} 
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 space-y-8">
        {/* Luxury Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1b1a18] via-[#24221d] to-[#1a1918] border border-[#d4af37]/40 p-6 lg:p-10 shadow-gold">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#d4af37] font-bold tracking-widest uppercase bg-[#d4af37]/15 border border-[#d4af37]/30 px-2.5 py-1 rounded-full">
                  {isRTL ? 'الطلب الفاخر عبر الإنترنت' : 'Omnichannel Gourmet Storefront'}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-mono text-[#4edea3]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isRTL ? 'توصيل معزول حرارياً' : 'Thermal Insulated Transit'}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-serif tracking-tight leading-tight">
                {isRTL ? 'إبداعات الطهي الراقي تصلك أينما كنت' : "Master Chef Gastronomy, Delivered Direct To Your Door"}
              </h1>

              <p className="text-xs sm:text-sm text-[#d0c5af] font-sans leading-relaxed">
                {isRTL 
                  ? 'تمتع بتجربة أرقى المأكولات العالمية المُحضرة طازجة على أيدي الشيف أنطوان، مع خيارات التخصيص الكاملة والتتبع المباشر لحظة بلحظة.'
                  : 'Experience three-star culinary precision prepared to order by Executive Chef Antoine Dubois. Savor prime A5 Wagyu, Mediterranean seafood, and artisanal patisserie with live GPS delivery tracking.'}
              </p>

              {/* Promo Callout */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 bg-[#121212]/80 border border-[#d4af37]/50 px-3.5 py-1.5 rounded-xl text-xs font-mono text-[#d4af37]">
                  <Tag className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>{isRTL ? 'استخدم كود LUXE20 لخصم 20%' : 'Use code LUXE20 for 20% OFF your order'}</span>
                </div>
                <div className="text-[11px] font-mono text-[#4edea3] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isRTL ? 'توصيل مجاني للطلبات فوق 80 دولار' : 'Free Delivery on orders over $80'}</span>
                </div>
              </div>
            </div>

            {/* Order Mode Switcher (Delivery vs Takeout vs QR) */}
            <div className="w-full lg:w-auto bg-[#141414] border border-[#2e2e2e] p-2 rounded-2xl flex flex-col sm:flex-row items-center gap-2 shadow-card">
              <button
                onClick={() => setOrderType('DELIVERY')}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  orderType === 'DELIVERY'
                    ? 'bg-[#d4af37] text-black shadow-gold'
                    : 'text-[#a89e87] hover:text-white hover:bg-[#1e1d1d]'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>{isRTL ? 'توصيل (30-40 دقيقة)' : 'Delivery (30-40 min)'}</span>
              </button>

              <button
                onClick={() => setOrderType('TAKEOUT')}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  orderType === 'TAKEOUT'
                    ? 'bg-[#d4af37] text-black shadow-gold'
                    : 'text-[#a89e87] hover:text-white hover:bg-[#1e1d1d]'
                }`}
              >
                <Utensils className="w-4 h-4" />
                <span>{isRTL ? 'استلام من المطعم' : 'Pickup & Takeout'}</span>
              </button>

              <Link
                to="/qr-ordering"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-mono text-[#a89e87] hover:text-[#d4af37] hover:bg-[#1e1d1d] transition-colors border border-transparent hover:border-[#353535]"
              >
                <QrCode className="w-4 h-4" />
                <span>{isRTL ? 'طاولة بالرمز' : 'Dine-In QR'}</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Filter Bar: Search, Categories & Dietary */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#99907c] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRTL ? 'ابحث عن الأطباق، المكونات، الصلصات...' : 'Search signature dishes, ingredients, sauces...'}
                className="w-full bg-[#1c1b1b] border border-[#2e2e2e] focus:border-[#d4af37] text-white pl-10 pr-10 py-2.5 rounded-xl text-xs placeholder-[#777] focus:outline-none transition-colors font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dietary Tags */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setDietaryFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-colors ${
                  dietaryFilter === 'ALL'
                    ? 'bg-[#2a2929] text-white border border-[#444]'
                    : 'text-[#a89e87] hover:text-white bg-[#161616] border border-[#262626]'
                }`}
              >
                {isRTL ? 'جميع الأطباق' : 'All Curations'}
              </button>
              <button
                onClick={() => setDietaryFilter('CHEF_STAR')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  dietaryFilter === 'CHEF_STAR'
                    ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]'
                    : 'text-[#a89e87] hover:text-white bg-[#161616] border border-[#262626]'
                }`}
              >
                <Star className="w-3 h-3 text-[#d4af37]" />
                <span>{isRTL ? 'أطباق الشيف المميزة' : 'Chef Signatures'}</span>
              </button>
              <button
                onClick={() => setDietaryFilter('VEG')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  dietaryFilter === 'VEG'
                    ? 'bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]'
                    : 'text-[#a89e87] hover:text-white bg-[#161616] border border-[#262626]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
                <span>{isRTL ? 'نباتي & خفيف' : 'Vegetarian & Light'}</span>
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === 'ALL'
                  ? 'bg-[#d4af37] text-black shadow-gold scale-102'
                  : 'bg-[#1c1b1b] text-[#d0c5af] border border-[#2a2a2a] hover:border-[#444]'
              }`}
            >
              {isRTL ? 'كل القائمة' : 'Full Menu'} ({menuItems.length})
            </button>
            {categories.map(cat => {
              const count = menuItems.filter(i => i.category_name === cat.name).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-mono whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === cat.name
                      ? 'bg-[#d4af37] text-black shadow-gold scale-102'
                      : 'bg-[#1c1b1b] text-[#d0c5af] border border-[#2a2a2a] hover:border-[#444]'
                  }`}
                >
                  <span>{isRTL && cat.name_ar ? cat.name_ar : cat.name}</span>
                  <span className="ml-1.5 opacity-60 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Dishes Grid */}
        <section>
          {loading ? (
            <div className="text-center py-20">
              <Clock className="w-8 h-8 text-[#d4af37] animate-spin mx-auto mb-3" />
              <p className="text-xs font-mono text-[#a89e87]">
                {isRTL ? 'جاري تجهيز قائمة الأطباق...' : 'Preparing gourmet selections...'}
              </p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-[#171717] rounded-3xl border border-[#2a2a2a] space-y-3">
              <Utensils className="w-10 h-10 text-[#666] mx-auto" />
              <h3 className="font-bold text-white text-base">
                {isRTL ? 'لم يتم العثور على أطباق تطابق بحثك' : 'No gourmet selections matched your criteria'}
              </h3>
              <p className="text-xs text-[#888]">
                {isRTL ? 'جرّب تصفح تصنيف آخر أو مسح حقل البحث' : 'Try clearing your search query or selecting another category.'}
              </p>
              <button
                onClick={() => { setActiveCategory('ALL'); setSearchQuery(''); setDietaryFilter('ALL'); }}
                className="px-4 py-2 bg-[#252424] hover:bg-[#333] text-[#d4af37] rounded-xl text-xs font-mono"
              >
                {isRTL ? 'إعادة تعيين المرشحات' : 'Reset All Filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map(item => {
                const displayName = isRTL && item.name_ar ? item.name_ar : item.name;
                const displayDesc = isRTL && item.description_ar ? item.description_ar : item.description;

                return (
                  <div
                    key={item.id}
                    className="group bg-[#1a1919] border border-[#282727] hover:border-[#d4af37]/60 rounded-2xl overflow-hidden shadow-card hover:shadow-gold flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {/* Image Container with Badges */}
                    <div className="relative w-full h-44 overflow-hidden bg-[#121212]">
                      <img
                        src={item.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400'}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1919] via-transparent to-black/30"></div>

                      {/* Station Badge */}
                      <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm border border-white/10 text-white text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase">
                        {item.station || 'KITCHEN'}
                      </span>

                      {/* Prep Time */}
                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm border border-white/10 text-[#d0c5af] text-[9px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-[#d4af37]" />
                        <span>15-20m</span>
                      </div>

                      {/* Price Tag in Image Bottom */}
                      <div className="absolute bottom-2.5 left-3">
                        <span className="text-xl font-extrabold text-[#d4af37] font-mono drop-shadow-md">
                          ${parseFloat(item.price).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Dish Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="font-bold text-sm text-white group-hover:text-[#d4af37] transition-colors leading-snug">
                            {displayName}
                          </h3>
                        </div>
                        <p className="text-[11px] text-[#99907c] font-sans mt-1 line-clamp-2 leading-relaxed">
                          {displayDesc || 'Artisanal culinary preparation featuring seasonal local produce and delicate reduction.'}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="pt-2 border-t border-[#2a2929] flex items-center gap-2">
                        {/* Customize button */}
                        <button
                          onClick={() => openCustomization(item)}
                          className="flex-1 py-2 px-3 bg-[#232222] hover:bg-[#2d2c2c] text-[#d0c5af] hover:text-white font-mono text-[11px] font-bold rounded-xl border border-[#353434] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-[#d4af37]" />
                          <span>{isRTL ? 'تخصيص' : 'Customize'}</span>
                        </button>

                        {/* Quick Add button */}
                        <button
                          onClick={(e) => handleQuickAdd(item, e)}
                          title="Quick 1-click Add"
                          className="py-2 px-3 bg-[#d4af37] hover:bg-[#e6c14b] text-black font-extrabold rounded-xl text-xs shadow-gold flex items-center justify-center gap-1 transition-transform active:scale-95 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="hidden sm:inline">{isRTL ? 'إضافة' : 'Add'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* ========================================================================= */}
      {/* DISH CUSTOMIZATION MODAL */}
      {/* ========================================================================= */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1c1b1b] border border-[#d4af37]/50 rounded-3xl max-w-lg w-full overflow-hidden shadow-gold max-h-[90vh] flex flex-col">
            {/* Modal Header with Image */}
            <div className="relative h-48 w-full bg-[#141414]">
              <img
                src={customizingItem.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'}
                alt={customizingItem.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c1b1b] via-transparent to-black/40"></div>
              
              <button
                onClick={() => setCustomizingItem(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-3 left-4 right-4">
                <span className="text-[10px] font-mono text-[#d4af37] uppercase font-bold tracking-widest block">
                  {customizingItem.category_name}
                </span>
                <h3 className="text-xl font-bold text-white leading-tight">
                  {isRTL && customizingItem.name_ar ? customizingItem.name_ar : customizingItem.name}
                </h3>
              </div>
            </div>

            {/* Modal Scrollable Options */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1 divide-y divide-[#2a2a2a] text-xs">
              {/* Cooking Preference (for grill / steak items) */}
              {(customizingItem.station === 'GRILL' || customizingItem.category_name?.includes('Steak') || customizingItem.category_name?.includes('Meat')) && (
                <div className="space-y-2 pt-1">
                  <label className="font-mono text-[#d4af37] font-bold uppercase tracking-wider block">
                    {isRTL ? 'درجة استواء اللحم' : 'Cooking Doneness'}
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {donenessOptions.map(opt => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => setSelectedDoneness(opt)}
                        className={`py-2 px-1 rounded-xl text-[10px] font-mono font-bold transition-all text-center cursor-pointer ${
                          selectedDoneness === opt
                            ? 'bg-[#d4af37] text-black shadow-gold'
                            : 'bg-[#141414] text-[#a89e87] border border-[#2e2e2e]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Gourmet Add-ons */}
              <div className="space-y-2 pt-3">
                <label className="font-mono text-[#d4af37] font-bold uppercase tracking-wider block">
                  {isRTL ? 'إضافات ومكملات فاخرة' : 'Gourmet Add-ons & Accompaniments'}
                </label>
                <div className="space-y-1.5">
                  {availableAddons.map(addon => {
                    const isSelected = selectedAddons.some(a => a.name === addon.name);
                    return (
                      <div
                        key={addon.name}
                        onClick={() => toggleAddon(addon)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#d4af37]/15 border-[#d4af37] text-white'
                            : 'bg-[#141414] border-[#2e2e2e] text-[#a89e87] hover:border-[#444]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isSelected ? 'bg-[#d4af37] border-[#d4af37] text-black' : 'border-[#444]'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>{isRTL ? addon.name_ar : addon.name}</span>
                        </div>
                        <span className="font-mono font-bold text-[#d4af37]">+${addon.price.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Special Instructions */}
              <div className="space-y-1.5 pt-3">
                <label className="font-mono text-[#d4af37] font-bold uppercase tracking-wider block">
                  {isRTL ? 'ملاحظات خاصة للشيف' : 'Special Chef Instructions'}
                </label>
                <textarea
                  rows={2}
                  value={itemSpecialNotes}
                  onChange={(e) => setItemSpecialNotes(e.target.value)}
                  placeholder={isRTL ? 'مثال: الصلصة على جانب الطبق، بدون بصل، خبز مقرمش إضافي...' : 'E.g., Sauce on the side, dressing lightly, allergy alert...'}
                  className="w-full bg-[#141414] border border-[#2e2e2e] focus:border-[#d4af37] p-2.5 rounded-xl text-white placeholder-[#666] focus:outline-none"
                />
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between pt-3">
                <span className="font-mono text-white font-bold">{isRTL ? 'الكمية' : 'Quantity'}</span>
                <div className="flex items-center gap-3 bg-[#141414] border border-[#333] px-3 py-1.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setCustomQuantity(Math.max(1, customQuantity - 1))}
                    className="p-1 hover:text-[#d4af37] text-[#a89e87] cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono font-bold text-white text-sm w-5 text-center">
                    {customQuantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCustomQuantity(customQuantity + 1)}
                    className="p-1 hover:text-[#d4af37] text-[#a89e87] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Action Footer */}
            <div className="p-4 bg-[#141414] border-t border-[#2a2a2a] flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-[#99907c] block uppercase">{isRTL ? 'إجمالي الصنف' : 'Item Total'}</span>
                <span className="text-lg font-mono font-black text-[#d4af37]">
                  ${((parseFloat(customizingItem.price) + selectedAddons.reduce((s, a) => s + a.price, 0)) * customQuantity).toFixed(2)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddCustomizedToCart}
                className="px-6 py-3 bg-[#d4af37] hover:bg-[#e4bf47] text-black font-extrabold rounded-xl text-xs font-mono shadow-gold flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <ShoppingBag className="w-4 h-4 text-black" />
                <span>{isRTL ? 'إضافة إلى سلة الطلب' : 'Add to Order Bag'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SLIDE-OUT CART & CHECKOUT DRAWER */}
      {/* ========================================================================= */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
          ></div>

          <div className={`fixed inset-y-0 ${isRTL ? 'left-0' : 'right-0'} max-w-full flex pl-10`}>
            <div className="w-screen max-w-md bg-[#181717] border-l border-[#2e2e2e] shadow-2xl flex flex-col">
              {/* Drawer Header */}
              <div className="p-5 bg-[#141414] border-b border-[#262626] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-white">
                      {isRTL ? 'سلة الطلب الخاص بك' : 'Your Gourmet Order Bag'}
                    </h2>
                    <span className="text-[10px] font-mono text-[#a89e87]">
                      {totalItemsCount} {isRTL ? 'أطباق محددة' : 'items curated'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-lg bg-[#222] hover:bg-[#333] text-[#888] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-[#262626]">
                {cart.length === 0 ? (
                  <div className="text-center py-20 space-y-3">
                    <ShoppingBag className="w-12 h-12 text-[#444] mx-auto" />
                    <h3 className="font-bold text-white text-sm">
                      {isRTL ? 'سلتك فارغة حالياً' : 'Your order basket is empty'}
                    </h3>
                    <p className="text-xs text-[#888]">
                      {isRTL ? 'اختر من قائمتنا الشهية لبدء طلبك الفاخر' : 'Select from our master culinary catalog to curate your dining experience.'}
                    </p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.cartId} className="pt-3 first:pt-0 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-xs text-white">
                            {isRTL && item.name_ar ? item.name_ar : item.name}
                          </h4>
                          {item.selected_modifiers && item.selected_modifiers.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.selected_modifiers.map((mod, idx) => (
                                <span key={idx} className="text-[9px] font-mono text-[#a89e87] bg-[#121212] px-1.5 py-0.5 rounded border border-[#2b2a2a]">
                                  {mod.name} {mod.price_extra > 0 ? `(+$${mod.price_extra})` : ''}
                                </span>
                              ))}
                            </div>
                          )}
                          {item.notes && (
                            <p className="text-[10px] text-[#d4af37] italic mt-1">
                              Note: {item.notes}
                            </p>
                          )}
                        </div>

                        <span className="font-mono font-bold text-xs text-[#d4af37]">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      {/* Quantity row */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2 bg-[#121212] border border-[#2e2e2e] px-2 py-1 rounded-lg">
                          <button
                            onClick={() => updateCartQty(item.cartId, -1)}
                            className="text-[#888] hover:text-white p-0.5 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono text-xs font-bold text-white px-2">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQty(item.cartId, 1)}
                            className="text-[#888] hover:text-white p-0.5 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeCartItem(item.cartId)}
                          className="text-[#ff949c] hover:text-[#ffb5bb] text-xs flex items-center gap-1 cursor-pointer font-mono"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{isRTL ? 'حذف' : 'Remove'}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Checkout Form & Breakdown (Visible when cart has items) */}
              {cart.length > 0 && (
                <div className="p-5 bg-[#141414] border-t border-[#262626] space-y-4 max-h-[50vh] overflow-y-auto">
                  {/* Delivery Zone Selector (if Delivery) */}
                  {orderType === 'DELIVERY' && deliveryZones.length > 0 && (
                    <div className="space-y-1 text-xs">
                      <label className="font-mono text-[#d4af37] text-[10px] font-bold uppercase block">
                        {isRTL ? 'منطقة التوصيل المعتمدة' : 'Select Delivery Zone'}
                      </label>
                      <select
                        value={selectedZoneId}
                        onChange={(e) => setSelectedZoneId(e.target.value)}
                        className="w-full bg-[#1c1b1b] border border-[#333] text-white p-2 rounded-xl text-xs font-mono focus:border-[#d4af37] focus:outline-none"
                      >
                        {deliveryZones.map(zone => (
                          <option key={zone.id} value={zone.id}>
                            {zone.name} — ${parseFloat(zone.delivery_fee).toFixed(2)} delivery
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Customer Address & Contact Info */}
                  <div className="space-y-2 text-xs">
                    <span className="font-mono text-[#d4af37] text-[10px] font-bold uppercase block">
                      {isRTL ? 'بيانات العميل والتسليم' : 'Guest & Destination Details'}
                    </span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder={isRTL ? 'اسم العميل' : 'Full Name'}
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="bg-[#1c1b1b] border border-[#333] text-white p-2 rounded-xl text-xs focus:border-[#d4af37] focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder={isRTL ? 'رقم الهاتف' : 'Contact Phone'}
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="bg-[#1c1b1b] border border-[#333] text-white p-2 rounded-xl text-xs font-mono focus:border-[#d4af37] focus:outline-none"
                      />
                    </div>

                    {orderType === 'DELIVERY' && (
                      <>
                        <input
                          type="text"
                          placeholder={isRTL ? 'العنوان: الشارع، المبنى' : 'Street address / Building'}
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="w-full bg-[#1c1b1b] border border-[#333] text-white p-2 rounded-xl text-xs focus:border-[#d4af37] focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder={isRTL ? 'الدور، رقم الشقة، علامة مميزة' : 'Floor, Apt #, Landmark'}
                          value={buildingFloorApt}
                          onChange={(e) => setBuildingFloorApt(e.target.value)}
                          className="w-full bg-[#1c1b1b] border border-[#333] text-white p-2 rounded-xl text-xs focus:border-[#d4af37] focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder={isRTL ? 'تعليمات للسائق (بواب، جرس...)' : 'Instructions for courier (concierge, gate code...)'}
                          value={deliveryInstructions}
                          onChange={(e) => setDeliveryInstructions(e.target.value)}
                          className="w-full bg-[#1c1b1b] border border-[#333] text-white p-2 rounded-xl text-xs focus:border-[#d4af37] focus:outline-none"
                        />
                      </>
                    )}
                  </div>

                  {/* Promo Code Input */}
                  <form onSubmit={handleApplyPromo} className="space-y-1">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={isRTL ? 'رمز ترويجي (LUXE20)' : 'Promo code (e.g. LUXE20)'}
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value)}
                        className="flex-1 bg-[#1c1b1b] border border-[#333] text-white px-3 py-1.5 rounded-xl text-xs font-mono focus:border-[#d4af37] focus:outline-none uppercase"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-[#252424] hover:bg-[#333] border border-[#444] text-[#d4af37] font-mono text-xs font-bold rounded-xl cursor-pointer"
                      >
                        {isRTL ? 'تطبيق' : 'Apply'}
                      </button>
                    </div>
                    {appliedPromo && (
                      <p className="text-[10px] font-mono text-[#4edea3]">
                        ✓ {appliedPromo.label}
                      </p>
                    )}
                    {promoError && (
                      <p className="text-[10px] font-mono text-[#ff949c]">
                        {promoError}
                      </p>
                    )}
                  </form>

                  {/* Payment Method Selector */}
                  <div className="space-y-1.5 text-xs">
                    <span className="font-mono text-[#d4af37] text-[10px] font-bold uppercase block">
                      {isRTL ? 'طريقة الدفع' : 'Payment Collection'}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CARD')}
                        className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-mono text-xs cursor-pointer transition-colors ${
                          paymentMethod === 'CARD'
                            ? 'bg-[#d4af37]/20 border-[#d4af37] text-white font-bold'
                            : 'bg-[#1c1b1b] border-[#333] text-[#888]'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>{isRTL ? 'بطاقة إلكترونية' : 'Card (Online)'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CASH')}
                        className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-mono text-xs cursor-pointer transition-colors ${
                          paymentMethod === 'CASH'
                            ? 'bg-[#d4af37]/20 border-[#d4af37] text-white font-bold'
                            : 'bg-[#1c1b1b] border-[#333] text-[#888]'
                        }`}
                      >
                        <Banknote className="w-3.5 h-3.5" />
                        <span>{isRTL ? 'دفع عند الاستلام' : 'Cash (COD)'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Cost Summary */}
                  <div className="pt-3 border-t border-[#262626] space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-[#888]">
                      <span>{isRTL ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                      <span>${cartSubtotal.toFixed(2)}</span>
                    </div>

                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-[#4edea3]">
                        <span>{isRTL ? 'الخصم الترويجي:' : 'Promo Discount:'}</span>
                        <span>-${promoDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    {orderType === 'DELIVERY' && (
                      <div className="flex justify-between text-[#888]">
                        <span>{isRTL ? 'رسوم التوصيل:' : 'Delivery Fee:'}</span>
                        <span>
                          {deliveryFee === 0 ? (
                            <span className="text-[#4edea3] font-bold">{isRTL ? 'مجاني' : 'FREE'}</span>
                          ) : (
                            `$${deliveryFee.toFixed(2)}`
                          )}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-[#888]">
                      <span>{isRTL ? 'الضريبة (8.25%):' : 'Estimated Tax (8.25%):'}</span>
                      <span>${taxAmount.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-[#333]">
                      <span>{isRTL ? 'المجموع الإجمالي:' : 'Order Total:'}</span>
                      <span className="text-[#d4af37] text-base font-mono">
                        ${cartTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Submit Order Button */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={submitting}
                    className="w-full py-3.5 bg-gradient-to-r from-[#d4af37] via-[#e4bf47] to-[#ffd868] hover:from-[#e4bf47] hover:to-[#ffe07d] text-black font-extrabold rounded-xl text-xs font-mono uppercase tracking-wider shadow-gold flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
                  >
                    {submitting ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin text-black" />
                        <span>{isRTL ? 'جاري إرسال الطلب للمطبخ...' : 'Transmitting to Master Kitchen...'}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-black" />
                        <span>
                          {isRTL ? 'تأكيد وإرسال الطلب الفاخر' : 'Confirm & Place Gourmet Order'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-black" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
