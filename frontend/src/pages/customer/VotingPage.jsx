import { useState, useEffect, useCallback } from 'react';
import { FaStar, FaBolt, FaTrophy, FaTimes, FaWhatsapp } from 'react-icons/fa';
import CustomerLayout from '../../components/layout/CustomerLayout';
import api, { getImageUrl } from '../../utils/api';

export default function VotingPage() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voteModal, setVoteModal] = useState(null);
  const [lightboxModel, setLightboxModel] = useState(null);

  const fetchModels = useCallback(() => {
    api.get('/models').then((res) => setModels(res.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchModels();
    const interval = setInterval(fetchModels, 10000);
    return () => clearInterval(interval);
  }, [fetchModels]);

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
            <p className="text-gray-400 max-w-xl mx-auto">Vote for your favorite model. Send payment proof via WhatsApp and your votes will be recorded. Vote counts update in real-time!</p>
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
                    className={`bg-flash-card border border-flash-border rounded-xl relative overflow-hidden hover:border-flash-yellow/50 transition-all group ${idx === 0 ? 'border-flash-yellow/50' : ''}`}
                  >
                    {idx < 3 && (
                      <div className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                        ${idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-gray-400 text-black' : 'bg-yellow-800 text-white'}`}>
                        {idx === 0 ? <FaTrophy size={14} /> : `#${idx + 1}`}
                      </div>
                    )}

                    <div
                      className="w-full h-[320px] sm:h-[350px] overflow-hidden cursor-zoom-in"
                      onClick={() => model.photo_url && setLightboxModel(model)}
                    >
                      {model.photo_url
                        ? <img src={getImageUrl(model.photo_url)} alt={model.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.target.style.display = 'none'; }} />
                        : <div className="w-full h-full bg-flash-border flex items-center justify-center text-5xl">👤</div>
                      }
                    </div>

                    <div className="p-5">
                      <h3 className="text-white font-bold text-xl text-center mb-1">{model.name}</h3>

                      <div className="flex items-center justify-center gap-2 mb-3">
                        <FaStar className="text-flash-yellow" />
                        <span className="text-flash-yellow font-bold text-2xl">{Number(model.vote_count).toLocaleString()}</span>
                        <span className="text-gray-500 text-sm">votes</span>
                      </div>

                      <div className="bg-flash-border rounded-full h-2 mb-4 overflow-hidden">
                        <div className="bg-flash-yellow h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>

                      <p className="text-center text-xs text-gray-400 mb-4">
                        ₦{Number(model.vote_price).toLocaleString()} per vote
                      </p>

                      <button
                        onClick={() => setVoteModal(model)}
                        className="w-full btn-primary justify-center"
                      >
                        <FaStar size={14} /> Vote for {model.name.split(' ')[0]}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Photo Lightbox */}
      {lightboxModel && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxModel(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-flash-black/70 text-white rounded-full flex items-center justify-center hover:bg-flash-yellow hover:text-flash-black transition-colors"
            onClick={() => setLightboxModel(null)}
          >
            <FaTimes size={16} />
          </button>
          <img
            src={getImageUrl(lightboxModel.photo_url)}
            alt={lightboxModel.name}
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Vote Modal */}
      {voteModal && (
        <div
          className="fixed inset-0 z-50 bg-flash-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setVoteModal(null)}
        >
          <div
            className="bg-flash-card border border-flash-border rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-white font-bold text-xl">Vote for {voteModal.name}</h2>
              <button
                onClick={() => setVoteModal(null)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Price badge */}
            <div className="bg-flash-yellow/10 border border-flash-yellow/30 rounded-xl p-3 mb-6 text-center">
              <p className="text-flash-yellow font-bold text-lg">💰 ₦{Number(voteModal.vote_price).toLocaleString()} per vote</p>
            </div>

            {/* Steps */}
            <div className="space-y-4 mb-6">
              <p className="text-flash-yellow font-bold text-sm tracking-widest uppercase">How to Vote</p>

              {/* Step 1 */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-flash-yellow font-bold text-sm mb-2">STEP 1</p>
                <p className="text-gray-300 text-sm mb-2">Send the desired amount to:</p>
                <div className="bg-black/30 rounded-lg p-3 space-y-1">
                  <p className="text-white font-semibold text-sm">Acct No: <span className="text-flash-yellow">7056963068</span> (OPAY)</p>
                  <p className="text-white font-semibold text-sm">Acct Name: <span className="text-flash-yellow">Flash Lounge and Suites</span></p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-flash-yellow font-bold text-sm mb-2">STEP 2</p>
                <p className="text-gray-300 text-sm mb-1">Send proof of payment on WhatsApp to:</p>
                <p className="text-white font-bold text-lg">08138497812</p>
              </div>

              {/* Step 3 */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-flash-yellow font-bold text-sm mb-1">STEP 3</p>
                <p className="text-gray-300 text-sm">All valid votes will be recorded and confirmed.</p>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/2348138497812?text=${encodeURIComponent(`Hi! I want to vote for ${voteModal.name} in the Flash Lounge Model Competition. Here is my proof of payment.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ backgroundColor: '#25D366' }}
            >
              <FaWhatsapp size={20} />
              Send Proof on WhatsApp →
            </a>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}
