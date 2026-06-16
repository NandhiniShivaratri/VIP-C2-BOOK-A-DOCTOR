import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async actions
export const bookNewAppointment = createAsyncThunk(
  'appointments/bookNewAppointment',
  async (bookingData, thunkAPI) => {
    try {
      const response = await api.post('/appointments', bookingData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to request appointment';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/appointments');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to retrieve appointments';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'appointments/updateAppointment',
  async ({ id, ...updateData }, thunkAPI) => {
    try {
      const response = await api.put(`/appointments/${id}`, updateData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update appointment';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchBusySlots = createAsyncThunk(
  'appointments/fetchBusySlots',
  async ({ doctorId, date }, thunkAPI) => {
    try {
      const response = await api.get('/appointments/busy-slots', {
        params: { doctorId, date },
      });
      return response.data.busySlots;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to query busy slots';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  appointments: [],
  busySlots: [],
  loading: false,
  error: null,
  success: false,
};

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Book Appointment
      .addCase(bookNewAppointment.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(bookNewAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.appointments.push(action.payload.data);
      })
      .addCase(bookNewAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Fetch Appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload.data;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Appointment
      .addCase(updateAppointment.fulfilled, (state, action) => {
        const updated = action.payload.data;
        const index = state.appointments.findIndex((a) => a._id === updated._id);
        if (index !== -1) {
          state.appointments[index] = updated;
        }
        state.success = true;
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Fetch Busy Slots
      .addCase(fetchBusySlots.fulfilled, (state, action) => {
        state.busySlots = action.payload;
      });
  },
});

export const { resetStatus } = appointmentSlice.actions;
export default appointmentSlice.reducer;
