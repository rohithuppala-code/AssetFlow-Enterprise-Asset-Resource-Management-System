const express = require('express');
const router = express.Router();

const auditController = require('../controllers/audit.controller');
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const auditValidator = require('../validators/audit.validator');
const { ROLES } = require('../config/constants');

router.use(auth);

// GET /api/v1/audits — Admin, AssetManager (auditors also see their own)
router.get('/', auditController.getCycles);

// GET /api/v1/audits/:id
router.get('/:id', auditController.getCycleById);

// POST /api/v1/audits — Admin only
router.post(
  '/',
  authorize(ROLES.ADMIN),
  validate(auditValidator.createAudit),
  auditController.createCycle
);

// POST /api/v1/audits/:id/entries — Assigned auditors
router.post(
  '/:id/entries',
  validate(auditValidator.createAuditEntry),
  auditController.createEntry
);

// GET /api/v1/audits/:id/entries
router.get('/:id/entries', auditController.getEntries);

// POST /api/v1/audits/:id/close — Admin only
router.post(
  '/:id/close',
  authorize(ROLES.ADMIN),
  auditController.closeCycle
);

// GET /api/v1/audits/:id/discrepancy-report — Admin, AssetManager
router.get(
  '/:id/discrepancy-report',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  auditController.getDiscrepancyReport
);

module.exports = router;
