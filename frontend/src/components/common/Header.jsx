import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, LogOut, Sparkles, QrCode, Shield, User as UserIcon } from 'lucide-react';

export const Header = ({ onOpenAI, onOpenScanner }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="badge badge-purple"><Shield size={12} /> Administrator</span>;
      case 'lab_staff':
        return <span className="badge badge-primary">Lab Staff</span>;
      case 'store_incharge':
        return <span className="badge badge-warning">Store In-Charge</span>;
      default:
        return <span className="badge badge-neutral">{role}</span>;
    }
  };

  return (
    <header style={{
      height: '64px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
          Smart Inventory & Asset Management
        </h2>
        <span style={{
          fontSize: '0.75rem',
          backgroundColor: '#eff6ff',
          color: '#2563eb',
          padding: '0.2rem 0.5rem',
          borderRadius: '4px',
          fontWeight: 600,
        }}>
          Institutional Portal
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Quick QR Scan Action */}
        <button
          onClick={onOpenScanner}
          className="btn-secondary"
          style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
          title="Scan or Lookup Asset QR Code"
        >
          <QrCode size={16} />
          <span>Scan QR</span>
        </button>

        {/* AI Assistant Button */}
        <button
          onClick={onOpenAI}
          style={{
            padding: '0.45rem 0.85rem',
            fontSize: '0.8rem',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: '#ffffff',
            border: 'none',
          }}
          title="Ask AI Assistant"
        >
          <Sparkles size={16} />
          <span>AI Assistant</span>
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => navigate('/notifications')}
            className="btn-secondary"
            style={{
              padding: '0.5rem',
              borderRadius: '50%',
              position: 'relative',
              width: '38px',
              height: '38px',
            }}
            title="Notification Center"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  borderRadius: '9999px',
                  padding: '1px 5px',
                  minWidth: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* User Info & Role Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          paddingLeft: '0.75rem',
          borderLeft: '1px solid #e2e8f0',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.85rem',
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={16} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
              {user?.name || 'User'}
            </span>
            {getRoleBadge(user?.role)}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="btn-secondary"
          style={{ padding: '0.45rem 0.65rem', color: '#ef4444', borderColor: '#fecaca' }}
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};
