import DashboardLayout from '../../layouts/DashboardLayout';
import { MdCheckCircle, MdError, MdPerson, MdEvent } from 'react-icons/md';
import { useState, useRef, useEffect, useMemo } from 'react';
import { createPasien } from '../../api/pasien';

const Pasien = () => {
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('success');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [formData, setFormData] = useState({ nik: '', nama: '', alamat: '', tgl_lahir: '', jenis_kelamin: '' });
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => (formData.tgl_lahir ? new Date(formData.tgl_lahir) : new Date()));
  const calendarRef = useRef(null);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const genderRef = useRef(null);

  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(() => {
    const startYear = currentYear - 100;
    const endYear = currentYear + 1;
    const years = [];
    for (let year = endYear; year >= startYear; year -= 1) {
      years.push(year);
    }
    return years;
  }, [currentYear]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
      if (genderRef.current && !genderRef.current.contains(e.target)) {
        setShowGenderDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getMonthMatrix = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const matrix = [];
    let week = new Array(7).fill(null);
    let dayCounter = 1;

    for (let i = firstDay; i < 7 && dayCounter <= daysInMonth; i += 1) {
      week[i] = dayCounter;
      dayCounter += 1;
    }
    matrix.push(week);

    while (dayCounter <= daysInMonth) {
      week = new Array(7).fill(null);
      for (let i = 0; i < 7 && dayCounter <= daysInMonth; i += 1) {
        week[i] = dayCounter;
        dayCounter += 1;
      }
      matrix.push(week);
    }

    return matrix;
  };

  const toLocalISODate = (year, monthIndex, day) => {
    const yyyy = String(year);
    const mm = String(monthIndex + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateStr;

    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

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
                <div className="relative" ref={calendarRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setCalendarMonth(formData.tgl_lahir ? new Date(`${formData.tgl_lahir}T00:00:00`) : new Date());
                      setShowCalendar((value) => !value);
                    }}
                    className="w-full text-left px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white flex items-center justify-between"
                  >
                    <span className={`${formData.tgl_lahir ? 'text-slate-900' : 'text-slate-400'}`}>
                      {formData.tgl_lahir ? formatDisplayDate(formData.tgl_lahir) : 'Pilih tanggal lahir'}
                    </span>
                    <MdEvent className="text-slate-500" size={18} />
                  </button>

                  {showCalendar && (
                    <div className="absolute left-0 mt-2 w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl z-50">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <button
                          type="button"
                          onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50"
                        >
                          ‹
                        </button>

                        <div className="flex items-center gap-2 flex-1 justify-center">
                          <select
                            value={calendarMonth.getMonth()}
                            onChange={(e) => setCalendarMonth((month) => new Date(month.getFullYear(), Number(e.target.value), 1))}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-primary"
                          >
                            {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((monthName, index) => (
                              <option key={monthName} value={index}>
                                {monthName}
                              </option>
                            ))}
                          </select>

                          <select
                            value={calendarMonth.getFullYear()}
                            onChange={(e) => setCalendarMonth((month) => new Date(Number(e.target.value), month.getMonth(), 1))}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-primary"
                          >
                            {yearOptions.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50"
                        >
                          ›
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 mb-2">
                        {weekdays.map((day) => (
                          <div key={day} className="py-1">
                            {day}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-sm">
                        {getMonthMatrix(calendarMonth).map((week, weekIndex) => (
                          <div key={weekIndex} className="contents">
                            {week.map((day, dayIndex) => {
                              const selectedDate = day ? toLocalISODate(calendarMonth.getFullYear(), calendarMonth.getMonth(), day) : '';
                              const isSelected = selectedDate && selectedDate === formData.tgl_lahir;

                              return (
                                <button
                                  key={`${weekIndex}-${dayIndex}`}
                                  type="button"
                                  onClick={() => {
                                    if (!day) return;
                                    setFormData({ ...formData, tgl_lahir: toLocalISODate(calendarMonth.getFullYear(), calendarMonth.getMonth(), day) });
                                    setShowCalendar(false);
                                  }}
                                  className={`h-9 rounded-lg transition ${day ? 'hover:bg-primary/10' : 'cursor-default'} ${isSelected ? 'bg-primary text-white hover:bg-primary' : 'text-slate-700'}`}
                                >
                                  {day || ''}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Jenis Kelamin</label>
                <div className="relative" ref={genderRef}>
                  <button
                    type="button"
                    onClick={() => setShowGenderDropdown((value) => !value)}
                    className="w-full text-left px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white flex items-center justify-between"
                  >
                    <span className={`${formData.jenis_kelamin ? 'text-slate-900' : 'text-slate-400'}`}>
                      {formData.jenis_kelamin === 'L'
                        ? 'Laki-laki'
                        : formData.jenis_kelamin === 'P'
                          ? 'Perempuan'
                          : 'Pilih jenis kelamin'}
                    </span>
                    <svg className="h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 9l4 4 4-4" />
                    </svg>
                  </button>

                  {showGenderDropdown && (
                    <div className="absolute left-0 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-2xl z-50 overflow-hidden">
                      {[
                        { value: 'L', label: 'Laki-laki' },
                        { value: 'P', label: 'Perempuan' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, jenis_kelamin: option.value });
                            setShowGenderDropdown(false);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm transition flex items-center justify-between ${formData.jenis_kelamin === option.value ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-slate-50 text-slate-700'}`}
                        >
                          <span>{option.label}</span>
                          {formData.jenis_kelamin === option.value && (
                            <span className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
