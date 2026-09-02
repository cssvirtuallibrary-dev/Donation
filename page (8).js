'use client';

import { useEffect, useState } from 'react';

export default function ProgressPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/progress')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load progress right now.');
        setLoading(false);
      });
  }, []);

  const fmt = (n) =>
    Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const pct =
    data && data.totalPledged > 0
      ? Math.min(100, Math.round((data.totalReceived / data.totalPledged) * 100))
      : 0;

  return (
    <main className="max-w-md mx-auto p-6 mt-10">
      <h1 className="text-2xl font-bold mb-1 text-center">Fundraising Progress</h1>
      <p className="text-gray-500 text-center mb-6 text-sm">
        Live totals across all pledges — donor details are kept private.
      </p>

      {loading && <p className="text-center text-gray-400">Loading...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {data && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-5">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">Received</span>
              <span className="text-gray-500">{pct}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
              <div
                className="bg-green-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500">Total Pledged</p>
              <p className="text-xl font-bold">{fmt(data.totalPledged)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Received</p>
              <p className="text-xl font-bold text-green-700">
                {fmt(data.totalReceived)}
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400">
            {data.pledgeCount} pledge{data.pledgeCount === 1 ? '' : 's'} so far
          </p>
        </div>
      )}

      <p className="text-center mt-6 text-xs text-gray-400">
        <a href="/" className="underline">
          Make a pledge
        </a>
        {' · '}
        <a href="/admin" className="underline">
          Administrator login
        </a>
      </p>
    </main>
  );
}
