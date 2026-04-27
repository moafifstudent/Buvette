'use client';

import { useEffect, useState } from 'react';
import { Student } from '@/lib/data';
import { format } from 'date-fns';
import { Users, Calendar, Trash2 } from 'lucide-react';

interface StudentListProps {
  students: Student[];
  selectedDate: string;
  onDelete: (id: string) => Promise<void>;
  isAuthenticated: boolean;
}

export default function StudentList({ students, selectedDate, onDelete, isAuthenticated }: StudentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Student | null>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setConfirmTarget(null);
      }
    };

    if (confirmTarget) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [confirmTarget]);

  const handleDelete = async (id: string) => {
    if (!isAuthenticated) {
      return;
    }

    const student = students.find((item) => item.id === id);
    if (!student) {
      return;
    }

    setConfirmTarget(student);
  };

  const confirmDelete = async () => {
    if (!confirmTarget) {
      return;
    }

    setDeletingId(confirmTarget.id);
    try {
      await onDelete(confirmTarget.id);
      setConfirmTarget(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="glass-card animate-fade-in" style={{ marginTop: '2rem' }}>
      <div className="header-actions">
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={24} />
          Student Orders
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
          <Calendar size={16} />
          {format(new Date(selectedDate), 'MMMM dd, yyyy')}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        {students.length === 0 ? (
          <div className="empty-state">
            <p>No orders yet today.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Order</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td style={{ fontWeight: 600 }}>{student.name}</td>
                  <td>{student.order}</td>
                  <td>
                    <span className="badge badge-success">Confirmed</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleDelete(student.id)}
                      disabled={deletingId === student.id || !isAuthenticated}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        borderRadius: '0.6rem',
                        padding: '0.35rem 0.6rem',
                        cursor: deletingId === student.id ? 'not-allowed' : 'pointer',
                        opacity: deletingId === student.id ? 0.7 : 1,
                      }}
                    >
                      <Trash2 size={14} />
                      {deletingId === student.id ? 'Deleting...' : isAuthenticated ? 'Delete' : 'Login Required'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {confirmTarget && (
        <div className="confirm-overlay" role="presentation" onClick={() => setConfirmTarget(null)}>
          <div
            className="confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-order-title"
            aria-describedby="delete-order-description"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="delete-order-title">Delete Student Order?</h3>
            <p id="delete-order-description">
              This will permanently remove <strong>{confirmTarget.name}</strong>'s order.
            </p>
            <div className="confirm-actions">
              <button type="button" className="btn-secondary" onClick={() => setConfirmTarget(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={confirmDelete}
                disabled={deletingId === confirmTarget.id}
              >
                <Trash2 size={16} />
                {deletingId === confirmTarget.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
