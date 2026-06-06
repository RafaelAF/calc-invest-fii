"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type { Fundo, FundoEmCarteira, FundoProspeccao, FundoSimulado } from "@/lib/types";
import { rendimentoPercentual } from "@/lib/types";
import { FUNDOS_DISPONIVEIS } from "@/lib/funds-database";
import {
  VALOR_INICIAL_CAIXA,
  FUNDOS_INICIAIS_CARTEIRA,
  FUNDOS_INICIAIS_PROSPECCAO,
  APORTE_MENSAL_PADRAO,
  TEMPO_PADRAO_MESES,
} from "@/lib/data";
import { calcularProjecao, type DadosMes } from "@/lib/calculations";
import { useTheme } from "@/lib/theme-context";

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function buscarFundo(lista: Fundo[], ticker: string): Fundo | undefined {
  return lista.find((f) => f.ticker.toUpperCase() === ticker.toUpperCase());
}

function MesRow({ mes }: { mes: DadosMes }) {
  return (
    <tr className="odd:bg-white even:bg-slate-50/50 dark:odd:bg-slate-800 dark:even:bg-slate-800/50 transition-colors">
      <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">{mes.mes}</td>
      <td className="px-4 py-2 text-sm text-slate-650 dark:text-slate-400 font-mono text-right">
        {formatCurrency(mes.totalAportado)}
      </td>
      <td className="px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 font-mono text-right">
        {formatCurrency(mes.prospeccaoMes)}
      </td>
      <td className="px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400 font-mono text-right">
        {formatCurrency(mes.rendimentoMensal)}
      </td>
      <td className="px-4 py-2 text-sm text-slate-900 dark:text-slate-100 font-mono text-right font-medium">
        {formatCurrency(mes.patrimonioAcumulado)}
      </td>
    </tr>
  );
}

function ModalGerenciarFundos({
  aberto,
  fundos,
  onFechar,
  onAdicionar,
  onEditar,
  onRemover,
}: {
  aberto: boolean;
  fundos: Fundo[];
  onFechar: () => void;
  onAdicionar: (fundo: Fundo) => void;
  onEditar: (ticker: string, fundo: Fundo) => void;
  onRemover: (ticker: string) => void;
}) {
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

function ModalSelecionarFundo({
  aberto,
  fundos,
  jaAdicionados,
  onSelecionar,
  onFechar,
}: {
  aberto: boolean;
  fundos: Fundo[];
  jaAdicionados: string[];
  onSelecionar: (ticker: string) => void;
  onFechar: () => void;
}) {
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

function ToggleDarkMode() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="relative h-7 w-12 rounded-full border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 transition-colors duration-200"
      aria-label="Alternar tema"
    >
      <div
        className={`absolute inset-0 flex items-center px-0.5 transition-all duration-200 ${theme === "dark" ? "justify-end" : "justify-start"
          }`}
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-slate-955 shadow-sm">
          {theme === "dark" ? (
            <svg className="h-3 w-3 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            <svg className="h-3 w-3 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 7a5 5 0 100 10 5 5 0 000-10zm0-4a1 1 0 011 1v1a1 1 0 11-2 0V4a1 1 0 011-1zm0 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm9-9a1 1 0 010 2h-1a1 1 0 110-2h1zM4 12a1 1 0 010 2H3a1 1 0 110-2h1zm13.07-6.07a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM7.05 14.95a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0z" />
            </svg>
          )}
        </span>
      </div>
    </button>
  );
}

export default function Home() {
  const [fundosDisponiveis, setFundosDisponiveis] = useState<Fundo[]>(FUNDOS_DISPONIVEIS);
  const [valorEmCaixa, setValorEmCaixa] = useState(VALOR_INICIAL_CAIXA);
  const [fundosCarteira, setFundosCarteira] = useState<FundoEmCarteira[]>(
    FUNDOS_INICIAIS_CARTEIRA,
  );
  const [fundosProspeccao, setFundosProspeccao] = useState<FundoProspeccao[]>(
    FUNDOS_INICIAIS_PROSPECCAO,
  );
  const [aporteMensal, setAporteMensal] = useState(APORTE_MENSAL_PADRAO);
  const [tempoMeses, setTempoMeses] = useState(TEMPO_PADRAO_MESES);
  const [tabelaAberta, setTabelaAberta] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<string | null>(null);
  const [modalFundosAberto, setModalFundosAberto] = useState(false);
  const [modalSelecionarAberto, setModalSelecionarAberto] = useState(false);
  const [modalSelecionarProspeccaoAberto, setModalSelecionarProspeccaoAberto] = useState(false);
  const [tooltip, setTooltip] = useState<{ ticker: string; x: number; y: number } | null>(null);

  const patrimonioFIIs = useMemo(
    () =>
      fundosCarteira.reduce((total, item) => {
        const fundo = buscarFundo(fundosDisponiveis, item.ticker);
        return total + (fundo ? fundo.preco * item.quantidade : 0);
      }, 0),
    [fundosCarteira, fundosDisponiveis],
  );

  const pInicial = patrimonioFIIs + valorEmCaixa;

  const fundosSimulados = useMemo((): FundoSimulado[] => {
    const mapa = new Map<string, FundoSimulado>();
    for (const item of fundosCarteira) {
      const fundo = buscarFundo(fundosDisponiveis, item.ticker);
      if (!fundo) continue;
      mapa.set(item.ticker, {
        ticker: item.ticker,
        quantidade: item.quantidade,
        preco: fundo.preco,
        dividendoMensal: fundo.dividendoMensal,
      });
    }
    return Array.from(mapa.values());
  }, [fundosCarteira, fundosDisponiveis]);

  const custoProspeccao = useMemo(
    () =>
      fundosProspeccao.reduce(
        (total, p) => total + p.quantidadeMensal * p.precoEsperado,
        0,
      ),
    [fundosProspeccao],
  );

  const excedeAporte = custoProspeccao > aporteMensal;

  const resultados = useMemo(
    () =>
      calcularProjecao(
        fundosSimulados,
        fundosProspeccao.map((p) => ({
          ticker: p.ticker,
          precoEsperado: p.precoEsperado,
          dividendoEsperado: p.dividendoEsperado,
          quantidadeMensal: p.quantidadeMensal,
        })),
        valorEmCaixa,
        aporteMensal,
        tempoMeses,
      ),
    [fundosSimulados, fundosProspeccao, valorEmCaixa, aporteMensal, tempoMeses],
  );

  const cotasProspeccao = useMemo(
    () =>
      Object.fromEntries(
        fundosProspeccao.map((p) => [p.ticker, p.quantidadeMensal * tempoMeses]),
      ),
    [fundosProspeccao, tempoMeses],
  );

  const totalAportadoProspeccao = useMemo(
    () =>
      fundosProspeccao.reduce(
        (soma, p) => soma + p.quantidadeMensal * p.precoEsperado * tempoMeses,
        0,
      ),
    [fundosProspeccao, tempoMeses],
  );

  const ultimoMes = resultados[resultados.length - 1];
  const totalAportado = totalAportadoProspeccao;
  const dividendoUltimoMes = ultimoMes?.rendimentoMensal ?? 0;

  const anos = Math.floor(tempoMeses / 12);
  const mesesRestantes = tempoMeses % 12;

  const handleTooltipEnter = (e: React.MouseEvent, ticker: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ ticker, x: rect.left + rect.width / 2, y: rect.bottom + 4 });
  };

  const handleTooltipLeave = () => setTooltip(null);

  const fundoTooltip = tooltip
    ? buscarFundo(fundosDisponiveis, tooltip.ticker)
    : null;

  const atualizarQtdCarteira = (ticker: string, quantidade: number) => {
    setFundosCarteira((prev) =>
      prev.map((f) => (f.ticker === ticker ? { ...f, quantidade } : f)),
    );
  };

  const confirmarRemocao = (ticker: string) => setConfirmandoExclusao(ticker);
  const cancelarRemocao = () => setConfirmandoExclusao(null);

  const removerDaCarteira = (ticker: string) => {
    setFundosCarteira((prev) => prev.filter((f) => f.ticker !== ticker));
    setConfirmandoExclusao(null);
  };

  const adicionarNaCarteira = (ticker: string) => {
    setFundosCarteira((prev) => [...prev, { ticker, quantidade: 1 }]);
  };

  const adicionarNaProspeccao = (ticker: string) => {
    const fundo = buscarFundo(fundosDisponiveis, ticker);
    if (!fundo) return;
    setFundosProspeccao((prev) => [
      ...prev,
      {
        ticker: fundo.ticker,
        precoEsperado: fundo.preco,
        dividendoEsperado: fundo.dividendoMensal,
        quantidadeMensal: 1,
      },
    ]);
  };

  const atualizarProspeccao = (ticker: string, quantidadeMensal: number) => {
    setFundosProspeccao((prev) =>
      prev.map((f) =>
        f.ticker === ticker ? { ...f, quantidadeMensal } : f,
      ),
    );
  };

  const removerDaProspeccao = (ticker: string) => {
    setFundosProspeccao((prev) => prev.filter((f) => f.ticker !== ticker));
  };

  const adicionarFundoBase = (fundo: Fundo) => {
    setFundosDisponiveis((prev) => {
      if (prev.some((f) => f.ticker.toUpperCase() === fundo.ticker.toUpperCase())) {
        return prev;
      }
      return [...prev, fundo];
    });
  };

  const editarFundoBase = (ticker: string, fundo: Fundo) => {
    setFundosDisponiveis((prev) =>
      prev.map((f) => (f.ticker === ticker ? fundo : f)),
    );
  };

  const removerFundoBase = (ticker: string) => {
    setFundosDisponiveis((prev) => prev.filter((f) => f.ticker !== ticker));
    setFundosCarteira((prev) => prev.filter((f) => f.ticker !== ticker));
    setFundosProspeccao((prev) => prev.filter((f) => f.ticker !== ticker));
  };

  const tickersNaCarteira = fundosCarteira.map((f) => f.ticker);
  const tickersNaProspeccao = fundosProspeccao.map((f) => f.ticker);
  const tickersJaAlocados = [...tickersNaCarteira, ...tickersNaProspeccao];

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 transition-colors duration-200">
      <ModalGerenciarFundos
        aberto={modalFundosAberto}
        fundos={fundosDisponiveis}
        onFechar={() => setModalFundosAberto(false)}
        onAdicionar={adicionarFundoBase}
        onEditar={editarFundoBase}
        onRemover={removerFundoBase}
      />
      <ModalSelecionarFundo
        aberto={modalSelecionarAberto}
        fundos={fundosDisponiveis}
        jaAdicionados={tickersNaCarteira}
        onSelecionar={adicionarNaCarteira}
        onFechar={() => setModalSelecionarAberto(false)}
      />
      <ModalSelecionarFundo
        aberto={modalSelecionarProspeccaoAberto}
        fundos={fundosDisponiveis}
        jaAdicionados={tickersNaProspeccao}
        onSelecionar={adicionarNaProspeccao}
        onFechar={() => setModalSelecionarProspeccaoAberto(false)}
      />

      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
              Calculadora de Prospecção - FIIs
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Simule o crescimento do seu patrimônio com reinvestimento de dividendos
            </p>
          </div>
          <ToggleDarkMode />
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Valor em Caixa
              </h2>
              <input
                type="number"
                step="0.01"
                min="0"
                value={valorEmCaixa}
                onChange={(e) => setValorEmCaixa(Number(e.target.value))}
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Carteira Atual
                </h2>
                <button
                  onClick={() => setModalFundosAberto(true)}
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
                        onMouseEnter={(e) => handleTooltipEnter(e, item.ticker)}
                        onMouseLeave={handleTooltipLeave}
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
                          atualizarQtdCarteira(
                            item.ticker,
                            Math.max(0, Number(e.target.value)),
                          )
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
                              onClick={() => removerDaCarteira(item.ticker)}
                              className="rounded-lg p-1.5 text-emerald-500 transition-all duration-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                              title="Confirmar exclusão"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={cancelarRemocao}
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
                            onClick={() => confirmarRemocao(item.ticker)}
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
                {fundosCarteira.length > 0 && (
                  <button
                    onClick={() => setModalSelecionarAberto(true)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 px-3 py-2.5 text-sm text-slate-500 dark:text-slate-400 transition-all duration-200 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Adicionar fundo
                  </button>
                )}
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

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Aporte Mensal
              </h2>
              <input
                type="number"
                step="0.01"
                min="0"
                value={aporteMensal}
                onChange={(e) => setAporteMensal(Number(e.target.value))}
                className="mt-1 block w-full rounded-lg border-2 border-indigo-300 dark:border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

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
                          onClick={() => removerDaProspeccao(item.ticker)}
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
                              atualizarProspeccao(
                                item.ticker,
                                Math.max(0, Number(e.target.value)),
                              )
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
                  onClick={() => setModalSelecionarProspeccaoAberto(true)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 px-3 py-2.5 text-sm text-slate-500 dark:text-slate-400 transition-all duration-200 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Adicionar fundo para prospecção
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Período de Investimento
              </h2>
              <p className="mb-3 text-xs text-slate-400 dark:text-slate-500">
                Defina por quantos meses você pretende manter os aportes e reinvestir os dividendos
              </p>
              <div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="600"
                    value={tempoMeses}
                    onChange={(e) => setTempoMeses(Number(e.target.value))}
                    className="flex-1 accent-indigo-600"
                  />
                  <input
                    type="number"
                    min="1"
                    max="600"
                    value={tempoMeses}
                    onChange={(e) => setTempoMeses(Number(e.target.value))}
                    className="w-20 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                  {tempoMeses} {tempoMeses === 1 ? "mês" : "meses"} de simulação
                  {tempoMeses >= 12 &&
                    ` — ${anos} ${anos === 1 ? "ano" : "anos"}${mesesRestantes > 0
                      ? ` e ${mesesRestantes} ${mesesRestantes === 1 ? "mês" : "meses"}`
                      : ""
                    }`}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/50 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Patrimônio Inicial Total
              </p>
              <p className="mt-1 text-3xl font-bold font-mono text-slate-900 dark:text-slate-100">
                {formatCurrency(pInicial)}
              </p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                {formatCurrency(patrimonioFIIs)} em FIIs + {formatCurrency(valorEmCaixa)} em caixa
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total do Bolso
                </p>
                <p className="mt-2 text-2xl font-bold font-mono text-slate-700 dark:text-slate-300 lg:text-3xl">
                  {formatCurrency(totalAportado)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Patrimônio Projetado
                </p>
                <p className="mt-2 text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 lg:text-3xl">
                  {ultimoMes ? formatCurrency(ultimoMes.patrimonioAcumulado) : "R$ 0,00"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Último Rendimento
                </p>
                <p className="mt-2 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 lg:text-3xl">
                  {formatCurrency(dividendoUltimoMes)}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
              <button
                onClick={() => setTabelaAberta(!tabelaAberta)}
                className="flex w-full items-center justify-between px-6 py-4 text-left transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Detalhamento Mês a Mês
                </h2>
                <svg
                  className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${tabelaAberta ? "rotate-180" : ""
                    }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {tabelaAberta && (
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
          </div>
        </div>
      </div>

      {tooltip && fundoTooltip && (
        <div
          className="fixed z-50 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 shadow-lg"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translateX(-50%)",
          }}
        >
          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{fundoTooltip.nome}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{fundoTooltip.segmento}</p>
          <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">
            Rend. {(rendimentoPercentual(fundoTooltip.preco, fundoTooltip.dividendoMensal) * 100).toFixed(2)}% a.m.
          </p>
        </div>
      )}
    </div>
  );
}
