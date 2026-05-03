import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './components/AppLayout.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import PatientsPage from './pages/PatientsPage.jsx';
import DoctorsPage from './pages/DoctorsPage.jsx';
import AppointmentsPage from './pages/AppointmentsPage.jsx';
import BillingPage from './pages/BillingPage.jsx';
import PrescriptionsPage from './pages/PrescriptionsPage.jsx';
import RecordsPage from './pages/RecordsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

const RootRedirect = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Navigate to="/dashboard" replace />;
};

const App = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/patients" element={<ProtectedRoute roles={[ 'admin', 'doctor' ]}><PatientsPage /></ProtectedRoute>} />
          <Route path="/doctors" element={<ProtectedRoute roles={[ 'admin', 'doctor' ]}><DoctorsPage /></ProtectedRoute>} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/prescriptions" element={<ProtectedRoute roles={[ 'admin', 'doctor', 'patient' ]}><PrescriptionsPage /></ProtectedRoute>} />
          <Route path="/records" element={<ProtectedRoute roles={[ 'patient', 'admin', 'doctor' ]}><RecordsPage /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Box>
  );
};

export default App;
