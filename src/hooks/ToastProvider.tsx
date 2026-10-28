import { useCallback, useMemo, useState, type ReactNode } from "react";
import { ToastContext } from "./useToast";

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({ message: "", visible: false });

  const toast = useCallback((message: string) => {
    setState({ message, visible: true });
    window.setTimeout(() => {
      setState((s) => ({ ...s, visible: false }));
    }, 2000);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {state.visible ? (
        <div
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-ink px-4 py-2.5 text-sm text-on-ink shadow-[0_2px_8px_rgba(1,25,54,0.12)]"
          role="status"
          aria-live="polite"
        >
          {state.message}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}
