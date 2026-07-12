const AuditCycle = require('../models/AuditCycle');
const AuditEntry = require('../models/AuditEntry');
const Asset = require('../models/Asset');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { buildPagination } = require('../utils/pagination');
const {
  AUDIT_STATUS,
  AUDIT_RESULT,
  ASSET_STATUS,
  NOTIFICATION_TYPES,
  ACTIONS,
} = require('../config/constants');
const notificationService = require('./notification.service');
const activityLogService = require('./activityLog.service');

/**
 * Create an audit cycle.
 */
const createAuditCycle = async (data, createdBy) => {
  // Validate auditors exist and are active
  for (const auditorId of data.auditors) {
    const auditor = await User.findById(auditorId);
    if (!auditor) {
      throw new ApiError(404, `Auditor with ID ${auditorId} not found`);
    }
    if (auditor.status !== 'Active') {
      throw new ApiError(400, `Auditor ${auditor.name} is not active`);
    }
  }

  const cycle = await AuditCycle.create({
    ...data,
    createdBy,
  });

  await activityLogService.log({
    user: createdBy,
    action: ACTIONS.AUDIT_CREATED,
    entityType: 'AuditCycle',
    entityId: cycle._id,
    description: `Created audit cycle: ${cycle.name}`,
  });

  return cycle;
};

/**
 * List audit cycles.
 */
const getAuditCycles = async (query) => {
  const filter = {};
  if (query.status) filter.status = query.status;

  const totalDocs = await AuditCycle.countDocuments(filter);
  const { page, limit, skip, pagination } = buildPagination(query, totalDocs);

  const cycles = await AuditCycle.find(filter)
    .populate('auditors', 'name email')
    .populate('createdBy', 'name email')
    .populate('closedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return { cycles, pagination };
};

/**
 * Get a single audit cycle with entries summary.
 */
const getAuditCycleById = async (id) => {
  const cycle = await AuditCycle.findById(id)
    .populate('auditors', 'name email')
    .populate('createdBy', 'name email')
    .populate('closedBy', 'name email');

  if (!cycle) {
    throw new ApiError(404, 'Audit cycle not found');
  }

  // Get entries summary
  const entries = await AuditEntry.find({ auditCycle: id });
  const summary = {
    total: entries.length,
    verified: entries.filter((e) => e.result === AUDIT_RESULT.VERIFIED).length,
    missing: entries.filter((e) => e.result === AUDIT_RESULT.MISSING).length,
    damaged: entries.filter((e) => e.result === AUDIT_RESULT.DAMAGED).length,
  };

  return { cycle, summary };
};

/**
 * Submit an audit entry.
 */
const createAuditEntry = async (cycleId, data, auditorId) => {
  const cycle = await AuditCycle.findById(cycleId);
  if (!cycle) {
    throw new ApiError(404, 'Audit cycle not found');
  }

  if (![AUDIT_STATUS.OPEN, AUDIT_STATUS.IN_PROGRESS].includes(cycle.status)) {
    throw new ApiError(400, `Cannot submit entries to a ${cycle.status} audit cycle.`);
  }

  // Check auditor is assigned
  const isAssigned = cycle.auditors.some((a) => a.toString() === auditorId.toString());
  if (!isAssigned) {
    throw new ApiError(403, 'You are not assigned as an auditor for this cycle.');
  }

  // Validate asset exists
  const asset = await Asset.findById(data.asset);
  if (!asset) {
    throw new ApiError(404, 'Asset not found');
  }

  // Create entry (unique compound index will prevent duplicates)
  let entry;
  try {
    entry = await AuditEntry.create({
      auditCycle: cycleId,
      asset: data.asset,
      auditor: auditorId,
      result: data.result,
      notes: data.notes || '',
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, 'This asset already has an entry in this audit cycle.');
    }
    throw error;
  }

  // If first entry, move cycle to InProgress
  if (cycle.status === AUDIT_STATUS.OPEN) {
    cycle.status = AUDIT_STATUS.IN_PROGRESS;
    await cycle.save();
  }

  await activityLogService.log({
    user: auditorId,
    action: ACTIONS.AUDIT_ENTRY_SUBMITTED,
    entityType: 'AuditEntry',
    entityId: entry._id,
    description: `Audit entry: ${asset.assetTag} marked as ${data.result}`,
  });

  return entry;
};

/**
 * Get all entries for an audit cycle.
 */
const getAuditEntries = async (cycleId) => {
  const entries = await AuditEntry.find({ auditCycle: cycleId })
    .populate('asset', 'name assetTag status location')
    .populate('auditor', 'name email')
    .sort({ createdAt: -1 });

  return entries;
};

/**
 * Close an audit cycle.
 * Locks cycle, updates asset statuses for missing items, generates discrepancy data.
 */
const closeAuditCycle = async (cycleId, closedBy) => {
  const cycle = await AuditCycle.findById(cycleId);
  if (!cycle) {
    throw new ApiError(404, 'Audit cycle not found');
  }

  if (![AUDIT_STATUS.OPEN, AUDIT_STATUS.IN_PROGRESS].includes(cycle.status)) {
    throw new ApiError(400, `Cannot close a ${cycle.status} audit cycle.`);
  }

  // Get all entries
  const entries = await AuditEntry.find({ auditCycle: cycleId }).populate('asset');

  // Update asset statuses for missing items
  const missingEntries = entries.filter((e) => e.result === AUDIT_RESULT.MISSING);
  for (const entry of missingEntries) {
    if (entry.asset) {
      entry.asset.status = ASSET_STATUS.LOST;
      await entry.asset.save();
    }
  }

  // Close the cycle
  cycle.status = AUDIT_STATUS.CLOSED;
  cycle.closedBy = closedBy;
  cycle.closedAt = new Date();
  await cycle.save();

  // Send notifications for discrepancies
  const discrepancies = entries.filter((e) => e.result !== AUDIT_RESULT.VERIFIED);
  for (const entry of discrepancies) {
    // Notify cycle creator about discrepancies
    await notificationService.createNotification({
      recipient: cycle.createdBy,
      type: NOTIFICATION_TYPES.AUDIT_DISCREPANCY,
      title: 'Audit Discrepancy',
      message: `Asset ${entry.asset ? entry.asset.assetTag : 'unknown'} marked as ${entry.result} in audit "${cycle.name}".`,
      relatedEntity: { entityType: 'AuditEntry', entityId: entry._id },
    });
  }

  await activityLogService.log({
    user: closedBy,
    action: ACTIONS.AUDIT_CLOSED,
    entityType: 'AuditCycle',
    entityId: cycle._id,
    description: `Audit cycle "${cycle.name}" closed. ${missingEntries.length} missing, ${discrepancies.length} total discrepancies.`,
  });

  return cycle;
};

/**
 * Get discrepancy report — entries where result ≠ Verified.
 */
const getDiscrepancyReport = async (cycleId) => {
  const cycle = await AuditCycle.findById(cycleId);
  if (!cycle) {
    throw new ApiError(404, 'Audit cycle not found');
  }

  const discrepancies = await AuditEntry.find({
    auditCycle: cycleId,
    result: { $ne: AUDIT_RESULT.VERIFIED },
  })
    .populate('asset', 'name assetTag status location department category')
    .populate('auditor', 'name email')
    .sort({ result: 1, createdAt: -1 });

  return {
    cycleName: cycle.name,
    cycleStatus: cycle.status,
    totalDiscrepancies: discrepancies.length,
    missing: discrepancies.filter((d) => d.result === AUDIT_RESULT.MISSING).length,
    damaged: discrepancies.filter((d) => d.result === AUDIT_RESULT.DAMAGED).length,
    entries: discrepancies,
  };
};

module.exports = {
  createAuditCycle,
  getAuditCycles,
  getAuditCycleById,
  createAuditEntry,
  getAuditEntries,
  closeAuditCycle,
  getDiscrepancyReport,
};
