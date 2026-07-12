/**
 * components/ui/Toast.tsx
 *
 * Small auto-dismissing notification. Client component because it
 * owns its own timer and mount/unmount lifecycle.
 *
 * Parent owns visibility — typically:
 *   const [open, setOpen] = useState(false);
 *   {open && <Toast message="Saved." onClose={() => setOpen(false)} />}
 *
 * The toast auto-dismisses after `duration` ms (default 3200). It also
 * calls `onClose` if the user clicks the × button.
 *
 * All colors via Tailwind tokens (no hex inline).
 */

"use client";

import { useEffect } from "react";
import { cn } from "@/lib/cn";

export interface ToastProps {
  /** Body text — usually a confirmation message ("Message received."). */
  message: string;
  /** Fired when the toast closes (either by timer or by × click). */
  onClose: () => void;
  /** Auto-dismiss time in ms. Default 3200. */
  duration?: number;
  /** Optional extra classes. */
  className?: string;
}

export function Toast({
  message,
  onClose,
  duration = 3200,
  className,
}: ToastProps) {
  useEffect(() => {
    const t = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(t);
  }, [onClose, duration]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "border-acc/40 bg-elev text-t2 fixed right-6 bottom-6 z-50 flex max-w-[360px] items-start gap-3 rounded-[8px] border px-4 py-3 shadow-lg",
        "font-mono text-[13px]",
        className,
      )}
    >
      {/* Accent dot */}
      <span aria-hidden className="bg-acc mt-1 h-2 w-2 rounded-full" />
      <span className="flex-1 leading-[1.5]">{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className="text-t3 hover:text-t1 -mr-1 -mt-1 rounded p-1 text-[15px] leading-none transition-colors"
      >
        ×
      </button>
    </div>
  );
}
