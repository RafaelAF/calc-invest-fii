"use client";

import type { FundoProspeccao } from "@/lib/types";
import { rendimentoPercentual } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface Props {
  fundosProspeccao: FundoProspeccao[];
  custoProspeccao: number;
  excedeAporte: boolean;
  aporteMensal: number;
  onAtualizar: (ticker: string, quantidadeMensal: number) => void;
  onRemover: (ticker: string) => void;
  onAbrirSelecao: () => void;
}

export default function ProspeccaoCard({
  fundosProspeccao,
  custoProspeccao,
  excedeAporte,
  aporteMensal,
  onAtualizar,
  onRemover,
  onAbrirSelecao,
}: Props) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Prospecção
        </h2>
      </div>
      <p className="mb-4 text-xs text-slate-400 dark:text-slate-500">
        Defina quantas cotas comprar por mês de cada fundo com o aporte mensal
      </p>
      {excedeAporte && (
        <div className="mb-4 rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 px-3 py-2">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            O custo total das cotas ({formatCurrency(custoProspeccao)}) excede o aporte de {formatCurrency(aporteMensal)}.
            As cotas excedentes não serão compradas.
          </p>
        </div>
      )}
      <div className="space-y-3">
        {fundosProspeccao.map((item) => {
          const rend = rendimentoPercentual(item.precoEsperado, item.dividendoEsperado);
          return (
            <div
              key={item.ticker}
              className="rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 p-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {item.ticker}
                </p>
                <button
                  onClick={() => onRemover(item.ticker)}
                  className="rounded-lg p-1 text-slate-400 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <div>
                  <p className="text-xs text-slate-400">Preço</p>
                  <p className="text-sm font-mono text-slate-600 dark:text-slate-400">
                    {formatCurrency(item.precoEsperado)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Dividendo/cota</p>
                  <p className="text-sm font-mono text-slate-600 dark:text-slate-400">
                    {formatCurrency(item.dividendoEsperado)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Rend.</p>
                  <p className="text-sm font-mono text-emerald-600 dark:text-emerald-400">
                    {(rend * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Cotas/mês:</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={item.quantidadeMensal}
                    onChange={(e) =>
                      onAtualizar(item.ticker, Math.max(0, Number(e.target.value)))
                    }
                    className="w-16 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-center text-sm text-slate-900 dark:text-slate-100 transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-xs text-slate-400">
                  {formatCurrency(item.quantidadeMensal * item.precoEsperado)}/mês
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {fundosProspeccao.length > 0 && (
        <div className="mt-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/50 px-3 py-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Total/mês</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
              {formatCurrency(custoProspeccao)}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Dividendo/mês no fim</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">
              {formatCurrency(
                fundosProspeccao.reduce(
                  (s, p) => s + p.quantidadeMensal * p.dividendoEsperado,
                  0,
                ),
              )}
            </span>
          </div>
        </div>
      )}
      <div className="mt-3">
        <button
          onClick={onAbrirSelecao}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 px-3 py-2.5 text-sm text-slate-500 dark:text-slate-400 transition-all duration-200 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Adicionar fundo para prospecção
        </button>
      </div>
    </div>
  );
}
