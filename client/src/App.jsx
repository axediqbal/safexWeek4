import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Terminal,
  Key,
  Zap,
  Scale,
  Sun,
  Moon,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Activity,
  Layers,
  Clock,
  Send,
  AlertTriangle,
  Play
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export default function App() {
  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('devpulse_theme') || 'light');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [healthStatus, setHealthStatus] = useState({ connected: false, uptime: 0 });

  // API Studio State
  const [activeVersion, setActiveVersion] = useState('v2');
  const [activeEndpoint, setActiveEndpoint] = useState('/metrics/code-health');
  const [activeMethod, setActiveMethod] = useState('GET');
  const [apiKey, setApiKey] = useState('devpulse_pro_demo_key');
  const [repoQuery, setRepoQuery] = useState('github.com/devpulse/core-service');
  const [studioLoading, setStudioLoading] = useState(false);
  const [studioResponse, setStudioResponse] = useState(null);
  const [studioHeaders, setStudioHeaders] = useState({});
  const [studioLatency, setStudioLatency] = useState(12);
  const [studioView, setStudioView] = useState('json');
  const [codeLang, setCodeLang] = useState('curl');
  const [copied, setCopied] = useState(false);

  // Rate Limiting Telemetry State
  const [rateLimit, setRateLimit] = useState({ limit: 20, remaining: 20, reset: 60, retryAfter: null });
  const [telemetry, setTelemetry] = useState({ totalCalls: 0, total429s: 0 });

  // Key Vault State
  const [clientName, setClientName] = useState('Acme CI Pipeline');
  const [selectedTier, setSelectedTier] = useState('developer');
  const [mintedKey, setMintedKey] = useState(null);
  const [keyList, setKeyList] = useState([]);
  const [mintLoading, setMintLoading] = useState(false);

  // Burst Simulator State
  const [burstLogs, setBurstLogs] = useState([]);
  const [bursting, setBursting] = useState(false);

  // Apply Theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('devpulse_theme', theme);
  }, [theme]);

  // Check Backend Connection & Fetch Keys
  useEffect(() => {
    checkHealth();
    fetchKeys();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) {
        const data = await res.json();
        setHealthStatus({ connected: true, uptime: data.uptimeSeconds });
      }
    } catch {
      setHealthStatus({ connected: false, uptime: 0 });
    }
  };

  const fetchKeys = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/keys`);
      if (res.ok) {
        const data = await res.json();
        setKeyList(data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle Theme
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Execute API Request
  const executeStudioRequest = async (overrideEndpoint, overrideMethod) => {
    setStudioLoading(true);
    const start = performance.now();
    const endpointToUse = overrideEndpoint || activeEndpoint;
    const methodToUse = overrideMethod || activeMethod;

    let url = `${API_BASE}/api/${activeVersion}${endpointToUse}`;
    if (methodToUse === 'GET' && repoQuery) {
      url += `?repo=${encodeURIComponent(repoQuery)}`;
    }

    const headers = { 'x-api-key': apiKey };
    const options = { method: methodToUse, headers };

    if (methodToUse === 'POST') {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify({
        repo_url: 'https://github.com/devpulse/microservice-audit',
        branch: 'main',
        language: 'typescript',
        analysis_depth: 'standard'
      });
    }

    setTelemetry(prev => ({ ...prev, totalCalls: prev.totalCalls + 1 }));

    try {
      const res = await fetch(url, options);
      const elapsed = Math.round(performance.now() - start);
      setStudioLatency(elapsed);

      const limit = parseInt(res.headers.get('x-ratelimit-limit') || '20', 10);
      const remaining = parseInt(res.headers.get('x-ratelimit-remaining') || '0', 10);
      const reset = res.headers.get('x-ratelimit-reset') || '60';
      const retryAfter = res.headers.get('retry-after');

      setRateLimit({ limit, remaining, reset, retryAfter });

      setStudioHeaders({
        status: `${res.status} ${res.statusText}`,
        limit,
        remaining,
        reset,
        algo: res.headers.get('x-ratelimit-algorithm') || 'sliding-window',
        deprecation: res.headers.get('deprecation'),
        retryAfter
      });

      if (res.status === 429) {
        setTelemetry(prev => ({ ...prev, total429s: prev.total429s + 1 }));
      }

      const json = await res.json();
      setStudioResponse(json);
    } catch (err) {
      setStudioResponse({ error: 'Network Error', message: err.message });
      setStudioHeaders({ status: '500 Server Offline' });
    } finally {
      setStudioLoading(false);
    }
  };

  // Provision New Key
  const handleMintKey = async () => {
    setMintLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/keys/provision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName, tier: selectedTier })
      });
      if (res.ok) {
        const data = await res.json();
        setMintedKey(data.data);
        fetchKeys();
      }
    } catch (e) {
      alert('Minting failed: ' + e.message);
    } finally {
      setMintLoading(false);
    }
  };

  // Run Burst Traffic Simulator
  const runBurstSimulation = async () => {
    setBursting(true);
    setBurstLogs([]);
    const logs = [];

    // Temporarily use free key for immediate 429 demonstration
    const testKey = 'devpulse_free_demo_key';

    for (let i = 1; i <= 8; i++) {
      const start = performance.now();
      try {
        const res = await fetch(`${API_BASE}/api/v2/metrics/code-health`, {
          headers: { 'x-api-key': testKey }
        });
        const elapsed = Math.round(performance.now() - start);
        const remaining = res.headers.get('x-ratelimit-remaining') || '0';
        const retryAfter = res.headers.get('retry-after');

        const entry = {
          id: i,
          status: res.status,
          remaining,
          retryAfter,
          latency: elapsed,
          time: new Date().toLocaleTimeString()
        };
        logs.push(entry);
        setBurstLogs([...logs]);
      } catch (err) {
        logs.push({ id: i, status: 500, error: err.message });
        setBurstLogs([...logs]);
      }
      await new Promise(r => setTimeout(r, 120));
    }
    setBursting(false);
  };

  // Syntax Highlighter
  const renderHighlightedJson = json => {
    if (!json) return '// Click "Send Request" to test endpoint...';
    let str = JSON.stringify(json, null, 2);
    str = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return str.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      match => {
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
        return `<span class="${cls}">${match}</span>`;
      }
    );
  };

  // Calculate Rate Limit Bar Fill
  const quotaPct = Math.max(0, Math.min(100, Math.round((rateLimit.remaining / rateLimit.limit) * 100)));

  return (
    <div className="app-layout">
      {/* 1. App Sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-header">
          <div className="brand-glyph">
            <Layers size={18} />
          </div>
          <div>
            <div className="brand-name">
              DevPulse <span className="brand-tag">v2.0</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard &amp; KPIs</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'studio' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('studio');
              if (!studioResponse) executeStudioRequest();
            }}
          >
            <Terminal size={18} />
            <span>Interactive API Studio</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'vault' ? 'active' : ''}`}
            onClick={() => setActiveTab('vault')}
          >
            <Key size={18} />
            <span>API Key Vault</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'burst' ? 'active' : ''}`}
            onClick={() => setActiveTab('burst')}
          >
            <Zap size={18} />
            <span>Burst 429 Simulator</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'benchmark' ? 'active' : ''}`}
            onClick={() => setActiveTab('benchmark')}
          >
            <Scale size={18} />
            <span>Benchmark Proof</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="connection-pill">
            <span className="pulse-dot"></span>
            <span>{healthStatus.connected ? 'API Online :3000' : 'Reconnecting...'}</span>
          </div>
        </div>
      </aside>

      {/* 2. Main Area */}
      <div className="app-main">
        {/* Topbar */}
        <header className="app-topbar">
          <div className="topbar-left">
            <h1 className="page-title">
              {activeTab === 'dashboard' && 'Engineering Intelligence Dashboard'}
              {activeTab === 'studio' && 'Interactive API Studio & Telemetry'}
              {activeTab === 'vault' && 'API Key Provisioning & Tenants'}
              {activeTab === 'burst' && 'Rapid Burst Traffic & 429 Throttle Proof'}
              {activeTab === 'benchmark' && 'Algorithm Benchmark & Trade-off Matrix'}
            </h1>
          </div>

          <div className="topbar-right">
            <div className="active-key-pill">
              <span>Active Key:</span> <b>{apiKey.substring(0, 15)}...</b>
            </div>

            <button className="topbar-btn" onClick={toggleTheme} title="Toggle Theme">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <a href={`${API_BASE}/docs`} target="_blank" rel="noreferrer" className="topbar-link">
              <span>Swagger Docs</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </header>

        {/* Page Content Body */}
        <div className="page-body">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div>
              {/* KPI Cards */}
              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-header">
                    <span className="kpi-title">Overall Health</span>
                    <div className="kpi-icon"><Activity size={18} /></div>
                  </div>
                  <div className="kpi-value">94<span style={{ fontSize: '1rem', color: 'var(--text-tertiary)' }}>/100</span></div>
                  <div className="kpi-footer">
                    <span className="kpi-badge good">Grade A+</span>
                    <span>Test coverage 87.4%</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-header">
                    <span className="kpi-title">Security CVEs</span>
                    <div className="kpi-icon"><ShieldCheck size={18} /></div>
                  </div>
                  <div className="kpi-value" style={{ color: 'var(--success)' }}>0 <span style={{ fontSize: '1rem' }}>Critical</span></div>
                  <div className="kpi-footer">
                    <span className="kpi-badge good">Protected</span>
                    <span>142 packages audited</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-header">
                    <span className="kpi-title">Technical Debt</span>
                    <div className="kpi-icon"><Clock size={18} /></div>
                  </div>
                  <div className="kpi-value" style={{ color: 'var(--warning)' }}>38.5<span style={{ fontSize: '1rem' }}> hrs</span></div>
                  <div className="kpi-footer">
                    <span className="kpi-badge warn">Manageable</span>
                    <span>14 code smells</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-header">
                    <span className="kpi-title">CI/CD Pipeline</span>
                    <div className="kpi-icon"><Zap size={18} /></div>
                  </div>
                  <div className="kpi-value" style={{ color: 'var(--primary-accent)' }}>14.2<span style={{ fontSize: '1rem' }}>s</span></div>
                  <div className="kpi-footer">
                    <span className="kpi-badge info">Fast</span>
                    <span>Vite / ESBuild bundle</span>
                  </div>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="charts-grid">
                <div className="chart-card">
                  <div className="chart-header">
                    <div className="chart-title">Weekly Quality &amp; Coverage Trend (7-Day Rolling)</div>
                    <div className="chart-legend">
                      <span><span className="legend-dot indigo"></span>Health Index</span>
                      <span><span className="legend-dot emerald"></span>Test Coverage</span>
                    </div>
                  </div>
                  <div className="svg-chart-container">
                    <svg viewBox="0 0 600 180" className="chart-svg">
                      <line x1="0" y1="40" x2="600" y2="40" stroke="var(--border-subtle)" strokeDasharray="4 4" />
                      <line x1="0" y1="90" x2="600" y2="90" stroke="var(--border-subtle)" strokeDasharray="4 4" />
                      <line x1="0" y1="140" x2="600" y2="140" stroke="var(--border-subtle)" strokeDasharray="4 4" />

                      {/* Area Gradient */}
                      <defs>
                        <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Path 1: Health Index */}
                      <path
                        d="M 20 120 Q 120 70, 220 85 T 420 50 T 580 35 L 580 180 L 20 180 Z"
                        fill="url(#indigoGrad)"
                      />
                      <path
                        d="M 20 120 Q 120 70, 220 85 T 420 50 T 580 35"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="3"
                      />

                      {/* Path 2: Coverage */}
                      <path
                        d="M 20 140 Q 120 110, 220 95 T 420 70 T 580 48"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeDasharray="6 3"
                      />

                      {/* Nodes */}
                      <circle cx="580" cy="35" r="5" fill="#6366f1" />
                      <circle cx="580" cy="48" r="5" fill="#10b981" />
                    </svg>
                  </div>
                </div>

                <div className="chart-card">
                  <div className="chart-header">
                    <div className="chart-title">Vulnerability Breakdown</div>
                  </div>
                  <div className="breakdown-list">
                    <div className="breakdown-item">
                      <div className="b-item-header">
                        <span style={{ color: 'var(--danger)' }}>Critical Vulnerabilities</span>
                        <b>0</b>
                      </div>
                      <div className="b-bar-track"><div className="b-bar-fill" style={{ width: '0%', background: 'var(--danger)' }}></div></div>
                    </div>

                    <div className="breakdown-item">
                      <div className="b-item-header">
                        <span style={{ color: 'var(--warning)' }}>Medium Severity</span>
                        <b>2</b>
                      </div>
                      <div className="b-bar-track"><div className="b-bar-fill" style={{ width: '25%', background: 'var(--warning)' }}></div></div>
                    </div>

                    <div className="breakdown-item">
                      <div className="b-item-header">
                        <span style={{ color: 'var(--text-tertiary)' }}>Low / Informational</span>
                        <b>5</b>
                      </div>
                      <div className="b-bar-track"><div className="b-bar-fill" style={{ width: '50%', background: 'var(--text-tertiary)' }}></div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE API STUDIO */}
          {activeTab === 'studio' && (
            <div>
              <div className="studio-grid">
                {/* Left: Request Composer */}
                <div className="studio-panel">
                  <div className="panel-top">
                    <div className="panel-title-group">
                      <span className="panel-dot red"></span>
                      <span className="panel-dot yellow"></span>
                      <span className="panel-dot green"></span>
                      <span className="panel-title">Request Composer</span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        className={`ep-btn ${activeVersion === 'v2' ? 'active' : ''}`}
                        onClick={() => setActiveVersion('v2')}
                        style={{ padding: '2px 8px', fontSize: '0.725rem' }}
                      >
                        v2 Enveloped
                      </button>
                      <button
                        className={`ep-btn ${activeVersion === 'v1' ? 'active' : ''}`}
                        onClick={() => setActiveVersion('v1')}
                        style={{ padding: '2px 8px', fontSize: '0.725rem' }}
                      >
                        v1 Deprecated
                      </button>
                    </div>
                  </div>

                  {/* Endpoints */}
                  <div className="endpoint-selector">
                    {[
                      { path: '/metrics/code-health', label: 'Code Health', method: 'GET' },
                      { path: '/metrics/security-audit', label: 'Security Audit', method: 'GET' },
                      { path: '/metrics/tech-debt', label: 'Tech Debt', method: 'GET' },
                      { path: '/metrics/build-benchmarks', label: 'Build Timings', method: 'GET' },
                      { path: '/analyze/repository', label: 'Analyze Repo', method: 'POST' }
                    ].map(ep => (
                      <button
                        key={ep.path}
                        className={`ep-btn ${activeEndpoint === ep.path ? 'active' : ''}`}
                        onClick={() => {
                          setActiveEndpoint(ep.path);
                          setActiveMethod(ep.method);
                        }}
                      >
                        <span className={`method-pill ${ep.method.toLowerCase()}`}>{ep.method}</span>
                        <span>{ep.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Dispatch Bar */}
                  <div className="dispatch-bar">
                    <span className={`method-pill ${activeMethod.toLowerCase()}`}>{activeMethod}</span>
                    <input
                      className="dispatch-input"
                      value={`/api/${activeVersion}${activeEndpoint}${activeMethod === 'GET' ? `?repo=${repoQuery}` : ''}`}
                      readOnly
                    />
                    <button className="btn-run" onClick={() => executeStudioRequest()} disabled={studioLoading}>
                      <Play size={14} fill="currentColor" />
                      <span>{studioLoading ? 'Running...' : 'Execute'}</span>
                    </button>
                  </div>

                  {/* Form Parameters */}
                  <div className="studio-form">
                    <div className="s-field">
                      <label>Active API Key (<code>x-api-key</code>)</label>
                      <input
                        className="s-input"
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                      />
                    </div>

                    {activeMethod === 'GET' && (
                      <div className="s-field">
                        <label>Repository Target Query (<code>?repo=</code>)</label>
                        <input
                          className="s-input"
                          value={repoQuery}
                          onChange={e => setRepoQuery(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Inspector */}
                <div className="studio-panel">
                  {/* Telemetry Header */}
                  <div className="telemetry-header">
                    <div className="quota-meter-head">
                      <span className="quota-label">Fair-Use Sliding Window:</span>
                      <span className="quota-numbers">{rateLimit.remaining} / {rateLimit.limit} Remaining ({quotaPct}%)</span>
                    </div>
                    <div className="meter-track">
                      <div
                        className={`meter-fill ${quotaPct < 20 ? 'empty' : quotaPct < 50 ? 'mid' : ''}`}
                        style={{ width: `${quotaPct}%` }}
                      ></div>
                    </div>
                    <div className="meter-footer">
                      <span>Status: <b style={{ color: 'var(--success)' }}>{studioHeaders.status || '200 OK'}</b> ({studioLatency}ms)</span>
                      <span>Reset: in {rateLimit.reset}s</span>
                    </div>
                  </div>

                  {/* View Tabs */}
                  <div className="view-tabs">
                    <button
                      className={`view-tab ${studioView === 'json' ? 'active' : ''}`}
                      onClick={() => setStudioView('json')}
                    >
                      <Terminal size={14} />
                      <span>Syntax JSON</span>
                    </button>
                    <button
                      className={`view-tab ${studioView === 'visual' ? 'active' : ''}`}
                      onClick={() => setStudioView('visual')}
                    >
                      <LayoutDashboard size={14} />
                      <span>Visual Card View</span>
                    </button>
                  </div>

                  {/* JSON Display */}
                  {studioView === 'json' && (
                    <div className="json-display">
                      <pre dangerouslySetInnerHTML={{ __html: renderHighlightedJson(studioResponse) }} />
                    </div>
                  )}

                  {/* Visual Card View */}
                  {studioView === 'visual' && (
                    <div className="visual-inspector">
                      {activeEndpoint.includes('code-health') && (
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Code Health Index</h3>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                            <div className="kpi-card">
                              <span className="kpi-title">Health Score</span>
                              <div className="kpi-value" style={{ color: 'var(--success)' }}>94 / 100</div>
                            </div>
                            <div className="kpi-card">
                              <span className="kpi-title">Maintainability</span>
                              <div className="kpi-value" style={{ color: 'var(--primary-accent)' }}>89.1</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeEndpoint.includes('security-audit') && (
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Security Audit Status</h3>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Zero critical threats detected across 142 packages.</p>
                        </div>
                      )}

                      {activeEndpoint.includes('tech-debt') && (
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Technical Debt</h3>
                          <div className="kpi-value" style={{ color: 'var(--warning)', marginTop: '0.5rem' }}>38.5 Hours Estimated</div>
                        </div>
                      )}

                      {activeEndpoint.includes('build-benchmarks') && (
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>CI/CD Build Timings</h3>
                          <div className="kpi-value" style={{ color: 'var(--primary-accent)', marginTop: '0.5rem' }}>22.8s Total Pipeline</div>
                        </div>
                      )}

                      {activeEndpoint.includes('analyze') && (
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Async Analysis Job</h3>
                          <p style={{ color: 'var(--text-secondary)' }}>Job queued for repository AST processing.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: API KEY VAULT */}
          {activeTab === 'vault' && (
            <div>
              <div className="key-provision-box">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>Provision Custom API Key</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Create custom API credentials on-the-fly and bind them to fair-use rate-limiting tiers.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr auto', gap: '1rem', alignItems: 'flex-end' }}>
                  <div className="s-field">
                    <label>Application / Service Name</label>
                    <input
                      className="s-input"
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                    />
                  </div>

                  <div className="s-field">
                    <label>Subscription Tier</label>
                    <select
                      className="s-input"
                      value={selectedTier}
                      onChange={e => setSelectedTier(e.target.value)}
                    >
                      <option value="free">Free Starter (5 req / 60s)</option>
                      <option value="developer">Developer Pro (20 req / 60s)</option>
                      <option value="enterprise">Enterprise (100 req / 60s)</option>
                    </select>
                  </div>

                  <button className="btn-run" onClick={handleMintKey} disabled={mintLoading}>
                    <Key size={15} />
                    <span>{mintLoading ? 'Minting...' : 'Mint API Key'}</span>
                  </button>
                </div>

                {mintedKey && (
                  <div style={{
                    marginTop: '1.25rem',
                    padding: '1rem',
                    background: 'var(--success-bg)',
                    border: '1px solid var(--success-border)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, background: 'var(--success)', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>MINTED</span>
                      <code style={{ marginLeft: '0.75rem', fontFamily: 'Fira Code', fontWeight: 700 }}>{mintedKey.key}</code>
                      <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>({mintedKey.quota} req/60s)</span>
                    </div>

                    <button
                      className="btn-run"
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem' }}
                      onClick={() => {
                        setApiKey(mintedKey.key);
                        alert(`Active Key updated to ${mintedKey.key}`);
                      }}
                    >
                      Use as Active Key
                    </button>
                  </div>
                )}
              </div>

              {/* Active Keys Table */}
              <div className="chart-card">
                <div className="chart-title">Active Tenant Key Directory ({keyList.length} Registered)</div>
                <table className="key-table">
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th>API Key</th>
                      <th>Tier</th>
                      <th>Quota</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keyList.map(k => (
                      <tr key={k.key}>
                        <td><b>{k.clientName}</b></td>
                        <td><code>{k.key}</code></td>
                        <td><span className="kpi-badge info">{k.tier}</span></td>
                        <td>{k.quota} req / {k.windowSeconds}s</td>
                        <td><span className="kpi-badge good">{k.status}</span></td>
                        <td>
                          <button
                            className="ep-btn"
                            style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                            onClick={() => {
                              setApiKey(k.key);
                              alert(`Active key set to: ${k.key}`);
                            }}
                          >
                            Select
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: BURST SIMULATOR */}
          {activeTab === 'burst' && (
            <div>
              <div className="chart-card">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>Rapid Burst Traffic Simulator</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Fires rapid consecutive calls to Free Tier (limit: 5 req/60s) to demonstrate rate limit exhaustion and the 200 OK ➡️ 429 Too Many Requests transition.
                </p>

                <button className="btn-run" onClick={runBurstSimulation} disabled={bursting}>
                  <Zap size={16} />
                  <span>{bursting ? 'Simulating Surge...' : 'Fire 8-Request Burst Traffic'}</span>
                </button>

                <div className="burst-log-terminal">
                  {burstLogs.length === 0 ? (
                    <div style={{ color: 'var(--text-tertiary)' }}>Click button above to initiate surge test...</div>
                  ) : (
                    burstLogs.map(log => (
                      <div key={log.id} className="burst-entry">
                        <span style={{ color: 'var(--text-tertiary)' }}>[{log.time}]</span>
                        <span>Call #{log.id}:</span>
                        <span className={`b-status ${log.status === 200 ? 'ok' : 'throttled'}`}>
                          {log.status === 200 ? '✅ 200 OK' : `🛑 ${log.status} TOO MANY REQUESTS`}
                        </span>
                        <span>Remaining: {log.remaining}/5</span>
                        {log.retryAfter && <span style={{ color: '#f87171' }}>Retry-After: {log.retryAfter}s</span>}
                        <span style={{ color: 'var(--text-tertiary)' }}>({log.latency}ms)</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BENCHMARK PROOF */}
          {activeTab === 'benchmark' && (
            <div>
              <div className="section-head">
                <h2>Special Constraint: Comparison Rule Analysis</h2>
                <p>Empirical benchmark proving Sliding Window Counter's superiority over Fixed Window Counter.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="chart-card" style={{ borderLeft: '4px solid var(--danger)' }}>
                  <span className="kpi-badge warn" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>Approach A • Vulnerable</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Fixed Window Counter</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.5rem 0 1rem 0' }}>
                    Resets at epoch boundary. Allows burst attacks across window edges.
                  </p>
                  <div className="breakdown-list">
                    <div className="b-item-row"><span style={{ color: 'var(--text-tertiary)' }}>Boundary Burst Test:</span> <b style={{ color: 'var(--danger)' }}>40 req / 2s (200% Limit)</b></div>
                    <div className="b-item-row"><span style={{ color: 'var(--text-tertiary)' }}>Check Latency:</span> <b>~503 ns</b></div>
                    <div className="b-item-row"><span style={{ color: 'var(--text-tertiary)' }}>Memory Complexity:</span> <b>O(1)</b></div>
                    <div className="b-item-row"><span style={{ color: 'var(--text-tertiary)' }}>Production Verdict:</span> <b style={{ color: 'var(--danger)' }}>FAILS Fair-Use Rule</b></div>
                  </div>
                </div>

                <div className="chart-card" style={{ borderLeft: '4px solid var(--success)' }}>
                  <span className="kpi-badge good" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>Approach B • Production Choice</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Sliding Window Counter</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.5rem 0 1rem 0' }}>
                    Applies weighted rolling decay to smooth traffic spikes across boundaries.
                  </p>
                  <div className="breakdown-list">
                    <div className="b-item-row"><span style={{ color: 'var(--text-tertiary)' }}>Boundary Burst Test:</span> <b style={{ color: 'var(--success)' }}>21 req / 2s (Strictly Capped)</b></div>
                    <div className="b-item-row"><span style={{ color: 'var(--text-tertiary)' }}>Check Latency:</span> <b>~958 ns (Sub-microsecond)</b></div>
                    <div className="b-item-row"><span style={{ color: 'var(--text-tertiary)' }}>Memory Complexity:</span> <b>O(1)</b></div>
                    <div className="b-item-row"><span style={{ color: 'var(--text-tertiary)' }}>Production Verdict:</span> <b style={{ color: 'var(--success)' }}>SELECTED FOR PRODUCTION</b></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
