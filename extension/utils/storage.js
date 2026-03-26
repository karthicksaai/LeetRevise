const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  EXPIRES_AT: 'expires_at',
  USER_EMAIL: 'user_email',
  SHOW_BUTTON: 'show_button',
  SCHEDULED_URLS: 'scheduled_urls',
};

function isChromeExtensionContextValid() {
  try {
    return !!(chrome && chrome.runtime && chrome.runtime.id);
  } catch {
    return false;
  }
}

async function getAuthData() {
  return new Promise((resolve) => {
    if (!isChromeExtensionContextValid()) {
      resolve({
        access_token: null,
        refresh_token: null,
        expires_at: null,
      });
      return;
    }

    chrome.storage.local.get(
      [STORAGE_KEYS.ACCESS_TOKEN, STORAGE_KEYS.REFRESH_TOKEN, STORAGE_KEYS.EXPIRES_AT, STORAGE_KEYS.USER_EMAIL],
      (result) => resolve(result)
    );
  });
}

async function setAuthData(accessToken, refreshToken, expiresAt, email) {
  return new Promise((resolve) => {
    chrome.storage.local.set(
      {
        [STORAGE_KEYS.ACCESS_TOKEN]: accessToken,
        [STORAGE_KEYS.REFRESH_TOKEN]: refreshToken,
        [STORAGE_KEYS.EXPIRES_AT]: expiresAt,
        [STORAGE_KEYS.USER_EMAIL]: email,
      },
      resolve
    );
  });
}

async function clearAuthData() {
  return new Promise((resolve) => {
    chrome.storage.local.remove(
      [STORAGE_KEYS.ACCESS_TOKEN, STORAGE_KEYS.REFRESH_TOKEN, STORAGE_KEYS.EXPIRES_AT, STORAGE_KEYS.USER_EMAIL],
      resolve
    );
  });
}

async function isAuthenticated() {
  const data = await getAuthData();
  // support both direct key and STORAGE_KEYS constant
  return !!(data['access_token'] || data[STORAGE_KEYS.ACCESS_TOKEN]);
}

async function getShowButton() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.SHOW_BUTTON], (result) => {
      resolve(result[STORAGE_KEYS.SHOW_BUTTON] !== false);
    });
  });
}

async function setShowButton(value) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.SHOW_BUTTON]: value }, resolve);
  });
}

async function getScheduledUrls() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.SCHEDULED_URLS], (result) => {
      resolve(result[STORAGE_KEYS.SCHEDULED_URLS] || {});
    });
  });
}

async function markUrlScheduled(url) {
  const urls = await getScheduledUrls();
  urls[url] = true;
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.SCHEDULED_URLS]: urls }, resolve);
  });
}

async function isUrlScheduled(url) {
  const urls = await getScheduledUrls();
  return !!urls[url];
}
