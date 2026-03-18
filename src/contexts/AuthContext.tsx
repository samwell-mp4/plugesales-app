import React, { createContext, useContext, useState } from 'react';

type Role = 'ADMIN' | 'EMPLOYEE';

interface User {
    name: string;
    role: Role;
}

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => boolean;
    logout: () => void;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('auth_user');
        return saved ? JSON.parse(saved) : null;
    });

    const login = (username: string, password: string): boolean => {
        const found = VALID_USERS.find(u => 
            u.name.toLowerCase() === username.toLowerCase() && u.password === password
        );
        
        if (found) {
            const userData = { name: found.name, role: found.role };
            setUser(userData);
            localStorage.setItem('auth_user', JSON.stringify(userData));
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('auth_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
