const mongoose = require('mongoose');

/**
 * Hazard Warning Schema - Use Case: Issue Location-Specific Hazard Warning
 * 
 * TODO: Main Flow - Disaster manager issues warning for specific geographic region.
 * TODO: Alternate Flow - Update active warning level or expand affected radius.
 * TODO: Exception Flow - Expired or conflicting warning area detection.
 */
const hazardWarningSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    hazardType: {
      type: String,
      required: true
    },
    targetRegion: {
      name: { type: String, required: true },
      coordinates: [{ latitude: Number, longitude: Number }]
    },
    warningLevel: {
      type: String,
      enum: ['ADVISORY', 'WATCH', 'WARNING', 'EVACUATE'],
      default: 'ADVISORY'
    },
    issuedBy: {
      type: String,
      required: true
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('HazardWarning', hazardWarningSchema);
