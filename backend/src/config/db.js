import mongoose from "mongoose";
import { ENV } from "./env.js";

let cachedConnection = null;
let cachedConnectionPromise = null;

export const connectDB = async () => {
  if (!ENV.MONGO_URL) {
    throw new Error("MONGO_URL is not configured");
  }

  if (cachedConnection || mongoose.connection.readyState === 1) {
    return cachedConnection || mongoose.connection;
  }

  if (cachedConnectionPromise) {
    return cachedConnectionPromise;
  }

  try {
    cachedConnectionPromise = mongoose.connect(ENV.MONGO_URL, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    const conn = await cachedConnectionPromise;
    cachedConnection = conn.connection;
    console.log("MongoDB connected successfully:", conn.connection.host);
    return cachedConnection;
  } catch (error) {
    cachedConnectionPromise = null;
    console.error("Error connecting to MongoDB", error);
    throw error;
  }
};
export default connectDB;
