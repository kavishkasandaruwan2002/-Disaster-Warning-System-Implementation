const ResourceCoordination = require('./resource-coordination.model');

/**
 * Resource Coordination Service - Business Logic for Coordinate Emergency Resources
 */
class ResourceCoordinationService {
  /**
   * Register a new emergency resource
   */
  async addResource(data) {
    const resource = new ResourceCoordination(data);
    return await resource.save();
  }

  /**
   * Get all emergency resources
   */
  async getAllResources() {
    return await ResourceCoordination.find().sort({ createdAt: -1 });
  }

  /**
   * Dispatch resource to emergency site
   * TODO: Main Flow - Allocate available resource to emergency incident site.
   * TODO: Exception Flow - Throw error if resource is already in use or unavailable.
   */
  async dispatchResource(id, locationData) {
    return await ResourceCoordination.findByIdAndUpdate(
      id,
      { status: 'DISPATCHED', assignedLocation: locationData },
      { new: true }
    );
  }
}

module.exports = new ResourceCoordinationService();
