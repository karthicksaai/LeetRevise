const APP_URL = 'https://leetrevise.app';

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
      if (!response.ok) { await clearAuthData(); return null; }
      const result = await response.json();
      if (result.success) {
        await setAuthData(result.data.access_token, result.data.refresh_token, result.data.expires_at, data['user_email']);
        return result.data.access_token;
      }
    } catch { return null; }
  }
  return accessToken;
}

// Routes through background service worker — bypasses CORS
async function backgroundFetch(path, method, body) {
  const token = await getValidAccessToken();
  if (!token) throw new Error('Not authenticated');

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type: 'API_REQUEST',
        payload: { url: `${APP_URL}${path}`, method, token, body },
      },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (response?.success) resolve(response.data);
        else reject(new Error(response?.error || 'Request failed'));
      }
    );
  });
}

async function scheduleRevision(data) {
  return backgroundFetch('/api/schedule', 'POST', data);
}

async function fetchProblems(status = 'pending') {
  const token = await getValidAccessToken();
  if (!token) throw new Error('Not authenticated');
  const response = await fetch(`${APP_URL}/api/problems?status=${status}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch problems');
  return response.json();
}

async function markSolved(problemId) {
  const token = await getValidAccessToken();
  if (!token) throw new Error('Not authenticated');
  const response = await fetch(`${APP_URL}/api/solve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ problem_id: problemId }),
  });
  if (!response.ok) throw new Error('Failed to mark as solved');
  return response.json();
}

async function fetchStats() {
  const token = await getValidAccessToken();
  if (!token) throw new Error('Not authenticated');
  const response = await fetch(`${APP_URL}/api/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}
