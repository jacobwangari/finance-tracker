// dropIndex.js — run once with `node dropIndex.js`, then delete this file
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await mongoose.connection.db.collection('users').dropIndex('username_1');
  console.log('Index dropped');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});