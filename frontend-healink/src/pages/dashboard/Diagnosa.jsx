import DashboardLayout from '../../layouts/DashboardLayout';
import { MdCheckCircle, MdError, MdHealing } from 'react-icons/md';
import { useState, useRef, useEffect, useMemo } from 'react';
import { getAllDokter } from '../../api/dokter';
import { getAllRumahSakit } from '../../api/rumahSakit';
import { createDiagnosa } from '../../api/diagnosa';

const Diagnosa = () => {
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('success');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [formData, setFormData] = useState({ tanggal: '', id_rs: '', id_dokter: '', nik_pasien: '', nama_diagnosa: '', kriteria_ciri: '', obat: '' });
  const [dokters, setDokters] = useState([]);
  const [dokterQuery, setDokterQuery] = useState('');
  const [showDokterDropdown, setShowDokterDropdown] = useState(false);
  const dokterRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAllDokter();
        const data = res.data?.data || res.data || [];
        setDokters(data);
      } catch (err) {
        console.error('Failed to load dokters', err);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dokterRef.current && !dokterRef.current.contains(e.target)) {
        setShowDokterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredDokters = useMemo(() => {
    const q = dokterQuery.trim().toLowerCase();
    if (!q) return dokters;
    return dokters.filter((d) => (d.nama || d.name || '').toLowerCase().includes(q) || (d.id_dokter || String(d.id) || '').includes(q));
  }, [dokters, dokterQuery]);

  // Rumah Sakit (for super_admin dropdown, admin auto-filled)
  const [rumahSakitList, setRumahSakitList] = useState([]);
  const [rumahQuery, setRumahQuery] = useState('');
  const [showRumahDropdown, setShowRumahDropdown] = useState(false);
  const rumahRef = useRef(null);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    // Load user role and auto-fill id_rs for admin
    const userData = localStorage.getItem('healink_user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        const role = (parsed.role || '').toLowerCase();
        setUserRole(role);
        if (role === 'admin') {
          setFormData((f) => ({ ...f, id_rs: parsed.id_rs || '' }));
        }
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }

    // fetch rumah sakit list
    const fetchRumah = async () => {
      try {
        const res = await getAllRumahSakit();
        const data = res.data?.data || res.data || [];
        setRumahSakitList(data);
      } catch (err) {
        console.error('Failed to load rumah sakit', err);
      }
    };
    fetchRumah();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (rumahRef.current && !rumahRef.current.contains(e.target)) {
        setShowRumahDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredRumah = useMemo(() => {
    const q = rumahQuery.trim().toLowerCase();
    if (!q) return rumahSakitList;
    return rumahSakitList.filter(rs => (rs.nama_rs || '').toLowerCase().includes(q));
  }, [rumahSakitList, rumahQuery]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => (formData.tanggal ? new Date(formData.tanggal) : new Date()));
  const calendarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  function getMonthMatrix(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const matrix = [];
    let week = new Array(7).fill(null);
    let dayCounter = 1;

    for (let i = 0; i < firstDay; i++) week[i] = null;
    for (let i = firstDay; i < 7; i++) {
      week[i] = dayCounter++;
    }
    matrix.push(week);

    while (dayCounter <= daysInMonth) {
      week = new Array(7).fill(null);
      for (let i = 0; i < 7 && dayCounter <= daysInMonth; i++) {
        week[i] = dayCounter++;
      }
      matrix.push(week);
    }

    return matrix;
  }

  function formatDisplay(dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  }

  function toISO(year, monthIndex, day) {
    const d = new Date(year, monthIndex, day);
    return d.toISOString().slice(0, 10);
  }

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
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-linear-to-br from-primary to-indigo-500 rounded-full flex items-center justify-center">
            <MdHealing className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 mb-1">Diagnosa</h1>
            <p className="text-sm text-slate-600">Tambah data diagnosa untuk kebutuhan integrasi Hyperledger Fabric</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal</label>
                <div className="relative" ref={calendarRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setCalendarMonth(formData.tanggal ? new Date(formData.tanggal) : new Date());
                      setShowCalendar((s) => !s);
                      setShowDokterDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white flex items-center justify-between"
                  >
                    <span className={`${formData.tanggal ? 'text-slate-900' : 'text-slate-400'}`}>
                      {formData.tanggal ? formatDisplay(formData.tanggal) : 'Pilih tanggal'}
                    </span>
                    <svg className="h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 9l4 4 4-4" />
                    </svg>
                  </button>

                  {showCalendar && (
                    <div className="absolute left-0 mt-2 bg-white border rounded-lg shadow-lg w-64 p-3 z-50">
                      <div className="flex items-center justify-between mb-2">
                        <button type="button" onClick={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} className="p-1 hover:bg-slate-100 rounded">
                          ‹
                        </button>
                        <div className="text-sm font-semibold">{calendarMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</div>
                        <button type="button" onClick={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))} className="p-1 hover:bg-slate-100 rounded">
                          ›
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-xs text-slate-500 text-center mb-2">
                        {weekdays.map((d) => (
                          <div key={d} className="py-1">{d}</div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-sm">
                        {getMonthMatrix(calendarMonth).map((week, i) => (
                          <div key={i} className="contents">
                            {week.map((day, idx) => {
                              const isToday = day && formData.tanggal === toISO(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    if (!day) return;
                                    const iso = toISO(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                                    setFormData({ ...formData, tanggal: iso });
                                    setShowCalendar(false);
                                  }}
                                  className={`h-8 flex items-center justify-center rounded ${day ? 'hover:bg-primary/10' : ''} ${isToday ? 'bg-primary text-white' : 'text-slate-700'}`}
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

              <div ref={rumahRef}>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Rumah Sakit</label>
                {userRole === 'admin' ? (
                  <input
                    type="text"
                    value={(() => {
                      const rs = rumahSakitList.find(r => String(r.id_rs) === String(formData.id_rs));
                      return rs ? rs.nama_rs : formData.id_rs || '';
                    })()}
                    disabled
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg bg-slate-50 text-slate-700"
                  />
                ) : (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRumahDropdown((s) => !s);
                        setShowCalendar(false);
                        setShowDokterDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white flex items-center justify-between"
                    >
                      <span className={`${formData.id_rs ? 'text-slate-900' : 'text-slate-400'}`}>
                        {(() => {
                          const sel = rumahSakitList.find(r => String(r.id_rs) === String(formData.id_rs));
                          return sel ? sel.nama_rs : 'Pilih rumah sakit';
                        })()}
                      </span>
                      <svg className="h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 9l4 4 4-4" />
                      </svg>
                    </button>

                    {showRumahDropdown && (
                      <div className="absolute left-0 mt-2 bg-white border rounded-lg shadow-lg w-full z-50">
                        <div className="p-2">
                          <input
                            type="text"
                            value={rumahQuery}
                            onChange={(e) => setRumahQuery(e.target.value)}
                            placeholder="Cari rumah sakit..."
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div className="max-h-48 overflow-auto">
                          {filteredRumah.length === 0 ? (
                            <div className="p-3 text-sm text-slate-500">Tidak ada hasil</div>
                          ) : (
                            filteredRumah.map((r) => (
                              <button
                                key={r.id_rs}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, id_rs: r.id_rs });
                                  setShowRumahDropdown(false);
                                  setRumahQuery('');
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-slate-100"
                              >
                                <div className="text-sm font-medium text-slate-800">{r.nama_rs}</div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div ref={dokterRef}>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Dokter</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDokterDropdown((s) => !s);
                      setShowCalendar(false);
                    }}
                    className="w-full text-left px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white flex items-center justify-between"
                  >
                    <span className={`${formData.id_dokter ? 'text-slate-900' : 'text-slate-400'}`}>
                      {(() => {
                        const sel = dokters.find(d => String(d.id_dokter || d.id) === String(formData.id_dokter));
                        return sel ? (sel.nama || sel.name) : 'Pilih dokter';
                      })()}
                    </span>
                    <svg className="h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 9l4 4 4-4" />
                    </svg>
                  </button>

                  {showDokterDropdown && (
                    <div className="absolute left-0 mt-2 bg-white border rounded-lg shadow-lg w-full z-50">
                      <div className="p-2">
                        <input
                          type="text"
                          value={dokterQuery}
                          onChange={(e) => setDokterQuery(e.target.value)}
                          placeholder="Cari nama atau ID dokter"
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="max-h-48 overflow-auto">
                        {filteredDokters.length === 0 ? (
                          <div className="p-3 text-sm text-slate-500">Tidak ada hasil</div>
                        ) : (
                          filteredDokters.map((d) => (
                            <button
                              key={d.id_dokter || d.id}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, id_dokter: d.id_dokter || d.id });
                                setShowDokterDropdown(false);
                                setDokterQuery('');
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-slate-100 flex items-center gap-3"
                            >
                              <div className="text-sm font-medium text-slate-800">{d.nama || d.name}</div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
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

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Diagnosa</label>
                <input
                  type="text"
                  value={formData.nama_diagnosa}
                  onChange={(e) => setFormData({ ...formData, nama_diagnosa: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
                  placeholder="Masukkan nama diagnosa"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Kriteria Ciri</label>
                <textarea
                  value={formData.kriteria_ciri}
                  onChange={(e) => setFormData({ ...formData, kriteria_ciri: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50 resize-none"
                  placeholder="Masukkan kriteria ciri"
                  rows="3"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Obat</label>
                <textarea
                  value={formData.obat}
                  onChange={(e) => setFormData({ ...formData, obat: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50 resize-none"
                  placeholder="Masukkan obat"
                  rows="3"
                />
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
