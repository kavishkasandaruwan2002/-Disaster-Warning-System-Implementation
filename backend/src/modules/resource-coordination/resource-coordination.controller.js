const resourceService = require('./resource-coordination.service');
const apiResponse = require('../../shared/utils/apiResponse');

const addResource = async (req, res, next) => {
  try {
    const resource = await resourceService.addResource(req.body);
    return apiResponse.success(res, 'Resource added successfully', resource, 201);
  } catch (error) {
    next(error);
  }
};

const getResources = async (req, res, next) => {
  try {
    const resources = await resourceService.getAllResources();
    return apiResponse.success(res, 'Resources retrieved successfully', resources);
  } catch (error) {
    next(error);
  }
};

const dispatchResource = async (req, res, next) => {
  try {
    // TODO: Main Flow - Dispatch emergency resource to location
    const resource = await resourceService.dispatchResource(req.params.id, req.body.assignedLocation);
    if (!resource) {
      return apiResponse.error(res, 'Resource not found', 404);
    }
    return apiResponse.success(res, 'Resource dispatched successfully', resource);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addResource,
  getResources,
  dispatchResource
};
