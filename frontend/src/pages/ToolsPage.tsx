import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Wrench,
  Image as ImageIcon,
  FileSpreadsheet,
  FileText,
  Star,
  Sparkles,
  SlidersHorizontal,
  UploadCloud,
} from 'lucide-react';
import { ToolCard } from '../components/tools/ToolCard';
import { Button, Input, EmptyState, Modal } from '../components/common';
import { mockTools } from '../utils/mockData';
import { ToolItem, ToolCategoryType } from '../types';

export const ToolsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategoryParam = (searchParams.get('category') as ToolCategoryType) || 'all';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategoryType>(activeCategoryParam);
  const [toolsList, setToolsList] = useState<ToolItem[]>(mockTools);
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);

  // Sync state if URL query changes
  React.useEffect(() => {
    const cat = searchParams.get('category') as ToolCategoryType;
    if (cat) {
      setSelectedCategory(cat);
    } else {
      setSelectedCategory('all');
    }
  }, [searchParams]);

  const handleCategoryChange = (category: ToolCategoryType) => {
    setSelectedCategory(category);
    if (category === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category });
    }
  };

  const handleToggleFavorite = (toolId: string) => {
    setToolsList((prev) =>
      prev.map((t) => (t.id === toolId ? { ...t, isFavorite: !t.isFavorite } : t))
    );
  };

  const filteredTools = useMemo(() => {
    return toolsList.filter((tool) => {
      // Category filter
      if (selectedCategory === 'favorites') {
        if (!tool.isFavorite) return false;
      } else if (selectedCategory !== 'all' && tool.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = tool.title.toLowerCase().includes(query);
        const matchDesc = tool.description.toLowerCase().includes(query);
        const matchCategory = tool.category.toLowerCase().includes(query);
        return matchTitle || matchDesc || matchCategory;
      }

      return true;
    });
  }, [toolsList, selectedCategory, searchQuery]);

  const categoryCounts = {
    all: toolsList.length,
    photo: toolsList.filter((t) => t.category === 'photo').length,
    pdf: toolsList.filter((t) => t.category === 'pdf').length,
    document: toolsList.filter((t) => t.category === 'document').length,
    favorites: toolsList.filter((t) => t.isFavorite).length,
  };

  const categories = [
    { id: 'all', label: 'All Tools', icon: Wrench, count: categoryCounts.all },
    { id: 'photo', label: 'Photo Studio', icon: ImageIcon, count: categoryCounts.photo },
    { id: 'pdf', label: 'PDF Suite', icon: FileSpreadsheet, count: categoryCounts.pdf },
    { id: 'document', label: 'Document Lab', icon: FileText, count: categoryCounts.document },
    { id: 'favorites', label: 'Favorites', icon: Star, count: categoryCounts.favorites },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Processing Suite</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Explore All 18+ Tools
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Instant client & server tools for PDF manipulation, photo optimization, and document OCR.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, format, or task..."
            leftIcon={<Search className="w-4 h-4" />}
            className="w-full sm:w-72"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id as ToolCategoryType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onLaunch={(t) => setSelectedTool(t)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<SlidersHorizontal className="w-6 h-6" />}
          title="No tools match your criteria"
          description={`We couldn't find any tools matching "${searchQuery}" in the ${selectedCategory} category.`}
          actionText="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            handleCategoryChange('all');
          }}
        />
      )}

      {/* Tool Launch Modal */}
      {selectedTool && (
        <Modal
          isOpen={!!selectedTool}
          onClose={() => setSelectedTool(null)}
          title={
            <div className="flex items-center gap-2.5">
              <span className="text-lg font-bold text-white">{selectedTool.title}</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                {selectedTool.category}
              </span>
            </div>
          }
          description={selectedTool.description}
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setSelectedTool(null)}>
                Cancel
              </Button>
              <Button
                variant="gradient"
                size="sm"
                onClick={() => {
                  alert(`Phase 3 will launch processor for: ${selectedTool.title}`);
                  setSelectedTool(null);
                }}
              >
                Proceed to Processor
              </Button>
            </>
          }
        >
          <div className="p-6 text-center space-y-4 rounded-xl bg-slate-950/60 border border-dashed border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Drag & drop files here</p>
              <p className="text-xs text-slate-400 mt-1">
                Supported formats: {selectedTool.fileTypes?.join(', ') || 'All standard files'}
              </p>
            </div>
            <p className="text-[11px] text-purple-400 font-medium">
              ⚡ Expected speed: {selectedTool.estimatedSpeed || '< 2s'}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
