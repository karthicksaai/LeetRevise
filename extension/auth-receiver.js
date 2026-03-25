window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (!event.data || event.data.type !== 'LEETREVISE_AUTH_SUCCESS') return;

  const { access_token, refresh_token, expires_at } = event.data.payload;

  chrome.storage.local.set(
    {
      access_token: access_token,
      refresh_token: refresh_token,
      expires_at: expires_at,
    },
    () => {
      console.log('LeetRevise: tokens stored successfully');
    }
  );
});
