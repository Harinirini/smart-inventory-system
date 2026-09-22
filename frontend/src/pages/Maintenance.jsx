import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  Wrench,
  Plus,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  DollarSign,
  Edit2,
} from 'lucide-react';

export const Maintenance = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [records, setRecords] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  // Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [scheduleForm, setScheduleForm] = useState({
    assetId: searchParams.get('schedule') || '',
    maintenanceType: 'Preventive',
    scheduledDate: '',
    technician: 'In-House Technician',
    description: '',
    cost: '',
    remarks: '',
  });

  const [updateForm, setUpdateForm] = useState({
    status: 'Scheduled',
    technician: '',
    cost: '',
    remarks: '',
    assetCondition: 'Good',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const canManage = user?.role === 'admin' || user?.role === 'lab_staff';

  const fetchMaintenance = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm || undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
        maintenanceType: selectedType !== 'All' ? selectedType : undefined,
      };
      const res = await api.get('/maintenance', { params });
      setRecords(res.data.data);
    } catch (err) {
      console.error('Failed to load maintenance records:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const res = await api.get('/assets');
      setAssets(res.data.data);
      if (!scheduleForm.assetId && res.data.data.length > 0) {
        setScheduleForm((prev) => ({ ...prev, assetId: res.data.data[0].assetId }));
      }
    } catch (err) {
      console.error('Failed to load assets:', err);
    }
  };

  useEffect(() => {
    fetchMaintenance();
    if (canManage) fetchAssets();
  }, [selectedStatus, selectedType]);

  const handleOpenSchedule = () => {
    setScheduleForm({
      assetId: assets[0]?.assetId || '',
      maintenanceType: 'Preventive',
      scheduledDate: new Date().toISOString().split('T')[0],
      technician: 'In-House Technician',
      description: '',
      cost: '',
      remarks: '',
    });
    setErrorMsg('');
    setIsScheduleModalOpen(true);
  };

  const handleOpenUpdate = (record) => {
    setSelectedRecord(record);
    setUpdateForm({
      status: record.status,
      technician: record.technician || '',
      cost: record.cost || '',
      remarks: record.remarks || '',
      assetCondition: 'Good',
    });
    setErrorMsg('');
    setIsUpdateModalOpen(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      await api.post('/maintenance', scheduleForm);
      setIsScheduleModalOpen(false);
      fetchMaintenance();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error scheduling maintenance.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      await api.put(`/maintenance/${selectedRecord._id}`, updateForm);
      setIsUpdateModalOpen(false);
      fetchMaintenance();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error updating maintenance record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
            Equipment Maintenance & Calibration Desk
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Schedule preventive calibrations, log repairs, track technician work orders, and equipment lifecycle costs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={fetchMaintenance} className="btn-secondary">
            <RefreshCw size={15} />
          </button>
          {canManage && (
            <button onClick={handleOpenSchedule} className="btn-primary">
              <Plus size={16} />
              Schedule Maintenance
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>
              Search Records
            </label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                placeholder="Search order ID, equipment name, technician..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') fetchMaintenance(); }}
              />
              <button onClick={fetchMaintenance} className="btn-primary" style={{ padding: '0.5rem 0.8rem' }}>
                <Search size={15} />
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>
              Order Status
            </label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>
              Maintenance Type
            </label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              <option value="All">All Types</option>
              <option value="Preventive">Preventive</option>
              <option value="Corrective">Corrective</option>
              <option value="Repair">Repair</option>
            </select>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Asset / Equipment</th>
              <th>Service Type</th>
              <th>Scheduled Date</th>
              <th>Completed Date</th>
              <th>Assigned Technician</th>
              <th>Cost (₹)</th>
              <th>Order Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: '#2563eb' }} />
                  Loading maintenance records...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  No maintenance work orders found.
                </td>
              </tr>
            ) : (
              records.map((rec) => (
                <tr key={rec._id}>
                  <td>
                    <span style={{ fontWeight: 700, color: '#2563eb' }}>{rec.maintenanceId}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{rec.assetName}</div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{rec.assetId}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                      {rec.maintenanceType}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#334155' }}>
                      {new Date(rec.scheduledDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: rec.completedDate ? '#059669' : '#94a3b8' }}>
                      {rec.completedDate ? new Date(rec.completedDate).toLocaleDateString() : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#0f172a' }}>
                      {rec.technician || 'In-House'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                      {rec.cost ? `₹ ${rec.cost.toLocaleString()}` : '—'}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={rec.status} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      {canManage && (
                        <button
                          onClick={() => handleOpenUpdate(rec)}
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                        >
                          <Edit2 size={13} /> Update Status
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Schedule Maintenance Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule Equipment Service / Calibration"
        maxWidth="600px"
      >
        {errorMsg && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              Target Equipment *
            </label>
            <select
              value={scheduleForm.assetId}
              onChange={(e) => setScheduleForm({ ...scheduleForm, assetId: e.target.value })}
              required
            >
              {assets.map((ast) => (
                <option key={ast._id} value={ast.assetId}>
                  {ast.name} [{ast.assetId}] - {ast.department} ({ast.status})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Maintenance Type *
              </label>
              <select
                value={scheduleForm.maintenanceType}
                onChange={(e) => setScheduleForm({ ...scheduleForm, maintenanceType: e.target.value })}
              >
                <option value="Preventive">Preventive (Periodic Calibration)</option>
                <option value="Corrective">Corrective (Diagnose Issue)</option>
                <option value="Repair">Repair (Fix Breakdown)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Scheduled Date *
              </label>
              <input
                type="date"
                required
                value={scheduleForm.scheduledDate}
                onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Service Technician / Vendor
              </label>
              <input
                type="text"
                placeholder="e.g. Tektronix Certified Engineer"
                value={scheduleForm.technician}
                onChange={(e) => setScheduleForm({ ...scheduleForm, technician: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Estimated Cost (₹)
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 2500"
                value={scheduleForm.cost}
                onChange={(e) => setScheduleForm({ ...scheduleForm, cost: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              Work Order Description *
            </label>
            <textarea
              rows="2"
              required
              placeholder="e.g. Annual calibration and oscilloscope probe attenuation verification."
              value={scheduleForm.description}
              onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Scheduling...' : 'Schedule Service'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Maintenance Status Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title={`Update Order: ${selectedRecord?.maintenanceId} (${selectedRecord?.assetName})`}
        maxWidth="500px"
      >
        {errorMsg && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleUpdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              Service Status *
            </label>
            <select
              value={updateForm.status}
              onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
            >
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress (Asset Under Maintenance)</option>
              <option value="Completed">Completed (Restores Asset to Available)</option>
              <option value="Cancelled">Cancelled (Restores Asset to Available)</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Assigned Technician
              </label>
              <input
                type="text"
                value={updateForm.technician}
                onChange={(e) => setUpdateForm({ ...updateForm, technician: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Actual Cost (₹)
              </label>
              <input
                type="number"
                min="0"
                value={updateForm.cost}
                onChange={(e) => setUpdateForm({ ...updateForm, cost: e.target.value })}
              />
            </div>
          </div>

          {updateForm.status === 'Completed' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Post-Service Equipment Condition
              </label>
              <select
                value={updateForm.assetCondition}
                onChange={(e) => setUpdateForm({ ...updateForm, assetCondition: e.target.value })}
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              Technician Notes / Remarks
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Bench calibrated with 0.1% tolerance. Replaced power fuse."
              value={updateForm.remarks}
              onChange={(e) => setUpdateForm({ ...updateForm, remarks: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsUpdateModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Updating...' : 'Save Updates'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
