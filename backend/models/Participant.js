const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Participant name is required'],
    trim: true,
    validate: [
      {
        validator: function(value) {
          return value && value.length > 0;
        },
        message: 'Participant name cannot be empty'
      },
      {
        validator: function(value) {
          return !value || value.length <= 100;
        },
        message: 'Participant name cannot exceed 100 characters'
      }
    ]
  },
  email: {
    type: String,
    required: [true, 'Participant email is required'],
    lowercase: true,
    trim: true,
    validate: [
      {
        validator: function(value) {
          return value && value.length > 0;
        },
        message: 'Participant email cannot be empty'
      },
      {
        validator: function(value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return !value || emailRegex.test(value);
        },
        message: 'Please provide a valid email address'
      },
      {
        validator: function(value) {
          return !value || value.length <= 254;
        },
        message: 'Email address cannot exceed 254 characters'
      }
    ]
  },
  registrationId: {
    type: String,
    required: [true, 'Registration ID is required'],
    trim: true,
    validate: [
      {
        validator: function(value) {
          return value && value.length > 0;
        },
        message: 'Registration ID cannot be empty'
      },
      {
        validator: function(value) {
          return !value || value.length <= 50;
        },
        message: 'Registration ID cannot exceed 50 characters'
      }
    ]
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event ID is required']
  },
  qrCode: {
    type: String,
    required: [true, 'QR code is required'],
    trim: true,
    validate: [
      {
        validator: function(value) {
          return value && value.length > 0;
        },
        message: 'QR code cannot be empty'
      },
      {
        validator: function(value) {
          return !value || value.length <= 500;
        },
        message: 'QR code cannot exceed 500 characters'
      }
    ]
  },
  attended: {
    type: Boolean,
    default: false
  },
  attendanceTime: {
    type: Date,
    default: null,
    validate: {
      validator: function(value) {
        return value === null || value instanceof Date;
      },
      message: 'Attendance time must be a valid date or null'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  }
});

// Compound index for unique email per event (most important)
participantSchema.index({ eventId: 1, email: 1 }, { unique: true });

// Individual indexes for performance optimization
participantSchema.index({ qrCode: 1 }, { unique: true });
participantSchema.index({ registrationId: 1 }, { unique: true });
participantSchema.index({ eventId: 1 });
participantSchema.index({ attended: 1 });

// Pre-save middleware to set attendance time when attended is set to true
participantSchema.pre('save', function(next) {
  if (this.isModified('attended') && this.attended === true && !this.attendanceTime) {
    this.attendanceTime = new Date();
  }
  next();
});

module.exports = mongoose.model('Participant', participantSchema);
