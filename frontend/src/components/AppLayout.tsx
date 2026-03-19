import type { ReactNode } from "react";
import SystemStatus from "./SystemStatus";

type Props = {
  children: ReactNode;
  onOnlineChange: (online: boolean) => void;
};

export default function AppLayout({
  children,
  onOnlineChange,
}: Props): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold">Task Manager</h1>
            <div className="text-xs text-gray-500">v2026</div>
          </div>
          <SystemStatus onOnlineChange={onOnlineChange} />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}

