import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import './index.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';

import Control from './pages/Control';



function AppContent() {
  const { user } = useAuth();


  const isPublicRoute = window.location.pathname === '/client-form';

  if (!user && !isPublicRoute) {
    return <Login />;
  }

  return (
    <div className="app-layout">
      {!isPublicRoute && <Sidebar />}
      <main className="main-content" style={{ paddingLeft: isPublicRoute ? '0' : 'var(--sidebar-width)' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/templates" element={<TemplateCreator />} />
          <Route path="/client-submissions" element={<ClientSubmissions />} />
          <Route path="/client-submissions/:id" element={<ClientSubmissionDetail />} />
          <Route path="/client-submissions/add" element={<ClientSubmissionAdd />} />
          <Route path="/client-form" element={<ClientExternalForm />} />
          <Route path="/upload" element={<UploadContacts />} />
          <Route path="/campaigns" element={<CampaignPlanner />} />
          <Route path="/engine" element={<EngineExecution />} />
          <Route path="/media" element={<MediaHosting />} />
          <Route path="/dispatch" element={<TemplateDispatch />} />
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
