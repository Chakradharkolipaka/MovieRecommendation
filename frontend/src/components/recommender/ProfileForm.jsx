import React, { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'cinimatch-profile';

const defaultProfile = {
  userId: null,
  moods: [],
  ageGroup: null,
  eraStart: 1990,
  eraEnd: 2024,
  runtime: 'any',
  ratingFloor: 3.0,
  minVoteCount: 50,
  language: 'any',
  method: 'user',
  topN: 10,
};

const moodOptions = ['😂 Comedy', '😱 Thriller', '😢 Drama', '🚀 Sci-Fi', '❤️ Romance', '🎭 Mystery', '🌍 World'];

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultProfile, ...JSON.parse(raw) } : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

function Section({ title, open, setOpen, active, children }) {
  return (
    <div className="border border-white/10 rounded-xl p-3 bg-[#0e0e16]">
      <button type="button" className="w-100 d-flex justify-content-between text-uppercase small text-white-50" onClick={() => setOpen((v) => !v)}>
        <span>{title}</span>
        <span>{active ? '•' : ''} {open ? '▾' : '▸'}</span>
      </button>
      {open ? <div className="pt-3">{children}</div> : null}
    </div>
  );
}

export default function ProfileForm({ users = [], loading = false, onSubmit }) {
  const [profile, setProfile] = useState(loadInitial);
  const [error, setError] = useState('');
  const [open, setOpen] = useState({
    who: true,
    mood: true,
    era: true,
    quality: true,
    language: false,
    method: true,
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    if (!profile.userId && users.length > 0) {
      setProfile((p) => ({ ...p, userId: users[0].userId }));
    }
  }, [users, profile.userId]);

  const activeMap = useMemo(
    () => ({
      who: !!profile.userId || !!profile.ageGroup,
      mood: profile.moods.length > 0,
      era: profile.eraStart !== 1990 || profile.eraEnd !== 2024 || profile.runtime !== 'any',
      quality: profile.ratingFloor !== 3.0 || profile.minVoteCount !== 50,
      language: profile.language !== 'any',
      method: profile.method !== 'user' || profile.topN !== 10,
    }),
    [profile],
  );

  const toggleMood = (mood) => {
    setProfile((p) => ({
      ...p,
      moods: p.moods.includes(mood) ? p.moods.filter((m) => m !== mood) : [...p.moods, mood],
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!profile.userId) {
      setError('Please select a user ID.');
      return;
    }
    if (profile.eraStart > profile.eraEnd) {
      setError('Era start must be less than or equal to era end.');
      return;
    }
    setError('');
    onSubmit({ ...profile, moods: profile.moods.length ? profile.moods : null });
  };

  return (
    <form className="d-grid gap-3" onSubmit={submit}>
      <div className="panel-card">
        <h5 className="mb-1">🎬 Tell Us Your Vibe</h5>
        <p className="text-secondary mb-0">The more you share, the smarter your recommendations.</p>
      </div>

      <Section title="Who you are" open={open.who} setOpen={(v) => setOpen((o) => ({ ...o, who: typeof v === 'function' ? v(o.who) : v }))} active={activeMap.who}>
        <label className="form-label">User ID</label>
        <select className="form-select mb-2" value={profile.userId || ''} onChange={(e) => setProfile((p) => ({ ...p, userId: Number(e.target.value) }))}>
          {users.map((u) => (
            <option key={u.userId} value={u.userId}>User {u.userId} ({u.num_ratings} ratings)</option>
          ))}
        </select>
        <div className="btn-group w-100">
          {['teen', 'adult', 'senior'].map((g) => (
            <button type="button" key={g} className={`btn ${profile.ageGroup === g ? 'btn-warning' : 'btn-outline-light'}`} onClick={() => setProfile((p) => ({ ...p, ageGroup: p.ageGroup === g ? null : g }))}>
              {g}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Your mood today" open={open.mood} setOpen={(v) => setOpen((o) => ({ ...o, mood: typeof v === 'function' ? v(o.mood) : v }))} active={activeMap.mood}>
        <div className="d-flex flex-wrap gap-2">
          {moodOptions.map((mood) => (
            <button type="button" key={mood} className={`btn btn-sm ${profile.moods.includes(mood) ? 'btn-warning' : 'btn-outline-light'}`} onClick={() => toggleMood(mood)}>
              {mood}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Time & era" open={open.era} setOpen={(v) => setOpen((o) => ({ ...o, era: typeof v === 'function' ? v(o.era) : v }))} active={activeMap.era}>
        <label className="form-label">Era start: {profile.eraStart}</label>
        <input type="range" className="form-range" min="1970" max="2024" value={profile.eraStart} onChange={(e) => setProfile((p) => ({ ...p, eraStart: Number(e.target.value) }))} />
        <label className="form-label">Era end: {profile.eraEnd}</label>
        <input type="range" className="form-range" min="1970" max="2024" value={profile.eraEnd} onChange={(e) => setProfile((p) => ({ ...p, eraEnd: Number(e.target.value) }))} />
        <div className="btn-group w-100">
          {['any', 'short', 'normal', 'epic'].map((r) => (
            <button type="button" key={r} className={`btn ${profile.runtime === r ? 'btn-warning' : 'btn-outline-light'}`} onClick={() => setProfile((p) => ({ ...p, runtime: r }))}>
              {r}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Quality floor" open={open.quality} setOpen={(v) => setOpen((o) => ({ ...o, quality: typeof v === 'function' ? v(o.quality) : v }))} active={activeMap.quality}>
        <label className="form-label">Min avg rating: {profile.ratingFloor.toFixed(1)}★</label>
        <input type="range" className="form-range" min="0.5" max="5" step="0.5" value={profile.ratingFloor} onChange={(e) => setProfile((p) => ({ ...p, ratingFloor: Number(e.target.value) }))} />
        <label className="form-label">Min vote count: {profile.minVoteCount}</label>
        <input type="range" className="form-range" min="10" max="5000" step="10" value={profile.minVoteCount} onChange={(e) => setProfile((p) => ({ ...p, minVoteCount: Number(e.target.value) }))} />
      </Section>

      <Section title="Language" open={open.language} setOpen={(v) => setOpen((o) => ({ ...o, language: typeof v === 'function' ? v(o.language) : v }))} active={activeMap.language}>
        <div className="btn-group w-100 flex-wrap">
          {[
            ['any', 'Any'],
            ['en', 'English'],
            ['hi', 'Hindi'],
            ['ko', 'Korean'],
            ['es', 'Spanish'],
            ['fr', 'French'],
          ].map(([key, label]) => (
            <button type="button" key={key} className={`btn ${profile.language === key ? 'btn-warning' : 'btn-outline-light'}`} onClick={() => setProfile((p) => ({ ...p, language: key }))}>
              {label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="CF method" open={open.method} setOpen={(v) => setOpen((o) => ({ ...o, method: typeof v === 'function' ? v(o.method) : v }))} active={activeMap.method}>
        <div className="btn-group w-100 mb-3">
          <button type="button" className={`btn ${profile.method === 'user' ? 'btn-danger' : 'btn-outline-light'}`} onClick={() => setProfile((p) => ({ ...p, method: 'user' }))}>
            User-Based
          </button>
          <button type="button" className={`btn ${profile.method === 'item' ? 'btn-danger' : 'btn-outline-light'}`} onClick={() => setProfile((p) => ({ ...p, method: 'item' }))}>
            Item-Based
          </button>
        </div>
        <label className="form-label">Top-N: {profile.topN}</label>
        <input type="range" className="form-range" min="5" max="20" value={profile.topN} onChange={(e) => setProfile((p) => ({ ...p, topN: Number(e.target.value) }))} />
      </Section>

      {error ? <div className="text-danger small">{error}</div> : null}
      <button className="btn btn-danger w-100 fw-semibold" type="submit" disabled={loading}>🎬 Get My Recommendations</button>
    </form>
  );
}
