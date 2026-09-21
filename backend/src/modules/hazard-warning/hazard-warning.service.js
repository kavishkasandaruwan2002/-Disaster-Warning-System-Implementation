const HazardWarning = require('./hazard-warning.model');

/**
 * Hazard Warning Service - Business Logic for Issue Location-Specific Hazard Warning
 */
class HazardWarningService {
  /**
   * Issue a location-specific hazard warning
   * TODO: Main Flow - Create warning and broadcast notification to targeted region.
   */
  async issueWarning(data) {
    const warning = new HazardWarning(data);
    return await warning.save();
  }

  /**
   * Get active hazard warnings
   */
  async getActiveWarnings() {
    return await HazardWarning.find({ active: true }).sort({ createdAt: -1 });
  }

  /**
   * Deactivate warning
   * TODO: Alternate Flow - Revoke active warning when hazard subsides.
   */
  async revokeWarning(id) {
    return await HazardWarning.findByIdAndUpdate(id, { active: false }, { new: true });
  }
}

module.exports = new HazardWarningService();
