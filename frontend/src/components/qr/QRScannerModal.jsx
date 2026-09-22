import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { QrCode, ArrowRight, Search, Camera } from 'lucide-react';

export const QRScannerModal = ({ isOpen, onClose }) => {
  const [inputVal, setInputVal] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLookup = (e) => {
    e.preventDefault();
    setError('');

    const cleanInput = inputVal.trim();
    if (!cleanInput) {
      setError('Please enter an Asset ID or QR payload.');
      return;
    }

    // Check if input is a JSON string from a scanned QR
    let targetAssetId = cleanInput;
    if (cleanInput.startsWith('{') && cleanInput.endsWith('}')) {
      try {
        const parsed = JSON.parse(cleanInput);
        if (parsed.assetId) {
          targetAssetId = parsed.assetId;
        }
      } catch (err) {
        // Continue with raw text
      }
    }

    onClose();
    setInputVal('');
    navigate(`/assets/${encodeURIComponent(targetAssetId.toUpperCase())}`);
  };

  const quickDemoAssets = ['AST-1001', 'AST-1002', 'AST-1004', 'AST-1006', 'AST-1010'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Asset QR Scanner & Lookup" maxWidth="500px">
      <div>
        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
        }}>
          <div style={{ backgroundColor: '#2563eb', color: '#fff', padding: '0.5rem', borderRadius: '8px' }}>
            <Camera size={20} />
          </div>
          <div style={{ fontSize: '0.8rem', color: '#1e40af' }}>
            <strong>QR Code Scanner & Manual Tag Lookup:</strong> Point a physical 2D barcode scanner, paste camera QR text, or enter the Asset ID below to immediately retrieve the asset specifications and history.
          </div>
        </div>

        <form onSubmit={handleLookup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Enter Asset ID or Paste QR Data
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="e.g. AST-1001 or scanned string"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                autoFocus
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn-primary">
                <Search size={16} />
                Lookup
              </button>
            </div>
            {error && (
              <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.35rem', display: 'block' }}>
                {error}
              </span>
            )}
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>
              Quick Demo Asset Shortcuts:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {quickDemoAssets.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate(`/assets/${id}`);
                  }}
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                >
                  <QrCode size={14} />
                  {id}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};
