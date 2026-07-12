// ──────────────────────────────────────────────
// All enums and magic strings live here.
// Import from this file — never use string literals
// for statuses, roles, or action types in code.
// ──────────────────────────────────────────────

const ROLES = {
  ADMIN: 'Admin',
  ASSET_MANAGER: 'AssetManager',
  DEPARTMENT_HEAD: 'DepartmentHead',
  EMPLOYEE: 'Employee',
};

const ROLES_ARRAY = Object.values(ROLES);

const USER_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

const USER_STATUS_ARRAY = Object.values(USER_STATUS);

const DEPARTMENT_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

const DEPARTMENT_STATUS_ARRAY = Object.values(DEPARTMENT_STATUS);

const ASSET_STATUS = {
  AVAILABLE: 'Available',
  ALLOCATED: 'Allocated',
  RESERVED: 'Reserved',
  UNDER_MAINTENANCE: 'UnderMaintenance',
  LOST: 'Lost',
  RETIRED: 'Retired',
  DISPOSED: 'Disposed',
};

const ASSET_STATUS_ARRAY = Object.values(ASSET_STATUS);

const ASSET_CONDITION = {
  NEW: 'New',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor',
  DAMAGED: 'Damaged',
};

const ASSET_CONDITION_ARRAY = Object.values(ASSET_CONDITION);

const ALLOCATION_STATUS = {
  ACTIVE: 'Active',
  RETURNED: 'Returned',
  OVERDUE: 'Overdue',
  TRANSFERRED: 'Transferred',
};

const ALLOCATION_STATUS_ARRAY = Object.values(ALLOCATION_STATUS);

const TRANSFER_STATUS = {
  REQUESTED: 'Requested',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  COMPLETED: 'Completed',
};

const TRANSFER_STATUS_ARRAY = Object.values(TRANSFER_STATUS);

const BOOKING_STATUS = {
  UPCOMING: 'Upcoming',
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const BOOKING_STATUS_ARRAY = Object.values(BOOKING_STATUS);

const MAINTENANCE_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  TECHNICIAN_ASSIGNED: 'TechnicianAssigned',
  IN_PROGRESS: 'InProgress',
  RESOLVED: 'Resolved',
};

const MAINTENANCE_STATUS_ARRAY = Object.values(MAINTENANCE_STATUS);

const MAINTENANCE_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

const MAINTENANCE_PRIORITY_ARRAY = Object.values(MAINTENANCE_PRIORITY);

const AUDIT_STATUS = {
  OPEN: 'Open',
  IN_PROGRESS: 'InProgress',
  CLOSED: 'Closed',
};

const AUDIT_STATUS_ARRAY = Object.values(AUDIT_STATUS);

const AUDIT_RESULT = {
  VERIFIED: 'Verified',
  MISSING: 'Missing',
  DAMAGED: 'Damaged',
};

const AUDIT_RESULT_ARRAY = Object.values(AUDIT_RESULT);

const AUDIT_SCOPE_TYPE = {
  DEPARTMENT: 'Department',
  LOCATION: 'Location',
};

const AUDIT_SCOPE_TYPE_ARRAY = Object.values(AUDIT_SCOPE_TYPE);

const NOTIFICATION_TYPES = {
  ASSET_ASSIGNED: 'AssetAssigned',
  MAINTENANCE_APPROVED: 'MaintenanceApproved',
  MAINTENANCE_REJECTED: 'MaintenanceRejected',
  BOOKING_CONFIRMED: 'BookingConfirmed',
  BOOKING_CANCELLED: 'BookingCancelled',
  BOOKING_REMINDER: 'BookingReminder',
  TRANSFER_APPROVED: 'TransferApproved',
  TRANSFER_REJECTED: 'TransferRejected',
  OVERDUE_RETURN_ALERT: 'OverdueReturnAlert',
  AUDIT_DISCREPANCY: 'AuditDiscrepancy',
  ROLE_CHANGED: 'RoleChanged',
  GENERAL: 'General',
};

const NOTIFICATION_TYPES_ARRAY = Object.values(NOTIFICATION_TYPES);

const CUSTOM_FIELD_TYPES = ['String', 'Number', 'Date', 'Boolean'];

// Activity log action names
const ACTIONS = {
  // Auth
  USER_REGISTERED: 'USER_REGISTERED',
  USER_LOGGED_IN: 'USER_LOGGED_IN',

  // User management
  USER_UPDATED: 'USER_UPDATED',
  ROLE_CHANGED: 'ROLE_CHANGED',

  // Departments
  DEPARTMENT_CREATED: 'DEPARTMENT_CREATED',
  DEPARTMENT_UPDATED: 'DEPARTMENT_UPDATED',
  DEPARTMENT_DEACTIVATED: 'DEPARTMENT_DEACTIVATED',

  // Asset Categories
  CATEGORY_CREATED: 'CATEGORY_CREATED',
  CATEGORY_UPDATED: 'CATEGORY_UPDATED',

  // Assets
  ASSET_CREATED: 'ASSET_CREATED',
  ASSET_UPDATED: 'ASSET_UPDATED',
  ASSET_STATUS_CHANGED: 'ASSET_STATUS_CHANGED',

  // Allocations
  ALLOCATION_MADE: 'ALLOCATION_MADE',
  ASSET_RETURNED: 'ASSET_RETURNED',

  // Transfers
  TRANSFER_REQUESTED: 'TRANSFER_REQUESTED',
  TRANSFER_APPROVED: 'TRANSFER_APPROVED',
  TRANSFER_REJECTED: 'TRANSFER_REJECTED',
  TRANSFER_COMPLETED: 'TRANSFER_COMPLETED',

  // Bookings
  BOOKING_CREATED: 'BOOKING_CREATED',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',
  BOOKING_RESCHEDULED: 'BOOKING_RESCHEDULED',

  // Maintenance
  MAINTENANCE_REQUESTED: 'MAINTENANCE_REQUESTED',
  MAINTENANCE_APPROVED: 'MAINTENANCE_APPROVED',
  MAINTENANCE_REJECTED: 'MAINTENANCE_REJECTED',
  MAINTENANCE_TECHNICIAN_ASSIGNED: 'MAINTENANCE_TECHNICIAN_ASSIGNED',
  MAINTENANCE_STARTED: 'MAINTENANCE_STARTED',
  MAINTENANCE_RESOLVED: 'MAINTENANCE_RESOLVED',

  // Audits
  AUDIT_CREATED: 'AUDIT_CREATED',
  AUDIT_ENTRY_SUBMITTED: 'AUDIT_ENTRY_SUBMITTED',
  AUDIT_CLOSED: 'AUDIT_CLOSED',
};

module.exports = {
  ROLES,
  ROLES_ARRAY,
  USER_STATUS,
  USER_STATUS_ARRAY,
  DEPARTMENT_STATUS,
  DEPARTMENT_STATUS_ARRAY,
  ASSET_STATUS,
  ASSET_STATUS_ARRAY,
  ASSET_CONDITION,
  ASSET_CONDITION_ARRAY,
  ALLOCATION_STATUS,
  ALLOCATION_STATUS_ARRAY,
  TRANSFER_STATUS,
  TRANSFER_STATUS_ARRAY,
  BOOKING_STATUS,
  BOOKING_STATUS_ARRAY,
  MAINTENANCE_STATUS,
  MAINTENANCE_STATUS_ARRAY,
  MAINTENANCE_PRIORITY,
  MAINTENANCE_PRIORITY_ARRAY,
  AUDIT_STATUS,
  AUDIT_STATUS_ARRAY,
  AUDIT_RESULT,
  AUDIT_RESULT_ARRAY,
  AUDIT_SCOPE_TYPE,
  AUDIT_SCOPE_TYPE_ARRAY,
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPES_ARRAY,
  CUSTOM_FIELD_TYPES,
  ACTIONS,
};
