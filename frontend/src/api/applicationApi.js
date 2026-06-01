import api from './axiosInstance';

export const applyToDrive = async (driveId) => {
  const response = await api.post(`/applications/apply/${driveId}`);
  return response.data;
};

export const getMyApplications = async () => {
  const response = await api.get('/applications/my-applications');
  return response.data;
};

// Admin Endpoints
export const getDriveApplications = async (driveId) => {
  const response = await api.get(`/applications/drive/${driveId}`);
  return response.data;
};

export const updateApplicationStatus = async (applicationId, data) => {
  const response = await api.patch(`/applications/${applicationId}/status`, data);
  return response.data;
};
