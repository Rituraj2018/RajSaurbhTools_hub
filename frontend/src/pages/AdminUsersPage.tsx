import React, { useEffect, useState, useCallback } from 'react';
import {
  Search,
  X,
  Trash2,
  ShieldOff,
  ShieldCheck,
  Users,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  UserCheck,
  UserMinus,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../features/store';
import {
  fetchAdminUsers,
  blockAdminUser,
  unblockAdminUser,
  deleteAdminUser,
  updateAdminUserRole,
  clearMutationStatus,
  AdminUser,
} from '../features/admin';
import { Button } from '../components/common/Button';

const ConfirmModal: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, title, message, confirmLabel, isDanger = false, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-xl ${
              isDanger
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
            } border flex items-center justify-center`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">{title}</h3>
        </div>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant={isDanger ? 'danger' : 'primary'} size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const AdminUsersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentAuthUser = useAppSelector((state) => state.auth.user);
  const { users, usersTotal, usersPage, usersPages, usersLoading, mutationLoading, mutationSuccess, mutationError } =
    useAppSelector((state) => state.admin);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: 'block' | 'unblock' | 'delete' | 'role';
    targetRole?: 'user' | 'admin';
    user: AdminUser | null;
    title: string;
    message: string;
    confirmLabel: string;
    isDanger: boolean;
  }>({
    open: false,
    type: 'delete',
    user: null,
    title: '',
    message: '',
    confirmLabel: '',
    isDanger: false,
  });
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const loadUsers = useCallback(
    (page = 1) => {
      dispatch(
        fetchAdminUsers({
          page,
          search: searchQuery || undefined,
          role: roleFilter !== 'all' ? roleFilter : undefined,
        })
      );
    },
    [dispatch, searchQuery, roleFilter]
  );

  useEffect(() => {
    loadUsers(1);
  }, [searchQuery, roleFilter]);

  useEffect(() => {
    if (mutationSuccess || mutationError) {
      const timer = setTimeout(() => dispatch(clearMutationStatus()), 3000);
      return () => clearTimeout(timer);
    }
  }, [mutationSuccess, mutationError, dispatch]);

  const handleConfirm = async () => {
    if (!confirmModal.user) return;
    const id = confirmModal.user._id;
    setUpdatingUserId(id);
    if (confirmModal.type === 'block') {
      await dispatch(blockAdminUser(id));
    } else if (confirmModal.type === 'unblock') {
      await dispatch(unblockAdminUser(id));
    } else if (confirmModal.type === 'delete') {
      await dispatch(deleteAdminUser(id));
    } else if (confirmModal.type === 'role' && confirmModal.targetRole) {
      await dispatch(updateAdminUserRole({ userId: id, role: confirmModal.targetRole }));
    }
    setUpdatingUserId(null);
    setConfirmModal((prev) => ({ ...prev, open: false, user: null }));
  };

  const openConfirm = (type: 'block' | 'unblock' | 'delete', user: AdminUser) => {
    if (type === 'block') {
      setConfirmModal({
        open: true,
        type: 'block',
        user,
        title: 'Block User Account',
        message: `Are you sure you want to suspend "${user.name}"? They will no longer be able to log in or use tools.`,
        confirmLabel: 'Block User',
        isDanger: true,
      });
    } else if (type === 'unblock') {
      setConfirmModal({
        open: true,
        type: 'unblock',
        user,
        title: 'Unblock User Account',
        message: `Are you sure you want to restore access for "${user.name}"?`,
        confirmLabel: 'Unblock User',
        isDanger: false,
      });
    } else {
      setConfirmModal({
        open: true,
        type: 'delete',
        user,
        title: 'Delete User Account',
        message: `Are you sure you want to permanently delete "${user.name}" and all their associated files and history? This action cannot be undone.`,
        confirmLabel: 'Delete User',
        isDanger: true,
      });
    }
  };

  const openRoleModal = (user: AdminUser, targetRole: 'user' | 'admin') => {
    if (targetRole === 'admin') {
      setConfirmModal({
        open: true,
        type: 'role',
        targetRole: 'admin',
        user,
        title: 'Promote to Administrator',
        message:
          'Make this user an administrator? This will give the user access to the Admin Panel and administrative features.',
        confirmLabel: 'Make Admin',
        isDanger: false,
      });
    } else {
      setConfirmModal({
        open: true,
        type: 'role',
        targetRole: 'user',
        user,
        title: 'Demote Administrator',
        message:
          'Remove administrator privileges from this user? They will no longer be able to access the Admin Panel.',
        confirmLabel: 'Remove Admin',
        isDanger: true,
      });
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" /> User Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {usersTotal.toLocaleString()} total users · Search, block, or delete accounts
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={() => loadUsers(usersPage)}
          isLoading={usersLoading}
        >
          Refresh
        </Button>
      </div>

      {/* Toast */}
      {(mutationSuccess || mutationError) && (
        <div
          className={`p-3 rounded-xl text-sm font-semibold border ${
            mutationSuccess
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {mutationSuccess || mutationError}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="admin-user-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {(['all', 'user', 'admin'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                roleFilter === r
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {r === 'all' ? 'All Roles' : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/80 border-b border-slate-800">
              <tr>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">User</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Role</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 hidden lg:table-cell">Joined</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {usersLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded bg-slate-800 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500 text-sm">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrentUser = Boolean(
                    currentAuthUser &&
                      (currentAuthUser.id === u._id ||
                        (currentAuthUser as any)._id === u._id)
                  );
                  return (
                    <tr key={u._id} className="bg-slate-950/40 hover:bg-slate-900/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{u.name}</p>
                            <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider border ${
                            u.role === 'admin'
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-sm shadow-rose-500/10'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.role === 'admin' ? 'bg-rose-400' : 'bg-slate-400'}`} />
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-[11px] text-slate-400">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                            u.isBlocked
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isBlocked ? 'bg-rose-400' : 'bg-emerald-400 animate-pulse'}`} />
                          {u.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {/* Role Action: Make Admin or Remove Admin */}
                          {u.role === 'admin' ? (
                            <button
                              id={`remove-admin-btn-${u._id}`}
                              onClick={() => openRoleModal(u, 'user')}
                              disabled={mutationLoading || isCurrentUser}
                              title={
                                isCurrentUser
                                  ? 'You cannot modify your own administrative role'
                                  : 'Remove administrator privileges from this user'
                              }
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <UserMinus className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              <span>{updatingUserId === u._id ? 'Updating...' : 'Remove Admin'}</span>
                            </button>
                          ) : (
                            <button
                              id={`make-admin-btn-${u._id}`}
                              onClick={() => openRoleModal(u, 'admin')}
                              disabled={mutationLoading}
                              title="Promote user to administrator"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 border border-blue-500/30 text-blue-300 hover:bg-blue-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <UserCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span>{updatingUserId === u._id ? 'Updating...' : 'Make Admin'}</span>
                            </button>
                          )}

                          {/* Existing Block / Unblock Button */}
                          {u.isBlocked ? (
                            <button
                              id={`unblock-user-${u._id}`}
                              onClick={() => openConfirm('unblock', u)}
                              disabled={mutationLoading}
                              title="Unblock user"
                              className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              id={`block-user-${u._id}`}
                              onClick={() => openConfirm('block', u)}
                              disabled={mutationLoading || isCurrentUser}
                              title={isCurrentUser ? 'You cannot block your own account' : 'Block user'}
                              className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ShieldOff className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Existing Delete Button */}
                          <button
                            id={`delete-user-${u._id}`}
                            onClick={() => openConfirm('delete', u)}
                            disabled={mutationLoading || isCurrentUser}
                            title={isCurrentUser ? 'You cannot delete your own account' : 'Delete user'}
                            className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {usersPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-900/40">
            <span className="text-xs text-slate-400">
              Page {usersPage} of {usersPages} · {usersTotal} users
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => loadUsers(usersPage - 1)}
                disabled={usersPage <= 1 || usersLoading}
                className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => loadUsers(usersPage + 1)}
                disabled={usersPage >= usersPages || usersLoading}
                className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        isDanger={confirmModal.isDanger}
        onConfirm={handleConfirm}
        onCancel={() =>
          setConfirmModal({
            open: false,
            type: 'delete',
            user: null,
            title: '',
            message: '',
            confirmLabel: '',
            isDanger: false,
          })
        }
      />
    </div>
  );
};
