import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

// Submit Proposal Action
export const submitProposal = createAsyncThunk(
  "student/submitProposal",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/student/project-proposal", data);
      toast.success("Proposal submitted successfully");
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to submit proposal";
      toast.error(errorMessage);
      return rejectWithValue(error.response?.data || { message: errorMessage });
    }
  }
);

// Fetch Project Action
export const fetchProject = createAsyncThunk(
  "student/fetchProject",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/student/project");
      return response.data.data?.project;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      // Quietly fail for fetchProject as it might just mean no project exists yet
      return rejectWithValue(error.response?.data || { message: "Failed to fetch project" });
    }
  }
);

// Get Supervisor Action
export const getSupervisor = createAsyncThunk(
  "student/getSupervisor",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/student/supervisor");
      return response.data.data?.supervisor;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // Normal case when no supervisor is assigned
      }
      return rejectWithValue(error.response?.data || { message: "Failed to fetch supervisor" });
    }
  }
);

// Fetch All Supervisors Action
export const fetchAllSupervisors = createAsyncThunk(
  "student/fetchAllSupervisors",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/student/fetch-supervisors");
      return response.data.data?.supervisors;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch supervisors";
      toast.error(errorMessage);
      return rejectWithValue(error.response?.data || { message: errorMessage });
    }
  }
);

// Request Supervisor Change Action
export const requestSupervisorChange = createAsyncThunk(
  "student/requestSupervisorChange",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/student/supervisor-change", data);
      toast.success("Supervisor change requested successfully");
      return response.data.data?.request;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to request supervisor change";
      toast.error(errorMessage);
      return rejectWithValue(error.response?.data || { message: errorMessage });
    }
  }
);

// Upload File Action
export const uploadFile = createAsyncThunk(
  "student/uploadFile",
  async ({ projectId, files }, { rejectWithValue }) => {
    try {
      const form = new FormData();

      if (Array.isArray(files)) {
        files.forEach((file) => {
          form.append("files", file);
        });
      } else {
        if (files.reportFile) form.append("reportFile", files.reportFile);
        if (files.presentationFile) form.append("presentationFile", files.presentationFile);
        if (files.codeFiles && files.codeFiles.length > 0) {
          files.codeFiles.forEach((file) => form.append("codeFiles", file));
        }
      }

      const response = await axiosInstance.post(`/student/project-upload/${projectId}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Files uploaded successfully");
      return response.data.data.project || response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to upload files";
      toast.error(errorMessage);
      return rejectWithValue(error.response?.data || { message: errorMessage });
    }
  }
);

export const fetchDashboardStats = createAsyncThunk(
  "student/fetchDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/student/fetch-dashboard-stats");
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch dashboard stats";
      toast.error(errorMessage);
      return rejectWithValue(error.response?.data || { message: errorMessage });
    }
  }
);

export const getFeedback = createAsyncThunk(
  "student/getFeedback",
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/student/feedback/${projectId}`);
      return response.data.data?.feedback;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch feedback";
      toast.error(errorMessage);
      return rejectWithValue(error.response?.data || { message: errorMessage });
    }
  }
);

export const downloadFile = createAsyncThunk(
  "student/downloadFile",
  async (fileId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/student/download-file/${fileId}`, {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to download file";
      toast.error(errorMessage);
      return rejectWithValue(error.response?.data || { message: errorMessage });
    }
  }
);

const studentSlice = createSlice({
  name: "student",
  initialState: {
    project: null,
    files: [],
    supervisors: [],
    supervisor: null,
    dashboardStats: [],
    deadlines: [],
    feedback: [],
    status: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Submit Proposal
    builder.addCase(submitProposal.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(submitProposal.fulfilled, (state, action) => {
      state.loading = false;
      state.project = action.payload?.data?.project || action.payload?.project || action.payload;
    });
    builder.addCase(submitProposal.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch Project
    builder.addCase(fetchProject.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchProject.fulfilled, (state, action) => {
      state.loading = false;
      state.project = action.payload || null;
    });
    builder.addCase(fetchProject.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Get Supervisor
    builder.addCase(getSupervisor.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getSupervisor.fulfilled, (state, action) => {
      state.loading = false;
      state.supervisor = action.payload || null;
    });
    builder.addCase(getSupervisor.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch All Supervisors
    builder.addCase(fetchAllSupervisors.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchAllSupervisors.fulfilled, (state, action) => {
      state.loading = false;
      state.supervisors = action.payload || [];
    });
    builder.addCase(fetchAllSupervisors.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Request Supervisor Change
    builder.addCase(requestSupervisorChange.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(requestSupervisorChange.fulfilled, (state, action) => {
      state.loading = false;
      // Optionally update supervisor
    });
    builder.addCase(requestSupervisorChange.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Upload File
    builder.addCase(uploadFile.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(uploadFile.fulfilled, (state, action) => {
      state.loading = false;
      state.project = action.payload || null;
    });
    builder.addCase(uploadFile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    builder.addCase(fetchDashboardStats.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchDashboardStats.fulfilled, (state, action) => {
      state.loading = false;
      state.dashboardStats = action.payload || [];
    });
    builder.addCase(fetchDashboardStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    builder.addCase(getFeedback.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getFeedback.fulfilled, (state, action) => {
      state.loading = false;
      state.feedback = action.payload || [];
    });
    builder.addCase(getFeedback.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export default studentSlice.reducer;
