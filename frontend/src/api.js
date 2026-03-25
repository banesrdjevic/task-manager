import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://task-manager-production-2630.up.railway.app',
});
