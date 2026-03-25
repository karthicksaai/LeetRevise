export class CalendarAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CalendarAuthError';
  }
}

function getDateString(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

export async function createRevisionEvents(
  accessToken: string,
  problem: { title: string; url: string; difficulty: string },
  intervals: number[] = [3, 7, 15, 30]
): Promise<string[]> {
  const createEvent = async (interval: number): Promise<string> => {
    const dateStr = getDateString(interval);
    const body = {
      summary: `LeetRevise: ${problem.title} (${problem.difficulty})`,
      description: `Time to re-solve this problem!\n\n${problem.url}\n\nScheduled by LeetRevise.`,
      start: { date: dateStr },
      end: { date: dateStr },
      colorId: '6',
      reminders: {
        useDefault: false,
        overrides: [{ method: 'popup', minutes: 480 }],
      },
    };

    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (response.status === 401) {
      throw new CalendarAuthError('Google Calendar token is invalid or expired');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Calendar API error: ${response.status} ${errorText}`);
    }

    const data = (await response.json()) as { id: string };
    return data.id;
  };

  const results = await Promise.all(intervals.map((interval) => createEvent(interval)));
  return results;
}

export async function deleteRevisionEvent(accessToken: string, eventId: string): Promise<void> {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (response.status === 401) {
    throw new CalendarAuthError('Google Calendar token is invalid or expired');
  }
}
