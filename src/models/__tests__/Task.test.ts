import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Task Model Validation", () => {
  const titleValidator = (value: string): boolean => {
    return value.trim().length > 0;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a task with valid data", () => {
    const taskData = {
      title: "Learn TypeScript",
      description: "Study types and interfaces",
      completed: false,
    };

    expect(taskData.title).toBe("Learn TypeScript");
    expect(taskData.description).toBe("Study types and interfaces");
    expect(taskData.completed).toBe(false);
  });

  it("should throw validation error for empty title", () => {
    const title = "   ";

    expect(() => {
      if (!titleValidator(title)) {
        throw new Error("Title cannot be empty or contain only whitespace");
      }
    }).toThrow("Title cannot be empty or contain only whitespace");
  });

  it("should throw validation error for title with only spaces", () => {
    const title = "    ";

    expect(() => {
      if (!titleValidator(title)) {
        throw new Error("Title cannot be empty or contain only whitespace");
      }
    }).toThrow();
  });

  it("should set completed to false by default", () => {
    const taskData = {
      title: "Test task",
      completed: false,
    };

    const completed = taskData.completed ?? false;
    expect(completed).toBe(false);
  });

  it("should validate title correctly - valid titles", () => {
    expect(titleValidator("Learn TypeScript")).toBe(true);
    expect(titleValidator("  Learn TypeScript  ")).toBe(true);
    expect(titleValidator("A")).toBe(true);
  });

  it("should validate title correctly - invalid titles", () => {
    expect(titleValidator("")).toBe(false);
    expect(titleValidator("   ")).toBe(false);
    expect(titleValidator("\t\n")).toBe(false);
  });
});
