const APP_URL = 'https://leet-revise-8z4ft7iad-karthicks-projects-939838e3.vercel.app';

async function apiRequest(path, method, body) {
  const authData = await getAuthData();
  const token = authData['access_token'];
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
        if (response?.success) {
          resolve(response.data);
        } else {
          reject(new Error(response?.error || 'Request failed'));
        }
      }
    );
  });
}

async function scheduleRevision(data) {
  return apiRequest('/api/schedule', 'POST', data);
}

async function markProblemSolved(problemId) {
  return apiRequest('/api/solve', 'PATCH', { problem_id: problemId });
}

async function getProblems(status = 'all') {
  return apiRequest(`/api/problems?status=${status}`, 'GET', null);
}

async function getStats() {
  return apiRequest('/api/stats', 'GET', null);
}
