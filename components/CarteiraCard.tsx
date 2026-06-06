"use client";

import type { Fundo, FundoEmCarteira } from "@/lib/types";
import { formatCurrency, buscarFundo } from "@/lib/utils";

interface Props {
  fundosDisponiveis: Fundo[];
  fundosCarteira: FundoEmCarteira[];
  confirmandoExclusao: string | null;
  patrimonioFIIs: number;
  onAtualizarQtd: (ticker: string, quantidade: number) => void;
  onConfirmarRemocao: (ticker: string) => void;
  onCancelarRemocao: () => void;
  onRemover: (ticker: string) => void;
  onAbrirGestao: () => void;
  onAbrirSelecao: () => void;
  onTooltipEnter: (e: React.MouseEvent, ticker: string) => void;
  onTooltipLeave: () => void;
}

export default function CarteiraCard({
  fundosDisponiveis,
  fundosCarteira,
  confirmandoExclusao,
  patrimonioFIIs,
  onAtualizarQtd,
  onConfirmarRemocao,
  onCancelarRemocao,
  onRemover,
  onAbrirGestao,
  onAbrirSelecao,
  onTooltipEnter,
  onTooltipLeave,
}: Props) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Carteira Atual
        </h2>
        <button
          onClick={onAbrirGestao}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 active:scale-95"
        >
          Gerenciar Fundos
        </button>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-[auto_auto_80px_auto_auto] gap-x-2 gap-y-0 px-1 pb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Fundo</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-center">Preço</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-center">Qtd</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-center">Total</span>
          <span />
        </div>
        {fundosCarteira.length === 0 && (
          <p className="py-4 text-center text-sm text-slate-400 dark:text-slate-500">
            Nenhum fundo na carteira
          </p>
        )}
        {fundosCarteira.map((item) => {
          const fundo = buscarFundo(fundosDisponiveis, item.ticker);
          const total = fundo ? fundo.preco * item.quantidade : 0;
          return (
            <div
              key={item.ticker}
              className="grid grid-cols-[auto_auto_80px_auto_auto] gap-x-2 items-center rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 p-3"
            >
              <div
                className="min-w-0 relative"
                onMouseEnter={(e) => onTooltipEnter(e, item.ticker)}
                onMouseLeave={onTooltipLeave}
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {item.ticker}
                </p>
              </div>
              <p className="text-center text-sm font-mono text-slate-600 dark:text-slate-400">
                {fundo ? formatCurrency(fundo.preco) : "—"}
              </p>
              <input
                type="number"
                min="0"
                step="1"
                value={item.quantidade}
                onChange={(e) =>
                  onAtualizarQtd(item.ticker, Math.max(0, Number(e.target.value)))
                }
                className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-center text-sm text-slate-900 dark:text-slate-100 transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-center text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
                {formatCurrency(total)}
              </p>
              <div className="flex justify-end">
                {confirmandoExclusao === item.ticker ? (
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => onRemover(item.ticker)}
                      className="rounded-lg p-1.5 text-emerald-500 transition-all duration-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                      title="Confirmar exclusão"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={onCancelarRemocao}
                      className="rounded-lg p-1.5 text-slate-400 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="Cancelar"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onConfirmarRemocao(item.ticker)}
                    className="rounded-lg p-1.5 text-slate-400 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500"
                    title="Remover fundo"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <button
          onClick={onAbrirSelecao}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 px-3 py-2.5 text-sm text-slate-500 dark:text-slate-400 transition-all duration-200 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Adicionar fundo
        </button>
      </div>
      <div className="mt-4 border-t border-slate-100 dark:border-slate-700 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Patrimônio em FIIs
          </span>
          <span className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400">
            {formatCurrency(patrimonioFIIs)}
          </span>
        </div>
      </div>
    </div>
  );
}
