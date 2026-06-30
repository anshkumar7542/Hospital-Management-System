import { Trash2 } from 'lucide-react';
import { Card, SectionTitle } from './Card.jsx';

const normalizeRow = (row) => {
  if (Array.isArray(row)) return { id: row.join('-'), cells: row, raw: row };
  return { id: row.id, cells: row.cells || [], raw: row.raw || row, optimistic: row.optimistic };
};

export function DataTable({ title, subtitle, columns, rows, action = 'Export', onDelete, deletingLabel = 'Delete' }) {
  const normalizedRows = rows.map(normalizeRow);
  const hasActions = Boolean(onDelete);

  return (
    <Card className="overflow-hidden">
      <SectionTitle title={title} subtitle={subtitle} action={action} />
      <div className="-mx-5 overflow-x-auto sm:-mx-6">
        <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} className="border-y bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400 sm:px-6">
                  {column}
                </th>
              ))}
              {hasActions && (
                <th className="border-y bg-slate-50 px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400 sm:px-6">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {normalizedRows.map((row) => (
              <tr key={row.id} className={`group transition ${row.optimistic ? 'opacity-60' : ''}`}>
                {row.cells.map((cell, index) => (
                  <td key={`${cell}-${index}`} className="border-b px-5 py-4 text-sm dark:border-white/10 sm:px-6">
                    <span className={index === 0 ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}>{cell}</span>
                  </td>
                ))}
                {hasActions && (
                  <td className="border-b px-5 py-4 text-right text-sm dark:border-white/10 sm:px-6">
                    <button
                      type="button"
                      onClick={() => onDelete(row.raw.id)}
                      disabled={!row.raw.id || String(row.raw.id).startsWith('tmp-')}
                      className="inline-flex h-9 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
                      aria-label={`${deletingLabel} ${row.cells[0] || 'record'}`}
                    >
                      <Trash2 size={15} />
                      {deletingLabel}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
