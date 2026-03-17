import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to database");
    process.exit(1);
  }
}
