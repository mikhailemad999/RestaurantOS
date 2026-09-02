import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import CustomerNavbar from '../components/CustomerNavbar';
import { 
  CheckCircle2, Clock, Truck, ChefHat, PackageCheck, 
  MapPin, Phone, Star, Send, ArrowLeft, RefreshCw, 
  Sparkles, AlertCircle, ShoppingBag, ShieldCheck
} from 'lucide-react';

export default function OrderTrackingPage() {
  const { id } = useParams();
  const { t, isRTL } = useLanguage();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Review Form State
  const [overallRating, setOverallRating] = useState(5);
  const [foodRating, setFoodRating] = useState(5);
  const [speedRating, setSpeedRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadOrderDetails();
    const interval = setInterval(loadOrderDetails, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const loadOrderDetails = async () => {
    try {
      setRefreshing(true);
      const data = await api.getOrderById(id);
      setOrder(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load order:', err);
      setError('Unable to load order status. It may still be syncing.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!order) return;
    setSubmittingReview(true);
    try {
      await api.createFeedback({
        order: order.id,
        customer_name: order.customer_name || 'Gourmet Guest',
        rating_overall: overallRating,
        rating_food: foodRating,
        rating_service: 5,
        rating_speed: speedRating,
        comment: reviewComment,
        status: 'NEW'
      });
      setReviewSubmitted(true);
    } catch (err) {
      alert(`Error submitting review: ${err.message}`);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Determine current stage index (0 to 4)
  const getStageIndex = () => {
    if (!order) return 0;
    const status = order.status;
    const deliveryStatus = order.delivery_info?.delivery_status;

    if (status === 'COMPLETED' || deliveryStatus === 'DELIVERED') return 4;
    if (deliveryStatus === 'PICKED_UP' || deliveryStatus === 'IN_TRANSIT') return 3;
    if (status === 'READY') return 2;
    if (status === 'PREPARING') return 1;
    return 0; // PENDING
  };

  const currentStage = getStageIndex();

  const stages = [
    {
      label: isRTL ? 'تم استلام الطلب' : 'Order Received',
      subtext: isRTL ? 'تم تأكيد طلبك في المطبخ' : 'Logged & verified with kitchen',
      icon: CheckCircle2,
    },
    {
      label: isRTL ? 'المطبخ يُحضّر الوجبة' : 'Kitchen Preparing',
      subtext: isRTL ? 'الشيف أنطوان يُحضر طلبك' : 'Chef Antoine preparing your selection',
      icon: ChefHat,
    },
    {
      label: isRTL ? 'فحص الجودة والتغليف' : 'Quality Sealed',
      subtext: isRTL ? 'مغلف بحرارة معزولة' : 'Insulated & thermal packed',
      icon: PackageCheck,
    },
    {
      label: isRTL ? 'في الطريق مع السائق' : 'Out for Delivery',
      subtext: isRTL ? 'السائق في الطريق إليك' : 'Courier en route to your address',
      icon: Truck,
    },
    {
      label: isRTL ? 'تم التوصيل بنجاح' : 'Delivered & Bon Appétit',
      subtext: isRTL ? 'نتمنى لك تجربة ممتعة' : 'Enjoy your culinary experience',
      icon: Sparkles,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#131313] text-[#e5e2e1] flex flex-col">
        <CustomerNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#d4af37] animate-spin mx-auto" />
            <p className="font-mono text-xs text-[#a89e87]">
              {isRTL ? 'جاري تحميل تفاصيل الطلب...' : 'Loading gourmet order status...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#131313] text-[#e5e2e1] flex flex-col">
        <CustomerNavbar />
        <div className="flex-1 max-w-xl mx-auto p-6 flex items-center justify-center">
          <div className="bg-[#1c1b1b] border border-[#ff949c]/30 p-8 rounded-2xl text-center space-y-4 shadow-card">
            <AlertCircle className="w-12 h-12 text-[#ff949c] mx-auto" />
            <h2 className="text-lg font-bold text-white">Order Reference Not Found</h2>
            <p className="text-xs text-[#a89e87]">{error || 'Could not find order #' + id}</p>
            <Link
              to="/online-ordering"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#d4af37] text-black font-bold text-xs rounded-xl shadow-gold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Menu</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] flex flex-col font-sans">
      <CustomerNavbar />

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-3">
            <Link
              to="/online-ordering"
              className="p-2 rounded-xl bg-[#1c1b1b] border border-[#353535] hover:border-[#d4af37] text-[#a89e87] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#d4af37] uppercase font-bold tracking-widest">
                  {isRTL ? 'تتبع الطلب الحي' : 'Live Order Tracking'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse"></span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-white font-mono">
                #{order.order_number}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadOrderDetails}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1c1b1b] border border-[#353535] hover:border-[#d4af37] text-[#d0c5af] text-xs rounded-xl font-mono transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#d4af37]' : ''}`} />
              <span>{isRTL ? 'تحديث' : 'Refresh'}</span>
            </button>
            <span className="px-3 py-1.5 bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37] text-xs font-mono font-bold rounded-xl">
              {order.order_type}
            </span>
          </div>
        </div>

        {/* Live Status Stepper Card */}
        <div className="bg-gradient-to-b from-[#1c1b1b] to-[#171717] border border-[#333232] rounded-2xl p-6 shadow-card space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-[#a89e87] uppercase">
                {isRTL ? 'حالة التجهيز الحالية' : 'Current Culinary Milestone'}
              </span>
              <h2 className="text-lg md:text-xl font-bold text-white mt-0.5">
                {stages[currentStage]?.label}
              </h2>
              <p className="text-xs text-[#4edea3] font-mono mt-1">
                ● {stages[currentStage]?.subtext}
              </p>
            </div>

            <div className="bg-[#131313] border border-[#2a2a2a] px-4 py-2.5 rounded-xl text-right">
              <span className="text-[10px] font-mono text-[#99907c] block uppercase tracking-wider">
                {isRTL ? 'الوقت المتوقع' : 'Estimated Arrival'}
              </span>
              <div className="flex items-center gap-1.5 text-base font-mono font-black text-[#d4af37]">
                <Clock className="w-4 h-4 text-[#d4af37]" />
                <span>{currentStage >= 4 ? (isRTL ? 'تم التسليم' : 'Completed') : (isRTL ? '25-35 دقيقة' : '25-35 mins')}</span>
              </div>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="relative pt-4 pb-2">
            <div className="grid grid-cols-5 gap-2 relative z-10">
              {stages.map((stage, idx) => {
                const Icon = stage.icon;
                const isPassed = idx <= currentStage;
                const isCurrent = idx === currentStage;

                return (
                  <div key={idx} className="flex flex-col items-center text-center space-y-2">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-[#d4af37] text-black shadow-gold scale-110 ring-4 ring-[#d4af37]/20'
                          : isPassed
                          ? 'bg-[#4edea3] text-black'
                          : 'bg-[#222] text-[#666] border border-[#333]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[11px] font-medium leading-tight hidden sm:block ${
                        isCurrent ? 'text-[#d4af37] font-bold' : isPassed ? 'text-white' : 'text-[#666]'
                      }`}
                    >
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Connecting Line */}
            <div className="absolute top-9 left-6 right-6 h-0.5 bg-[#2a2a2a] -z-0">
              <div
                className="h-full bg-gradient-to-r from-[#4edea3] to-[#d4af37] transition-all duration-500"
                style={{ width: `${(currentStage / (stages.length - 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Courier & Delivery Destination Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Courier Card */}
          <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-5 space-y-4 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
              <span className="text-xs font-mono text-[#d4af37] uppercase font-bold flex items-center gap-1.5">
                <Truck className="w-4 h-4" />
                {isRTL ? 'معلومات السائق والتوصيل' : 'Dispatched Courier Logistics'}
              </span>
              <span className="text-[10px] font-mono bg-[#4edea3]/10 text-[#4edea3] px-2 py-0.5 rounded">
                {isRTL ? 'مكلف بالتوصيل' : 'Assigned Driver'}
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                alt="Courier"
                className="w-12 h-12 rounded-full object-cover border-2 border-[#d4af37]"
              />
              <div className="flex-1">
                <h3 className="font-bold text-sm text-white">
                  {order.delivery_info?.driver_name || 'Alex Rivera'}
                </h3>
                <p className="text-[11px] text-[#a89e87] font-mono">
                  {isRTL ? 'سائق النخبة • دراجة حرارية معزولة' : 'Lead Courier • Insulated Gastro Carrier'}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-[#d4af37] mt-0.5">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="font-mono font-bold">4.96 ★ (1,240 Deliveries)</span>
                </div>
              </div>

              <a
                href="tel:+201009988776"
                className="p-2.5 bg-[#252424] hover:bg-[#333] border border-[#3d3d3d] rounded-xl text-[#d4af37] transition-colors"
                title="Call Courier"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>

            <div className="p-3 bg-[#141414] rounded-xl border border-[#282828] text-xs font-mono text-[#a89e87] space-y-1">
              <div className="flex justify-between">
                <span>{isRTL ? 'منطقة التوصيل:' : 'Delivery Zone:'}</span>
                <span className="text-white font-bold">{order.delivery_info?.zone_name || 'Downtown & Zamalek'}</span>
              </div>
              <div className="flex justify-between">
                <span>{isRTL ? 'حالة الشحنة:' : 'Logistics State:'}</span>
                <span className="text-[#4edea3] font-bold">{order.delivery_info?.delivery_status || 'PREPARING'}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address & Customer Info */}
          <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-5 space-y-4 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
              <span className="text-xs font-mono text-[#d4af37] uppercase font-bold flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {isRTL ? 'وجهة التسليم' : 'Delivery Destination'}
              </span>
              <span className="text-[10px] font-mono bg-[#141414] text-[#a89e87] px-2 py-0.5 rounded border border-[#2e2e2e]">
                {order.payment_method === 'CASH' ? (isRTL ? 'دفع عند الاستلام' : 'Cash on Delivery') : (isRTL ? 'مدفوع إلكترونياً' : 'Paid Online')}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] text-[#99907c] font-mono uppercase block">{isRTL ? 'اسم العميل' : 'Recipient'}</span>
                <span className="font-bold text-white text-sm">{order.customer_name || 'Valued Guest'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#99907c] font-mono uppercase block">{isRTL ? 'العنوان المسجل' : 'Destination Address'}</span>
                <p className="text-[#e5e2e1] leading-relaxed">
                  {order.delivery_info?.delivery_address || order.special_instructions || '742 Evergreen Terrace, Metropolis'}
                </p>
              </div>
              {order.special_instructions && (
                <div className="p-2.5 bg-[#20201f] rounded-lg border border-[#2e2e2e] text-[11px] text-[#d4af37]">
                  <span className="font-bold block text-[10px] uppercase font-mono">{isRTL ? 'تعليمات خاصة للطهي / التوصيل:' : 'Drop-off & Kitchen Notes:'}</span>
                  "{order.special_instructions}"
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Itemized Order Bill & Summary */}
        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-6 shadow-card space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2 pb-3 border-b border-[#2a2a2a]">
            <ShoppingBag className="w-4 h-4 text-[#d4af37]" />
            <span>{isRTL ? 'تفاصيل الوجبات والطلب' : 'Itemized Order Receipt'}</span>
          </h3>

          <div className="divide-y divide-[#2a2a2a]">
            {order.items?.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#252424] text-[#d4af37] font-mono font-bold text-xs flex items-center justify-center border border-[#3a3939]">
                    {item.quantity}x
                  </span>
                  <div>
                    <span className="font-bold text-xs text-white block">
                      {item.menu_item_name}
                    </span>
                    {item.selected_modifiers && item.selected_modifiers.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {item.selected_modifiers.map((m, mIdx) => (
                          <span key={mIdx} className="text-[10px] font-mono text-[#a89e87] bg-[#141414] px-1.5 py-0.5 rounded border border-[#292929]">
                            {m.name || m}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.notes && (
                      <span className="text-[10px] text-[#d4af37] italic block mt-0.5">
                        Note: {item.notes}
                      </span>
                    )}
                  </div>
                </div>

                <span className="font-mono font-bold text-xs text-[#d4af37]">
                  ${parseFloat(item.total_price).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Financial Breakdown */}
          <div className="pt-4 border-t border-[#2a2a2a] space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-[#a89e87]">
              <span>{isRTL ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
              <span>${parseFloat(order.subtotal || 0).toFixed(2)}</span>
            </div>
            {parseFloat(order.discount_amount || 0) > 0 && (
              <div className="flex justify-between text-[#4edea3]">
                <span>{isRTL ? 'الخصم الترويجي:' : 'Promo Discount:'}</span>
                <span>-${parseFloat(order.discount_amount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#a89e87]">
              <span>{isRTL ? 'ضريبة القيمة المضافة (8.25%):' : 'Estimated Tax (8.25%):'}</span>
              <span>${parseFloat(order.tax_amount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#a89e87]">
              <span>{isRTL ? 'رسوم التوصيل:' : 'Delivery Fee:'}</span>
              <span className="text-[#4edea3] font-bold">{isRTL ? 'مجاني (طلب مميز)' : 'Complimentary'}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-[#333]">
              <span>{isRTL ? 'الإجمالي الكلي:' : 'Total Paid / Due:'}</span>
              <span className="text-[#d4af37] text-lg font-mono">
                ${parseFloat(order.total_amount || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Experience Review & Rating Form */}
        <div className="bg-gradient-to-br from-[#1c1b1b] via-[#201f1f] to-[#1a1919] border border-[#d4af37]/30 rounded-2xl p-6 shadow-gold space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
            <div>
              <span className="text-[10px] font-mono text-[#d4af37] uppercase font-bold tracking-widest block">
                {isRTL ? 'تقييم تجربة الضيف' : 'Guest Experience & Feedback'}
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                {isRTL ? 'شارك رأيك مع الشيف التنفيذي' : 'Rate Your Culinary Experience'}
              </h3>
            </div>
            <Sparkles className="w-5 h-5 text-[#d4af37]" />
          </div>

          {reviewSubmitted ? (
            <div className="p-6 bg-[#141414] rounded-xl border border-[#4edea3]/40 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-[#4edea3] mx-auto" />
              <h4 className="font-bold text-white text-sm">
                {isRTL ? 'شكراً لتقييمك الكريم!' : 'Thank You For Your Feedback!'}
              </h4>
              <p className="text-xs text-[#a89e87]">
                {isRTL
                  ? 'تم إرسال تقييمك مباشرة إلى الشيف أنطوان وفريق إدارة المطعم.'
                  : 'Your review has been logged with Chef Antoine Dubois and the management desk.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Overall Rating */}
                <div className="bg-[#141414] p-3 rounded-xl border border-[#2a2a2a] text-center space-y-1">
                  <span className="text-[10px] font-mono text-[#99907c] uppercase block">
                    {isRTL ? 'التقييم العام' : 'Overall Rating'}
                  </span>
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setOverallRating(star)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= overallRating ? 'text-[#d4af37] fill-[#d4af37]' : 'text-[#444]'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Food Quality */}
                <div className="bg-[#141414] p-3 rounded-xl border border-[#2a2a2a] text-center space-y-1">
                  <span className="text-[10px] font-mono text-[#99907c] uppercase block">
                    {isRTL ? 'جودة المذاق والطعام' : 'Taste & Food Quality'}
                  </span>
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFoodRating(star)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= foodRating ? 'text-[#d4af37] fill-[#d4af37]' : 'text-[#444]'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery Speed */}
                <div className="bg-[#141414] p-3 rounded-xl border border-[#2a2a2a] text-center space-y-1">
                  <span className="text-[10px] font-mono text-[#99907c] uppercase block">
                    {isRTL ? 'سرعة التوصيل والدقة' : 'Delivery Speed & Care'}
                  </span>
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setSpeedRating(star)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= speedRating ? 'text-[#d4af37] fill-[#d4af37]' : 'text-[#444]'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comment Box */}
              <div>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={
                    isRTL
                      ? 'أخبرنا عن تجربتك مع الأطباق... (مثال: اللحم كان طرياً ولذيذاً للغاية)'
                      : 'Share your thoughts on the texture, seasoning, or packaging with Chef Antoine...'
                  }
                  className="w-full bg-[#141414] border border-[#333] rounded-xl p-3 text-xs text-white placeholder-[#666] focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#e4bf47] hover:from-[#e4bf47] hover:to-[#ffd868] text-black font-extrabold text-xs rounded-xl shadow-gold flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-black" />
                  <span>{submittingReview ? (isRTL ? 'جاري الإرسال...' : 'Submitting...') : (isRTL ? 'إرسال التقييم' : 'Submit Review')}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Return Button */}
        <div className="text-center pt-4">
          <Link
            to="/online-ordering"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#a89e87] hover:text-[#d4af37] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isRTL ? 'العودة إلى قائمة الطعام والطلب مجدداً' : 'Explore Menu & Order More Items'}</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
