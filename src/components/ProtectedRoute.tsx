import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SupremeLoading from './SupremeLoading';

interface ProtectedRouteProps {
    children: React.ReactNode;
    adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <SupremeLoading />;
    }

    if (!user) {
        // Redireciona para o login, mas salva a página que o usuário tentou acessar
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // SEGURANÇA MÁXIMA: Usuários do fórum (visitantes) NUNCA podem acessar o app interno
    if ((user as any).role === 'usuario_forum') {
        return <Navigate to="/" replace />;
    }

    if (adminOnly && user.role !== 'ADMIN') {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
