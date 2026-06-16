import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async actions
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch notifications';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const markNotificationsAsRead = createAsyncThunk(
  'notifications/markNotificationsAsRead',
  async (_, thunkAPI) => {
    try {
      const response = await api.put('/notifications/read');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update notifications';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addRealtimeNotification: (state, action) => {
      // Prepend to array
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    clearNotificationsState: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.data;
        // Calculate unread count
        state.unreadCount = action.payload.data.filter((n) => !n.readStatus).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark as Read
      .addCase(markNotificationsAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({
          ...n,
          readStatus: true,
        }));
        state.unreadCount = 0;
      });
  },
});

export const { addRealtimeNotification, clearNotificationsState } = notificationSlice.actions;
export default notificationSlice.reducer;
