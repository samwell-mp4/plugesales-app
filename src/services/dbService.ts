import { Capacitor } from '@capacitor/core';

// Detecta se está rodando em dispositivo nativo (iOS/Android) ou web
const API_BASE = Capacitor.isNativePlatform() 
    ? 'https://seu-dominio-producao.com/api' // FIXME: Substitua pelo URL real do seu servidor de produção
    : '/api';

export const dbService = {
    // --- Settings ---
    getSettings: async (role?: string): Promise<Record<string, string>> => {
        try {
            const url = role ? `${API_BASE}/settings?role=${role}` : `${API_BASE}/settings`;
            const res = await fetch(url);
            if (!res.ok) return {};
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching settings:", err);
            return {};
        }
    },
    saveSetting: async (key: string, value: string, role?: string) => {
        try {
            await fetch(`${API_BASE}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value, role })
            });
        } catch (err: any) {
            console.error("Error saving setting:", err);
        }
    },

    // --- Audit Logs ---
    getLogs: async (type?: string, userId?: number) => {
        try {
            const params = new URLSearchParams();
            if (type) params.append('type', type);
            if (userId) params.append('userId', userId.toString());
            const url = `${API_BASE}/logs?${params.toString()}`;
            const res = await fetch(url);
            if (!res.ok) return [];
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching logs:", err);
            return [];
        }
    },
    addLog: async (logData: {
        logType: string;
        author?: string;
        name?: string;
        template?: string;
        mode?: string;
        total?: number;
        success?: number;
        transmissionId?: string;
        campaignName?: string;
        stepIndex?: number;
        userId?: number;
    }) => {
        try {
            await fetch(`${API_BASE}/logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logData)
            });
        } catch (err: any) {
            console.error("Error adding log:", err);
        }
    },

    // --- Client Reports ---
    getReports: async (userId?: number, submissionId?: number) => {
        try {
            let url = `${API_BASE}/reports?`;
            if (userId) url += `userId=${userId}&`;
            if (submissionId) url += `submissionId=${submissionId}&`;
            const res = await fetch(url);
            if (!res.ok) return [];
            return await res.json();
        } catch (err) { return []; }
    },
    getReportById: async (id: number) => {
        try {
            const res = await fetch(`${API_BASE}/reports/${id}`);
            if (!res.ok) return null;
            return await res.json();
        } catch (err) { return null; }
    },
    getReportDetails: async (id: number) => {
        try {
            const res = await fetch(`${API_BASE}/reports/${id}/details`);
            if (!res.ok) return null;
            return await res.json();
        } catch (err) { return null; }
    },
    addReport: async (reportData: { userId: number; submissionId?: number; reportName: string; filename: string; data: any[]; summary: any }) => {
        try {
            const res = await fetch(`${API_BASE}/reports`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reportData)
            });
            return await res.json();
        } catch (err) { return { error: err }; }
    },
    deleteReport: async (id: number) => {
        try {
            const res = await fetch(`${API_BASE}/reports/${id}`, { method: 'DELETE' });
            return await res.json();
        } catch (err) { return { error: err }; }
    },
    deleteReportsBySubmissionId: async (submissionId: number) => {
        try {
            const res = await fetch(`${API_BASE}/reports/submission/${submissionId}`, { method: 'DELETE' });
            return await res.json();
        } catch (err) { return { error: err }; }
    },

    // --- Media Library ---
    getMedia: async (page?: number, limit?: number, search?: string) => {
        try {
            const params = new URLSearchParams();
            if (page) params.append('page', page.toString());
            if (limit) params.append('limit', limit.toString());
            if (search) params.append('search', search);
            
            const url = params.toString() ? `${API_BASE}/media?${params.toString()}` : `${API_BASE}/media`;
            const res = await fetch(url);
            if (!res.ok) return page ? { media: [], total: 0 } : [];
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching media:", err);
            return page ? { media: [], total: 0 } : [];
        }
    },
    deleteMedia: async (id: number) => {
        try {
            await fetch(`${API_BASE}/media/${id}`, { method: 'DELETE' });
        } catch (err: any) {
            console.error("Error deleting media:", err);
        }
    },

    // --- Upload History ---
    getUploadHistory: async () => {
        try {
            const res = await fetch(`${API_BASE}/upload-history`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching upload history:", err);
            return [];
        }
    },
    addUploadHistory: async (item: { tag: string; count: number; validator?: string; creator?: string; status?: string }) => {
        try {
            const res = await fetch(`${API_BASE}/upload-history`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            });
            return await res.json();
        } catch (err: any) {
            console.error("Error adding upload history:", err);
            return null;
        }
    },
    deleteUploadHistory: async (id: number) => {
        try {
            await fetch(`${API_BASE}/upload-history/${id}`, { method: 'DELETE' });
        } catch (err: any) {
            console.error("Error deleting upload history:", err);
        }
    },

    // --- Contacts Lists ---
    getContacts: async () => {
        try {
            const res = await fetch(`${API_BASE}/contacts`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching contacts:", err);
            return [];
        }
    },
    getContactsByTag: async (tag: string) => {
        try {
            const res = await fetch(`${API_BASE}/contacts/${encodeURIComponent(tag)}`);
            if (!res.ok) return null;
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching contacts by tag:", err);
            return null;
        }
    },
    saveContacts: async (tag: string, data: any[], count: number, validator?: string, creator?: string) => {
        try {
            const res = await fetch(`${API_BASE}/contacts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tag, data, count, validator, creator })
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                return { error: errorData.message || `Erro HTTP ${res.status}` };
            }
            return await res.json();
        } catch (err: any) {
            console.error("Error saving contacts:", err);
            return { error: err.message || "Erro de conexão ao salvar contatos" };
        }
    },
    deleteContacts: async (tag: string) => {
        try {
            await fetch(`${API_BASE}/contacts/${encodeURIComponent(tag)}`, { method: 'DELETE' });
        } catch (err: any) {
            console.error("Error deleting contacts:", err);
        }
    },

    // --- Campaigns ---
    getCampaigns: async () => {
        try {
            const res = await fetch(`${API_BASE}/campaigns`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching campaigns:", err);
            return [];
        }
    },
    getActiveCampaign: async () => {
        try {
            const res = await fetch(`${API_BASE}/campaigns/active`);
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching active campaign:", err);
            return null;
        }
    },
    saveCampaign: async (name: string, steps: any[]) => {
        try {
            const res = await fetch(`${API_BASE}/campaigns`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, steps })
            });
            return await res.json();
        } catch (err: any) {
            console.error("Error saving campaign:", err);
            return null;
        }
    },

    // --- Engine Logs ---
    getEngineLogs: async () => {
        try {
            const res = await fetch(`${API_BASE}/engine-logs`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching engine logs:", err);
            return [];
        }
    },
    addEngineLog: async (logData: {
        transmissionId: string;
        logType: string;
        waba: string;
        recipient?: string;
        message: string;
        payload?: any;
    }) => {
        try {
            await fetch(`${API_BASE}/engine-logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logData)
            });
        } catch (err: any) {
            console.error("Error adding engine log:", err);
        }
    },
    clearEngineLogs: async () => {
        try {
            await fetch(`${API_BASE}/engine-logs`, { method: 'DELETE' });
        } catch (err: any) {
            console.error("Error clearing engine logs:", err);
        }
    },

    // --- Engine Stats (Redis) ---
    getEngineStats: async () => {
        try {
            const res = await fetch(`${API_BASE}/engine-stats`);
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching engine stats:", err);
            return { success: 0, error: 0 };
        }
    },
    saveEngineStats: async (success: number, error: number) => {
        try {
            await fetch(`${API_BASE}/engine-stats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ success, error })
            });
        } catch (err: any) {
            console.error("Error saving engine stats:", err);
        }
    },

    // --- Planner Drafts ---
    getPlannerDrafts: async () => {
        try {
            const res = await fetch(`${API_BASE}/planner-drafts`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching planner drafts:", err);
            return [];
        }
    },
    addPlannerDraft: async (draftData: any) => {
        try {
            await fetch(`${API_BASE}/planner-drafts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(draftData)
            });
        } catch (err: any) {
            console.error("Error adding planner draft:", err);
        }
    },
    clearPlannerDrafts: async () => {
        try {
            await fetch(`${API_BASE}/planner-drafts`, { method: 'DELETE' });
        } catch (err: any) {
            console.error("Error clearing planner drafts:", err);
        }
    },

    // --- Dispatch Queue (Redis) ---
    enqueueDispatch: async (messages: any[]) => {
        try {
            const res = await fetch(`${API_BASE}/dispatch/queue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages })
            });
            return await res.json();
        } catch (err: any) {
            console.error("Error enqueuing dispatch:", err);
            return { success: false, error: err.message };
        }
    },
    getDispatchQueueStatus: async () => {
        try {
            const res = await fetch(`${API_BASE}/dispatch/queue/status`);
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching queue status:", err);
            return { queueLength: 0, isRunning: false, processed: 0 };
        }
    },
    // --- Client Submissions ---
    getClientSubmissions: async () => {
        try {
            const res = await fetch(`${API_BASE}/client-submissions`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching client submissions:", err);
            return [];
        }
    },
    getClients: async () => {
        try {
            const res = await fetch(`${API_BASE}/clients`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching clients:", err);
            return [];
        }
    },
    getClientSubmissionById: async (id: number) => {
        try {
            const res = await fetch(`${API_BASE}/client-submissions/${id}`);
            if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching client submission:", err);
            return null;
        }
    },
    addClientSubmission: async (data: any) => {
        try {
            const res = await fetch(`${API_BASE}/client-submissions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (err: any) {
            console.error("Error adding client submission:", err);
            return null;
        }
    },
    bulkAddClientSubmissions: async (submissions: any[]) => {
        try {
            const res = await fetch(`${API_BASE}/client-submissions/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ submissions })
            });
            return await res.json();
        } catch (err: any) {
            console.error("Error bulk adding client submissions:", err);
            return null;
        }
    },
    deleteClientSubmission: async (id: number) => {
        try {
            await fetch(`${API_BASE}/client-submissions/${id}`, { method: 'DELETE' });
        } catch (err: any) {
            console.error("Error deleting client submission:", err);
        }
    },
    updateClientSubmission: async (id: number, data: any) => {
        try {
            const res = await fetch(`${API_BASE}/client-submissions/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (err: any) {
            console.error("Error updating client submission:", err);
            return null;
        }
    },
    updateClientSubmissionStatus: async (id: number, status?: string, assignedTo?: string) => {
        try {
            const body: any = {};
            if (status) body.status = status;
            if (assignedTo) body.assigned_to = assignedTo;
            await fetch(`${API_BASE}/client-submissions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
        } catch (err: any) {
            console.error("Error updating client submission status:", err);
        }
    },
    // --- Auth ---
    register: async (userData: any) => {
        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            return await res.json();
        } catch (err: any) {
            console.error("Error registering user:", err);
            return { error: err.message };
        }
    },
    login: async (credentials: any) => {
        try {
            // credentials can be { email, password }
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            if (!res.ok) {
                const errorData = await res.json();
                return { error: errorData.error || 'Login failed' };
            }
            return await res.json();
        } catch (err: any) {
            console.error("Error logging in:", err);
            return { error: err.message };
        }
    },
    updateProfile: async (userData: any) => {
        try {
            const res = await fetch(`${API_BASE}/auth/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            return await res.json();
        } catch (err: any) {
            console.error("Error updating profile:", err);
            return { error: err.message };
        }
    },
    getClientSubmissionsByUserId: async (userId: number) => {
        try {
            const res = await fetch(`${API_BASE}/client/submissions?userId=${userId}`);
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching client submissions by individual:", err);
            return [];
        }
    },

    // --- Forum & Community ---
    getBlogComments: async (postSlug: string) => {
        try {
            const res = await fetch(`${API_BASE}/blog/comments?slug=${postSlug}`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err) { return []; }
    },
    addBlogComment: async (commentData: { postSlug: string; userId: number; userName: string; text: string }) => {
        try {
            const res = await fetch(`${API_BASE}/blog/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(commentData)
            });
            return await res.json();
        } catch (err) { return { error: err }; }
    },
    likeBlogComment: async (commentId: number, userId: number) => {
        try {
            const res = await fetch(`${API_BASE}/blog/comments/${commentId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            return await res.json();
        } catch (err) { return { error: err }; }
    },
    updateForumProfile: async (userId: number, data: any) => {
        try {
            const res = await fetch(`${API_BASE}/forum/profile/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (err) { return { error: err }; }
    },
    getForumUserComments: async (userId: number) => {
        try {
            const res = await fetch(`${API_BASE}/forum/user/${userId}/comments`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err) { return []; }
    },

    // --- Link Shortener ---
    createShortLink: async (data: { user_id?: number; client_id?: number; target_user_id?: number; original_url?: string; title?: string; links?: any[] }) => {
        try {
            const res = await fetch(`${API_BASE}/shortener/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (err: any) {
            console.error("Error creating short link:", err);
            return { error: err.message };
        }
    },
    getShortLinks: async (role?: string, user_id?: number, startDate?: string, endDate?: string, page: number = 1, limit: number = 20, search?: string) => {
        try {
            const params = new URLSearchParams();
            if (role) params.append('role', role);
            if (user_id) params.append('user_id', user_id.toString());
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            params.append('page', page.toString());
            params.append('limit', limit.toString());
            if (search) params.append('search', search);
            
            const res = await fetch(`${API_BASE}/shortener/links?${params.toString()}`);
            if (!res.ok) throw new Error("Erro ao buscar links");
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching links:", err);
            return { links: [], totalCount: 0, totalPages: 0, currentPage: 1 };
        }
    },
    getEmployees: async (): Promise<string[]> => {
        try {
            const res = await fetch(`${API_BASE}/employees`);
            if (!res.ok) throw new Error("Erro ao buscar funcionários");
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching employees:", err);
            return ['Italo Clovis', 'Augusto Fagundes', 'Otávio Augusto', 'Lucas', 'Geraldo', 'Ricardo Willer', 'Gisele Vieira', 'Joyce Vieira', 'Thiago Rocha', 'Bernardo Rodrigues', 'Bernado Rodrigues']; // Fallback
        }
    },
    getLinkStats: async (id: number) => {
        try {
            const res = await fetch(`${API_BASE}/shortener/stats/${id}`);
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching link stats:", err);
            return null;
        }
    },
    getAllLinkStats: async (userId?: number | null, startDate?: string, endDate?: string) => {
        try {
            const params = new URLSearchParams();
            if (userId) params.append('user_id', userId.toString());
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            
            const res = await fetch(`${API_BASE}/shortener/stats/all?${params.toString()}`);
            if (!res.ok) throw new Error("Erro ao buscar estatísticas agregadas");
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching aggregated link stats:", err);
            return null;
        }
    },
    deleteShortLink: async (id: number) => {
        try {
            await fetch(`${API_BASE}/shortener/${id}`, { method: 'DELETE' });
        } catch (err: any) {
            console.error("Error deleting short link:", err);
        }
    },
    updateShortLink: async (id: number, data: any) => {
        try {
            const res = await fetch(`${API_BASE}/shortener/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Erro ao atualizar link");
            return await res.json();
        } catch (err: any) {
            console.error("Error updating short link:", err);
            return { error: err.message };
        }
    },
    bulkDeleteShortLinks: async (ids: number[]) => {
        try {
            const res = await fetch(`${API_BASE}/shortener/bulk-delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids })
            });
            return await res.json();
        } catch (err: any) {
            console.error("Error bulk deleting short links:", err);
            return { error: err.message };
        }
    },
    bulkAssociateShortLinks: async (ids: number[], targetUserId: number | null) => {
        try {
            const res = await fetch(`${API_BASE}/shortener/bulk-associate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids, target_user_id: targetUserId })
            });
            return await res.json();
        } catch (err: any) {
            console.error("Error bulk associating short links:", err);
            return { error: err.message };
        }
    },
    getTrackerStatus: async (userId?: number, role?: string) => {
        try {
            const params = new URLSearchParams();
            if (userId) params.append('user_id', userId.toString());
            if (role) params.append('role', role);
            const res = await fetch(`${API_BASE}/shortener/tracker/status?${params.toString()}`);
            if (!res.ok) throw new Error("Erro ao buscar status do rastreador");
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching tracker status:", err);
            return [];
        }
    },
    toggleLinkTracking: async (id: number, enabled: boolean) => {
        try {
            const res = await fetch(`${API_BASE}/shortener/tracker/toggle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, enabled })
            });
            if (!res.ok) throw new Error("Erro ao alterar status de rastreamento");
            return await res.json();
        } catch (err: any) {
            console.error("Error toggling link tracking:", err);
            return { error: err.message };
        }
    },
    checkLinkRedirection: async (id?: number, userId?: number, role?: string) => {
        try {
            const res = await fetch(`${API_BASE}/shortener/tracker/check`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, user_id: userId, role })
            });
            if (!res.ok) throw new Error("Erro ao forçar checagem de link");
            return await res.json();
        } catch (err: any) {
            console.error("Error checking link redirection:", err);
            return { error: err.message };
        }
    },
    getTrackerScanProgress: async () => {
        try {
            const res = await fetch(`${API_BASE}/shortener/tracker/scan-progress`);
            if (!res.ok) throw new Error("Erro ao buscar progresso do escaneamento");
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching scan progress:", err);
            return null;
        }
    },
    // --- PRO Rotator ---
    getProLinks: async (userId: number, role?: string) => {
        try {
            const params = new URLSearchParams();
            if (userId) params.append('user_id', userId.toString());
            if (role) params.append('role', role);
            const res = await fetch(`${API_BASE}/pro-links?${params.toString()}`);
            if (!res.ok) throw new Error("Erro ao buscar rotacionadores");
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching pro links:", err);
            return [];
        }
    },
    createProLink: async (data: { user_id: number; title: string; slug?: string; targets: any[]; client_id?: number | null }) => {
        try {
            const res = await fetch(`${API_BASE}/pro-links`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Erro ao criar rotacionador");
            }
            return await res.json();
        } catch (err: any) {
            console.error("Error creating pro link:", err);
            return { error: err.message };
        }
    },
    deleteProLink: async (id: number) => {
        try {
            const res = await fetch(`${API_BASE}/pro-links/${id}`, { method: 'DELETE' });
            return await res.json();
        } catch (err: any) {
            console.error("Error deleting pro link:", err);
            return { error: err.message };
        }
    },
    updateProLink: async (id: number, data: { title?: string; slug?: string; targets?: any[]; client_id?: number | null }) => {
        try {
            const res = await fetch(`${API_BASE}/pro-links/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Erro ao atualizar rotacionador");
            }
            return await res.json();
        } catch (err: any) {
            console.error("Error updating pro link:", err);
            return { error: err.message };
        }
    },
    bulkDeleteProLinks: async (ids: number[]) => {
        try {
            const res = await fetch(`${API_BASE}/pro-links/bulk-delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids })
            });
            return await res.json();
        } catch (err: any) {
            console.error("Error bulk deleting pro links:", err);
            return { error: err.message };
        }
    },
    bulkAddTargetProLinks: async (ids: number[], target: { url: string; weight: number }) => {
        try {
            const res = await fetch(`${API_BASE}/pro-links/bulk-add-target`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids, target })
            });
            return await res.json();
        } catch (err: any) {
            console.error("Error bulk adding target to pro links:", err);
            return { error: err.message };
        }
    },
    bulkResetTargetsProLinks: async (ids: number[], target: { url: string; weight: number }) => {
        try {
            const res = await fetch(`${API_BASE}/pro-links/bulk-reset-targets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids, target })
            });
            return await res.json();
        } catch (err: any) {
            console.error("Error bulk resetting targets on pro links:", err);
            return { error: err.message };
        }
    },
    getProLinkStats: async (id: number) => {
        try {
            const res = await fetch(`${API_BASE}/pro-links/${id}/stats`);
            if (!res.ok) throw new Error("Erro ao buscar estatísticas do rotacionador");
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching pro link stats:", err);
            return null;
        }
    },
    trackTemplate: async (name: string, userId: number) => {
        try {
            await fetch(`${API_BASE}/templates/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, user_id: userId })
            });
        } catch (err: any) {
            console.error("Error tracking template:", err);
        }
    },
    getAllUsers: async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/users`);
            if (!res.ok) throw new Error("Erro ao buscar usuários");
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching users:", err);
            return [];
        }
    },
    deleteUser: async (id: number) => {
        try {
            const res = await fetch(`${API_BASE}/admin/users/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Erro ao excluir usuário no banco nativo.');
            }
            return await res.json();
        } catch (err: any) {
            console.error(err);
            return { error: err.message };
        }
    },
    adminUpdatePassword: async (userId: number, newPassword: string) => {
        try {
            const res = await fetch(`${API_BASE}/admin/update-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, newPassword })
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Erro ao atualizar senha");
            }
            return await res.json();
        } catch (err: any) {
            console.error("Error updating password:", err);
            return { error: err.message };
        }
    },

    // --- Employee Financial Management Area (Meu Perfil) ---
    getMyCompetence: async (userId: number, competence: string) => {
        try {
            const res = await fetch(`${API_BASE}/finance/my-competence?userId=${userId}&competence=${encodeURIComponent(competence)}`);
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Erro ao obter dados da competência.');
            }
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching my competence:", err);
            return { error: err.message };
        }
    },
    requestAdvance: async (data: { userId: number; competence: string; value: number; pix_key: string }) => {
        try {
            const res = await fetch(`${API_BASE}/finance/request-advance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Erro ao solicitar adiantamento.');
            }
            return await res.json();
        } catch (err: any) {
            console.error("Error requesting advance:", err);
            return { error: err.message };
        }
    },
    addManualAdvance: async (data: { userId: number; competence: string; value: number; justification?: string }) => {
        try {
            const res = await fetch(`${API_BASE}/finance/admin/manual-advance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Erro ao adicionar lançamento manual.');
            }
            return await res.json();
        } catch (err: any) {
            console.error("Error adding manual advance:", err);
            return { error: err.message };
        }
    },
    getMyRequests: async (userId: number) => {
        try {
            const res = await fetch(`${API_BASE}/finance/my-requests?userId=${userId}`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err) {
            console.error("Error fetching my requests:", err);
            return [];
        }
    },
    uploadNf: async (data: { userId: number; competence: string; nfUrl: string }) => {
        try {
            const res = await fetch(`${API_BASE}/finance/upload-nf`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Erro ao registrar Nota Fiscal.');
            }
            return await res.json();
        } catch (err: any) {
            console.error("Error uploading NF details:", err);
            return { error: err.message };
        }
    },
    getPendingRequests: async () => {
        try {
            const res = await fetch(`${API_BASE}/finance/admin/pending-requests`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err) {
            console.error("Error fetching pending requests:", err);
            return [];
        }
    },
    respondRequest: async (data: { requestId: number; status: 'Aprovado' | 'Rejeitado'; justification?: string }) => {
        try {
            const res = await fetch(`${API_BASE}/finance/admin/respond-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Erro ao responder à solicitação.');
            }
            return await res.json();
        } catch (err: any) {
            console.error("Error responding to request:", err);
            return { error: err.message };
        }
    },
    getCompetencesSpreadsheet: async (competence: string) => {
        try {
            const res = await fetch(`${API_BASE}/finance/admin/competences-spreadsheet?competence=${encodeURIComponent(competence)}`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err) {
            console.error("Error fetching competences spreadsheet:", err);
            return [];
        }
    },
    updateProfileReceivable: async (data: { userId: number; monthlyReceivable: number; pixKey?: string }) => {
        try {
            const res = await fetch(`${API_BASE}/finance/admin/update-profile-receivable`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Erro ao atualizar dados financeiros do perfil.');
            }
            return await res.json();
        } catch (err: any) {
            console.error("Error updating profile receivable:", err);
            return { error: err.message };
        }
    },

    getTeam: async () => {
        try {
            const res = await fetch(`${API_BASE}/users/team`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err) { return []; }
    },
    // --- CRM / Google Sheets ---
    getCRMLeads: async (userId?: number, responsavel?: string) => {
        try {
            const params = new URLSearchParams();
            if (userId) params.append('userId', userId.toString());
            if (responsavel) params.append('responsavel', responsavel);
            
            const url = `${API_BASE}/crm/leads?${params.toString()}`;
            const res = await fetch(url);
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Erro ao carregar dados da planilha.');
            }
            return await res.json();
        } catch (err: any) {
            console.error("CRM Service Error:", err);
            throw err;
        }
    },
    addCRMLead: async (data: any) => {
        try {
            const res = await fetch(`${API_BASE}/crm/leads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Erro ao adicionar lead no Supabase.');
            return result;
        } catch (err: any) {
            console.error("CRM Add Error:", err);
            throw err;
        }
    },
    updateCRMLead: async (id: string | number, data: any, userId?: number) => {
        try {
            const url = userId ? `${API_BASE}/crm/leads/${id}?userId=${userId}` : `${API_BASE}/crm/leads/${id}`;
            const res = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Erro ao atualizar lead no Supabase.');
            }
            return await res.json();
        } catch (err: any) {
            console.error("CRM Update Error:", err);
            throw err;
        }
    },
    deleteCRMLead: async (id: string | number) => {
        try {
            const res = await fetch(`${API_BASE}/crm/leads/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Erro ao excluir lead.');
            return await res.json();
        } catch (err: any) {
            console.error("CRM Delete Error:", err);
            throw err;
        }
    },
    migrateCRM: async () => {
        try {
            const res = await fetch(`${API_BASE}/crm/migrate`, { method: 'POST' });
            if (!res.ok) throw new Error('Falha na migração.');
            return await res.json();
        } catch (err: any) {
            console.error("Migration Error:", err);
            throw err;
        }
    },
    getCRMLogs: async (limit: number = 100) => {
        try {
            const res = await fetch(`${API_BASE}/crm/logs?limit=${limit}`);
            if (!res.ok) throw new Error('Erro ao buscar logs.');
            return await res.json();
        } catch (err: any) {
            console.error("CRM Logs Error:", err);
            return [];
        }
    },

    // --- Notifications ---
    getNotifications: async (userId: number) => {
        try {
            const res = await fetch(`${API_BASE}/notifications?user_id=${userId}`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err) {
            console.error("Error fetching notifications:", err);
            return [];
        }
    },
    markNotificationAsRead: async (id: number) => {
        try {
            const res = await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PATCH' });
            return await res.json();
        } catch (err) {
            console.error("Error marking notification as read:", err);
            return null;
        }
    },
    clearAllNotifications: async (userId: number) => {
        try {
            const res = await fetch(`${API_BASE}/notifications/clear-all`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId })
            });
            return await res.json();
        } catch (err) {
            console.error("Error clearing notifications:", err);
            return null;
        }
    },
    addNotification: async (data: { user_id: number; title: string; message: string; type: 'success' | 'warning' | 'info' | 'alert' }) => {
        try {
            const res = await fetch(`${API_BASE}/notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (err) {
            console.error("Error adding notification:", err);
            return null;
        }
    },
    notifyAdmins: async (title: string, message: string, type: 'info' | 'warning' | 'alert' | 'success' = 'info') => {
        try {
            // Get internal team
            const team = await fetch(`${API_BASE}/users/team`).then(r => r.json());
            const notifications = team.map((member: any) => ({
                user_id: member.id,
                title,
                message,
                type
            }));

            // Bulk add (the backend might support this or we do it one by one)
            // For simplicity in this env, we'll do one by one or assume a bulk endpoint exists
            // Since I don't see a bulk endpoint, I'll do a Promise.all
            await Promise.all(notifications.map((n: any) => 
                fetch(`${API_BASE}/notifications`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(n)
                })
            ));
            return { success: true };
        } catch (err) {
            console.error("Error notifying admins:", err);
            return { error: err };
        }
    },
    // --- GESTÃO CONSULTIVA ---
    getConsultativeActions: async (responsavel?: string) => {
        try {
            const params = new URLSearchParams();
            if (responsavel) params.append('responsavel', responsavel);
            const res = await fetch(`${API_BASE}/crm/consultiva?${params.toString()}`);
            if (!res.ok) throw new Error('Erro ao carregar ações consultivas.');
            return await res.json();
        } catch (err: any) {
            console.error("Consultative Actions Fetch Error:", err);
            return [];
        }
    },
    addConsultativeAction: async (data: any) => {
        try {
            const res = await fetch(`${API_BASE}/crm/consultiva`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Erro ao adicionar ação consultiva.');
            return await res.json();
        } catch (err: any) {
            console.error("Consultative Action Add Error:", err);
            return null;
        }
    },
    updateConsultativeAction: async (id: string | number, data: any) => {
        try {
            const res = await fetch(`${API_BASE}/crm/consultiva/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Erro ao atualizar ação consultiva.');
            return await res.json();
        } catch (err: any) {
            console.error("Consultative Action Update Error:", err);
            return null;
        }
    },
    deleteConsultativeAction: async (id: string | number) => {
        try {
            const res = await fetch(`${API_BASE}/crm/consultiva/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Erro ao excluir ação consultiva.');
            return await res.json();
        } catch (err: any) {
            console.error("Consultative Action Delete Error:", err);
            return { error: err.message };
        }
    },
    debugDb: async () => {
        try {
            const res = await fetch(`${API_BASE}/debug/db`);
            return await res.json();
        } catch (err) { return { error: err }; }
    },
    // --- Step Leads ---
    addStepLead: async (data: any) => {
        try {
            const res = await fetch(`${API_BASE}/step-leads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (err) {
            console.error("Error adding step lead:", err);
            return null;
        }
    },
    getStepLeads: async () => {
        try {
            const res = await fetch(`${API_BASE}/step-leads`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err) {
            console.error("Error fetching step leads:", err);
            return [];
        }
    },
    deleteStepLead: async (id: number) => {
        try {
            await fetch(`${API_BASE}/step-leads/${id}`, { method: 'DELETE' });
        } catch (err) {
            console.error("Error deleting step lead:", err);
        }
    },
    // --- Client-for-Client (Sub-clients) ---
    getSubClients: async (parentUserId?: number, submissionId?: number, approvedOnly: boolean = false) => {
        try {
            const params = new URLSearchParams();
            if (parentUserId) params.append('parentUserId', parentUserId.toString());
            if (submissionId) params.append('submissionId', submissionId.toString());
            if (approvedOnly) params.append('approvedOnly', 'true');
            
            const res = await fetch(`${API_BASE}/client-for-client?${params.toString()}`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err) {
            console.error("Error fetching sub-clients:", err);
            return [];
        }
    },
    registerSubClient: async (parentUserId: number, submissionId: number | null, data: any) => {
        try {
            const res = await fetch(`${API_BASE}/client-for-client/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parentUserId, submissionId, data })
            });
            return await res.json();
        } catch (err) {
            console.error("Error registering sub-client:", err);
            return { error: err };
        }
    },
    approveSubClient: async (id: number, password?: string) => {
        try {
            const res = await fetch(`${API_BASE}/client-for-client/${id}/approve`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            return await res.json();
        } catch (err) {
            console.error("Error approving sub-client:", err);
            return { error: err };
        }
    },
    deleteSubClient: async (id: number) => {
        try {
            const res = await fetch(`${API_BASE}/client-for-client/${id}`, {
                method: 'DELETE'
            });
            return await res.json();
        } catch (err) {
            console.error("Error deleting sub-client:", err);
            return { error: err };
        }
    },
    // --- Auth Profile ---
    getCurrentUser: async (id: number) => {
        try {
            const res = await fetch(`${API_BASE}/auth/me/${id}`);
            if (!res.ok) return null;
            return await res.json();
        } catch (err) {
            console.error("Error fetching current user:", err);
            return null;
        }
    },
    // --- Campaign Approval ---
    parentApproveSubmission: async (id: number, approved: boolean, feedback?: string) => {
        try {
            const res = await fetch(`${API_BASE}/client-submissions/${id}/parent-approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approved, feedback })
            });
            return await res.json();
        } catch (err) {
            console.error("Error approving referral submission:", err);
            return { error: err };
        }
    },
    getReferralSubmissions: async (parentId: number) => {
        try {
            const res = await fetch(`${API_BASE}/referral-submissions/${parentId}`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err) {
            console.error("Error fetching referral submissions:", err);
            return [];
        }
    },
    // --- Plug Cards ---
    updatePlugCard: async (id: number, data: any) => {
        try {
            const res = await fetch(`${API_BASE}/plug-cards/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (err) {
            console.error("Error updating plug card:", err);
            return { error: err };
        }
    },
    createPlugCard: async (data: any) => {
        try {
            const res = await fetch(`${API_BASE}/plug-cards`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (err) {
            console.error("Error creating plug card:", err);
            return { error: err };
        }
    },
    validatePlugCard: async (userId: number, requiredVolume?: number, requiredChips?: number) => {
        try {
            const res = await fetch(`${API_BASE}/plug-cards/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, requiredVolume, requiredChips })
            });
            return await res.json();
        } catch (err) {
            console.error("Error validating plug card:", err);
            return { error: "Erro de conexão ao validar Plug Card." };
        }
    },
    consumePlugCardVolume: async (userId: number, volume: number) => {
        try {
            const res = await fetch(`${API_BASE}/plug-cards/consume`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, volume })
            });
            return await res.json();
        } catch (err) {
            console.error("Error consuming plug card volume:", err);
            return { error: "Erro ao descontar volume do Plug Card." };
        }
    },
    getUserPlugCards: async (userId: number) => {
        try {
            const res = await fetch(`${API_BASE}/plug-cards/wallet/${userId}`);
            return await res.json();
        } catch (err) {
            console.error("Error fetching user plug cards:", err);
            return [];
        }
    },
    buyPlugCard: async (data: any) => {
        try {
            const res = await fetch(`${API_BASE}/plug-cards/buy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (err) {
            console.error("Error buying plug card:", err);
            return { error: "Falha ao processar compra do Plug Card." };
        }
    },

    // --- Infobip Live Chat Proxy Methods ---
    resolveInfobipNumber: async (number: string, userId: number) => {
        const response = await fetch(`${API_BASE}/infobip/resolve-number/${number}?userId=${userId}`);
        return await response.json();
    },

    fetchInfobipMessages: async (threadId: string, userId: number) => {
        const response = await fetch(`${API_BASE}/infobip/conversations/${threadId}/messages?userId=${userId}`);
        return await response.json();
    },

    sendInfobipMessage: async (threadId: string, text: string, userId: number) => {
        const response = await fetch(`${API_BASE}/infobip/conversations/${threadId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, text })
        });
        return await response.json();
    },
    // --- Change Requests (Alerta) ---
    addChangeRequest: async (data: { submission_id: number; user_id: number; requested_data: any; original_data: any }) => {
        try {
            const res = await fetch(`${API_BASE}/change-requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (err: any) {
            console.error("Error adding change request:", err);
            return null;
        }
    },
    getChangeRequests: async () => {
        try {
            const res = await fetch(`${API_BASE}/change-requests`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching change requests:", err);
            return [];
        }
    },
    approveChangeRequest: async (id: number) => {
        try {
            const res = await fetch(`${API_BASE}/change-requests/${id}/approve`, { method: 'PATCH' });
            return await res.json();
        } catch (err: any) {
            console.error("Error approving change request:", err);
            return { error: err.message };
        }
    },
    rejectChangeRequest: async (id: number) => {
        try {
            const res = await fetch(`${API_BASE}/change-requests/${id}/reject`, { method: 'PATCH' });
            return await res.json();
        } catch (err: any) {
            console.error("Error rejecting change request:", err);
            return { error: err.message };
        }
    },
    // --- Webhooks Outsourcing ---
    sendMeetingWebhook: async (data: any) => {
        try {
            const webhookUrl = 'https://plug-sales-dispatch-app-n8n-2.hx8235.easypanel.host/webhook/email-sender';
            
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    timestamp: new Date().toISOString(),
                    source: 'Plug & Sales CRM'
                })
            });
            console.log("Webhook sent successfully to n8n");
        } catch (err) {
            console.error("Error sending meeting webhook:", err);
        }
    },

    // --- Google Sheets Live Chat ---
    fetchSpreadsheetMessages: async (remetente: string) => {
        try {
            const res = await fetch(`${API_BASE}/live-chat/spreadsheet?remetente=${encodeURIComponent(remetente)}`);
            if (!res.ok) throw new Error("Erro ao buscar mensagens da planilha");
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching spreadsheet messages:", err);
            return [];
        }
    },
    // --- Smart Bio ---
    getSmartBio: async (userId: number) => {
        try {
            const res = await fetch(`${API_BASE}/smart-bio?user_id=${userId}`);
            if (!res.ok) return null;
            return await res.json();
        } catch (err) { return null; }
    },
    saveSmartBio: async (data: any) => {
        try {
            const res = await fetch(`${API_BASE}/smart-bio`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (err) { return { error: err }; }
    },
    deleteSmartBio: async (id: string) => {
        try {
            const res = await fetch(`${API_BASE}/smart-bio/${id}`, { method: 'DELETE' });
            return await res.json();
        } catch (err) { return { error: err }; }
    },
    // --- Blog Posts ---
    getBlogPosts: async () => {
        try {
            const res = await fetch(`${API_BASE}/blog`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err) {
            console.error("Error fetching blog posts:", err);
            return [];
        }
    },
    saveBlogPost: async (postData: any) => {
        try {
            const res = await fetch(`${API_BASE}/blog`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
            });
            return await res.json();
        } catch (err) {
            console.error("Error saving blog post:", err);
            return { error: err };
        }
    },
    deleteBlogPost: async (id: number) => {
        try {
            const res = await fetch(`${API_BASE}/blog/${id}`, { method: 'DELETE' });
            return await res.json();
        } catch (err) {
            return { error: err };
        }
    },
    generateBlogPost: async (title: string, content: string) => {
        try {
            const res = await fetch(`${API_BASE}/blog/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });
            return await res.json();
        } catch (err) {
            return { error: err };
        }
    },
    // --- Finance Module ---
    getFinanceSales: async (params: any = {}) => {
        try {
            const searchParams = new URLSearchParams(params);
            const res = await fetch(`${API_BASE}/finance/sales?${searchParams.toString()}`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err) {
            console.error("Error fetching finance sales:", err);
            return [];
        }
    },
    // --- Commissions & Delivery Reports ---
    getDeliveryReports: async () => {
        try {
            const res = await fetch(`${API_BASE}/delivery-reports`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err) { return []; }
    },
    addDeliveryReport: async (data: any) => {
        try {
            const res = await fetch(`${API_BASE}/delivery-reports`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (err) { return { error: err }; }
    },
    getFinanceCommissions: async (params: any = {}) => {
        try {
            const searchParams = new URLSearchParams(params);
            const res = await fetch(`${API_BASE}/finance/commissions?${searchParams.toString()}`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err) { return []; }
    },
    updateFinanceCommission: async (id: number, data: any) => {
        try {
            const res = await fetch(`${API_BASE}/finance/commissions/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (err) { return { error: err }; }
    },
    saveFinanceSale: async (saleData: any) => {
        try {
            const method = saleData.id ? 'PUT' : 'POST';
            const url = saleData.id ? `${API_BASE}/finance/sales/${saleData.id}` : `${API_BASE}/finance/sales`;
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(saleData)
            });
            return await res.json();
        } catch (err) {
            console.error("Error saving finance sale:", err);
            return { error: err };
        }
    },
    deleteFinanceSale: async (id: number) => {
        try {
            const res = await fetch(`${API_BASE}/finance/sales/${id}`, { method: 'DELETE' });
            return await res.json();
        } catch (err) {
            console.error("Error deleting finance sale:", err);
            return { error: err };
        }
    },
    getClientBalance: async (clientName: string) => {
        try {
            const res = await fetch(`${API_BASE}/finance/sales/balance/${encodeURIComponent(clientName)}`);
            if (!res.ok) return 0;
            const data = await res.json();
            return data.balance || 0;
        } catch (err) {
            console.error("Error fetching client balance:", err);
            return 0;
        }
    },
    rolloverClientBalance: async (clientName: string, amount?: number) => {
        try {
            const res = await fetch(`${API_BASE}/finance/sales/rollover`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ client_name: clientName, amount })
            });
            return await res.json();
        } catch (err) {
            console.error("Error rolling over client balance:", err);
            return { error: err };
        }
    },
    getFinanceSalespeople: async () => {
        try {
            const res = await fetch(`${API_BASE}/finance/salespeople`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err) {
            console.error("Error fetching finance salespeople:", err);
            return [];
        }
    },
    saveSalespersonConfig: async (configData: any) => {
        try {
            const res = await fetch(`${API_BASE}/finance/salespeople/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(configData)
            });
            return await res.json();
        } catch (err) {
            console.error("Error saving salesperson config:", err);
            return { error: err };
        }
    },
    createClient: async (clientData: any) => {
        try {
            const res = await fetch(`${API_BASE}/admin/clients`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clientData)
            });
            return await res.json();
        } catch (err: any) {
            console.error("Error creating client:", err);
            return { error: err.message };
        }
    },
    getFinanceStats: async (userId?: number, role?: string) => {
        try {
            let url = `${API_BASE}/finance/stats?`;
            if (userId) url += `userId=${userId}&`;
            if (role) url += `role=${role}&`;
            const res = await fetch(url);
            if (!res.ok) return null;
            return await res.json();
        } catch (err) {
            console.error("Error fetching finance stats:", err);
            return null;
        }
    },
    // --- WhatsApp Template Batch ---
    createTemplateBatchJob: async (data: any) => {
        try {
            const res = await fetch(`${API_BASE}/template-batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (err: any) {
            console.error("Error creating template batch job:", err);
            return { error: err.message || "Erro ao conectar com servidor" };
        }
    },
    getTemplateBatchJobs: async (userId?: number) => {
        try {
            const url = userId ? `${API_BASE}/template-batch?user_id=${userId}` : `${API_BASE}/template-batch`;
            const res = await fetch(url);
            if (!res.ok) return [];
            return await res.json();
        } catch (err) {
            console.error("Error fetching template batch jobs:", err);
            return [];
        }
    },
    // --- Scheduled Template Edits ---
    scheduleTemplateEdit: async (data: any) => {
        try {
            const res = await fetch(`${API_BASE}/templates/schedule-edit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (err: any) {
            console.error("Error scheduling template edit:", err);
            return { error: err.message || "Erro de conexão ao agendar" };
        }
    },
    getScheduledTemplateEdits: async (userId?: number) => {
        try {
            const url = userId ? `${API_BASE}/templates/scheduled-edits?user_id=${userId}` : `${API_BASE}/templates/scheduled-edits`;
            const res = await fetch(url);
            if (!res.ok) return [];
            return await res.json();
        } catch (err) {
            console.error("Error fetching scheduled template edits:", err);
            return [];
        }
    },
    clearScheduledTemplateEdits: async () => {
        try {
            const res = await fetch(`${API_BASE}/templates/scheduled-edits/clear`, {
                method: 'POST'
            });
            return await res.json();
        } catch (err) {
            console.error("Error clearing scheduled edits:", err);
            return { error: "Erro de conexão ao limpar histórico" };
        }
    },
    deleteScheduledTemplateEdit: async (id: number) => {
        try {
            const res = await fetch(`${API_BASE}/templates/scheduled-edits/${id}`, {
                method: 'DELETE'
            });
            return await res.json();
        } catch (err: any) {
            console.error("Error deleting scheduled edit:", err);
            return { error: err.message || "Erro de conexão ao excluir" };
        }
    }
};
