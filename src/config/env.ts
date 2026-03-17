import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: number;
  MONGODB_URI: string;
}

function validateEnv(): EnvConfig {
  const PORT = parseInt(process.env.PORT || "3000", 10);
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is required in environment variables");
  }

  return {
    PORT,
    MONGODB_URI,
  };
}

export const env = validateEnv();
