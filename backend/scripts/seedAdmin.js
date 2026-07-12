/**
 * Admin seeding script.
 *
 * Run once during initial deployment:
 *   npm run seed:admin
 *
 * Creates the first Admin account using env variables.
 * Skips if an Admin already exists.
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const { ROLES } = require('../config/constants');
const env = require('../config/env');
const connectDB = require('../config/db');

const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: ROLES.ADMIN });
    if (existingAdmin) {
      console.log(`Admin already exists: ${existingAdmin.email}`);
      process.exit(0);
    }

    if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
      console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
      process.exit(1);
    }

    const admin = await User.create({
      name: 'System Admin',
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD,
      role: ROLES.ADMIN,
    });

    console.log(`\n✅ Admin account created successfully!`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role:  ${admin.role}\n`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
