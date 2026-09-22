import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { StatusBadge, ConditionBadge } from '../components/common/Badge';
import { QRCodeModal } from '../components/qr/QRCodeModal';
import { Modal } from '../components/common/Modal';
import {
  ArrowLeft,
  QrCode,
  Calendar,
  DollarSign,
  Tag,
  MapPin,
  Clock,
  Wrench,
  Share2,
  CheckCircle2,
  AlertCircle,
  Download,
  Printer,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const AssetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Quick Issue & Return Modals
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  // Issue Form State
  const [issueForm, setIssueForm] = useState({
    name: '',
    identifier: '',
    department: '',
    email: '',
    phone: '',
    expectedReturnDate: '',
    remarks: '',
  });

  // Return Form State
  const [returnForm, setReturnForm] = useState({
    conditionAfterReturn: 'Good',
    remarks: '',
  });

  const fetchAssetDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/assets/${id}`);
      setAsset(res.data.data);
      if (res.data.data.condition) {
        setReturnForm((prev) => ({ ...prev, conditionAfterReturn: res.data.data.condition }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load asset details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetDetails();
  }, [id]);

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSubmitting(true);
    try {
      await api.post(`/assets/${asset.assetId}/issue`, {
        issuedTo: {
          name: issueForm.name,
          identifier: issueForm.identifier,
          department: issueForm.department || asset.department,
          email: issueForm.email,
          phone: issueForm.phone,
        },
        expectedReturnDate: issueForm.expectedReturnDate,
        remarks: issueForm.remarks,
      });
      setIsIssueModalOpen(false);
      fetchAssetDetails();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Error issuing asset.');
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSubmitting(true);
    try {
      await api.post(`/assets/${asset.assetId}/return`, returnForm);
      setIsReturnModalOpen(false);
      fetchAssetDetails();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Error returning asset.');
    } finally {
      setActionSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        Loading asset specifications and history...
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ color: '#ef4444', marginBottom: '1rem', fontWeight: 600 }}>{error || 'Asset not found.'}</div>
        <button onClick={() => navigate('/assets')} className="btn-secondary">
          <ArrowLeft size={16} /> Back to Asset Registry
        </button>
      </div>
    );
  }

  const qrPayload = JSON.stringify({
    app: 'SmartInventorySystem',
    assetId: asset.assetId,
    name: asset.name,
    category: asset.category,
    department: asset.department,
    serialNumber: asset.serialNumber || 'N/A',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Breadcrumb & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => navigate('/assets')} className="btn-secondary" style={{ padding: '0.45rem 0.65rem' }}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{asset.name}</h1>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2563eb', backgroundColor: '#eff6ff', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                {asset.assetId}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>
              {asset.department} &bull; {asset.laboratory} &bull; {asset.location}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setIsQRModalOpen(true)} className="btn-secondary">
            <QrCode size={16} />
            View / Print QR Tag
          </button>

          {asset.status === 'Available' && (
            <button onClick={() => setIsIssueModalOpen(true)} className="btn-primary">
              <Share2 size={16} />
              Issue Asset
            </button>
          )}

          {asset.status === 'Issued' && (
            <button onClick={() => setIsReturnModalOpen(true)} className="btn-success">
              <CheckCircle2 size={16} />
              Return Asset
            </button>
          )}

          <button onClick={() => navigate(`/maintenance?schedule=${asset.assetId}`)} className="btn-secondary">
            <Wrench size={16} />
            Schedule Service
          </button>
        </div>
      </div>

      {/* Main Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
        {/* Left: Detailed Specification Card */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
            Equipment Specifications
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Operational Status</span>
              <div style={{ marginTop: '0.25rem' }}>
                <StatusBadge status={asset.status} />
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Physical Condition</span>
              <div style={{ marginTop: '0.25rem' }}>
                <ConditionBadge condition={asset.condition} />
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Assigned Borrower</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: asset.assignedTo ? '#2563eb' : '#94a3b8' }}>
                {asset.assignedTo || 'None (In Storage)'}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Category</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{asset.category}</span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Brand & Model</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                {asset.brand || 'N/A'} {asset.model && `(${asset.model})`}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Serial Number</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                {asset.serialNumber || 'N/A'}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Location / Room</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{asset.location}</span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Purchase Cost</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                {asset.purchaseCost ? `₹ ${asset.purchaseCost.toLocaleString()}` : 'N/A'}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Purchase Date</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Supplier</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                {asset.supplier || 'N/A'}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Warranty Expiry</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                {asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>
              Technical Description & Notes
            </span>
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '0.75rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              color: '#334155',
              lineHeight: 1.5,
            }}>
              {asset.description || 'No additional technical notes provided for this equipment.'}
            </div>
          </div>
        </div>

        {/* Right: QR Code Tag Preview */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
            Equipment QR Tag
          </h3>

          <div style={{
            padding: '1rem',
            border: '2px dashed #cbd5e1',
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '1rem',
          }}>
            <QRCodeSVG value={qrPayload} size={150} level="H" includeMargin={true} />
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>
              {asset.assetId}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
              Scan to inspect or verify
            </div>
          </div>

          <button onClick={() => setIsQRModalOpen(true)} className="btn-primary" style={{ width: '100%', fontSize: '0.8rem' }}>
            <Printer size={15} />
            Generate Printable Tag
          </button>
        </div>
      </div>

      {/* Two History Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem' }}>
        {/* Issue / Return History */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
              Checkout & Return History
            </h3>
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {asset.issueHistory && asset.issueHistory.length > 0 ? (
              <table style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    <th>Borrower</th>
                    <th>Issue Date</th>
                    <th>Expected</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {asset.issueHistory.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <strong>{item.issuedTo?.name}</strong>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.issuedTo?.identifier}</div>
                      </td>
                      <td>{new Date(item.issueDate).toLocaleDateString()}</td>
                      <td>{new Date(item.expectedReturnDate).toLocaleDateString()}</td>
                      <td><StatusBadge status={item.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                No past issue records for this asset.
              </div>
            )}
          </div>
        </div>

        {/* Maintenance History */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
              Service & Calibration History
            </h3>
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {asset.maintenanceHistory && asset.maintenanceHistory.length > 0 ? (
              <table style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Type</th>
                    <th>Scheduled</th>
                    <th>Status</th>
                    <th>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {asset.maintenanceHistory.map((item) => (
                    <tr key={item._id}>
                      <td><strong>{item.maintenanceId}</strong></td>
                      <td>{item.maintenanceType}</td>
                      <td>{new Date(item.scheduledDate).toLocaleDateString()}</td>
                      <td><StatusBadge status={item.status} /></td>
                      <td>₹ {item.cost?.toLocaleString() || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                No maintenance records logged for this equipment.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Issue Asset Modal */}
      <Modal isOpen={isIssueModalOpen} onClose={() => setIsIssueModalOpen(false)} title={`Issue Asset: ${asset.name} (${asset.assetId})`}>
        {actionError && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.65rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1rem' }}>
            {actionError}
          </div>
        )}
        <form onSubmit={handleIssueSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Recipient Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Arjun Mehta"
                value={issueForm.name}
                onChange={(e) => setIssueForm({ ...issueForm, name: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Roll Number / Faculty ID *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 21EC042"
                value={issueForm.identifier}
                onChange={(e) => setIssueForm({ ...issueForm, identifier: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Department
              </label>
              <input
                type="text"
                placeholder={asset.department}
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

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              Purpose / Remarks
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Project benchmarking and lab experimentation"
              value={issueForm.remarks}
              onChange={(e) => setIssueForm({ ...issueForm, remarks: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsIssueModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={actionSubmitting} className="btn-primary">
              {actionSubmitting ? 'Confirming Checkout...' : 'Confirm Issue'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Return Asset Modal */}
      <Modal isOpen={isReturnModalOpen} onClose={() => setIsReturnModalOpen(false)} title={`Return Asset: ${asset.name} (${asset.assetId})`}>
        {actionError && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.65rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1rem' }}>
            {actionError}
          </div>
        )}
        <form onSubmit={handleReturnSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
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
              <option value="Damaged">Damaged (Will flag asset for repair)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              Return Inspection Remarks
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Returned with all cables and accessories intact. Bench tested."
              value={returnForm.remarks}
              onChange={(e) => setReturnForm({ ...returnForm, remarks: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsReturnModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={actionSubmitting} className="btn-success">
              {actionSubmitting ? 'Processing Return...' : 'Accept Return'}
            </button>
          </div>
        </form>
      </Modal>

      {/* QR Code Tag Modal */}
      <QRCodeModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} asset={asset} />
    </div>
  );
};
