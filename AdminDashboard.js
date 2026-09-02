'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const STATUS_LABELS = {
  pledged: 'Pledged',
  partially_received: 'Partially Received',
  received: 'Received',
  cancelled: 'Cancelled',
};

const STATUS_COLORS = {
  pledged: 'bg-yellow-100 text-yellow-800',
  partially_received: 'bg-blue-100 text-blue-800',
  received: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-200 text-gray-600',
};

export default function AdminDashboard() {
  const [pledges, setPledges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState({});
  const router = useRouter();

  async function loadPledges() {
    setLoading(true);
    const res = await fetch('/api/pledges');
    if (res.status === 401) {
      router.push('/admin/login');
      return;
    }
    const data = await res.json();
    setPledges(data);
    setLoading(false);
  }

  useEffect(() => {
    loadPledges();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return pledges;
    return pledges.filter((p) => p.status === filter);
  }, [pledges, filter]);

  const totals = useMemo(() => {
    const active = pledges.filter((p) => p.status !== 'cancelled');
    const totalPledged = active.reduce((s, p) => s + Number(p.amountPledged), 0);
    const totalReceived = active.reduce((s, p) => s + Number(p.amountReceived), 0);
    return {
      totalPledged,
      totalReceived,
      outstanding: totalPledged - totalReceived,
      count: pledges.length,
    };
  }, [pledges]);

  function startEdit(p) {
    setEditing({
      ...editing,
      [p.id]: {
        status: p.status,
        amountReceived: p.amountReceived,
        paymentMethod: p.paymentMethod,
      },
    });
  }

  function updateEditField(id, field, value) {
    setEditing({ ...editing, [id]: { ...editing[id], [field]: value } });
  }

  async function saveEdit(id) {
    const payload = editing[id];
    const res = await fetch(`/api/pledges/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const updated = { ...editing };
      delete updated[id];
      setEditing(updated);
      loadPledges();
    }
  }

  function cancelEdit(id) {
    const updated = { ...editing };
    delete updated[id];
    setEditing(updated);
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  const fmt = (n) =>
    Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Pledge Dashboard</h1>
        <div className="flex items-center gap-4">
          <a href="/progress" className="text-sm text-blue-600 underline">
            View public progress page
          </a>
          <a
            href="/api/pledges/export"
            className="text-sm bg-gray-800 text-white px-3 py-1.5 rounded-lg hover:bg-gray-900"
          >
            Export CSV
          </a>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 underline"
          >
            Log out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500">Total Pledged</p>
          <p className="text-xl font-bold">{fmt(totals.totalPledged)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500">Total Received</p>
          <p className="text-xl font-bold text-green-700">{fmt(totals.totalReceived)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500">Outstanding</p>
          <p className="text-xl font-bold text-yellow-700">{fmt(totals.outstanding)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500">Total Pledges</p>
          <p className="text-xl font-bold">{totals.count}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'pledged', 'partially_received', 'received', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              filter === f
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            {f === 'all' ? 'All' : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-100 text-gray-500">
                <th className="p-3">Donor</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Method</th>
                <th className="p-3">Pledged</th>
                <th className="p-3">Received</th>
                <th className="p-3">Status</th>
                <th className="p-3">Notes</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const edit = editing[p.id];
                return (
                  <tr key={p.id} className="border-b border-gray-50 align-top">
                    <td className="p-3 font-medium">{p.donorName}</td>
                    <td className="p-3 text-gray-500">{p.donorContact || '-'}</td>
                    <td className="p-3">
                      {edit ? (
                        <select
                          value={edit.paymentMethod}
                          onChange={(e) =>
                            updateEditField(p.id, 'paymentMethod', e.target.value)
                          }
                          className="border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="venmo">Venmo</option>
                          <option value="cash">Cash</option>
                        </select>
                      ) : (
                        <span className="capitalize">{p.paymentMethod}</span>
                      )}
                    </td>
                    <td className="p-3">{fmt(p.amountPledged)}</td>
                    <td className="p-3">
                      {edit ? (
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={edit.amountReceived}
                          onChange={(e) =>
                            updateEditField(p.id, 'amountReceived', e.target.value)
                          }
                          className="border border-gray-300 rounded px-2 py-1 w-24"
                        />
                      ) : (
                        fmt(p.amountReceived)
                      )}
                    </td>
                    <td className="p-3">
                      {edit ? (
                        <select
                          value={edit.status}
                          onChange={(e) => updateEditField(p.id, 'status', e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1"
                        >
                          {Object.entries(STATUS_LABELS).map(([val, label]) => (
                            <option key={val} value={val}>
                              {label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[p.status]}`}
                        >
                          {STATUS_LABELS[p.status]}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-gray-500 max-w-[160px] truncate" title={p.notes || ''}>
                      {p.notes || '-'}
                    </td>
                    <td className="p-3">
                      {edit ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(p.id)}
                            className="text-green-700 text-xs font-medium underline"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => cancelEdit(p.id)}
                            className="text-gray-500 text-xs underline"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(p)}
                          className="text-blue-700 text-xs font-medium underline"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-gray-400">
                    No pledges found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
