// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Users from './pages/Users';
import Instructors from './pages/Instructors';
import Categories from './pages/Categories';
import Reviews from './pages/Reviews';
import Analytics from './pages/Analytics';
import VoucherManagement from './pages/VoucherManagement';
import Payments from './pages/Payments';
import Levels from './pages/Levels';
import AdminLogin from './pages/AdminLogin';            
import { ToastContainer } from 'react-toastify';
import ProtectedRoute from './components/ProtectedRoute';
import Messages from './pages/Messages';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/403" element={<div className="p-6 text-center">403 – Forbidden</div>} />

        <Route element={<ProtectedRoute allow={['ADMIN']} />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/users" element={<Users />} />
            <Route path="/instructors" element={<Instructors />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/vouchers" element={<VoucherManagement />} />
            <Route path="/payment" element={<Payments />} />
            <Route path="/levels" element={<Levels />} />
            <Route path="/messages" element={<Messages />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </Router>
  );
}

export default App;
