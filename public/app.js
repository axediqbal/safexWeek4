/**
 * DevPulse 2026 Developer Studio WebApp Client
 * Interactive Key Provisioning, Telemetry Ribbon, Visual Dashboard & Code Generator
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

  // New WebApp SaaS Elements
  const provClientName = document.getElementById('provClientName');
  const provTierSelect = document.getElementById('provTierSelect');
  const btnProvisionKey = document.getElementById('btnProvisionKey');
  const provisionResultBanner = document.getElementById('provisionResultBanner');
  const provKeyOutput = document.getElementById('provKeyOutput');
  const provQuotaTag = document.getElementById('provQuotaTag');
  const btnMountProvisionedKey = document.getElementById('btnMountProvisionedKey');
  const btnCopyProvisionedKey = document.getElementById('btnCopyProvisionedKey');

  const telemCallCount = document.getElementById('telemCallCount');
  const telemLatency = document.getElementById('telemLatency');
  const telem429Count = document.getElementById('telem429Count');

  const tabJson = document.getElementById('tabJson');
  const tabVisual = document.getElementById('tabVisual');
  const jsonContainer = document.getElementById('jsonContainer');
  const visualContainer = document.getElementById('visualContainer');
  const visualContent = document.getElementById('visualContent');

  const langPills = document.querySelectorAll('.lang-pill');
  const snippetCode = document.getElementById('snippetCode');

  // State
  let activeVersion = 'v2';
  let activePath = '/metrics/code-health';
  let activeMethod = 'GET';
  let currentTierLimit = 20;
  let currentRawJson = '';
  let activeLanguage = 'curl';

  let totalCalls = 0;
  let total429s = 0;
  let lastResponseData = null;

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

  // 2. High-Tech Syntax Highlighter
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

  // 3. Quick Copy cURL
  copyCurlBtn.addEventListener('click', () => {
    const curlCommand = `curl -H "x-api-key: ${apiKeyField.value.trim()}" http://localhost:3000${targetUrlInput.value}`;
    navigator.clipboard.writeText(curlCommand).then(() => {
      const span = copyCurlBtn.querySelector('span');
      span.textContent = 'Copied! ✓';
      setTimeout(() => (span.textContent = 'Copy'), 2000);
    });
  });

  // 4. Tier Selection Cards
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
      updateSnippet();
    });
  });

  // 5. Dynamic API Key Provisioning Vault
  btnProvisionKey.addEventListener('click', async () => {
    btnProvisionKey.disabled = true;
    btnProvisionKey.innerHTML = `<span>Minting...</span>`;

    const clientName = provClientName.value.trim() || 'Custom Developer App';
    const tier = provTierSelect.value;

    try {
      const res = await fetch('/api/keys/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName, tier })
      });
      const data = await res.json();
      if (data.status === 'success') {
        const mintedKey = data.data.key;
        provKeyOutput.textContent = mintedKey;
        provQuotaTag.textContent = `${data.data.quota} req / 60s (${data.data.tier})`;
        provisionResultBanner.style.display = 'flex';

        btnMountProvisionedKey.onclick = () => {
          apiKeyField.value = mintedKey;
          currentTierLimit = data.data.quota;
          lblLimit.textContent = currentTierLimit;
          gaugeNumbers.textContent = `${currentTierLimit} / ${currentTierLimit} Remaining (100%)`;
          gaugeBarFill.style.width = '100%';
          btnMountProvisionedKey.textContent = 'Mounted! ✓';
          setTimeout(() => (btnMountProvisionedKey.textContent = 'Mount in Studio'), 2000);
          updateSnippet();
        };

        btnCopyProvisionedKey.onclick = () => {
          navigator.clipboard.writeText(mintedKey).then(() => {
            btnCopyProvisionedKey.textContent = 'Copied! ✓';
            setTimeout(() => (btnCopyProvisionedKey.textContent = 'Copy Key'), 2000);
          });
        };
      }
    } catch (err) {
      alert('Key provisioning error: ' + err.message);
    } finally {
      btnProvisionKey.disabled = false;
      btnProvisionKey.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 2l-2 2m-1-1l-2 2m-1-1l-2 2m-1-1l-2 2M3 21l9-9m0 0a5 5 0 1 0-7-7 5 5 0 0 0 7 7z"></path></svg>
        <span>Mint API Key</span>
      `;
    }
  });

  // 6. Version Toggle (v1 vs v2)
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

  // 7. Endpoint Picker
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
    updateSnippet();
  }

  repoParamField.addEventListener('input', syncUrl);
  apiKeyField.addEventListener('input', updateSnippet);

  // 8. Client Code Generator Snippets
  langPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      langPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      activeLanguage = pill.dataset.lang;
      updateSnippet();
    });
  });

  function updateSnippet() {
    const key = apiKeyField.value.trim();
    const url = `http://localhost:3000${targetUrlInput.value}`;

    if (activeLanguage === 'curl') {
      if (activeMethod === 'POST') {
        snippetCode.textContent = `curl -X POST -H "x-api-key: ${key}" -H "Content-Type: application/json" -d '{"repo_url":"https://github.com/devpulse/microservice-audit","branch":"main","language":"typescript","analysis_depth":"standard"}' ${url}`;
      } else {
        snippetCode.textContent = `curl -H "x-api-key: ${key}" "${url}"`;
      }
    } else if (activeLanguage === 'js') {
      snippetCode.textContent = `const response = await fetch('${url}', {\n  method: '${activeMethod}',\n  headers: { 'x-api-key': '${key}' }\n});\nconst data = await response.json();\nconsole.log(data);`;
    } else if (activeLanguage === 'python') {
      snippetCode.textContent = `import requests\n\nheaders = {'x-api-key': '${key}'}\nresponse = requests.${activeMethod.toLowerCase()}('${url}', headers=headers)\nprint(response.json())`;
    }
  }

  // 9. Inspector Tab Switcher
  tabJson.addEventListener('click', () => {
    tabJson.classList.add('active');
    tabVisual.classList.remove('active');
    jsonContainer.style.display = 'block';
    visualContainer.style.display = 'none';
  });

  tabVisual.addEventListener('click', () => {
    tabVisual.classList.add('active');
    tabJson.classList.remove('active');
    jsonContainer.style.display = 'none';
    visualContainer.style.display = 'block';
    if (lastResponseData) {
      renderVisualDashboard(lastResponseData);
    }
  });

  // 10. Visual Dashboard Renderer
  function renderVisualDashboard(data) {
    if (!data) return;
    const payload = data.data || data; // handle enveloped v2 vs flat v1
    let html = '';

    if (activePath.includes('code-health')) {
      const score = payload.health_score || payload.healthScore || 94;
      const coverage = payload.test_coverage || payload.testCoverage || '87.4%';
      const maintainability = payload.maintainability_index || payload.maintainabilityIndex || 89.1;
      const duplication = payload.code_duplication || payload.codeDuplication || '2.1%';

      html = `
        <div class="visual-card span-2">
          <div class="v-card-title">Overall Codebase Health Index</div>
          <div class="v-card-val">${score} <span style="font-size: 1rem; color: var(--text-tertiary);">/ 100</span> <span class="v-grade-badge">Grade A+ Certified</span></div>
          <div class="v-progress-track">
            <div class="v-progress-fill" style="width: ${score}%;"></div>
          </div>
        </div>
        <div class="visual-card">
          <div class="v-card-title">Test Coverage</div>
          <div class="v-card-val" style="color: var(--success);">${coverage}</div>
          <div class="v-items-list">
            <div class="v-item-row"><span>Unit Tests:</span> <b>Passed (412/412)</b></div>
            <div class="v-item-row"><span>Integration:</span> <b>Passed (98/98)</b></div>
          </div>
        </div>
        <div class="visual-card">
          <div class="v-card-title">Maintainability &amp; Cleanliness</div>
          <div class="v-card-val" style="color: var(--primary-accent);">${maintainability}</div>
          <div class="v-items-list">
            <div class="v-item-row"><span>Code Duplication:</span> <b>${duplication} (Clean)</b></div>
            <div class="v-item-row"><span>Cyclomatic Complexity:</span> <b>Low (&lt;4.2)</b></div>
          </div>
        </div>
      `;
    } else if (activePath.includes('security-audit')) {
      const vulns = payload.vulnerabilities || { critical: 0, high: 0, medium: 2, low: 5 };
      const packages = payload.packages_scanned || payload.packagesScanned || 142;

      html = `
        <div class="visual-card span-2">
          <div class="v-card-title">Security &amp; Vulnerability Matrix</div>
          <div class="v-card-val" style="color: var(--success);">0 Critical Threats <span class="v-grade-badge">Protected</span></div>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.35rem;">Automated SAST &amp; DAST analysis completed across all active dependencies.</p>
        </div>
        <div class="visual-card">
          <div class="v-card-title">Vulnerability Breakdown</div>
          <div class="v-items-list">
            <div class="v-item-row"><span style="color: var(--danger);">Critical:</span> <b>${vulns.critical || 0}</b></div>
            <div class="v-item-row"><span style="color: #ea580c;">High:</span> <b>${vulns.high || 0}</b></div>
            <div class="v-item-row"><span style="color: var(--warning);">Medium:</span> <b>${vulns.medium || 2}</b></div>
            <div class="v-item-row"><span style="color: var(--text-tertiary);">Low:</span> <b>${vulns.low || 5}</b></div>
          </div>
        </div>
        <div class="visual-card">
          <div class="v-card-title">SBOM &amp; Compliance</div>
          <div class="v-card-val" style="font-size: 1.25rem;">${packages} Packages</div>
          <div class="v-items-list">
            <div class="v-item-row"><span>Licenses:</span> <b>100% Permissive</b></div>
            <div class="v-item-row"><span>Secrets Leaked:</span> <b>0 Detected</b></div>
          </div>
        </div>
      `;
    } else if (activePath.includes('tech-debt')) {
      const hours = payload.remediation_hours || payload.remediationHours || 38.5;
      const smells = payload.code_smells || payload.codeSmells || 14;

      html = `
        <div class="visual-card span-2">
          <div class="v-card-title">Technical Debt Remediation</div>
          <div class="v-card-val" style="color: var(--warning);">${hours} Hours <span class="v-grade-badge" style="background: var(--warning-bg); color: var(--warning); border-color: var(--warning-border);">Manageable</span></div>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.35rem;">Estimated engineering effort to achieve zero legacy warnings across modules.</p>
        </div>
        <div class="visual-card">
          <div class="v-card-title">Code Smells</div>
          <div class="v-card-val" style="font-size: 1.25rem;">${smells} Issues</div>
          <div class="v-items-list">
            <div class="v-item-row"><span>Long Functions:</span> <b>3</b></div>
            <div class="v-item-row"><span>Deep Nesting:</span> <b>4</b></div>
          </div>
        </div>
        <div class="visual-card">
          <div class="v-card-title">Deprecated API Usages</div>
          <div class="v-card-val" style="font-size: 1.25rem; color: var(--danger);">3 Calls</div>
          <div class="v-items-list">
            <div class="v-item-row"><span>Migration:</span> <b>RFC 8594 Flagged</b></div>
            <div class="v-item-row"><span>Sunset Date:</span> <b>2027-01-01</b></div>
          </div>
        </div>
      `;
    } else if (activePath.includes('build-benchmarks')) {
      html = `
        <div class="visual-card span-2">
          <div class="v-card-title">CI/CD Build Pipeline Performance</div>
          <div class="v-card-val" style="color: var(--primary-accent);">22.8s Total <span class="v-grade-badge">Top 5% Speed</span></div>
        </div>
        <div class="visual-card">
          <div class="v-card-title">Compile &amp; Bundle</div>
          <div class="v-card-val" style="font-size: 1.25rem;">14.2s</div>
          <div class="v-items-list">
            <div class="v-item-row"><span>Engine:</span> <b>Vite / ESBuild</b></div>
            <div class="v-item-row"><span>Asset Size:</span> <b>1.84 MB gzip</b></div>
          </div>
        </div>
        <div class="visual-card">
          <div class="v-card-title">Test Runner Suite</div>
          <div class="v-card-val" style="font-size: 1.25rem; color: var(--success);">8.6s</div>
          <div class="v-items-list">
            <div class="v-item-row"><span>Parallel Workers:</span> <b>8 Cores</b></div>
            <div class="v-item-row"><span>Flaky Tests:</span> <b>0</b></div>
          </div>
        </div>
      `;
    } else if (activePath.includes('analyze/repository')) {
      const jobId = payload.job_id || payload.jobId || 'job_8f29c01';
      html = `
        <div class="visual-card span-2">
          <div class="v-card-title">Static Analysis Job Telemetry</div>
          <div class="v-card-val" style="font-size: 1.25rem; color: var(--primary-accent);">
            ${jobId} <span class="v-grade-badge">Processing</span>
          </div>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.45rem;">Repository queued in distributed parsing cluster. AST worker assigned.</p>
        </div>
        <div class="visual-card span-2">
          <div class="v-card-title">Payload Metadata</div>
          <div class="v-items-list">
            <div class="v-item-row"><span>Repository URL:</span> <b>github.com/devpulse/core-service</b></div>
            <div class="v-item-row"><span>Branch:</span> <b>main</b></div>
            <div class="v-item-row"><span>Language:</span> <b>TypeScript / Node.js</b></div>
            <div class="v-item-row"><span>Parser Depth:</span> <b>Full Semantic Graph</b></div>
          </div>
        </div>
      `;
    }

    visualContent.innerHTML = html;
  }

  // 11. Execute Real-Time HTTP Request
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

    totalCalls++;
    telemCallCount.textContent = totalCalls;

    try {
      const res = await fetch(url, fetchOptions);
      const elapsed = Math.round(performance.now() - startTime);
      latencyTicker.textContent = `${elapsed} ms`;
      telemLatency.textContent = `${elapsed} ms`;

      // Status pill styling
      responseStatusBadge.textContent = `${res.status} ${res.statusText}`;
      if (res.status === 200 || res.status === 201) {
        responseStatusBadge.className = 'status-chip s-200';
      } else if (res.status === 429) {
        responseStatusBadge.className = 'status-chip s-429';
        total429s++;
        telem429Count.textContent = total429s;
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
      lastResponseData = json;
      currentRawJson = JSON.stringify(json, null, 2);
      jsonResponseBody.innerHTML = syntaxHighlight(json);

      // Also update visual dashboard
      renderVisualDashboard(json);

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

  // 12. Rapid Burst Attack Simulator
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

  // 13. Copy Raw Response JSON
  copyResponseBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(currentRawJson || jsonResponseBody.textContent).then(() => {
      copyResponseBtn.textContent = 'Copied! ✓';
      setTimeout(() => (copyResponseBtn.textContent = 'Copy'), 2000);
    });
  });

  // Initial load request
  updateSnippet();
  dispatchRequest();
});
