import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, ConditionBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { QRCodeModal } from '../components/qr/QRCodeModal';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  QrCode,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  AlertCircle,
  Share2,
} from 'lucide-react';

export const Assets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'All');
  const [selectedCondition, setSelectedCondition] = useState('All');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [qrAsset, setQrAsset] = useState(null);
  const [deleteConfirmAsset, setDeleteConfirmAsset] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canEdit = user?.role === 'admin' || user?.role === 'lab_staff';
  const canDelete = user?.role === 'admin';

  // Form State
  const initialForm = {
    assetId: '',
    name: '',
    category: 'Computing',
    description: '',
    department: 'Computer Science',
    laboratory: 'General Lab',
    location: '',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseCost: '',
    supplier: '',
    warrantyExpiry: '',
    condition: 'Good',
    status: 'Available',
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        department: selectedDepartment !== 'All' ? selectedDepartment : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
        condition: selectedCondition !== 'All' ? selectedCondition : undefined,
      };
      const res = await api.get('/assets', { params });
      setAssets(res.data.data);
    } catch (err) {
      console.error('Failed to fetch assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [selectedCategory, selectedDepartment, selectedStatus, selectedCondition]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAssets();
  };

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setFormData(initialForm);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (asset) => {
    setIsEditMode(true);
    setSelectedAsset(asset);
    setFormData({
      assetId: asset.assetId,
      name: asset.name,
      category: asset.category,
      description: asset.description || '',
      department: asset.department,
      laboratory: asset.laboratory,
      location: asset.location,
      brand: asset.brand || '',
      model: asset.model || '',
      serialNumber: asset.serialNumber || '',
      purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : '',
      purchaseCost: asset.purchaseCost || '',
      supplier: asset.supplier || '',
      warrantyExpiry: asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toISOString().split('T')[0] : '',
      condition: asset.condition,
      status: asset.status,
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (isEditMode) {
        await api.put(`/assets/${selectedAsset._id}`, formData);
      } else {
        await api.post('/assets', formData);
      }
      setIsFormOpen(false);
      fetchAssets();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error saving asset. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmAsset) return;
    try {
      await api.delete(`/assets/${deleteConfirmAsset._id}`);
      setDeleteConfirmAsset(null);
      fetchAssets();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting asset');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
            Laboratory Equipment & Asset Registry
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Comprehensive institutional registry with automated QR tagging, department allocation, and status tracking.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={fetchAssets} className="btn-secondary" title="Refresh">
            <RefreshCw size={15} />
          </button>
          {canEdit && (
            <button onClick={handleOpenAdd} className="btn-primary">
              <Plus size={16} />
              Add New Asset
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          alignItems: 'flex-end',
        }}>
          {/* Search Input */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>
              Search Assets
            </label>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                placeholder="Search by ID, name, brand, model, serial #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="btn-primary" style={{ padding: '0.5rem 0.8rem' }}>
                <Search size={15} />
              </button>
            </form>
          </div>

          {/* Category Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>
              Category
            </label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="All">All Categories</option>
              <option value="Computing">Computing</option>
              <option value="Measuring Instruments">Measuring Instruments</option>
              <option value="Laboratory Equipment">Laboratory Equipment</option>
              <option value="Power & Electrical">Power & Electrical</option>
              <option value="Audio-Visual">Audio-Visual</option>
              <option value="Peripherals">Peripherals</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>
              Department
            </label>
            <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
              <option value="All">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Biotechnology">Biotechnology</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Information Technology">Information Technology</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>
              Operational Status
            </label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Issued">Issued</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Damaged">Damaged</option>
              <option value="Retired">Retired</option>
            </select>
          </div>

          {/* Condition Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>
              Physical Condition
            </label>
            <select value={selectedCondition} onChange={(e) => setSelectedCondition(e.target.value)}>
              <option value="All">All Conditions</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
              <option value="Damaged">Damaged</option>
            </select>
          </div>
        </div>
      </div>

      {/* Asset Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Asset ID</th>
              <th>Equipment Name</th>
              <th>Department / Lab</th>
              <th>Location</th>
              <th>Status</th>
              <th>Condition</th>
              <th>Assigned To</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: '#2563eb' }} />
                  Loading asset records...
                </td>
              </tr>
            ) : assets.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  No laboratory assets matched the search/filter criteria.
                </td>
              </tr>
            ) : (
              assets.map((asset) => (
                <tr key={asset._id}>
                  <td>
                    <button
                      onClick={() => navigate(`/assets/${asset.assetId}`)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#2563eb',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {asset.assetId}
                    </button>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{asset.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {asset.brand} {asset.model && `• ${asset.model}`}
                    </div>
                  </td>
                  <td>
                    <div style={{ color: '#0f172a' }}>{asset.department}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{asset.laboratory}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#475569' }}>{asset.location}</span>
                  </td>
                  <td>
                    <StatusBadge status={asset.status} />
                  </td>
                  <td>
                    <ConditionBadge condition={asset.condition} />
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: asset.assignedTo ? '#2563eb' : '#94a3b8' }}>
                      {asset.assignedTo || 'Unassigned'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                      {/* View Details */}
                      <button
                        onClick={() => navigate(`/assets/${asset.assetId}`)}
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.5rem' }}
                        title="View Asset Details"
                      >
                        <Eye size={14} />
                      </button>

                      {/* View / Print QR Code */}
                      <button
                        onClick={() => setQrAsset(asset)}
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.5rem', color: '#2563eb' }}
                        title="QR Code & Printable Tag"
                      >
                        <QrCode size={14} />
                      </button>

                      {/* Edit */}
                      {canEdit && (
                        <button
                          onClick={() => handleOpenEdit(asset)}
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.5rem' }}
                          title="Edit Asset"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}

                      {/* Delete */}
                      {canDelete && (
                        <button
                          onClick={() => setDeleteConfirmAsset(asset)}
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.5rem', color: '#ef4444' }}
                          title="Delete Asset"
                        >
                          <Trash2 size={14} />
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

      {/* Add / Edit Asset Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={isEditMode ? `Edit Asset: ${formData.assetId}` : 'Register New Laboratory Asset'}
        maxWidth="700px"
      >
        {formError && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '0.75rem',
            borderRadius: '8px',
            fontSize: '0.8rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <AlertCircle size={16} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Asset ID (Unique Code)
              </label>
              <input
                type="text"
                placeholder="e.g. AST-1013"
                value={formData.assetId}
                onChange={(e) => setFormData({ ...formData, assetId: e.target.value.toUpperCase() })}
                disabled={isEditMode}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Equipment Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Digital Storage Oscilloscope 100MHz"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Computing">Computing</option>
                <option value="Measuring Instruments">Measuring Instruments</option>
                <option value="Laboratory Equipment">Laboratory Equipment</option>
                <option value="Power & Electrical">Power & Electrical</option>
                <option value="Audio-Visual">Audio-Visual</option>
                <option value="Peripherals">Peripherals</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Department *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Electronics & Communication"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Laboratory *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. VLSI Design Lab"
                value={formData.laboratory}
                onChange={(e) => setFormData({ ...formData, laboratory: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Location / Room *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Room 204, Block B"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Brand / Make
              </label>
              <input
                type="text"
                placeholder="e.g. Tektronix"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Model
              </label>
              <input
                type="text"
                placeholder="e.g. TBS1052B"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Serial Number
              </label>
              <input
                type="text"
                placeholder="e.g. SN-882194"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Purchase Cost (₹)
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 45000"
                value={formData.purchaseCost}
                onChange={(e) => setFormData({ ...formData, purchaseCost: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Supplier Name
              </label>
              <input
                type="text"
                placeholder="e.g. TechLab Instruments"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Purchase Date
              </label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Warranty Expiry
              </label>
              <input
                type="date"
                value={formData.warrantyExpiry}
                onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Physical Condition
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Current Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Available">Available</option>
                <option value="Issued">Issued</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Damaged">Damaged</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              Technical Description / Specifications
            </label>
            <textarea
              rows="2"
              placeholder="e.g. 50 MHz bandwidth, 2 channels, include probes and power cord."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsFormOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Saving Asset...' : isEditMode ? 'Update Asset' : 'Register Asset'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmAsset}
        onClose={() => setDeleteConfirmAsset(null)}
        title="Confirm Asset Deletion"
        maxWidth="420px"
      >
        <div style={{ color: '#0f172a', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Are you sure you want to permanently delete asset <strong>{deleteConfirmAsset?.name}</strong> (<code>{deleteConfirmAsset?.assetId}</code>)?
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#ef4444' }}>
            This action cannot be undone and will be logged in the system audit trail.
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button onClick={() => setDeleteConfirmAsset(null)} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleDelete} className="btn-danger">
            Delete Permanently
          </button>
        </div>
      </Modal>

      {/* QR Code Tag Modal */}
      <QRCodeModal
        isOpen={!!qrAsset}
        onClose={() => setQrAsset(null)}
        asset={qrAsset}
      />
    </div>
  );
};
