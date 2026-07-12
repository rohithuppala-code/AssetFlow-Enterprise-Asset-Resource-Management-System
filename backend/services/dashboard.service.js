const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const Booking = require('../models/Booking');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const TransferRequest = require('../models/TransferRequest');
const {
  ASSET_STATUS,
  ALLOCATION_STATUS,
  BOOKING_STATUS,
  MAINTENANCE_STATUS,
  TRANSFER_STATUS,
} = require('../config/constants');

/**
 * Dashboard KPI stats scoped by role.
 */
const getDashboardStats = async (user) => {
  const baseAssetFilter = {};
  const baseAllocationFilter = {};

  // Scope by role
  if (user.role === 'Employee') {
    baseAllocationFilter.allocatedTo = user._id;
  }

  const [
    assetsAvailable,
    assetsAllocated,
    maintenanceToday,
    activeBookings,
    pendingTransfers,
    upcomingReturns,
    overdueReturns,
  ] = await Promise.all([
    Asset.countDocuments({ ...baseAssetFilter, status: ASSET_STATUS.AVAILABLE }),
    Asset.countDocuments({ ...baseAssetFilter, status: ASSET_STATUS.ALLOCATED }),
    MaintenanceRequest.countDocuments({
      status: { $in: [MAINTENANCE_STATUS.PENDING, MAINTENANCE_STATUS.APPROVED, MAINTENANCE_STATUS.IN_PROGRESS] },
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    }),
    Booking.countDocuments({
      status: { $in: [BOOKING_STATUS.UPCOMING, BOOKING_STATUS.ONGOING] },
    }),
    TransferRequest.countDocuments({ status: TRANSFER_STATUS.REQUESTED }),
    Allocation.countDocuments({
      ...baseAllocationFilter,
      status: ALLOCATION_STATUS.ACTIVE,
      expectedReturnDate: { $ne: null, $gte: new Date() },
    }),
    Allocation.countDocuments({
      ...baseAllocationFilter,
      status: ALLOCATION_STATUS.ACTIVE,
      expectedReturnDate: { $ne: null, $lt: new Date() },
    }),
  ]);

  const trendData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const start = new Date(d.setHours(0, 0, 0, 0));
    const end = new Date(d.setHours(23, 59, 59, 999));

    const allocationsCount = await Allocation.countDocuments({
      ...baseAllocationFilter,
      createdAt: { $gte: start, $lte: end },
    });
    const bookingsCount = await Booking.countDocuments({
      createdAt: { $gte: start, $lte: end },
    });

    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    trendData.push({
      name: dayName,
      allocations: allocationsCount,
      bookings: bookingsCount,
    });
  }

  return {
    assetsAvailable,
    assetsAllocated,
    maintenanceToday,
    activeBookings,
    pendingTransfers,
    upcomingReturns,
    overdueReturns,
    trendData,
  };
};

module.exports = {
  getDashboardStats,
};
