/**
 * DevPulse 2026 Studio Workbench Interactive Client
 * Modern Silicon Valley Developer Experience
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const htmlRoot = document.documentElement;
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const copyCurlBtn = document.getElementById('copyCurlBtn');
  const tierCards = document.querySelectorAll('.tier-card');
  const epChips = document.querySelectorAll('.ep-chip');
  const btnV1 = document.getElementById('btnV1');
  const btnV2 = document.getElementById('btnV2');
  const currentMethodBadge = document.getElementById('currentMethodBadge');
  const targetUrlInput = document.getElementById('targetUrlInput');
  const apiKeyField = document.getElementById('apiKeyField');
  const repoParamField = document.getElementById('repoParamField');
  const repoFieldGroup = document.getElementById('repoFieldGroup');
  const sendRequestBtn = document.getElementById('sendRequestBtn');
  const triggerBurstBtn = document.getElementById('triggerBurstBtn');
  const responseStatusBadge = document.getElementById('responseStatusBadge');
  const latencyTicker = document.getElementById('latencyTicker');
  const copyResponseBtn = document.getElementById('copyResponseBtn');
  const gaugeBarFill = document.getElementById('gaugeBarFill');
  const gaugeNumbers = document.getElementById('gaugeNumbers');
  const resetTimerLabel = document.getElementById('resetTimerLabel');
  const algorithmLabel = document.getElementById('algorithmLabel');
  const lblLimit = document.getElementById('lblLimit');
  const lblRemaining = document.getElementById('lblRemaining');
  const lblReset = document.getElementById('lblReset');
  const deprecationPill = document.getElementById('deprecationPill');
  const jsonResponseBody = document.getElementById('jsonResponseBody');

  // State
  let activeVersion = 'v2';
  let activePath = '/metrics/code-health';
  let activeMethod = 'GET';
  let currentTierLimit = 20;
  let currentRawJson = '';

  // 1. Theme Management (Defaults to Crisp 2026 Light Studio Mode)
  const savedTheme = localStorage.getItem('devpulse_theme') || 'light';
  setTheme(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlRoot.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  });

  function setTheme(theme) {
    htmlRoot.setAttribute('data-theme', theme);
    localStorage.setItem('devpulse_theme', theme);
  }

  // 2. High-Tech Syntax Highlighter for Terminal JSON
  function syntaxHighlight(json) {
    if (typeof json !== 'string') {
      json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function (match) {
        let cls = 'tok-number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'tok-key';
          } else {
            cls = 'tok-string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'tok-boolean';
        } else if (/null/.test(match)) {
          cls = 'tok-null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      }
    );
  }

  // 3. Copy cURL Command
  copyCurlBtn.addEventListener('click', () => {
    const curlCommand = `curl -H "x-api-key: ${apiKeyField.value.trim()}" http://localhost:3000${targetUrlInput.value}`;
    navigator.clipboard.writeText(curlCommand).then(() => {
      const span = copyCurlBtn.querySelector('span');
      span.textContent = 'Copied! ✓';
      setTimeout(() => (span.textContent = 'Copy'), 2000);
    });
  });

  // 4. Tier Card Selection
  tierCards.forEach((card) => {
    card.addEventListener('click', () => {
      tierCards.forEach((c) => {
        c.classList.remove('active');
        const btn = c.querySelector('.tier-select-btn');
        if (btn) btn.textContent = 'Select Key';
      });
      card.classList.add('active');
      const activeBtn = card.querySelector('.tier-select-btn');
      if (activeBtn) activeBtn.textContent = 'Active Credentials ✓';

      apiKeyField.value = card.dataset.key;
      currentTierLimit = parseInt(card.dataset.limit, 10);
      lblLimit.textContent = currentTierLimit;
      gaugeNumbers.textContent = `${currentTierLimit} / ${currentTierLimit} Remaining (100%)`;
      gaugeBarFill.style.width = '100%';
      gaugeBarFill.className = 'gauge-bar-fill';
    });
  });

  // 5. Version Toggle (v1 vs v2)
  btnV1.addEventListener('click', () => setVersion('v1'));
  btnV2.addEventListener('click', () => setVersion('v2'));

  function setVersion(v) {
    activeVersion = v;
    if (v === 'v1') {
      btnV1.classList.add('active');
      btnV2.classList.remove('active');
    } else {
      btnV2.classList.add('active');
      btnV1.classList.remove('active');
    }
    syncUrl();
  }

  // 6. Endpoint Picker
  epChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      epChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      activeMethod = chip.dataset.method;
      currentMethodBadge.textContent = activeMethod;
      currentMethodBadge.className = `method-indicator ${activeMethod.toLowerCase()}`;

      // Strip existing version prefix
      activePath = chip.dataset.path.replace(/^\/api\/v\d/, '');

      if (activeMethod === 'POST') {
        repoFieldGroup.style.display = 'none';
      } else {
        repoFieldGroup.style.display = 'flex';
      }

      syncUrl();
    });
  });

  function syncUrl() {
    let url = `/api/${activeVersion}${activePath}`;
    if (activeMethod === 'GET') {
      url += `?repo=${encodeURIComponent(repoParamField.value.trim())}`;
    }
    targetUrlInput.value = url;
  }

  repoParamField.addEventListener('input', syncUrl);

  // 7. Execute Request
  async function dispatchRequest() {
    sendRequestBtn.disabled = true;
    sendRequestBtn.innerHTML = `<span>Sending...</span>`;

    const url = targetUrlInput.value;
    const apiKey = apiKeyField.value.trim();
    const startTime = performance.now();

    const headers = { 'x-api-key': apiKey };
    const fetchOptions = { method: activeMethod, headers };

    if (activeMethod === 'POST') {
      headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify({
        repo_url: 'https://github.com/devpulse/microservice-audit',
        branch: 'main',
        language: 'typescript',
        analysis_depth: 'standard'
      });
    }

    try {
      const res = await fetch(url, fetchOptions);
      const elapsed = Math.round(performance.now() - startTime);
      latencyTicker.textContent = `${elapsed} ms`;

      // Status pill styling
      responseStatusBadge.textContent = `${res.status} ${res.statusText}`;
      if (res.status === 200 || res.status === 201) {
        responseStatusBadge.className = 'status-chip s-200';
      } else if (res.status === 429) {
        responseStatusBadge.className = 'status-chip s-429';
      } else {
        responseStatusBadge.className = 'status-chip';
      }

      // Read RFC Rate Limit & Deprecation Headers
      const limit = res.headers.get('x-ratelimit-limit') || currentTierLimit;
      const remaining = res.headers.get('x-ratelimit-remaining') || '0';
      const reset = res.headers.get('x-ratelimit-reset') || '--';
      const algo = res.headers.get('x-ratelimit-algorithm') || 'sliding-window';
      const retryAfter = res.headers.get('retry-after');
      const deprecation = res.headers.get('deprecation');

      lblLimit.textContent = limit;
      lblRemaining.textContent = remaining;
      lblReset.textContent = `${reset}s`;
      algorithmLabel.textContent = algo;

      if (retryAfter) {
        resetTimerLabel.textContent = `🛑 Throttled! Retry-After: ${retryAfter}s`;
        resetTimerLabel.style.color = 'var(--danger)';
      } else {
        resetTimerLabel.textContent = `Window Reset: in ${reset}s`;
        resetTimerLabel.style.color = 'var(--text-tertiary)';
      }

      if (deprecation) {
        deprecationPill.style.display = 'inline-block';
      } else {
        deprecationPill.style.display = 'none';
      }

      // Visual Rate Limit Gauge Fill
      const remNum = parseInt(remaining, 10);
      const limNum = parseInt(limit, 10);
      const pct = Math.max(0, Math.min(100, Math.round((remNum / limNum) * 100)));
      gaugeBarFill.style.width = `${pct}%`;
      gaugeNumbers.textContent = `${remaining} / ${limit} Remaining (${pct}%)`;

      if (pct > 40) {
        gaugeBarFill.className = 'gauge-bar-fill';
      } else if (pct > 15) {
        gaugeBarFill.className = 'gauge-bar-fill mid';
      } else {
        gaugeBarFill.className = 'gauge-bar-fill empty';
      }

      const json = await res.json();
      currentRawJson = JSON.stringify(json, null, 2);
      jsonResponseBody.innerHTML = syntaxHighlight(json);

    } catch (err) {
      responseStatusBadge.textContent = 'Server Offline';
      responseStatusBadge.className = 'status-chip s-429';
      currentRawJson = `// Error connecting to backend: ${err.message}\nMake sure node src/server.js is running on port 3000.`;
      jsonResponseBody.textContent = currentRawJson;
    } finally {
      sendRequestBtn.disabled = false;
      sendRequestBtn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        <span>Execute</span>
      `;
    }
  }

  sendRequestBtn.addEventListener('click', dispatchRequest);

  // 8. Rapid Burst Attack Simulator
  triggerBurstBtn.addEventListener('click', async () => {
    triggerBurstBtn.disabled = true;
    triggerBurstBtn.textContent = 'Simulating Traffic Surge...';

    // Auto-select Free Tier (5 limit) for clear visual demonstration
    const freeCard = document.querySelector('[data-tier="free"]');
    if (freeCard) freeCard.click();

    for (let i = 1; i <= 8; i++) {
      await dispatchRequest();
      await new Promise((r) => setTimeout(r, 110));
    }

    triggerBurstBtn.disabled = false;
    triggerBurstBtn.textContent = 'Fire Burst Surge';
  });

  // 9. Copy Response JSON (Copies clean raw unformatted JSON to clipboard)
  copyResponseBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(currentRawJson || jsonResponseBody.textContent).then(() => {
      copyResponseBtn.textContent = 'Copied! ✓';
      setTimeout(() => (copyResponseBtn.textContent = 'Copy JSON'), 2000);
    });
  });

  // Initial load request
  dispatchRequest();
});
