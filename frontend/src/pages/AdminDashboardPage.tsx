import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  Activity,
  Wrench,
  ArrowRight,
  UserCheck,
  TrendingUp,
  Clock,
  ShieldAlert,
  BarChart3,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../features/store';
import { fetchAdminStats } from '../features/admin';

const StatCard: React.FC<{
  label: string;
  value: number | string;
  icon: React.ReactNode;
  gradient: string;
  shadow: string;
  sublabel?: string;
}> = ({ label, value, icon, gradient, shadow, sublabel }) => (
  <div
    className={`relative p-5 rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden group hover:border-slate-700 transition-all duration-300`}
  >
    <div
      className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`}
    />
    <div className="flex items-start justify-between mb-4">
      <div
        className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${gradient} flex items-center justify-center text-white shadow-lg ${shadow}`}
      >
        {icon}
      </div>
    </div>
    <p className="text-3xl font-extrabold text-white tabular-nums">
      {typeof value === 'number' ? value.toLocaleString() : value}
    </p>
    <p className="text-sm font-semibold text-slate-300 mt-1">{label}</p>
    {sublabel && <p className="text-[11px] text-slate-500 mt-0.5">{sublabel}</p>}
  </div>
);

export const AdminDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dashboardData, dashboardLoading, dashboardError } = useAppSelector(
    (state) => state.admin
  );

  useEffect(() => {
    dispatch(fetchAdminStats());
  }, [dispatch]);

  const stats = dashboardData?.stats;
  const recentUsers = dashboardData?.recentUsers || [];
  const processingByTool = dashboardData?.processingByTool || [];

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400 mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Platform health, user activity and processing stats at a glance.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5" />
          <span>Updated just now</span>
        </div>
      </div>

      {/* Stats Grid */}
      {dashboardLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : dashboardError ? (
        <div className="p-6 rounded-2xl bg-rose-900/20 border border-rose-500/30 text-rose-400 text-sm">
          {dashboardError}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatCard
            label="Total Users"
            value={stats?.totalUsers ?? 0}
            icon={<Users className="w-5 h-5" />}
            gradient="from-blue-500 to-indigo-600"
            shadow="shadow-blue-500/30"
          />
          <StatCard
            label="Total Files"
            value={stats?.totalFiles ?? 0}
            icon={<FileText className="w-5 h-5" />}
            gradient="from-purple-500 to-violet-600"
            shadow="shadow-purple-500/30"
          />
          <StatCard
            label="Processed Docs"
            value={stats?.totalProcessed ?? 0}
            icon={<Activity className="w-5 h-5" />}
            gradient="from-emerald-500 to-teal-600"
            shadow="shadow-emerald-500/30"
            sublabel="completed operations"
          />
          <StatCard
            label="Active Users"
            value={stats?.activeUsers ?? 0}
            icon={<UserCheck className="w-5 h-5" />}
            gradient="from-amber-500 to-orange-500"
            shadow="shadow-amber-500/30"
            sublabel="last 30 days"
          />
          <StatCard
            label="Total Tools"
            value={stats?.totalTools ?? 0}
            icon={<Wrench className="w-5 h-5" />}
            gradient="from-rose-500 to-pink-600"
            shadow="shadow-rose-500/30"
          />
        </div>
      )}

      {/* Bottom Row: Recent Users + Processing by Tool */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Recent Registrations
            </h2>
            <Link
              to="/admin/users"
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentUsers.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No recent registrations</p>
            ) : (
              recentUsers.map((u) => (
                <div
                  key={u._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{u.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      u.role === 'admin'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {u.role}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Processing by Tool */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Top Tools (Last 30 Days)
            </h2>
            <Link
              to="/admin/analytics"
              className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              Analytics <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {processingByTool.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No processing data yet</p>
            ) : (
              processingByTool.map((item, idx) => {
                const maxCount = processingByTool[0]?.count || 1;
                const pct = Math.round((item.count / maxCount) * 100);
                const colors = [
                  'from-blue-500 to-indigo-500',
                  'from-purple-500 to-violet-500',
                  'from-emerald-500 to-teal-500',
                  'from-amber-500 to-orange-500',
                  'from-rose-500 to-pink-500',
                ];
                return (
                  <div key={item._id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium truncate">{item._id || 'Unknown Tool'}</span>
                      <span className="text-slate-400 tabular-nums ml-2 shrink-0">{item.count.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${colors[idx % colors.length]} rounded-full`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Manage Users', path: '/admin/users', icon: <Users className="w-4 h-4" />, color: 'from-blue-600 to-indigo-600' },
          { label: 'Manage Tools', path: '/admin/tools', icon: <Wrench className="w-4 h-4" />, color: 'from-purple-600 to-violet-600' },
          { label: 'View Files', path: '/admin/files', icon: <FileText className="w-4 h-4" />, color: 'from-emerald-600 to-teal-600' },
          { label: 'Analytics', path: '/admin/analytics', icon: <BarChart3 className="w-4 h-4" />, color: 'from-rose-600 to-orange-600' },
        ].map((action) => (
          <Link
            key={action.path}
            to={action.path}
            className={`flex items-center gap-2 p-3.5 rounded-xl bg-gradient-to-r ${action.color} text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-lg`}
          >
            {action.icon}
            {action.label}
            <ArrowRight className="w-3 h-3 ml-auto" />
          </Link>
        ))}
      </div>
    </div>
  );
};
