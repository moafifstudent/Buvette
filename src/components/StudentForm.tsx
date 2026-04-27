'use client';

import { useState } from 'react';
import { UserPlus, Coffee, BookOpen } from 'lucide-react';

interface StudentFormProps {
  onSuccess: () => void;
}

export default function StudentForm({ onSuccess }: StudentFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    order: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({ name: '', class: '', order: '' });
        onSuccess();
      }
    } catch (error) {
      console.error('Error adding student:', error);
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
        <div className="form-group">
          <label>Student Name</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Class / Department</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="e.g. Computer Science"
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
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
              required
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Adding...' : 'Add Student Order'}
        </button>
      </form>
    </div>
  );
}
