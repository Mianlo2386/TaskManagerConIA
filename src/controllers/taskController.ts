import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Task } from "../models/Task.js";
import type { TaskResponse } from "../types/task.js";

type CreateTaskBody = {
  title?: unknown;
  description?: unknown;
};

type ToggleTaskBody = {
  completed?: unknown;
};

function toTaskResponse(task: {
  _id: { toString: () => string };
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
}): TaskResponse {
  return {
    id: task._id.toString(),
    title: task.title,
    description: task.description,
    completed: task.completed,
    createdAt: task.createdAt,
  };
}

function parseTrimmedString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function createTask(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as CreateTaskBody;

    const title = parseTrimmedString(body.title);
    if (!title) {
      res.status(400).json({ message: "El título es obligatorio y no puede estar vacío" });
      return;
    }

    if (title.length > 255) {
      res.status(400).json({ message: "title: longitud máxima 255" });
      return;
    }

    const descriptionRaw = body.description;
    let description: string | undefined;
    if (descriptionRaw !== undefined) {
      const trimmed = parseTrimmedString(descriptionRaw);
      if (trimmed === null) {
        // Permitimos descripción vacía tratándola como ausente.
        description = undefined;
      } else if (trimmed.length > 2000) {
        res.status(400).json({ message: "description: longitud máxima 2000" });
        return;
      } else {
        description = trimmed;
      }
    }

    const created = await Task.create({
      title,
      description,
      completed: false,
    });

    res.status(201).json(toTaskResponse(created));
  } catch (_error) {
    // No filtramos detalles internos al cliente.
    console.error("createTask error:", _error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function listTasks(_req: Request, res: Response): Promise<void> {
  try {
    const tasks = await Task.find()
      .sort({ createdAt: -1 })
      .exec();

    res.status(200).json(tasks.map((t) => toTaskResponse(t)));
  } catch (_error) {
    console.error("listTasks error:", _error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function toggleTask(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid task id" });
      return;
    }

    const body = req.body as ToggleTaskBody;
    const completedRaw = body.completed;

    if (completedRaw !== undefined && typeof completedRaw !== "boolean") {
      res.status(400).json({ message: "completed must be a boolean" });
      return;
    }

    const task = await Task.findById(id).exec();
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    const nextCompleted =
      typeof completedRaw === "boolean" ? completedRaw : !task.completed;

    task.completed = nextCompleted;
    await task.save();

    res.status(200).json(toTaskResponse(task));
  } catch (_error) {
    console.error("toggleTask error:", _error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteTask(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid task id" });
      return;
    }

    const deleted = await Task.findByIdAndDelete(id).exec();
    if (!deleted) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    res.status(204).send();
  } catch (_error) {
    console.error("deleteTask error:", _error);
    res.status(500).json({ message: "Internal server error" });
  }
}

