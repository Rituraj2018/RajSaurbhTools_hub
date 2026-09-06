import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../features/store';
import { fetchTools, fetchFavoriteTools, toggleFavoriteTool, Tool } from '../features/tools';
import {
  ToolCategoryFilter,
  ToolsGrid,
  ToolCard,
} from '../components/tools';
import { Input, Button, Modal, FileUpload } from '../components/common';

export const ToolsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  const handleLaunchTool = (tool: Tool) => {
    const slug = tool.slug || tool.id;
    if (slug === 'passport-photo-studio' || tool.name.toLowerCase().includes('passport')) {
      navigate('/tools/passport-photo-studio');
      return;
    }
    if (slug === 'image-to-pdf' || tool.name.toLowerCase().includes('image to pdf')) {
      navigate('/tools/image-to-pdf');
      return;
    }
    if (slug === 'pdf-merge' || tool.name.toLowerCase().includes('pdf merge') || tool.name.toLowerCase().includes('merge pdf')) {
      navigate('/tools/pdf-merge');
      return;
    }
    if (slug === 'aadhaar-print-studio' || tool.name.toLowerCase().includes('aadhaar')) {
      navigate('/tools/aadhaar-print-studio');
      return;
    }
    if (slug === 'ayushman-print-tool' || slug === 'ayushman-card-print' || tool.name.toLowerCase().includes('ayushman') || tool.name.toLowerCase().includes('pmjay') || tool.name.toLowerCase().includes('health card')) {
      navigate('/tools/ayushman-print-tool');
      return;
    }
    if (slug === 'image-compressor' || slug === 'photo-compress' || tool.name.toLowerCase().includes('image compress') || tool.name.toLowerCase().includes('compress image')) {
      navigate('/tools/image-compressor');
      return;
    }
    if (slug === 'pdf-split' || tool.name.toLowerCase().includes('split pdf') || tool.name.toLowerCase().includes('pdf split')) {
      navigate('/tools/pdf-split');
      return;
    }
    if (slug === 'qr-generator' || slug === 'qr-code-studio' || tool.name.toLowerCase().includes('qr')) {
      navigate('/tools/qr-generator');
      return;
    }
    if (slug === 'pan-print-studio' || tool.name.toLowerCase().includes('pan') || tool.name.toLowerCase().includes('cr80')) {
      navigate('/tools/pan-print-studio');
      return;
    }
    if (slug === 'signature-cropper' || tool.name.toLowerCase().includes('signature crop') || tool.name.toLowerCase().includes('crop signature')) {
      navigate('/tools/signature-cropper');
      return;
    }
    if (slug === 'png-to-jpg' || tool.name.toLowerCase().includes('png to jpg')) {
      navigate('/tools/png-to-jpg');
      return;
    }
    if (slug === 'jpg-to-png' || tool.name.toLowerCase().includes('jpg to png')) {
      navigate('/tools/jpg-to-png');
      return;
    }
    if (slug === 'pdf-to-word' || tool.name.toLowerCase().includes('pdf to word')) {
      navigate('/tools/pdf-to-word');
      return;
    }
    if (slug === 'word-to-pdf' || slug === 'doc-word-to-pdf' || tool.name.toLowerCase().includes('word to pdf')) {
      navigate('/tools/word-to-pdf');
      return;
    }
    if (slug === 'image-resizer' || tool.name.toLowerCase().includes('image resiz') || tool.name.toLowerCase().includes('resize image')) {
      navigate('/tools/image-resizer');
      return;
    }
    setSelectedTool(tool);
  };

  const { tools, favoriteToolIds, loading } = useAppSelector((state) => state.tools);

  // Filter & Search states
  const categoryParam = searchParams.get('category') || 'All';
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  // Load tools and favorites on initial mount
  useEffect(() => {
    dispatch(fetchTools());
    dispatch(fetchFavoriteTools());
  }, [dispatch]);

  // Sync category param from URL
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    } else {
      setSelectedCategory('All');
    }
  }, [searchParams]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    const newParams = new URLSearchParams(searchParams);
    if (query.trim()) {
      newParams.set('search', query.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleToggleFavorite = (toolId: string) => {
    dispatch(toggleFavoriteTool(toolId));
  };

  // Filter tools based on selectedCategory and searchQuery
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      // Category filter
      if (selectedCategory.toLowerCase() !== 'all') {
        if (tool.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = tool.name.toLowerCase().includes(query);
        const matchDesc = tool.description.toLowerCase().includes(query);
        const matchCat = tool.category.toLowerCase().includes(query);
        return matchName || matchDesc || matchCat;
      }

      return true;
    });
  }, [tools, selectedCategory, searchQuery]);

  // Featured tools subset
  const featuredTools = useMemo(() => {
    return tools.filter((t) => t.isFeatured);
  }, [tools]);

  // Dynamic Category counts
  const categoryFilterItems = useMemo(() => {
    const counts = {
      All: tools.length,
      Photo: tools.filter((t) => t.category.toLowerCase() === 'photo').length,
      PDF: tools.filter((t) => t.category.toLowerCase() === 'pdf').length,
      Document: tools.filter((t) => t.category.toLowerCase() === 'document').length,
      Image: tools.filter((t) => t.category.toLowerCase() === 'image').length,
    };

    return [
      { id: 'All', label: 'All Tools', count: counts.All },
      { id: 'Photo', label: 'Photo Studio', count: counts.Photo },
      { id: 'PDF', label: 'PDF Suite', count: counts.PDF },
      { id: 'Document', label: 'Document Lab', count: counts.Document },
      { id: 'Image', label: 'Image Tools', count: counts.Image },
    ];
  }, [tools]);

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tools Management Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Explore All Tools & Utilities
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            High-speed processing engines for PDF, passport photos, ID cards and image optimization.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full sm:w-80">
          <Input
            id="tools-search-input"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name, description or category..."
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Featured Tools Spotlight (Shown when on 'All' and no search) */}
      {selectedCategory.toLowerCase() === 'all' && !searchQuery && featuredTools.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-amber-300">
                Featured & Popular Utilities
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {featuredTools.length} Featured
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTools.slice(0, 3).map((tool) => {
              const toolObjectId = tool._id ? String(tool._id) : '';
              const toolId = tool.id ? String(tool.id) : '';
              const isFav = favoriteToolIds.some((favId) => {
                const idStr = String(favId);
                return (
                  (toolObjectId && idStr === toolObjectId) ||
                  (toolId && idStr === toolId) ||
                  (tool.slug && idStr === tool.slug)
                );
              });

              return (
                <ToolCard
                  key={tool._id || tool.id || tool.slug}
                  tool={tool}
                  onLaunch={(t) => handleLaunchTool(t)}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={isFav}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <ToolCategoryFilter
            categories={categoryFilterItems}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategoryChange}
          />
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            Showing <strong className="text-white">{filteredTools.length}</strong> {filteredTools.length === 1 ? 'tool' : 'tools'}
            {selectedCategory.toLowerCase() !== 'all' ? ` in ${selectedCategory}` : ''}
            {searchQuery ? ` matching "${searchQuery}"` : ''}
          </span>
          {(selectedCategory.toLowerCase() !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setSearchParams({});
              }}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Main Tools Grid */}
        <ToolsGrid
          tools={filteredTools}
          loading={loading}
          onLaunchTool={(t) => handleLaunchTool(t)}
          onToggleFavorite={handleToggleFavorite}
          favoriteIds={favoriteToolIds}
          onClearFilters={() => {
            setSelectedCategory('All');
            setSearchQuery('');
            setSearchParams({});
          }}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
        />
      </div>

      {/* Tool Launch & Preview Modal */}
      {selectedTool && (
        <Modal
          isOpen={!!selectedTool}
          onClose={() => setSelectedTool(null)}
          size="lg"
          title={
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{selectedTool.name}</h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                  {selectedTool.category}
                </span>
              </div>
            </div>
          }
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setSelectedTool(null)}>
                Close
              </Button>
              <Button
                variant="gradient"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => {
                  const targetTool = selectedTool;
                  setSelectedTool(null);
                  handleLaunchTool(targetTool);
                }}
              >
                <span>Launch Processor</span>
              </Button>
            </>
          }
        >
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <p className="font-semibold text-white mb-1">Tool Description</p>
              {selectedTool.description}
            </div>

            {/* Reusable File Upload Component */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-200">
                Upload File for Processing
              </p>
              <FileUpload
                maxSizeMB={10}
                onUploadSuccess={(file) => {
                  console.log('Uploaded file successfully:', file);
                }}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
