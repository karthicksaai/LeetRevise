const APP_URL = 'https://leet-revise-8z4ft7iad-karthicks-projects-939838e3.vercel.app/';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'STORE_AUTH') {
    const { access_token, refresh_token, expires_at } = message.payload;
    chrome.storage.local.set({ access_token, refresh_token, expires_at }, () => {
      fetchAndStoreUserEmail(access_token);
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'GET_AUTH_STATUS') {
    chrome.storage.local.get(['access_token', 'user_email'], (result) => {
      sendResponse({
        isAuthenticated: !!result.access_token,
        email: result.user_email || null,
      });
    });
    return true;
  }

  if (message.type === 'LOGOUT') {
    chrome.storage.local.remove(
      ['access_token', 'refresh_token', 'expires_at', 'user_email'],
      () => sendResponse({ success: true })
    );
    return true;
  }

  if (message.type === 'REFRESH_TOKEN') {
    chrome.storage.local.get(['refresh_token'], async (result) => {
      const refreshToken = result.refresh_token;
      if (!refreshToken) {
        sendResponse({ success: false, error: 'No refresh token stored' });
        return;
      }

      try {
        const response = await fetch(`${APP_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        const data = await response.json();
        if (data.success) {
          chrome.storage.local.set({
            access_token: data.data.access_token,
            refresh_token: data.data.refresh_token,
            expires_at: data.data.expires_at,
          });
          sendResponse({ success: true, access_token: data.data.access_token });
        } else {
          chrome.storage.local.remove(['access_token', 'refresh_token', 'expires_at', 'user_email']);
          sendResponse({ success: false, error: data.error });
        }
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    });
    return true;
  }
});

async function fetchAndStoreUserEmail(accessToken) {
  try {
    const response = await fetch(`${APP_URL}/api/stats`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) return;
    const userData = await fetch(`${APP_URL}/api/problems?status=all`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    // Non-critical — email display is optional
  }
}
