import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!message) return;

    const intervalTime = 50;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const styles = {
    success: 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800/60 text-slate-800 dark:text-slate-100 shadow-emerald-500/10',
    error: 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-800/60 text-slate-800 dark:text-slate-100 shadow-rose-500/10',
    warning: 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-800/60 text-slate-800 dark:text-slate-100 shadow-amber-500/10',
    info: 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800/60 text-slate-800 dark:text-slate-100 shadow-indigo-500/10',
  };

  const barColors = {
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    warning: 'bg-amber-500',
    info: 'bg-indigo-500',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-500 shrink-0" />,
  };

  return (
    <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top-4 fade-in duration-200 max-w-sm w-full">
      <div
        className={`relative overflow-hidden rounded-2xl border shadow-xl ${
          styles[type] || styles.info
        }`}
      >
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            {icons[type] || icons.info}
            <span className="text-xs sm:text-sm font-semibold">{message}</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Countdown Bar */}
        <div className="h-1 w-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full transition-all duration-75 ease-linear ${
              barColors[type] || barColors.info
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Toast;
