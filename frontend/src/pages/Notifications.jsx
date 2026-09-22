import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  XCircle,
  Clock,
  Wrench,
  CheckCircle2,
  Info,
} from 'lucide-react';

export const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const [filter, setFilter] = useState('all');

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getAlertIcon = (type) => {
    switch (type) {
      case 'low_stock':
        return <AlertTriangle size={18} color="#d97706" />;
      case 'out_of_stock':
        return <XCircle size={18} color="#dc2626" />;
      case 'overdue':
        return <Clock size={18} color="#dc2626" />;
      case 'maintenance':
        return <Wrench size={18} color="#2563eb" />;
      default:
        return <Info size={18} color="#475569" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
              System Alerts & Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="badge badge-danger">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Live notifications for low consumables, upcoming calibrations, and overdue equipment loans.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
              <CheckCheck size={16} />
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={filter === 'unread' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredNotifications.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <Bell size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <p>No notifications matching this filter.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              style={{
                padding: '1.15rem 1.25rem',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                backgroundColor: notif.isRead ? '#ffffff' : '#f8fafc',
                transition: 'background-color 0.15s ease',
              }}
            >
              <div style={{
                padding: '0.6rem',
                borderRadius: '10px',
                backgroundColor: notif.isRead ? '#f1f5f9' : '#eff6ff',
                flexShrink: 0,
              }}>
                {getAlertIcon(notif.type)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{
                    fontSize: '0.9rem',
                    fontWeight: notif.isRead ? 600 : 800,
                    color: '#0f172a',
                  }}>
                    {notif.title}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {new Date(notif.createdAt).toLocaleDateString()} at{' '}
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.25rem', lineHeight: 1.5 }}>
                  {notif.message}
                </p>

                {!notif.isRead && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <button
                      onClick={() => markAsRead(notif._id)}
                      className="btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                    >
                      <CheckCircle2 size={12} />
                      Mark as Read
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
