import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Home from '../pages/user/Home';
import About from '../pages/user/About';
import Service from '../pages/user/Service';
import Contact from '../pages/user/Contact';
import Dashboard from '../pages/dashboard/Dashboard';
import Users from '../pages/dashboard/Users';
import RumahSakit from '../pages/dashboard/RumahSakit';
import Dokter from '../pages/dashboard/Dokter';
import Pasien from '../pages/dashboard/Pasien';
import Diagnosa from '../pages/dashboard/Diagnosa';
import UserLayout from '../layouts/UserLayouts';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/rumah-sakit" element={<RumahSakit />} />
        <Route path="/dokter" element={<Dokter />} />
        <Route path="/pasien" element={<Pasien />} />
        <Route path="/diagnosa" element={<Diagnosa />} />

        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Service />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;
