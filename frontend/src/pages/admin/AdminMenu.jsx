import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaImage } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api, { getImageUrl } from '../../utils/api';

const CATEGORIES = ['Drinks', 'Cocktails', 'Food', 'Snacks', 'Hookah', 'Specials', 'Non-Alcoholic'];

const emptyForm = { name: '', description: '', price: '', category: 'Drinks', is_available: true };

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | item
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadMenu = () => {
    api.get('/menu/admin/all')
      .then((res) => setItems(res.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };
  useEffect(loadMenu, []);

  const openCreate = () => { setForm(emptyForm); setPhoto(null); setModal('create'); };
  const openEdit = (item) => {
    setForm({ name: item.name, description: item.description || '', price: item.price, category: item.category, is_available: item.is_available });
    setPhoto(null);
    setModal(item);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photo) fd.append('photo', photo);

      if (modal === 'create') {
        await api.post('/menu', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Menu item added!');
      } else {
        await api.put(`/menu/${modal.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Item updated!');
      }
      setModal(null);
      loadMenu();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;
    try {
      await api.delete(`/menu/${id}`);
      toast.success('Item deleted');
      loadMenu();
    } catch {
      toast.error('Delete failed');
    }
  };

  const grouped = items.reduce((acc, i) => { (acc[i.category] = acc[i.category] || []).push(i); return acc; }, {});

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-2xl">Menu Management</h1>
          <p className="text-gray-400 text-sm">{items.length} items total</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><FaPlus /> Add Item</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-32" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="card text-center py-16 text-gray-500">No menu items yet. Add your first item!</div>
      ) : (
        Object.entries(grouped).map(([cat, catItems]) => (
          <div key={cat}>
            <h2 className="text-flash-yellow font-semibold text-sm uppercase tracking-wider mb-3">{cat}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {catItems.map((item) => (
                <div key={item.id} className="card p-0 overflow-hidden hover:border-flash-border/60 transition-colors">
                  {item.photo_url ? (
                    <div className="h-36 overflow-hidden">
                      <img src={getImageUrl(item.photo_url)} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-36 bg-flash-border flex items-center justify-center text-4xl">🍹</div>
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-white font-semibold">{item.name}</h3>
                      <span className="text-flash-yellow font-bold">₦{Number(item.price).toLocaleString()}</span>
                    </div>
                    {item.description && <p className="text-gray-400 text-xs mb-2 line-clamp-2">{item.description}</p>}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_available ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </span>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(item)} className="p-2 text-gray-400 hover:text-flash-yellow transition-colors"><FaEdit size={13} /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors"><FaTrash size={13} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Modal */}
      {modal !== null && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-flash-card border border-flash-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-white font-bold text-lg">{modal === 'create' ? 'Add Menu Item' : 'Edit Item'}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white"><FaTimes /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label">Item Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Hennessy XO" className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Price (₦) *</label>
                  <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="5000" className="input-field" />
                </div>
                <div>
                  <label className="label">Category *</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." className="input-field resize-none" />
              </div>
              <div>
                <label className="label">Photo</label>
                <label className="flex items-center gap-3 cursor-pointer border border-dashed border-flash-border rounded-lg p-3 hover:border-flash-yellow transition-colors">
                  <FaImage className="text-flash-yellow" />
                  <span className="text-gray-400 text-sm">{photo ? photo.name : modal !== 'create' && modal.photo_url ? 'Current photo (upload to replace)' : 'Choose image (JPG/PNG, max 5MB)'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhoto(e.target.files[0] || null)} />
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="avail" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} className="accent-flash-yellow" />
                <label htmlFor="avail" className="text-gray-300 text-sm">Available on menu</label>
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
