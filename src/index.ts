import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";

const app = express();

app.use(helmet());
app.use(express.json({ limit: "10kb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

async function start() {
  await connectDB();
  
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

start();
