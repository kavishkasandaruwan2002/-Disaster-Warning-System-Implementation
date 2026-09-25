const mongoose = require('mongoose');

const analysisReportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true
    },
    generatedDate: {
      type: Date,
      default: Date.now
    },
    periodFrom: {
      type: Date,
      required: true
    },
    periodTo: {
      type: Date,
      required: true
    },
    districtFilter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      default: null
    },
    hazardTypeFilter: {
      type: String,
      default: ''
    },
    citizensReachedCount: {
      type: Number,
      default: 0
    },
    alertsIssuedCount: {
      type: Number,
      default: 0
    },
    reportsVerifiedCount: {
      type: Number,
      default: 0
    },
    sheltersActivatedCount: {
      type: Number,
      default: 0
    },
    sharedWithOrgIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organisation'
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AnalysisReport', analysisReportSchema);
