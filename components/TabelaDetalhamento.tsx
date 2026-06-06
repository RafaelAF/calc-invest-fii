"use client";

import { type DadosMes } from "@/lib/calculations";
import MesRow from "./MesRow";

interface Props {
  resultados: DadosMes[];
  aberta: boolean;
  onToggle: () => void;
}

export default function TabelaDetalhamento({
  resultados,
  aberta,
  onToggle,
}: Props) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
      >
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Detalhamento Mês a Mês
        </h2>
        <svg
          className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${aberta ? "rotate-180" : ""
            }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {aberta && (
        <div className="overflow-x-auto border-t border-slate-200 dark:border-slate-700">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-900 dark:bg-slate-800 text-white">
                <th className="px-4 py-3 font-semibold">Mês</th>
                <th className="px-4 py-3 font-semibold text-right">Total Investido</th>
                <th className="px-4 py-3 font-semibold text-right text-indigo-500">Prospecção</th>
                <th className="px-4 py-3 font-semibold text-right">Rendimento</th>
                <th className="px-4 py-3 font-semibold text-right">Patrimônio</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((mes) => (
                <MesRow key={mes.mes} mes={mes} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
