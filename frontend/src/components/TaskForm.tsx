import type { FormEvent } from "react";
import { useState } from "react";
import { Plus } from "lucide-react";
import { createTask } from "../services/api";

type Props = {
  isOnline: boolean;
  onCreated: () => void;
};

export default function TaskForm({ isOnline, onCreated }: Props): JSX.Element {
  const [title, setTitle] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);

    const trimmed = title.trim();
    if (trimmed.length === 0) {
      setError("El título no puede estar vacío.");
      return;
    }

    if (!isOnline) {
      setError("Backend offline: escritura temporalmente deshabilitada.");
      return;
    }

    try {
      setIsSubmitting(true);
      await createTask(trimmed);
      setTitle("");
      onCreated();
    } catch {
      // No exponemos detalles internos: fail-fast + indicador ya se encargan de OFFLINE.
      setError("No se pudo crear la tarea. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const trimmed = title.trim();
  const canSubmit = isOnline && trimmed.length > 0 && !isSubmitting;

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Crear tarea</h2>
        <div className="text-xs text-gray-500">RU-02</div>
      </div>

      <label className="block">
        <div className="mb-1 text-xs font-medium text-gray-700">Título</div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Escribe una tarea..."
          className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!isOnline || isSubmitting}
          autoComplete="off"
        />
      </label>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <button
        type="submit"
        disabled={!canSubmit}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
        Añadir Tarea
      </button>
    </form>
  );
}

