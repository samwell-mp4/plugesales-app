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
import MaterialsCenter from './pages/MaterialsCenter';
import SmartBioCreator from './pages/SmartBioCreator';
import SmartBioView from './pages/SmartBioView';
import DigitalCardCreator from './pages/DigitalCardCreator';
import DigitalCardView from './pages/DigitalCardView';
import MetaPixel from './components/MetaPixel';
import SupremeLoading from './components/SupremeLoading';
import './index.css';
import './crm.css';

import PublicLayout from './components/PublicLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AboutPage from './pages/AboutPage';
import PresentationsPage from './pages/PresentationsPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import HomePage from './pages/HomePage';
import ForumProfilePage from './pages/ForumProfilePage';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Control from './pages/Control';

function AppContent() {
  const { user, theme, isLoading } = useAuth();
  const location = useLocation();

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

  if (isLoading) {
    return <SupremeLoading />;
  }

  const isPublicRoute = 
    location.pathname === '/' ||
    location.pathname === '/sobre' ||
    location.pathname === '/apresentacoes' ||
    location.pathname === '/blog' ||
    location.pathname.startsWith('/blog/') ||
    location.pathname.startsWith('/landing') || 
    location.pathname.startsWith('/obrigado') || 
    location.pathname === '/finalizado' || 
    location.pathname === '/download' || 
    location.pathname === '/lead-flow' || 
    location.pathname.startsWith('/l/') || 
    location.pathname.startsWith('/r/') || 
    location.pathname.startsWith('/client-add/') ||
    location.pathname.startsWith('/bio/') ||
    location.pathname.startsWith('/card/') ||
    location.pathname === '/test-cards' ||
    location.pathname === '/perfil/comentarios' ||
    location.pathname === '/perfil/editar' ||
    location.pathname === '/login';

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
    '/admin/changes',
    '/live-chat',
    '/campaigns',
    '/engine',
    '/dispatch',
    '/crm/consultiva',
    '/crm/n8n-monitor',
    '/admin/step-leads',
    '/admin/plug-cards'
  ];

  const isRestrictedRole = user?.role === 'CLIENT' || user?.role === 'ASSINATURA_BASICA';
  
  if (isRestrictedRole && adminOnlyRoutes.some(route => {
    // Special case: Clients CAN access /client-submissions/:id but NOT /client-submissions (list) or /client-submissions/add
    // ASSINATURA_BASICA CAN access /client-submissions (list) and /accounts and /templates
    if (user?.role === 'ASSINATURA_BASICA') {
        const allowedForBasica = ['/accounts', '/templates', '/client-submissions', '/upload'];
        if (allowedForBasica.some(allowed => location.pathname === allowed || (location.pathname.startsWith(allowed) && !location.pathname.startsWith('/client-submissions/add')))) {
            return false;
        }
    }

    if (route === '/client-submissions') {
      const isList = location.pathname === '/client-submissions' || location.pathname === '/client-submissions/';
      const isAdd = location.pathname.startsWith('/client-submissions/add');
      return isList || isAdd;
    }
    return location.pathname.startsWith(route);
  })) {
    return <Navigate to={isClient ? "/client-dashboard" : "/profile"} replace />;
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
          {/* Public Corporate Site */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/sobre" element={<AboutPage />} />
            <Route path="/apresentacoes" element={<PresentationsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/perfil/comentarios" element={<ForumProfilePage />} />
            <Route path="/perfil/editar" element={<ForumProfilePage />} />
          </Route>

          {/* Legacy/Specific Public Routes */}
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/landing/:id" element={<LandingPage />} />
          <Route path="/lead-flow" element={<LeadStepForm />} />
          <Route path="/obrigado" element={<Obrigado />} />
          <Route path="/obrigado/:id" element={<Obrigado />} />
          <Route path="/finalizado" element={<Finalizado />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />

          {/* Shielded Routes (Authentication Required) */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
          <Route path="/admin/changes" element={<ProtectedRoute><AdminChanges /></ProtectedRoute>} />
          <Route path="/live-chat" element={<ProtectedRoute><LiveChat /></ProtectedRoute>} />
          <Route path="/crm/n8n-monitor" element={<ProtectedRoute><N8NWorkflow /></ProtectedRoute>} />
          <Route path="/templates" element={<ProtectedRoute><TemplateCreator /></ProtectedRoute>} />
          <Route path="/client-submissions" element={<ProtectedRoute><ClientSubmissions /></ProtectedRoute>} />
          <Route path="/client-submissions/:id" element={<ProtectedRoute><ClientSubmissionDetail /></ProtectedRoute>} />
          <Route path="/client-submissions/add" element={<ProtectedRoute><ClientSubmissionAdd /></ProtectedRoute>} />
          <Route path="/client-form" element={<ProtectedRoute><ClientExternalForm /></ProtectedRoute>} />
          <Route path="/client" element={<ProtectedRoute><ClientExternalForm /></ProtectedRoute>} />
          <Route path="/client-dashboard" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><UploadContacts /></ProtectedRoute>} />
          <Route path="/campaigns" element={<ProtectedRoute><CampaignPlanner /></ProtectedRoute>} />
          <Route path="/engine" element={<ProtectedRoute><EngineExecution /></ProtectedRoute>} />
          <Route path="/media" element={<ProtectedRoute><MediaHosting /></ProtectedRoute>} />
          <Route path="/dispatch" element={<ProtectedRoute><TemplateDispatch /></ProtectedRoute>} />
          <Route path="/link-shortener" element={<ProtectedRoute><LinkShortener /></ProtectedRoute>} />
          <Route path="/link-rotator" element={<ProtectedRoute><LinkRotator /></ProtectedRoute>} />
          <Route path="/rotator-stats/:id" element={<ProtectedRoute><RotatorDetails /></ProtectedRoute>} />
          <Route path="/client-reports" element={<ProtectedRoute><ClientReports /></ProtectedRoute>} />
          <Route path="/link-stats/:id" element={<ProtectedRoute><LinkStats /></ProtectedRoute>} />
          <Route path="/productivity/materials" element={<ProtectedRoute><MaterialsCenter /></ProtectedRoute>} />
          <Route path="/productivity/smart-bio" element={<ProtectedRoute><SmartBioCreator /></ProtectedRoute>} />
          <Route path="/productivity/digital-card" element={<ProtectedRoute><DigitalCardCreator /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/client-add/:parentId/:submissionId?" element={<ProtectedRoute><ClientForClientForm /></ProtectedRoute>} />
          <Route path="/control" element={<ProtectedRoute adminOnly={true}><Control /></ProtectedRoute>} />
          <Route path="/admin/step-leads" element={<ProtectedRoute adminOnly={true}><LeadAdminView /></ProtectedRoute>} />
          <Route path="/crm/analise" element={<ProtectedRoute><CRMAnalise /></ProtectedRoute>} />
          <Route path="/crm/funil" element={<ProtectedRoute><CRMFunil /></ProtectedRoute>} />
          <Route path="/crm/consultiva" element={<ProtectedRoute><GestaoConsultiva /></ProtectedRoute>} />
          <Route path="/cron-report" element={<ProtectedRoute><CronReport /></ProtectedRoute>} />
          <Route path="/plug-cards" element={<ProtectedRoute><PlugCardsExchange /></ProtectedRoute>} />
          <Route path="/my-cards" element={<ProtectedRoute><MyPlugCards /></ProtectedRoute>} />
          <Route path="/my-wallet" element={<ProtectedRoute><MyWallet /></ProtectedRoute>} />
          <Route path="/admin/plug-cards" element={<ProtectedRoute adminOnly={true}><AdminPlugCards /></ProtectedRoute>} />

          {/* External Public Views (Micro-apps) */}
          <Route path="/bio/:slug" element={<SmartBioView />} />
          <Route path="/card/:id" element={<DigitalCardView />} />
          <Route path="/test-cards" element={<TestCards />} />
          <Route path="/download" element={<Download />} />
          <Route path="/l/:id" element={<Navigate to="/login" />} /> {/* Placeholder for shortlinks logic if needed */}
          <Route path="/r/:id" element={<Navigate to="/login" />} />
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
