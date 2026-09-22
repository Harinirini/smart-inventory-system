import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, ConditionBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  ClipboardCheck,
  Plus,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  ArrowRight,
} from 'lucide-react';

export const IssueReturn = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [records, setRecords] = useState([]);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'All');

  // Issue modal state
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueForm, setIssueForm] = useState({
    assetId: '',
    name: '',
    identifier: '',
    department: 'Computer Science',
    email: '',
    phone: '',
    expectedReturnDate: '',
    remarks: '',
  });

  // Return modal state
  const [returnRecord, setReturnRecord] = useState(null);
  const [returnForm, setReturnForm] = useState({
    conditionAfterReturn: 'Good',
    remarks: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const canManage = user?.role === 'admin' || user?.role === 'lab_staff';

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm || undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
      };
      const res = await api.get('/issue-records', { params });
      setRecords(res.data.data);
    } catch (err) {
      console.error('Failed to load issue records:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableAssets = async () => {
    try {
      const res = await api.get('/assets', { params: { status: 'Available' } });
      setAvailableAssets(res.data.data);
    } catch (err) {
      console.error('Failed to load available assets:', err);
    }
  };

  useEffect(() => {
    fetchRecords();
    if (canManage) fetchAvailableAssets();
  }, [selectedStatus]);

  const handleOpenIssue = () => {
    setIssueForm({
      assetId: availableAssets[0]?.assetId || '',
      name: '',
      identifier: '',
      department: 'Computer Science',
      email: '',
      phone: '',
      expectedReturnDate: '',
      remarks: '',
    });
    setErrorMsg('');
    setIsIssueModalOpen(true);
  };

  const handleOpenReturn = (record) => {
    setReturnRecord(record);
    setReturnForm({
      conditionAfterReturn: 'Good',
      remarks: '',
    });
    setErrorMsg('');
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      await api.post(`/assets/${issueForm.assetId}/issue`, {
        issuedTo: {
          name: issueForm.name,
          identifier: issueForm.identifier,
          department: issueForm.department,
          email: issueForm.email,
          phone: issueForm.phone,
        },
        expectedReturnDate: issueForm.expectedReturnDate,
        remarks: issueForm.remarks,
      });
      setIsIssueModalOpen(false);
      fetchRecords();
      fetchAvailableAssets();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error issuing asset.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      await api.post(`/assets/${returnRecord.assetId}/return`, {
        recordId: returnRecord._id,
        ...returnForm,
      });
      setReturnRecord(null);
      fetchRecords();
      fetchAvailableAssets();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error returning asset.');
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
            Equipment Issue & Return Desk
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Track student/faculty checkouts, return conditions, and automated overdue return alerts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={fetchRecords} className="btn-secondary">
            <RefreshCw size={15} />
          </button>
          {canManage && (
            <button onClick={handleOpenIssue} className="btn-primary">
              <Plus size={16} />
              Issue Asset
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>
              Search Records
            </label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                placeholder="Search by student name, roll number, or asset ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') fetchRecords(); }}
              />
              <button onClick={fetchRecords} className="btn-primary" style={{ padding: '0.5rem 0.8rem' }}>
                <Search size={15} />
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>
              Status Filter
            </label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="All">All Checkout Records</option>
              <option value="Issued">Active Checkouts</option>
              <option value="Overdue">Overdue Returns Only</option>
              <option value="Returned">Returned History</option>
            </select>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Borrower (Student/Staff)</th>
              <th>Issue Date</th>
              <th>Expected Return</th>
              <th>Checkout Status</th>
              <th>Dispatched By</th>
              <th>Return Details</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: '#2563eb' }} />
                  Loading checkout records...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  No checkout records found matching your query.
                </td>
              </tr>
            ) : (
              records.map((rec) => (
                <tr key={rec._id} style={{ backgroundColor: rec.isOverdue ? '#fffbeb' : 'inherit' }}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{rec.assetName}</div>
                    <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>{rec.assetId}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{rec.issuedTo?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      ID: {rec.issuedTo?.identifier} &bull; {rec.issuedTo?.department}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: '#334155' }}>
                      {new Date(rec.issueDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', fontWeight: rec.isOverdue ? 700 : 500, color: rec.isOverdue ? '#dc2626' : '#334155' }}>
                      {new Date(rec.expectedReturnDate).toLocaleDateString()}
                    </span>
                    {rec.isOverdue && (
                      <div style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <AlertTriangle size={12} /> {rec.overdueDays}d Overdue
                      </div>
                    )}
                  </td>
                  <td>
                    {rec.isOverdue ? (
                      <span className="badge badge-danger">Overdue</span>
                    ) : (
                      <StatusBadge status={rec.status} />
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                      {rec.issuedByName || 'Staff'}
                    </span>
                  </td>
                  <td>
                    {rec.status === 'Returned' ? (
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                          Returned {new Date(rec.returnDate).toLocaleDateString()}
                        </span>
                        {rec.conditionAfterReturn && (
                          <div style={{ marginTop: '0.2rem' }}>
                            <ConditionBadge condition={rec.conditionAfterReturn} />
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Pending Return</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      {rec.status === 'Issued' && canManage && (
                        <button
                          onClick={() => handleOpenReturn(rec)}
                          className="btn-success"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                        >
                          <CheckCircle2 size={14} />
                          Process Return
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

      {/* Issue Modal */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title="Issue Laboratory Equipment"
        maxWidth="600px"
      >
        {errorMsg && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleIssueSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              Select Available Equipment *
            </label>
            <select
              value={issueForm.assetId}
              onChange={(e) => setIssueForm({ ...issueForm, assetId: e.target.value })}
              required
            >
              {availableAssets.length === 0 ? (
                <option value="">No equipment currently available</option>
              ) : (
                availableAssets.map((ast) => (
                  <option key={ast._id} value={ast.assetId}>
                    {ast.name} [{ast.assetId}] - {ast.department} ({ast.laboratory})
                  </option>
                ))
              )}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Borrower Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sneha Roy"
                value={issueForm.name}
                onChange={(e) => setIssueForm({ ...issueForm, name: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Roll No / Employee ID *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 21CS088"
                value={issueForm.identifier}
                onChange={(e) => setIssueForm({ ...issueForm, identifier: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Department *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Computer Science"
                value={issueForm.department}
                onChange={(e) => setIssueForm({ ...issueForm, department: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Expected Return Date *
              </label>
              <input
                type="date"
                required
                value={issueForm.expectedReturnDate}
                onChange={(e) => setIssueForm({ ...issueForm, expectedReturnDate: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Contact Email
              </label>
              <input
                type="email"
                placeholder="sneha.roy@student.college.edu"
                value={issueForm.email}
                onChange={(e) => setIssueForm({ ...issueForm, email: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Contact Phone
              </label>
              <input
                type="text"
                placeholder="+91 98222 33445"
                value={issueForm.phone}
                onChange={(e) => setIssueForm({ ...issueForm, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              Issue Purpose / Remarks
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Robotics capstone project experimentation"
              value={issueForm.remarks}
              onChange={(e) => setIssueForm({ ...issueForm, remarks: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsIssueModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting || !issueForm.assetId} className="btn-primary">
              {submitting ? 'Confirming...' : 'Confirm Checkout'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Return Modal */}
      <Modal
        isOpen={!!returnRecord}
        onClose={() => setReturnRecord(null)}
        title={`Process Return: ${returnRecord?.assetName} (${returnRecord?.assetId})`}
        maxWidth="500px"
      >
        {errorMsg && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleReturnSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Borrower Info:</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
              {returnRecord?.issuedTo?.name} ({returnRecord?.issuedTo?.identifier})
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Department: {returnRecord?.issuedTo?.department}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              Physical Condition Upon Return *
            </label>
            <select
              value={returnForm.conditionAfterReturn}
              onChange={(e) => setReturnForm({ ...returnForm, conditionAfterReturn: e.target.value })}
            >
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
              <option value="Damaged">Damaged (Will flag equipment for repair)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              Return Inspection Remarks
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Returned in working order with all accessories intact."
              value={returnForm.remarks}
              onChange={(e) => setReturnForm({ ...returnForm, remarks: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setReturnRecord(null)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-success">
              {submitting ? 'Processing...' : 'Complete Return'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
