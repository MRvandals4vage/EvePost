const ExcelJS = require('exceljs');

/**
 * Excel Export Service for generating attendance data exports
 */

/**
 * Generate Excel export for event attendance data
 * @param {Array} participants - Array of participant objects with attendance data
 * @param {Object} event - Event information
 * @returns {Promise<Buffer>} Excel file buffer
 */
async function generateAttendanceExport(participants, event) {
  try {
    if (!Array.isArray(participants)) {
      throw new Error('Participants must be an array');
    }

    if (!event || !event.title) {
      throw new Error('Event information with title is required');
    }

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Report');

    // Set worksheet properties
    worksheet.properties.defaultRowHeight = 20;

    // Add title and event information
    worksheet.mergeCells('A1:H1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `Attendance Report - ${event.title}`;
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    // Add event details
    worksheet.mergeCells('A2:H2');
    const eventDetailsCell = worksheet.getCell('A2');
    const eventDate = event.date ? new Date(event.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'N/A';
    eventDetailsCell.value = `Event Date: ${eventDate} | Venue: ${event.venue || 'N/A'}`;
    eventDetailsCell.font = { size: 12 };
    eventDetailsCell.alignment = { horizontal: 'center' };

    // Add generation timestamp
    worksheet.mergeCells('A3:H3');
    const timestampCell = worksheet.getCell('A3');
    timestampCell.value = `Generated on: ${new Date().toLocaleString()}`;
    timestampCell.font = { size: 10, italic: true };
    timestampCell.alignment = { horizontal: 'center' };

    // Add empty row
    worksheet.addRow([]);

    // Define column headers
    const headers = [
      'Name',
      'Email',
      'Registration ID',
      'Registration Date',
      'Attended',
      'Attendance Time',
      'Event',
      'Venue'
    ];

    // Add headers row
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Set column widths
    worksheet.columns = [
      { width: 20 }, // Name
      { width: 30 }, // Email
      { width: 20 }, // Registration ID
      { width: 20 }, // Registration Date
      { width: 12 }, // Attended
      { width: 20 }, // Attendance Time
      { width: 25 }, // Event
      { width: 25 }  // Venue
    ];

    // Add participant data
    if (participants.length === 0) {
      // Add a row indicating no participants
      const noDataRow = worksheet.addRow(['No participants registered for this event']);
      worksheet.mergeCells(`A${noDataRow.number}:H${noDataRow.number}`);
      noDataRow.getCell(1).alignment = { horizontal: 'center' };
      noDataRow.getCell(1).font = { italic: true };
    } else {
      participants.forEach(participant => {
        const registrationDate = participant.createdAt 
          ? new Date(participant.createdAt).toLocaleDateString()
          : 'N/A';
        
        const attendanceTime = participant.attendanceTime 
          ? new Date(participant.attendanceTime).toLocaleString()
          : (participant.attended ? 'Yes (time not recorded)' : 'N/A');

        const row = worksheet.addRow([
          participant.name || 'N/A',
          participant.email || 'N/A',
          participant.registrationId || 'N/A',
          registrationDate,
          participant.attended ? 'Yes' : 'No',
          attendanceTime,
          event.title || 'N/A',
          event.venue || 'N/A'
        ]);

        // Color code attendance status
        const attendedCell = row.getCell(5);
        if (participant.attended) {
          attendedCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD4EDDA' } // Light green
          };
          attendedCell.font = { color: { argb: 'FF155724' } }; // Dark green
        } else {
          attendedCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8D7DA' } // Light red
          };
          attendedCell.font = { color: { argb: 'FF721C24' } }; // Dark red
        }
      });
    }

    // Add summary section
    const summaryStartRow = worksheet.rowCount + 2;
    worksheet.addRow([]);
    
    const summaryHeaderRow = worksheet.addRow(['Summary']);
    summaryHeaderRow.getCell(1).font = { size: 14, bold: true };
    
    const totalRegistered = participants.length;
    const totalAttended = participants.filter(p => p.attended).length;
    const attendanceRate = totalRegistered > 0 ? ((totalAttended / totalRegistered) * 100).toFixed(1) : '0.0';

    worksheet.addRow(['Total Registered:', totalRegistered]);
    worksheet.addRow(['Total Attended:', totalAttended]);
    worksheet.addRow(['Attendance Rate:', `${attendanceRate}%`]);

    // Style summary section
    for (let i = summaryStartRow; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      row.getCell(1).font = { bold: true };
      if (i > summaryStartRow + 1) { // Skip the "Summary" header
        row.getCell(2).font = { bold: true };
      }
    }

    // Add borders to all data cells
    const startRow = 5; // Header row
    const endRow = worksheet.rowCount;
    const startCol = 1; // Column A
    const endCol = 8; // Column H

    for (let rowNum = startRow; rowNum <= endRow; rowNum++) {
      const row = worksheet.getRow(rowNum);
      for (let colNum = startCol; colNum <= endCol; colNum++) {
        const cell = row.getCell(colNum);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    throw new Error(`Failed to generate attendance export: ${error.message}`);
  }
}

/**
 * Generate CSV export for event attendance data (alternative format)
 * @param {Array} participants - Array of participant objects with attendance data
 * @param {Object} event - Event information
 * @returns {string} CSV content as string
 */
function generateAttendanceCSV(participants, event) {
  try {
    if (!Array.isArray(participants)) {
      throw new Error('Participants must be an array');
    }

    if (!event || !event.title) {
      throw new Error('Event information with title is required');
    }

    // Define CSV headers
    const headers = [
      'Name',
      'Email',
      'Registration ID',
      'Registration Date',
      'Attended',
      'Attendance Time',
      'Event',
      'Venue'
    ];

    // Create CSV content
    let csvContent = headers.join(',') + '\n';

    if (participants.length === 0) {
      csvContent += 'No participants registered for this event\n';
    } else {
      participants.forEach(participant => {
        const registrationDate = participant.createdAt 
          ? new Date(participant.createdAt).toLocaleDateString()
          : 'N/A';
        
        const attendanceTime = participant.attendanceTime 
          ? new Date(participant.attendanceTime).toLocaleString()
          : (participant.attended ? 'Yes (time not recorded)' : 'N/A');

        const row = [
          escapeCSVField(participant.name || 'N/A'),
          escapeCSVField(participant.email || 'N/A'),
          escapeCSVField(participant.registrationId || 'N/A'),
          escapeCSVField(registrationDate),
          participant.attended ? 'Yes' : 'No',
          escapeCSVField(attendanceTime),
          escapeCSVField(event.title || 'N/A'),
          escapeCSVField(event.venue || 'N/A')
        ];

        csvContent += row.join(',') + '\n';
      });
    }

    return csvContent;
  } catch (error) {
    throw new Error(`Failed to generate CSV export: ${error.message}`);
  }
}

/**
 * Escape CSV field to handle commas, quotes, and newlines
 * @param {string} field - Field value to escape
 * @returns {string} Escaped field value
 */
function escapeCSVField(field) {
  if (typeof field !== 'string') {
    field = String(field);
  }

  // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return '"' + field.replace(/"/g, '""') + '"';
  }

  return field;
}

/**
 * Generate filename for export based on event and current date
 * @param {Object} event - Event information
 * @param {string} format - File format ('xlsx' or 'csv')
 * @returns {string} Generated filename
 */
function generateExportFilename(event, format = 'xlsx') {
  const eventTitle = event.title ? event.title.replace(/[^a-zA-Z0-9]/g, '_') : 'Event';
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  return `${eventTitle}_Attendance_${timestamp}.${format}`;
}

/**
 * Validate export data before processing
 * @param {Array} participants - Participants array to validate
 * @param {Object} event - Event object to validate
 * @returns {Object} Validation result with isValid boolean and errors array
 */
function validateExportData(participants, event) {
  const errors = [];

  if (!Array.isArray(participants)) {
    errors.push('Participants must be an array');
  }

  if (!event) {
    errors.push('Event information is required');
  } else {
    if (!event.title) {
      errors.push('Event title is required');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  generateAttendanceExport,
  generateAttendanceCSV,
  generateExportFilename,
  validateExportData,
  escapeCSVField
};