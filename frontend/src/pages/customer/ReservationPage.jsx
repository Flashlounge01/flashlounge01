import { useState } from 'react';
import { FaCalendar, FaClock, FaUsers, FaCheckCircle, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import CustomerLayout from '../../components/layout/CustomerLayout';
import api from '../../utils/api';

const initialForm = {
  customer_name: '',
  customer_phone: '',
  customer_email: '',
  reservation_date: '',
  reservation_time: '',
  guests_count: '2',
  special_requests: '',
};

export default function ReservationPage() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/reservations', form);
      setSuccess(true);
      toast.success('Reservation submitted! We\'ll confirm via phone.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit reservation');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (success) {
    return (
      <CustomerLayout>
        <div className="pt-24 pb-20 min-h-screen flex items-center justify-center px-4">
          <div className="card text-center max-w-md w-full">
            <FaCheckCircle className="text-flash-yellow text-6xl mx-auto mb-4" />
            <h2 className="text-white font-bold text-2xl mb-3">Reservation Submitted!</h2>
            <p className="text-gray-400 mb-6">
              Thank you, <strong className="text-white">{form.customer_name}</strong>! We've received your reservation request.
              Our team will call you at <strong className="text-white">{form.customer_phone}</strong> to confirm.
            </p>
            <div className="bg-flash-yellow/10 border border-flash-yellow/20 rounded-lg p-4 text-left mb-6 space-y-2 text-sm text-gray-300">
              <div className="flex gap-2"><FaCalendar className="text-flash-yellow mt-0.5" /> {form.reservation_date}</div>
              <div className="flex gap-2"><FaClock className="text-flash-yellow mt-0.5" /> {form.reservation_time}</div>
              <div className="flex gap-2"><FaUsers className="text-flash-yellow mt-0.5" /> {form.guests_count} guest{form.guests_count !== '1' ? 's' : ''}</div>
            </div>
            <button
              onClick={() => { setSuccess(false); setForm(initialForm); }}
              className="btn-primary w-full justify-center"
            >
              Make Another Reservation
            </button>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="pt-24 pb-20 min-h-screen px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="section-subtitle mb-3">Join Us Tonight</p>
            <h1 className="section-title mb-4">Make a Reservation</h1>
            <div className="yellow-divider mx-auto mb-4" />
            <p className="text-gray-400 max-w-xl mx-auto">Book your table at Flash Lounge N Suite and secure your spot for an unforgettable experience.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="card">
                <h2 className="text-white font-bold text-xl mb-6">Reservation Details</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="label">Full Name *</label>
                      <input name="customer_name" required value={form.customer_name} onChange={handleChange} placeholder="John Doe" className="input-field" />
                    </div>
                    <div>
                      <label className="label">Phone Number *</label>
                      <input name="customer_phone" required value={form.customer_phone} onChange={handleChange} placeholder="08012345678" className="input-field" />
                    </div>
                  </div>

                  <div>
                    <label className="label">Email Address</label>
                    <input name="customer_email" type="email" value={form.customer_email} onChange={handleChange} placeholder="you@email.com (optional)" className="input-field" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className="label">Date *</label>
                      <input name="reservation_date" type="date" required min={today} value={form.reservation_date} onChange={handleChange} className="input-field" />
                    </div>
                    <div>
                      <label className="label">Time *</label>
                      <input name="reservation_time" type="time" required value={form.reservation_time} onChange={handleChange} className="input-field" />
                    </div>
                    <div>
                      <label className="label">Guests *</label>
                      <select name="guests_count" value={form.guests_count} onChange={handleChange} className="input-field">
                        {[...Array(20)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'Guest' : 'Guests'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">Special Requests</label>
                    <textarea name="special_requests" value={form.special_requests} onChange={handleChange} placeholder="Any special occasions, dietary needs, or preferences..." rows={3} className="input-field resize-none" />
                  </div>

                  <button type="submit" disabled={submitting} className="btn-primary w-full justify-center text-base py-4 disabled:opacity-60 disabled:cursor-not-allowed">
                    {submitting ? (
                      <><div className="w-5 h-5 border-2 border-flash-black border-t-transparent rounded-full animate-spin" /> Submitting...</>
                    ) : (
                      <><FaCalendar /> Confirm Reservation</>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-white font-bold mb-4">Contact Info</h3>
                <div className="space-y-4 text-sm text-gray-300">
                  <a href="tel:07059693068" className="flex items-center gap-3 hover:text-flash-yellow transition-colors">
                    <div className="w-9 h-9 bg-flash-yellow/10 rounded-lg flex items-center justify-center">
                      <FaPhone className="text-flash-yellow" />
                    </div>
                    07059693068
                  </a>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-flash-yellow/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaMapMarkerAlt className="text-flash-yellow" />
                    </div>
                    No 6 Rumuologu/Alakahia Link Road, Port Harcourt
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-flash-yellow/10 rounded-lg flex items-center justify-center">
                      <FaClock className="text-flash-yellow" />
                    </div>
                    Open 24 Hours Daily
                  </div>
                </div>
              </div>

              <div className="card border-flash-yellow/30">
                <h3 className="text-flash-yellow font-bold mb-3">Good to Know</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex gap-2"><span className="text-flash-yellow">•</span> Reservations are confirmed via phone call</li>
                  <li className="flex gap-2"><span className="text-flash-yellow">•</span> We're open 24 hours — anytime works</li>
                  <li className="flex gap-2"><span className="text-flash-yellow">•</span> For large groups (10+), call us directly</li>
                  <li className="flex gap-2"><span className="text-flash-yellow">•</span> VIP suites available on request</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
