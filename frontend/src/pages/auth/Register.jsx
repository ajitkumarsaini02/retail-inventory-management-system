import React from 'react';
import RegisterForm from '../../components/auth/RegisterForm';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Register = () => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden transition-colors">
      {/* Background subtle ambient glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-violet-600/15 dark:bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Quick Theme Switcher Floating Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          type="button"
          aria-label="Toggle dark/light mode"
          className="p-2.5 rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-md hover:scale-105 active:scale-95 transition backdrop-blur-xs cursor-pointer"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>
      </div>

      {/* Centered Form */}
      <div className="w-full max-w-md relative z-10 flex justify-center">
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;
