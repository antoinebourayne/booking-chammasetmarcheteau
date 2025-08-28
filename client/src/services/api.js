import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

export const loginUser = (name) => API.post('/api/login', { name });

export const fetchAvailability = (date) =>
  API.get('/api/availability', { params: { date } });

export const bookDesk = (user_id, desk_id, booking_date) =>
  API.post('/api/bookings', { user_id, desk_id, booking_date });

export const deleteBooking = (user_id, desk_id, booking_date) =>
  API.delete('/api/bookings', { data: { user_id, desk_id, booking_date } });

/** ADMIN: update desk position (top/left en % 0..100) */
export const updateDeskPosition = (desk_id, top_pct, left_pct, user_id) =>
  API.put(`/api/desks/${desk_id}/position`, { user_id, top_pct, left_pct });

/** ADMIN: libérer un bureau (supprimer la réservation de n’importe qui) */
export const deleteBookingAdmin = (desk_id, booking_date, admin_user_id) =>
  API.delete('/api/admin/bookings', { data: { admin_user_id, desk_id, booking_date } });

/** ADMIN: créer un nouveau desk (au centre 50/50) */
export const createDeskAdmin = (admin_user_id, location, top_pct = 50, left_pct = 50, name) =>
  API.post('/api/admin/desks', { admin_user_id, location, top_pct, left_pct, name });

/** Utilisé pour assignation admin par nom */
export const getUserByName = (name) =>
  API.get('/api/users', { params: { name } });

export const createBookingAdmin = (desk_id, booking_date, admin_user_id, target_user_id) =>
  API.post('/api/admin/bookings', { admin_user_id, target_user_id, desk_id, booking_date });

export const deleteDeskAdmin = (desk_id, admin_user_id) =>
  API.delete(`/api/admin/desks/${desk_id}`, { data: { admin_user_id } });

export const deleteUserAdmin = (user_id, admin_user_id) =>
  API.delete(`/api/admin/users/${user_id}`, { data: { admin_user_id } });

export const fetchAllUsers = () => API.get('/api/users/list');

export const addUser = (name, email) => API.post('/api/users', { name, email });
