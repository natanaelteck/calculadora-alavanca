"use client";

import { useState } from "react";

type CalculationResult = {
  price: string;
  profit: string;
};

export default function Home() {
  const [cost, setCost] = useState("0");
  const [margin, setMargin] = useState("0");
  const [fee, setFee] = useState("0");
  const [tax, setTax] = useState("0");
  const [fixedCost, setFixedCost] = useState("0");

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function calcular() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/calc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cost: Number(cost),
          margin: Number(margin),
          fee: Number(fee),
          tax: Number(tax),
          fixedCost: Number(fixedCost),
        }),
      });

      const data = (await response.json()) as CalculationResult & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Falha ao calcular.");
      }

      setResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado.";
      setError(message);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Calculadora Alavanca</h1>

        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Custo"
          className="border p-2 w-full mb-2"
          value={cost}
          onChange={(event) => setCost(event.target.value)}
        />

        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Margem %"
          className="border p-2 w-full mb-2"
          value={margin}
          onChange={(event) => setMargin(event.target.value)}
        />

        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Taxa %"
          className="border p-2 w-full mb-2"
          value={tax}
          onChange={(event) => setTax(event.target.value)}
        />

        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Imposto %"
          className="border p-2 w-full mb-2"
          value={fee}
          onChange={(event) => setFee(event.target.value)}
        />

        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Custo fixo"
          className="border p-2 w-full mb-4"
          value={fixedCost}
          onChange={(event) => setFixedCost(event.target.value)}
        />

        <button
          onClick={calcular}
          disabled={isLoading}
          className="bg-blue-600 text-white p-3 w-full rounded disabled:opacity-70"
        >
          {isLoading ? "Calculando..." : "Calcular"}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {result && !error && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <p>Preço: R$ {result.price}</p>
            <p>Lucro: R$ {result.profit}</p>
          </div>
        )}
      </div>
    </div>
  );
}