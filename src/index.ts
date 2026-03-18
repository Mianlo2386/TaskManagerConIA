import express from "express";
import helmet from "helmet"; // Volvemos al import por defecto
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";

const app = express();

// Usamos 'as any' para saltar la restricción de tipos de NodeNext en CJS
app.use((helmet as any)()); 
app.use(express.json({ limit: "10kb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

async function start() {
  // Aplicamos Fail-fast: si la DB no conecta, la app no arranca
  await connectDB();
  
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

start();