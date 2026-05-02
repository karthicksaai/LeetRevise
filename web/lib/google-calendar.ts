const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_CALENDAR_URL = 'https://www.googleapis.com/calendar/v3';

export interface CalendarTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export interface CalendarEvent {
  summary: string;
  description: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
  colorId?: string;
  reminders?: {
    useDefault: boolean;
    overrides?: { method: string; minutes: number }[];
  };
}

export class CalendarAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CalendarAuthError';
  }
}

export async function exchangeCodeForTokens(code: string): Promise<CalendarTokens> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/calendar/callback`,
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new CalendarAuthError(`Token exchange failed: ${err.error_description || err.error}`);
  }

  return res.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) throw new CalendarAuthError('Failed to refresh calendar token');
  const data = await res.json();
  return data.access_token;
}

export async function createCalendarEvents(
  accessToken: string,
  refreshToken: string,
  problem: { title: string; url: string; difficulty: string }
): Promise<string[]> {
  const intervals = [3, 7, 15, 30];
  const colorMap: Record<string, string> = {
    Easy: '2',    // green
    Medium: '5',  // yellow
    Hard: '11',   // red
  };

  const eventIds: string[] = [];

  for (const interval of intervals) {
    const revisionDate = new Date();
    revisionDate.setDate(revisionDate.getDate() + interval);

    const startDate = new Date(revisionDate);
    startDate.setHours(9, 0, 0, 0);

    const endDate = new Date(revisionDate);
    endDate.setHours(9, 30, 0, 0);

    const event: CalendarEvent = {
      summary: `Revise: ${problem.title}`,
      description: `Day ${interval} revision of ${problem.title} (${problem.difficulty})\n\nProblem: ${problem.url}\n\nScheduled by LeetRevise`,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      colorId: colorMap[problem.difficulty] || '5',
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 0 },
          { method: 'email', minutes: -60 },
        ],
      },
    };

    let res = await fetch(`${GOOGLE_CALENDAR_URL}/calendars/primary/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    // Token expired — refresh and retry once
    if (res.status === 401) {
      const newToken = await refreshAccessToken(refreshToken);
      res = await fetch(`${GOOGLE_CALENDAR_URL}/calendars/primary/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    }

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Failed to create calendar event: ${err.error?.message}`);
    }

    const created = await res.json();
    eventIds.push(created.id);
  }

  return eventIds;
}