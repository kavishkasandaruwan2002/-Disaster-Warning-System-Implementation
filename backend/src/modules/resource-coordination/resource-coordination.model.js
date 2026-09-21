const mongoose = require('mongoose');

/**
 * Resource Coordination Schema - Use Case: Coordinate Emergency Resources
 * 
 * TODO: Main Flow - Dispatch emergency teams and equipment to hazard sites.
 * TODO: Alternate Flow - Reassign resources based on evolving emergency needs.
 * TODO: Exception Flow - Insufficient available resources alert.
 */
const resourceCoordinationSchema = new mongoose.Schema(
  {
    resourceName: {
      type: String,
      required: true
    },
    resourceType: {
      type: String, // e.g. MEDICAL, RESCUE, SUPPLIES, VEHICLE
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'DISPATCHED', 'IN_USE', 'MAINTENANCE'],
      default: 'AVAILABLE'
    },
    assignedLocation: {
      latitude: Number,
      longitude: Number,
      siteName: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ResourceCoordination', resourceCoordinationSchema);
