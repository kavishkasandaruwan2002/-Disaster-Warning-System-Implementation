const mongoose = require('mongoose');

const organisationSchema = new mongoose.Schema(
  {
    orgId: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['GovernmentBody', 'ArmedForcesUnit', 'NGO', 'PrivateDonor'],
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Organisation', organisationSchema);
