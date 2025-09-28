const QRCode = require('qrcode');

/**
 * QR Code Service for generating and parsing QR codes for event attendance
 * QR code format: "eventId:registrationId"
 */

/**
 * Generate QR code for event registration
 * @param {string} eventId - MongoDB ObjectId of the event
 * @param {string} registrationId - Unique registration identifier
 * @returns {Promise<string>} Base64 encoded QR code image
 */
async function generateQRCode(eventId, registrationId) {
  try {
    if (!eventId || !registrationId) {
      throw new Error('EventId and registrationId are required');
    }

    const qrData = `${eventId}:${registrationId}`;
    
    // Generate QR code as base64 string
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return qrCodeDataURL;
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error.message}`);
  }
}

/**
 * Generate QR code as buffer for email attachment
 * @param {string} eventId - MongoDB ObjectId of the event
 * @param {string} registrationId - Unique registration identifier
 * @returns {Promise<Buffer>} QR code image buffer
 */
async function generateQRCodeBuffer(eventId, registrationId) {
  try {
    if (!eventId || !registrationId) {
      throw new Error('EventId and registrationId are required');
    }

    const qrData = `${eventId}:${registrationId}`;
    
    // Generate QR code as buffer
    const qrCodeBuffer = await QRCode.toBuffer(qrData, {
      errorCorrectionLevel: 'M',
      type: 'png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return qrCodeBuffer;
  } catch (error) {
    throw new Error(`Failed to generate QR code buffer: ${error.message}`);
  }
}

/**
 * Parse QR code data to extract event ID and registration ID
 * @param {string} qrData - Scanned QR code data
 * @returns {Object} Object containing eventId and registrationId
 */
function parseQRCode(qrData) {
  try {
    if (!qrData || typeof qrData !== 'string') {
      throw new Error('Invalid QR code data');
    }

    const parts = qrData.split(':');
    
    if (parts.length !== 2) {
      throw new Error('Invalid QR code format. Expected format: eventId:registrationId');
    }

    const [eventId, registrationId] = parts;

    if (!eventId || !registrationId) {
      throw new Error('EventId and registrationId cannot be empty');
    }

    return {
      eventId: eventId.trim(),
      registrationId: registrationId.trim()
    };
  } catch (error) {
    throw new Error(`Failed to parse QR code: ${error.message}`);
  }
}

/**
 * Validate QR code format without parsing
 * @param {string} qrData - QR code data to validate
 * @returns {boolean} True if format is valid
 */
function isValidQRCodeFormat(qrData) {
  try {
    parseQRCode(qrData);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  generateQRCode,
  generateQRCodeBuffer,
  parseQRCode,
  isValidQRCodeFormat
};