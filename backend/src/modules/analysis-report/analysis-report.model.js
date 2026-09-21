const mongoose = require('mongoose');

/**
 * Post-Event Analysis Report Schema - Use Case: Generate Post-Event Analysis Report
 * 
 * TODO: Main Flow - Aggregate disaster metrics, damage assessments, and response times.
 * TODO: Alternate Flow - Export post-event summary as PDF or analytics dataset.
 * TODO: Exception Flow - Incomplete data warning when generating early reports.
 */
const analysisReportSchema = new mongoose.Schema(
  {
    eventTitle: {
      type: String,
      required: true
    },
    disasterType: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    affectedArea: {
      type: String,
      required: true
    },
    totalCasualties: {
      type: Number,
      default: 0
    },
    estimatedDamageUSD: {
      type: Number,
      default: 0
    },
    summaryMetrics: {
      totalReports: Number,
      warningsIssued: Number,
      resourcesDispatched: Number
    },
    author: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AnalysisReport', analysisReportSchema);
