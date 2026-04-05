import { api } from './api';

export async function fetchMovies(params) {
  const { data } = await api.get('/api/movies', { params });
  return data;
}

export async function fetchUsers(page = 1) {
  const { data } = await api.get('/api/users', { params: { page } });
  return data;
}

export async function fetchStats() {
  const { data } = await api.get('/api/stats');
  return data;
}

export async function fetchCorrelations(movie) {
  const { data } = await api.get('/api/correlation', { params: { movie } });
  return data;
}
