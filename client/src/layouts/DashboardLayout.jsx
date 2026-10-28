import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  ShoppingBag,
  Briefcase,
  Mail,
  User,
  Settings,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import { getInitials } from '../utils/formatters.js';

export const DashboardLayout = () => {
  const { user } = useSelector((state) => state.auth);

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/dashboard/purchases', label: 'My Purchases (Bought)', icon: ShoppingBag },
    { to: '/dashboard/services', label: 'My Store (Selling)', icon: Briefcase },
    { to: '/dashboard/inquiries', label: 'Messages & Inquiries', icon: Mail },
    { to: '/dashboard/settings', label: 'Profile Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs sticky top-24">
            {/* User Mini Profile Header */}
            {user && (
              <div className="flex items-center gap-3.5 pb-5 mb-5 border-b border-slate-100">
                {user.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-base flex items-center justify-center">
                    {getInitials(user.name)}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 truncate">{user.name}</h3>
                  <p className="text-xs text-slate-500 truncate">@{user.username}</p>
                  {user.college && (
                    <span className="inline-block mt-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full truncate max-w-full">
                      {user.college}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Quick Action Button */}
            <Link
              to="/services/publish"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 mb-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Offer New Service</span>
            </Link>

            {/* Nav Menu */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}

              {user?.username && (
                <Link
                  to={`/profiles/${user.username}`}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <User className="w-4 h-4" />
                    <span>View Public Profile</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              )}
            </nav>
          </div>
        </aside>

        {/* Main Dashboard Content */}
        <main className="lg:col-span-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
