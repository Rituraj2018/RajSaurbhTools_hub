import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Tool, ToolsState } from './toolsTypes';
import { toolsService, GetToolsParams } from './toolsService';

const initialState: ToolsState = {
  tools: [],
  selectedTool: null,
  favoriteToolIds: [],
  activeCategory: 'All',
  searchQuery: '',
  loading: false,
  error: null,
};

/**
 * Async Thunk: Fetch tools with optional filters
 */
export const fetchTools = createAsyncThunk<Tool[], GetToolsParams | undefined, { rejectValue: string }>(
  'tools/fetchTools',
  async (params, { rejectWithValue }) => {
    try {
      return await toolsService.getTools(params);
    } catch (error: any) {
      const message = error?.message || 'Failed to fetch tools';
      return rejectWithValue(message);
    }
  }
);

/**
 * Async Thunk: Fetch single tool by slug
 */
export const fetchToolBySlug = createAsyncThunk<Tool, string, { rejectValue: string }>(
  'tools/fetchToolBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      return await toolsService.getToolBySlug(slug);
    } catch (error: any) {
      const message = error?.message || `Failed to fetch tool: ${slug}`;
      return rejectWithValue(message);
    }
  }
);

/**
 * Async Thunk: Fetch user's favorite tool IDs and populated tools
 */
export const fetchFavoriteTools = createAsyncThunk<
  { favoriteIds: string[]; favorites: Tool[] },
  void,
  { rejectValue: string }
>('tools/fetchFavoriteTools', async (_, { rejectWithValue }) => {
  try {
    const data = await toolsService.getFavorites();
    return {
      favoriteIds: (data.favoriteIds || []).map(String),
      favorites: data.favorites || [],
    };
  } catch (error: any) {
    const message = error?.message || 'Failed to fetch favorite tools';
    return rejectWithValue(message);
  }
});

/**
 * Async Thunk: Toggle a tool in favorites (add or remove)
 */
export const toggleFavoriteTool = createAsyncThunk<
  { toolId: string; favoriteIds: string[]; isFavorite: boolean },
  string,
  { rejectValue: string }
>('tools/toggleFavoriteTool', async (toolId, { rejectWithValue }) => {
  try {
    const data = await toolsService.toggleFavorite(toolId);
    return {
      toolId: data.toolId || toolId,
      favoriteIds: (data.favoriteTools || []).map(String),
      isFavorite: data.isFavorite,
    };
  } catch (error: any) {
    const message = error?.message || 'Failed to update favorite tool';
    return rejectWithValue(message);
  }
});

export const toolsSlice = createSlice({
  name: 'tools',
  initialState,
  reducers: {
    setActiveCategory: (state, action: PayloadAction<string>) => {
      state.activeCategory = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedTool: (state, action: PayloadAction<Tool | null>) => {
      state.selectedTool = action.payload;
    },
    clearSelectedTool: (state) => {
      state.selectedTool = null;
    },
    setFavoriteToolIds: (state, action: PayloadAction<string[]>) => {
      state.favoriteToolIds = action.payload.map(String);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tools
      .addCase(fetchTools.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTools.fulfilled, (state, action) => {
        state.loading = false;
        state.tools = action.payload;
      })
      .addCase(fetchTools.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch tools';
      })

      // Fetch Tool By Slug
      .addCase(fetchToolBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchToolBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTool = action.payload;
      })
      .addCase(fetchToolBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch tool';
      })

      // Fetch Favorite Tools
      .addCase(fetchFavoriteTools.fulfilled, (state, action) => {
        state.favoriteToolIds = Array.from(new Set(action.payload.favoriteIds.map(String)));
        if (action.payload.favorites && action.payload.favorites.length > 0) {
          for (const favTool of action.payload.favorites) {
            const exists = state.tools.some(
              (t) => String(t._id || t.id) === String(favTool._id || favTool.id)
            );
            if (!exists) {
              state.tools.push(favTool);
            }
          }
        }
      })

      // Toggle Favorite Tool (Optimistic & fulfilled)
      .addCase(toggleFavoriteTool.pending, (state, action) => {
        const toolId = String(action.meta.arg);
        const targetTool = state.tools.find(
          (t) =>
            String(t._id || t.id) === toolId ||
            t.slug === toolId
        );
        const canonicalId = String(targetTool?._id || targetTool?.id || toolId);

        const isFav = state.favoriteToolIds.some(
          (id) =>
            String(id) === canonicalId ||
            (targetTool?._id && String(id) === String(targetTool._id)) ||
            (targetTool?.id && String(id) === String(targetTool.id))
        );

        if (isFav) {
          state.favoriteToolIds = state.favoriteToolIds.filter(
            (id) =>
              String(id) !== canonicalId &&
              (!targetTool?._id || String(id) !== String(targetTool._id)) &&
              (!targetTool?.id || String(id) !== String(targetTool.id))
          );
        } else {
          state.favoriteToolIds = Array.from(new Set([...state.favoriteToolIds, canonicalId]));
        }
      })
      .addCase(toggleFavoriteTool.fulfilled, (state, action) => {
        state.favoriteToolIds = Array.from(new Set(action.payload.favoriteIds.map(String)));
      })
      .addCase(toggleFavoriteTool.rejected, (state, action) => {
        // Roll back optimistic toggle on failure
        const toolId = String(action.meta.arg);
        const targetTool = state.tools.find(
          (t) =>
            String(t._id || t.id) === toolId ||
            t.slug === toolId
        );
        const canonicalId = String(targetTool?._id || targetTool?.id || toolId);

        // If it was optimistically added, remove it; if removed, add back
        const wasAdded = state.favoriteToolIds.includes(canonicalId);
        if (wasAdded) {
          state.favoriteToolIds = state.favoriteToolIds.filter((id) => String(id) !== canonicalId);
        } else {
          state.favoriteToolIds = Array.from(new Set([...state.favoriteToolIds, canonicalId]));
        }
        state.error = action.payload || 'Failed to update favorite';
      })
      // Clear favorites on user logout
      .addMatcher(
        (action) =>
          action.type === 'auth/logout' ||
          action.type === 'auth/logoutUser/fulfilled',
        (state) => {
          state.favoriteToolIds = [];
        }
      );
  },
});

export const {
  setActiveCategory,
  setSearchQuery,
  setSelectedTool,
  clearSelectedTool,
  setFavoriteToolIds,
} = toolsSlice.actions;

export default toolsSlice.reducer;
