import { useState, useEffect } from 'react';
import { MdSearch } from 'react-icons/md';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [user, setUser] = useState({
    username: 'User',
    role: 'user@healink.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
  });

  useEffect(() => {
    // Format tanggal
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    const formatted = today.toLocaleDateString('id-ID', options);
    setCurrentDate(formatted);

    // Ambil data user dari localStorage
    const userData = localStorage.getItem('healink_user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser({
          username: parsedUser.username || parsedUser.name || 'User',
          role: parsedUser.role || 'user@healink.com',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${parsedUser.username || 'User'}`,
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  return (
    <nav className="sticky top-0 z-40 bg-secondary/95 border-b border-slate-200/80 backdrop-blur-sm px-6 sm:px-8 py-4 font-poppins">
      <div className="flex items-center justify-between gap-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative flex items-center bg-white border border-slate-200/80 rounded-lg px-4 py-2.5 shadow-sm">
            <MdSearch className="text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search task"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent ml-3 outline-none text-slate-700 placeholder-slate-400 text-sm"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-6 ml-auto">
          {/* Current Date */}
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">{currentDate}</p>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200/80">
            <img
              src={user.avatar}
              alt={user.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{user.username}</p>
              <p className="text-xs text-slate-500">{user.role}</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
