import { useLocation, BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import NotificationCenter from './components/NotificationCenter';
import { useEffect } from 'react';
import { pushNotificationService } from './services/pushNotificationService';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import LiveChat from './pages/LiveChat';
import N8NWorkflow from './pages/N8NWorkflow';
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
import LinkRotator from './pages/LinkRotator';
import LinkStats from './pages/LinkStats';
import RotatorDetails from './pages/RotatorDetails';
import ClientReports from './pages/ClientReportsPage';
import LandingPage from './pages/LandingPage';
import ThankYou from './pages/ThankYou';
import Profile from './pages/Profile';
import LeadStepForm from './pages/LeadStepForm';
import LeadAdminView from './pages/LeadAdminView';
import ClientForClientForm from './pages/ClientForClientForm';
import CRMAnalise from './pages/CRMAnalise';
import CRMFunil from './pages/CRMFunil';
import GestaoConsultiva from './pages/GestaoConsultiva';
import CronReport from './pages/CronReport';
import PlugCardsExchange from './pages/PlugCardsExchange';
import MyPlugCards from './pages/MyPlugCards';
import AdminPlugCards from './pages/AdminPlugCards';
import MyWallet from './pages/MyWallet';
import TestCards from './pages/TestCards';
import Finalizado from './pages/Finalizado';
import Obrigado from './pages/Obrigado';
import Download from './pages/Download';
import AdminChanges from './pages/AdminChanges';
import MetaPixel from './components/MetaPixel';
import SupremeLoading from './components/SupremeLoading';
import './index.css';
import './crm.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Control from './pages/Control';

function AppContent() {
  const { user, theme, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <SupremeLoading />;
  }

  // Automatic Push Notification Subscription for Agents/Admins
  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.role === 'EMPLOYEE')) {
      // Small timeout to ensure SW is ready and not blocking initial load
      const timer = setTimeout(() => {
        if (Notification.permission !== 'denied') {
          pushNotificationService.subscribeUser(user.id as number);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const isPublicRoute = 
    location.pathname.startsWith('/landing') || 
    location.pathname.startsWith('/obrigado') || 
    location.pathname === '/finalizado' || 
    location.pathname === '/download' || 
    location.pathname === '/lead-flow' || 
    location.pathname.startsWith('/l/') || 
    location.pathname.startsWith('/r/') || 
    location.pathname.startsWith('/client-add/') ||
    location.pathname === '/test-cards';

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
    '/dashboard',
    '/admin/changes'
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
      <MetaPixel /> {/* Rastreador Condicional para Ricardo Willer */}
      {!isPublicRoute && <Sidebar />}
      {!isPublicRoute && (
        <div className="global-header-actions">
          <NotificationCenter />
        </div>
      )}
      <main className={`main-content ${isPublicRoute ? 'no-padding' : ''}`}>
        <Routes>
          <Route path="/" element={<Navigate to={isClient ? "/client-dashboard" : "/accounts"} replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/admin/changes" element={user?.role === 'ADMIN' || user?.role === 'EMPLOYEE' ? <AdminChanges /> : <Navigate to="/accounts" />} />
          <Route path="/live-chat" element={<LiveChat />} />
          <Route path="/crm/n8n-monitor" element={<N8NWorkflow />} />
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
          <Route path="/link-rotator" element={<LinkRotator />} />
          <Route path="/rotator-stats/:id" element={<RotatorDetails />} />
          <Route path="/client-reports" element={<ClientReports />} />
          <Route path="/link-stats/:id" element={<LinkStats />} />
          <Route path="/download" element={<Download />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/landing/:id" element={<LandingPage />} />
          <Route path="/lead-flow" element={<LeadStepForm />} />
          <Route path="/obrigado" element={<Obrigado />} />
          <Route path="/obrigado/:id" element={<Obrigado />} />
          <Route path="/finalizado" element={<Finalizado />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/client-add/:parentId/:submissionId?" element={user?.role === 'ADMIN' || user?.role === 'EMPLOYEE' ? <ClientForClientForm /> : <Navigate to="/accounts" />} />
          <Route path="/control" element={user?.role === 'ADMIN' ? <Control /> : <Navigate to="/accounts" />} />
          <Route path="/admin/step-leads" element={user?.role === 'ADMIN' ? <LeadAdminView /> : <Navigate to="/accounts" />} />
          <Route path="/crm/analise" element={<CRMAnalise />} />
          <Route path="/crm/funil" element={<CRMFunil />} />
          <Route path="/crm/consultiva" element={<GestaoConsultiva />} />
          <Route path="/cron-report" element={<CronReport />} />
          {/* PLUG CARDS MODULE — isolated, no impact on existing routes */}
          <Route path="/plug-cards" element={<PlugCardsExchange />} />
          <Route path="/my-cards" element={<MyPlugCards />} />
          <Route path="/my-wallet" element={<MyWallet />} />
          <Route path="/admin/plug-cards" element={user?.role === 'ADMIN' || user?.role === 'EMPLOYEE' ? <AdminPlugCards /> : <Navigate to="/dashboard" />} />
          <Route path="/test-cards" element={<TestCards />} />
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
