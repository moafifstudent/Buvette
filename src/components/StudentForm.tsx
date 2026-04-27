'use client';

import { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { getReservationWindowStatus, isPastDateInTimeZone } from '@/lib/reservationWindow';

interface StudentFormProps {
  selectedDate: string;
  isAuthenticated: boolean;
  onSuccess: () => void;
}

export default function StudentForm({ selectedDate, isAuthenticated, onSuccess }: StudentFormProps) {
  const reservationTimeZone = process.env.NEXT_PUBLIC_RESERVATION_TIMEZONE || 'UTC';

  const [formData, setFormData] = useState({
    name: '',
    order: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [reservationState, setReservationState] = useState(() =>
    getReservationWindowStatus(new Date(), reservationTimeZone)
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setReservationState(getReservationWindowStatus(new Date(), reservationTimeZone));
    }, 30000);

    return () => clearInterval(intervalId);
  }, [reservationTimeZone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!reservationState.isOpen) {
      setError(
        `Reservations are open daily from ${reservationState.windowLabel} (${reservationState.timeZone}).`
      );
      return;
    }

    if (!isAuthenticated) {
      setError('Please sign in as admin to add orders.');
      return;
    }

    if (isPastDateInTimeZone(selectedDate, new Date(), reservationTimeZone)) {
      setError(`You can reserve only for today or future days (${reservationState.timeZone}).`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: selectedDate,
        }),
      });

      if (res.ok) {
        setFormData({ name: '', order: '' });
        onSuccess();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to add student order.');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      setError('Network error while adding student order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card animate-fade-in">
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <UserPlus size={24} className="text-primary" />
        New Order
      </h2>
      <form onSubmit={handleSubmit}>
        {!reservationState.isOpen && (
          <p style={{ marginBottom: '1rem', color: '#ef4444', fontWeight: 600 }}>
            Reservations are closed now. Opening hours: {reservationState.windowLabel} ({reservationState.timeZone}).
          </p>
        )}

        {reservationState.isOpen && !isAuthenticated && (
          <p style={{ marginBottom: '1rem', color: '#f59e0b', fontWeight: 600 }}>
            Sign in as admin to add orders.
          </p>
        )}

        {error && (
          <p style={{ marginBottom: '1rem', color: '#ef4444' }}>
            {error}
          </p>
        )}

        <div className="form-group">
          <label>Student Name</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!reservationState.isOpen || !isAuthenticated || loading}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Order Detail</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="e.g. Coffee + Sandwich"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: e.target.value })}
              disabled={!reservationState.isOpen || !isAuthenticated || loading}
              required
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading || !reservationState.isOpen || !isAuthenticated}>
          {loading
            ? 'Adding...'
            : !reservationState.isOpen
              ? 'Reservations Closed'
              : !isAuthenticated
                ? 'Admin Login Required'
                : 'Add Student Order'}
        </button>
      </form>
    </div>
  );
}
