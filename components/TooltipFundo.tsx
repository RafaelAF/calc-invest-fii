import type { Fundo } from "@/lib/types";
import { rendimentoPercentual } from "@/lib/types";

interface Props {
  tooltip: { ticker: string; x: number; y: number } | null;
  fundo: Fundo | null | undefined;
}

export default function TooltipFundo({ tooltip, fundo }: Props) {
  if (!tooltip || !fundo) return null;

  return (
    <div
      className="fixed z-50 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 shadow-lg"
      style={{
        left: tooltip.x,
        top: tooltip.y,
        transform: "translateX(-50%)",
      }}
    >
      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{fundo.nome}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{fundo.segmento}</p>
      <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">
        Rend. {(rendimentoPercentual(fundo.preco, fundo.dividendoMensal) * 100).toFixed(2)}% a.m.
      </p>
    </div>
  );
}
