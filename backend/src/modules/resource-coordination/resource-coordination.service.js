const mongoose = require('mongoose');
const { Shelter, RescueTeam, ReliefSupply } = require('./resource-coordination.model');

/**
 * Service handling Resource Coordination business logic (UC3)
 */
class ResourceCoordinationService {
  async getResourceDashboard(districtId) {
    const filter = {};
    if (districtId) {
      if (mongoose.Types.ObjectId.isValid(districtId)) {
        filter.districtId = districtId;
      }
    }

    const shelters = await Shelter.find(filter);
    for (const item of shelters) {
      if (item.districtId) await item.populate('districtId');
      if (item.ownerOrgId) await item.populate('ownerOrgId');
    }

    const rescueTeams = await RescueTeam.find(filter);
    for (const item of rescueTeams) {
      if (item.districtId) await item.populate('districtId');
      if (item.ownerOrgId) await item.populate('ownerOrgId');
    }

    const reliefSupplies = await ReliefSupply.find(filter);
    for (const item of reliefSupplies) {
      if (item.districtId) await item.populate('districtId');
      if (item.ownerOrgId) await item.populate('ownerOrgId');
    }

    return {
      shelters,
      rescueTeams,
      reliefSupplies
    };
  }

  async registerShelter(data) {
    const { name, location, capacity, districtId, ownerOrgId } = data;

    if (!name || !location || capacity === undefined || !districtId || !ownerOrgId) {
      const error = new Error('Missing required shelter registration fields');
      error.statusCode = 400;
      throw error;
    }

    const shelterId = `SHELTER-${Date.now()}`;

    const shelter = await Shelter.create({
      shelterId,
      name,
      location,
      capacity: Number(capacity),
      currentOccupancy: 0,
      districtId,
      ownerOrgId,
      status: 'OPEN'
    });

    return this.findShelter(shelter._id);
  }

  async findShelter(id) {
    let shelter = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      shelter = await Shelter.findById(id);
    }
    if (!shelter) {
      shelter = await Shelter.findOne({ shelterId: id });
    }
    if (!shelter) {
      const error = new Error('Shelter not found');
      error.statusCode = 404;
      throw error;
    }

    if (shelter.districtId) await shelter.populate('districtId');
    if (shelter.ownerOrgId) await shelter.populate('ownerOrgId');

    return shelter;
  }

  async updateShelterOccupancy(id, newOccupancy) {
    let shelter = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      shelter = await Shelter.findById(id);
    }
    if (!shelter) {
      shelter = await Shelter.findOne({ shelterId: id });
    }
    if (!shelter) {
      const error = new Error('Shelter not found');
      error.statusCode = 404;
      throw error;
    }

    const targetOccupancy = Number(newOccupancy);

    if (targetOccupancy > shelter.capacity) {
      shelter.status = 'FULL';
      await shelter.save();
      const error = new Error('Shelter at capacity');
      error.statusCode = 400;
      throw error;
    }

    shelter.currentOccupancy = targetOccupancy;
    shelter.status = targetOccupancy === shelter.capacity ? 'FULL' : 'OPEN';
    await shelter.save();

    return this.findShelter(shelter._id);
  }

  async getRescueTeams(districtId, status = 'AVAILABLE') {
    const filter = {};
    if (districtId) filter.districtId = districtId;
    if (status) filter.status = status;

    const teams = await RescueTeam.find(filter);
    for (const item of teams) {
      if (item.districtId) await item.populate('districtId');
      if (item.ownerOrgId) await item.populate('ownerOrgId');
    }

    return teams;
  }

  async findRescueTeam(id) {
    let team = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      team = await RescueTeam.findById(id);
    }
    if (!team) {
      team = await RescueTeam.findOne({ teamId: id });
    }
    if (!team) {
      const error = new Error('Rescue team not found');
      error.statusCode = 404;
      throw error;
    }

    if (team.districtId) await team.populate('districtId');
    if (team.ownerOrgId) await team.populate('ownerOrgId');

    return team;
  }

  async dispatchRescueTeam(id, { location }) {
    let team = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      team = await RescueTeam.findById(id);
    }
    if (!team) {
      team = await RescueTeam.findOne({ teamId: id });
    }
    if (!team) {
      const error = new Error('Rescue team not found');
      error.statusCode = 404;
      throw error;
    }

    if (team.status !== 'AVAILABLE') {
      const error = new Error('Team not available');
      error.statusCode = 400;
      throw error;
    }

    team.status = 'DISPATCHED';
    team.currentLocation = location || 'Emergency Zone';
    await team.save();

    return this.findRescueTeam(team._id);
  }

  async returnRescueTeam(id) {
    let team = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      team = await RescueTeam.findById(id);
    }
    if (!team) {
      team = await RescueTeam.findOne({ teamId: id });
    }
    if (!team) {
      const error = new Error('Rescue team not found');
      error.statusCode = 404;
      throw error;
    }

    if (team.status === 'DISPATCHED') {
      team.status = 'RETURNING';
    } else if (team.status === 'RETURNING') {
      team.status = 'AVAILABLE';
    } else {
      team.status = 'AVAILABLE';
    }

    await team.save();
    return this.findRescueTeam(team._id);
  }

  async distributeReliefSupply({ supplyId, shelterId, quantity }) {
    let supply = null;
    if (mongoose.Types.ObjectId.isValid(supplyId)) {
      supply = await ReliefSupply.findById(supplyId);
    }
    if (!supply) {
      supply = await ReliefSupply.findOne({ supplyId });
    }

    if (!supply) {
      const error = new Error('Relief supply item not found');
      error.statusCode = 404;
      throw error;
    }

    const qtyToDistribute = Number(quantity);

    if (supply.distributedQuantity + qtyToDistribute > supply.quantity) {
      const error = new Error('Quantity exceeds on-hand stock');
      error.statusCode = 400;
      throw error;
    }

    supply.distributedQuantity += qtyToDistribute;
    await supply.save();

    let shelterUpdated = null;
    if (shelterId) {
      try {
        const shelter = await this.findShelter(shelterId);
        if (shelter) {
          const newOccupancy = Math.min(shelter.capacity, shelter.currentOccupancy + Math.min(qtyToDistribute, 5));
          shelterUpdated = await this.updateShelterOccupancy(shelter._id, newOccupancy).catch(() => shelter);
        }
      } catch (e) {
        // Ignore shelter update error
      }
    }

    const updatedSupply = await ReliefSupply.findById(supply._id);
    if (updatedSupply.districtId) await updatedSupply.populate('districtId');
    if (updatedSupply.ownerOrgId) await updatedSupply.populate('ownerOrgId');

    return {
      supply: updatedSupply,
      shelter: shelterUpdated
    };
  }
}

module.exports = new ResourceCoordinationService();
