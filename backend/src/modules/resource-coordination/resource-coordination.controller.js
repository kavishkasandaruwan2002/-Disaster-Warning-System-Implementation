const resourceCoordinationService = require('./resource-coordination.service');
const apiResponse = require('../../shared/utils/apiResponse');

exports.getResourceDashboard = async (req, res, next) => {
  try {
    const dashboard = await resourceCoordinationService.getResourceDashboard(req.params.districtId);
    return apiResponse.success(res, 'Resource dashboard aggregated successfully', dashboard);
  } catch (error) {
    next(error);
  }
};

exports.registerShelter = async (req, res, next) => {
  try {
    const shelter = await resourceCoordinationService.registerShelter(req.body);
    return apiResponse.success(res, 'Shelter registered successfully', shelter, 201);
  } catch (error) {
    next(error);
  }
};

exports.updateShelterOccupancy = async (req, res, next) => {
  try {
    const { newOccupancy } = req.body;
    const shelter = await resourceCoordinationService.updateShelterOccupancy(req.params.id, newOccupancy);
    return apiResponse.success(res, 'Shelter occupancy updated', shelter);
  } catch (error) {
    next(error);
  }
};

exports.getRescueTeams = async (req, res, next) => {
  try {
    const { district, status } = req.query;
    const teams = await resourceCoordinationService.getRescueTeams(district, status);
    return apiResponse.success(res, 'Rescue teams retrieved successfully', teams);
  } catch (error) {
    next(error);
  }
};

exports.dispatchRescueTeam = async (req, res, next) => {
  try {
    const team = await resourceCoordinationService.dispatchRescueTeam(req.params.id, req.body);
    return apiResponse.success(res, 'Rescue team dispatched successfully', team);
  } catch (error) {
    next(error);
  }
};

exports.returnRescueTeam = async (req, res, next) => {
  try {
    const team = await resourceCoordinationService.returnRescueTeam(req.params.id);
    return apiResponse.success(res, 'Rescue team status updated', team);
  } catch (error) {
    next(error);
  }
};

exports.distributeReliefSupply = async (req, res, next) => {
  try {
    const result = await resourceCoordinationService.distributeReliefSupply(req.body);
    return apiResponse.success(res, 'Relief supply distribution logged successfully', result);
  } catch (error) {
    next(error);
  }
};
