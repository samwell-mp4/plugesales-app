import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, Clock, AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'success' | 'warning' | 'info' | 'alert';
    is_read: boolean;
    created_at: string;
}

const NotificationCenter = () => {
    const { user } = useAuth() as any;
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user?.id) {
            loadNotifications();
            const interval = setInterval(loadNotifications, 30000); // Poll every 30s
            return () => clearInterval(interval);
        }
    }, [user?.id]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadNotifications = async () => {
        try {
            const data = await dbService.getNotifications(user.id);
            setNotifications(data);
            setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
        } catch (err) {
            console.error("Failed to load notifications:", err);
        }
    };

    const markAsRead = async (id: number) => {
        await dbService.markNotificationAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const clearAll = async () => {
        if (!window.confirm('Marcar todas como lidas?')) return;
        await dbService.clearAllNotifications(user.id);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle2 size={16} className="text-primary-color" />;
            case 'warning': return <AlertCircle size={16} className="text-yellow-500" />;
            case 'alert': return <AlertCircle size={16} className="text-red-500" />;
            default: return <Info size={16} className="text-blue-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
            >
                <Bell size={20} className={unreadCount > 0 ? "text-primary-color animate-pulse" : "text-white/40 group-hover:text-white"} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#0a0a0a]">
                        {unreadCount > 9 ? '+9' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-3 w-80 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl z-[1000] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-bottom border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <h3 className="text-xs font-black uppercase tracking-widest text-white/60">Notificações</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={clearAll}
                                className="text-[9px] font-black text-primary-color hover:underline uppercase"
                            >
                                Limpar Tudo
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell size={32} className="mx-auto mb-3 opacity-10" />
                                <p className="text-[11px] font-bold text-white/30 uppercase tracking-wider">Nenhuma notificação</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div 
                                    key={notification.id}
                                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                                    className={`p-4 border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer relative group ${!notification.is_read ? 'bg-primary-color/[0.02]' : 'opacity-60'}`}
                                >
                                    <div className="flex gap-3">
                                        <div className="mt-1">{getIcon(notification.type)}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="text-xs font-bold text-white">{notification.title}</h4>
                                                <span className="text-[9px] text-white/20 font-bold flex items-center gap-1">
                                                    <Clock size={8} /> {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-white/50 leading-relaxed">{notification.message}</p>
                                        </div>
                                    </div>
                                    {!notification.is_read && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary-color rounded-full shadow-[0_0_8px_var(--primary-color)]" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-3 bg-white/[0.01] text-center border-t border-white/5">
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="text-[10px] font-bold text-white/20 hover:text-white transition-colors"
                        >
                            FECHAR
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
