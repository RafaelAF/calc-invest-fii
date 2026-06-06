"use client";

import { useState } from "react";
import type { Fundo } from "@/lib/types";
import { rendimentoPercentual } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface Props {
  aberto: boolean;
  fundos: Fundo[];
  onFechar: () => void;
  onAdicionar: (fundo: Fundo) => void;
  onEditar: (ticker: string, fundo: Fundo) => void;
  onRemover: (ticker: string) => void;
}

export default function ModalGerenciarFundos({
  aberto,
  fundos,
  onFechar,
  onAdicionar,
  onEditar,
  onRemover,
}: Props) {
  const [editando, setEditando] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState<Fundo>({
    ticker: "",
    nome: "",
    segmento: "",
    preco: 0,
    dividendoMensal: 0,
  });

  const resetForm = () => {
    setForm({ ticker: "", nome: "", segmento: "", preco: 0, dividendoMensal: 0 });
    setErro("");
  };

  const iniciarEdicao = (f: Fundo) => {
    setEditando(f.ticker);
    setForm(f);
    setErro("");
  };

  const nomesExistentes = fundos.map((f) => f.nome.toLowerCase());

  const salvar = () => {
    if (!form.ticker.trim() || form.preco <= 0) return;
    if (!form.nome.trim()) {
      setErro("O nome do fundo é obrigatório.");
      return;
    }
    if (!editando && nomesExistentes.includes(form.nome.toLowerCase())) {
      setErro("Já existe um fundo com este nome.");
      return;
    }
    setErro("");
    if (editando) {
      onEditar(editando, form);
    } else {
      onAdicionar(form);
    }
    setEditando(null);
    resetForm();
  };

  const cancelar = () => {
    setEditando(null);
    resetForm();
  };

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onFechar}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Gerenciar Base de Fundos
          </h2>
          <button
            onClick={onFechar}
            className="rounded-lg p-1.5 text-slate-400 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 p-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {editando ? "Editar Fundo" : "Novo Fundo"}
          </h3>
          {erro && (
            <p className="mb-3 rounded-lg border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 text-xs text-red-600 dark:text-red-400">
              {erro}
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400">Ticker</label>
              <input
                type="text"
                value={form.ticker}
                onChange={(e) => setForm({ ...form, ticker: e.target.value.toUpperCase() })}
                className="mt-0.5 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400">Nome</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => {
                  setForm({ ...form, nome: e.target.value });
                  if (erro) setErro("");
                }}
                className="mt-0.5 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400">Segmento</label>
              <input
                type="text"
                value={form.segmento}
                onChange={(e) => setForm({ ...form, segmento: e.target.value })}
                className="mt-0.5 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.preco}
                onChange={(e) => setForm({ ...form, preco: Number(e.target.value) })}
                className="mt-0.5 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400">Dividendo Mensal (R$/cota)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.dividendoMensal}
                onChange={(e) => setForm({ ...form, dividendoMensal: Number(e.target.value) })}
                className="mt-0.5 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              />
              {form.preco > 0 && form.dividendoMensal > 0 && (
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                  Rend. estimado: {(rendimentoPercentual(form.preco, form.dividendoMensal) * 100).toFixed(2)}% a.m.
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            {editando && (
              <button
                onClick={cancelar}
                className="rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-1.5 text-sm text-slate-600 dark:text-slate-350 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={salvar}
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm text-white transition-all duration-200 hover:bg-indigo-700"
            >
              {editando ? "Salvar" : "Adicionar"}
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="pb-2 pr-3">Ticker</th>
                  <th className="pb-2 pr-3">Nome</th>
                  <th className="pb-2 pr-3">Segmento</th>
                  <th className="pb-2 pr-3 text-right">Preço</th>
                  <th className="pb-2 pr-3 text-right">Dividendo</th>
                  <th className="pb-2 text-right">Rend. %</th>
                  <th className="pb-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {fundos.map((f) => (
                  <tr key={f.ticker} className="border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <td className="py-2 pr-3 text-sm font-semibold text-slate-900 dark:text-slate-100">{f.ticker}</td>
                    <td className="py-2 pr-3 text-sm text-slate-600 dark:text-slate-400">{f.nome}</td>
                    <td className="py-2 pr-3 text-sm text-slate-500 dark:text-slate-400">{f.segmento}</td>
                    <td className="py-2 pr-3 text-right text-sm font-mono text-slate-700 dark:text-slate-300">{formatCurrency(f.preco)}</td>
                    <td className="py-2 pr-3 text-right text-sm font-mono text-slate-700 dark:text-slate-300">{formatCurrency(f.dividendoMensal)}</td>
                    <td className="py-2 pr-3 text-right text-sm font-mono text-emerald-600 dark:text-emerald-400">{(rendimentoPercentual(f.preco, f.dividendoMensal) * 100).toFixed(2)}%</td>
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => iniciarEdicao(f)}
                          className="rounded-lg p-1.5 text-slate-400 transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-500"
                          title="Editar"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onRemover(f.ticker)}
                          className="rounded-lg p-1.5 text-slate-400 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500"
                          title="Remover"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
