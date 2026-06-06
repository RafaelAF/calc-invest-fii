export interface Fundo {
  ticker: string;
  nome: string;
  segmento: string;
  preco: number;
  dividendoMensal: number;
}

export interface FundoEmCarteira {
  ticker: string;
  quantidade: number;
}

export interface FundoProspeccao {
  ticker: string;
  precoEsperado: number;
  dividendoEsperado: number;
  quantidadeMensal: number;
}

export interface FundoSimulado {
  ticker: string;
  quantidade: number;
  preco: number;
  dividendoMensal: number;
}

export function rendimentoPercentual(preco: number, dividendo: number): number {
  return preco > 0 ? dividendo / preco : 0;
}
