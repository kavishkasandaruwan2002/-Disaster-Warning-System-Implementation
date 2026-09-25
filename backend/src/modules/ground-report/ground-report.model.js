const mongoose = require('mongoose');

const groundReportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true
    },
    hazardType: {
      type: String,
      enum: ['Flood', 'Landslide', 'Cyclone', 'Drought', 'Other'],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    photoUrl: {
      type: String,
      default: ''
    },
    gpsLat: {
      type: Number,
      required: true
    },
    gpsLng: {
      type: Number,
      required: true
    },
    submittedTime: {
      type: Date,
      default: Date.now
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Citizen',
      required: false
    },
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      required: true
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED', 'NEEDS_MORE_INFO'],
      default: 'PENDING'
    },
    verifiedBy: {
      type: String,
      default: ''
    },
    verifiedTime: {
      type: Date
    },
    severityLevel: {
      type: String,
      enum: ['LOW', 'HIGH']
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    corroboratingReportIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GroundReport'
      }
    ],
    evidenceHistory: [
      {
        photoUrl: String,
        comment: String,
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('GroundReport', groundReportSchema);
