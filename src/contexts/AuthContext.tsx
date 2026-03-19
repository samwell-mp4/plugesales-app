import React, { createContext, useContext, useState } from 'react';

type Role = 'ADMIN' | 'EMPLOYEE' | 'CLIENT';

interface User {
    id?: number;
    name: string;
    email?: string;
    phone?: string;
    role: Role;
}

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<boolean>;
    register: (userData: any) => Promise<boolean>;
    logout: () => void;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Lista de usuários pré-definida conforme solicitado
const VALID_USERS = [
    { name: 'Admin', role: 'ADMIN' as Role, password: 'admin123' },
    { name: 'Italo', role: 'EMPLOYEE' as Role, password: 'italo982' },
    { name: 'Augusto', role: 'EMPLOYEE' as Role, password: 'augusto451' },
    { name: 'Otavio', role: 'EMPLOYEE' as Role, password: 'otavio319' },
    { name: 'Lucas', role: 'EMPLOYEE' as Role, password: 'lucas762' },
    { name: 'Geraldo', role: 'EMPLOYEE' as Role, password: 'geraldo104' },
    { name: 'Ricardo', role: 'EMPLOYEE' as Role, password: 'ricardo883' },
];

import { dbService } from '../services/dbService';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('auth_user');
        return saved ? JSON.parse(saved) : null;
    });

    const login = async (username: string, password: string): Promise<boolean> => {
        // Try static login first (Internal Team)
        const foundStatic = VALID_USERS.find(u => 
            u.name.toLowerCase() === username.toLowerCase() && u.password === password
        );
        
        if (foundStatic) {
            const userData = { name: foundStatic.name, role: foundStatic.role as Role };
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
        <AuthContext.Provider value={{ user, login, register, logout, setUser: handleSetUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
