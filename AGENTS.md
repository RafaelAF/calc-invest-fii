# Contexto do Agente: Calculadora de Prospecção de FIIs com Sobra de Caixa

Você é um engenheiro de software especialista em React, Next.js (App Router), Tailwind CSS e TypeScript. Seu objetivo é me ajudar a construir uma interface interativa, responsiva e visualmente atraente para uma Calculadora de Prospecção de Fundos Imobiliários (FIIs), com simulação fundo-a-fundo e reinvestimento estrito de dividendos baseado em cotas inteiras.

---

## 1. Dados e Premissas Iniciais (Seed Data)

A aplicação deve inicializar os seus estados nativos com os seguintes dados de simulação:
- **Carteira Inicial:** 300 cotas do fundo `XPLG11` (Preço base: R$ 10,00 | Dividendo mensal por cota: R$ 0,10)
- **Valor em Caixa Inicial ($C$):** R$ 5,00
- **Aporte Mensal Novo ($A_m$):** R$ 500,00
- **Tempo Padrão da Projeção ($t$):** 240 meses (20 anos)
- **Metas de Prospecção Inicial:** - `XPLG11`: 2 cotas/mês
  - `KNRI11`: 1 cota/mês
  - `HGLG11`: 1 cota/mês

---

## 2. Lógica de Cálculo e Regras de Negócio (`lib/calculations.ts`)

A função `calcularProjecao` deve rodar de forma pura e simular o fluxo cronológico mês a mês. 

### Regra Fundamental de FIIs: Não existem cotas fracionadas
Todo o dinheiro que entra no caixa (aportes + dividendos) só pode ser transformado em patrimônio se for suficiente para comprar **uma cota inteira**. Caso contrário, o valor residual permanece retido no caixa ("troco") acumulando para o mês seguinte.

```
typescript
export interface DadosMes {
  mes: number;
  totalAportadoBolso: number;  // Dinheiro real que saiu do bolso (Caixa Inicial + Aporte * mes)
  patrimonioAcumulado: number; // Soma do valor de mercado de todas as cotas (quantidade × preco) de todos os fundos
  rendimentoMensal: number;    // Total de dividendos recebidos no mês atual (pinga-pinga)
  caixaRestante: number;       // Saldo em caixa ocioso que sobrou para o mês seguinte
}
```

Regras:
- **Dividendos reais** de cada fundo: `quantidade × dividendoMensal`
- Caixa recebe dividendos + aporte mensal
- **Compra fundos em prospecção** (limitado ao caixa disponível, compra parcial se necessário)
- **Patrimônio** reflete apenas o valor investido em cotas, sem incluir caixa ocioso
- Rendimento percentual calculado dinamicamente: `dividendo / preco`

---

## 3. Regras de UI e Comportamento

### Layout
- Mobile: coluna única, empilhado verticalmente
- Desktop: `lg:grid-cols-3` (inputs à esquerda, resultados à direita)

### Temas
- Dark mode por classe `.dark` no `<html>`, alternado por switch no header
- Persistido em `localStorage`, fallback para `prefers-color-scheme`
- Inline script anti-flash no `<head>` (`layout.tsx`)

### Modal de Gerenciamento de Fundos
- CRUD completo na base global de fundos
- **Validação**: não permite cadastrar fundo com nome duplicado (case-insensitive)
- Exclusão não precisa de confirmação dupla (confirmação dupla é só na carteira)

### Modal de Seleção
- Busca por nome/ticker
- Fundos já alocados (carteira ou prospecção) ficam desabilitados

### Prospecção (cards)
- Grid de 3 colunas: **Preço**, **Dividendo/cota**, **Rend.%**
- Campo **Cotas/mês** editável (único campo editável)
- Subtítulo ao final: `R$ X/mês · Y cotas` (total de cotas acumuladas no período)
- Se custo total da prospecção excede aporte, aviso em amarelo é exibido
- Exclusão de fundo da prospecção: ícone X no canto superior direito

### Carteira
- Quantidade editável por input
- Exclusão com **dupla confirmação**: ícone lixeira → ✓ confirmar / ✕ cancelar
- Tooltip no hover do ticker mostra detalhes do fundo

### Input de Aporte Mensal
- Destacado com `border-2 border-indigo-300` e fundo `bg-indigo-50/50`

### KPIs (3 cards)
1. **Total do Bolso** — soma de `quantidade × preco × meses` da prospecção
2. **Patrimônio Projetado** — valor final da simulação (apenas cotas)
3. **Último Rendimento** — total de dividendos no último mês

### Tabela
- Colunas: **Mês** | **Total Investido** | **Rendimento** | **Patrimônio**
- Cabeçalho escuro `bg-slate-900 text-white`, linhas zebradas
- Expansível por accordion com seta giratória

### Geral
- Cálculo automático via `useMemo` (sem botão "Calcular")
- Modais fecham com clique no backdrop
- Botões "Cancelar" com hover vermelho
- Microinterações: `transition-all duration-200`
- Valores `NaN`/`Infinity` tratados como `R$ 0,00` ou `--`

---

## 4. Estrutura de Arquivos Relevantes

- `lib/types.ts` — interfaces `Fundo`, `FundoEmCarteira`, `FundoProspeccao`, `FundoSimulado`, `rendimentoPercentual`
- `lib/funds-database.ts` — base com 10 FIIs (HGLG11, KNRI11, XPLG11, MXRF11, BCFF11, KNIP11, VISC11, IRDM11, RBRR11, HFOF11)
- `lib/data.ts` — constantes de inicialização
- `lib/calculations.ts` — `calcularProjecao` (núcleo da simulação)
- `lib/theme-context.tsx` — `ThemeProvider` + `useTheme`
- `app/globals.css` — `@custom-variant dark`
- `app/layout.tsx` — layout root com anti-flash
- `app/page.tsx` — ~1000 linhas, toda a interface
