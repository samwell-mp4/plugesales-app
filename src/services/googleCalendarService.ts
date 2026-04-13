/**
 * Google Calendar Integration Service for Plug & Sales
 */

const CLIENT_ID = '267271471002-ea6kemv9rc4761a71d2f9c7udu48famv.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly';

let tokenClient: any = null;

export const googleCalendarService = {
    /**
     * Initializes the Google Identity Services client
     */
    initClient: (callback: (token: string) => void) => {
        if (typeof window === 'undefined') return;

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: (response: any) => {
                    if (response.error) {
                        console.error('GIS Error:', response.error);
                        return;
                    }
                    callback(response.access_token);
                },
            });
        };
        document.body.appendChild(script);
    },

    /**
     * Requests an access token via popup
     */
    requestToken: () => {
        if (tokenClient) {
            tokenClient.requestAccessToken({ prompt: 'consent' });
        }
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
