import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  PackageCheck,
  Truck,
  CheckCircle,
  CheckCheck,
  X,
  ExternalLink,
  Check,
} from 'lucide-react';

export const defaultNotifications = [
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

const NotificationDrawer = ({ isOpen, onClose, notifications = [], setNotifications }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = (e) => {
    e?.stopPropagation();
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const toggleReadStatus = (id, e) => {
    e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
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
        return <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'order':
        return <PackageCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-slate-900 dark:text-white">Notifications</span>
          {unreadCount > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {unreadCount} unread
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              All caught up
            </span>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition cursor-pointer flex items-center gap-1"
              title="Mark all notifications as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notification list */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
        {notifications.length === 0 ? (
          <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-xs">
            <Bell className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2 stroke-1" />
            No notifications at this moment
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer flex items-start gap-3 relative group ${
                item.unread ? 'bg-indigo-50/40 dark:bg-indigo-950/25' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center justify-between mb-0.5">
                  <p
                    className={`text-xs truncate ${
                      item.unread ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-400'
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

              {/* Action buttons (toggle read + clear) */}
              <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition">
                <button
                  type="button"
                  onClick={(e) => toggleReadStatus(item.id, e)}
                  className={`p-1 rounded-md transition cursor-pointer ${
                    item.unread
                      ? 'text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={item.unread ? 'Mark as read' : 'Mark as unread'}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => clearNotification(item.id, e)}
                  className="p-1 text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                  title="Remove notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Blue Dot for unread item */}
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
  );
};

export default NotificationDrawer;
