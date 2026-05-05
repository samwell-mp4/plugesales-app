import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';
import './PublicSite.css';

const PublicLayout = () => {
    return (
        <div className="public-layout">
            <PublicNavbar />
            <main className="public-main">
                <Outlet />
            </main>
            <PublicFooter />
        </div>
    );
};

export default PublicLayout;
