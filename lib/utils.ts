import type { Fundo } from "./types";

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function buscarFundo(lista: Fundo[], ticker: string): Fundo | undefined {
  return lista.find((f) => f.ticker.toUpperCase() === ticker.toUpperCase());
}
