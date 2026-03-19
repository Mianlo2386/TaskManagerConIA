import express from "express";
import helmet from "helmet";
import cors from "cors"; // [NUEVO] Importación de CORS
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import taskRoutes from "./routes/taskRoutes.js";

const app = express();

// [NUEVO] Configuración de CORS: Permite que tu frontend local hable con la nube
app.use(cors({
  origin: "http://localhost:5173", // Origen de tu Vite local
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true
}));

// Configuración de seguridad y middleware
app.use((helmet as any)()); 
app.use(express.json({ limit: "10kb" }));

// Ruta de bienvenida en la raíz
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
  await connectDB();
  app.use("/api/tasks", taskRoutes);
  
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

start();