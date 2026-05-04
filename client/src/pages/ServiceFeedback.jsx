import React, { useState, useEffect } from 'react';
import {
  Star, MessageSquare, User, Hash, ThumbsUp, Send,
  TrendingUp, Award, Clock, Smile, Frown, Meh, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

const MONO = "font-['JetBrains_Mono',_'Courier_New',_monospace]";
const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${sessionStorage.getItem('token')}`
});

const FILTER_OPTIONS = ['All Ratings', '5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'];

const StarRating = ({ rating, size = 'w-5 h-5' }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} className={`${size} ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
    ))}
  </div>
);

const getSentimentIcon = (rating) => {
  if (rating >= 4) return <Smile className="w-5 h-5 text-emerald-400" />;
  if (rating === 3) return <Meh className="w-5 h-5 text-amber-400" />;
  return <Frown className="w-5 h-5 text-red-400" />;
};

const getTimeAgo = (dateStr) => {
  const diff = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return `${diff} days ago`;
};

const ServiceFeedback = () => {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All Ratings');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch(`${API}/service/feedback`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1) : '0.0';
  const fiveStarCount = reviews.filter(r => r.rating === 5).length;
  const fiveStarPercent = totalReviews > 0 ? Math.round((fiveStarCount / totalReviews) * 100) : 0;
  const repliedCount = reviews.filter(r => r.reply).length;
  const responseRate = totalReviews > 0 ? Math.round((repliedCount / totalReviews) * 100) : 0;

  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percent: totalReviews > 0 ? Math.round((reviews.filter(r => r.rating === star).length / totalReviews) * 100) : 0
  }));

  const filteredReviews = reviews.filter(r => {
    const matchesFilter = filter === 'All Ratings' || r.rating === parseInt(filter[0]);
    const matchesSearch =
      r.customer.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleReply = async (id) => {
    if (!replyText.trim()) return;
    try {
      const res = await fetch(`${API}/service/feedback/${id}/reply`, {
        method: 'PUT', headers: authHeaders(), body: JSON.stringify({ reply: replyText })
      });
      if (res.ok) {
        toast.success('Reply posted successfully!');
        setReplyingTo(null);
        setReplyText('');
        fetchFeedbacks();
      }
    } catch (err) { toast.error('Failed to post reply'); }
  };

  const simulateFeedback = async () => {
    try {
      const res = await fetch(`${API}/service/feedback`, {
        method: 'POST', headers: authHeaders(), 
        body: JSON.stringify({
          customer: 'New Customer',
          rating: 4,
          comment: 'Good service, but took a bit longer than expected.',
        })
      });
      if (res.ok) {
        toast.success('Simulated Feedback added!');
        fetchFeedbacks();
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto min-h-full">
      <Toaster position="top-center" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
            <MessageSquare className="w-10 h-10 text-amber-400" /> Feedback & Ratings
          </h1>
          <p className="text-base font-bold text-slate-500 mt-2">Monitor customer satisfaction and respond to reviews.</p>
        </div>
        <button onClick={simulateFeedback} className="px-5 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-sm font-black uppercase">
          + Simulate Review
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { title: 'Average Rating', val: `${avgRating}/5`, desc: 'Overall satisfaction', icon: Star, color: 'amber' },
          { title: 'Total Reviews', val: totalReviews, desc: 'Lifetime feedback', icon: MessageSquare, color: 'blue' },
          { title: '5-Star Rate', val: `${fiveStarPercent}%`, desc: `${fiveStarCount} of ${totalReviews} reviews`, icon: Award, color: 'emerald' },
          { title: 'Response Rate', val: `${responseRate}%`, desc: `${repliedCount} replied`, icon: Send, color: 'purple' }
        ].map((stat, i) => (
          <div key={i} className="bg-[#1e293b] rounded-3xl p-6 border border-white/5 flex items-center gap-5 relative overflow-hidden">
            <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center shrink-0`}>
              <stat.icon className={`w-7 h-7 text-${stat.color}-400`} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">{stat.title}</p>
              <p className={`text-3xl font-black text-white ${MONO}`}>{stat.val}</p>
              <p className="text-xs font-bold text-slate-500 mt-1">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Left: Breakdown */}
        <div className="xl:col-span-1">
          <div className="bg-[#1e293b] rounded-3xl p-8 border border-white/5 sticky top-8 space-y-6">
            <h2 className="text-base font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-4">
              <TrendingUp className="w-5 h-5 text-blue-400" /> Breakdown
            </h2>
            <div className="text-center py-4">
              <p className={`text-6xl font-black text-white ${MONO}`}>{avgRating}</p>
              <div className="flex justify-center mt-3"><StarRating rating={Math.round(parseFloat(avgRating))} size="w-6 h-6" /></div>
              <p className="text-sm font-bold text-slate-500 mt-3">{totalReviews} reviews</p>
            </div>
            <div className="space-y-3">
              {distribution.map(d => (
                <button key={d.star} onClick={() => setFilter(filter === `${d.star} Stars` ? 'All Ratings' : `${d.star} Stars`)}
                  className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-lg transition-all ${filter === `${d.star} Stars` ? 'bg-amber-500/10' : 'hover:bg-white/5'}`}>
                  <span className={`text-sm font-black w-3 ${filter === `${d.star} Stars` ? 'text-amber-400' : 'text-slate-400'}`}>{d.star}</span>
                  <Star className={`w-4 h-4 ${filter === `${d.star} Stars` ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                  <div className="flex-1 h-2.5 bg-[#0f172a] rounded-full overflow-hidden">
                    <div className={`h-full ${d.star >= 4 ? 'bg-emerald-500' : d.star === 3 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${d.percent}%` }} />
                  </div>
                  <span className="text-xs font-black w-8 text-right text-slate-500">{d.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Reviews Feed */}
        <div className="xl:col-span-3 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 bg-[#1e293b] p-4 rounded-2xl border border-white/5">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reviews..." className="w-full bg-[#0f172a] border border-white/10 rounded-xl pl-12 pr-6 py-4 text-white focus:outline-none" />
            </div>
            <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-[#0f172a] border border-white/10 rounded-xl px-5 py-4 text-sm font-black text-white uppercase focus:outline-none w-full md:w-48">
              {FILTER_OPTIONS.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>

          <AnimatePresence>
            {filteredReviews.length === 0 ? (
              <div className="py-20 text-center text-slate-500 font-bold bg-[#1e293b]/50 rounded-3xl border-2 border-dashed border-white/5">No reviews found.</div>
            ) : (
              filteredReviews.map((review) => (
                <motion.div layout key={review._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-[#1e293b] rounded-3xl border border-white/5 p-8 mb-6 hover:border-white/10 transition-colors">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center font-black text-white text-lg">
                        {review.customer.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white">{review.customer}</h3>
                        <div className="flex items-center gap-3 mt-1.5">
                          <StarRating rating={review.rating} size="w-4 h-4" />
                          <span className="text-xs font-bold text-slate-500">{getTimeAgo(review.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    {getSentimentIcon(review.rating)}
                  </div>
                  
                  <p className="text-base font-bold text-slate-300 leading-relaxed mb-6">"{review.comment}"</p>

                  <div className="flex items-center justify-end border-t border-white/5 pt-5">
                    {!review.reply && (
                      <button onClick={() => { setReplyingTo(review._id); setReplyText(''); }} className="flex items-center gap-2 text-sm font-black text-emerald-400">
                        <Send className="w-4 h-4" /> Reply
                      </button>
                    )}
                  </div>

                  {review.reply && (
                    <div className="mt-5 bg-[#0f172a] rounded-2xl p-5 border border-emerald-500/10 ml-6">
                      <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">Vendor Response</p>
                      <p className="text-sm font-bold text-slate-400">{review.reply}</p>
                    </div>
                  )}

                  {replyingTo === review._id && (
                    <div className="mt-5 ml-6 space-y-3">
                      <textarea rows="3" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write your reply..." className="w-full bg-[#0f172a] border border-emerald-500/20 rounded-xl px-5 py-4 text-white focus:outline-none" />
                      <div className="flex gap-3 justify-end">
                        <button onClick={() => setReplyingTo(null)} className="px-5 py-3 text-slate-400 font-black text-sm uppercase">Cancel</button>
                        <button onClick={() => handleReply(review._id)} className="px-6 py-3 bg-[#10b981] text-[#0f172a] rounded-xl font-black text-sm uppercase">Post Reply</button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ServiceFeedback;

