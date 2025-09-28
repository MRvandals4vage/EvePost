const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    validate: [
      {
        validator: function(value) {
          return value && value.length > 0;
        },
        message: 'Event title cannot be empty'
      },
      {
        validator: function(value) {
          return !value || value.length <= 200;
        },
        message: 'Event title cannot exceed 200 characters'
      }
    ]
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    validate: [
      {
        validator: function(value) {
          return value && value.length > 0;
        },
        message: 'Event description cannot be empty'
      },
      {
        validator: function(value) {
          return !value || value.length <= 2000;
        },
        message: 'Event description cannot exceed 2000 characters'
      }
    ]
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(value) {
        return value instanceof Date && !isNaN(value);
      },
      message: 'Event date must be a valid date'
    }
  },
  venue: {
    type: String,
    required: [true, 'Event venue is required'],
    trim: true,
    validate: [
      {
        validator: function(value) {
          return value && value.length > 0;
        },
        message: 'Event venue cannot be empty'
      },
      {
        validator: function(value) {
          return !value || value.length <= 500;
        },
        message: 'Event venue cannot exceed 500 characters'
      }
    ]
  },
  maxParticipants: {
    type: Number,
    default: null,
    min: [1, 'Maximum participants must be at least 1'],
    validate: {
      validator: function(value) {
        return value === null || (Number.isInteger(value) && value > 0);
      },
      message: 'Maximum participants must be a positive integer or null'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: [true, 'Event organizer is required']
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
eventSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

// Virtual for participant count
eventSchema.virtual('participantCount').get(function() {
  return this.participants ? this.participants.length : 0;
});

// Virtual for attended count - works with populated participants
eventSchema.virtual('attendedCount').get(function() {
  if (!this.participants || this.participants.length === 0) {
    return 0;
  }
  
  // Check if participants are populated (have attended property)
  const firstParticipant = this.participants[0];
  if (firstParticipant && typeof firstParticipant.attended !== 'undefined') {
    return this.participants.filter(p => p.attended === true).length;
  }
  
  // If not populated, we can't determine attended count
  return 0;
});

// Ensure virtual fields are serialized
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
