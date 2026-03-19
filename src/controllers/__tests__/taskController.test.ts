import { describe, it, expect, vi, beforeEach } from "vitest";
import mongoose from "mongoose";

const mockedTask = {
  create: vi.fn(),
  find: vi.fn(),
  findById: vi.fn(),
  findByIdAndDelete: vi.fn(),
};

type MockResponse = {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
};

function createMockRes(): MockResponse {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };
  return res;
}

// Nota: Mockear Task permite testear validación y mapping sin Mongo real.
vi.mock("../../models/Task.js", () => {
  return {
    Task: mockedTask,
  };
});

let createTask: (req: any, res: any) => Promise<void>;
let listTasks: (req: any, res: any) => Promise<void>;
let toggleTask: (req: any, res: any) => Promise<void>;
let deleteTask: (req: any, res: any) => Promise<void>;

beforeEach(async () => {
  const mod = await import("../taskController.js");
  createTask = mod.createTask;
  listTasks = mod.listTasks;
  toggleTask = mod.toggleTask;
  deleteTask = mod.deleteTask;
});

describe("taskController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createTask: valida title no vacío", async () => {
    const req = { body: { title: "   " } } as any;
    const res = createMockRes();

    await createTask(req, res as any);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "El título es obligatorio y no puede estar vacío",
    });
    expect(mockedTask.create).not.toHaveBeenCalled();
  });

  it("createTask: crea con título válido", async () => {
    const createdDoc = {
      _id: { toString: () => "task_1" },
      title: "My Task",
      description: undefined,
      completed: false,
      createdAt: new Date("2026-01-01T00:00:00Z"),
    };

    mockedTask.create.mockResolvedValue(createdDoc as any);

    const req = {
      body: { title: "  My Task  " },
    } as any;
    const res = createMockRes();

    await createTask(req, res as any);

    expect(mockedTask.create).toHaveBeenCalledWith({
      title: "My Task",
      description: undefined,
      completed: false,
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: "task_1",
      title: "My Task",
      description: undefined,
      completed: false,
      createdAt: createdDoc.createdAt,
    });
  });

  it("listTasks: mapea tareas al formato público", async () => {
    const taskA = {
      _id: { toString: () => "a" },
      title: "A",
      description: "desc",
      completed: false,
      createdAt: new Date("2026-01-02T00:00:00Z"),
    };
    const taskB = {
      _id: { toString: () => "b" },
      title: "B",
      description: undefined,
      completed: true,
      createdAt: new Date("2026-01-01T00:00:00Z"),
    };

    (mockedTask.find as any).mockReturnValue({
      sort: () => ({
        exec: vi.fn().mockResolvedValue([taskA, taskB]),
      }),
    });

    const req = {} as any;
    const res = createMockRes();

    await listTasks(req, res as any);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      {
        id: "a",
        title: "A",
        description: "desc",
        completed: false,
        createdAt: taskA.createdAt,
      },
      {
        id: "b",
        title: "B",
        description: undefined,
        completed: true,
        createdAt: taskB.createdAt,
      },
    ]);
  });

  it("toggleTask: invalida id no ObjectId", async () => {
    const req = { params: { id: "nope" }, body: {} } as any;
    const res = createMockRes();

    await toggleTask(req, res as any);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid task id" });
  });

  it("deleteTask: devuelve 204 si se elimina", async () => {
    const id = new mongoose.Types.ObjectId().toString();
    mockedTask.findByIdAndDelete.mockReturnValue({
      exec: vi.fn().mockResolvedValue({
        _id: { toString: () => id },
      }),
    } as any);

    const req = { params: { id } } as any;
    const res = createMockRes();

    await deleteTask(req, res as any);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});

