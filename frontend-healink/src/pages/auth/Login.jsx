import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AiOutlineUser, AiOutlineLock, AiOutlineEye, AiOutlineEyeInvisible, AiOutlineHome } from 'react-icons/ai';
import bgLogin from '../../assets/img/bg_login.png';
import logoHealink from '../../assets/img/logo_healink.png';
import { loginAuth } from '../../api/auth';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await loginAuth({ username, pw: password });
      const authData = response?.data?.data;

      if (!response?.data?.success || !authData?.token) {
        throw new Error(response?.data?.message || 'Login gagal');
      }

      localStorage.setItem('healink_token', authData.token);
      localStorage.setItem('healink_refresh_token', authData.refreshToken || '');
      localStorage.setItem(
        'healink_user',
        JSON.stringify({
          id_user: authData.id_user,
          username: authData.username,
          role: authData.role,
          id_rs: authData.id_rs,
        })
      );

      navigate('/dashboard', { replace: true });
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Terjadi kesalahan saat login';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-start bg-cover bg-center relative font-poppins"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(96, 165, 250, 0.1)), url(${bgLogin})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Back to Home Button */}
      <Link
        to="/"
        className="absolute left-6 top-6 inline-flex items-center justify-center rounded-full border-2 border-white/50 bg-white/90 backdrop-blur-sm p-3 text-slate-700 hover:scale-110 hover:bg-white hover:border-white shadow-lg transition duration-300"
        aria-label="Kembali ke beranda"
      >
        <AiOutlineHome className="h-5 w-5" />
      </Link>

      {/* Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 sm:px-8 py-10 min-h-screen">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="mb-4 w-16 h-16 rounded-2xl bg-white shadow-lg shadow-slate-900/20 flex items-center justify-center transform hover:scale-105 transition duration-300">
              <img src={logoHealink} alt="HEALINK logo" className="w-10 h-10 object-contain" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-2" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
              HEALINK
            </h1>
            <p className="text-sm sm:text-base text-white/80 font-medium tracking-widest">HEALTH INFORMATION SYSTEM</p>
          </div>

          {/* Form Card */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/50">
            {/* Form Header */}
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Masuk</h2>
              <p className="text-slate-600 text-sm">Silakan masukkan kredensial Anda untuk melanjutkan</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Alert */}
              {errorMessage && (
                <div className="rounded-xl border border-red-200/60 bg-linear-to-r from-red-50 to-red-50/50 backdrop-blur-sm px-4 py-3 text-sm text-red-700 shadow-sm animate-slide-down">
                  <p className="font-semibold mb-1">Login Gagal</p>
                  <p className="text-red-600">{errorMessage}</p>
                </div>
              )}

              {/* Username Field */}
              <div className="group">
                <label className="block text-slate-700 text-sm font-bold mb-3">Username</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-primary transition duration-200">
                    <AiOutlineUser />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username Anda"
                    required
                    className="w-full px-4 py-3.5 pl-12 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50 transition duration-200 text-slate-900 placeholder-slate-400 text-base"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
                <label className="block text-slate-700 text-sm font-bold mb-3">Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-primary transition duration-200">
                    <AiOutlineLock />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password Anda"
                    required
                    className="w-full px-4 py-3.5 pl-12 pr-12 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50 transition duration-200 text-slate-900 placeholder-slate-400 text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-primary transition duration-200"
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible className="text-lg" />
                    ) : (
                      <AiOutlineEye className="text-lg" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-primary to-blue-600 hover:from-blue-700 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-lg transition duration-300 mt-6 text-base shadow-lg shadow-primary/30 hover:shadow-lg hover:shadow-primary/40 transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Memproses...</span>
                  </>
                ) : (
                  'Masuk'
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-white/80 text-xs mt-8" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
            © 2026 HEALINK. All rights reserved.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Login;
