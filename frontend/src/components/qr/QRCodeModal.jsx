import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from '../common/Modal';
import { Download, Printer } from 'lucide-react';

export const QRCodeModal = ({ isOpen, onClose, asset }) => {
  const qrRef = useRef(null);

  if (!asset) return null;

  const qrPayload = JSON.stringify({
    app: 'SmartInventorySystem',
    assetId: asset.assetId,
    name: asset.name,
    category: asset.category,
    department: asset.department,
    serialNumber: asset.serialNumber || 'N/A',
  });

  const handleDownload = () => {
    const svgElement = qrRef.current?.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 300;
      canvas.height = 300;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 300, 300);
      ctx.drawImage(img, 0, 0, 300, 300);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `QR_${asset.assetId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const svgHtml = qrRef.current?.innerHTML;

    printWindow.document.write(`
      <html>
        <head>
          <title>Asset Tag - ${asset.assetId}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
            }
            .tag {
              border: 2px dashed #0f172a;
              border-radius: 8px;
              padding: 16px;
              width: 320px;
              text-align: center;
              box-sizing: border-box;
            }
            .title { font-size: 13px; font-weight: bold; color: #2563eb; text-transform: uppercase; margin-bottom: 4px; }
            .asset-id { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
            .name { font-size: 14px; font-weight: bold; margin-bottom: 6px; }
            .details { font-size: 11px; color: #475569; margin-top: 6px; }
          </style>
        </head>
        <body>
          <div class="tag">
            <div class="title">Institutional Laboratory Asset Tag</div>
            <div class="asset-id">${asset.assetId}</div>
            <div style="display:flex; justify-content:center; margin: 10px 0;">
              ${svgHtml}
            </div>
            <div class="name">${asset.name}</div>
            <div class="details">Dept: ${asset.department} | Lab: ${asset.laboratory}</div>
            <div class="details">SN: ${asset.serialNumber || 'N/A'}</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`QR Asset Tag - ${asset.assetId}`} maxWidth="450px">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {/* Printable Tag Container */}
        <div
          ref={qrRef}
          style={{
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.5rem',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            marginBottom: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            Institutional Asset Label
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
            {asset.assetId}
          </div>

          <QRCodeSVG
            value={qrPayload}
            size={180}
            level="H"
            includeMargin={true}
          />

          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a', marginTop: '0.75rem' }}>
            {asset.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
            {asset.department} &bull; {asset.laboratory}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Serial: {asset.serialNumber || 'N/A'}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
          <button
            onClick={handleDownload}
            className="btn-secondary"
            style={{ flex: 1 }}
          >
            <Download size={16} />
            Download PNG
          </button>
          <button
            onClick={handlePrint}
            className="btn-primary"
            style={{ flex: 1 }}
          >
            <Printer size={16} />
            Print Tag
          </button>
        </div>
      </div>
    </Modal>
  );
};
