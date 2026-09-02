import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Star,
  Search,
  X,
  ArrowRight,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../features/store';
import {
  fetchTools,
  fetchFavoriteTools,
  toggleFavoriteTool,
  setSelectedTool,
  Tool,
} from '../features/tools';
import { ToolCard } from '../components/tools';
import { Button } from '../components/common/Button';

export const FavoritesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { tools, favoriteToolIds, loading } = useAppSelector((state) => state.tools);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    dispatch(fetchTools());
    dispatch(fetchFavoriteTools());
  }, [dispatch]);

  const handleLaunchTool = (tool: Tool) => {
    const slug = tool.slug || tool.id || '';
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
    if (slug === 'ayushman-print-tool' || tool.name.toLowerCase().includes('ayushman') || tool.name.toLowerCase().includes('pmjay')) {
      navigate('/tools/ayushman-print-tool');
      return;
    }
    dispatch(setSelectedTool(tool));
  };

  const handleToggleFavorite = (toolId: string) => {
    dispatch(toggleFavoriteTool(toolId));
  };

  // Filter tools that are in the user's favorites array
  const favoriteTools = useMemo(() => {
    return tools.filter((tool) => {
      const id = tool.id || tool._id || tool.slug;
      const isFav =
        favoriteToolIds.includes(id) ||
        favoriteToolIds.includes(tool.slug) ||
        (tool._id ? favoriteToolIds.includes(tool._id) : false);

      if (!isFav) return false;

      // Category filter
      if (selectedCategory !== 'All' && tool.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = tool.name.toLowerCase().includes(query);
        const matchesDesc = tool.description.toLowerCase().includes(query);
        return matchesName || matchesDesc;
      }

      return true;
    });
  }, [tools, favoriteToolIds, selectedCategory, searchQuery]);

  const categories = ['All', 'Photo', 'PDF', 'Document'];

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Star className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Favorite Tools
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Your personalized collection of bookmarked tools for fast, 1-click workflows.
            </p>
          </div>
        </div>

        <Link to="/tools">
          <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
            All Tools Catalog
          </Button>
        </Link>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your favorite tools..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-amber-500 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {cat === 'All' ? 'All Favorites' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-900/60 border border-slate-800/60 animate-pulse" />
          ))}
        </div>
      ) : favoriteToolIds.length === 0 ? (
        /* Empty State: No tools favorited yet */
        <div className="p-16 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Star className="w-8 h-8 fill-amber-400/30" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Favorite Tools Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Click the star icon in the top-right corner of any tool card in the catalog to bookmark it here for instant 1-click access.
            </p>
          </div>
          <Link to="/tools">
            <Button variant="gradient" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Explore Tools Catalog
            </Button>
          </Link>
        </div>
      ) : favoriteTools.length === 0 ? (
        /* Empty Search/Filter State */
        <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
          <p className="text-sm font-bold text-white">No matching favorite tools found</p>
          <p className="text-xs text-slate-400">Try adjusting your search terms or category filter.</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        /* Populated Favorites Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteTools.map((tool) => {
            const id = tool.id || tool._id || tool.slug;
            return (
              <ToolCard
                key={id}
                tool={tool}
                isFavorite={true}
                onToggleFavorite={handleToggleFavorite}
                onLaunch={handleLaunchTool}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
