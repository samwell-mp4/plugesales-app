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
            const interval = setInterval(loadNotifications, 30000);
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
            setNotifications(data || []);
            setUnreadCount((data || []).filter((n: Notification) => !n.is_read).length);
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
            case 'success': return <div style={{ background: 'rgba(172, 248, 0, 0.1)', padding: 8, borderRadius: 10, color: 'var(--primary-color)' }}><CheckCircle2 size={16} /></div>;
            case 'warning': return <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: 8, borderRadius: 10, color: '#eab308' }}><AlertCircle size={16} /></div>;
            case 'alert': return <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: 8, borderRadius: 10, color: '#ef4444' }}><AlertCircle size={16} /></div>;
            default: return <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: 8, borderRadius: 10, color: '#38bdf8' }}><Info size={16} /></div>;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`action-btn ${unreadCount > 0 ? '' : 'ghost-btn'}`}
                style={{ 
                    width: '44px', 
                    height: '44px', 
                    padding: 0, 
                    borderRadius: '14px',
                    position: 'relative'
                }}
            >
                <Bell size={20} className={unreadCount > 0 ? "animate-pulse" : "opacity-40"} />
                {unreadCount > 0 && (
                    <span style={{ 
                        position: 'absolute', 
                        top: '-4px', 
                        right: '-4px', 
                        minWidth: '20px', 
                        height: '20px', 
                        background: '#ef4444', 
                        color: 'white', 
                        fontSize: '9px', 
                        fontWeight: 950, 
                        borderRadius: '10px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        border: '2px solid #000',
                        boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="notification-card-dropdown absolute top-full right-0 mt-4 w-96 z-[1000] overflow-hidden animate-fade-in">
                    <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                        <div>
                            <div className="field-label" style={{ fontSize: '9px', marginBottom: '2px' }}>HUB DE AVISOS</div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 950, letterSpacing: '-0.5px' }}>Notificações</h3>
                        </div>
                        {unreadCount > 0 && (
                            <button 
                                onClick={clearAll}
                                className="action-btn ghost-btn"
                                style={{ height: '32px', fontSize: '10px', padding: '0 16px', borderRadius: '12px' }}
                            >
                                LIMPAR TUDO
                            </button>
                        )}
                    </div>

                    <div style={{ maxHeight: '420px', overflowY: 'auto' }} className="custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div style={{ padding: '80px 40px', textAlign: 'center' }}>
                                <Bell size={48} style={{ opacity: 0.05, marginBottom: '20px' }} />
                                <h4 style={{ opacity: 0.2, fontWeight: 950, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Ambiente em Silêncio</h4>
                                <p style={{ opacity: 0.1, fontSize: '10px', marginTop: '4px' }}>Nenhum alerta pendente no momento.</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div 
                                    key={notification.id}
                                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                                    className={`notification-item-premium ${!notification.is_read ? 'unread' : ''}`}
                                    style={{ cursor: 'pointer', opacity: notification.is_read ? 0.6 : 1 }}
                                >
                                    <div className="flex gap-4">
                                        <div style={{ flexShrink: 0 }}>{getIcon(notification.type)}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 950, letterSpacing: '-0.2px' }}>{notification.title}</h4>
                                                <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Clock size={10} /> {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, lineHeight: 1.5 }}>
                                                {notification.message}
                                            </p>
                                        </div>
                                        {!notification.is_read && (
                                            <div style={{ flexShrink: 0, width: '6px', display: 'flex', alignItems: 'center' }}>
                                                <div className="notification-badge-dot" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div style={{ padding: '16px', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="field-label"
                            style={{ margin: 0, cursor: 'pointer', border: 'none', background: 'none', opacity: 0.3 }}
                        >
                            FECHAR CENTRAL
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
