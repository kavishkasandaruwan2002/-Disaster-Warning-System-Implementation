const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema(
  {
    districtId: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    riverBasin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RiverBasin',
      default: null
    },
    citizenCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('District', districtSchema);
