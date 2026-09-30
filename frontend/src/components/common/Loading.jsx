import React from 'react';
import { Loader2, Boxes } from 'lucide-react';

const Loading = ({ message = 'Synchronizing ERP data...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-150">
        <div className="bg-white dark:bg-slate-900 p-7 rounded-3xl shadow-2xl flex flex-col items-center gap-4 border border-slate-200/90 dark:border-slate-800 max-w-xs w-full text-center transition-colors">
          <div className="relative flex items-center justify-center w-12 h-12">
            <span className="absolute w-12 h-12 rounded-full border-3 border-indigo-200 dark:border-indigo-900 animate-ping opacity-25" />
            <span className="w-10 h-10 rounded-full border-3 border-indigo-600 dark:border-indigo-500 border-t-transparent animate-spin" />
            <Boxes className="w-5 h-5 text-indigo-600 dark:text-indigo-400 absolute" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">{message}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Please wait a moment</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3.5">
      <div className="relative flex items-center justify-center w-12 h-12">
        <span className="w-10 h-10 rounded-full border-3 border-indigo-600 dark:border-indigo-500 border-t-transparent animate-spin" />
        <Boxes className="w-4 h-4 text-indigo-600 dark:text-indigo-400 absolute" />
      </div>
      <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">{message}</p>
    </div>
  );
};

export default Loading;
