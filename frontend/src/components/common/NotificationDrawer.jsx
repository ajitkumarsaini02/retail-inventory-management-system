import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  PackageCheck,
  Truck,
  CheckCircle,
  X,
  ExternalLink,
} from 'lucide-react';

const mockNotifications = [
  {
    id: 1,
    title: 'Low Stock Threshold Reached',
    description: 'iPhone 15 Pro Max is below safety reorder level in Main Hub.',
    time: '12m ago',
    type: 'warning',
    link: '/inventory',
    unread: true,
  },
  {
    id: 2,
    title: 'New Customer Order Received',
    description: 'Order #ORD-1005 was placed and is awaiting fulfillment confirmation.',
    time: '34m ago',
    type: 'order',
    link: '/orders',
    unread: true,
  },
  {
    id: 3,
    title: 'Purchase Order Delivered',
    description: 'PO #PO-904 from TechSupply Inc. received at West Distribution Hub.',
    time: '2h ago',
    type: 'success',
    link: '/purchase-orders',
    unread: false,
  },
];

const NotificationDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const clearNotification = (id, e) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNotificationClick = (item) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );
    onClose();
    if (item.link) navigate(item.link);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'order':
        return <PackageCheck className="w-4 h-4 text-indigo-600" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      default:
        return <Truck className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900 dark:text-white">Notifications</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition cursor-pointer"
              >
                Mark read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              <Bell className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2 stroke-1" />
              No notifications at this moment
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer flex items-start gap-3 relative ${
                  item.unread ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center justify-between mb-0.5">
                    <p
                      className={`text-xs font-semibold truncate ${
                        item.unread ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.title}
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 ml-1">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <button
                  onClick={(e) => clearNotification(item.id, e)}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-500 text-slate-300 dark:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                {item.unread && (
                  <span className="absolute left-1.5 top-5 w-1.5 h-1.5 rounded-full bg-indigo-600" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            onClick={() => {
              onClose();
              navigate('/inventory');
            }}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition flex items-center justify-center gap-1 w-full cursor-pointer"
          >
            <span>Review Inventory Alerts</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </>
  );
};

export default NotificationDrawer;
