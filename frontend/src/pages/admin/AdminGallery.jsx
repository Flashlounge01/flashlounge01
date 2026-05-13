import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaTimes, FaImage } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api, { getImageUrl } from '../../utils/api';

const CATEGORIES = ['general', 'events', 'bar', 'lounge', 'vip', 'food'];

export default function AdminGallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({ caption: '', category: 'general' });
  const [file, setFile] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const loadPhotos = () => {
    api.get('/gallery')
      .then((res) => setPhotos(res.data))
      .catch(() => setPhotos([]))
      .finally(() => setLoading(false));
  };
  useEffect(loadPhotos, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a photo');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      fd.append('caption', form.caption);
      fd.append('category', form.category);
      await api.post('/gallery', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Photo uploaded!');
      setShowUpload(false);
      setForm({ caption: '', category: 'general' });
      setFile(null);
      loadPhotos();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this photo?')) return;
    try { await api.delete(`/gallery/${id}`); toast.success('Photo deleted'); loadPhotos(); }
    catch { toast.error('Delete failed'); }
  };

  const allCategories = ['All', ...new Set(photos.map((p) => p.category))];
  const filtered = activeFilter === 'All' ? photos : photos.filter((p) => p.category === activeFilter);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-2xl">Gallery Management</h1>
          <p className="text-gray-400 text-sm">{photos.length} photos</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="btn-primary"><FaPlus /> Upload Photo</button>
      </div>

      {/* Category Filter */}
      {allCategories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {allCategories.map((cat) => (
            <button key={cat} onClick={() => setActiveFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${activeFilter === cat ? 'bg-flash-yellow text-flash-black' : 'bg-flash-card border border-flash-border text-gray-300 hover:border-flash-yellow'}`}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 animate-pulse">
          {[...Array(8)].map((_, i) => <div key={i} className="aspect-square bg-flash-card rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16 text-gray-500">No photos yet. Upload your first photo!</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((photo) => (
            <div key={photo.id} className="relative group aspect-square overflow-hidden rounded-xl bg-flash-card">
              <img src={getImageUrl(photo.photo_url)} alt={photo.caption || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-flash-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
                {photo.caption && <p className="text-white text-xs mb-2 line-clamp-2">{photo.caption}</p>}
                <div className="flex items-center justify-between">
                  <span className="bg-flash-yellow/20 text-flash-yellow text-xs px-2 py-0.5 rounded-full capitalize">{photo.category}</span>
                  <button onClick={() => handleDelete(photo.id)} className="w-7 h-7 bg-red-600 text-white rounded-lg flex items-center justify-center hover:bg-red-700 transition-colors">
                    <FaTrash size={11} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-flash-card border border-flash-border rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-white font-bold text-lg">Upload Photo</h2>
              <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-white"><FaTimes /></button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="label">Photo *</label>
                <label className={`flex flex-col items-center justify-center gap-2 cursor-pointer border-2 border-dashed rounded-xl p-6 transition-colors
                  ${file ? 'border-flash-yellow/60 bg-flash-yellow/5' : 'border-flash-border hover:border-flash-yellow'}`}>
                  {file ? (
                    <>
                      <FaImage className="text-flash-yellow text-3xl" />
                      <span className="text-white text-sm font-medium">{file.name}</span>
                      <span className="text-gray-400 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </>
                  ) : (
                    <>
                      <FaImage className="text-gray-500 text-3xl" />
                      <span className="text-gray-400 text-sm">Click to choose image</span>
                      <span className="text-gray-600 text-xs">JPG, PNG, WEBP up to 5MB</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files[0] || null)} />
                </label>
              </div>
              <div>
                <label className="label">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                  {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Caption (optional)</label>
                <input value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} placeholder="Describe this photo..." className="input-field" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowUpload(false)} className="flex-1 py-2.5 border border-flash-border text-gray-300 rounded-lg hover:border-gray-400 transition-colors">Cancel</button>
                <button type="submit" disabled={uploading} className="flex-1 btn-primary justify-center disabled:opacity-60">
                  {uploading ? <div className="w-4 h-4 border-2 border-flash-black border-t-transparent rounded-full animate-spin" /> : <><FaPlus /> Upload</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
