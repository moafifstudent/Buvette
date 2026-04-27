'use client';

import { Student } from '@/lib/data';
import { format } from 'date-fns';
import { Users, Calendar } from 'lucide-react';

interface StudentListProps {
  students: Student[];
}

export default function StudentList({ students }: StudentListProps) {
  return (
    <div className="glass-card animate-fade-in" style={{ marginTop: '2rem' }}>
      <div className="header-actions">
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={24} />
          Today's Orders
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
          <Calendar size={16} />
          {format(new Date(), 'MMMM dd, yyyy')}
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
                <th>Class</th>
                <th>Order</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td style={{ fontWeight: 600 }}>{student.name}</td>
                  <td>{student.class}</td>
                  <td>{student.order}</td>
                  <td>
                    <span className="badge badge-success">Confirmed</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
