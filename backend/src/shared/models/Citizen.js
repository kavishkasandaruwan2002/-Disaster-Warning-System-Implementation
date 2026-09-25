const mongoose = require('mongoose');

const citizenSchema = new mongoose.Schema(
  {
    nationalId: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    homeAddress: {
      type: String,
      required: true
    },
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      required: true
    },
    pushToken: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Citizen', citizenSchema);
