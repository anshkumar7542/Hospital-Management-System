import { RefreshCcw, SearchX, ServerCrash } from 'lucide-react';

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="surface rounded-3xl p-5 sm:p-6">
      <div className="mb-5 h-5 w-48 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
      <div className="grid gap-3">
        {Array.from({ length: rows }).map((_, row) => (
          <div className="grid gap-3 sm:grid-cols-4" key={row}>
            {Array.from({ length: columns }).map((__, column) => (
              <div className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-white/5" key={column} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ErrorState({ title = 'Unable to load data', message, onRetry }) {
  return (
    <div className="surface rounded-3xl p-8 text-center">
      <ServerCrash className="mx-auto text-rose-500" size={32} />
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">{message}</p>
      {onRetry && (
        <button className="mt-5 inline-flex h-10 items-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white dark:bg-white dark:text-slate-950" onClick={onRetry}>
          <RefreshCcw size={16} />
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title = 'No records found', message = 'Adjust search or filters to find records.' }) {
  return (
    <div className="surface rounded-3xl p-8 text-center">
      <SearchX className="mx-auto text-slate-400" size={32} />
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}
