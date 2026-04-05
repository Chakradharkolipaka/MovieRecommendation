import { useState } from 'react';
import { fetchRecommendations } from '../services/recommend';
import { usePopup } from './usePopup';
import { useAppStore } from '../store/useAppStore';

const ERROR_MAP = {
  USER_NOT_FOUND: "We couldn't find this user in our database.",
  INSUFFICIENT_DATA: "This user hasn't rated enough movies yet.",
  MODEL_NOT_READY: 'The recommendation engine is warming up.',
};

export function useRecommendations() {
  const [state, setState] = useState({
    loading: false,
    steps: [],
    currentStep: 0,
    results: [],
    error: null,
  });
  const setRecommendations = useAppStore((s) => s.setRecommendations);
  const popup = usePopup();

  const getRecommendations = async (userId, method, topN) => {
    setState((s) => ({ ...s, loading: true, error: null, currentStep: 0 }));
    try {
      const response = await fetchRecommendations({ userId, method, topN });
      popup.showStep(response.steps);

      for (let i = 0; i < response.steps.length; i += 1) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        setState((s) => ({ ...s, steps: response.steps, currentStep: i + 1 }));
      }

      setState((s) => ({ ...s, loading: false, results: response.recommendations }));
      setRecommendations(response.recommendations);
      popup.showSuccess(`${response.recommendations.length} recommendations ready!`);
      setTimeout(() => popup.close(), 2000);
      return response.recommendations;
    } catch (error) {
      const payload = error?.response?.data;
      const normalized = {
        error: payload?.error || 'NETWORK_ERROR',
        message:
          ERROR_MAP[payload?.error] ||
          payload?.message ||
          "Can't reach the server. Check your connection.",
        code: payload?.code || 500,
        timestamp: payload?.timestamp || new Date().toISOString(),
      };
      setState((s) => ({ ...s, loading: false, error: normalized }));
      popup.showError(normalized);
      throw normalized;
    }
  };

  const reset = () => {
    setState({ loading: false, steps: [], currentStep: 0, results: [], error: null });
    popup.close();
  };

  return { ...state, getRecommendations, reset };
}
