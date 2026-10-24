import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './admin/AdminDashboard';
import UserDashboard from './user/UserDashboard';
import { ShieldAlert, ArrowLeft, ShieldCheck, UserCheck } from 'lucide-react';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // If user is ADMIN, default to 'admin'; if USER, always 'user'
  const adminRole = isAdmin();
  const requestedView = searchParams.get('view');

  const [activeView, setActiveView] = useState(() => {
    if (adminRole && requestedView === 'user') return 'user';
    return adminRole ? 'admin' : 'user';
  });

  // Keep activeView in sync with role or search param
  useEffect(() => {
    if (!adminRole) {
      setActiveView('user');
    } else if (requestedView === 'user') {
      setActiveView('user');
    } else if (requestedView === 'admin') {
      setActiveView('admin');
    }
  }, [adminRole, requestedView]);

  const handleSwitchToUserView = () => {
    setActiveView('user');
    setSearchParams({ view: 'user' });
  };

  const handleSwitchToAdminView = () => {
    setActiveView('admin');
    setSearchParams({ view: 'admin' });
  };

  return (
    <div className="space-y-4">
      {/* If Admin is previewing Operator / User view, show an elegant switcher banner */}
      {adminRole && activeView === 'user' && (
        <div className="bg-indigo-900/90 text-white px-4 py-2.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md border border-indigo-700/60 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-indigo-100 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              Previewing Operator Workspace: You are viewing the interface as store associates see it.
            </span>
          </div>
          <button
            onClick={handleSwitchToAdminView}
            className="px-3.5 py-1.5 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
            id="admin-return-to-executive-btn"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Return to Admin Command Center</span>
          </button>
        </div>
      )}

      {/* Render the appropriate dashboard */}
      {activeView === 'admin' && adminRole ? (
        <AdminDashboard onSwitchToUserView={handleSwitchToUserView} />
      ) : (
        <UserDashboard />
      )}
    </div>
  );
};

export default Dashboard;
