import mongoose from "mongoose";

const globalForMongoose = globalThis as unknown as {
  mongoosePromise?: Promise<typeof mongoose> | null;
};

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) return mongoose;

  if (!globalForMongoose.mongoosePromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("Missing environment variable MONGODB_URI");
    }

    globalForMongoose.mongoosePromise = mongoose.connect(uri);
  }

  return globalForMongoose.mongoosePromise;
}

