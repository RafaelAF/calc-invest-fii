import type { FundoSimulado } from "./types";

export interface DadosMes {
  mes: number;
  totalAportado: number;
  prospeccaoMes: number;
  patrimonioAcumulado: number;
  rendimentoMensal: number;
}

interface FundoProspeccaoInput {
  ticker: string;
  precoEsperado: number;
  dividendoEsperado: number;
  quantidadeMensal: number;
  autocompra: boolean;
}

export function calcularProjecao(
  fundosCarteira: FundoSimulado[],
  fundosProspeccao: FundoProspeccaoInput[],
  caixaInicial: number,
  aporteMensal: number,
  totalMeses: number,
): DadosMes[] {
  const portfolio: FundoSimulado[] = fundosCarteira.map((f) => ({ ...f }));
  let caixa = caixaInicial;
  const historico: DadosMes[] = [];
  let totalAportado = 0;
  const prospeccaoAtivos = fundosProspeccao.filter((p) => p.quantidadeMensal > 0 && p.precoEsperado > 0);

  for (let mes = 1; mes <= totalMeses; mes++) {
    let totalDividendos = 0;
    for (const fundo of portfolio) {
      totalDividendos += fundo.quantidade * fundo.dividendoMensal;
    }

    caixa += totalDividendos + aporteMensal;

    let gastoProspeccao = 0;

    for (const prosp of prospeccaoAtivos) {
      if (caixa <= 0) break;
      const custoTotal = prosp.quantidadeMensal * prosp.precoEsperado;

      if (custoTotal <= caixa) {
        const idx = portfolio.findIndex((p) => p.ticker === prosp.ticker);
        if (idx >= 0) {
          portfolio[idx].quantidade += prosp.quantidadeMensal;
        } else {
          portfolio.push({
            ticker: prosp.ticker,
            quantidade: prosp.quantidadeMensal,
            preco: prosp.precoEsperado,
            dividendoMensal: prosp.dividendoEsperado,
          });
        }
        caixa -= custoTotal;
        totalAportado += custoTotal;
        gastoProspeccao += custoTotal;
      } else {
        const cotasCompradas = Math.floor(caixa / prosp.precoEsperado);
        if (cotasCompradas > 0) {
          const custo = cotasCompradas * prosp.precoEsperado;
          const idx = portfolio.findIndex((p) => p.ticker === prosp.ticker);
          if (idx >= 0) {
            portfolio[idx].quantidade += cotasCompradas;
          } else {
            portfolio.push({
              ticker: prosp.ticker,
              quantidade: cotasCompradas,
              preco: prosp.precoEsperado,
              dividendoMensal: prosp.dividendoEsperado,
            });
          }
          caixa -= custo;
          totalAportado += custo;
          gastoProspeccao += custo;
        }
      }
    }

    for (const prosp of prospeccaoAtivos) {
      if (!prosp.autocompra) continue;
      if (caixa <= 0) break;
      const cotasCompradas = Math.floor(caixa / prosp.precoEsperado);
      if (cotasCompradas > 0) {
        const custo = cotasCompradas * prosp.precoEsperado;
        const idx = portfolio.findIndex((p) => p.ticker === prosp.ticker);
        if (idx >= 0) {
          portfolio[idx].quantidade += cotasCompradas;
        } else {
          portfolio.push({
            ticker: prosp.ticker,
            quantidade: cotasCompradas,
            preco: prosp.precoEsperado,
            dividendoMensal: prosp.dividendoEsperado,
          });
        }
        caixa -= custo;
        totalAportado += custo;
        gastoProspeccao += custo;
      }
    }

    let patrimonioFundos = 0;
    for (const fundo of portfolio) {
      patrimonioFundos += fundo.quantidade * fundo.preco;
    }

    historico.push({
      mes,
      totalAportado: Number(totalAportado.toFixed(2)),
      prospeccaoMes: Number(gastoProspeccao.toFixed(2)),
      patrimonioAcumulado: Number(patrimonioFundos.toFixed(2)),
      rendimentoMensal: Number(totalDividendos.toFixed(2)),
    });
  }

  return historico;
}
