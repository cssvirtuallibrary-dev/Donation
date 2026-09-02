'use client';

import { useState } from 'react';

const initialForm = {
  donorName: '',
  donorContact: '',
  amountPledged: '',
  paymentMethod: 'venmo',
  notes: '',
};

export default function Home() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');
    try {
      const res = await fetch('/api/pledges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong');
        setStatus('error');
        return;
      }
      setStatus('success');
      setForm(initialForm);
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1 text-center">Make a Pledge</h1>
      <p className="text-gray-500 text-center mb-6">
        Fill out the form below to pledge your donation.
      </p>

      {status === 'success' ? (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 text-center">
          <p className="font-semibold">Thank you!</p>
          <p className="text-sm mt-1">
            Your pledge has been recorded. An administrator will confirm once
            payment is received.
          </p>
          <button
            onClick={() => setStatus(null)}
            className="mt-3 text-sm underline"
          >
            Submit another pledge
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white p-5 rounded-xl shadow-sm border border-gray-100"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name *
            </label>
            <input
              required
              name="donorName"
              value={form.donorName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email or Phone (optional)
            </label>
            <input
              name="donorContact"
              value={form.donorContact}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pledge Amount ($) *
            </label>
            <input
              required
              type="number"
              min="1"
              step="0.01"
              name="amountPledged"
              value={form.amountPledged}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 flex-1 cursor-pointer has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="venmo"
                  checked={form.paymentMethod === 'venmo'}
                  onChange={handleChange}
                />
                Venmo
              </label>
              <label className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 flex-1 cursor-pointer has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={form.paymentMethod === 'cash'}
                  onChange={handleChange}
                />
                Cash
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {status === 'submitting' ? 'Submitting...' : 'Submit Pledge'}
          </button>
        </form>
      )}

      <p className="text-center mt-6 text-xs text-gray-400">
        <a href="/progress" className="underline">
          View progress
        </a>
        {' · '}
        <a href="/admin" className="underline">
          Administrator login
        </a>
      </p>
    </main>
  );
}
