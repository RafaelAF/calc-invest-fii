"use client";

import { useState, useMemo, useEffect } from "react";
import type { Fundo, FundoEmCarteira, FundoProspeccao, FundoSimulado } from "@/lib/types";
import { FUNDOS_DISPONIVEIS } from "@/lib/funds-database";
import {
  VALOR_INICIAL_CAIXA,
  FUNDOS_INICIAIS_CARTEIRA,
  FUNDOS_INICIAIS_PROSPECCAO,
  APORTE_MENSAL_PADRAO,
  TEMPO_PADRAO_MESES,
} from "@/lib/data";
import { calcularProjecao } from "@/lib/calculations";
import { formatCurrency, buscarFundo } from "@/lib/utils";
import { carregarDados, salvarDados } from "@/lib/storage";

import ModalGerenciarFundos from "@/components/ModalGerenciarFundos";
import ModalSelecionarFundo from "@/components/ModalSelecionarFundo";
import ToggleDarkMode from "@/components/ToggleDarkMode";
import CarteiraCard from "@/components/CarteiraCard";
import ProspeccaoCard from "@/components/ProspeccaoCard";
import KPICards from "@/components/KPICards";
import TabelaDetalhamento from "@/components/TabelaDetalhamento";
import TooltipFundo from "@/components/TooltipFundo";

export default function Home() {
  const [fundosDisponiveis, setFundosDisponiveis] = useState<Fundo[]>(() => carregarDados().fundosDisponiveis);
  const [valorEmCaixa, setValorEmCaixa] = useState(() => carregarDados().valorEmCaixa);
  const [fundosCarteira, setFundosCarteira] = useState<FundoEmCarteira[]>(() => carregarDados().fundosCarteira);
  const [fundosProspeccao, setFundosProspeccao] = useState<FundoProspeccao[]>(() => carregarDados().fundosProspeccao);
  const [aporteMensal, setAporteMensal] = useState(() => carregarDados().aporteMensal);
  const [tempoMeses, setTempoMeses] = useState(() => carregarDados().tempoMeses);
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
      fundosProspeccao.reduce((total, p) => total + p.quantidadeMensal * p.precoEsperado, 0),
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
          autocompra: p.autocompra,
        })),
        valorEmCaixa,
        aporteMensal,
        tempoMeses,
      ),
    [fundosSimulados, fundosProspeccao, valorEmCaixa, aporteMensal, tempoMeses],
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

  const fundoTooltip = tooltip ? buscarFundo(fundosDisponiveis, tooltip.ticker) : null;

  const atualizarQtdCarteira = (ticker: string, quantidade: number) =>
    setFundosCarteira((prev) => prev.map((f) => (f.ticker === ticker ? { ...f, quantidade } : f)));
  const confirmarRemocao = (ticker: string) => setConfirmandoExclusao(ticker);
  const cancelarRemocao = () => setConfirmandoExclusao(null);
  const removerDaCarteira = (ticker: string) => {
    setFundosCarteira((prev) => prev.filter((f) => f.ticker !== ticker));
    setConfirmandoExclusao(null);
  };
  const adicionarNaCarteira = (ticker: string) =>
    setFundosCarteira((prev) => [...prev, { ticker, quantidade: 1 }]);

  const adicionarNaProspeccao = (ticker: string) => {
    const fundo = buscarFundo(fundosDisponiveis, ticker);
    if (!fundo) return;
    setFundosProspeccao((prev) => [
      ...prev,
      { ticker: fundo.ticker, precoEsperado: fundo.preco, dividendoEsperado: fundo.dividendoMensal, quantidadeMensal: 1, autocompra: false },
    ]);
  };
  const atualizarProspeccao = (ticker: string, quantidadeMensal: number) =>
    setFundosProspeccao((prev) => prev.map((f) => (f.ticker === ticker ? { ...f, quantidadeMensal } : f)));
  const toggleAutocompra = (ticker: string, autocompra: boolean) =>
    setFundosProspeccao((prev) => prev.map((f) => (f.ticker === ticker ? { ...f, autocompra } : f)));
  const removerDaProspeccao = (ticker: string) =>
    setFundosProspeccao((prev) => prev.filter((f) => f.ticker !== ticker));

  const adicionarFundoBase = (fundo: Fundo) =>
    setFundosDisponiveis((prev) =>
      prev.some((f) => f.ticker.toUpperCase() === fundo.ticker.toUpperCase()) ? prev : [...prev, fundo],
    );
  const editarFundoBase = (ticker: string, fundo: Fundo) =>
    setFundosDisponiveis((prev) => prev.map((f) => (f.ticker === ticker ? fundo : f)));
  const removerFundoBase = (ticker: string) => {
    setFundosDisponiveis((prev) => prev.filter((f) => f.ticker !== ticker));
    setFundosCarteira((prev) => prev.filter((f) => f.ticker !== ticker));
    setFundosProspeccao((prev) => prev.filter((f) => f.ticker !== ticker));
  };

  useEffect(() => {
    salvarDados({ fundosDisponiveis, valorEmCaixa, fundosCarteira, fundosProspeccao, aporteMensal, tempoMeses });
  }, [fundosDisponiveis, valorEmCaixa, fundosCarteira, fundosProspeccao, aporteMensal, tempoMeses]);

  const tickersNaCarteira = fundosCarteira.map((f) => f.ticker);
  const tickersNaProspeccao = fundosProspeccao.map((f) => f.ticker);

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

            <CarteiraCard
              fundosDisponiveis={fundosDisponiveis}
              fundosCarteira={fundosCarteira}
              confirmandoExclusao={confirmandoExclusao}
              patrimonioFIIs={patrimonioFIIs}
              onAtualizarQtd={atualizarQtdCarteira}
              onConfirmarRemocao={confirmarRemocao}
              onCancelarRemocao={cancelarRemocao}
              onRemover={removerDaCarteira}
              onAbrirGestao={() => setModalFundosAberto(true)}
              onAbrirSelecao={() => setModalSelecionarAberto(true)}
              onTooltipEnter={handleTooltipEnter}
              onTooltipLeave={handleTooltipLeave}
            />

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

            <ProspeccaoCard
              fundosProspeccao={fundosProspeccao}
              custoProspeccao={custoProspeccao}
              excedeAporte={excedeAporte}
              aporteMensal={aporteMensal}
              onAtualizar={atualizarProspeccao}
              onToggleAutocompra={toggleAutocompra}
              onRemover={removerDaProspeccao}
              onAbrirSelecao={() => setModalSelecionarProspeccaoAberto(true)}
            />

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

            <KPICards
              totalAportado={totalAportado}
              patrimonioProjetado={ultimoMes?.patrimonioAcumulado ?? 0}
              ultimoRendimento={dividendoUltimoMes}
            />

            <TabelaDetalhamento
              resultados={resultados}
              aberta={tabelaAberta}
              onToggle={() => setTabelaAberta(!tabelaAberta)}
            />
          </div>
        </div>
      </div>

      <footer className="mx-auto mt-12 max-w-7xl border-t border-slate-200 dark:border-slate-800 pt-6 pb-8">
        <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed text-center">
          Esta calculadora é apenas uma ferramenta de simulação. Os dados exibidos são estáticos e não
          representam valores reais de mercado. Nenhum dado pessoal é armazenado ou compartilhado (LGPD).
          Alguns valores podem não estar 100% corretos — futuramente a calculadora receberá ajustes e
          melhorias.
        </p>
      </footer>

      <TooltipFundo tooltip={tooltip} fundo={fundoTooltip} />
    </div>
  );
}
