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
 * Async Thunk: Fetch user's favorite tool IDs
 */
export const fetchFavoriteTools = createAsyncThunk<string[], void, { rejectValue: string }>(
  'tools/fetchFavoriteTools',
  async (_, { rejectWithValue }) => {
    try {
      const data = await toolsService.getFavorites();
      return data.favoriteIds;
    } catch (error: any) {
      const message = error?.message || 'Failed to fetch favorite tools';
      return rejectWithValue(message);
    }
  }
);

/**
 * Async Thunk: Toggle a tool in favorites (add or remove)
 */
export const toggleFavoriteTool = createAsyncThunk<
  { toolId: string; favoriteIds: string[] },
  string,
  { state: { tools: ToolsState }; rejectValue: string }
>('tools/toggleFavoriteTool', async (toolId, { getState, rejectWithValue }) => {
  try {
    const { favoriteToolIds } = getState().tools;
    const isCurrentlyFav = favoriteToolIds.includes(toolId);

    let updatedIds: string[];
    if (isCurrentlyFav) {
      updatedIds = await toolsService.removeFavorite(toolId);
    } else {
      updatedIds = await toolsService.addFavorite(toolId);
    }

    return { toolId, favoriteIds: updatedIds };
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
      state.favoriteToolIds = action.payload;
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
        state.favoriteToolIds = action.payload;
      })

      // Toggle Favorite Tool (Optimistic & fulfilled)
      .addCase(toggleFavoriteTool.pending, (state, action) => {
        const toolId = action.meta.arg;
        if (state.favoriteToolIds.includes(toolId)) {
          state.favoriteToolIds = state.favoriteToolIds.filter((id) => id !== toolId);
        } else {
          state.favoriteToolIds.push(toolId);
        }
      })
      .addCase(toggleFavoriteTool.fulfilled, (state, action) => {
        state.favoriteToolIds = action.payload.favoriteIds;
      })
      .addCase(toggleFavoriteTool.rejected, (state, action) => {
        // Rollback on rejection if needed
        const toolId = action.meta.arg;
        if (state.favoriteToolIds.includes(toolId)) {
          state.favoriteToolIds = state.favoriteToolIds.filter((id) => id !== toolId);
        } else {
          state.favoriteToolIds.push(toolId);
        }
      });
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
