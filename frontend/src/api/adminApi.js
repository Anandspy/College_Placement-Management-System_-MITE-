import axiosInstance from './axiosInstance';

export const adminApi = {
  getDashboardStats: async () => {
    const response = await axiosInstance.get('/admin/stats');
    return response.data;
  },

  getAllStudents: async (params) => {
    const response = await axiosInstance.get('/admin/students', { params });
    return response.data;
  },
};
