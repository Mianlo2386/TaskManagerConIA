import { Router } from "express";
import {
  createTask,
  deleteTask,
  listTasks,
  toggleTask,
} from "../controllers/taskController.js";

const router = Router();

// Lista y creación
router.get("/", listTasks);
router.post("/", createTask);

// Toggle completada
router.patch("/:id", toggleTask);

// Eliminación permanente
router.delete("/:id", deleteTask);

export default router;

