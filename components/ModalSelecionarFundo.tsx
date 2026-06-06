"use client";

import { useState, useRef, useEffect } from "react";
import type { Fundo } from "@/lib/types";
import { rendimentoPercentual } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface Props {
  aberto: boolean;
  fundos: Fundo[];
  jaAdicionados: string[];
  onSelecionar: (ticker: string) => void;
  onFechar: () => void;
}

export default function ModalSelecionarFundo({
  aberto,
  fundos,
  jaAdicionados,
  onSelecionar,
  onFechar,
}: Props) {
  const [busca, setBusca] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const disponiveis = fundos.filter(
    (f) => !jaAdicionados.includes(f.ticker),
  );

  const filtrados = busca
    ? disponiveis.filter(
      (f) =>
        f.ticker.toLowerCase().includes(busca.toLowerCase()) ||
        f.nome.toLowerCase().includes(busca.toLowerCase()),
    )
    : disponiveis;

  useEffect(() => {
    if (aberto) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setBusca("");
    }
  }, [aberto]);

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onFechar}>
      <div className="max-h-[80vh] w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-slate-100 dark:border-slate-700 px-4 py-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar fundo..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-slate-105 transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="overflow-y-auto max-h-[55vh]">
          {filtrados.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-400">Nenhum fundo disponível</p>
          ) : (
            filtrados.map((f) => (
              <button
                key={f.ticker}
                onClick={() => {
                  onSelecionar(f.ticker);
                  onFechar();
                }}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-b border-slate-50 dark:border-slate-800 last:border-0"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{f.ticker}</p>
                  <p className="text-xs text-slate-550 dark:text-slate-400">{f.nome}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-slate-700 dark:text-slate-300">{formatCurrency(f.preco)}</p>
                  <p className="text-xs text-slate-550 dark:text-slate-400">{formatCurrency(f.dividendoMensal)}/cota</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">{(rendimentoPercentual(f.preco, f.dividendoMensal) * 100).toFixed(2)}% a.m.</p>
                </div>
              </button>
            ))
          )}
        </div>
        <div className="border-t border-slate-100 dark:border-slate-700 px-4 py-3">
          <button
            onClick={onFechar}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm text-slate-650 dark:text-slate-350 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
