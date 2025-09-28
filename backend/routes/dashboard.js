const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Participant = require('../models/Participant');
const verifyToken = require('../middleware/auth');

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics for admin users
 * Returns total events, participants, and attendance rates
 */
router.get('/stats', verifyToken, async (req, res) => {
  try {
    // Calculate total events
    const totalEvents = await Event.countDocuments({ isActive: true });
    
    // Calculate total participants
    const totalParticipants = await Participant.countDocuments();
    
    // Calculate total attended participants
    const totalAttended = await Participant.countDocuments({ attended: true });
    
    // Calculate overall attendance rate (handle zero division)
    let overallAttendanceRate = 0;
    if (totalParticipants > 0) {
      overallAttendanceRate = Math.round((totalAttended / totalParticipants) * 100);
    }
    
    // Get event-specific statistics
    const eventStats = await Event.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $lookup: {
          from: 'participants',
          localField: '_id',
          foreignField: 'eventId',
          as: 'participants'
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          date: 1,
          venue: 1,
          participantCount: { $size: '$participants' },
          attendedCount: {
            $size: {
              $filter: {
                input: '$participants',
                cond: { $eq: ['$$this.attended', true] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          attendanceRate: {
            $cond: {
              if: { $eq: ['$participantCount', 0] },
              then: 0,
              else: {
                $round: [
                  { $multiply: [{ $divide: ['$attendedCount', '$participantCount'] }, 100] },
                  0
                ]
              }
            }
          }
        }
      },
      {
        $sort: { date: -1 }
      }
    ]);

    // Calculate additional statistics
    const upcomingEvents = await Event.countDocuments({
      isActive: true,
      date: { $gte: new Date() }
    });

    // Note: Past events are automatically paused, so no need to count them separately

    // Response data
    const stats = {
      overview: {
        totalEvents,
        totalParticipants,
        totalAttended,
        overallAttendanceRate,
        upcomingEvents
      },
      events: eventStats
    };

    res.json({
      success: true,
      data: stats,
      message: 'Dashboard statistics retrieved successfully'
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics'
    });
  }
});

module.exports = router;