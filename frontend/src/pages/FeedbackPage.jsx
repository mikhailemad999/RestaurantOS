import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  MessageSquare, Star, CheckCircle, RefreshCw, Sparkles, 
  ThumbsUp, User, HeartHandshake, Check, Plus, X
} from 'lucide-react';

export default function FeedbackPage() {
  const { addToast } = useToast();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState('ALL');

  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    customer_name: '',
    rating_overall: 5,
    rating_food: 5,
    rating_service: 5,
    rating_speed: 5,
    comment: ''
  });

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const res = await api.getFeedback();
      setFeedbacks(res);
    } catch (err) {
      console.error('Failed to load feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.resolveFeedback(id);
      addToast('Customer feedback marked as resolved & acknowledged.', 'success');
      loadFeedback();
    } catch (err) {
      addToast(`Error resolving feedback: ${err.message}`, 'error');
    }
  };

  const handleCreateReview = async (e) => {
    e.preventDefault();
    if (!newReview.comment) return;

    try {
      await api.createFeedback({
        ...newReview,
        status: 'RESOLVED'
      });
      addToast('New guest review submitted successfully!', 'success');
      setIsAddReviewOpen(false);
      setNewReview({
        customer_name: '',
        rating_overall: 5,
        rating_food: 5,
        rating_service: 5,
        rating_speed: 5,
        comment: ''
      });
      loadFeedback();
    } catch (err) {
      addToast(`Error submitting review: ${err.message}`, 'error');
    }
  };

  const filteredFeedbacks = filterRating === 'ALL'
    ? feedbacks
    : feedbacks.filter(f => f.rating_overall === Number(filterRating));

  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((s, f) => s + f.rating_overall, 0) / feedbacks.length).toFixed(1)
    : '4.8';

  return (
    <div className="min-h-full p-4 md:p-6 bg-[#131313] flex flex-col space-y-5">
      {/* Header */}
      <div className="bg-[#1c1b1b] p-4 rounded-xl border border-[#2a2a2a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#d4af37]" />
            Guest Feedback & Multi-Criteria Satisfaction
          </h1>
          <p className="text-xs text-[#99907c] font-mono">Food quality, service hospitality, ticket speed & sentiment analytics</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddReviewOpen(true)}
            className="px-4 py-2 bg-[#d4af37] hover:bg-[#f2ca50] text-black font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-gold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Guest Review</span>
          </button>
          <button
            onClick={loadFeedback}
            className="p-2 bg-[#131313] hover:bg-[#2a2a2a] border border-[#353535] rounded-lg text-[#99907c] hover:text-white cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Aggregate Score & Star Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1c1b1b] border-2 border-[#d4af37] rounded-2xl p-4 shadow-gold flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#99907c]">Average Guest Rating</span>
            <div className="text-3xl font-extrabold text-[#d4af37] font-mono mt-1 flex items-center gap-2">
              {avgRating} <Star className="w-6 h-6 fill-[#d4af37]" />
            </div>
          </div>
          <span className="text-[10px] text-[#4edea3] font-mono">98% Positive</span>
        </div>

        {/* Rating Filter Buttons */}
        <div className="md:col-span-3 bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-4 flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-mono text-[#99907c]">Filter by Stars:</span>
          <div className="flex gap-2">
            {['ALL', 5, 4, 3, 2, 1].map(r => (
              <button
                key={r}
                onClick={() => setFilterRating(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-colors ${
                  filterRating === r ? 'bg-[#d4af37] text-black' : 'bg-[#131313] text-[#d0c5af] border border-[#2a2a2a]'
                }`}
              >
                {r === 'ALL' ? 'All Reviews' : `${r} ★`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feedbacks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFeedbacks.map(fb => (
          <div key={fb.id} className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-5 shadow-card flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#20201f] text-white flex items-center justify-center font-bold text-xs">
                    {fb.customer_name ? fb.customer_name[0] : 'G'}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-white">{fb.customer_name || 'Anonymous Guest'}</h3>
                    <span className="text-[10px] text-[#99907c] font-mono">{new Date(fb.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[#d4af37]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < fb.rating_overall ? 'fill-[#d4af37]' : 'text-[#353535]'}`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-[#d0c5af] font-sans mt-3 italic bg-[#131313] p-3 rounded-xl border border-[#2a2a2a]">
                "{fb.comment}"
              </p>

              <div className="grid grid-cols-3 gap-2 mt-3 text-center text-[10px] font-mono text-[#99907c]">
                <div className="bg-[#20201f] p-1.5 rounded-lg">
                  <span>Food: </span>
                  <span className="text-white font-bold">{fb.rating_food}★</span>
                </div>
                <div className="bg-[#20201f] p-1.5 rounded-lg">
                  <span>Service: </span>
                  <span className="text-white font-bold">{fb.rating_service}★</span>
                </div>
                <div className="bg-[#20201f] p-1.5 rounded-lg">
                  <span>Speed: </span>
                  <span className="text-white font-bold">{fb.rating_speed}★</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#2a2a2a] flex items-center justify-between">
              <span className={`text-[10px] font-mono font-bold ${fb.status === 'RESOLVED' ? 'text-[#4edea3]' : 'text-[#d4af37]'}`}>
                ● {fb.status}
              </span>

              {fb.status === 'PENDING' && (
                <button
                  onClick={() => handleResolve(fb.id)}
                  className="px-3 py-1 bg-[#005236] text-[#4edea3] rounded-lg text-xs font-bold font-mono flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark Reviewed</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Review Modal */}
      {isAddReviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-[#d4af37] rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2a2a2a]">
              <h3 className="text-lg font-bold text-white">Submit Guest Review</h3>
              <button onClick={() => setIsAddReviewOpen(false)} className="text-[#99907c] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-4 text-xs">
              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Guest Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Robert Sterling"
                  value={newReview.customer_name}
                  onChange={(e) => setNewReview({ ...newReview, customer_name: e.target.value })}
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded focus:border-[#d4af37] focus:outline-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Overall Rating</label>
                  <select
                    value={newReview.rating_overall}
                    onChange={(e) => setNewReview({ ...newReview, rating_overall: Number(e.target.value) })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded font-mono focus:border-[#d4af37] focus:outline-none"
                  >
                    <option value={5}>5 Stars ★★★★★</option>
                    <option value={4}>4 Stars ★★★★☆</option>
                    <option value={3}>3 Stars ★★★☆☆</option>
                    <option value={2}>2 Stars ★★☆☆☆</option>
                    <option value={1}>1 Star ★☆☆☆☆</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Food Quality</label>
                  <select
                    value={newReview.rating_food}
                    onChange={(e) => setNewReview({ ...newReview, rating_food: Number(e.target.value) })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded font-mono focus:border-[#d4af37] focus:outline-none"
                  >
                    <option value={5}>5 Stars ★★★★★</option>
                    <option value={4}>4 Stars ★★★★☆</option>
                    <option value={3}>3 Stars ★★★☆☆</option>
                    <option value={2}>2 Stars ★★☆☆☆</option>
                    <option value={1}>1 Star ★☆☆☆☆</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Review Comments *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Share dining and hospitality experience..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded focus:border-[#d4af37] focus:outline-none font-sans"
                />
              </div>

              <div className="pt-3 border-t border-[#2a2a2a] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddReviewOpen(false)}
                  className="px-4 py-2 bg-[#20201f] text-white rounded font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d4af37] text-black font-bold rounded shadow-gold uppercase font-mono"
                >
                  Post Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
