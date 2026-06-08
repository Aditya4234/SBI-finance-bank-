import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { accountApi } from '../../services/api';
import { Account } from '../../types';

interface AccountState {
  accounts: Account[];
  selectedAccount: Account | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AccountState = {
  accounts: [],
  selectedAccount: null,
  isLoading: false,
  error: null,
};

export const fetchAccounts = createAsyncThunk('accounts/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await accountApi.getAll();
    return res.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch accounts');
  }
});

const accountSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    setSelectedAccount: (state, action) => {
      state.selectedAccount = action.payload;
    },
    clearAccounts: (state) => {
      state.accounts = [];
      state.selectedAccount = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts = action.payload;
        if (action.payload.length > 0 && !state.selectedAccount) {
          state.selectedAccount = action.payload[0];
        }
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedAccount, clearAccounts } = accountSlice.actions;
export default accountSlice.reducer;
