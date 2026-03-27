import { useLocation, BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import TemplateCreator from './pages/TemplateCreator';
import UploadContacts from './pages/UploadContacts';
import CampaignPlanner from './pages/CampaignPlanner';
import EngineExecution from './pages/EngineExecution';
import MediaHosting from './pages/MediaHosting';
import TemplateDispatch from './pages/TemplateDispatch';
import ClientSubmissions from './pages/ClientSubmissions';
import ClientSubmissionDetail from './pages/ClientSubmissionDetail';
import ClientSubmissionAdd from './pages/ClientSubmissionAdd';
import ClientExternalForm from './pages/ClientExternalForm';
import ClientDashboard from './pages/ClientDashboard';
import LinkShortener from './pages/LinkShortener';
import LinkStats from './pages/LinkStats';
import ClientReports from './pages/ClientReportsPage';
import LandingPage from './pages/LandingPage';
import ClienteCRM from './pages/ClienteCRM';
import ThankYou from './pages/ThankYou';
import Profile from './pages/Profile';
import './index.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Control from './pages/Control';



function AppContent() {
  const { user, theme } = useAuth();
  const location = useLocation();

  const isPublicRoute = location.pathname === '/landing' || location.pathname === '/obrigado' || location.pathname === '/client-form' || location.pathname === '/client' || location.pathname.startsWith('/l/');

  if (!user && !isPublicRoute) {
    return <Login />;
  }

  // Role-based protection
  const isClient = user?.role === 'CLIENT';
  const isAdmin = user?.role === 'ADMIN';
  const isEmployee = user?.role === 'EMPLOYEE';

  // Redirect clients to their dashboard if they try to access root or general dashboard
  if (isClient && (location.pathname === '/' || location.pathname === '/dashboard')) {
      return <Navigate to="/client-dashboard" replace />;
  }

  // Strict block list for clients
  const adminOnlyRoutes = [
    '/accounts',
    '/templates',
    '/control',
    '/upload',
    '/campaigns',
    '/engine',
    '/dispatch',
    '/client-submissions',
    '/client-submissions/add',
    '/media',
    '/dashboard'
  ];

  if (isClient && adminOnlyRoutes.some(route => {
    // Special case: Clients CAN access /client-submissions/:id but NOT /client-submissions (list) or /client-submissions/add
    if (route === '/client-submissions') {
      const isList = location.pathname === '/client-submissions' || location.pathname === '/client-submissions/';
      const isAdd = location.pathname.startsWith('/client-submissions/add');
      return isList || isAdd;
    }
    return location.pathname.startsWith(route);
  })) {
    return <Navigate to="/client-dashboard" replace />;
  }

  // Admin exclusive
  if (!isAdmin && location.pathname.startsWith('/control')) {
      return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className={`app-layout ${theme === 'light' ? 'light-theme' : ''}`}>
      {!isPublicRoute && <Sidebar />}
      <main className={`main-content ${isPublicRoute ? 'no-padding' : ''}`}>
        <Routes>
          <Route path="/" element={<Navigate to={isClient ? "/client-dashboard" : "/dashboard"} replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/templates" element={<TemplateCreator />} />
          <Route path="/client-submissions" element={<ClientSubmissions />} />
          <Route path="/client-submissions/:id" element={<ClientSubmissionDetail />} />
          <Route path="/client-submissions/add" element={<ClientSubmissionAdd />} />
          <Route path="/client-form" element={<ClientExternalForm />} />
          <Route path="/client" element={<ClientExternalForm />} />
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="/upload" element={<UploadContacts />} />
          <Route path="/campaigns" element={<CampaignPlanner />} />
          <Route path="/engine" element={<EngineExecution />} />
          <Route path="/media" element={<MediaHosting />} />
          <Route path="/dispatch" element={<TemplateDispatch />} />
          <Route path="/link-shortener" element={<LinkShortener />} />
          <Route path="/client-reports" element={<ClientReports />} />
          <Route path="/link-stats/:id" element={<LinkStats />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/obrigado" element={<ThankYou />} />
          <Route path="/crm-clientes" element={isAdmin || isEmployee ? <ClienteCRM /> : <Navigate to="/dashboard" />} />
          <Route path="/crm-leads" element={<Navigate to="/crm-clientes" replace />} />
          <Route path="/affiliates" element={<Navigate to="/crm-clientes" replace />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/control" element={user?.role === 'ADMIN' ? <Control /> : <Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
