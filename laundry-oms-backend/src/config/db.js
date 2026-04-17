const mongoose = require('mongoose');

/**
 * Connect to MongoDB with retry logic.
 * @returns {Promise<boolean>} true if connected to MongoDB
 * @throws {Error} if connection fails after retries
 */
let useInMemory = false;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/laundry-oms';

  console.log('🔗 Attempting to connect to MongoDB...');
  console.log(`   URI: ${uri.replace(/:[^:]*@/, ':****@')}`); // Mask password

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
        retryWrites: true,
        w: 'majority',
      });

      console.log(`✅ MongoDB connected successfully on attempt ${attempt}`);
      console.log(`   Host: ${mongoose.connection.host}`);
      console.log(`   Database: ${mongoose.connection.name}`);
      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected!');
      });
      return true;
    } catch (error) {
      console.error(
        `❌ Connection attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`
      );
      if (attempt < MAX_RETRIES) {
        console.log(`   Retrying in ${RETRY_DELAY}ms...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }

  // If all retries failed, throw error instead of falling back to in-memory
  const errorMsg = `Failed to connect to MongoDB after ${MAX_RETRIES} attempts. Check your MONGODB_URI in .env file.`;
  console.error(`\n🚨 ${errorMsg}\n`);
  throw new Error(errorMsg);
};

const isInMemory = () => useInMemory;

module.exports = { connectDB, isInMemory };
