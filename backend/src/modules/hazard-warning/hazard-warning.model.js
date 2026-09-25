const mongoose = require('mongoose');

const hazardAlertSchema = new mongoose.Schema(
  {
    alertId: {
      type: String,
      required: true,
      unique: true
    },
    hazardType: {
      type: String,
      enum: ['Flood', 'Landslide', 'Cyclone', 'Drought'],
      required: true
    },
    severityLevel: {
      type: String,
      enum: ['Advisory', 'Watch', 'Warning', 'Emergency'],
      required: true
    },
    targetDistrictIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District'
      }
    ],
    targetRiverBasinId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RiverBasin',
      default: null
    },
    message: {
      type: String,
      required: true
    },
    issuedTime: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'ESCALATED', 'CANCELLED', 'EXPIRED'],
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('HazardAlert', hazardAlertSchema);
