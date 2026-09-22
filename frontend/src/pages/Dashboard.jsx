import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/Badge';
import {
  Boxes,
  CheckCircle2,
  Share2,
  Wrench,
  PackageSearch,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/dashboard');
      setData(res.data.data);
    } catch (err) {
      setError('Failed to fetch real-time dashboard data from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const CATEGORY_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: '#2563eb' }} />
          <p>Loading real-time institutional metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>
        <p>{error}</p>
        <button onClick={fetchDashboard} className="btn-primary" style={{ marginTop: '1rem' }}>
          Retry
        </button>
      </div>
    );
  }

  const { cards, charts, recentActivities, recentIssues } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner & Quick Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            Institutional Operations Dashboard
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
            Centralized laboratory asset health, stock availability, and checkout tracking.
          </p>
        </div>
        <button onClick={fetchDashboard} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
          <RefreshCw size={14} />
          Refresh Stats
        </button>
      </div>

      {/* 8 Operational Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
      }}>
        <StatCard
          title="Total Assets"
          value={cards.totalAssets}
          icon={Boxes}
          color="blue"
          subtitle="Registered in system"
          onClick={() => navigate('/assets')}
        />
        <StatCard
          title="Available Assets"
          value={cards.availableAssets}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Ready for issuance"
          onClick={() => navigate('/assets?status=Available')}
        />
        <StatCard
          title="Issued Assets"
          value={cards.issuedAssets}
          icon={Share2}
          color="purple"
          subtitle="Active student/staff loans"
          onClick={() => navigate('/issues')}
        />
        <StatCard
          title="Under Maintenance"
          value={cards.underMaintenanceAssets}
          icon={Wrench}
          color="amber"
          subtitle="Repair & calibration"
          onClick={() => navigate('/maintenance')}
        />
        <StatCard
          title="Inventory Items"
          value={cards.totalInventoryItems}
          icon={PackageSearch}
          color="slate"
          subtitle="Consumable lines"
          onClick={() => navigate('/inventory')}
        />
        <StatCard
          title="Low Stock Items"
          value={cards.lowStockCount}
          icon={AlertTriangle}
          color="amber"
          subtitle="Below minimum threshold"
          onClick={() => navigate('/inventory?status=Low Stock')}
        />
        <StatCard
          title="Out of Stock Items"
          value={cards.outOfStockCount}
          icon={XCircle}
          color="rose"
          subtitle="Zero quantity remaining"
          onClick={() => navigate('/inventory?status=Out of Stock')}
        />
        <StatCard
          title="Overdue Returns"
          value={cards.overdueReturnsCount}
          icon={Clock}
          color="rose"
          subtitle="Past expected return date"
          onClick={() => navigate('/issues?status=Overdue')}
        />
      </div>

      {/* Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '1.25rem',
      }}>
        {/* Chart 1: Assets by Category */}
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
            Assets by Category
          </h3>
          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={charts.assetsByCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {charts.assetsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Assets by Department */}
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
            Equipment by Department
          </h3>
          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={charts.assetsByDepartment} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="department" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="Assets Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Inventory Stock Health */}
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
            Consumables Stock Status
          </h3>
          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={charts.inventoryStatus} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" name="Items" radius={[4, 4, 0, 0]}>
                  {charts.inventoryStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Maintenance Status Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
            Equipment Maintenance Work Orders
          </h3>
          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={charts.maintenanceBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Work Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two-Column Activity Feeds */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '1.25rem',
      }}>
        {/* Recent Asset Checkouts */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
              Recent Asset Checkouts
            </h3>
            <button
              onClick={() => navigate('/issues')}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
            >
              View All <ArrowRight size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recentIssues && recentIssues.length > 0 ? (
              recentIssues.map((issue) => (
                <div
                  key={issue._id}
                  style={{
                    padding: '0.85rem 1.25rem',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>
                      {issue.assetName} <span style={{ color: '#64748b', fontSize: '0.75rem' }}>({issue.assetId})</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Issued to: <strong>{issue.issuedTo.name}</strong> ({issue.issuedTo.identifier})
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <StatusBadge status={issue.status} />
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      {new Date(issue.issueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                No recent checkouts.
              </div>
            )}
          </div>
        </div>

        {/* Recent System Activity Logs */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
              System Audit Stream
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Latest 10 Actions</span>
          </div>

          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.map((act) => (
                <div
                  key={act._id}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#2563eb',
                    marginTop: '6px',
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: '#0f172a', lineHeight: 1.4 }}>
                      {act.description}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem', display: 'flex', gap: '0.5rem' }}>
                      <span>By <strong>{act.userName}</strong> ({act.userRole})</span>
                      <span>&bull;</span>
                      <span>{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                No audit activity recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
