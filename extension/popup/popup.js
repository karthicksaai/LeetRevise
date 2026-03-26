
let diffChart = null;

function switchTab(tabName) {
  document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach((c) => (c.style.display = 'none'));
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(`tab-${tabName}`).style.display = 'block';
}

function getBadgeClass(difficulty) {
  if (difficulty === 'Easy') return 'badge-easy';
  if (difficulty === 'Hard') return 'badge-hard';
  return 'badge-medium';
}

function getNextDueDate(revisionEvents) {
  const today = new Date().toISOString().split('T')[0];
  const upcoming = revisionEvents
    .filter((e) => !e.is_completed && e.due_date >= today)
    .sort((a, b) => a.due_date.localeCompare(b.due_date));
  return upcoming[0] ? upcoming[0].due_date : null;
}

async function loadPendingProblems() {
  const loading = document.getElementById('pending-loading');
  const empty = document.getElementById('pending-empty');
  const list = document.getElementById('pending-list');

  loading.style.display = 'flex';
  empty.style.display = 'none';
  list.style.display = 'none';

  try {
    const result = await fetchProblems('pending');
    const problems = result.data || [];

    loading.style.display = 'none';

    if (problems.length === 0) {
      empty.style.display = 'block';
      return;
    }

    list.innerHTML = '';
    problems.forEach((problem) => {
      const nextDue = getNextDueDate(problem.revision_events || []);
      const li = document.createElement('li');
      li.className = 'problem-item';
      li.innerHTML = `
        <div class="problem-info">
          <a href="${problem.problem_url}" target="_blank" class="problem-title">${problem.problem_title}</a>
          <div class="problem-meta">
            <span class="badge ${getBadgeClass(problem.difficulty)}">${problem.difficulty}</span>
            ${nextDue ? `<span class="due-date">Due: ${nextDue}</span>` : ''}
          </div>
        </div>
        <button class="btn-solve" data-id="${problem.id}">Mark Solved</button>
      `;
      list.appendChild(li);
    });

    list.querySelectorAll('.btn-solve').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const problemId = btn.dataset.id;
        btn.disabled = true;
        btn.textContent = 'Saving...';
        try {
          await markSolved(problemId);
          btn.closest('li').remove();
          if (list.children.length === 0) {
            list.style.display = 'none';
            empty.style.display = 'block';
          }
        } catch (err) {
          btn.disabled = false;
          btn.textContent = 'Mark Solved';
        }
      });
    });

    list.style.display = 'flex';
  } catch {
    loading.style.display = 'none';
    empty.style.display = 'block';
  }
}

async function loadStats() {
  try {
    const result = await fetchStats();
    const stats = result.data;
    if (!stats) return;

    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-solved').textContent = stats.solved;
    document.getElementById('stat-pending').textContent = stats.pending;
    document.getElementById('stat-streak').textContent = `${stats.current_streak}d`;

    const ctx = document.getElementById('diff-chart').getContext('2d');
    const diffData = stats.by_difficulty || {};
    const labels = Object.keys(diffData);
    const scheduled = labels.map((l) => diffData[l].scheduled);
    const solved = labels.map((l) => diffData[l].solved);

    if (diffChart) diffChart.destroy();

    diffChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Scheduled', data: scheduled, backgroundColor: '#f97316', borderRadius: 4 },
          { label: 'Solved', data: solved, backgroundColor: '#10b981', borderRadius: 4 },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: '#9ca3af', font: { size: 10 } } },
        },
        scales: {
          x: { ticks: { color: '#6b7280', font: { size: 10 } }, grid: { color: '#2a2a3e' } },
          y: { ticks: { color: '#6b7280', font: { size: 10 } }, grid: { color: '#2a2a3e' }, beginAtZero: true },
        },
      },
    });
  } catch {
    // Stats load failed silently
  }
}

async function loadSettings() {
  const loggedOut = document.getElementById('settings-logged-out');
  const loggedIn = document.getElementById('settings-logged-in');
  const emailText = document.getElementById('settings-email-text');
  const toggle = document.getElementById('show-btn-toggle');

  const data = await getAuthData();
  const authenticated = !!data['access_token'];
  const showBtn = await getShowButton();

  toggle.checked = showBtn;

  if (authenticated) {
    loggedOut.style.display = 'none';
    loggedIn.style.display = 'block';
    emailText.textContent = data['user_email'] || 'Connected';
  } else {
    loggedOut.style.display = 'block';
    loggedIn.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const authenticated = await isAuthenticated();

  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const name = tab.dataset.tab;
      switchTab(name);
      if (name === 'pending' && authenticated) loadPendingProblems();
      if (name === 'stats' && authenticated) loadStats();
      if (name === 'settings') loadSettings();
    });
  });

  if (authenticated) {
    loadPendingProblems();
  } else {
    document.getElementById('pending-loading').style.display = 'none';
    document.getElementById('pending-empty').style.display = 'block';
    document.getElementById('pending-empty').querySelector('.empty-title').textContent = 'Not connected.';
    document.getElementById('pending-empty').querySelector('.empty-sub').textContent = 'Go to Settings to connect your account.';
  }

  loadSettings();

  document.getElementById('connect-btn').addEventListener('click', () => {
    const appUrl = 'https://leet-revise-8z4ft7iad-karthicks-projects-939838e3.vercel.app';
    chrome.tabs.create({ url: `${appUrl}/auth/extension-login` });
  });

  document.getElementById('disconnect-btn').addEventListener('click', async () => {
    await clearAuthData();
    loadSettings();
  });

  document.getElementById('show-btn-toggle').addEventListener('change', async (e) => {
    const value = e.target.checked;
    await setShowButton(value);

    // Tell content script to show/hide the button immediately
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'SET_BUTTON_VISIBILITY',
          visible: value,
        });
      }
    });
  });

  document.getElementById('open-dashboard').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://leet-revise-8z4ft7iad-karthicks-projects-939838e3.vercel.app/dashboard' });
  });
});
