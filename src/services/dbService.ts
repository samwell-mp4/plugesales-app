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
};
