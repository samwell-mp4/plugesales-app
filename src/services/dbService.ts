const API_BASE = '/api';

export const dbService = {
    // --- Settings ---
    getSettings: async (): Promise<Record<string, string>> => {
        try {
            const res = await fetch(`${API_BASE}/settings`);
            if (!res.ok) return {};
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

    // --- Media Library ---
    getMedia: async () => {
        try {
            const res = await fetch(`${API_BASE}/media`);
            if (!res.ok) return [];
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
    getShortLinks: async (role?: string, user_id?: number, startDate?: string, endDate?: string) => {
        try {
            const params = new URLSearchParams();
            if (role) params.append('role', role);
            if (user_id) params.append('user_id', user_id.toString());
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            
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
    getAllLinkStats: async (userId: number, startDate?: string, endDate?: string) => {
        try {
            const params = new URLSearchParams({ user_id: userId.toString() });
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

    // --- Affiliate Leads ---
    addLead: async (leadData: { affiliate_id?: number | null, name: string, phone: string, email: string, company_name?: string, offer_text?: string }) => {
        try {
            const res = await fetch(`${API_BASE}/leads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadData)
            });
            return await res.json();
        } catch (err) { return { error: err }; }
    },
    getLeads: async (userId?: number, role?: string) => {
        try {
            const params = new URLSearchParams();
            if (userId) params.append('affiliate_id', userId.toString());
            if (role) params.append('role', role.toUpperCase());
            if (userId) params.append('user_id', userId.toString());
            const res = await fetch(`${API_BASE}/leads?${params.toString()}`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err) { return []; }
    },
    updateLead: async (id: number, data: Partial<{ status: string, notes: string, company_name: string, offer_text: string, assigned_to: number }>) => {
        try {
            const res = await fetch(`${API_BASE}/leads/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (err) { return { error: err }; }
    },
    getTeam: async () => {
        try {
            const res = await fetch(`${API_BASE}/users/team`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err) { return []; }
    },
    debugDb: async () => {
        try {
            const res = await fetch(`${API_BASE}/debug/db`);
            return await res.json();
        } catch (err) { return { error: err }; }
    }
};
