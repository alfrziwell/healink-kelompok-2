import DashboardLayout from '../../layouts/DashboardLayout';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdClose, MdCheckCircle, MdError } from 'react-icons/md';
import { useState, useMemo, useEffect } from 'react';
import { createRumahSakit, getAllRumahSakit, updateRumahSakit, deleteRumahSakit } from '../../api/rumahSakit';

const RumahSakit = () => {
  // State untuk data
  const [rumahSakit, setRumahSakit] = useState([]);
  const [loading, setLoading] = useState(false);

  // State untuk UI
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // State untuk modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('success');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [selectedRumahSakit, setSelectedRumahSakit] = useState(null);
  const [formData, setFormData] = useState({ nama_rs: '', alamat: '', telepon: '' });
  const [isEditing, setIsEditing] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchRumahSakit();
  }, []);

  const fetchRumahSakit = async () => {
    try {
      setLoading(true);
      const response = await getAllRumahSakit();
      setRumahSakit(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching rumah sakit:', error);
      showNotificationMessage('Gagal memuat data rumah sakit', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter data
  const filteredRumahSakit = useMemo(() => {
    return rumahSakit.filter(rs =>
      rs.nama_rs?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rs.alamat?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rs.telepon?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rumahSakit, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredRumahSakit.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRumahSakit = filteredRumahSakit.slice(startIndex, startIndex + itemsPerPage);

  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const showNotificationMessage = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleAddRumahSakit = () => {
    setIsEditing(false);
    setFormData({ nama_rs: '', alamat: '', telepon: '' });
    setShowFormModal(true);
  };

  const handleEditRumahSakit = (rs) => {
    setIsEditing(true);
    setFormData(rs);
    setSelectedRumahSakit(rs);
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_rs || !formData.alamat || !formData.telepon) {
      showNotificationMessage('Semua field harus diisi', 'error');
      return;
    }

    try {
      setLoading(true);
      if (isEditing) {
        await updateRumahSakit(selectedRumahSakit.id_rs, formData);
        showNotificationMessage('Rumah Sakit berhasil diupdate', 'success');
      } else {
        await createRumahSakit(formData);
        showNotificationMessage('Rumah Sakit berhasil ditambahkan', 'success');
      }
      setShowFormModal(false);
      fetchRumahSakit();
    } catch (error) {
      console.error('Error saving rumah sakit:', error);
      showNotificationMessage(error.response?.data?.message || 'Gagal menyimpan rumah sakit', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (rs) => {
    setSelectedRumahSakit(rs);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await deleteRumahSakit(selectedRumahSakit.id_rs);
      showNotificationMessage('Rumah Sakit berhasil dihapus', 'success');
      setShowDeleteModal(false);
      fetchRumahSakit();
    } catch (error) {
      console.error('Error deleting rumah sakit:', error);
      showNotificationMessage(error.response?.data?.message || 'Gagal menghapus rumah sakit', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 mb-2">
              Rumah Sakit
            </h1>
            <p className="text-base text-slate-600">Kelola data rumah sakit di sistem HEALINK</p>
          </div>
          <button
            onClick={handleAddRumahSakit}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold text-sm shadow-sm shadow-primary/20"
          >
            <MdAdd size={20} />
            Tambah Rumah Sakit
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="relative">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Cari berdasarkan nama, alamat, atau telepon..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50 text-slate-900 placeholder-slate-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          {paginatedRumahSakit.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 text-lg">Tidak ada data rumah sakit ditemukan</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Nama Rumah Sakit</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Alamat</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">No. Telepon</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRumahSakit.map((rs) => (
                      <tr key={rs.id_rs} className="border-b border-slate-100 hover:bg-slate-50 transition">
                        <td className="py-3 px-4 text-slate-600">{rs.id_rs}</td>
                        <td className="py-3 px-4 text-slate-900 font-medium">{rs.nama_rs}</td>
                        <td className="py-3 px-4 text-slate-600">{rs.alamat}</td>
                        <td className="py-3 px-4 text-slate-600">{rs.telepon}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditRumahSakit(rs)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                              <MdEdit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(rs)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <MdDelete size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredRumahSakit.length)} dari {filteredRumahSakit.length} data
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
                  >
                    Sebelumnya
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
                        currentPage === page
                          ? 'bg-primary text-white'
                          : 'border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL FORM */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-slate-950">
                {isEditing ? 'Edit Rumah Sakit' : 'Tambah Rumah Sakit'}
              </h2>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <MdClose size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Rumah Sakit</label>
                <input
                  type="text"
                  value={formData.nama_rs}
                  onChange={(e) => setFormData({ ...formData, nama_rs: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
                  placeholder="Masukkan nama rumah sakit"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Alamat</label>
                <textarea
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50 resize-none"
                  placeholder="Masukkan alamat lengkap"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">No. Telepon</label>
                <input
                  type="tel"
                  value={formData.telepon}
                  onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
                  placeholder="Masukkan no. telepon"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="flex-1 px-4 py-2.5 border-2 border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-semibold"
                >
                  {isEditing ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full animate-slide-up">
            <div className="bg-gradient-to-r from-red-50 to-red-50/50 p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <MdDelete className="text-red-600" size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Hapus Rumah Sakit</h2>
                  <p className="text-sm text-slate-600">Tindakan ini tidak dapat dibatalkan</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-slate-700 text-center mb-6">
                Apakah Anda yakin ingin menghapus rumah sakit <span className="font-semibold text-slate-950">{selectedRumahSakit?.nama}</span>?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2.5 border-2 border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-semibold"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION MODAL */}
      {showNotification && (
        <div className="fixed top-6 right-6 z-50 pointer-events-none">
          <div className={`flex items-center gap-4 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border-2 animate-zoom-in max-w-sm overflow-hidden relative ${
            notificationType === 'success'
              ? 'bg-gradient-to-br from-emerald-400/20 via-green-400/10 to-teal-400/20 border-emerald-300/60 before:absolute before:inset-0 before:bg-gradient-to-r before:from-emerald-500/0 before:via-emerald-400/5 before:to-green-500/0'
              : 'bg-gradient-to-br from-red-400/20 via-rose-400/10 to-orange-400/20 border-red-300/60 before:absolute before:inset-0 before:bg-gradient-to-r before:from-red-500/0 before:via-red-400/5 before:to-orange-500/0'
          }`}>
            {/* Icon Circle Background */}
            <div className={`relative flex-shrink-0 ${
              notificationType === 'success'
                ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/50'
                : 'bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/50'
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

export default RumahSakit;
