import type { Fundo, FundoEmCarteira, FundoProspeccao } from "./types";
import { FUNDOS_DISPONIVEIS } from "./funds-database";
import {
  VALOR_INICIAL_CAIXA,
  FUNDOS_INICIAIS_CARTEIRA,
  FUNDOS_INICIAIS_PROSPECCAO,
  APORTE_MENSAL_PADRAO,
  TEMPO_PADRAO_MESES,
} from "./data";

const STORAGE_KEY = "calc-invest-data";

interface DadosPersistidos {
  fundosDisponiveis: Fundo[];
  valorEmCaixa: number;
  fundosCarteira: FundoEmCarteira[];
  fundosProspeccao: FundoProspeccao[];
  aporteMensal: number;
  tempoMeses: number;
}

function migrarDados(dados: Partial<DadosPersistidos>): DadosPersistidos {
  return {
    fundosDisponiveis: dados.fundosDisponiveis ?? FUNDOS_DISPONIVEIS,
    valorEmCaixa: dados.valorEmCaixa ?? VALOR_INICIAL_CAIXA,
    fundosCarteira: dados.fundosCarteira ?? FUNDOS_INICIAIS_CARTEIRA,
    fundosProspeccao: (dados.fundosProspeccao ?? FUNDOS_INICIAIS_PROSPECCAO).map((f) => ({
      ...f,
      autocompra: f.autocompra ?? false,
    })),
    aporteMensal: dados.aporteMensal ?? APORTE_MENSAL_PADRAO,
    tempoMeses: dados.tempoMeses ?? TEMPO_PADRAO_MESES,
  };
}

export function carregarDados(): DadosPersistidos {
  if (typeof window === "undefined") return migrarDados({});
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaults = migrarDados({});
      salvarDados(defaults);
      return defaults;
    }
    const parsed = JSON.parse(raw) as Partial<DadosPersistidos>;
    return migrarDados(parsed);
  } catch {
    const defaults = migrarDados({});
    salvarDados(defaults);
    return defaults;
  }
}

export function salvarDados(dados: DadosPersistidos): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
  } catch {
    /* storage cheio ou indisponível */
  }
}
