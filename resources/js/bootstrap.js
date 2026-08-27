import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_APP_URL || 'http://localhost:8000';
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;