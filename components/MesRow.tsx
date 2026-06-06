import type { DadosMes } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";

export default function MesRow({ mes }: { mes: DadosMes }) {
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
