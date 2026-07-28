// clear-db.js — wipes ALL data in your MongoDB database. Run with `node clear-db.js`
// Delete this file (or at least don't leave it lying around) once you're done —
// you do not want this accidentally runnable in production later.

require('dotenv').config();
const mongoose = require('mongoose');

async function clearDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to: ${mongoose.connection.name}`);

    const collections = await mongoose.connection.db.collections();

    if (collections.length === 0) {
      console.log('Database is already empty.');
    } else {
      for (const collection of collections) {
        await collection.drop();
        console.log(`Dropped collection: ${collection.collectionName}`);
      }
    }

    console.log('✅ Database cleared. Starting fresh.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error clearing database:', err.message);
    process.exit(1);
  }
}

clearDatabase();