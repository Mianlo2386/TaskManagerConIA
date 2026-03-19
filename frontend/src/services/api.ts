import type { Task } from "../types/task";

const API_BASE_RAW = import.meta.env.VITE_API_URL as string | undefined;
const API_BASE = (API_BASE_RAW ?? "").replace(/\/+$/, "");

function buildUrl(path: string): string {
  if (!API_BASE) {
    // Fail fast: si no está configurado, el UI no puede operar de forma segura.
    throw new Error("VITE_API_URL no está configurada");
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
}

function notifyBackendOffline(): void {
  window.dispatchEvent(new CustomEvent("backend:offline"));
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(input, { ...init, signal: controller.signal });
    return response;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function requestJson<T>(
  path: string,
  init: RequestInit & { timeoutMs?: number; method: string },
): Promise<T> {
  try {
    const timeoutMs = init.timeoutMs ?? 8000;
    const response = await fetchWithTimeout(buildUrl(path), init, timeoutMs);

    if (!response.ok) {
      const status = response.status;
      // Para fail-fast solo marcamos como offline en 5xx (y también en errores de red/timeout).
      if (status >= 500) {
        notifyBackendOffline();
      }

      let details: string | undefined;
      try {
        details = await response.text();
      } catch {
        details = undefined;
      }

      const message =
        details && details.trim().length > 0 ? details : `Request failed with ${status}`;

      const error = new Error(message);
      (error as any).status = status;
      throw error;
    }

    return (await response.json()) as T;
  } catch (error) {
    notifyBackendOffline();
    throw error;
  }
}

export async function healthCheck(): Promise<boolean> {
  const response = await fetchWithTimeout(buildUrl("/health"), { method: "GET" }, 4000);
  return response.ok;
}

export async function getTasks(): Promise<Task[]> {
  return requestJson<Task[]>("/api/tasks", { method: "GET" });
}

export async function createTask(title: string): Promise<Task> {
  return requestJson<Task>("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
}

export async function toggleTask(id: string, completed: boolean): Promise<Task> {
  return requestJson<Task>(`/api/tasks/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
}

export async function deleteTask(id: string): Promise<void> {
  const response = await fetchWithTimeout(
    buildUrl(`/api/tasks/${encodeURIComponent(id)}`),
    { method: "DELETE" },
    8000,
  );

  if (!response.ok) {
    if (response.status >= 500) {
      notifyBackendOffline();
    }
    throw new Error(`Delete failed with ${response.status}`);
  }
}

