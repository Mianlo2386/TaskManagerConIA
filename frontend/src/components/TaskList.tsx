import { useEffect, useState } from "react";
import { getTasks, toggleTask, deleteTask } from "../services/api";
import type { Task } from "../types/task";
import TaskItem from "./TaskItem";

type Props = {
  isOnline: boolean;
  reloadSignal: number;
  requestReload: () => void;
};

export default function TaskList({
  isOnline,
  reloadSignal,
  requestReload,
}: Props): JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getTasks();
        if (!cancelled) {
          setTasks(data);
        }
      } catch {
        if (!cancelled) {
          setError("No se pudieron cargar las tareas.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [reloadSignal]);

  async function handleToggle(id: string, completed: boolean): Promise<void> {
    await toggleTask(id, completed);
    requestReload();
  }

  async function handleDelete(id: string): Promise<void> {
    await deleteTask(id);
    requestReload();
  }

  return (
    <section className="mt-6 rounded-xl border bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Tus tareas</h2>
        <div className="text-xs text-gray-500">RU-01 / RU-03 / RU-04</div>
      </div>

      {error ? <div className="mt-3 text-sm text-red-600">{error}</div> : null}

      {isLoading ? (
        <div className="mt-4 text-sm text-gray-600">Cargando...</div>
      ) : tasks.length === 0 ? (
        <div className="mt-4 text-sm text-gray-600">No hay tareas todavía.</div>
      ) : (
        <ul className="mt-3 space-y-3">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isOnline={isOnline}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

