import DashboardLayout from '../../layouts/DashboardLayout';
import { MdCheckCircle, MdError, MdPerson } from 'react-icons/md';
import { useState } from 'react';
import { createPasien } from '../../api/pasien';

const Pasien = () => {
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('success');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [formData, setFormData] = useState({ nik: '', nama: '', alamat: '', tgl_lahir: '', jenis_kelamin: '' });

  const showNotificationMessage = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nik || !formData.nama || !formData.alamat || !formData.tgl_lahir || !formData.jenis_kelamin) {
      showNotificationMessage('Semua field harus diisi', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await createPasien(formData);
      showNotificationMessage(response.data?.message || 'Pasien berhasil ditambahkan', 'success');
      setFormData({ nik: '', nama: '', alamat: '', tgl_lahir: '', jenis_kelamin: '' });
    } catch (error) {
      console.error('Error saving pasien:', error);
      showNotificationMessage(error.response?.data?.message || 'Gagal menyimpan pasien', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-indigo-500 rounded-full flex items-center justify-center">
            <MdPerson className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 mb-1">Pasien</h1>
            <p className="text-sm text-slate-600">Tambah data pasien untuk kebutuhan integrasi Hyperledger Fabric</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">NIK</label>
                <input
                  type="text"
                  value={formData.nik}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
                  placeholder="Masukkan NIK"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Pasien</label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
                  placeholder="Masukkan nama pasien"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Alamat</label>
                <input
                  type="text"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
                  placeholder="Masukkan alamat"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Lahir</label>
                <input
                  type="date"
                  value={formData.tgl_lahir}
                  onChange={(e) => setFormData({ ...formData, tgl_lahir: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Jenis Kelamin</label>
                <select
                  value={formData.jenis_kelamin}
                  onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
                >
                  <option value="">Pilih jenis kelamin</option>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2 justify-center">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    Menyimpan...
                  </span>
                ) : (
                  'Simpan'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* NOTIFICATION MODAL */}
      {showNotification && (
        <div className="fixed top-6 right-6 z-50 pointer-events-none">
          <div className={`flex items-center gap-4 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border-2 animate-zoom-in max-w-sm overflow-hidden relative ${notificationType === 'success'
              ? 'bg-linear-to-br from-emerald-400/20 via-green-400/10 to-teal-400/20 border-emerald-300/60 before:absolute before:inset-0 before:bg-linear-to-r before:from-emerald-500/0 before:via-emerald-400/5 before:to-green-500/0'
              : 'bg-linear-to-br from-red-400/20 via-rose-400/10 to-orange-400/20 border-red-300/60 before:absolute before:inset-0 before:bg-linear-to-r before:from-red-500/0 before:via-red-400/5 before:to-orange-500/0'
            }`}>
            {/* Icon Circle Background */}
            <div className={`relative shrink-0 ${notificationType === 'success'
                ? 'bg-linear-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/50'
                : 'bg-linear-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/50'
              } rounded-full p-2`}>
              {notificationType === 'success' ? (
                <MdCheckCircle className="text-white" size={24} />
              ) : (
                <MdError className="text-white" size={24} />
              )}
            </div>

            {/* Text Content */}
            <div className="relative z-10 flex-1">
              <p className={`font-bold text-sm leading-tight ${notificationType === 'success' ? 'text-emerald-900' : 'text-red-900'
                }`}>
                {notificationType === 'success' ? 'Sukses!' : 'Error!'}
              </p>
              <p className={`text-xs mt-0.5 font-medium ${notificationType === 'success' ? 'text-emerald-800' : 'text-red-800'
                }`}>
                {notificationMessage}
              </p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Pasien;
