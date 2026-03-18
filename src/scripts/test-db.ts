import mongoose from "mongoose";
import { env } from "../config/env.js";
import { connectDB } from "../config/db.js";

async function main(): Promise<void> {
  try {
    await connectDB();

    const admin = mongoose.connection.db?.admin();

    if (!admin) {
      throw new Error("MongoDB admin interface is not available after connection");
    }

    await admin.ping();

    console.log("✅ Successfully connected to MongoDB and pinged the database.");
    process.exit(0);
  } catch (error) {
    console.error(
      "❌ MongoDB connectivity test failed:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

void main();

