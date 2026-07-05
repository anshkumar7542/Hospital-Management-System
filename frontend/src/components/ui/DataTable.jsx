import { Trash2 } from 'lucide-react';
import { Card, SectionTitle } from './Card.jsx';

const normalizeRow = (row) => {
  if (Array.isArray(row)) return { id: row.join('-'), cells: row, raw: row };
  return { id: row.id, cells: row.cells || [], raw: row.raw || row, optimistic: row.optimistic };
};

export function DataTable({ title, subtitle, columns, rows, action = 'Export', onDelete, deletingLabel = 'Delete', onRowAction, rowActionLabel, rowActionDisabled, onRowClick }) {
  const normalizedRows = rows.map(normalizeRow);
  const hasActions = Boolean(onDelete) || Boolean(onRowAction);

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
              <tr
                key={row.id}
                className={`group transition ${row.optimistic ? 'opacity-60' : ''} ${onRowClick ? 'cursor-pointer hover:bg-slate-50/80 dark:hover:bg-white/5' : ''}`}
                onClick={() => onRowClick?.(row.raw)}
              >
                {row.cells.map((cell, index) => (
                  <td key={`${cell}-${index}`} className="border-b px-5 py-4 text-sm dark:border-white/10 sm:px-6">
                    <span className={index === 0 ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}>{cell}</span>
                  </td>
                ))}
                {hasActions && (
                  <td className="border-b px-5 py-4 text-right text-sm dark:border-white/10 sm:px-6">
                    {onDelete && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDelete(row.raw.id);
                        }}
                        disabled={!row.raw.id || String(row.raw.id).startsWith('tmp-')}
                        className="inline-flex h-9 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
                        aria-label={`${deletingLabel} ${row.cells[0] || 'record'}`}
                      >
                        <Trash2 size={15} />
                        {deletingLabel}
                      </button>
                    )}

                    {onRowAction && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onRowAction(row.raw);
                        }}
                        disabled={rowActionDisabled ? rowActionDisabled(row.raw) : (!row.raw.id || row.raw.status !== 'pending')}
                        className="ml-2 inline-flex h-9 items-center gap-2 rounded-xl border bg-sky-50 px-3 text-sm font-medium text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200"
                        aria-label={`${rowActionLabel || 'Action'} ${row.cells[0] || 'record'}`}
                      >
                        {rowActionLabel || 'Action'}
                      </button>
                    )}
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
