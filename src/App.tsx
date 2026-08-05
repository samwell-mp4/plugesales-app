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
import ExpressTemplate from './pages/ExpressTemplate';
import TemplateBatchGenerator from './pages/TemplateBatchGenerator';
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
import CRMCentralFluxo from './pages/CRMCentralFluxo';
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
import FinanceDashboard from './pages/FinanceDashboard';
import FinanceSales from './pages/FinanceSales';
import FinanceControl from './pages/FinanceControl';
import FinanceCommissions from './pages/FinanceCommissions';
import FinanceReports from './pages/FinanceReports';
import FinanceSuppliers from './pages/FinanceSuppliers';
import FinancePayables from './pages/FinancePayables';
import FinanceRefunds from './pages/FinanceRefunds';
import FinanceRequests from './pages/FinanceRequests';
import FinanceInventory from './pages/FinanceInventory';
import CollaboratorsRegistration from './pages/CollaboratorsRegistration';
import TemplateManager from './pages/TemplateManager';
import TermsOfUse from './pages/TermsOfUse';
import PrivacyPolicy from './pages/PrivacyPolicy';
import DataDeletion from './pages/DataDeletion';
import './index.css';
import './crm.css';
import './finance.css';

import PublicLayout from './components/PublicLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AboutPage from './pages/AboutPage';
import PresentationsPage from './pages/PresentationsPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import HomePage from './pages/HomePage';
import ForumProfilePage from './pages/ForumProfilePage';
import ClientRegistration from './pages/ClientRegistration';
import DisparoMassaPage from './pages/DisparoMassaPage';
import ApiOficialPage from './pages/ApiOficialPage';
import ChatbotPage from './pages/ChatbotPage';
import GuiaDisparoMassa from './pages/guias/DisparoMassaGuia';
import ComoEscolherBSP from './pages/guias/ComoEscolherBSP';
import EstrategiasConversao from './pages/guias/EstrategiasConversao';
import ComoEnviarMensagemEmMassa from './pages/guias/ComoEnviarMensagemEmMassa';
import DisparoAutomaticoWhatsApp from './pages/guias/DisparoAutomaticoWhatsApp';
import PrecosPage from './pages/PrecosPage';
import ComparacaoApiOficialVsDisparadorWeb from './pages/comparacao/ComparacaoApiOficialVsDisparadorWeb';
import DisparoGratuitoVsApiOficial from './pages/comparacao/DisparoGratuitoVsApiOficial';
import ParaEcommerce from './pages/para/ParaEcommerce';
import ParaImobiliarias from './pages/para/ParaImobiliarias';
import ParaEducacao from './pages/para/ParaEducacao';
import BuscaPage from './pages/BuscaPage';
import EstadoPage from './pages/EstadoPage';
import CidadePage from './pages/CidadePage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Control from './pages/Control';
import EmployeeClients from './pages/EmployeeClients';
import AcademyPage from './pages/AcademyPage';

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
    location.pathname.startsWith('/news-clients') ||
    location.pathname === '/login' ||
    location.pathname.startsWith('/servicos/') ||
    location.pathname.match(/^\/servicos\/disparo-em-massa-whatsapp\/[a-z]{2}\/[a-z0-9-]+$/) ||
    location.pathname.startsWith('/guia/') ||
    location.pathname.startsWith('/comparacao/') ||
    location.pathname.startsWith('/para/') ||
    location.pathname === '/precos' ||
    location.pathname === '/busca';

  if (!user && !isPublicRoute) {
    return <Login />;
  }

  // Role-based protection
  const isClient = user?.role === 'CLIENT';
  const isAdmin = user?.role === 'ADMIN';
  const isEmployee = user?.role === 'EMPLOYEE';

  // Redirect logged-in users (except forum users) accessing the main page
  if (user && user.role !== 'usuario_forum' && location.pathname === '/') {
      return <Navigate to="/accounts" replace />;
  }

  // Redirect clients to their dashboard if they try to access general dashboard
  if (isClient && location.pathname === '/dashboard') {
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
    '/express-template',
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
    '/admin/plug-cards',
    '/finance',
    '/crm/funil',
    '/crm/analise',
    '/employee-clients',
    '/collaborators/register',
    '/cron-report',
    '/template-batch'
  ];

  const isRestrictedRole = user?.role === 'CLIENT' || user?.role === 'ASSINATURA_BASICA' || user?.role === 'VENDEDOR' || user?.role === 'COZINHEIRA';
  
  if (isRestrictedRole && adminOnlyRoutes.some(route => {
    // Special case for COZINHEIRA: They can ONLY access finance dashboard and inventory
    if (user?.role === 'COZINHEIRA') {
        if (location.pathname === '/finance/dashboard' || location.pathname === '/finance/inventory') {
            return false;
        }
        return true; // Block everything else in admin routes
    }

    // Special case for VENDEDOR: They can access the finance module
    if (user?.role === 'VENDEDOR' && location.pathname.startsWith('/finance')) {
        return false;
    }

    // Special case for CLIENT: They can access specific finance routes
    if (user?.role === 'CLIENT' && location.pathname === '/finance/sales') {
        return false;
    }

    // Special case for CLIENT: Monitor de Banco
    if (user?.role === 'CLIENT' && user?.notification_number && location.pathname === '/crm/n8n-monitor') {
        return false;
    }

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

  // Cozinheira Default Redirect
  if (user?.role === 'COZINHEIRA' && (location.pathname === '/' || location.pathname === '/dashboard')) {
      return <Navigate to="/finance/inventory" replace />;
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
            <Route path="/servicos/disparo-em-massa-whatsapp/:uf/:cidade" element={<CidadePage />} />
            <Route path="/servicos/disparo-em-massa-whatsapp/:uf" element={<EstadoPage />} />
            <Route path="/servicos/disparo-em-massa-whatsapp" element={<DisparoMassaPage />} />
            <Route path="/servicos/api-oficial-whatsapp" element={<ApiOficialPage />} />
            <Route path="/servicos/chatbot-whatsapp" element={<ChatbotPage />} />
            <Route path="/guia/disparo-em-massa-whatsapp" element={<GuiaDisparoMassa />} />
            <Route path="/guia/como-escolher-bsp-whatsapp" element={<ComoEscolherBSP />} />
            <Route path="/guia/estrategias-conversao-whatsapp" element={<EstrategiasConversao />} />
            <Route path="/guia/como-enviar-mensagem-em-massa-whatsapp" element={<ComoEnviarMensagemEmMassa />} />
            <Route path="/guia/disparo-automatico-whatsapp" element={<DisparoAutomaticoWhatsApp />} />
            <Route path="/precos" element={<PrecosPage />} />
            <Route path="/comparacao/api-oficial-vs-disparador-web" element={<ComparacaoApiOficialVsDisparadorWeb />} />
            <Route path="/comparacao/disparo-gratuito-vs-api-oficial" element={<DisparoGratuitoVsApiOficial />} />
            <Route path="/para/ecommerce" element={<ParaEcommerce />} />
            <Route path="/para/imobiliarias" element={<ParaImobiliarias />} />
            <Route path="/para/educacao" element={<ParaEducacao />} />
            <Route path="/busca" element={<BuscaPage />} />
          </Route>
          {/* Academy: somente ADMIN/EMPLOYEE */}
          <Route 
            path="/academy" 
            element={
              <ProtectedRoute>
                {(isAdmin || isEmployee) ? <AcademyPage /> : <Navigate to="/dashboard" replace />}
              </ProtectedRoute>
            } 
          />

          {/* Legacy/Specific Public Routes */}
          <Route path="/news-clients/" element={<ClientRegistration />} />
          <Route path="/news-clients/:code" element={<ClientRegistration />} />
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
          <Route path="/express-template" element={<ProtectedRoute><ExpressTemplate /></ProtectedRoute>} />
          <Route path="/template-batch" element={<ProtectedRoute><TemplateBatchGenerator /></ProtectedRoute>} />
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
          <Route path="/crm/fluxo-leads" element={<ProtectedRoute adminOnly={true}><CRMCentralFluxo /></ProtectedRoute>} />
          <Route path="/crm/consultiva" element={<ProtectedRoute><GestaoConsultiva /></ProtectedRoute>} />
          <Route path="/cron-report" element={<ProtectedRoute><CronReport /></ProtectedRoute>} />
          <Route path="/plug-cards" element={<ProtectedRoute adminOnly={true}><PlugCardsExchange /></ProtectedRoute>} />
          <Route path="/my-cards" element={<ProtectedRoute adminOnly={true}><MyPlugCards /></ProtectedRoute>} />
          <Route path="/my-wallet" element={<ProtectedRoute adminOnly={true}><MyWallet /></ProtectedRoute>} />
          <Route path="/admin/plug-cards" element={<ProtectedRoute adminOnly={true}><AdminPlugCards /></ProtectedRoute>} />
          <Route path="/employee-clients" element={<ProtectedRoute><EmployeeClients /></ProtectedRoute>} />
          <Route path="/infobip/templates" element={<ProtectedRoute><TemplateManager /></ProtectedRoute>} />
          
          {/* Finance Module Routes */}
          <Route path="/finance/dashboard" element={<ProtectedRoute><FinanceDashboard /></ProtectedRoute>} />
          <Route path="/finance/sales" element={<ProtectedRoute><FinanceSales /></ProtectedRoute>} />
          <Route path="/finance/control" element={<ProtectedRoute><FinanceControl /></ProtectedRoute>} />
          <Route path="/finance/commissions" element={<ProtectedRoute><FinanceCommissions /></ProtectedRoute>} />
          <Route path="/finance/reports" element={<ProtectedRoute><FinanceReports /></ProtectedRoute>} />
          <Route path="/finance/suppliers" element={<ProtectedRoute><FinanceSuppliers /></ProtectedRoute>} />
          <Route path="/finance/payables" element={<ProtectedRoute><FinancePayables /></ProtectedRoute>} />
          <Route path="/finance/refunds" element={<ProtectedRoute><FinanceRefunds /></ProtectedRoute>} />
          <Route path="/finance/requests" element={<ProtectedRoute><FinanceRequests /></ProtectedRoute>} />
          <Route path="/finance/inventory" element={<ProtectedRoute><FinanceInventory /></ProtectedRoute>} />
          <Route path="/collaborators/register" element={<ProtectedRoute><CollaboratorsRegistration /></ProtectedRoute>} />

          {/* External Public Views (Micro-apps) */}
          <Route path="/bio/:slug" element={<SmartBioView />} />
          <Route path="/card/:id" element={<DigitalCardView />} />
          <Route path="/test-cards" element={<TestCards />} />
          <Route path="/download" element={<Download />} />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
          <Route path="/termos-de-uso" element={<TermsOfUse />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
          <Route path="/data-deletion" element={<DataDeletion />} />
          <Route path="/exclusao-de-dados" element={<DataDeletion />} />
          <Route path="/data-deletion-status" element={<DataDeletion />} />
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
