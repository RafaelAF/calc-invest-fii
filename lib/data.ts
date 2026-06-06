import type { FundoEmCarteira, FundoProspeccao } from "./types";

export const VALOR_INICIAL_CAIXA = 3.31;

export const FUNDOS_INICIAIS_CARTEIRA: FundoEmCarteira[] = [
  { ticker: "HGLG11", quantidade: 10 },
  { ticker: "KNRI11", quantidade: 5 },
  { ticker: "MXRF11", quantidade: 50 },
];

export const FUNDOS_INICIAIS_PROSPECCAO: FundoProspeccao[] = [
  { ticker: "XPLG11", precoEsperado: 95.40, dividendoEsperado: 0.69, quantidadeMensal: 2 },
  { ticker: "VISC11", precoEsperado: 110.40, dividendoEsperado: 0.75, quantidadeMensal: 2 },
];

export const APORTE_MENSAL_PADRAO = 500.00;
export const TEMPO_PADRAO_MESES = 240;
