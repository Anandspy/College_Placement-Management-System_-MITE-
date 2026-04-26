import api from './axiosInstance';

export const applyToDrive = async (driveId) => {
  const response = await api.post(`/applications/apply/${driveId}`);
  return response.data;
};

export const getMyApplications = async () => {
  const response = await api.get('/applications/my-applications');
  return response.data;
};
