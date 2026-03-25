const BUTTON_ID = 'leetrevise-schedule-btn';
const TOAST_ID = 'leetrevise-toast';

function getProblemTitleFromURL() {
  // Extract from URL: /problems/two-sum/ => "Two Sum"
  const match = window.location.pathname.match(/\/problems\/([^/]+)/);
  if (!match) return null;
  return match[1]
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function getProblemTitle() {
  const selectors = [
    '[data-cy="question-title"]',
    '[class*="text-title-large"]',
    '[class*="question-title"]',
    '[class*="QuestionTitle"]',
    'h1',
    'h2',
  ];
  for (const sel of selectors) {
    try {
      const el = document.querySelector(sel);
      if (el && el.textContent.trim().length > 1) {
        return el.textContent.trim();
      }
    } catch {}
  }
  // Always works — extract from URL as final fallback
  return getProblemTitleFromURL();
}

function getDifficultyFromDOM() {
  const selectors = [
    '[class*="difficulty"]',
    '[class*="Difficulty"]',
    '[class*="text-difficulty"]',
    '[class*="DifficultyLabel"]',
  ];
  for (const sel of selectors) {
    try {
      const els = document.querySelectorAll(sel);
      for (const el of els) {
        const text = el.textContent.trim();
        if (text === 'Easy' || text === 'Medium' || text === 'Hard') return text;
      }
    } catch {}
  }
  // Scan all small elements for difficulty text
  const all = document.querySelectorAll('span, div, p');
  for (const el of all) {
    if (el.children.length === 0) {
      const text = el.textContent.trim();
      if (text === 'Easy' || text === 'Medium' || text === 'Hard') return text;
    }
  }
  return 'Medium';
}

function getTopicTagsFromDOM() {
  const tags = [];
  try {
    const tagEls = document.querySelectorAll('[class*="topic-tag"], [href*="/tag/"]');
    for (const el of tagEls) {
      const text = el.textContent.trim();
      if (text && !tags.includes(text)) tags.push(text);
    }
  } catch {}
  return tags.slice(0, 8);
}

function showToast(message, type) {
  const existing = document.getElementById(TOAST_ID);
  if (existing) existing.remove();

  const bg = type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#ef4444';
  const toast = document.createElement('div');
  toast.id = TOAST_ID;
  toast.textContent = message;
  toast.style.cssText = [
    'position:fixed',
    'bottom:80px',
    'left:50%',
    'transform:translateX(-50%) translateY(16px)',
    'background:' + bg,
    'color:#fff',
    'padding:10px 20px',
    'border-radius:9999px',
    'font-size:13px',
    'font-weight:600',
    'font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif',
    'z-index:2147483647',
    'box-shadow:0 4px 12px rgba(0,0,0,0.4)',
    'opacity:0',
    'transition:opacity 0.2s ease,transform 0.2s ease',
    'white-space:nowrap',
    'max-width:90vw',
    'pointer-events:none',
  ].join(';');

  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(16px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function setButtonState(btn, state) {
  const map = {
    default:   { text: "Can't Solve? Schedule Revision", bg: '#1e1e2e', disabled: false },
    scheduled: { text: 'Already Scheduled',              bg: '#10b981', disabled: true  },
    loading:   { text: 'Scheduling...',                  bg: '#f97316', disabled: true  },
    success:   { text: 'Revision Scheduled',             bg: '#10b981', disabled: true  },
  };
  const s = map[state] || map.default;
  btn.textContent = s.text;
  btn.style.background = s.bg;
  btn.disabled = s.disabled;
  btn.style.opacity = s.disabled ? '0.85' : '1';
  btn.style.cursor = s.disabled ? 'default' : 'pointer';
}

async function injectButton() {
  if (document.getElementById(BUTTON_ID)) return;

  const showButton = await getShowButton();
  if (!showButton) return;

  const problemTitle = getProblemTitle();
  if (!problemTitle) return;

  const btn = document.createElement('button');
  btn.id = BUTTON_ID;
  btn.style.cssText = [
    'position:fixed',
    'bottom:24px',
    'right:24px',
    'background:#1e1e2e',
    'color:#fff',
    'border:2px solid #f97316',
    'padding:10px 18px',
    'border-radius:8px',
    'font-size:14px',
    'font-weight:600',
    'font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif',
    'cursor:pointer',
    'z-index:2147483646',
    'box-shadow:0 4px 16px rgba(0,0,0,0.6)',
    'transition:background 0.2s ease,transform 0.1s ease',
    'line-height:1.4',
  ].join(';');

  const alreadyScheduled = await isUrlScheduled(window.location.href);
  setButtonState(btn, alreadyScheduled ? 'scheduled' : 'default');

  btn.addEventListener('mouseenter', () => { if (!btn.disabled) btn.style.transform = 'scale(1.03)'; });
  btn.addEventListener('mouseleave', () => { btn.style.transform = 'scale(1)'; });

  btn.addEventListener('click', async () => {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      showToast('Please connect your account in the extension popup', 'warning');
      return;
    }

    setButtonState(btn, 'loading');

    try {
      await scheduleRevision({
        problem_title: problemTitle,
        problem_url: window.location.href,
        difficulty: getDifficultyFromDOM(),
        topic_tags: getTopicTagsFromDOM(),
      });
      await markUrlScheduled(window.location.href);
      setButtonState(btn, 'success');
      showToast('Revision scheduled for Day 3, 7, 15 and 30!', 'success');
    } catch (err) {
      setButtonState(btn, 'default');
      showToast(err.message || 'Failed to schedule revision', 'error');
    }
  });

  document.body.appendChild(btn);
  console.log('LeetRevise: button injected for problem:', problemTitle);
}

// --- Injection logic ---
let injectionAttempts = 0;
let injected = false;

function tryInject() {
  if (injected && document.getElementById(BUTTON_ID)) return;
  
  // URL-based fallback always has a title — inject immediately if on a problem page
  const urlTitle = getProblemTitleFromURL();
  if (urlTitle) {
    injected = true;
    injectButton();
    return;
  }

  injectionAttempts++;
  if (injectionAttempts < 30) {
    setTimeout(tryInject, 500);
  }
}

// SPA navigation watcher
let lastUrl = window.location.href;
setInterval(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    injectionAttempts = 0;
    injected = false;
    const existing = document.getElementById(BUTTON_ID);
    if (existing) existing.remove();
    setTimeout(tryInject, 600);
  }
}, 500);

// Start
console.log('LeetRevise loaded on:', window.location.href);
setTimeout(tryInject, 800);

// Listen for popup messages
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'SET_BUTTON_VISIBILITY') {
    const btn = document.getElementById(BUTTON_ID);
    if (message.visible) {
      if (!btn) {
        injectionAttempts = 0;
        injected = false;
        tryInject();
      }
    } else {
      if (btn) btn.remove();
      injected = false;
    }
  }
});
