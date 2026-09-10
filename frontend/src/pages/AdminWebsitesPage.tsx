import React, { useEffect, useState, useCallback } from 'react';
import {
  Globe,
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Search,
} from 'lucide-react';
import { Website, WebsiteFormData } from '../types/website';
import { websiteApi } from '../api/websiteApi';
import { Button } from '../components/common/Button';

const INITIAL_FORM: WebsiteFormData = {
  name: '',
  url: '',
  description: '',
  iconUrl: '',
  isActive: true,
};

interface WebsiteModalProps {
  isOpen: boolean;
  editWebsite: Website | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (data: WebsiteFormData) => void;
}

const WebsiteFormModal: React.FC<WebsiteModalProps> = ({
  isOpen,
  editWebsite,
  loading,
  error,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState<WebsiteFormData>(INITIAL_FORM);
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    if (editWebsite) {
      setForm({
        name: editWebsite.name,
        url: editWebsite.url,
        description: editWebsite.description || '',
        iconUrl: editWebsite.iconUrl || '',
        isActive: editWebsite.isActive,
      });
    } else {
      setForm(INITIAL_FORM);
    }
    setClientError(null);
  }, [editWebsite, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (!form.name.trim()) {
      setClientError('Website name is required');
      return;
    }

    if (!form.url.trim()) {
      setClientError('Website URL is required');
      return;
    }

    // Client-side URL format check
    if (!/^https?:\/\//i.test(form.url.trim())) {
      setClientError('URL must start with http:// or https:// (e.g. https://scholarship.up.gov.in)');
      return;
    }

    if (/^(javascript|data|vbscript|file):/i.test(form.url.trim())) {
      setClientError('Dangerous URL schemes are not permitted');
      return;
    }

    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" />
            {editWebsite ? 'Edit Useful Website' : 'Add Useful Website'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleFormSubmit}>
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {(error || clientError) && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{clientError || error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Website Name <span className="text-rose-400">*</span>
              </label>
              <input
                id="website-name-input"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. UP Scholarship"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 outline-none transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Website URL <span className="text-rose-400">*</span>
              </label>
              <input
                id="website-url-input"
                name="url"
                type="url"
                value={form.url}
                onChange={handleChange}
                placeholder="https://scholarship.up.gov.in/"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 outline-none transition-colors"
              />
              <p className="text-[11px] text-slate-500">
                Must be a valid HTTP or HTTPS web address.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Short Description <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <textarea
                id="website-description-input"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={2}
                placeholder="e.g. Official scholarship portal."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 outline-none resize-none transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Website Icon / Logo URL <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                id="website-icon-input"
                name="iconUrl"
                type="url"
                value={form.iconUrl}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 outline-none transition-colors"
              />
              <p className="text-[11px] text-slate-500">
                Leave empty to automatically use the domain favicon or default icon.
              </p>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  id="website-active-toggle"
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 rounded accent-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-300">
                  Visible on Home Page (Active)
                </span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-800 bg-slate-950/40">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              id="submit-website-btn"
              variant="gradient"
              size="sm"
              type="submit"
              isLoading={loading}
            >
              {editWebsite ? 'Save Changes' : 'Add Website'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AdminWebsitesPage: React.FC = () => {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [mutationLoading, setMutationLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editWebsite, setEditWebsite] = useState<Website | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Website | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const fetchWebsites = useCallback(async () => {
    setLoading(true);
    try {
      // Admin views all websites (active and inactive)
      const data = await websiteApi.getWebsites({ isActive: 'all', search: search || undefined });
      setWebsites(data);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.response?.data?.message || err?.message || 'Failed to fetch websites',
      });
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchWebsites();
  }, [fetchWebsites]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleCreateOrUpdate = async (formData: WebsiteFormData) => {
    setMutationLoading(true);
    try {
      if (editWebsite) {
        const id = editWebsite.id || editWebsite._id || '';
        await websiteApi.updateWebsite(id, formData);
        setNotification({ type: 'success', message: 'Website updated successfully.' });
      } else {
        await websiteApi.createWebsite(formData);
        setNotification({ type: 'success', message: 'Website added successfully.' });
      }
      setModalOpen(false);
      setEditWebsite(null);
      await fetchWebsites();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.response?.data?.message || err?.message || 'Failed to save website',
      });
    } finally {
      setMutationLoading(false);
    }
  };

  const handleToggleActive = async (site: Website) => {
    const id = site.id || site._id || '';
    try {
      await websiteApi.updateWebsite(id, { isActive: !site.isActive });
      setWebsites((prev) =>
        prev.map((item) => ((item.id || item._id) === id ? { ...item, isActive: !item.isActive } : item))
      );
      setNotification({
        type: 'success',
        message: `Website ${!site.isActive ? 'activated' : 'deactivated'} successfully.`,
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.response?.data?.message || err?.message || 'Failed to toggle status',
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id || deleteTarget._id || '';
    setMutationLoading(true);
    try {
      await websiteApi.deleteWebsite(id);
      setNotification({ type: 'success', message: 'Website removed successfully.' });
      setDeleteTarget(null);
      await fetchWebsites();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.response?.data?.message || err?.message || 'Failed to delete website',
      });
    } finally {
      setMutationLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-indigo-400" /> Manage Useful Websites
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {websites.length} websites configured · Displayed on Home Page for all users
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            onClick={() => fetchWebsites()}
            isLoading={loading}
          >
            Refresh
          </Button>
          <Button
            id="add-website-btn"
            variant="gradient"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => {
              setEditWebsite(null);
              setModalOpen(true);
            }}
          >
            Add Website
          </Button>
        </div>
      </div>

      {/* Toast Alert */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold border flex items-center justify-between animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
        <Search className="w-4 h-4 text-slate-500 shrink-0" />
        <input
          type="text"
          placeholder="Search websites by name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 outline-none"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-slate-500 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Websites Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/80 border-b border-slate-800">
              <tr>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Website
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 hidden sm:table-cell">
                  URL / Domain
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(4)].map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded bg-slate-800 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : websites.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-500 text-xs">
                    No useful websites found. Click <span className="text-indigo-400 font-semibold">Add Website</span> to create the first link.
                  </td>
                </tr>
              ) : (
                websites.map((site) => {
                  const id = site.id || site._id || '';
                  return (
                    <tr
                      key={id}
                      className="bg-slate-950/20 hover:bg-slate-900/60 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0">
                            {site.iconUrl ? (
                              <img
                                src={site.iconUrl}
                                alt={site.name}
                                className="w-5 h-5 object-contain rounded"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <Globe className="w-4 h-4 text-indigo-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{site.name}</p>
                            <p className="text-[11px] text-slate-400 truncate max-w-xs">
                              {site.description || 'No description'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <a
                          href={site.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-mono truncate max-w-[200px]"
                        >
                          <span className="truncate">{site.url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActive(site)}
                          title={site.isActive ? 'Deactivate' : 'Activate'}
                          className="flex items-center gap-1 text-[10px] font-bold"
                        >
                          {site.isActive ? (
                            <>
                              <ToggleRight className="w-4 h-4 text-emerald-400" />
                              <span className="text-emerald-400">Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4 text-slate-500" />
                              <span className="text-slate-500">Inactive</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`edit-website-${id}`}
                            onClick={() => {
                              setEditWebsite(site);
                              setModalOpen(true);
                            }}
                            title="Edit website"
                            className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`delete-website-${id}`}
                            onClick={() => setDeleteTarget(site)}
                            title="Delete website"
                            className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors"
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
      </div>

      {/* Add / Edit Form Modal */}
      <WebsiteFormModal
        isOpen={modalOpen}
        editWebsite={editWebsite}
        loading={mutationLoading}
        error={null}
        onClose={() => {
          setModalOpen(false);
          setEditWebsite(null);
        }}
        onSubmit={handleCreateOrUpdate}
      />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative z-10 w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Delete Website</h3>
                <p className="text-[11px] text-slate-400">Confirmation required</p>
              </div>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to remove <span className="font-bold text-white">"{deleteTarget.name}"</span>?
              It will no longer appear on the Home Page.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteTarget(null)}
                disabled={mutationLoading}
              >
                Cancel
              </Button>
              <Button
                id="confirm-delete-btn"
                variant="danger"
                size="sm"
                onClick={confirmDelete}
                isLoading={mutationLoading}
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
