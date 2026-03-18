import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";

const app = express();

// Configuración de seguridad y middleware
app.use((helmet as any)()); 
app.use(express.json({ limit: "10kb" }));

// [NUEVA] Ruta de bienvenida en la raíz
app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Bienvenido a la API del Task Manager v2026",
    status: "online",
    documentation: "/health",
    author: "Arquitecto de Orquestación"
  });
});

// Ruta de validación de salud
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

async function start() {
  // Principio Fail-fast: Validamos conexión antes de levantar el servicio
  await connectDB();
  
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

start();