// pages/admin.tsx
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ModelCapabilities {
  loss?: string;
  learning_schedule?: string;
  supports_user_embeddings?: boolean;
  supports_item_embeddings?: boolean;
  user_embedding_shape?: number[] | null;
  item_embedding_shape?: number[] | null;
  mapping_keys?: string[];
}

interface ModelInfo {
  model_name: string;
  version: string;
  mode: string;
  experiment: string;
  created_at: string;
  metrics: Record<string, number>;
  capabilities?: ModelCapabilities;
}

export default function AdminDashboard() {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/model/info`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setModelInfo(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Unknown error');
        setLoading(false);
      });
  }, []);

  const formatDate = (iso?: string) => {
    if (!iso || iso === 'unknown') return '—';
    try {
      return new Date(iso).toLocaleString('th-TH', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return iso;
    }
  };

  const formatMode = (mode?: string) => {
    if (mode === 'lightfm') return 'LightFM';
    if (mode === 'cbf') return 'CBF Only';
    return mode || '—';
  };

  const metric = (key: string, fallback = '—') => {
    const value = modelInfo?.metrics?.[key];
    if (value === undefined || value === null || Number.isNaN(value)) return fallback;
    if (!Number.isInteger(value)) return value.toFixed(3);
    return String(value);
  };

  const summaryCards = useMemo(() => {
    if (!modelInfo) return [];
    return [
      { label: 'Version', value: modelInfo.version || '—', tone: 'accent' },
      { label: 'Mode', value: formatMode(modelInfo.mode), tone: 'teal' },
      { label: 'Loss', value: modelInfo.capabilities?.loss || '—', tone: 'purple' },
      { label: 'Created At', value: formatDate(modelInfo.created_at), tone: 'default' },
    ];
  }, [modelInfo]);

  return (
    <>
      <Head>
        <title>Admin Dashboard — PetriCommend</title>
      </Head>

      <header className="topbar">
        <Link href="/" className="brand">
          <div className="brand-icon">🐾</div>
          <div className="brand-text">
            <div className="name">PetriCommend</div>
            <div className="sub">Admin View</div>
          </div>
        </Link>

        <nav className="nav-links">
          <Link href="/" className="nav-link">← Back to App</Link>
        </nav>

        <div className="badge badge-danger">🔒 Admin / Demo Only</div>
      </header>

      <main className="page">
        <div className="container admin-wrap">
          <section className="hero card-like">
            <div>
              <div className="eyebrow">MODEL MONITORING</div>
              <h1>Recommendation Model Dashboard</h1>
              <p>
                Live model metadata, training setup, embedding capability, and dataset footprint.
              </p>
            </div>

            <div className="hero-status">
              <div className={`badge ${error ? 'badge-danger' : loading ? 'badge-muted' : 'badge-ok'}`}>
                {error ? 'Backend Disconnected' : loading ? 'Loading...' : 'Backend Connected'}
              </div>
              <div className="status-note">{API_BASE}/model/info</div>
            </div>
          </section>

          {loading && (
            <section className="card-like message-card">
              Loading model information...
            </section>
          )}

          {error && (
            <section className="card-like message-card error-card">
              ⚠️ Cannot connect to backend: {error}
            </section>
          )}

          {modelInfo && (
            <>
              <section className="summary-grid">
                {summaryCards.map((item) => (
                  <div key={item.label} className="card-like stat-card">
                    <div className="stat-label">{item.label}</div>
                    <div className={`stat-value tone-${item.tone}`}>{item.value}</div>
                  </div>
                ))}
              </section>

              <section className="content-grid">
                <div className="card-like panel">
                  <div className="section-title">Overview</div>
                  <div className="info-list">
                    <div className="info-row">
                      <span>Model Name</span>
                      <strong>{modelInfo.model_name || '—'}</strong>
                    </div>
                    <div className="info-row">
                      <span>Experiment</span>
                      <strong>{modelInfo.experiment || '—'}</strong>
                    </div>
                    <div className="info-row">
                      <span>Mode</span>
                      <strong>{formatMode(modelInfo.mode)}</strong>
                    </div>
                    <div className="info-row">
                      <span>Created At</span>
                      <strong>{formatDate(modelInfo.created_at)}</strong>
                    </div>
                  </div>
                </div>

                <div className="card-like panel">
                  <div className="section-title">Training Setup</div>
                  <div className="mini-grid">
                    <div className="mini-stat">
                      <span>Components</span>
                      <strong>{metric('num_components')}</strong>
                    </div>
                    <div className="mini-stat">
                      <span>Epochs</span>
                      <strong>{metric('epochs')}</strong>
                    </div>
                    <div className="mini-stat">
                      <span>Learning Rate</span>
                      <strong>{metric('learning_rate')}</strong>
                    </div>
                    <div className="mini-stat">
                      <span>K</span>
                      <strong>{metric('k')}</strong>
                    </div>
                  </div>
                </div>

                <div className="card-like panel">
                  <div className="section-title">Embedding Capabilities</div>

                  <div className="capability-list">
                    <div className="cap-item">
                      <div>
                        <div className="cap-title">User Embeddings</div>
                        <div className="cap-sub">
                          Shape: {modelInfo.capabilities?.user_embedding_shape?.join(' × ') || '—'}
                        </div>
                      </div>
                      <span className={`badge ${modelInfo.capabilities?.supports_user_embeddings ? 'badge-ok' : 'badge-muted'}`}>
                        {modelInfo.capabilities?.supports_user_embeddings ? 'Supported' : 'Unavailable'}
                      </span>
                    </div>

                    <div className="cap-item">
                      <div>
                        <div className="cap-title">Item Embeddings</div>
                        <div className="cap-sub">
                          Shape: {modelInfo.capabilities?.item_embedding_shape?.join(' × ') || '—'}
                        </div>
                      </div>
                      <span className={`badge ${modelInfo.capabilities?.supports_item_embeddings ? 'badge-ok' : 'badge-muted'}`}>
                        {modelInfo.capabilities?.supports_item_embeddings ? 'Supported' : 'Unavailable'}
                      </span>
                    </div>

                    <div className="cap-item">
                      <div>
                        <div className="cap-title">Loss Function</div>
                        <div className="cap-sub">{modelInfo.capabilities?.loss || '—'}</div>
                      </div>
                      <span className="badge badge-muted">Training</span>
                    </div>

                    <div className="cap-item">
                      <div>
                        <div className="cap-title">Learning Schedule</div>
                        <div className="cap-sub">{modelInfo.capabilities?.learning_schedule || '—'}</div>
                      </div>
                      <span className="badge badge-muted">Optimizer</span>
                    </div>
                  </div>
                </div>

                <div className="card-like panel">
                  <div className="section-title">System Footprint</div>
                  <div className="mini-grid">
                    <div className="mini-stat">
                      <span>Foods</span>
                      <strong>{metric('foods_count')}</strong>
                    </div>
                    <div className="mini-stat">
                      <span>Breeds</span>
                      <strong>{metric('breeds_count')}</strong>
                    </div>
                    <div className="mini-stat">
                      <span>User IDs</span>
                      <strong>{metric('user_ids')}</strong>
                    </div>
                    <div className="mini-stat">
                      <span>Item IDs</span>
                      <strong>{metric('item_ids')}</strong>
                    </div>
                    <div className="mini-stat">
                      <span>User Features</span>
                      <strong>{metric('user_features')}</strong>
                    </div>
                    <div className="mini-stat">
                      <span>Item Features</span>
                      <strong>{metric('item_features')}</strong>
                    </div>
                  </div>
                </div>
              </section>

              <section className="card-like panel">
                <div className="section-title">Available Mappings</div>
                <div className="tag-wrap">
                  {(modelInfo.capabilities?.mapping_keys || []).length > 0 ? (
                    modelInfo.capabilities?.mapping_keys?.map((key) => (
                      <span key={key} className="tag-chip">{key}</span>
                    ))
                  ) : (
                    <div className="muted">—</div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      <style jsx>{`
        .page {
          min-height: calc(100vh - 64px);
          background: var(--bg-primary);
          padding: 40px 24px;
        }

        .admin-wrap {
          max-width: 1100px;
        }

        .hero {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 24px;
        margin-bottom: 24px;
        padding: 24px 28px;
        min-height: unset;
        }

        .eyebrow {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-3);
          margin-bottom: 8px;
        }

        .hero h1 {
          margin: 0 0 8px;
          font-size: 28px;
          font-weight: 900;
          color: var(--text-1, #fff);
        }

        .hero p {
          margin: 0;
          color: var(--text-3);
          max-width: 680px;
          line-height: 1.6;
        }

        .hero-status {
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: flex-end;
        }

        .status-note {
          font-size: 12px;
          color: var(--text-3);
        }

        .card-like {
          background: var(--bg-card);
          border: 1px solid rgba(123, 111, 240, 0.10);
          border-radius: 18px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .message-card {
          padding: 20px 24px;
          margin-bottom: 24px;
          color: var(--text-3);
        }

        .error-card {
          color: var(--pink);
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 24px;
        }

        .stat-card {
          padding: 20px;
        }

        .stat-label {
          font-size: 12px;
          color: var(--text-3);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 10px;
          font-weight: 800;
        }

        .stat-value {
          font-size: 22px;
          font-weight: 900;
          line-height: 1.3;
          color: var(--text-1, #fff);
          word-break: break-word;
        }

        .tone-accent {
          color: var(--accent);
        }

        .tone-teal {
          color: var(--teal);
        }

        .tone-purple {
          color: var(--purple);
        }

        .tone-default {
          color: var(--text-1, #fff);
        }

        .content-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 18px;
        }

        .panel {
          padding: 22px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 16px;
          color: var(--text-1, #fff);
        }

        .info-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(123, 111, 240, 0.08);
        }

        .info-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .info-row span {
          color: var(--text-3);
        }

        .info-row strong {
          color: var(--text-1, #fff);
          text-align: right;
        }

        .mini-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .mini-stat {
          padding: 16px;
          border-radius: 14px;
          background: rgba(123, 111, 240, 0.04);
          border: 1px solid rgba(123, 111, 240, 0.08);
        }

        .mini-stat span {
          display: block;
          color: var(--text-3);
          font-size: 12px;
          margin-bottom: 8px;
          font-weight: 700;
        }

        .mini-stat strong {
          color: var(--text-1, #fff);
          font-size: 22px;
          font-weight: 900;
        }

        .capability-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .cap-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 14px 16px;
          border-radius: 14px;
          background: rgba(123, 111, 240, 0.04);
          border: 1px solid rgba(123, 111, 240, 0.08);
        }

        .cap-title {
          color: var(--text-1, #fff);
          font-weight: 800;
          margin-bottom: 4px;
        }

        .cap-sub {
          color: var(--text-3);
          font-size: 13px;
        }

        .tag-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .tag-chip {
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(123, 111, 240, 0.10);
          border: 1px solid rgba(123, 111, 240, 0.18);
          color: var(--purple);
          font-size: 13px;
          font-weight: 700;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          border: 1px solid transparent;
          white-space: nowrap;
        }

        .badge-ok {
          background: rgba(0, 201, 167, 0.10);
          color: var(--teal);
          border-color: rgba(0, 201, 167, 0.20);
        }

        .badge-muted {
          background: rgba(123, 111, 240, 0.08);
          color: var(--text-2, #ddd);
          border-color: rgba(123, 111, 240, 0.14);
        }

        .badge-danger {
          background: rgba(253, 121, 168, 0.10);
          color: var(--pink);
          border-color: rgba(253, 121, 168, 0.18);
        }

        .muted {
          color: var(--text-3);
        }

        @media (max-width: 980px) {
          .summary-grid,
          .content-grid {
            grid-template-columns: 1fr;
          }

          .hero {
            flex-direction: column;
          }

          .hero-status {
            align-items: flex-start;
          }
        }
      `}</style>
    </>
  );
}