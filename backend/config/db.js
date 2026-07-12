const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`\n💚 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}\n`);
  } catch (error) {
    console.error(`\n❌ MongoDB Connection Error: ${error.message}`);
    console.error(`
========================================================================
⚠️  ATTENTION: CONNECTION FAILED!
========================================================================
It looks like the server could not connect to MongoDB. 
Since you created a project in MongoDB Atlas, please make sure you have:

1. Updated the 'MONGODB_URI' key in your 'backend/.env' file with your connection string.
   Example:
   MONGODB_URI=mongodb+srv://yourUsername:yourPassword@cluster0.xxxx.mongodb.net/assetflow?retryWrites=true&w=majority

2. Whitelisted your IP address in the MongoDB Atlas console (under Network Access -> Add IP Address -> Allow Access From Anywhere).

3. Re-run 'npm run dev' after saving the changes.
========================================================================
`);
    process.exit(1);
  }
};

module.exports = connectDB;
