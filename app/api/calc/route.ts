import { NextResponse } from "next/server";

type CalculationPayload = {
  cost: number;
  margin: number;
  fee: number;
  tax: number;
  fixedCost: number;
};

function parseNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  throw new Error("Valor numérico inválido.");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<CalculationPayload>;

    const cost = parseNumber(body.cost);
    const margin = parseNumber(body.margin);
    const fee = parseNumber(body.fee);
    const tax = parseNumber(body.tax);
    const fixedCost = parseNumber(body.fixedCost);

    if (cost < 0 || margin < 0 || fee < 0 || tax < 0 || fixedCost < 0) {
      return NextResponse.json(
        { error: "Valores negativos não são permitidos." },
        { status: 400 }
      );
    }

    const totalCost = cost + fixedCost;
    const denominator = 1 - (margin + fee + tax) / 100;

    if (totalCost <= 0) {
      return NextResponse.json(
        { error: "O custo total precisa ser maior que zero." },
        { status: 400 }
      );
    }

    if (denominator <= 0) {
      return NextResponse.json(
        { error: "A soma de margem, taxa e imposto é inválida para esse cálculo." },
        { status: 400 }
      );
    }

    const price = totalCost / denominator;
    const profit = price - totalCost;

    return NextResponse.json({
      price: price.toFixed(2),
      profit: profit.toFixed(2),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao processar a solicitação.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
