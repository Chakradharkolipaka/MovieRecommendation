import { api } from './api';

export async function fetchRecommendations({
  userId,
  method,
  topN,
  moods,
  ageGroup,
  eraStart,
  eraEnd,
  runtime,
  ratingFloor,
  minVoteCount,
  language,
  forceRefresh,
}) {
  const { data } = await api.post('/api/recommend', {
    user_id: userId,
    method,
    top_n: topN,
    moods,
    age_group: ageGroup,
    era_start: eraStart,
    era_end: eraEnd,
    runtime,
    rating_floor: ratingFloor,
    min_vote_count: minVoteCount,
    language,
    force_refresh: !!forceRefresh,
  });
  return data;
}

export async function fetchMetrics(userId) {
  const { data } = await api.get('/api/metrics', { params: { user_id: userId } });
  return data;
}

export async function rateMovie({ userId, movieId, rating }) {
  const { data } = await api.post('/api/rate', {
    user_id: userId,
    movie_id: movieId,
    rating,
  });
  return data;
}
