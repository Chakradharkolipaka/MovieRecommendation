import React, { useEffect, useState } from 'react';
import ErrorPopup from '../components/popups/ErrorPopup';
import StepPopup from '../components/popups/StepPopup';
import SuccessPopup from '../components/popups/SuccessPopup';
import MetricsChart from '../components/charts/MetricsChart';
import RecommendButton from '../components/recommender/RecommendButton';
import ResultsPanel from '../components/recommender/ResultsPanel';
import UserSelector from '../components/recommender/UserSelector';
import { usePopup } from '../hooks/usePopup';
import { useRecommendations } from '../hooks/useRecommendations';
import { fetchMetrics } from '../services/recommend';
import { fetchUsers } from '../services/movies';

export default function Recommend() {
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState(1);
  const [method, setMethod] = useState('user');
  const [topN, setTopN] = useState(10);
  const [metrics, setMetrics] = useState(null);
  const [hasRequested, setHasRequested] = useState(false);
  const { popup, close } = usePopup();
  const rec = useRecommendations();

  useEffect(() => {
    fetchUsers(1).then((data) => {
      setUsers(data.users);
      if (data.users.length) setUserId(data.users[0].userId);
    });
  }, []);

  useEffect(() => {
    if (userId) {
      fetchMetrics(userId).then(setMetrics).catch(() => setMetrics(null));
    }
  }, [userId]);

  const run = async () => {
    setHasRequested(true);
    await rec.getRecommendations(userId, method, topN);
  };

  return (
    <div className="row g-3">
      <div className="col-lg-3">
        <div className="panel-card d-grid gap-3">
          <UserSelector users={users} value={userId} onChange={setUserId} />
          <div>
            <label className="form-label">Method</label>
            <div className="btn-group w-100">
              <button className={`btn ${method === 'user' ? 'btn-danger' : 'btn-outline-light'}`} onClick={() => setMethod('user')}>
                User-Based
              </button>
              <button className={`btn ${method === 'item' ? 'btn-danger' : 'btn-outline-light'}`} onClick={() => setMethod('item')}>
                Item-Based
              </button>
            </div>
          </div>
          <div>
            <label className="form-label">Top-N: {topN}</label>
            <input type="range" className="form-range" min="5" max="20" value={topN} onChange={(e) => setTopN(Number(e.target.value))} />
          </div>
          <RecommendButton onClick={run} loading={rec.loading} />
        </div>
      </div>

      <div className="col-lg-6">
        <ResultsPanel results={rec.results} />
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
          <p className="mb-1">User ID: {userId || '-'}</p>
          <p className="mb-0">Method: {method}</p>
        </div>
      </div>

      <StepPopup open={popup.type === 'step'} steps={rec.steps} currentStep={rec.currentStep} />
      <ErrorPopup open={popup.type === 'error'} error={rec.error} onRetry={run} onClose={close} />
      <SuccessPopup open={popup.type === 'success'} message={popup.data?.message} />
    </div>
  );
}
