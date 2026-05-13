import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaStar, FaBolt, FaTrophy, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import CustomerLayout from '../../components/layout/CustomerLayout';
import api, { getImageUrl } from '../../utils/api';

export default function VotingPage() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voteModal, setVoteModal] = useState(null);
  const [form, setForm] = useState({ voter_name: '', voter_phone: '', voter_email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [searchParams] = useSearchParams();

  const fetchModels = useCallback(() => {
    api.get('/models').then((res) => setModels(res.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchModels();
    const interval = setInterval(fetchModels, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [fetchModels]);

  // Handle payment redirect verification
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      api.get(`/models/verify/${ref}`)
        .then((res) => {
          if (res.data.status === 'success') {
            toast.success(`Vote confirmed! ${res.data.model?.name ? `Go ${res.data.model.name}!` : ''}`);
            fetchModels();
          }
        })
        .catch(() => {});
    }
  }, [searchParams, fetchModels]);

  const handleVote = async (e) => {
    e.preventDefault();
    if (!form.voter_name.trim() || !form.voter_phone.trim()) {
      return toast.error('Please fill in your name and phone number');
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/models/${voteModal.id}/vote`, form);
      toast.success('Redirecting to payment...');
      setTimeout(() => {
        window.location.href = res.data.checkout_url;
      }, 500);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to initiate vote payment');
      setSubmitting(false);
    }
  };

  const sorted = [...models].sort((a, b) => b.vote_count - a.vote_count);

  return (
    <CustomerLayout>
      <div className="pt-24 pb-20 min-h-screen px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-flash-yellow/10 border border-flash-yellow/30 text-flash-yellow px-4 py-2 rounded-full text-sm font-semibold mb-4 animate-pulse">
              <FaBolt size={12} /> LIVE VOTING
            </div>
            <p className="section-subtitle mb-3">Cast Your Vote</p>
            <h1 className="section-title mb-4">Flash Lounge Model Voting</h1>
            <div className="yellow-divider mx-auto mb-4" />
            <p className="text-gray-400 max-w-xl mx-auto">Vote for your favorite model. Each vote costs a small fee via secure Korapay payment. Vote counts update in real-time!</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card animate-pulse h-72" />
              ))}
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🏆</div>
              <p className="text-gray-400 text-lg">No active voting competitions right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map((model, idx) => {
                const maxVotes = sorted[0]?.vote_count || 1;
                const pct = maxVotes > 0 ? Math.round((model.vote_count / maxVotes) * 100) : 0;

                return (
                  <div
                    key={model.id}
                    className={`card relative overflow-hidden hover:border-flash-yellow/50 transition-all group ${idx === 0 ? 'border-flash-yellow/50' : ''}`}
                  >
                    {/* Rank badge */}
                    {idx < 3 && (
                      <div className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                        ${idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-gray-400 text-black' : 'bg-yellow-800 text-white'}`}>
                        {idx === 0 ? <FaTrophy size={14} /> : `#${idx + 1}`}
                      </div>
                    )}

                    {/* Photo */}
                    <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-4 border-3 border-flash-yellow/30 group-hover:border-flash-yellow/60 transition-colors">
                      {model.photo_url
                        ? <img src={getImageUrl(model.photo_url)} alt={model.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-flash-border flex items-center justify-center text-4xl">👤</div>
                      }
                    </div>

                    {/* Info */}
                    <h3 className="text-white font-bold text-xl text-center mb-1">{model.name}</h3>

                    {/* Vote count */}
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <FaStar className="text-flash-yellow" />
                      <span className="text-flash-yellow font-bold text-2xl">{Number(model.vote_count).toLocaleString()}</span>
                      <span className="text-gray-500 text-sm">votes</span>
                    </div>

                    {/* Progress bar */}
                    <div className="bg-flash-border rounded-full h-2 mb-4 overflow-hidden">
                      <div
                        className="bg-flash-yellow h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* Vote price */}
                    <p className="text-center text-xs text-gray-400 mb-4">
                      ₦{Number(model.vote_price).toLocaleString()} per vote
                    </p>

                    {/* Vote button */}
                    <button
                      onClick={() => { setVoteModal(model); setForm({ voter_name: '', voter_phone: '', voter_email: '' }); }}
                      className="w-full btn-primary justify-center"
                    >
                      <FaStar size={14} /> Vote for {model.name.split(' ')[0]}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Vote Modal */}
      {voteModal && (
        <div className="fixed inset-0 z-50 bg-flash-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setVoteModal(null)}>
          <div className="bg-flash-card border border-flash-border rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white font-bold text-xl">Vote for {voteModal.name}</h2>
              <button onClick={() => setVoteModal(null)} className="text-gray-400 hover:text-white"><FaTimes /></button>
            </div>

            <div className="bg-flash-yellow/10 border border-flash-yellow/30 rounded-lg p-3 mb-6 text-center">
              <p className="text-flash-yellow font-semibold">₦{Number(voteModal.vote_price).toLocaleString()} per vote</p>
              <p className="text-gray-400 text-xs mt-1">Secure payment via Korapay</p>
            </div>

            <form onSubmit={handleVote} className="space-y-4">
              <div>
                <label className="label">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={form.voter_name}
                  onChange={(e) => setForm({ ...form, voter_name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="08012345678"
                  value={form.voter_phone}
                  onChange={(e) => setForm({ ...form, voter_phone: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Email (optional)</label>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={form.voter_email}
                  onChange={(e) => setForm({ ...form, voter_email: e.target.value })}
                  className="input-field"
                />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed">
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-flash-black border-t-transparent rounded-full animate-spin" /> Processing...</>
                ) : (
                  <><FaBolt /> Pay & Vote Now</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}
