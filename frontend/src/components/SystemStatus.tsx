import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { healthCheck } from "../services/api";

type Props = {
  onOnlineChange?: (online: boolean) => void;
};

export default function SystemStatus({ onOnlineChange }: Props): JSX.Element {
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    const syncState = (online: boolean): void => {
      if (cancelled) return;
      setIsOnline(online);
      setIsChecking(false);
      onOnlineChange?.(online);
    };

    const ping = async (): Promise<void> => {
      try {
        const ok = await healthCheck();
        syncState(ok);
      } catch {
        syncState(false);
      }
    };

    // Fail-fast: si cualquier operación marca offline, lo reflejamos de inmediato.
    const onBackendOffline = (): void => {
      syncState(false);
    };

    window.addEventListener("backend:offline", onBackendOffline);
    void ping();

    const intervalId = window.setInterval(() => {
      void ping();
    }, 5000);

    return () => {
      cancelled = true;
      window.removeEventListener("backend:offline", onBackendOffline);
      window.clearInterval(intervalId);
    };
  }, [onOnlineChange]);

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2">
      {isChecking ? (
        <div className="text-sm text-gray-600">Comprobando sistema...</div>
      ) : isOnline ? (
        <>
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div className="text-sm font-medium text-green-700">Sistema Operativo: ONLINE</div>
        </>
      ) : (
        <>
          <XCircle className="h-5 w-5 text-red-600" />
          <div className="text-sm font-medium text-red-700">Sistema Operativo: OFFLINE</div>
        </>
      )}
    </div>
  );
}

