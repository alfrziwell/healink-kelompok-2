import DashboardLayout from '../../layouts/DashboardLayout';
import { MdCheckCircle, MdError } from 'react-icons/md';
import { useState } from 'react';
import { createDiagnosa } from '../../api/diagnosa';

const Diagnosa = () => {
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('success');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [formData, setFormData] = useState({ tanggal: '', id_rs: '', id_dokter: '', nik_pasien: '', nama_diagnosa: '', kriteria_ciri: '', obat: '' });

  const showNotificationMessage = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tanggal || !formData.id_rs || !formData.id_dokter || !formData.nik_pasien || !formData.nama_diagnosa || !formData.kriteria_ciri || !formData.obat) {
      showNotificationMessage('Semua field harus diisi', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await createDiagnosa(formData);
      showNotificationMessage(response.data?.message || 'Diagnosa berhasil ditambahkan', 'success');
      setFormData({ tanggal: '', id_rs: '', id_dokter: '', nik_pasien: '', nama_diagnosa: '', kriteria_ciri: '', obat: '' });
    } catch (error) {
      console.error('Error saving diagnosa:', error);
      showNotificationMessage(error.response?.data?.message || 'Gagal menyimpan diagnosa', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 mb-2">
            Diagnosa
          </h1>
          <p className="text-base text-slate-600">Tambah data diagnosa untuk kebutuhan integrasi Hyperledger Fabric</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal</label>
              <input
                type="date"
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">ID Rumah Sakit</label>
              <input
                type="number"
                value={formData.id_rs}
                onChange={(e) => setFormData({ ...formData, id_rs: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
                placeholder="Masukkan ID rumah sakit"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">ID Dokter</label>
              <input
                type="number"
                value={formData.id_dokter}
                onChange={(e) => setFormData({ ...formData, id_dokter: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
                placeholder="Masukkan ID dokter"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">NIK Pasien</label>
              <input
                type="text"
                value={formData.nik_pasien}
                onChange={(e) => setFormData({ ...formData, nik_pasien: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
                placeholder="Masukkan NIK pasien"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Diagnosa</label>
              <input
                type="text"
                value={formData.nama_diagnosa}
                onChange={(e) => setFormData({ ...formData, nama_diagnosa: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
                placeholder="Masukkan nama diagnosa"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Kriteria Ciri</label>
              <textarea
                value={formData.kriteria_ciri}
                onChange={(e) => setFormData({ ...formData, kriteria_ciri: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50 resize-none"
                placeholder="Masukkan kriteria ciri"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Obat</label>
              <textarea
                value={formData.obat}
                onChange={(e) => setFormData({ ...formData, obat: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50 resize-none"
                placeholder="Masukkan obat"
                rows="3"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* NOTIFICATION MODAL */}
      {showNotification && (
        <div className="fixed top-6 right-6 z-50 pointer-events-none">
          <div className={`flex items-center gap-4 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border-2 animate-zoom-in max-w-sm overflow-hidden relative ${
            notificationType === 'success'
              ? 'bg-linear-to-br from-emerald-400/20 via-green-400/10 to-teal-400/20 border-emerald-300/60 before:absolute before:inset-0 before:bg-linear-to-r before:from-emerald-500/0 before:via-emerald-400/5 before:to-green-500/0'
              : 'bg-linear-to-br from-red-400/20 via-rose-400/10 to-orange-400/20 border-red-300/60 before:absolute before:inset-0 before:bg-linear-to-r before:from-red-500/0 before:via-red-400/5 before:to-orange-500/0'
          }`}>
            {/* Icon Circle Background */}
            <div className={`relative shrink-0 ${
              notificationType === 'success'
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
              <p className={`font-bold text-sm leading-tight ${
                notificationType === 'success' ? 'text-emerald-900' : 'text-red-900'
              }`}>
                {notificationType === 'success' ? 'Sukses!' : 'Error!'}
              </p>
              <p className={`text-xs mt-0.5 font-medium ${
                notificationType === 'success' ? 'text-emerald-800' : 'text-red-800'
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

export default Diagnosa;
