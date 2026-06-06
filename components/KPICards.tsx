import { formatCurrency } from "@/lib/utils";

interface Props {
  totalAportado: number;
  patrimonioProjetado: number;
  ultimoRendimento: number;
}

export default function KPICards({
  totalAportado,
  patrimonioProjetado,
  ultimoRendimento,
}: Props) {
  return (
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
          {formatCurrency(patrimonioProjetado)}
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Último Rendimento
        </p>
        <p className="mt-2 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 lg:text-3xl">
          {formatCurrency(ultimoRendimento)}
        </p>
      </div>
    </div>
  );
}
