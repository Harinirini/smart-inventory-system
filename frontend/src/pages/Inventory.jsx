import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  PackageSearch,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  AlertTriangle,
  History,
} from 'lucide-react';

export const Inventory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'All');

  // Modal States
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockItem, setStockItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  // Form States
  const initialForm = {
    itemId: '',
    name: '',
    category: 'Electronic Components',
    description: '',
    quantity: '',
    minStockLevel: 5,
    unit: 'pcs',
    unitCost: '',
    supplier: '',
    location: 'Central Store',
  };
  const [formData, setFormData] = useState(initialForm);

  const [stockFormData, setStockFormData] = useState({
    transactionType: 'Stock In',
    quantity: '',
    reason: '',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canManage = user?.role === 'admin' || user?.role === 'store_incharge';
  const canDelete = user?.role === 'admin';

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        stockStatus: selectedStatus !== 'All' ? selectedStatus : undefined,
      };
      const res = await api.get('/inventory', { params });
      setItems(res.data.data);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [selectedCategory, selectedStatus]);

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setFormData(initialForm);
    setErrorMsg('');
    setIsItemModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditMode(true);
    setSelectedItem(item);
    setFormData({
      itemId: item.itemId,
      name: item.name,
      category: item.category,
      description: item.description || '',
      quantity: item.quantity,
      minStockLevel: item.minStockLevel,
      unit: item.unit,
      unitCost: item.unitCost || '',
      supplier: item.supplier || '',
      location: item.location || '',
    });
    setErrorMsg('');
    setIsItemModalOpen(true);
  };

  const handleOpenStockChange = (item, type = 'Stock In') => {
    setStockItem(item);
    setStockFormData({
      transactionType: type,
      quantity: '',
      reason: '',
    });
    setErrorMsg('');
    setIsStockModalOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      if (isEditMode) {
        await api.put(`/inventory/${selectedItem._id}`, formData);
      } else {
        await api.post('/inventory', formData);
      }
      setIsItemModalOpen(false);
      fetchInventory();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error saving inventory item.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveStock = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      await api.post(`/inventory/${stockItem._id}/stock-change`, stockFormData);
      setIsStockModalOpen(false);
      fetchInventory();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error updating stock.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteItem) return;
    try {
      await api.delete(`/inventory/${deleteItem._id}`);
      setDeleteItem(null);
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting item.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
            Consumable Inventory & Stock Registry
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Track lab supplies, cables, components, minimum stock thresholds, and stock replenishment.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => navigate('/stock-transactions')} className="btn-secondary">
            <History size={15} />
            Transactions Log
          </button>
          <button onClick={fetchInventory} className="btn-secondary">
            <RefreshCw size={15} />
          </button>
          {canManage && (
            <button onClick={handleOpenAdd} className="btn-primary">
              <Plus size={16} />
              Add Consumable Item
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem',
          alignItems: 'flex-end',
        }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>
              Search Consumables
            </label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                placeholder="Search by code, item name, supplier, rack..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') fetchInventory(); }}
              />
              <button onClick={fetchInventory} className="btn-primary" style={{ padding: '0.5rem 0.8rem' }}>
                <Search size={15} />
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>
              Category
            </label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="All">All Categories</option>
              <option value="Electronic Components">Electronic Components</option>
              <option value="Cables & Adapters">Cables & Adapters</option>
              <option value="Tools & Consumables">Tools & Consumables</option>
              <option value="Peripherals">Peripherals</option>
              <option value="Stationery">Stationery</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>
              Stock Level Status
            </label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="All">All Stock Levels</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock Alert</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Item Code</th>
              <th>Consumable Item</th>
              <th>Category</th>
              <th>Available Qty</th>
              <th>Threshold</th>
              <th>Stock Health</th>
              <th>Unit Cost</th>
              <th>Storage Location</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: '#2563eb' }} />
                  Loading inventory items...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  No inventory consumables found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id}>
                  <td>
                    <span style={{ fontWeight: 700, color: '#2563eb' }}>{item.itemId}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.name}</div>
                    {item.supplier && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Supplier: {item.supplier}</div>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#475569' }}>{item.category}</span>
                  </td>
                  <td>
                    <span style={{
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      color: item.quantity <= 0 ? '#ef4444' : item.quantity <= item.minStockLevel ? '#d97706' : '#0f172a',
                    }}>
                      {item.quantity} {item.unit}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Min: {item.minStockLevel} {item.unit}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={item.stockStatus} />
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#0f172a' }}>
                      {item.unitCost ? `₹ ${item.unitCost}` : '—'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#475569' }}>{item.location}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                      {canManage && (
                        <>
                          <button
                            onClick={() => handleOpenStockChange(item, 'Stock In')}
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.5rem', color: '#059669', borderColor: '#a7f3d0' }}
                            title="Stock In (+)"
                          >
                            <ArrowUpRight size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenStockChange(item, 'Stock Out')}
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.5rem', color: '#dc2626', borderColor: '#fecaca' }}
                            title="Stock Out (-)"
                          >
                            <ArrowDownRight size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenStockChange(item, 'Adjustment')}
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.5rem', color: '#475569' }}
                            title="Stock Count Adjustment"
                          >
                            <SlidersHorizontal size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.5rem' }}
                            title="Edit Item Details"
                          >
                            <Edit2 size={14} />
                          </button>
                        </>
                      )}

                      {canDelete && (
                        <button
                          onClick={() => setDeleteItem(item)}
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.5rem', color: '#ef4444' }}
                          title="Delete Item"
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

      {/* Add / Edit Inventory Modal */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title={isEditMode ? `Edit Item: ${formData.itemId}` : 'Add Consumable Inventory Item'}
        maxWidth="650px"
      >
        {errorMsg && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1rem' }}>
            {errorMsg}
          </div>
        )}
        <form onSubmit={handleSaveItem} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Item ID / Code
              </label>
              <input
                type="text"
                placeholder="e.g. INV-2011"
                value={formData.itemId}
                onChange={(e) => setFormData({ ...formData, itemId: e.target.value.toUpperCase() })}
                disabled={isEditMode}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Item Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CAT6 Snagless Patch Cord"
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
                <option value="Electronic Components">Electronic Components</option>
                <option value="Cables & Adapters">Cables & Adapters</option>
                <option value="Tools & Consumables">Tools & Consumables</option>
                <option value="Peripherals">Peripherals</option>
                <option value="Stationery">Stationery</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Initial Qty *
              </label>
              <input
                type="number"
                min="0"
                required
                disabled={isEditMode}
                placeholder="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Min Stock Level *
              </label>
              <input
                type="number"
                min="0"
                required
                placeholder="5"
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Unit of Measure *
              </label>
              <input
                type="text"
                required
                placeholder="pcs, meters, rolls..."
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Unit Cost (₹)
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 150"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Storage Location
              </label>
              <input
                type="text"
                placeholder="e.g. Rack A2, Shelf 3"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              Supplier Information
            </label>
            <input
              type="text"
              placeholder="e.g. D-Link Authorized Channel Partner"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              Description
            </label>
            <textarea
              rows="2"
              placeholder="e.g. 2 meter patch cord with gold-plated 8P8C contacts."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsItemModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Saving...' : isEditMode ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock Transaction Modal (In / Out / Adjustment) */}
      <Modal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        title={`${stockFormData.transactionType}: ${stockItem?.name} (${stockItem?.itemId})`}
        maxWidth="480px"
      >
        {errorMsg && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSaveStock} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Current In-Stock Quantity:</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              {stockItem?.quantity} {stockItem?.unit}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              Transaction Type
            </label>
            <select
              value={stockFormData.transactionType}
              onChange={(e) => setStockFormData({ ...stockFormData, transactionType: e.target.value })}
            >
              <option value="Stock In">Stock In (Replenish / Purchase Order)</option>
              <option value="Stock Out">Stock Out (Issue to Lab / Depleted)</option>
              <option value="Adjustment">Stock Adjustment (Physical Audit Reconciliation)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              {stockFormData.transactionType === 'Adjustment' ? 'New Total Quantity Count *' : 'Quantity to Add / Deduct *'}
            </label>
            <input
              type="number"
              min="0"
              required
              placeholder="e.g. 10"
              value={stockFormData.quantity}
              onChange={(e) => setStockFormData({ ...stockFormData, quantity: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              Reason / Reference Remarks *
            </label>
            <textarea
              rows="2"
              required
              placeholder="e.g. Purchase Order #8990 or Issued to Electronics Lab"
              value={stockFormData.reason}
              onChange={(e) => setStockFormData({ ...stockFormData, reason: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsStockModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Applying Transaction...' : 'Confirm Stock Update'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Item Modal */}
      <Modal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        title="Confirm Deletion"
        maxWidth="420px"
      >
        <div style={{ color: '#0f172a', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Delete consumable item <strong>{deleteItem?.name}</strong> (<code>{deleteItem?.itemId}</code>)?
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button onClick={() => setDeleteItem(null)} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleDeleteItem} className="btn-danger">
            Delete Item
          </button>
        </div>
      </Modal>
    </div>
  );
};
