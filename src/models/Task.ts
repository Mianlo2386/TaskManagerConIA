import mongoose, { Schema, Model } from "mongoose";
import { ITask } from "../types/task.js";

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      validate: {
        validator: function (value: string): boolean {
          return typeof value === "string" && value.trim().length > 0;
        },
        message: "Title cannot be empty or contain only whitespace",
      },
    },
    description: {
      type: String,
      default: undefined,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

taskSchema.index({ createdAt: -1 });

export const Task: Model<ITask> = mongoose.model<ITask>("Task", taskSchema);
