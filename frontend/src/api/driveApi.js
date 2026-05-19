import api from './axiosInstance';

/**
 * Fetch all drives
 * @param {Object} params - Query params (e.g., status, limit)
 */
export const fetchDrives = async (params = {}) => {
  const response = await api.get('/drives', { params });
  return response.data;
};

/**
 * Fetch single drive by ID
 * @param {String} id - Drive ID
 */
export const fetchDriveById = async (id) => {
  const response = await api.get(`/drives/${id}`);
  return response.data;
};

/**
 * Create a new drive (Admin/HR)
 * @param {Object} driveData 
 */
export const createDrive = async (driveData) => {
  const response = await api.post('/drives', driveData);
  return response.data;
};

/**
 * Update an existing drive (Admin/HR)
 * @param {String} id - Drive ID
 * @param {Object} driveData 
 */
export const updateDrive = async (id, driveData) => {
  const response = await api.patch(`/drives/${id}`, driveData);
  return response.data;
};

/**
 * Delete a drive (soft delete)
 * @param {String} id - Drive ID
 */
export const deleteDrive = async (id) => {
  const response = await api.delete(`/drives/${id}`);
  return response.data;
};
