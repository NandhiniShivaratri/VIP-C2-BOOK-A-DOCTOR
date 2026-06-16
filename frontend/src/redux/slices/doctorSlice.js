import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async actions
export const fetchDoctors = createAsyncThunk('doctors/fetchDoctors', async (params = {}, thunkAPI) => {
  try {
    const response = await api.get('/doctors', { params });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch doctors list';
    return thunkAPI.rejectWithValue(message);
  }
});

export const fetchDoctorById = createAsyncThunk('doctors/fetchDoctorById', async (id, thunkAPI) => {
  try {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch doctor details';
    return thunkAPI.rejectWithValue(message);
  }
});

export const fetchRecommendations = createAsyncThunk(
  'doctors/fetchRecommendations',
  async (params = {}, thunkAPI) => {
    try {
      const response = await api.get('/doctors/recommendations', { params });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch recommendations';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const approveDoctor = createAsyncThunk(
  'doctors/approveDoctor',
  async ({ id, approved }, thunkAPI) => {
    try {
      const response = await api.put(`/doctors/${id}/approve`, { approved });
      return { id, approved: response.data.data.approved };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update doctor status';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteDoctorProfile = createAsyncThunk('doctors/deleteDoctor', async (id, thunkAPI) => {
  try {
    await api.delete(`/doctors/${id}`);
    return id;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to delete doctor';
    return thunkAPI.rejectWithValue(message);
  }
});

const initialState = {
  doctors: [],
  selectedDoctor: null,
  recommendations: {
    topRated: [],
    recommended: [],
    trending: [],
    similar: [],
  },
  loading: false,
  error: null,
};

const doctorSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {
    clearSelectedDoctor: (state) => {
      state.selectedDoctor = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Doctors
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload.data;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Single Doctor
      .addCase(fetchDoctorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedDoctor = action.payload.data;
      })
      .addCase(fetchDoctorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Recommendations
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.recommendations = action.payload.data;
      })
      // Approve Doctor
      .addCase(approveDoctor.fulfilled, (state, action) => {
        const { id, approved } = action.payload;
        // Update approval inside doctors array if it exists
        const docIndex = state.doctors.findIndex((d) => d._id === id);
        if (docIndex !== -1) {
          state.doctors[docIndex].approved = approved;
        }
        if (state.selectedDoctor && state.selectedDoctor._id === id) {
          state.selectedDoctor.approved = approved;
        }
      })
      // Delete Doctor
      .addCase(deleteDoctorProfile.fulfilled, (state, action) => {
        const id = action.payload;
        state.doctors = state.doctors.filter((d) => d._id !== id);
        if (state.selectedDoctor && state.selectedDoctor._id === id) {
          state.selectedDoctor = null;
        }
      });
  },
});

export const { clearSelectedDoctor } = doctorSlice.actions;
export default doctorSlice.reducer;
