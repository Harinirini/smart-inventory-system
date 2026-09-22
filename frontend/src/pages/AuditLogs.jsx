import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { ShieldAlert, Search, RefreshCw, Filter, Shield, User } from 'lucide-react';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('All');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm || undefined,
        module: selectedModule !== 'All' ? selectedModule : undefined,
        limit: 150,
      };
      const res = await api.get('/audit-logs', { params });
      setLogs(res.data.data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedModule]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
              System Audit Trail & Accountability
            </h1>
            <span className="badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Shield size={12} /> Administrator Only
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Permanent record of all institutional logins, asset creations, stock updates, checkouts, and repairs.
          </p>
        </div>

        <button onClick={fetchLogs} className="btn-secondary">
          <RefreshCw size={15} />
          Refresh Audit
        </button>
      </div>

      {/* Filter and Search */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>
              Search Audit Trail
            </label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                placeholder="Search by action, user name, record ID, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') fetchLogs(); }}
              />
              <button onClick={fetchLogs} className="btn-primary" style={{ padding: '0.5rem 0.8rem' }}>
                <Search size={15} />
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>
              Module Filter
            </label>
            <select value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)}>
              <option value="All">All Modules</option>
              <option value="Asset">Asset Registry</option>
              <option value="Inventory">Inventory (Stock)</option>
              <option value="IssueReturn">Issue & Return</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Auth">Authentication</option>
              <option value="User">User Management</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action & Module</th>
              <th>Initiated By</th>
              <th>Record Ref</th>
              <th>Activity Description</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: '#2563eb' }} />
                  Loading audit logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  No audit trail records matched the criteria.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id}>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 600 }}>
                      {new Date(log.createdAt).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      backgroundColor: '#eff6ff',
                      color: '#1d4ed8',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}>
                      {log.action}
                    </span>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
                      Module: {log.module}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>
                      {log.userName}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'capitalize' }}>
                      {log.userRole?.replace('_', ' ')}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2563eb' }}>
                      {log.recordId || '—'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: '#334155' }}>
                      {log.description}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                      {log.ipAddress || '127.0.0.1'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
