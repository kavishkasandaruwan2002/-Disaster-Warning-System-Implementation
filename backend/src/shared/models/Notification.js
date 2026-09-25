const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    notificationId: {
      type: String,
      required: true
    },
    hazardAlertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HazardAlert',
      required: true
    },
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Citizen',
      required: true
    },
    channel: {
      type: String,
      enum: ['PUSH', 'SMS', 'AUDIBLE'],
      required: true
    },
    sentTime: {
      type: Date,
      default: Date.now
    },
    deliveryStatus: {
      type: String,
      enum: ['SENT', 'FAILED'],
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
