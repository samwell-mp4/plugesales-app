/**
 * Google Calendar Integration Service for Plug & Sales
 */

const CLIENT_ID = '267271471002-us9821m8c0efqi09i86mpal1u2vchopd.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.email';

let codeClient: any = null;
const API_BASE = window.location.origin === 'http://localhost:5173' ? 'http://localhost:3000/api' : '/api';

export const googleCalendarService = {
    /**
     * Initializes the Google Identity Services client using the Authorization Code flow
     */
    initClient: (onCodeReceived: (code: string) => void) => {
        if (typeof window === 'undefined') return;

        if (!(window as any).google) {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => {
                codeClient = (window as any).google.accounts.oauth2.initCodeClient({
                    client_id: CLIENT_ID,
                    scope: SCOPES,
                    ux_mode: 'popup',
                    callback: (response: any) => {
                        if (response.code) {
                            onCodeReceived(response.code);
                        }
                    },
                });
            };
            document.body.appendChild(script);
        } else {
            codeClient = (window as any).google.accounts.oauth2.initCodeClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                ux_mode: 'popup',
                callback: (response: any) => {
                    if (response.code) {
                        onCodeReceived(response.code);
                    }
                },
            });
        }
    },

    /**
     * Requests an authorization code via popup
     */
    requestAuth: () => {
        if (codeClient) {
            codeClient.requestCode();
        }
    },

    /**
     * Exchanges code for tokens in the backend
     */
    exchangeCode: async (code: string, userId: number) => {
        const res = await fetch(`${API_BASE}/google/callback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, userId })
        });
        return await res.json();
    },

    /**
     * Checks connection status for a user
     */
    checkStatus: async (userId: number) => {
        const res = await fetch(`${API_BASE}/google/status/${userId}`);
        return await res.json();
    },

    /**
     * Disconnects Google account
     */
    disconnect: async (userId: number) => {
        const res = await fetch(`${API_BASE}/google/disconnect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        return await res.json();
    },

    /**
     * Gets a fresh access token from the backend
     */
    getValidToken: async (userId: number) => {
        const res = await fetch(`${API_BASE}/google/token/${userId}`);
        const data = await res.json();
        return data.token;
    },

    /**
     * Fetches the user's calendars
     */
    listCalendars: async (token: string) => {
        const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        return data.items || [];
    },

    /**
     * Fetches events from a specific calendar for a date range
     */
    listEvents: async (token: string, calendarId: string, timeMin: string, timeMax: string) => {
        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?` + 
            new URLSearchParams({
                timeMin,
                timeMax,
                singleEvents: 'true',
                orderBy: 'startTime'
            }),
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await response.json();
        return data.items || [];
    },

    /**
     * Creates a new event in Google Calendar
     */
    createEvent: async (token: string, calendarId: string, event: {
        summary: string;
        description: string;
        start: { dateTime: string };
        end: { dateTime: string };
        conferenceData?: any;
    }, createMeetLink: boolean = false) => {
        const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
        if (createMeetLink) {
            url.searchParams.set('conferenceDataVersion', '1');
            event.conferenceData = {
                createRequest: {
                    requestId: Math.random().toString(36).substring(7),
                    conferenceSolutionKey: { type: 'hangoutsMeet' }
                }
            };
        }

        const response = await fetch(url.toString(), {
            method: 'POST',
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        });
        return await response.json();
    },

    /**
     * Updates an existing event in Google Calendar
     */
    updateEvent: async (token: string, calendarId: string, eventId: string, event: any) => {
        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
            {
                method: 'PATCH',
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event)
            }
        );
        return await response.json();
    },

    /**
     * Deletes an event from Google Calendar
     */
    deleteEvent: async (token: string, calendarId: string, eventId: string) => {
        await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
            {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            }
        );
    }
};
