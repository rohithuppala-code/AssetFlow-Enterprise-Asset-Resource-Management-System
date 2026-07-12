const Counter = require('../models/Counter');

/**
 * Generate the next auto-incremented asset tag.
 * Uses atomic findOneAndUpdate with upsert for concurrency safety.
 *
 * Format: AF-0001, AF-0002, ...
 *
 * @returns {Promise<string>} The generated asset tag
 */
const generateAssetTag = async () => {
  const counter = await Counter.findByIdAndUpdate(
    'assetTag',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return `AF-${String(counter.seq).padStart(4, '0')}`;
};

module.exports = generateAssetTag;
