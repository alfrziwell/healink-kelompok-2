import DashboardLayout from '../../layouts/DashboardLayout';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdClose, MdCheckCircle, MdError } from 'react-icons/md';
import { useState, useMemo, useEffect } from 'react';
import { getAllAdmins, createAdmin, updateAdmin, deleteAdmin } from '../../api/user';
import { getAllRumahSakit } from '../../api/rumahSakit';

const Users = () => {
  // State untuk data
  const [users, setUsers] = useState([]);
  const [rumahSakitList, setRumahSakitList] = useState([]);
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
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ username: '', pw: '', id_rs: '' });
  const [isEditing, setIsEditing] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchUsers();
    fetchRumahSakit();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllAdmins();
      setUsers(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotificationMessage('Gagal memuat data user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRumahSakit = async () => {
    try {
      const response = await getAllRumahSakit();
      setRumahSakitList(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching rumah sakit:', error);
    }
  };

  // Filter data berdasarkan search
  const filteredUsers = useMemo(() => {
    const filtered = users.filter(user =>
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    // Sort by username alphabetically
    return filtered.sort((a, b) => a.username.localeCompare(b.username));
  }, [users, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Reset page ketika search berubah
  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Notification handler
  const showNotificationMessage = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Form handlers
  const handleAddUser = () => {
    setIsEditing(false);
    setFormData({ username: '', pw: '', id_rs: '' });
    setShowFormModal(true);
  };

  const handleEditUser = (user) => {
    setIsEditing(true);
    setFormData({ username: user.username, id_rs: user.id_rs || '' });
    setSelectedUser(user);
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.id_rs) {
      showNotificationMessage('Username dan Rumah Sakit harus diisi', 'error');
      return;
    }

    if (!isEditing && !formData.pw) {
      showNotificationMessage('Password harus diisi', 'error');
      return;
    }

    try {
      setLoading(true);
      if (isEditing) {
        await updateAdmin(selectedUser.id_user, { 
          username: formData.username, 
          id_rs: formData.id_rs 
        });
        showNotificationMessage('User berhasil diupdate', 'success');
      } else {
        await createAdmin({ 
          username: formData.username, 
          pw: formData.pw,
          id_rs: formData.id_rs 
        });
        showNotificationMessage('User berhasil ditambahkan', 'success');
      }
      setShowFormModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      showNotificationMessage(error.response?.data?.message || 'Gagal menyimpan user', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete handlers
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await deleteAdmin(selectedUser.id_user);
      showNotificationMessage('User berhasil dihapus', 'success');
      setShowDeleteModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotificationMessage(error.response?.data?.message || 'Gagal menghapus user', 'error');
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
              User Management
            </h1>
            <p className="text-base text-slate-600">
              Kelola pengguna admin sistem HEALINK
            </p>
          </div>
          <button
            onClick={handleAddUser}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold text-sm shadow-sm shadow-primary/20"
          >
            <MdAdd size={20} />
            Tambah User
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="relative">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Cari berdasarkan username atau role..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50 text-slate-900 placeholder-slate-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          {paginatedUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 text-lg">Tidak ada data user ditemukan</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">No.</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Username</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Rumah Sakit</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user, index) => {
                      const rsName = rumahSakitList.find(rs => rs.id_rs === user.id_rs)?.nama_rs || '-';
                      return (
                        <tr key={user.id_user} className="border-b border-slate-100 hover:bg-slate-50 transition">
                          <td className="py-3 px-4 text-slate-600">{startIndex + index + 1}</td>
                          <td className="py-3 px-4 text-slate-900 font-medium">{user.username}</td>
                          <td className="py-3 px-4">
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{rsName}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              >
                                <MdEdit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(user)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              >
                                <MdDelete size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredUsers.length)} dari {filteredUsers.length} data
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
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-slate-950">
                {isEditing ? 'Edit User' : 'Tambah User'}
              </h2>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
                  placeholder="Masukkan username"
                />
              </div>

              {!isEditing && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.pw}
                    onChange={(e) => setFormData({ ...formData, pw: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
                    placeholder="Masukkan password"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Rumah Sakit</label>
                <select
                  value={formData.id_rs}
                  onChange={(e) => setFormData({ ...formData, id_rs: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
                >
                  <option value="">Pilih Rumah Sakit</option>
                  {rumahSakitList.map((rs) => (
                    <option key={rs.id_rs} value={rs.id_rs}>
                      {rs.nama_rs}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
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
            {/* Header dengan background gradient merah */}
            <div className="bg-gradient-to-r from-red-50 to-red-50/50 p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <MdDelete className="text-red-600" size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Hapus User</h2>
                  <p className="text-sm text-slate-600">Tindakan ini tidak dapat dibatalkan</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-slate-700 text-center mb-6">
                Apakah Anda yakin ingin menghapus user <span className="font-semibold text-slate-950">{selectedUser?.username}</span>?
              </p>

              {/* Buttons */}
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

export default Users;
