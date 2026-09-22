import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { ArrowLeftRight, Search, RefreshCw, Filter, ArrowUpRight, ArrowDownRight, SlidersHorizontal } from 'lucide-react';

export const StockTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm || undefined,
        transactionType: selectedType !== 'All' ? selectedType : undefined,
      };
      const res = await api.get('/stock-transactions', { params });
      setTransactions(res.data.data);
    } catch (err) {
      console.error('Failed to fetch stock transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedType]);

  const getTypeBadge = (type) => {
    switch (type) {
      case 'Stock In':
      case 'Return':
        return (
          <span className="badge badge-success" style={{ gap: '0.2rem' }}>
            <ArrowUpRight size={13} /> {type}
          </span>
        );
      case 'Stock Out':
      case 'Issue':
        return (
          <span className="badge badge-danger" style={{ gap: '0.2rem' }}>
            <ArrowDownRight size={13} /> {type}
          </span>
        );
      case 'Adjustment':
        return (
          <span className="badge badge-purple" style={{ gap: '0.2rem' }}>
            <SlidersHorizontal size={13} /> Adjustment
          </span>
        );
      default:
        return <span className="badge badge-neutral">{type}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
            Stock Movement & Transaction Logs
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Complete audit trail of consumable stock additions, disbursements, issues, and audit reconciliations.
          </p>
        </div>
        <button onClick={fetchTransactions} className="btn-secondary">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Filter bar */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>
              Search Transactions
            </label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                placeholder="Search by transaction ID, item code, or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') fetchTransactions(); }}
              />
              <button onClick={fetchTransactions} className="btn-primary" style={{ padding: '0.5rem 0.8rem' }}>
                <Search size={15} />
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>
              Transaction Type
            </label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              <option value="All">All Transactions</option>
              <option value="Stock In">Stock In</option>
              <option value="Stock Out">Stock Out</option>
              <option value="Adjustment">Stock Adjustment</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Txn ID</th>
              <th>Item / Consumable</th>
              <th>Movement Type</th>
              <th>Change Qty</th>
              <th>Balance (Prev → New)</th>
              <th>Performed By</th>
              <th>Date & Time</th>
              <th>Remarks / Reason</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: '#2563eb' }} />
                  Loading transactions...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  No stock transactions recorded.
                </td>
              </tr>
            ) : (
              transactions.map((txn) => (
                <tr key={txn._id}>
                  <td>
                    <span style={{ fontWeight: 700, color: '#2563eb' }}>{txn.transactionId}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{txn.itemName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{txn.itemCode}</div>
                  </td>
                  <td>
                    {getTypeBadge(txn.transactionType)}
                  </td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: txn.transactionType === 'Stock In' ? '#059669' : '#dc2626',
                    }}>
                      {txn.transactionType === 'Stock In' ? `+${txn.quantity}` : `-${txn.quantity}`}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: '#334155' }}>
                      {txn.previousQuantity} &rarr; <strong>{txn.newQuantity}</strong>
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#0f172a' }}>{txn.userName}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                      {new Date(txn.date).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      {new Date(txn.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                      {txn.reason || '—'}
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
