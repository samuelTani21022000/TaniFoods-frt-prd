import { CheckCircle2, X } from "lucide-react";
import { useEffect, useState } from "react";

type ToastProps = {
  message: string;
  onClose: () => void;
};

export function Toast({ message, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-24 left-1/2 z-50 flex items-center gap-2 rounded-full bg-charcoal px-5 py-3 text-sm font-bold text-white shadow-soft transition-all duration-300 sm:bottom-8 ${
        visible ? "translate-x-[-50%] opacity-100" : "translate-x-[-50%] opacity-0 translate-y-2"
      }`}
    >
      <CheckCircle2 size={18} className="text-gold-400" aria-hidden="true" />
      <span>{message}</span>
      <button
        type="button"
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 200);
        }}
        className="ml-1 rounded-full p-0.5 text-white/70 transition hover:text-white"
        aria-label="Fechar notificacao"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}