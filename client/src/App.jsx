import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { connectSocket } from './realtime/socket';
import { useDispatch } from 'react-redux';
import { addNotification } from './features/notifications/notificationsSlice';
import { ToastProvider } from './components/Toast';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ContactsPage from './pages/ContactsPage';
import ContactDetailPage from './pages/ContactDetailPage';
import CompaniesPage from './pages/CompaniesPage';
import CompanyDetailPage from './pages/CompanyDetailPage';
import LeadsPage from './pages/LeadsPage';
import DealsPage from './pages/DealsPage';
import TasksPage from './pages/TasksPage';
import MeetingsPage from './pages/MeetingsPage';
import CallLogsPage from './pages/CallLogsPage';
import ProductsPage from './pages/ProductsPage';
import TicketsPage from './pages/TicketsPage';
import QuotationsPage from './pages/QuotationsPage';
import InvoicesPage from './pages/InvoicesPage';
import UserManagementPage from './pages/UserManagementPage';
import SettingsPage from './pages/SettingsPage';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

function PrivateLayout({ children }) {
  const accessToken = useSelector((s) => s.auth.accessToken);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!accessToken) return;
    const socket = connectSocket(accessToken);
    socket.on('notification', (note) => dispatch(addNotification(note)));
    return () => socket.disconnect();
  }, [accessToken, dispatch]);

  if (!accessToken) return <Navigate to="/login" replace />;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Navbar />
        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<PrivateLayout><DashboardPage /></PrivateLayout>} />
        <Route path="/contacts" element={<PrivateLayout><ContactsPage /></PrivateLayout>} />
        <Route path="/contacts/:id" element={<PrivateLayout><ContactDetailPage /></PrivateLayout>} />
        <Route path="/companies" element={<PrivateLayout><CompaniesPage /></PrivateLayout>} />
        <Route path="/companies/:id" element={<PrivateLayout><CompanyDetailPage /></PrivateLayout>} />
        <Route path="/leads" element={<PrivateLayout><LeadsPage /></PrivateLayout>} />
        <Route path="/deals" element={<PrivateLayout><DealsPage /></PrivateLayout>} />
        <Route path="/tasks" element={<PrivateLayout><TasksPage /></PrivateLayout>} />
        <Route path="/meetings" element={<PrivateLayout><MeetingsPage /></PrivateLayout>} />
        <Route path="/call-logs" element={<PrivateLayout><CallLogsPage /></PrivateLayout>} />
        <Route path="/products" element={<PrivateLayout><ProductsPage /></PrivateLayout>} />
        <Route path="/tickets" element={<PrivateLayout><TicketsPage /></PrivateLayout>} />
        <Route path="/quotations" element={<PrivateLayout><QuotationsPage /></PrivateLayout>} />
        <Route path="/invoices" element={<PrivateLayout><InvoicesPage /></PrivateLayout>} />
        <Route path="/users" element={<PrivateLayout><UserManagementPage /></PrivateLayout>} />
        <Route path="/settings" element={<PrivateLayout><SettingsPage /></PrivateLayout>} />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}
