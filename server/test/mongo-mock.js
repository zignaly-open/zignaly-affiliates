import mongoose from 'mongoose';
import MongoMemory from 'mongodb-memory-server';

const mongo = new MongoMemory.MongoMemoryServer();

export const connect = async () => {
  const uri = await mongo.getConnectionString();

  const mongooseOptions = {
    useNewUrlParser: true,
    autoReconnect: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
  };

  await mongoose.connect(uri, mongooseOptions);
};

/**
 * Drop database, close the connection and stop mongo.
 */
export const closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongo.stop();
};

/**
 * Remove all the data for all db collections.
 */
export const clearDatabase = async () => {
  const { collections } = mongoose.connection;

  for (const key of Object.keys(collections)) {
    const collection = collections[key];
    // eslint-disable-next-line no-await-in-loop
    await collection.deleteMany();
  }
};
