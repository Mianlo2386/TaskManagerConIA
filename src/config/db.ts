import mongoose from "mongoose";
import { env } from "./env.js";

let isConnected = false;

async function createConnectionWithRetry(
  uri: string,
  maxRetries = 3,
  delayMs = 1000,
): Promise<void> {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log("Connected to MongoDB");
      isConnected = true;
      return;
    } catch (error) {
      attempt += 1;
      console.error(
        `MongoDB connection attempt ${attempt} failed:`,
        error instanceof Error ? error.message : error,
      );

      if (attempt >= maxRetries) {
        console.error("Exceeded maximum MongoDB connection retries. Exiting.");
        process.exit(1);
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

export async function connectDB(): Promise<void> {
  if (isConnected) {
    return;
  }

  await createConnectionWithRetry(env.MONGODB_URI);
}

async function disconnectDB(): Promise<void> {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error(
      "Error while closing MongoDB connection:",
      error instanceof Error ? error.message : error,
    );
  } finally {
    isConnected = false;
  }
}

process.on("SIGINT", async () => {
  await disconnectDB();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await disconnectDB();
  process.exit(0);
});

process.on("beforeExit", async () => {
  await disconnectDB();
});

