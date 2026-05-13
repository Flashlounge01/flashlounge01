import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaTimes, FaImage, FaChevronDown, FaChevronUp, FaEdit } from 'react-icons/fa';
import { FaStar, FaUsers, FaRotateRight } from 'react-icons/fa6';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api, { getImageUrl } from '../../utils/api';

const emptyForm = { name: '', vote_price: '100', is_active: true };

export default function AdminModels() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expandedVotes, setExpandedVotes] = useState(null);
  const [votes, setVotes] = useState({});

  const loadModels = () => {
    api.get('/models/admin/all')
      .then((res) => setModels(res.data))
      .catch(() => setModels([]))
      .finally(() => setLoading(false));
  };
  useEffect(loadModels, []);

  const openCreate = () => { setForm(emptyForm); setPhoto(null); setModal('create'); };
  const openEdit = (m) => {
    setForm({ name: m.name, vote_price: m.vote_price, is_active: m.is_active });
    setPhoto(null);
    setModal(m);
  };

  const loadVotes = async (modelId) => {
    if (expandedVotes === modelId) { setExpandedVotes(null); return; }
    try {
      const res = await api.get(`/models/${modelId}/votes`);
      setVotes((prev) => ({ ...prev, [modelId]: res.data }));
      setExpandedVotes(modelId);
    } catch { toast.error('Failed to load votes'); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photo) fd.append('photo', photo);
      if (modal === 'create') {
        await api.post('/models', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Model added!');
      } else {
        await api.put(`/models/${modal.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Model updated!');
      }
      setModal(null);
      loadModels();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this model and all their votes?')) return;
    try { await api.delete(`/models/${id}`); toast.success('Model deleted'); loadModels(); }
    catch { toast.error('Delete failed'); }
  };

  const handleReset = async (id, name) => {
    if (!window.confirm(`Reset all votes for ${name}? This cannot be undone.`)) return;
    try { await api.post(`/models/${id}/reset`); toast.success('Votes reset!'); loadModels(); }
    catch { toast.error('Reset failed'); }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-2xl">Model Voting</h1>
          <p className="text-gray-400 text-sm">{models.length} models registered</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><FaPlus /> Add Model</button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="card h-28 animate-pulse" />)}</div>
      ) : models.length === 0 ? (
        <div className="card text-center py-16 text-gray-500">No models yet. Add your first model!</div>
      ) : (
        <div className="space-y-4">
          {models.map((m) => (
            <div key={m.id} className="card p-0 overflow-hidden">
              <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Photo */}
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-flash-border flex-shrink-0">
                  {m.photo_url
                    ? <img src={getImageUrl(m.photo_url)} alt={m.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-flash-border flex items-center justify-center text-2xl">👤</div>}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-bold text-lg">{m.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${m.is_active ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                      {m.is_active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1"><FaStar className="text-flash-yellow" /> {Number(m.vote_count).toLocaleString()} votes</span>
                    <span className="text-green-400 font-semibold">₦{Number(m.total_revenue).toLocaleString()} revenue</span>
                    <span className="text-gray-500">₦{Number(m.vote_price).toLocaleString()}/vote</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => loadVotes(m.id)} className="p-2.5 border border-flash-border text-gray-400 hover:text-flash-yellow hover:border-flash-yellow rounded-lg transition-colors" title="View voters">
                    {expandedVotes === m.id ? <FaChevronUp size={13} /> : <FaUsers size={13} />}
                  </button>
                  <button onClick={() => handleReset(m.id, m.name)} className="p-2.5 border border-flash-border text-gray-400 hover:text-orange-400 hover:border-orange-400 rounded-lg transition-colors" title="Reset votes">
                    <FaRotateRight size={13} />
                  </button>
                  <button onClick={() => openEdit(m)} className="p-2.5 border border-flash-border text-gray-400 hover:text-flash-yellow hover:border-flash-yellow rounded-lg transition-colors">
                    <FaEdit size={13} />
                  </button>
                  <button onClick={() => handleDelete(m.id)} className="p-2.5 border border-flash-border text-gray-400 hover:text-red-400 hover:border-red-400 rounded-lg transition-colors">
                    <FaTrash size={13} />
                  </button>
                </div>
              </div>

              {/* Vote History */}
              {expandedVotes === m.id && (
                <div className="border-t border-flash-border bg-flash-dark p-4">
                  <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                    <FaUsers className="text-flash-yellow" /> Voters for {m.name}
                  </h4>
                  {!votes[m.id] || votes[m.id].length === 0 ? (
                    <p className="text-gray-500 text-sm">No votes recorded yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="text-gray-500 border-b border-flash-border">
                            <th className="pb-2 pr-4">Voter Name</th>
                            <th className="pb-2 pr-4">Phone</th>
                            <th className="pb-2 pr-4">Amount</th>
                            <th className="pb-2">Date</th>
                          </tr>
                        </thead>
                        <tbody className="space-y-1">
                          {votes[m.id].map((v) => (
                            <tr key={v.id} className="border-b border-flash-border/50 text-gray-300">
                              <td className="py-2 pr-4">{v.voter_name}</td>
                              <td className="py-2 pr-4">{v.voter_phone}</td>
                              <td className="py-2 pr-4 text-green-400">₦{Number(v.amount_paid).toLocaleString()}</td>
                              <td className="py-2 text-gray-500">{format(new Date(v.created_at), 'MMM d, HH:mm')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal !== null && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-flash-card border border-flash-border rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-white font-bold text-lg">{modal === 'create' ? 'Add Model' : 'Edit Model'}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white"><FaTimes /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label">Model Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Queen Flash" className="input-field" />
              </div>
              <div>
                <label className="label">Vote Price (₦) *</label>
                <input required type="number" min="50" step="50" value={form.vote_price} onChange={(e) => setForm({ ...form, vote_price: e.target.value })} placeholder="100" className="input-field" />
                <p className="text-gray-500 text-xs mt-1">Amount customers pay per vote (min ₦50)</p>
              </div>
              <div>
                <label className="label">Model Photo</label>
                <label className="flex items-center gap-3 cursor-pointer border border-dashed border-flash-border rounded-lg p-3 hover:border-flash-yellow transition-colors">
                  <FaImage className="text-flash-yellow" />
                  <span className="text-gray-400 text-sm">{photo ? photo.name : 'Choose model photo'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhoto(e.target.files[0] || null)} />
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="mact" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-flash-yellow" />
                <label htmlFor="mact" className="text-gray-300 text-sm">Voting active (public can vote)</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 border border-flash-border text-gray-300 rounded-lg hover:border-gray-400 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary justify-center disabled:opacity-60">
                  {saving ? <div className="w-4 h-4 border-2 border-flash-black border-t-transparent rounded-full animate-spin" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
