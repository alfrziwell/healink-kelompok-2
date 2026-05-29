import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdDashboard,
  MdPerson,
  MdLocalHospital,
  MdAssignment,
  MdAssignmentTurnedIn,
  MdAccessibilityNew,
  MdPeople,
  MdLogout,
} from 'react-icons/md';
import { Link, useLocation } from 'react-router-dom';
import { logoutAuth } from '../../api/auth';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    // Ambil role dari localStorage
    const userData = localStorage.getItem('healink_user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        const role = parsedUser.role?.toLowerCase() || 'user';
        setUserRole(role);

        // Set menu items berdasarkan role
        if (role === 'super_admin') {
          setMenuItems([
            {
              name: 'Dashboard',
              icon: MdDashboard,
              path: '/dashboard',
              badge: null,
            },
            {
              name: 'User',
              icon: MdPeople,
              path: '/users',
              badge: null,
            },
            {
              name: 'Rumah Sakit',
              icon: MdLocalHospital,
              path: '/rumah-sakit',
              badge: null,
            },
            {
              name: 'Dokter',
              icon: MdPerson,
              path: '/dokter',
              badge: null,
            },
            {
              name: 'Pasien',
              icon: MdAccessibilityNew,
              path: '/pasien',
              badge: null,
            },
            {
              name: 'Diagnosa',
              icon: MdAssignmentTurnedIn,
              path: '/diagnosa',
              badge: null,
            },
          ]);
        } else if (role === 'admin') {
          setMenuItems([
            {
              name: 'Dashboard',
              icon: MdDashboard,
              path: '/dashboard',
              badge: null,
            },
            {
              name: 'Pasien',
              icon: MdAccessibilityNew,
              path: '/pasien',
              badge: null,
            },
            {
              name: 'Diagnosa',
              icon: MdAssignmentTurnedIn,
              path: '/diagnosa',
              badge: null,
            },
          ]);
        } else {
          setMenuItems([
            {
              name: 'Dashboard',
              icon: MdDashboard,
              path: '/dashboard',
              badge: null,
            },
          ]);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('healink_token');

    try {
      if (token) {
        await logoutAuth(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('healink_token');
      localStorage.removeItem('healink_refresh_token');
      localStorage.removeItem('healink_user');
      
      // Delay sebelum redirect
      setTimeout(() => {
        setIsLoading(false);
        setShowLogoutModal(false);
        navigate('/login', { replace: true });
      }, 1500);
    }
  };

  return (
    <>
      <aside className="w-64 bg-secondary border-r border-slate-200/80 flex flex-col h-screen sticky top-0 font-poppins">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo_healink.svg"
              alt="HEALINK"
              className="h-8 w-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-lg font-bold text-slate-900">HEALINK</span>
          </div>
        </div>

        {/* Role Badge */}
        {userRole && (
          <div className="px-6 py-4 border-b border-slate-200/80">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full capitalize">
              {userRole === 'super_admin' ? 'Super Admin' : 'Admin'}
            </span>
          </div>
        )}

        {/* Menu Section */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="mb-8">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-4">
              Menu
            </p>
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        active
                          ? 'bg-primary text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            active
                              ? 'bg-white bg-opacity-20 text-white'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Logout Section */}
        <div className="px-4 py-6 border-t border-slate-200/80 space-y-4">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-slate-700 hover:bg-slate-100"
          >
            <MdLogout size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
          <div className="text-center text-xs text-slate-500">
            <p>© 2026 HEALINK. All rights reserved.</p>
          </div>
        </div>
      </aside>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 font-poppins animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 shadow-2xl animate-slide-up overflow-hidden">
            {/* Header with Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-linear-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center">
                <MdLogout size={32} className="text-red-600" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Logout?</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Apakah Anda yakin ingin keluar dari aplikasi? Anda perlu login kembali untuk mengakses dashboard.
              </p>
            </div>

            {/* Loading Message */}
            {isLoading && (
              <div className="text-center mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <p className="text-sm text-blue-600 font-medium">Sedang logout...</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoading}
                className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all duration-200 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-linear-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </>
                ) : (
                  <>
                    <MdLogout size={18} />
                    Logout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .animate-pulse { animation: pulse-dot 1.4s ease-in-out infinite; }
      `}</style>
    </>
  );
}
