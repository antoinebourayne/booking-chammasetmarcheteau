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
