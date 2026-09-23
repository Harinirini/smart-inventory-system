const QRCode = require('qrcode');

/**
 * Generate a base64 QR code image Data URL for an asset
 * @param {Object} asset - Asset document
 * @returns {Promise<string>} Base64 Data URL
 */
const generateAssetQRCode = async (asset) => {
  try {
    const payload = JSON.stringify({
      app: 'SmartInventorySystem',
      assetId: asset.assetId,
      name: asset.name,
      category: asset.category,
      department: asset.department,
      serialNumber: asset.serialNumber || 'N/A',
      location: asset.location || 'N/A',
    });

    const qrCodeDataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      width: 300,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
};

module.exports = { generateAssetQRCode };
