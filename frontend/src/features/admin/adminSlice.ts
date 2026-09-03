import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AdminState, AdminUser, AdminFile, AdminDashboardData, Tool } from './adminTypes';
import { adminService, GetUsersParams, GetFilesParams } from './adminService';

const initialState: AdminState = {
  dashboardData: null,
  dashboardLoading: false,
  dashboardError: null,

  users: [],
  usersTotal: 0,
  usersPage: 1,
  usersPages: 1,
  usersLoading: false,
  usersError: null,

  tools: [],
  toolsLoading: false,
  toolsError: null,

  files: [],
  filesTotal: 0,
  filesPage: 1,
  filesPages: 1,
  filesLoading: false,
  filesError: null,

  mutationLoading: false,
  mutationError: null,
  mutationSuccess: null,
};

/* ─── Dashboard ─── */

export const fetchAdminStats = createAsyncThunk<
  AdminDashboardData,
  void,
  { rejectValue: string }
>('admin/fetchStats', async (_, { rejectWithValue }) => {
  try {
    return await adminService.getStats();
  } catch (e: any) {
    return rejectWithValue(e?.message || 'Failed to load stats');
  }
});

/* ─── Users ─── */

export const fetchAdminUsers = createAsyncThunk<
  { users: AdminUser[]; total: number; page: number; pages: number },
  GetUsersParams | undefined,
  { rejectValue: string }
>('admin/fetchUsers', async (params, { rejectWithValue }) => {
  try {
    const result = await adminService.getUsers(params);
    return { users: result.users, total: result.total, page: result.page, pages: result.pages };
  } catch (e: any) {
    return rejectWithValue(e?.message || 'Failed to load users');
  }
});

export const blockAdminUser = createAsyncThunk<AdminUser, string, { rejectValue: string }>(
  'admin/blockUser',
  async (userId, { rejectWithValue }) => {
    try {
      return await adminService.blockUser(userId);
    } catch (e: any) {
      return rejectWithValue(e?.message || 'Failed to block user');
    }
  }
);

export const unblockAdminUser = createAsyncThunk<AdminUser, string, { rejectValue: string }>(
  'admin/unblockUser',
  async (userId, { rejectWithValue }) => {
    try {
      return await adminService.unblockUser(userId);
    } catch (e: any) {
      return rejectWithValue(e?.message || 'Failed to unblock user');
    }
  }
);

export const deleteAdminUser = createAsyncThunk<string, string, { rejectValue: string }>(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await adminService.deleteUser(userId);
      return userId;
    } catch (e: any) {
      return rejectWithValue(e?.message || 'Failed to delete user');
    }
  }
);

export const updateAdminUserRole = createAsyncThunk<
  AdminUser,
  { userId: string; role: 'user' | 'admin' },
  { rejectValue: string }
>('admin/updateUserRole', async ({ userId, role }, { rejectWithValue }) => {
  try {
    return await adminService.updateUserRole(userId, role);
  } catch (e: any) {
    return rejectWithValue(
      e?.response?.data?.message || e?.message || 'Failed to update user role'
    );
  }
});

/* ─── Tools ─── */

export const fetchAdminTools = createAsyncThunk<Tool[], void, { rejectValue: string }>(
  'admin/fetchTools',
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.fetchAllTools();
    } catch (e: any) {
      return rejectWithValue(e?.message || 'Failed to load tools');
    }
  }
);

export const createAdminTool = createAsyncThunk<Tool, Partial<Tool>, { rejectValue: string }>(
  'admin/createTool',
  async (data, { rejectWithValue }) => {
    try {
      return await adminService.createTool(data);
    } catch (e: any) {
      return rejectWithValue(e?.message || 'Failed to create tool');
    }
  }
);

export const updateAdminTool = createAsyncThunk<
  Tool,
  { id: string; data: Partial<Tool> },
  { rejectValue: string }
>('admin/updateTool', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await adminService.updateTool(id, data);
  } catch (e: any) {
    return rejectWithValue(e?.message || 'Failed to update tool');
  }
});

export const deleteAdminTool = createAsyncThunk<string, string, { rejectValue: string }>(
  'admin/deleteTool',
  async (id, { rejectWithValue }) => {
    try {
      return await adminService.deleteTool(id);
    } catch (e: any) {
      return rejectWithValue(e?.message || 'Failed to delete tool');
    }
  }
);

/* ─── Files ─── */

export const fetchAdminFiles = createAsyncThunk<
  { files: AdminFile[]; total: number; page: number; pages: number },
  GetFilesParams | undefined,
  { rejectValue: string }
>('admin/fetchFiles', async (params, { rejectWithValue }) => {
  try {
    const result = await adminService.getFiles(params);
    return { files: result.files, total: result.total, page: result.page, pages: result.pages };
  } catch (e: any) {
    return rejectWithValue(e?.message || 'Failed to load files');
  }
});

/* ─── Slice ─── */

export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearMutationStatus: (state) => {
      state.mutationError = null;
      state.mutationSuccess = null;
    },
    setUsersPage: (state, action: PayloadAction<number>) => {
      state.usersPage = action.payload;
    },
    setFilesPage: (state, action: PayloadAction<number>) => {
      state.filesPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    /* Dashboard */
    builder
      .addCase(fetchAdminStats.pending, (state) => {
        state.dashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardData = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardError = action.payload || 'Failed to load stats';
      });

    /* Users */
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload.users;
        state.usersTotal = action.payload.total;
        state.usersPage = action.payload.page;
        state.usersPages = action.payload.pages;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.payload || 'Failed to load users';
      });

    builder
      .addCase(blockAdminUser.pending, (state) => { state.mutationLoading = true; state.mutationError = null; })
      .addCase(blockAdminUser.fulfilled, (state, action) => {
        state.mutationLoading = false;
        state.mutationSuccess = `User "${action.payload.name}" blocked`;
        const idx = state.users.findIndex((u) => u._id === action.payload._id);
        if (idx !== -1) state.users[idx] = action.payload;
      })
      .addCase(blockAdminUser.rejected, (state, action) => {
        state.mutationLoading = false;
        state.mutationError = action.payload || 'Failed to block user';
      });

    builder
      .addCase(unblockAdminUser.pending, (state) => { state.mutationLoading = true; state.mutationError = null; })
      .addCase(unblockAdminUser.fulfilled, (state, action) => {
        state.mutationLoading = false;
        state.mutationSuccess = `User "${action.payload.name}" unblocked`;
        const idx = state.users.findIndex((u) => u._id === action.payload._id);
        if (idx !== -1) state.users[idx] = action.payload;
      })
      .addCase(unblockAdminUser.rejected, (state, action) => {
        state.mutationLoading = false;
        state.mutationError = action.payload || 'Failed to unblock user';
      });

    builder
      .addCase(deleteAdminUser.pending, (state) => { state.mutationLoading = true; state.mutationError = null; })
      .addCase(deleteAdminUser.fulfilled, (state, action) => {
        state.mutationLoading = false;
        state.mutationSuccess = 'User deleted successfully';
        state.users = state.users.filter((u) => u._id !== action.payload);
        state.usersTotal = Math.max(0, state.usersTotal - 1);
      })
      .addCase(deleteAdminUser.rejected, (state, action) => {
        state.mutationLoading = false;
        state.mutationError = action.payload || 'Failed to delete user';
      });

    builder
      .addCase(updateAdminUserRole.pending, (state) => {
        state.mutationLoading = true;
        state.mutationError = null;
      })
      .addCase(updateAdminUserRole.fulfilled, (state, action) => {
        state.mutationLoading = false;
        state.mutationSuccess = `User "${action.payload.name}" role updated to ${action.payload.role.toUpperCase()} successfully`;
        const idx = state.users.findIndex((u) => u._id === action.payload._id);
        if (idx !== -1) state.users[idx] = action.payload;
      })
      .addCase(updateAdminUserRole.rejected, (state, action) => {
        state.mutationLoading = false;
        state.mutationError = action.payload || 'Failed to update user role';
      });

    /* Tools */
    builder
      .addCase(fetchAdminTools.pending, (state) => { state.toolsLoading = true; state.toolsError = null; })
      .addCase(fetchAdminTools.fulfilled, (state, action) => {
        state.toolsLoading = false;
        state.tools = action.payload;
      })
      .addCase(fetchAdminTools.rejected, (state, action) => {
        state.toolsLoading = false;
        state.toolsError = action.payload || 'Failed to load tools';
      });

    builder
      .addCase(createAdminTool.pending, (state) => { state.mutationLoading = true; state.mutationError = null; })
      .addCase(createAdminTool.fulfilled, (state, action) => {
        state.mutationLoading = false;
        state.mutationSuccess = `Tool "${action.payload.name}" created`;
        state.tools.unshift(action.payload);
      })
      .addCase(createAdminTool.rejected, (state, action) => {
        state.mutationLoading = false;
        state.mutationError = action.payload || 'Failed to create tool';
      });

    builder
      .addCase(updateAdminTool.pending, (state) => { state.mutationLoading = true; state.mutationError = null; })
      .addCase(updateAdminTool.fulfilled, (state, action) => {
        state.mutationLoading = false;
        state.mutationSuccess = `Tool "${action.payload.name}" updated`;
        const idx = state.tools.findIndex(
          (t) => (t._id || t.id) === (action.payload._id || action.payload.id)
        );
        if (idx !== -1) state.tools[idx] = action.payload;
      })
      .addCase(updateAdminTool.rejected, (state, action) => {
        state.mutationLoading = false;
        state.mutationError = action.payload || 'Failed to update tool';
      });

    builder
      .addCase(deleteAdminTool.pending, (state) => { state.mutationLoading = true; state.mutationError = null; })
      .addCase(deleteAdminTool.fulfilled, (state, action) => {
        state.mutationLoading = false;
        state.mutationSuccess = 'Tool deleted successfully';
        state.tools = state.tools.filter((t) => (t._id || t.id) !== action.payload);
      })
      .addCase(deleteAdminTool.rejected, (state, action) => {
        state.mutationLoading = false;
        state.mutationError = action.payload || 'Failed to delete tool';
      });

    /* Files */
    builder
      .addCase(fetchAdminFiles.pending, (state) => { state.filesLoading = true; state.filesError = null; })
      .addCase(fetchAdminFiles.fulfilled, (state, action) => {
        state.filesLoading = false;
        state.files = action.payload.files;
        state.filesTotal = action.payload.total;
        state.filesPage = action.payload.page;
        state.filesPages = action.payload.pages;
      })
      .addCase(fetchAdminFiles.rejected, (state, action) => {
        state.filesLoading = false;
        state.filesError = action.payload || 'Failed to load files';
      });
  },
});

export const { clearMutationStatus, setUsersPage, setFilesPage } = adminSlice.actions;
export default adminSlice.reducer;
