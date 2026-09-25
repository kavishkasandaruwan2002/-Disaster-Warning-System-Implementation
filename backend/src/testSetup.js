const mongoose = require('mongoose');

const setupTestDB = () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/dewecs_test';
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    } catch (err) {
      console.warn('Local MongoDB connection failed. Unit tests will run with mocked DB layer if needed.');
    }
  }, 10000);

  afterEach(async () => {
    if (mongoose.connection.readyState === 1) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany();
      }
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
};

module.exports = setupTestDB;
