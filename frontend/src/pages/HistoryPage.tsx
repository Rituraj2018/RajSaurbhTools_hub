import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  RefreshCw,
  AlertCircle,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import {
  HistoryStatsCards,
  HistoryFilterBar,
  HistoryTableRow,
  HistoryDetailModal,
} from '../components/history';
import {
  HistoryItem,
  HistoryListResponse,
  HistoryStatus,
} from '../types/history.types';
import { historyApi } from '../api/historyApi';
import { Button } from '../components/common/Button';

export const HistoryPage: React.FC = () => {
  const [historyData, setHistoryData] = useState<HistoryListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTool, setSelectedTool] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<HistoryStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal State
  const [detailItem, setDetailItem] = useState<HistoryItem | null>(null);

  // Load history from backend
  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await historyApi.getHistory({
        search: searchQuery || undefined,
        tool: selectedTool !== 'all' ? selectedTool : undefined,
        status: selectedStatus,
        sortBy,
        page: currentPage,
        limit: 10,
      });

      setHistoryData(data);
    } catch (err: any) {
      console.error('Failed to load history:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load processing history.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedTool, selectedStatus, sortBy, currentPage]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear your processing history log?')) {
      try {
        await historyApi.clearHistory();
        loadHistory();
      } catch (err) {
        console.error('Failed to clear history:', err);
      }
    }
  };

  const history = historyData?.history || [];
  const totalItems = historyData?.totalItems || 0;
  const totalPages = historyData?.totalPages || 1;

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Processing History & Audit Log
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Track execution status, input documents, output files, and operational parameters.
            </p>
          </div>
        </div>

        <Link to="/tools">
          <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Explore Tools
          </Button>
        </Link>
      </div>

      {/* Operation Statistics Overview */}
      <HistoryStatsCards stats={historyData?.stats} />

      {/* Filter & Search Toolbar */}
      <HistoryFilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        selectedTool={selectedTool}
        onToolChange={(t) => {
          setSelectedTool(t);
          setCurrentPage(1);
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(s) => {
          setSelectedStatus(s);
          setCurrentPage(1);
        }}
        sortBy={sortBy}
        onSortChange={(sort) => {
          setSortBy(sort);
          setCurrentPage(1);
        }}
        onClearHistory={handleClearHistory}
        hasEntries={history.length > 0}
      />

      {/* Main Table Display */}
      {loading ? (
        /* Loading Skeletons */
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-800/50 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <div className="p-12 rounded-3xl bg-rose-950/20 border border-rose-500/30 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Failed to Load History</h3>
            <p className="text-xs text-rose-300 mt-1">{error}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={loadHistory} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Retry
          </Button>
        </div>
      ) : history.length === 0 ? (
        /* Empty State */
        <div className="p-16 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Processing History Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || selectedTool !== 'all' || selectedStatus !== 'all'
                ? 'No operations matched your current filters. Try resetting filters.'
                : 'You have not processed any files yet. Launch any tool to begin.'}
            </p>
          </div>
          <Link to="/tools">
            <Button variant="gradient" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Open Tools Hub
            </Button>
          </Link>
        </div>
      ) : (
        /* Table of History Records */
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Tool Used</th>
                  <th className="py-3 px-4">Input Document(s)</th>
                  <th className="py-3 px-4">Generated Output</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Audit</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <HistoryTableRow
                    key={item.id || item._id}
                    item={item}
                    onViewDetails={setDetailItem}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 px-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Previous
          </Button>

          <span className="text-xs font-semibold text-slate-300">
            Page <strong className="text-white">{currentPage}</strong> of{' '}
            <strong className="text-white">{totalPages}</strong> ({totalItems} total entries)
          </span>

          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Next
          </Button>
        </div>
      )}

      {/* Detail Inspection Modal */}
      <HistoryDetailModal
        item={detailItem}
        onClose={() => setDetailItem(null)}
      />
    </div>
  );
};
