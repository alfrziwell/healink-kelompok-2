import DashboardLayout from '../../layouts/DashboardLayout';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Ini Home Dashboard
          </h1>
          <p className="text-slate-600">
            Selamat datang di dashboard HEALINK
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;