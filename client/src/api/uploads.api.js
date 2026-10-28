import api from './axios.js';

export const uploadsApi = {
  uploadFile: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return res.data;
  },

  deleteUpload: async (id) => {
    const res = await api.delete(`/uploads/${id}`);
    return res.data;
  },
};
