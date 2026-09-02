import React, { useEffect, useState } from 'react';
import {
  Wrench,
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../features/store';
import {
  fetchAdminTools,
  createAdminTool,
  updateAdminTool,
  deleteAdminTool,
  clearMutationStatus,
  Tool,
} from '../features/admin';
import { Button } from '../components/common/Button';

interface ToolFormData {
  name: string;
  description: string;
  category: 'Photo' | 'PDF' | 'Document' | 'Image';
  icon: string;
  isActive: boolean;
  isFeatured: boolean;
}

const INITIAL_FORM: ToolFormData = {
  name: '',
  description: '',
  category: 'Photo',
  icon: 'Wrench',
  isActive: true,
  isFeatured: false,
};

const CATEGORIES = ['Photo', 'PDF', 'Document', 'Image'] as const;
const ICONS = ['Camera', 'FileText', 'Layers', 'Scissors', 'Minimize2', 'FileCheck', 'Sparkles', 'Wrench'];

const ToolFormModal: React.FC<{
  isOpen: boolean;
  editTool: Tool | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (data: ToolFormData) => void;
}> = ({ isOpen, editTool, loading, error, onClose, onSubmit }) => {
  const [form, setForm] = useState<ToolFormData>(INITIAL_FORM);

  useEffect(() => {
    if (editTool) {
      setForm({
        name: editTool.name,
        description: editTool.description,
        category: editTool.category,
        icon: editTool.icon,
        isActive: editTool.isActive,
        isFeatured: editTool.isFeatured,
      });
    } else {
      setForm(INITIAL_FORM);
    }
  }, [editTool, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-purple-400" />
            {editTool ? 'Edit Tool' : 'Create New Tool'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Tool Name *</label>
            <input
              id="tool-name-input"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Passport Photo Studio"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Description *</label>
            <textarea
              id="tool-description-input"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Brief description of what this tool does..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 outline-none resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Category *</label>
              <select
                id="tool-category-select"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-purple-500 outline-none"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Icon</label>
              <select
                id="tool-icon-select"
                name="icon"
                value={form.icon}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-purple-500 outline-none"
              >
                {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                id="tool-active-toggle"
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="w-4 h-4 rounded accent-purple-500"
              />
              <span className="text-xs font-semibold text-slate-300">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                id="tool-featured-toggle"
                type="checkbox"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={handleChange}
                className="w-4 h-4 rounded accent-amber-500"
              />
              <span className="text-xs font-semibold text-slate-300">Featured</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-800 bg-slate-950/40">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            size="sm"
            isLoading={loading}
            onClick={() => onSubmit(form)}
          >
            {editTool ? 'Save Changes' : 'Create Tool'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const AdminToolsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tools, toolsLoading, mutationLoading, mutationSuccess, mutationError } = useAppSelector(
    (state) => state.admin
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editTool, setEditTool] = useState<Tool | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAdminTools());
  }, [dispatch]);

  useEffect(() => {
    if (mutationSuccess) {
      setModalOpen(false);
      setEditTool(null);
      const t = setTimeout(() => dispatch(clearMutationStatus()), 3000);
      return () => clearTimeout(t);
    }
    if (mutationError) {
      const t = setTimeout(() => dispatch(clearMutationStatus()), 4000);
      return () => clearTimeout(t);
    }
  }, [mutationSuccess, mutationError, dispatch]);

  const handleSubmit = (data: ToolFormData) => {
    if (editTool) {
      const id = editTool._id || editTool.id || '';
      dispatch(updateAdminTool({ id, data }));
    } else {
      dispatch(createAdminTool(data));
    }
  };

  const handleToggleActive = (tool: Tool) => {
    const id = tool._id || tool.id || '';
    dispatch(updateAdminTool({ id, data: { isActive: !tool.isActive } }));
  };

  const handleDelete = async (tool: Tool) => {
    const id = tool._id || tool.id || '';
    setDeletingId(id);
    await dispatch(deleteAdminTool(id));
    setDeletingId(null);
  };

  const categoryColors: Record<string, string> = {
    Photo: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    PDF: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    Document: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    Image: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-purple-400" /> Tools Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {tools.length} tools · Create, edit, activate or delete tool entries
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => dispatch(fetchAdminTools())}
            isLoading={toolsLoading}
          >
            Refresh
          </Button>
          <Button
            id="create-tool-btn"
            variant="gradient"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => { setEditTool(null); setModalOpen(true); }}
          >
            New Tool
          </Button>
        </div>
      </div>

      {/* Toast */}
      {(mutationSuccess || mutationError) && (
        <div className={`p-3 rounded-xl text-sm font-semibold border ${
          mutationSuccess ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {mutationSuccess || mutationError}
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/80 border-b border-slate-800">
              <tr>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Tool</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 hidden lg:table-cell">Slug</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {toolsLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded bg-slate-800 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : tools.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500 text-sm">No tools found</td>
                </tr>
              ) : (
                tools.map((tool) => {
                  const id = tool._id || tool.id || '';
                  return (
                    <tr key={id} className="bg-slate-950/40 hover:bg-slate-900/60 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-xs font-semibold text-white">{tool.name}</p>
                          <p className="text-[11px] text-slate-400 max-w-[200px] truncate">{tool.description}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${categoryColors[tool.category] || 'text-slate-400 bg-slate-800 border-slate-700'}`}>
                          {tool.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <code className="text-[11px] text-slate-400 font-mono">{tool.slug}</code>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActive(tool)}
                          disabled={mutationLoading}
                          title={tool.isActive ? 'Deactivate' : 'Activate'}
                          className="flex items-center gap-1 text-[10px] font-bold"
                        >
                          {tool.isActive ? (
                            <><ToggleRight className="w-4 h-4 text-emerald-400" /><span className="text-emerald-400">Active</span></>
                          ) : (
                            <><ToggleLeft className="w-4 h-4 text-slate-500" /><span className="text-slate-500">Inactive</span></>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            id={`edit-tool-${id}`}
                            onClick={() => { setEditTool(tool); setModalOpen(true); }}
                            title="Edit tool"
                            className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`delete-tool-${id}`}
                            onClick={() => handleDelete(tool)}
                            disabled={mutationLoading || deletingId === id}
                            title="Delete tool"
                            className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
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

      <ToolFormModal
        isOpen={modalOpen}
        editTool={editTool}
        loading={mutationLoading}
        error={mutationError}
        onClose={() => { setModalOpen(false); setEditTool(null); dispatch(clearMutationStatus()); }}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
