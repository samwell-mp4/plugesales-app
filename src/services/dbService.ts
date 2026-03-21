const API_BASE = '/api';

export const dbService = {
    // --- Settings ---
    getSettings: async (): Promise<Record<string, string>> => {
        try {
            const res = await fetch(`${API_BASE}/settings`);
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching settings:", err);
            return {};
        }
    },
    saveSetting: async (key: string, value: string) => {
        try {
            await fetch(`${API_BASE}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value })
            });
        } catch (err: any) {
            console.error("Error saving setting:", err);
        }
    },

    // --- Audit Logs ---
    getLogs: async (type?: string) => {
        try {
            const url = type ? `${API_BASE}/logs?type=${type}` : `${API_BASE}/logs`;
            const res = await fetch(url);
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

    // --- Media Library ---
    getMedia: async () => {
        try {
            const res = await fetch(`${API_BASE}/media`);
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching media:", err);
            return [];
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
            await fetch(`${API_BASE}/contacts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tag, data, count, validator, creator })
            });
        } catch (err: any) {
            console.error("Error saving contacts:", err);
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
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching client submissions:", err);
            return [];
        }
    },
    getClients: async () => {
        try {
            const res = await fetch(`${API_BASE}/clients`);
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching clients:", err);
            return [];
        }
    },
    getClientSubmissionById: async (id: number) => {
        try {
            const res = await fetch(`${API_BASE}/client-submissions/${id}`);
            if (!res.ok) return null;
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
    updateClientSubmissionStatus: async (id: number, status: string) => {
        try {
            await fetch(`${API_BASE}/client-submissions/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
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

    // --- Link Shortener ---
    createShortLink: async (data: { user_id?: number; client_id?: number; original_url?: string; title?: string; links?: any[] }) => {
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
    getShortLinks: async (role?: string, user_id?: number) => {
        try {
            const params = new URLSearchParams();
            if (role) params.append('role', role);
            if (user_id) params.append('user_id', user_id.toString());
            
            const res = await fetch(`${API_BASE}/shortener/links?${params.toString()}`);
            if (!res.ok) throw new Error("Erro ao buscar links");
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching links:", err);
            return [];
        }
    },
    getEmployees: async (): Promise<string[]> => {
        try {
            const res = await fetch(`${API_BASE}/employees`);
            if (!res.ok) throw new Error("Erro ao buscar funcionários");
            return await res.json();
        } catch (err: any) {
            console.error("Error fetching employees:", err);
            return ['Italo', 'Augusto', 'Otavio', 'Lucas', 'Geraldo', 'Ricardo']; // Fallback
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
    deleteShortLink: async (id: number) => {
        try {
            await fetch(`${API_BASE}/shortener/${id}`, { method: 'DELETE' });
        } catch (err: any) {
            console.error("Error deleting short link:", err);
        }
    },
};
