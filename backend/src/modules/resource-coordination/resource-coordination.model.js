const mongoose = require('mongoose');

const shelterSchema = new mongoose.Schema(
  {
    shelterId: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    capacity: {
      type: Number,
      required: true
    },
    currentOccupancy: {
      type: Number,
      default: 0
    },
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      required: true
    },
    ownerOrgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organisation',
      required: true
    },
    status: {
      type: String,
      enum: ['OPEN', 'FULL', 'NOT_ACTIVATED'],
      default: 'OPEN'
    }
  },
  { timestamps: true }
);

const rescueTeamSchema = new mongoose.Schema(
  {
    teamId: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'DISPATCHED', 'RETURNING'],
      default: 'AVAILABLE'
    },
    currentLocation: {
      type: String,
      default: ''
    },
    ownerOrgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organisation',
      required: true
    },
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      required: true
    }
  },
  { timestamps: true }
);

const reliefSupplySchema = new mongoose.Schema(
  {
    supplyId: {
      type: String,
      required: true,
      unique: true
    },
    supplyType: {
      type: String,
      enum: ['Food', 'Water', 'Medicine', 'ShelterMaterial'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    distributedQuantity: {
      type: Number,
      default: 0
    },
    ownerOrgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organisation',
      required: true
    },
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      required: true
    }
  },
  { timestamps: true }
);

const Shelter = mongoose.model('Shelter', shelterSchema);
const RescueTeam = mongoose.model('RescueTeam', rescueTeamSchema);
const ReliefSupply = mongoose.model('ReliefSupply', reliefSupplySchema);

module.exports = {
  Shelter,
  RescueTeam,
  ReliefSupply
};
