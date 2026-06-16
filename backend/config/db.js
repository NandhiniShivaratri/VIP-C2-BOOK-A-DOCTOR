const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const seedDatabase = require('./seed');

let mongod = null;

const connectDB = async () => {
  try {
    const dbUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medconnect';
    console.log(`Connecting to MongoDB: ${dbUri}`);
    
    // Connect with a 3 seconds timeout to fail fast if MongoDB is down
    const conn = await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`MongoDB Connected successfully to host: ${conn.connection.host}`);
    
    // Seed database
    await seedDatabase();
  } catch (error) {
    console.log('Local MongoDB connection failed (ECONNREFUSED).');
    console.log('Spinning up an in-memory MongoDB database server fallback (with 5-minute download timeout)...');
    try {
      // Create memory server instance with extended launch and spawn timeouts
      mongod = await MongoMemoryServer.create({
        instance: {
          dbName: 'medconnect',
        },
        spawnTimeoutMS: 300000, // 5 minutes timeout to download binaries
      });
      const memoryUri = mongod.getUri();
      console.log(`In-memory MongoDB Server launched at: ${memoryUri}`);
      
      const conn = await mongoose.connect(memoryUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`MongoDB connected successfully to temporary in-memory database.`);
      
      // Seed database
      await seedDatabase();
    } catch (memError) {
      console.error('Failed to launch in-memory MongoDB database server:', memError.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;

