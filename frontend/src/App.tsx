import { useCallback, useState } from "react";
import AppLayout from "./components/AppLayout";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";

export default function App(): JSX.Element {
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);
  const [reloadSignal, setReloadSignal] = useState<number>(0);

  const requestReload = useCallback(() => {
    setReloadSignal((v) => v + 1);
  }, []);

  return (
    <AppLayout onOnlineChange={setIsBackendOnline}>
      <div className="space-y-4">
        <TaskForm isOnline={isBackendOnline} onCreated={requestReload} />
        <TaskList
          isOnline={isBackendOnline}
          reloadSignal={reloadSignal}
          requestReload={requestReload}
        />
      </div>
    </AppLayout>
  );
}

