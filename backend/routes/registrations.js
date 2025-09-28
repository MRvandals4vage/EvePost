const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { Event, Participant } = require('../models');
const { generateQRCodeBuffer } = require('../utils/qr');
const verifyToken = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/registrations
 * @desc    Register participant for an event
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, eventId } = req.body;

    // Validate required input
    if (!name || !email || !eventId) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and eventId are required'
      });
    }

    // Validate input formats
    const trimmedName = name.trim();
    const trimmedEmail = email.toLowerCase().trim();

    if (trimmedName.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Name cannot be empty'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Check if event exists and is active
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (!event.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Event is not active for registration'
      });
    }

    // Note: Past events are automatically paused, so they won't be active

    // Check for duplicate registration (Requirement 2.4)
    const existingParticipant = await Participant.findOne({ 
      eventId, 
      email: trimmedEmail 
    });
    
    if (existingParticipant) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered for this event'
      });
    }

    // Check event capacity (Requirement 2.5)
    if (event.maxParticipants) {
      const currentParticipants = await Participant.countDocuments({ eventId });
      if (currentParticipants >= event.maxParticipants) {
        return res.status(400).json({
          success: false,
          message: 'Event has reached maximum capacity'
        });
      }
    }

    // Generate unique registration ID (Requirement 2.1)
    const registrationId = `REG-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Generate QR code data format: "eventId:registrationId" (Requirement 2.2)
    const qrData = `${eventId}:${registrationId}`;

    // Generate QR code buffer for email attachment (Requirement 2.2)
    const qrCodeBuffer = await generateQRCodeBuffer(eventId, registrationId);

    // Generate QR code buffer for ticket generation

    // Save to database
    const participant = new Participant({
      name: trimmedName,
      email: trimmedEmail,
      registrationId,
      eventId,
      qrCode: qrData
    });

    // Save participant
    await participant.save();

    // Add participant to event's participants array
    event.participants.push(participant._id);
    await event.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful! Generate your ticket below.',
      registration: {
        id: participant._id,
        name: participant.name,
        email: participant.email,
        registrationId: participant.registrationId,
        eventId: event._id,
        eventTitle: event.title,
        eventDate: event.date,
        venue: event.venue,
        qrCodeData: qrCodeBuffer.toString('base64'), // Base64 encoded QR code for frontend
        createdAt: participant.createdAt
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors (should be caught by our check above, but just in case)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Registration already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
});

/**
 * @route   GET /api/registrations/event/:eventId
 * @desc    Get all registrations for an event (admin only)
 * @access  Private (Admin)
 */
router.get('/event/:eventId', verifyToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 50, search = '' } = req.query;
    
    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Cap at 100 items per page
    const skip = (pageNum - 1) * limitNum;

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
        message: 'Access denied. You can only view participants for your own events.'
      });
    }

    // Build query for participants
    let query = { eventId };
    
    // Add search filter if provided
    if (search && search.trim()) {
      const searchTerm = search.trim();
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { registrationId: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Get participants with pagination
    const participants = await Participant.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-qrCode') // Don't include QR code data in list view for security
      .lean();

    // Get total count for pagination
    const total = await Participant.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    // Calculate attendance statistics
    const attendedCount = participants.filter(p => p.attended).length;
    const attendanceRate = participants.length > 0 ? (attendedCount / participants.length * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        event: {
          id: event._id,
          title: event.title,
          date: event.date,
          venue: event.venue,
          maxParticipants: event.maxParticipants,
          isActive: event.isActive
        },
        registrations: participants,
        statistics: {
          totalRegistrations: total,
          attendedCount: attendedCount,
          attendanceRate: parseFloat(attendanceRate)
        },
        pagination: {
          currentPage: pageNum,
          totalPages: totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get registrations error:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations'
    });
  }
});

module.exports = router;
