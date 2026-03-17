import mongoose from "mongoose";

export interface ITask {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
}

export type CreateTaskBody = Pick<ITask, "title" | "description">;
export type TaskResponse = Omit<ITask, "_id"> & { id: string };
