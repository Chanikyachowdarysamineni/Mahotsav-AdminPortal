const mongoose = require('mongoose');
require('dotenv').config();

const Registration = require('../models/Registration');

const clearRegistrations = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n⚠️  WARNING: This will delete ALL registrations from the database!');
    console.log('Counting current registrations...');
    
    const count = await Registration.countDocuments();
    console.log(`📊 Found ${count} registrations in the database`);

    if (count === 0) {
      console.log('✅ No registrations to delete');
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log('\n🗑️  Deleting all registrations...');
    const result = await Registration.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} registrations`);
    
    // Verify deletion
    const remainingCount = await Registration.countDocuments();
    console.log(`📊 Remaining registrations: ${remainingCount}`);

    console.log('\n✅ All registrations have been cleared from the database');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error clearing registrations:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

clearRegistrations();
