"use client";

import { useState, useEffect, useMemo } from "react";
import type { DadosMes } from "@/lib/calculations";
import MesRow from "./MesRow";

interface Props {
  resultados: DadosMes[];
  aberta: boolean;
  onToggle: () => void;
}

const ITENS_POR_PAGINA = 12;

export default function TabelaDetalhamento({
  resultados,
  aberta,
  onToggle,
}: Props) {
  const [pagina, setPagina] = useState(1);

  const totalPaginas = Math.max(1, Math.ceil(resultados.length / ITENS_POR_PAGINA));

  useEffect(() => {
    setPagina((p) => Math.min(p, totalPaginas));
  }, [totalPaginas]);

  const dadosPagina = useMemo(
    () => resultados.slice((pagina - 1) * ITENS_POR_PAGINA, pagina * ITENS_POR_PAGINA),
    [resultados, pagina],
  );

  const gerarPaginas = () => {
    const items: (number | string)[] = [];
    const maxBotoes = 5;

    if (totalPaginas <= maxBotoes + 2) {
      for (let i = 1; i <= totalPaginas; i++) items.push(i);
    } else {
      items.push(1);
      if (pagina > 3) items.push("...");
      const inicio = Math.max(2, pagina - 1);
      const fim = Math.min(totalPaginas - 1, pagina + 1);
      for (let i = inicio; i <= fim; i++) items.push(i);
      if (pagina < totalPaginas - 2) items.push("...");
      items.push(totalPaginas);
    }
    return items;
  };

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
        <div className="border-t border-slate-200 dark:border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-900 dark:bg-slate-800 text-white">
                  <th className="px-4 py-3 font-semibold">Mês</th>
                  <th className="px-4 py-3 font-semibold text-right">Total Investido</th>
                  <th className="px-4 py-3 font-semibold text-right text-indigo-500">Prospecção de aporte</th>
                  <th className="px-4 py-3 font-semibold text-right">Rendimento</th>
                  <th className="px-4 py-3 font-semibold text-right">Patrimônio</th>
                </tr>
              </thead>
              <tbody>
                {dadosPagina.map((mes) => (
                  <MesRow key={mes.mes} mes={mes} />
                ))}
              </tbody>
            </table>
          </div>

          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-1 px-4 py-3 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="px-2 py-1 text-xs rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                &lt;
              </button>

              {gerarPaginas().map((item, idx) =>
                typeof item === "string" ? (
                  <span key={`ellipsis-${idx}`} className="px-1 text-xs text-slate-400">
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPagina(item)}
                    className={`min-w-[28px] px-2 py-1 text-xs rounded-md transition-colors font-medium ${item === pagina
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                  >
                    {item}
                  </button>
                ),
              )}

              <button
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
                className="px-2 py-1 text-xs rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
