import React from 'react';
import RegisterForm from '../../components/auth/RegisterForm';
import { ShieldCheck, CheckCircle2, Zap, Sun, Moon } from 'lucide-react';
import logo from '../../assets/logo.png';
import { useTheme } from '../../context/ThemeContext';

const Register = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row relative">
      {/* Quick Theme Switcher Floating Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          type="button"
          aria-label="Toggle dark/light mode"
          className="p-2.5 rounded-full bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-md hover:scale-105 active:scale-95 transition backdrop-blur-xs cursor-pointer"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>
      </div>

      {/* Left Hero Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-12 flex-col justify-between relative overflow-hidden border-r border-slate-800">
        <div className="absolute top-1/3 -left-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Logo"
              className="w-12 h-12 rounded-2xl object-contain bg-white p-1.5 shadow-lg shadow-indigo-500/30 shrink-0"
            />
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                Retail Inventory ERP
              </h1>
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">
                Enterprise Cloud Platform
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 my-auto max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-indigo-300 text-xs font-semibold mb-6 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Staff Portal • Operator Access</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Register for Authorized Floor Operations
          </h2>
          <p className="text-slate-300 text-sm mt-4 leading-relaxed">
            Create an operator account to manage product catalogs, record incoming warehouse consignments, and create customer sales dispatches.
          </p>

          <div className="mt-8 space-y-3.5">
            {[
              'Direct access to SKU catalogs, pricing tiers, and warehouse bins',
              'Sales order generation with automatic stock reservation check',
              'Shipment tracking, consignment dispatch, and status verification',
              'Audited operational history linked to your verified user profile',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-slate-200 text-xs font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Identity & Access Management (IAM)</span>
          </span>
          <span className="font-mono">Security Tier 2</span>
        </div>
      </div>

      {/* Right Registration Container */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-slate-50 dark:bg-slate-950 transition-colors">
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;
