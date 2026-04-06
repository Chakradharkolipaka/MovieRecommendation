import { useCallback, useRef } from 'react';
import { rateMovie } from '../services/recommend';

export function useRating({ userId, profileParams, onRecommendationRefresh, onRefreshStart }) {
  const debounceTimer = useRef(null);
  const pendingRatings = useRef([]);

  const handleRate = useCallback(
    async (movieId, rating) => {
      try {
        await rateMovie({ userId, movieId, rating });
      } catch (error) {
        console.warn('Rating save failed:', error);
      }

      pendingRatings.current.push({ movieId, rating });
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        if (pendingRatings.current.length > 0) {
          pendingRatings.current = [];
          onRefreshStart?.();
          onRecommendationRefresh({
            ...profileParams,
            userId,
            force_refresh: true,
          });
        }
      }, 1500);
    },
    [userId, profileParams, onRecommendationRefresh, onRefreshStart],
  );

  return { handleRate };
}
