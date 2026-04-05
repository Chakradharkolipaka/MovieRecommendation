import { api } from './api';

export async function fetchRecommendations({ userId, method, topN }) {
  const { data } = await api.post('/api/recommend', {
    user_id: userId,
    method,
    top_n: topN,
  });
  return data;
}

export async function fetchMetrics(userId) {
  const { data } = await api.get('/api/metrics', { params: { user_id: userId } });
  return data;
}
