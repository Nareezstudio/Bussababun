import API from './axios';

export const updateProfile = async (userData) => {
  return await API.put('/users/profile', userData);
};