const mongoose = require('mongoose');

const riverBasinSchema = new mongoose.Schema(
  {
    basinId: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    districts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District'
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('RiverBasin', riverBasinSchema);
