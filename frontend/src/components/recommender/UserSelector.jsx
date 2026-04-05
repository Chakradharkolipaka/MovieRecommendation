import React from 'react';

export default function UserSelector({ users, value, onChange }) {
  return (
    <div>
      <label className="form-label">Select User</label>
      <select
        className="form-select"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Select user"
      >
        {users.map((user) => (
          <option key={user.userId} value={user.userId}>
            User {user.userId} ({user.num_ratings} ratings)
          </option>
        ))}
      </select>
    </div>
  );
}
