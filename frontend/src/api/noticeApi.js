import api from './axiosInstance';

/**
 * Fetch all active notices
 * @param {Object} params - Query params (e.g., limit, page, category)
 */
export const fetchNotices = async (params = {}) => {
  const response = await api.get('/notices', { params });
  return response.data;
};

/**
 * Fetch a single notice by ID
 * @param {String} id - Notice ID
 */
export const fetchNoticeById = async (id) => {
  const response = await api.get(`/notices/${id}`);
  return response.data;
};

/**
 * Create a new notice
 * @param {Object} noticeData - Notice data payload
 */
export const createNotice = async (noticeData) => {
  const response = await api.post('/notices', noticeData);
  return response.data;
};

/**
 * Update an existing notice
 * @param {String} id - Notice ID
 * @param {Object} noticeData - Notice data payload
 */
export const updateNotice = async (id, noticeData) => {
  const response = await api.put(`/notices/${id}`, noticeData);
  return response.data;
};

/**
 * Delete a notice (soft delete)
 * @param {String} id - Notice ID
 */
export const deleteNotice = async (id) => {
  const response = await api.delete(`/notices/${id}`);
  return response.data;
};
