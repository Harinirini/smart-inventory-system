import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Boxes,
  PackageSearch,
  ArrowLeftRight,
  ClipboardCheck,
  Wrench,
  BarChart3,
  Bell,
  ShieldAlert,
  Users,
  Building2,
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isStoreIncharge = user?.role === 'store_incharge';

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/assets', label: 'Asset Registry', icon: Boxes },
    { to: '/inventory', label: 'Inventory (Stock)', icon: PackageSearch },
    { to: '/stock-transactions', label: 'Stock Transactions', icon: ArrowLeftRight },
    { to: '/issues', label: 'Issue & Return', icon: ClipboardCheck },
    { to: '/maintenance', label: 'Maintenance', icon: Wrench },
    { to: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
    { to: '/notifications', label: 'Notifications', icon: Bell },
  ];

  if (isAdmin) {
    navItems.push(
      { to: '/audit-logs', label: 'Audit Trail', icon: ShieldAlert },
      { to: '/users', label: 'User Management', icon: Users }
    );
  }

  return (
    <aside style={{
      width: '260px',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      minHeight: '100vh',
    }}>
      {/* Brand / Logo */}
      <div style={{
        padding: '1.5rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderBottom: '1px solid #1e293b',
      }}>
        <div style={{
          backgroundColor: '#2563eb',
          color: '#ffffff',
          padding: '0.5rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Building2 size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            CampusAsset
          </h1>
          <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
            Smart Inventory System
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div style={{ padding: '0 0.5rem 0.5rem', fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Main Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '6px',
                color: isActive ? '#ffffff' : '#94a3b8',
                backgroundColor: isActive ? '#2563eb' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.85rem',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* System Status Footprint */}
      <div style={{
        padding: '1.25rem',
        borderTop: '1px solid #1e293b',
        fontSize: '0.75rem',
        color: '#94a3b8',
        backgroundColor: '#090d16',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          <span style={{ fontWeight: 600, color: '#e2e8f0' }}>MongoDB Connected</span>
        </div>
        <div style={{ color: '#64748b', fontSize: '0.7rem' }}>
          Role: <strong style={{ color: '#94a3b8' }}>{user?.role?.toUpperCase()}</strong>
        </div>
      </div>
    </aside>
  );
};
