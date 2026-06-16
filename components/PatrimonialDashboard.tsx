"use client";

import { useMemo, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import type { DadosMes } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";

interface Props {
  resultados: DadosMes[];
}

export default function PatrimonialDashboard({ resultados }: Props) {
  const [visaoAnual, setVisaoAnual] = useState(false);

  const ultimo = resultados[resultados.length - 1];
  const patrimonioProjetado = ultimo?.patrimonioAcumulado ?? 0;
  const totalRendimentos = useMemo(
    () => resultados.reduce((sum, r) => sum + r.rendimentoMensal, 0),
    [resultados],
  );
  const valorInvestido = Math.max(0, Number((patrimonioProjetado - totalRendimentos).toFixed(2)));

  const pieData = useMemo(
    () => [
      { name: "Valor Investido", value: valorInvestido, color: "#6366f1" },
      { name: "Rendimentos", value: Number(totalRendimentos.toFixed(2)), color: "#10b981" },
    ],
    [valorInvestido, totalRendimentos],
  );

  const dadosMensais = useMemo(
    () => resultados.map((r) => ({
      label: `${r.mes}`,
      rendimento: Number(r.rendimentoMensal.toFixed(2)),
    })),
    [resultados],
  );

  const dadosAnuais = useMemo(() => {
    const anos: { label: string; rendimento: number }[] = [];
    for (let i = 0; i < resultados.length; i += 12) {
      const ano = Math.floor(i / 12) + 1;
      const slice = resultados.slice(i, i + 12);
      const total = slice.reduce((s, r) => s + r.rendimentoMensal, 0);
      anos.push({ label: `Ano ${ano}`, rendimento: Number(total.toFixed(2)) });
    }
    return anos;
  }, [resultados]);

  const dadosGrafico = visaoAnual ? dadosAnuais : dadosMensais;

  const monthlyInterval = Math.max(Math.floor(dadosMensais.length / 24), 1);

  if (!resultados.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Dashboard de Evolução Patrimonial
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col items-center">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 self-start">
            Investido vs Rendimentos
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(Number(value) || 0),
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0 bg-slate-400" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap leading-tight">
                  Valor Investido
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono leading-tight">
                  {formatCurrency(valorInvestido)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0 bg-emerald-500" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap leading-tight">
                  Rendimentos
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono leading-tight">
                  {formatCurrency(totalRendimentos)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0 bg-indigo-500" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap leading-tight">
                  Patrimônio Projetado
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono leading-tight">
                  {formatCurrency(patrimonioProjetado)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Evolução do Rendimento
            </h3>
            <button
              onClick={() => setVisaoAnual(!visaoAnual)}
              className="text-xs px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
            >
              {visaoAnual ? "Mensal" : "Anual"}
            </button>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dadosGrafico} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                interval={visaoAnual ? 0 : monthlyInterval}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(Number(value) || 0),
                  visaoAnual ? "Rendimento Anual" : "Rendimento Mensal",
                ]}
              />
              <Bar
                dataKey="rendimento"
                fill={visaoAnual ? "#10b981" : "#6366f1"}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
