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

const paymentMethods: Array<{ value: PaymentMethod; label: string }> = [
  { value: "pix", label: "Pix" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cartao_credito", label: "Cartao de credito" },
  { value: "cartao_debito", label: "Cartao de debito" }
];

export function CheckoutForm({ data, disabled, loading, error, onChange, onSubmit }: CheckoutFormProps) {
  const update = <K extends keyof CheckoutData>(key: K, value: CheckoutData[K]) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4">
      <h2 className="text-lg font-black text-zinc-950">Checkout</h2>
      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="text-sm font-bold text-zinc-900">Nome</span>
          <input
            value={data.customerName}
            onChange={(event) => update("customerName", event.target.value)}
            className="mt-1 h-12 w-full rounded-lg border border-zinc-200 bg-white px-3"
            placeholder="Seu nome"
          />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-zinc-900">Telefone</span>
          <input
            value={data.customerPhone}
            onChange={(event) => update("customerPhone", event.target.value)}
            className="mt-1 h-12 w-full rounded-lg border border-zinc-200 bg-white px-3"
            inputMode="tel"
            placeholder="(18) 99999-9999"
          />
        </label>

        <div>
          <span className="text-sm font-bold text-zinc-900">Tipo de entrega</span>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => update("deliveryType", "pickup")}
              className={`h-12 rounded-lg border font-bold ${
                data.deliveryType === "pickup" ? "border-ketchup bg-red-50 text-ketchup" : "border-zinc-200 bg-white text-zinc-700"
              }`}
            >
              Retirada
            </button>
            <button
              type="button"
              onClick={() => update("deliveryType", "delivery")}
              className={`h-12 rounded-lg border font-bold ${
                data.deliveryType === "delivery" ? "border-ketchup bg-red-50 text-ketchup" : "border-zinc-200 bg-white text-zinc-700"
              }`}
            >
              Entrega
            </button>
          </div>
        </div>

        {data.deliveryType === "delivery" ? (
          <label className="block">
            <span className="text-sm font-bold text-zinc-900">Endereco</span>
            <input
              value={data.address}
              onChange={(event) => update("address", event.target.value)}
              className="mt-1 h-12 w-full rounded-lg border border-zinc-200 bg-white px-3"
              placeholder="Rua, numero, bairro"
            />
          </label>
        ) : null}

        <label className="block">
          <span className="text-sm font-bold text-zinc-900">Pagamento</span>
          <select
            value={data.paymentMethod}
            onChange={(event) => update("paymentMethod", event.target.value as PaymentMethod)}
            className="mt-1 h-12 w-full rounded-lg border border-zinc-200 bg-white px-3"
          >
            {paymentMethods.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-bold text-zinc-900">Observacoes</span>
          <textarea
            value={data.notes}
            onChange={(event) => update("notes", event.target.value)}
            className="mt-1 min-h-24 w-full rounded-lg border border-zinc-200 bg-white p-3"
            placeholder="Ex: sem cebola"
          />
        </label>

        {error ? <p className="rounded-lg bg-red-50 p-3 text-sm font-bold text-ketchup">{error}</p> : null}

        <button
          type="button"
          disabled={disabled || loading}
          onClick={onSubmit}
          className="flex h-12 min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-ketchup px-4 py-4 font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {loading ? <Loader2 className="animate-spin" size={20} aria-hidden="true" /> : <Send size={20} aria-hidden="true" />}
          Enviar pedido para a loja
        </button>
      </div>
    </section>
  );
}
