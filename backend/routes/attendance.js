const express = require('express');
const mongoose = require('mongoose');
const { Participant, Event } = require('../models');
const { parseQRCode } = require('../utils/qr');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/attendance/mark
 * @desc    Mark attendance from QR code scan
 * @access  Private (Admin)
 */
router.post('/mark', auth, async (req, res) => {
  try {
    const { qrData, expectedEventId } = req.body;

    // Validate input
    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR code data is required'
      });
    }

    if (!expectedEventId) {
      return res.status(400).json({
        success: false,
        message: 'Expected event ID is required'
      });
    }

    // Parse QR code data
    let parsedData;
    try {
      parsedData = parseQRCode(qrData);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or malformed QR code'
      });
    }

    const { eventId, registrationId } = parsedData;

    // Validate eventId format
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID in QR code'
      });
    }

    // Validate expectedEventId format
    if (!mongoose.Types.ObjectId.isValid(expectedEventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid expected event ID'
      });
    }

    // CRITICAL SECURITY CHECK: Ensure QR code is for the expected event
    if (eventId !== expectedEventId) {
      return res.status(400).json({
        success: false,
        message: `This QR code is for a different event. Please scan a QR code for this event only.`,
        data: {
          scannedEventId: eventId,
          expectedEventId: expectedEventId
        }
      });
    }

    // Find event to verify it exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Find participant by eventId and registrationId
    const participant = await Participant.findOne({
      eventId: eventId,
      registrationId: registrationId
    });

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found or QR code invalid'
      });
    }

    // Check if already attended (prevent duplicate attendance)
    if (participant.attended) {
      return res.status(409).json({
        success: false,
        message: 'Attendance already marked for this participant',
        data: {
          name: participant.name,
          eventTitle: event.title,
          attendanceTime: participant.attendanceTime
        }
      });
    }

    // Mark attendance with timestamp
    participant.attended = true;
    participant.attendanceTime = new Date();
    await participant.save();

    // Return participant and event details for confirmation
    res.json({
      success: true,
      message: 'Attendance marked successfully',
      data: {
        participant: {
          name: participant.name,
          email: participant.email,
          registrationId: participant.registrationId,
          attendanceTime: participant.attendanceTime
        },
        event: {
          id: event._id,
          title: event.title,
          date: event.date,
          venue: event.venue
        }
      }
    });

  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark attendance'
    });
  }
});



/**
 * @route   GET /api/attendance/export/:eventId
 * @desc    Export attendance data to Excel (admin only)
 * @access  Private (Admin)
 */
router.get('/export/:eventId', auth, async (req, res) => {
  try {
    const { eventId } = req.params;

    // Validate eventId format
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is superadmin or event owner
    if (!req.user.isSuperAdmin && event.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only export data for your own events.'
      });
    }

    // Get all participants for the event
    const participants = await Participant.find({ eventId })
      .sort({ createdAt: 1 })
      .lean();

    // Generate Excel file with proper headers
    const { generateAttendanceExport, generateExportFilename } = require('../utils/csv');
    const excelBuffer = await generateAttendanceExport(participants, event);
    const filename = generateExportFilename(event, 'xlsx');

    // Set proper headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', excelBuffer.length);

    // Return file as downloadable response
    res.send(excelBuffer);

  } catch (error) {
    console.error('Export attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export attendance data'
    });
  }
});

module.exports = router;
