import { Loader2, Send } from "lucide-react";
import type { CheckoutData, PaymentMethod } from "@/types";

type CheckoutFormProps = {
  data: CheckoutData;
  disabled: boolean;
  loading: boolean;
  error: string | null;
  onChange: (data: CheckoutData) => void;
  onSubmit: () => void;
};

const paymentMethods: Array<{ value: PaymentMethod; label: string; icon: string }> = [
  { value: "pix", label: "Pix", icon: "⚡" },
  { value: "dinheiro", label: "Dinheiro", icon: "💵" },
  { value: "cartao_credito", label: "Credito", icon: "💳" },
  { value: "cartao_debito", label: "Debito", icon: "💳" }
];

export function CheckoutForm({ data, disabled, loading, error, onChange, onSubmit }: CheckoutFormProps) {
  const update = <K extends keyof CheckoutData>(key: K, value: CheckoutData[K]) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <section className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-card">
      <h2 className="text-lg font-black text-zinc-950">Checkout</h2>
      <div className="mt-4 space-y-4">
        <label className="block">
          <span className="text-sm font-bold text-zinc-700">Nome</span>
          <input
            value={data.customerName}
            onChange={(event) => update("customerName", event.target.value)}
            className="mt-1.5 h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 shadow-sm transition-all duration-200 placeholder:text-zinc-400 focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
            placeholder="Seu nome"
          />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-zinc-700">Telefone</span>
          <input
            value={data.customerPhone}
            onChange={(event) => update("customerPhone", event.target.value)}
            className="mt-1.5 h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 shadow-sm transition-all duration-200 placeholder:text-zinc-400 focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
            inputMode="tel"
            placeholder="(18) 99999-9999"
          />
        </label>

        <div className={`address-field ${data.deliveryType === "delivery" ? "max-h-24 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
          <label className="block">
            <span className="text-sm font-bold text-zinc-700">Endereco</span>
            <input
              value={data.address}
              onChange={(event) => update("address", event.target.value)}
              className="mt-1.5 h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 shadow-sm transition-all duration-200 placeholder:text-zinc-400 focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
              placeholder="Rua, numero, bairro"
            />
          </label>
        </div>

        <div>
          <span className="text-sm font-bold text-zinc-700">Tipo de entrega</span>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => update("deliveryType", "pickup")}
              className={`h-12 rounded-xl border font-bold transition-all duration-200 ${
                data.deliveryType === "pickup"
                  ? "border-ketchup bg-red-50 text-ketchup shadow-sm"
                  : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              🏪 Retirada
            </button>
            <button
              type="button"
              onClick={() => update("deliveryType", "delivery")}
              className={`h-12 rounded-xl border font-bold transition-all duration-200 ${
                data.deliveryType === "delivery"
                  ? "border-ketchup bg-red-50 text-ketchup shadow-sm"
                  : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              🛵 Entrega
            </button>
          </div>
        </div>

        <div>
          <span className="text-sm font-bold text-zinc-700">Pagamento</span>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {paymentMethods.map((method) => (
              <button
                key={method.value}
                type="button"
                onClick={() => update("paymentMethod", method.value)}
                className={`flex h-12 items-center justify-center gap-1.5 rounded-xl border text-sm font-bold transition-all duration-200 ${
                  data.paymentMethod === method.value
                    ? "border-ketchup bg-red-50 text-ketchup shadow-sm"
                    : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                <span>{method.icon}</span>
                {method.label}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="text-sm font-bold text-zinc-700">Observacoes</span>
          <textarea
            value={data.notes}
            onChange={(event) => update("notes", event.target.value)}
            className="mt-1.5 min-h-24 w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm font-medium text-zinc-900 shadow-sm transition-all duration-200 placeholder:text-zinc-400 focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
            placeholder="Ex: sem cebola"
          />
        </label>

        {error ? (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm font-bold text-ketchup ring-1 ring-red-100">
            <span className="text-base">⚠️</span>
            {error}
          </div>
        ) : null}

        <button
          type="button"
          disabled={disabled || loading}
          onClick={onSubmit}
          className="flex h-12 min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-ketchup px-4 py-4 font-black text-white shadow-warm transition-all duration-200 hover:bg-red-700 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
        >
          {loading ? <Loader2 className="animate-spin" size={20} aria-hidden="true" /> : <Send size={20} aria-hidden="true" />}
          Enviar pedido para a loja
        </button>
      </div>
    </section>
  );
}