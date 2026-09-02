import React, { useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Activity,
  Wrench,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../features/store';
import { fetchAdminStats } from '../features/admin';
import { Button } from '../components/common/Button';

const MetricBar: React.FC<{
  label: string;
  value: number;
  max: number;
  color: string;
}> = ({ label, value, max, color }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300 font-medium truncate">{label}</span>
        <span className="text-slate-400 tabular-nums ml-2 shrink-0">{value.toLocaleString()}</span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export const AdminAnalyticsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dashboardData, dashboardLoading } = useAppSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminStats());
  }, [dispatch]);

  const stats = dashboardData?.stats;
  const processingByTool = dashboardData?.processingByTool || [];
  const userGrowth = dashboardData?.userGrowth || [];

  const maxToolCount = processingByTool[0]?.count || 1;
  const maxGrowthCount = Math.max(...userGrowth.map((d) => d.count), 1);

  const toolColors = [
    'from-blue-500 to-indigo-500',
    'from-purple-500 to-violet-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-rose-400" /> Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Platform-wide usage trends, processing activity and growth metrics.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={() => dispatch(fetchAdminStats())}
          isLoading={dashboardLoading}
        >
          Refresh
        </Button>
      </div>

      {dashboardLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-56 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: <Users className="w-4 h-4" />, gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20' },
              { label: 'Active (30d)', value: stats?.activeUsers ?? 0, icon: <TrendingUp className="w-4 h-4" />, gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20' },
              { label: 'Files Stored', value: stats?.totalFiles ?? 0, icon: <FileText className="w-4 h-4" />, gradient: 'from-purple-500 to-violet-600', shadow: 'shadow-purple-500/20' },
              { label: 'Operations', value: stats?.totalProcessed ?? 0, icon: <Activity className="w-4 h-4" />, gradient: 'from-rose-500 to-orange-500', shadow: 'shadow-rose-500/20' },
            ].map((kpi) => (
              <div key={kpi.label} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${kpi.gradient} flex items-center justify-center text-white shadow-lg ${kpi.shadow} mb-3`}>
                  {kpi.icon}
                </div>
                <p className="text-2xl font-extrabold text-white tabular-nums">{kpi.value.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-0.5">{kpi.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tool Usage Breakdown */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-5">
                <Wrench className="w-4 h-4 text-purple-400" />
                Processing by Tool (Last 30 Days)
              </h2>
              {processingByTool.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">No data available yet</div>
              ) : (
                <div className="space-y-4">
                  {processingByTool.map((item, idx) => (
                    <MetricBar
                      key={item._id}
                      label={item._id || 'Unknown'}
                      value={item.count}
                      max={maxToolCount}
                      color={toolColors[idx % toolColors.length]}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* User Registrations (last 7 days) */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-5">
                <Calendar className="w-4 h-4 text-blue-400" />
                New Users — Last 7 Days
              </h2>
              {userGrowth.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">No registrations in last 7 days</div>
              ) : (
                <div className="space-y-3">
                  {/* Mini bar chart */}
                  <div className="flex items-end gap-2 h-32">
                    {userGrowth.map((day) => {
                      const heightPct = Math.round((day.count / maxGrowthCount) * 100);
                      return (
                        <div key={day._id} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[10px] text-slate-400 tabular-nums">{day.count}</span>
                          <div
                            className="w-full bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t-lg transition-all duration-700"
                            style={{ height: `${Math.max(heightPct, 4)}%` }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  {/* Day labels */}
                  <div className="flex gap-2">
                    {userGrowth.map((day) => (
                      <div key={day._id} className="flex-1 text-center text-[10px] text-slate-500">
                        {new Date(day._id).toLocaleDateString('en-IN', { weekday: 'short' })}
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-slate-800">
                    <MetricBar
                      label="Total (7 days)"
                      value={userGrowth.reduce((sum, d) => sum + d.count, 0)}
                      max={Math.max(stats?.totalUsers ?? 1, 1)}
                      color="from-blue-500 to-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Platform Health */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-5">
                <Activity className="w-4 h-4 text-emerald-400" />
                Platform Health
              </h2>
              <div className="space-y-4">
                <MetricBar
                  label="Active Users / Total Users"
                  value={stats?.activeUsers ?? 0}
                  max={Math.max(stats?.totalUsers ?? 1, 1)}
                  color="from-emerald-500 to-teal-500"
                />
                <MetricBar
                  label="Files per User"
                  value={stats?.totalUsers ? Math.round((stats.totalFiles / stats.totalUsers) * 10) / 10 : 0}
                  max={10}
                  color="from-purple-500 to-violet-500"
                />
                <MetricBar
                  label="Processed / Files Stored"
                  value={stats?.totalProcessed ?? 0}
                  max={Math.max(stats?.totalFiles ?? 1, 1)}
                  color="from-amber-500 to-orange-500"
                />
              </div>
            </div>

            {/* Content distribution */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-5">
                <BarChart3 className="w-4 h-4 text-rose-400" />
                Key Ratios
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Total Tools', value: stats?.totalTools ?? 0, color: 'text-purple-400' },
                  { label: 'Processed Docs', value: stats?.totalProcessed ?? 0, color: 'text-emerald-400' },
                  { label: 'Total Files', value: stats?.totalFiles ?? 0, color: 'text-blue-400' },
                  { label: 'Registered Users', value: stats?.totalUsers ?? 0, color: 'text-amber-400' },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                    <p className={`text-2xl font-extrabold ${item.color} tabular-nums`}>
                      {item.value.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
