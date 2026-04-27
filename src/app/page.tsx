'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import StudentForm from '@/components/StudentForm';
import StudentList from '@/components/StudentList';
import ExportButton from '@/components/ExportButton';
import AuthPanel from '@/components/AuthPanel';
import { Student } from '@/lib/data';
import { Calendar as CalendarIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchStudents = async (date?: string) => {
    setLoading(true);
    try {
      const url = date ? `/api/students?date=${date}` : '/api/students';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    const refreshAuth = async () => {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(Boolean(data.authenticated));
      }
    };

    refreshAuth();
  }, []);

  const handleDeleteOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/students?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchStudents(selectedDate);
      }
    } catch (error) {
      console.error('Failed to delete order:', error);
    }
  };

  return (
    <main className="container">
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              padding: '0.75rem 1rem',
              borderRadius: '1rem',
              boxShadow: '0 10px 20px rgba(15, 23, 42, 0.12)',
              border: '1px solid rgba(148, 163, 184, 0.25)',
            }}
          >
            <Image
              src="/ensam-logo.png"
              alt="ENSAM Logo"
              width={220}
              height={72}
              priority
              style={{ height: 'auto', width: 'auto', maxWidth: '100%' }}
            />
          </div>
        </div>
        <h1>Buvette Management</h1>
        <p className="subtitle">Daily Student Orders Tracker</p>
      </header>

      <AuthPanel onAuthChange={() => setIsAuthenticated((value) => !value)} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 350px', gap: '2rem', alignItems: 'start' }}>
          <div className="glass-card">
            <div className="header-actions" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={20} />
                Filter by Day
              </h2>
            </div>
            <div className="form-group">
              <label>Select Date</label>
              <div style={{ position: 'relative', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <CalendarIcon size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
                <ExportButton students={students} />
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
              Viewing orders for: <strong>{format(new Date(selectedDate), 'MMMM dd, yyyy')}</strong>
            </p>
          </div>

          <StudentForm
            selectedDate={selectedDate}
            onSuccess={() => fetchStudents(selectedDate)}
            isAuthenticated={isAuthenticated}
          />
        </div>

        {loading ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
            <div className="loading-spinner"></div>
            <p style={{ marginTop: '1rem' }}>Loading daily orders...</p>
          </div>
        ) : (
          <StudentList
            students={students}
            selectedDate={selectedDate}
            onDelete={handleDeleteOrder}
            isAuthenticated={isAuthenticated}
          />
        )}
      </div>

      <footer style={{ marginTop: '4rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
        &copy; {new Date().getFullYear()} Buvette Application. Fully managed backend.
      </footer>
    </main>
  );
}
