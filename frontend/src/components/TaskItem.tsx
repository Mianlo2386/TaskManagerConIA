import { useState } from "react";
import { CheckCircle2, Trash2 } from "lucide-react";
import type { Task } from "../types/task";

type Props = {
  task: Task;
  isOnline: boolean;
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function TaskItem({
  task,
  isOnline,
  onToggle,
  onDelete,
}: Props): JSX.Element {
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const completedStyle = task.completed
    ? "text-gray-500 line-through"
    : "text-gray-900";

  async function handleToggle(nextCompleted: boolean): Promise<void> {
    if (!isOnline || isBusy) return;
    setIsBusy(true);
    try {
      await onToggle(task.id, nextCompleted);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDelete(): Promise<void> {
    if (!isOnline || isBusy) return;
    setIsBusy(true);
    try {
      await onDelete(task.id);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <li className="flex items-start justify-between gap-4 rounded-xl border bg-white p-3">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          disabled={!isOnline || isBusy}
          onChange={(e) => void handleToggle(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600"
          aria-label={task.completed ? "Marcar como pendiente" : "Marcar como completada"}
        />

        <div>
          <div className={`text-sm font-medium ${completedStyle}`}>{task.title}</div>
          {task.description ? (
            <div className="mt-1 text-xs text-gray-500">{task.description}</div>
          ) : null}
          <div className="mt-2 text-[11px] text-gray-400">
            {new Date(task.createdAt).toLocaleString()}
          </div>
        </div>
      </label>

      <button
        type="button"
        disabled={!isOnline || isBusy}
        onClick={() => void handleDelete()}
        className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Eliminar tarea"
      >
        <Trash2 className="h-4 w-4" />
        <span className="hidden sm:inline">Borrar</span>
        {task.completed ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : null}
      </button>
    </li>
  );
}

