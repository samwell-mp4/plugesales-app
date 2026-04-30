import { createContext, useContext, useState, useEffect } from 'react';

type Role = 'ADMIN' | 'EMPLOYEE' | 'CLIENT' | 'PENDING_CLIENT' | 'INFLUENCER' | 'ASSINATURA_BASICA';

interface User {
    id?: number;
    name: string;
    email?: string;
    phone?: string;
    role: Role;
    notification_number?: string;
    infobip_key?: string;
    infobip_sender?: string;
    infobip_url?: string;
    parent_id?: number;
    crm_spreadsheet_id?: string;
}

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<boolean>;
    register: (userData: any) => Promise<boolean>;
    logout: () => void;
    setUser: (user: User | null) => void;
    theme: 'dark' | 'light';
    toggleTheme: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Lista de usuários pré-definida conforme solicitado
const VALID_USERS = [
    { name: 'Admin', role: 'ADMIN' as Role, password: 'Plug26sales!guarapari' },
    { name: 'geraldo', role: 'ADMIN' as Role, password: 'geraldo876' },
    { name: 'Italo Clovis', role: 'EMPLOYEE' as Role, password: 'italo982' },
    { name: 'Augusto Fagundes', role: 'EMPLOYEE' as Role, password: 'augusto451' },
    { name: 'Otávio Augusto', role: 'EMPLOYEE' as Role, password: 'otavio319' },
    { name: 'luis', role: 'ADMIN' as Role, password: 'luis762' },
    { name: 'Ricardo Willer', role: 'EMPLOYEE' as Role, password: 'ricardo883' },
    { name: 'gabriel', role: 'EMPLOYEE' as Role, password: 'gabriel123' },
    { name: 'lucas2', role: 'EMPLOYEE' as Role, password: 'lucas762' },
    { name: 'sidao', role: 'EMPLOYEE' as Role, password: 'charlesbravo@123' },
    { name: 'Gisele Vieira', role: 'EMPLOYEE' as Role, password: 'Plugsales2026' },
    { name: 'Joyce Vieira', role: 'EMPLOYEE' as Role, password: 'Plugsales2026' },
    { name: 'Thiago Rocha', role: 'EMPLOYEE' as Role, password: 'Plugsales2026' },
    { name: 'manoelflow', role: 'ASSINATURA_BASICA' as Role, password: 'flow2026manoel!br' },
];

import { dbService } from '../services/dbService';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('auth_user');
        return saved ? JSON.parse(saved) : null;
    });

    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        return (localStorage.getItem('app_theme') as 'dark' | 'light') || 'dark';
    });

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        localStorage.setItem('app_theme', next);
    };

    const reSyncStaticUser = async (userName: string) => {
        const foundStatic = VALID_USERS.find(u => u.name.toLowerCase() === userName.toLowerCase());
        if (!foundStatic) return;

        try {
            const dbRes = await dbService.register({
                name: foundStatic.name,
                email: `${foundStatic.name.toLowerCase().replace(/\s+/g, '.')}@plugsales.com.br`,
                phone: '0000000000',
                password: foundStatic.password,
                role: foundStatic.role
            });
            const finalUser = dbRes && !dbRes.error ? dbRes : (await dbService.login({ email: `${foundStatic.name.toLowerCase()}@internal.system`, password: foundStatic.password }));
            const userObj = finalUser?.user || finalUser;

            if (userObj && userObj.id) {
                console.log(`Auto-repair success for ${userName}, ID: ${userObj.id}`);
                setUser(userObj);
                localStorage.setItem('auth_user', JSON.stringify(userObj));
            }
        } catch (err) {
            console.error("Auto-repair error:", err);
        }
    };

    // Initial loading effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1200); // 1.2s splash duration
        return () => clearTimeout(timer);
    }, []);

    // Use an effect to auto-repair sessions missing an ID
    useEffect(() => {
        if (user && !user.id) {
            console.log(`Auto-repairing session for ${user.name}...`);
            reSyncStaticUser(user.name);
        }
    }, [user?.id]);

    const login = async (username: string, password: string): Promise<boolean> => {
        // Try static login first (Internal Team)
        const foundStatic = VALID_USERS.find(u =>
            u.name.toLowerCase() === username.toLowerCase() && u.password === password
        );

        if (foundStatic) {
            // Ensure static user exists in DB to have an ID and persistent settings
            try {
                // We use a special register/login flow for static team members
                const dbRes = await dbService.register({
                    name: foundStatic.name,
                    email: `${foundStatic.name.toLowerCase()}@internal.system`,
                    phone: '0000000000',
                    password: foundStatic.password,
                    role: foundStatic.role
                });

                // If already exists, result will have error or user. DB register returns the user object directly.
                // If register failed (likely user exists), we try to login
                const finalUser = dbRes && !dbRes.error ? dbRes : (await dbService.login({ email: `${foundStatic.name.toLowerCase()}@internal.system`, password: foundStatic.password }));

                // In current dbService, login returns the user object directly, not wrapped in {user: ...}
                const userObj = finalUser?.user || finalUser;

                if (userObj && userObj.id) {
                    console.log(`Sync success for ${foundStatic.name}, ID: ${userObj.id}`);
                    setUser(userObj);
                    localStorage.setItem('auth_user', JSON.stringify(userObj));
                    return true;
                } else {
                    console.warn(`Sync failed for ${foundStatic.name}: No ID returned from DB. DB Res:`, finalUser);
                }
            } catch (err) {
                console.error("Static sync error:", err);
            }

            // Absolute Fallback: This might lack an ID, causing profile update issues
            const userData: User = {
                name: foundStatic.name,
                role: foundStatic.role as Role,
                email: `${foundStatic.name.toLowerCase()}@internal.system`
            };
            setUser(userData);
            localStorage.setItem('auth_user', JSON.stringify(userData));
            return true;
        }

        // Try API login (Clients)
        const result = await dbService.login({ email: username, password });
        if (result && !result.error) {
            setUser(result);
            localStorage.setItem('auth_user', JSON.stringify(result));
            return true;
        }

        return false;
    };

    const register = async (userData: any): Promise<boolean> => {
        const result = await dbService.register(userData);
        if (result && !result.error) {
            setUser(result);
            localStorage.setItem('auth_user', JSON.stringify(result));
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('auth_user');
    };

    const handleSetUser = (u: User | null) => {
        setUser(u);
        if (u) localStorage.setItem('auth_user', JSON.stringify(u));
        else localStorage.removeItem('auth_user');
    };

    return (
        <AuthContext.Provider value={{
            user, login, register, logout, setUser: handleSetUser,
            theme, toggleTheme, isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
