const express = require('express');
const { Event, Participant } = require('../models');
const auth = require('../middleware/auth');
const { autoPauseExpiredEvents } = require('../utils/eventCleanup');

const router = express.Router();

/**
 * @route   GET /api/events
 * @desc    Get all events - different responses for admin vs public
 * @access  Public (limited data) / Admin (full data with stats)
 */
router.get('/', async (req, res) => {
  try {
    // Check if user is authenticated admin (optional authentication)
    let isAdminUser = false;
    const authHeader = req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const Admin = require('../models/Admin');
        const token = authHeader.replace('Bearer ', '').trim();
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id);
        if (admin) {
          isAdminUser = true;
          req.user = { 
            id: admin._id, 
            username: admin.username,
            role: admin.role,
            isSuperAdmin: admin.isSuperAdmin()
          };
          req.admin = admin;
        }
      } catch (error) {
        // Invalid token, continue as public user
        isAdminUser = false;
      }
    }

    // Auto-pause events that have passed their date
    const now = new Date();
    await Event.updateMany(
      { 
        date: { $lt: now },
        isActive: true 
      },
      { 
        $set: { isActive: false } 
      }
    );

    if (isAdminUser) {
      // Check if user is superadmin
      const isSuperAdmin = req.user && req.user.isSuperAdmin;
      
      let events;
      if (isSuperAdmin) {
        // Superadmin view: return ALL events with participant counts and stats
        events = await Event.find({})
          .populate('participants', 'attended')
          .populate('organizer', 'username')
          .sort({ date: 1 })
          .lean();
      } else {
        // Regular admin view: return only events created by this admin with participant counts and stats
        events = await Event.find({ organizer: req.user.id })
          .populate('participants', 'attended')
          .populate('organizer', 'username')
          .sort({ date: 1 })
          .lean();
      }

      // Add virtual fields for each event
      const eventsWithStats = events.map(event => {
        // Ensure organizer has a fallback
        const organizer = event.organizer || { username: 'Unknown Organizer' };
        
        return {
          ...event,
          participantCount: event.participants ? event.participants.length : 0,
          attendedCount: event.participants ? event.participants.filter(p => p.attended).length : 0,
          organizer
        };
      });

      res.json({
        success: true,
        events: eventsWithStats
      });
    } else {
      // Public view: return only active events with participant counts and organizer info
      const events = await Event.find({ isActive: true })
        .populate('participants', 'attended')
        .populate('organizer', 'username')
        .sort({ date: 1 })
        .lean();

      // Add participant counts but remove participant details for public access
      const eventsWithCounts = events.map(event => {
        const participantCount = event.participants ? event.participants.length : 0;
        const attendedCount = event.participants ? event.participants.filter(p => p.attended).length : 0;
        
        // Remove participants array to keep it secure
        delete event.participants;
        
        // Ensure organizer has a fallback
        const organizer = event.organizer || { username: 'Unknown Organizer' };
        
        return {
          ...event,
          participantCount,
          attendedCount,
          organizer
        };
      });

      res.json({
        success: true,
        events: eventsWithCounts
      });
    }
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
});

/**
 * @route   GET /api/events/:id
 * @desc    Get single event details with participant count
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Auto-pause this specific event if date has passed
    const now = new Date();
    await Event.updateOne(
      { 
        _id: req.params.id,
        date: { $lt: now },
        isActive: true 
      },
      { 
        $set: { isActive: false } 
      }
    );

    const event = await Event.findById(req.params.id)
      .populate('participants', 'attended')
      .populate('organizer', 'username')
      .lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Add virtual fields for participant counts
    event.participantCount = event.participants ? event.participants.length : 0;
    event.attendedCount = event.participants ? event.participants.filter(p => p.attended).length : 0;

    // Ensure organizer has a fallback
    event.organizer = event.organizer || { username: 'Unknown Organizer' };

    // Remove participant details for public access, keep only counts
    delete event.participants;

    res.json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Get event error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch event'
    });
  }
});

/**
 * @route   POST /api/events
 * @desc    Create new event
 * @access  Private (Admin)
 */
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, date, venue, maxParticipants } = req.body;

    // Validate required fields
    if (!title || !description || !date || !venue) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, date, and venue are required'
      });
    }

    // Validate date
    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    const event = new Event({
      title,
      description,
      date: eventDate,
      venue,
      maxParticipants: maxParticipants || null,
      organizer: req.user.id
    });

    await event.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create event'
    });
  }
});

/**
 * @route   PUT /api/events/:id
 * @desc    Update event
 * @access  Private (Admin)
 */
router.put('/:id', auth, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const { title, description, date, venue, maxParticipants, isActive } = req.body;

    const event = await Event.findById(req.params.id);
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
        message: 'Access denied. You can only update your own events.'
      });
    }

    // Update fields (partial update)
    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (date !== undefined) {
      const eventDate = new Date(date);
      if (isNaN(eventDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format'
        });
      }
      event.date = eventDate;
    }
    if (venue !== undefined) event.venue = venue;
    if (maxParticipants !== undefined) event.maxParticipants = maxParticipants;
    if (isActive !== undefined) event.isActive = isActive;

    await event.save();

    res.json({
      success: true,
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    console.error('Update event error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Handle CastError for invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update event'
    });
  }
});

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete event and all associated data
 * @access  Private (Admin)
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if the event belongs to the current admin
    
    // Check if user is superadmin or event owner
    if (!req.user.isSuperAdmin && event.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own events.'
      });
    }

    // Delete all participants associated with this event
    await Participant.deleteMany({ eventId: req.params.id });

    // Delete the event
    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Event and all associated data deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    
    // Handle CastError for invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete event'
    });
  }
});

/**
 * @route   GET /api/events/:id/stats
 * @desc    Get event statistics
 * @access  Private (Admin)
 */
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const participants = await Participant.find({ eventId: event._id });
    const attendedCount = participants.filter(p => p.attended).length;

    res.json({
      success: true,
      stats: {
        totalParticipants: participants.length,
        attendedCount,
        attendanceRate: participants.length > 0 ? (attendedCount / participants.length * 100).toFixed(2) : 0,
        maxParticipants: event.maxParticipants,
        isFull: event.maxParticipants ? participants.length >= event.maxParticipants : false
      }
    });
  } catch (error) {
    console.error('Get event stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event statistics'
    });
  }
});

/**
 * @route   POST /api/events/cleanup
 * @desc    Manually trigger auto-pause for expired events
 * @access  Private (Admin)
 */
router.post('/cleanup', auth, async (req, res) => {
  try {
    // Only superadmin can run cleanup
    if (!req.user.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only superadmin can run cleanup.'
      });
    }
    
    const result = await autoPauseExpiredEvents();
    
    res.json({
      success: result.success,
      message: result.message || 'Cleanup completed',
      modifiedCount: result.modifiedCount || 0
    });
  } catch (error) {
    console.error('Manual cleanup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run cleanup'
    });
  }
});

module.exports = router;
