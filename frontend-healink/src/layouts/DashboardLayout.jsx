import Navbar from '../components/dashboard/Navbar';
import Sidebar from '../components/dashboard/Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-slate-50 font-poppins text-slate-800">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Navbar */}
        <Navbar />

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
