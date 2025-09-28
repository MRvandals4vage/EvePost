const { Event } = require('../models');

/**
 * Auto-pause events that have passed their date
 * This function can be called periodically to ensure events are automatically paused
 */
const autoPauseExpiredEvents = async () => {
  try {
    const now = new Date();
    const result = await Event.updateMany(
      { 
        date: { $lt: now },
        isActive: true 
      },
      { 
        $set: { isActive: false } 
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`🔄 Auto-paused ${result.modifiedCount} expired events`);
    }

    return {
      success: true,
      modifiedCount: result.modifiedCount,
      message: `Auto-paused ${result.modifiedCount} expired events`
    };
  } catch (error) {
    console.error('Error auto-pausing expired events:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Start periodic cleanup task
 * Runs every hour to auto-pause expired events
 */
const startEventCleanupTask = () => {
  // Run immediately on startup
  autoPauseExpiredEvents();

  // Then run every hour (3600000 ms)
  setInterval(autoPauseExpiredEvents, 3600000);
  
  console.log('🕐 Event cleanup task started - will run every hour');
};

module.exports = {
  autoPauseExpiredEvents,
  startEventCleanupTask
};
