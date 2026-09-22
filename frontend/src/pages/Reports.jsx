import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { StatusBadge } from '../components/common/Badge';
import {
  BarChart3,
  FileSpreadsheet,
  Printer,
  Boxes,
  PackageSearch,
  Wrench,
  ClipboardCheck,
  RefreshCw,
  Filter,
} from 'lucide-react';

export const Reports = () => {
  const [activeTab, setActiveTab] = useState('assets');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const fetchReport = async () => {
    try {
      setLoading(true);
      let endpoint = '/reports/assets';
      const params = {};

      if (activeTab === 'assets') {
        endpoint = '/reports/assets';
        if (departmentFilter !== 'All') params.department = departmentFilter;
        if (categoryFilter !== 'All') params.category = categoryFilter;
      } else if (activeTab === 'inventory') {
        endpoint = '/reports/inventory';
        if (categoryFilter !== 'All') params.category = categoryFilter;
      } else if (activeTab === 'maintenance') {
        endpoint = '/reports/maintenance';
      }

      const res = await api.get(endpoint, { params });
      setReportData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab, departmentFilter, categoryFilter]);

  // Export CSV
  const handleExportCSV = () => {
    if (!reportData) return;

    let headers = [];
    let rows = [];
    let filename = `Report_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;

    if (activeTab === 'assets' && reportData.assets) {
      headers = ['Asset ID', 'Name', 'Category', 'Department', 'Laboratory', 'Status', 'Condition', 'Cost (INR)', 'Serial Number'];
      rows = reportData.assets.map((a) => [
        a.assetId,
        `"${a.name.replace(/"/g, '""')}"`,
        a.category,
        `"${a.department}"`,
        `"${a.laboratory}"`,
        a.status,
        a.condition,
        a.purchaseCost || 0,
        a.serialNumber || 'N/A',
      ]);
    } else if (activeTab === 'inventory' && reportData.items) {
      headers = ['Item ID', 'Name', 'Category', 'Quantity', 'Unit', 'Min Threshold', 'Unit Cost (INR)', 'Total Value (INR)', 'Status'];
      rows = reportData.items.map((i) => [
        i.itemId,
        `"${i.name.replace(/"/g, '""')}"`,
        i.category,
        i.quantity,
        i.unit,
        i.minStockLevel,
        i.unitCost || 0,
        (i.quantity || 0) * (i.unitCost || 0),
        i.stockStatus,
      ]);
    } else if (activeTab === 'maintenance' && reportData.records) {
      headers = ['Order ID', 'Asset ID', 'Asset Name', 'Type', 'Scheduled Date', 'Completed Date', 'Technician', 'Cost (INR)', 'Status'];
      rows = reportData.records.map((m) => [
        m.maintenanceId,
        m.assetId,
        `"${m.assetName.replace(/"/g, '""')}"`,
        m.maintenanceType,
        new Date(m.scheduledDate).toLocaleDateString(),
        m.completedDate ? new Date(m.completedDate).toLocaleDateString() : 'N/A',
        `"${m.technician || 'In-House'}"`,
        m.cost || 0,
        m.status,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
            Institutional Analytics & Reports
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Generate and export department equipment registers, inventory valuations, and maintenance expense audits.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleExportCSV} className="btn-secondary">
            <FileSpreadsheet size={16} />
            Export CSV
          </button>
          <button onClick={handlePrint} className="btn-primary">
            <Printer size={16} />
            Print Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="no-print" style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '0.5rem',
      }}>
        <button
          onClick={() => setActiveTab('assets')}
          className={activeTab === 'assets' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '0.85rem' }}
        >
          <Boxes size={16} />
          Asset Valuation Report
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={activeTab === 'inventory' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '0.85rem' }}
        >
          <PackageSearch size={16} />
          Consumable Stock Report
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={activeTab === 'maintenance' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '0.85rem' }}
        >
          <Wrench size={16} />
          Maintenance Expenditure Report
        </button>
      </div>

      {/* Printable Report Header */}
      <div className="print-only" style={{ display: 'none', marginBottom: '1.5rem', textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>College of Engineering & Technology</h2>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2563eb' }}>
          Smart Inventory and Asset Management System - Official Report
        </h3>
        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Report Type: {activeTab.toUpperCase()} &bull; Generated Date: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Summary KPI Cards for Active Report */}
      {reportData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {activeTab === 'assets' && (
            <>
              <div className="card" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1d4ed8' }}>Total Filtered Assets</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e3a8a', marginTop: '0.25rem' }}>
                  {reportData.totalAssets}
                </div>
              </div>
              <div className="card" style={{ backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#047857' }}>Total Asset Valuation</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#064e3b', marginTop: '0.25rem' }}>
                  ₹ {reportData.totalValuation?.toLocaleString()}
                </div>
              </div>
            </>
          )}

          {activeTab === 'inventory' && (
            <>
              <div className="card" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1d4ed8' }}>Total Items Cataloged</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e3a8a', marginTop: '0.25rem' }}>
                  {reportData.totalItems}
                </div>
              </div>
              <div className="card" style={{ backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#047857' }}>Total Stock Inventory Value</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#064e3b', marginTop: '0.25rem' }}>
                  ₹ {reportData.totalStockValue?.toLocaleString()}
                </div>
              </div>
              <div className="card" style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#b45309' }}>Low Stock Flagged</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#78350f', marginTop: '0.25rem' }}>
                  {reportData.lowStockCount}
                </div>
              </div>
              <div className="card" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#b91c1c' }}>Depleted (Out of Stock)</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7f1d1d', marginTop: '0.25rem' }}>
                  {reportData.outOfStockCount}
                </div>
              </div>
            </>
          )}

          {activeTab === 'maintenance' && (
            <>
              <div className="card" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1d4ed8' }}>Total Service Orders</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e3a8a', marginTop: '0.25rem' }}>
                  {reportData.totalRecords}
                </div>
              </div>
              <div className="card" style={{ backgroundColor: '#f5f3ff', borderColor: '#ddd6fe' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6d28d9' }}>Total Maintenance Expenditure</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4c1d95', marginTop: '0.25rem' }}>
                  ₹ {reportData.totalExpense?.toLocaleString()}
                </div>
              </div>
              <div className="card" style={{ backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#047857' }}>Completed Jobs</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#064e3b', marginTop: '0.25rem' }}>
                  {reportData.completedCount}
                </div>
              </div>
              <div className="card" style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#b45309' }}>Pending / In Progress</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#78350f', marginTop: '0.25rem' }}>
                  {reportData.pendingCount}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Report Data Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: '#2563eb' }} />
            Calculating report metrics...
          </div>
        ) : activeTab === 'assets' ? (
          <table>
            <thead>
              <tr>
                <th>Asset Code</th>
                <th>Equipment Name</th>
                <th>Category</th>
                <th>Department & Lab</th>
                <th>Status</th>
                <th>Valuation (₹)</th>
              </tr>
            </thead>
            <tbody>
              {reportData?.assets?.map((a) => (
                <tr key={a._id}>
                  <td><strong>{a.assetId}</strong></td>
                  <td>{a.name}</td>
                  <td>{a.category}</td>
                  <td>{a.department} &bull; {a.laboratory}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td style={{ fontWeight: 600 }}>₹ {a.purchaseCost?.toLocaleString() || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : activeTab === 'inventory' ? (
          <table>
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Consumable</th>
                <th>Category</th>
                <th>Qty On Hand</th>
                <th>Unit Cost (₹)</th>
                <th>Total Value (₹)</th>
                <th>Health Status</th>
              </tr>
            </thead>
            <tbody>
              {reportData?.items?.map((i) => (
                <tr key={i._id}>
                  <td><strong>{i.itemId}</strong></td>
                  <td>{i.name}</td>
                  <td>{i.category}</td>
                  <td>{i.quantity} {i.unit}</td>
                  <td>₹ {i.unitCost || 0}</td>
                  <td style={{ fontWeight: 700 }}>₹ {((i.quantity || 0) * (i.unitCost || 0)).toLocaleString()}</td>
                  <td><StatusBadge status={i.stockStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Asset</th>
                <th>Type</th>
                <th>Scheduled Date</th>
                <th>Technician</th>
                <th>Cost (₹)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reportData?.records?.map((r) => (
                <tr key={r._id}>
                  <td><strong>{r.maintenanceId}</strong></td>
                  <td>{r.assetName} ({r.assetId})</td>
                  <td>{r.maintenanceType}</td>
                  <td>{new Date(r.scheduledDate).toLocaleDateString()}</td>
                  <td>{r.technician || 'In-House'}</td>
                  <td style={{ fontWeight: 600 }}>₹ {r.cost?.toLocaleString() || 0}</td>
                  <td><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
