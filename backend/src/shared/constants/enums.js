const HazardSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

const ReportStatus = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED'
};

const WarningLevel = {
  ADVISORY: 'ADVISORY',
  WATCH: 'WATCH',
  WARNING: 'WARNING',
  EVACUATE: 'EVACUATE'
};

const ResourceStatus = {
  AVAILABLE: 'AVAILABLE',
  DISPATCHED: 'DISPATCHED',
  IN_USE: 'IN_USE',
  MAINTENANCE: 'MAINTENANCE'
};

module.exports = {
  HazardSeverity,
  ReportStatus,
  WarningLevel,
  ResourceStatus
};
