import { CheckCircle2 } from "lucide-react";
import { orderShortId } from "@/lib/format";

type OrderSuccessProps = {
  orderId: string | null;
};

export function OrderSuccess({ orderId }: OrderSuccessProps) {
  if (!orderId) {
    return null;
  }

  return (
    <div className="animate-scale-in rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 text-green-900 shadow-card">
      <div className="flex items-center gap-2 font-black">
        <CheckCircle2 size={21} className="text-green-500" aria-hidden="true" />
        Pedido salvo
      </div>
      <p className="mt-1 text-sm">Numero #{orderShortId(orderId)}. O WhatsApp foi aberto com a mensagem pronta.</p>
    </div>
  );
}