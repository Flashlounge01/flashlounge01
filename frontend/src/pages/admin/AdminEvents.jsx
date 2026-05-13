import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaImage, FaCalendar } from 'react-icons/fa';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api, { getImageUrl } from '../../utils/api';

const emptyForm = { title: '', description: '', event_date: '', event_time: '', is_active: true };

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadEvents = () => {
    api.get('/events/admin/all')
      .then((res) => setEvents(res.data))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  };
  useEffect(loadEvents, []);

  const openCreate = () => { setForm(emptyForm); setPhoto(null); setModal('create'); };
  const openEdit = (ev) => {
    setForm({ title: ev.title, description: ev.description || '', event_date: ev.event_date.slice(0, 10), event_time: ev.event_time.slice(0, 5), is_active: ev.is_active });
    setPhoto(null);
    setModal(ev);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photo) fd.append('photo', photo);
      if (modal === 'create') {
        await api.post('/events', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Event created!');
      } else {
        await api.put(`/events/${modal.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Event updated!');
      }
      setModal(null);
      loadEvents();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try { await api.delete(`/events/${id}`); toast.success('Event deleted'); loadEvents(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-2xl">Events Management</h1>
          <p className="text-gray-400 text-sm">{events.length} events total</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><FaPlus /> Add Event</button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="card h-24 animate-pulse" />)}</div>
      ) : events.length === 0 ? (
        <div className="card text-center py-16 text-gray-500">No events yet.</div>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <div key={ev.id} className="card p-0 overflow-hidden hover:border-flash-border/60 flex flex-col sm:flex-row">
              {ev.photo_url ? (
                <div className="sm:w-32 h-28 sm:h-auto flex-shrink-0 overflow-hidden">
                  <img src={getImageUrl(ev.photo_url)} alt={ev.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              ) : (
                <div className="sm:w-32 h-28 sm:h-auto flex-shrink-0 bg-flash-border flex items-center justify-center">
                  <FaCalendar className="text-flash-yellow opacity-30 text-3xl" />
                </div>
              )}
              <div className="p-4 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold">{ev.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${ev.is_active ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                      {ev.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><FaCalendar size={10} className="text-flash-yellow" /> {format(new Date(ev.event_date), 'MMM d, yyyy')}</span>
                    <span>{ev.event_time.slice(0, 5)}</span>
                  </div>
                  {ev.description && <p className="text-gray-500 text-xs mt-1 line-clamp-1">{ev.description}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(ev)} className="p-2.5 border border-flash-border text-gray-400 hover:text-flash-yellow hover:border-flash-yellow rounded-lg transition-colors"><FaEdit size={13} /></button>
                  <button onClick={() => handleDelete(ev.id)} className="p-2.5 border border-flash-border text-gray-400 hover:text-red-400 hover:border-red-400 rounded-lg transition-colors"><FaTrash size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal !== null && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-flash-card border border-flash-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-white font-bold text-lg">{modal === 'create' ? 'Create Event' : 'Edit Event'}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white"><FaTimes /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label">Event Title *</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Friday Vibes Night" className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Date *</label>
                  <input required type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="label">Time *</label>
                  <input required type="time" value={form.event_time} onChange={(e) => setForm({ ...form, event_time: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the event..." className="input-field resize-none" />
              </div>
              <div>
                <label className="label">Event Photo</label>
                <label className="flex items-center gap-3 cursor-pointer border border-dashed border-flash-border rounded-lg p-3 hover:border-flash-yellow transition-colors">
                  <FaImage className="text-flash-yellow" />
                  <span className="text-gray-400 text-sm">{photo ? photo.name : 'Choose image'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhoto(e.target.files[0] || null)} />
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="act" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-flash-yellow" />
                <label htmlFor="act" className="text-gray-300 text-sm">Publicly visible</label>
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
