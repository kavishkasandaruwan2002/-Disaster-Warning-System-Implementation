const mongoose = require('mongoose');

/**
 * Ground Report Schema - Use Case: Submit and Verify Ground Hazard Report
 * 
 * TODO: Main Flow - Citizens submit reports with location, description, severity, and media.
 * TODO: Alternate Flow - Verification officers review and mark report as verified.
 * TODO: Exception Flow - Invalid input handling, duplicate report rejection.
 */
const groundReportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String }
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM'
    },
    status: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING'
    },
    reportedBy: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('GroundReport', groundReportSchema);
