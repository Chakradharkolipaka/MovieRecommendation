import React, { useEffect, useState } from 'react';
import ErrorPopup from '../components/popups/ErrorPopup';
import StepPopup from '../components/popups/StepPopup';
import SuccessPopup from '../components/popups/SuccessPopup';
import MetricsChart from '../components/charts/MetricsChart';
import ResultsPanel from '../components/recommender/ResultsPanel';
import ProfileForm from '../components/recommender/ProfileForm';
import { usePopup } from '../hooks/usePopup';
import { useRecommendations } from '../hooks/useRecommendations';
import { useRating } from '../hooks/useRating';
import { fetchMetrics } from '../services/recommend';
import { fetchUsers } from '../services/movies';

export default function Recommend() {
  const [users, setUsers] = useState([]);
  const [profileParams, setProfileParams] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [hasRequested, setHasRequested] = useState(false);
  const [refreshingToast, setRefreshingToast] = useState(false);
  const { popup, close } = usePopup();
  const rec = useRecommendations();

  const activeUserId = profileParams?.userId || users[0]?.userId || 1;

  useEffect(() => {
    fetchUsers(1).then((data) => {
      setUsers(data.users);
    });
  }, []);

  useEffect(() => {
    if (activeUserId) {
      fetchMetrics(activeUserId).then(setMetrics).catch(() => setMetrics(null));
    }
  }, [activeUserId]);

  const run = async (params = profileParams) => {
    if (!params?.userId) return;
    setProfileParams(params);
    setHasRequested(true);
    await rec.getRecommendations(params);
  };

  const { handleRate } = useRating({
    userId: activeUserId,
    profileParams,
    onRecommendationRefresh: async (next) => {
      await run({
        ...profileParams,
        ...next,
        method: profileParams?.method || 'user',
        topN: profileParams?.topN || 10,
        forceRefresh: true,
      });
      setTimeout(() => setRefreshingToast(false), 1000);
    },
    onRefreshStart: () => {
      setRefreshingToast(true);
    },
  });

  return (
    <div className="row g-3">
      <div className="col-lg-3">
        <ProfileForm users={users} loading={rec.loading} onSubmit={run} />
      </div>

      <div className="col-lg-6">
        {refreshingToast ? (
          <div className="alert alert-warning py-2 animate-fade-in" role="status">
            Refreshing recommendations based on your ratings...
          </div>
        ) : null}
        <ResultsPanel results={rec.results} onRate={handleRate} />
        {hasRequested && !rec.loading && !rec.error && rec.results.length === 0 ? (
          <div className="empty-state mt-3">
            No unseen movies left for this user – try another user or add new movies.
          </div>
        ) : null}
      </div>

      <div className="col-lg-3">
        <MetricsChart metrics={metrics} />
        <div className="panel-card mt-3">
          <h6>Quick User Summary</h6>
          <p className="mb-1">User ID: {activeUserId || '-'}</p>
          <p className="mb-0">Method: {profileParams?.method || 'user'}</p>
        </div>
      </div>

      <StepPopup open={popup.type === 'step'} steps={rec.steps} currentStep={rec.currentStep} />
      <ErrorPopup open={popup.type === 'error'} error={rec.error} onRetry={() => run(profileParams)} onClose={close} />
      <SuccessPopup open={popup.type === 'success'} message={popup.data?.message} />
    </div>
  );
}
