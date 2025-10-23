import axios from 'axios';

const isDevelopment = process.env.NODE_ENV === 'development';

const api = axios.create({
  baseURL: isDevelopment ? 'http://localhost:5000' : '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;