import React from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ message, onDismiss, retry }) => {
  if (!message) return null;

  return (
    <div className="bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200 px-4 py-3.5 rounded-2xl flex items-center justify-between gap-3 my-3 shadow-2xs animate-in fade-in duration-150">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-rose-900 dark:text-rose-200">Operation Notice</p>
          <p className="text-xs font-medium text-rose-700 dark:text-rose-300 mt-0.5">{message}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {retry && (
          <button
            onClick={retry}
            className="flex items-center gap-1.5 text-xs font-bold bg-white dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-slate-700 text-rose-800 dark:text-rose-200 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800/60 transition cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-rose-400 hover:text-rose-700 dark:hover:text-rose-200 p-1.5 rounded-lg hover:bg-rose-100/60 dark:hover:bg-rose-900/30 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
