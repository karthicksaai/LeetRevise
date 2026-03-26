const APP_URL = 'https://leet-revise-8z4ft7iad-karthicks-projects-939838e3.vercel.app';

async function getValidAccessToken() {
  const data = await getAuthData();
  const accessToken = data['access_token'];
  const refreshToken = data['refresh_token'];
  const expiresAt = data['expires_at'];

  if (!accessToken) return null;

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (expiresAt && expiresAt - nowSeconds < 60) {
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${APP_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        await clearAuthData();
        return null;
      }

      const result = await response.json();
      if (result.success) {
        await setAuthData(result.data.access_token, result.data.refresh_token, result.data.expires_at, data['user_email']);
        return result.data.access_token;
      }
    } catch {
      return null;
    }
  }

  return accessToken;
}

async function scheduleRevision(data) {
  const { access_token } = await getAuthData();
  
  if (!access_token) throw new Error('Not authenticated');

  const response = await fetch(`${APP_URL}/api/schedule`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to schedule');
  }

  return response.json();
}

async function fetchProblems(status = 'pending') {
  const token = await getValidAccessToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${APP_URL}/api/problems?status=${status}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch problems');
  }

  return response.json();
}

async function markSolved(problemId) {
  const token = await getValidAccessToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${APP_URL}/api/solve`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ problem_id: problemId }),
  });

  if (!response.ok) {
    throw new Error('Failed to mark as solved');
  }

  return response.json();
}

async function fetchStats() {
  const token = await getValidAccessToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${APP_URL}/api/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }

  return response.json();
}
