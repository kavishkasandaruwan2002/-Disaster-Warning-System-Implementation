const mongoose = require('mongoose');
const HazardAlert = require('./hazard-warning.model');
const { District, RiverBasin, Citizen, Notification } = require('../../shared/models');

/**
 * Service handling Hazard Warning business logic (UC1)
 */
class HazardWarningService {
  async findWarning(id) {
    const strId = id ? id.toString() : '';
    const query = [];
    if (mongoose.Types.ObjectId.isValid(strId)) {
      query.push({ _id: new mongoose.Types.ObjectId(strId) });
    }
    query.push({ alertId: strId });

    const warning = await HazardAlert.findOne({ $or: query });
    if (!warning) {
      const error = new Error('Hazard alert warning not found');
      error.statusCode = 404;
      throw error;
    }
    return warning;
  }

  async resolveTargetDistricts(targetDistrictIds, targetRiverBasinId) {
    let resolved = [];
    if (Array.isArray(targetDistrictIds)) {
      resolved.push(...targetDistrictIds);
    }
    if (targetRiverBasinId) {
      let basin = null;
      const basinStr = targetRiverBasinId.toString();
      if (mongoose.Types.ObjectId.isValid(basinStr)) {
        basin = await RiverBasin.findById(basinStr);
      }
      if (!basin) {
        basin = await RiverBasin.findOne({ basinId: targetRiverBasinId });
      }
      if (basin && basin.districts) {
        await basin.populate('districts');
        const basinDistIds = basin.districts.map(d => d._id ? d._id.toString() : d.toString());
        resolved.push(...basinDistIds);
      }
    }
    const uniqueStrIds = [...new Set(resolved.map(id => id.toString()))];
    return uniqueStrIds.map(id => new mongoose.Types.ObjectId(id));
  }

  async previewReach({ targetDistrictIds, targetRiverBasinId }) {
    const resolvedDistricts = await this.resolveTargetDistricts(targetDistrictIds, targetRiverBasinId);
    const strIds = resolvedDistricts.map(d => d.toString());
    const estimatedReach = await Citizen.countDocuments({
      $or: [
        { districtId: { $in: resolvedDistricts } },
        { districtId: { $in: strIds } }
      ]
    });
    return { estimatedReach, targetDistrictIds: resolvedDistricts };
  }

  async issueWarning({ hazardType, severityLevel, targetDistrictIds, targetRiverBasinId, message }) {
    if (!hazardType || !severityLevel || !message) {
      const error = new Error('hazardType, severityLevel, and message are required');
      error.statusCode = 400;
      throw error;
    }

    const resolvedDistricts = await this.resolveTargetDistricts(targetDistrictIds, targetRiverBasinId);
    if (!resolvedDistricts || resolvedDistricts.length === 0) {
      const error = new Error('At least one target district or river basin must be specified');
      error.statusCode = 400;
      throw error;
    }

    const alertId = `ALERT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    let basinObjId = null;
    if (targetRiverBasinId) {
      const basinStr = targetRiverBasinId.toString();
      if (mongoose.Types.ObjectId.isValid(basinStr)) {
        basinObjId = new mongoose.Types.ObjectId(basinStr);
      } else {
        const b = await RiverBasin.findOne({ basinId: targetRiverBasinId });
        if (b) basinObjId = b._id;
      }
    }

    const newAlert = await HazardAlert.create({
      alertId,
      hazardType,
      severityLevel,
      targetDistrictIds: resolvedDistricts,
      targetRiverBasinId: basinObjId,
      message,
      issuedTime: new Date(),
      status: 'ACTIVE'
    });

    const targetStrIds = resolvedDistricts.map(d => d.toString());
    const citizens = await Citizen.find({
      $or: [
        { districtId: { $in: resolvedDistricts } },
        { districtId: { $in: targetStrIds } }
      ]
    });

    const notificationsToInsert = [];
    let notifiedCount = 0;
    let failedCount = 0;
    let notifIndex = 1;

    for (const citizen of citizens) {
      for (const channel of ['PUSH', 'SMS', 'AUDIBLE']) {
        const deliveryStatus = Math.random() < 0.9 ? 'SENT' : 'FAILED';
        if (deliveryStatus === 'SENT') notifiedCount++;
        else failedCount++;

        notificationsToInsert.push({
          notificationId: `NOTIF-${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${notifIndex++}`,
          hazardAlertId: newAlert._id,
          citizenId: citizen._id,
          channel,
          sentTime: new Date(),
          deliveryStatus
        });
      }
    }

    if (notificationsToInsert.length > 0) {
      await Notification.insertMany(notificationsToInsert);
    }

    const populatedAlert = await this.getWarningById(newAlert._id.toString());

    return {
      alert: populatedAlert,
      alertId: newAlert.alertId,
      notifiedCount,
      failedCount
    };
  }

  async getActiveWarnings(statusFilter) {
    const filter = statusFilter
      ? { status: statusFilter }
      : { status: { $in: ['ACTIVE', 'ESCALATED'] } };

    const warnings = await HazardAlert.find(filter).sort({ issuedTime: -1 });

    for (const warning of warnings) {
      if (warning.targetDistrictIds && warning.targetDistrictIds.length > 0) {
        await warning.populate('targetDistrictIds');
      }
      if (warning.targetRiverBasinId) {
        await warning.populate('targetRiverBasinId');
      }
    }

    return warnings;
  }

  async getWarningById(id) {
    const warning = await this.findWarning(id);

    if (warning.targetDistrictIds && warning.targetDistrictIds.length > 0) {
      await warning.populate('targetDistrictIds');
    }
    if (warning.targetRiverBasinId) {
      await warning.populate('targetRiverBasinId');
    }

    return warning;
  }

  async escalateWarning(id, { newSeverityLevel }) {
    const warning = await this.findWarning(id);

    if (warning.severityLevel === 'Emergency' || warning.status === 'CANCELLED' || warning.status === 'EXPIRED') {
      const error = new Error(`Cannot escalate warning: Already at ${warning.severityLevel} or status is ${warning.status}`);
      error.statusCode = 400;
      throw error;
    }

    warning.status = 'ESCALATED';
    if (newSeverityLevel) {
      warning.severityLevel = newSeverityLevel;
    }
    await warning.save();

    const targetStrIds = (warning.targetDistrictIds || []).map(d => d._id ? d._id.toString() : d.toString());
    const citizens = await Citizen.find({
      $or: [
        { districtId: { $in: warning.targetDistrictIds } },
        { districtId: { $in: targetStrIds } }
      ]
    });
    const notificationsToInsert = [];
    let notifiedCount = 0;
    let failedCount = 0;
    let notifIndex = 1;

    for (const citizen of citizens) {
      for (const channel of ['PUSH', 'SMS', 'AUDIBLE']) {
        const deliveryStatus = Math.random() < 0.9 ? 'SENT' : 'FAILED';
        if (deliveryStatus === 'SENT') notifiedCount++;
        else failedCount++;

        notificationsToInsert.push({
          notificationId: `NOTIF-ESC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${notifIndex++}`,
          hazardAlertId: warning._id,
          citizenId: citizen._id,
          channel,
          sentTime: new Date(),
          deliveryStatus
        });
      }
    }

    if (notificationsToInsert.length > 0) {
      await Notification.insertMany(notificationsToInsert);
    }

    console.log('Notifying District Officer - trigger for UC3');

    const updated = await this.getWarningById(warning._id.toString());
    return {
      alert: updated,
      reNotifiedCount: notifiedCount,
      failedCount
    };
  }

  async cancelWarning(id) {
    const warning = await this.findWarning(id);

    warning.status = 'CANCELLED';
    await warning.save();

    const targetStrIds = (warning.targetDistrictIds || []).map(d => d._id ? d._id.toString() : d.toString());
    const citizens = await Citizen.find({
      $or: [
        { districtId: { $in: warning.targetDistrictIds } },
        { districtId: { $in: targetStrIds } }
      ]
    });
    const notificationsToInsert = [];
    let notifIndex = 1;

    for (const citizen of citizens) {
      for (const channel of ['PUSH', 'SMS']) {
        notificationsToInsert.push({
          notificationId: `NOTIF-CANCEL-${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${notifIndex++}`,
          hazardAlertId: warning._id,
          citizenId: citizen._id,
          channel,
          sentTime: new Date(),
          deliveryStatus: 'SENT'
        });
      }
    }

    if (notificationsToInsert.length > 0) {
      await Notification.insertMany(notificationsToInsert);
    }

    const updated = await this.getWarningById(warning._id.toString());
    return updated;
  }

  async getNotificationStats(id) {
    const warning = await this.getWarningById(id);

    const notifications = await Notification.find({ hazardAlertId: warning._id });
    for (const n of notifications) {
      if (n.citizenId) await n.populate('citizenId');
    }

    const total = notifications.length;
    const sent = notifications.filter(n => n.deliveryStatus === 'SENT').length;
    const failed = notifications.filter(n => n.deliveryStatus === 'FAILED').length;

    const channelBreakdown = {
      PUSH: { total: 0, sent: 0, failed: 0 },
      SMS: { total: 0, sent: 0, failed: 0 },
      AUDIBLE: { total: 0, sent: 0, failed: 0 }
    };

    notifications.forEach(n => {
      if (channelBreakdown[n.channel]) {
        channelBreakdown[n.channel].total++;
        if (n.deliveryStatus === 'SENT') channelBreakdown[n.channel].sent++;
        else channelBreakdown[n.channel].failed++;
      }
    });

    return {
      alert: warning,
      total,
      sent,
      failed,
      channelBreakdown,
      notifications
    };
  }
}

module.exports = new HazardWarningService();
