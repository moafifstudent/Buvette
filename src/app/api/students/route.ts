import { NextResponse } from 'next/server';
import { getStudents, addStudent, getStudentsByDate, deleteStudent } from '@/lib/data';
import { getReservationWindowStatus, isPastDateInTimeZone } from '@/lib/reservationWindow';
import { cookies } from 'next/headers';
import { getAuthCookieName, verifyAuthToken } from '@/lib/auth';

const RESERVATION_TIMEZONE =
  process.env.RESERVATION_TIMEZONE || process.env.NEXT_PUBLIC_RESERVATION_TIMEZONE || 'UTC';

async function requireAdminSession() {
  const token = (await cookies()).get(getAuthCookieName())?.value;
  return verifyAuthToken(token);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    let students;
    if (date) {
      students = await getStudentsByDate(date);
    } else {
      students = await getStudents();
    }
    
    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reservationWindow = getReservationWindowStatus(new Date(), RESERVATION_TIMEZONE);

    if (!reservationWindow.isOpen) {
      return NextResponse.json(
        {
          error: `Reservations are allowed only between ${reservationWindow.windowLabel} (${reservationWindow.timeZone}).`,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    if (!body.name || !body.order) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (body.date && isPastDateInTimeZone(body.date, new Date(), RESERVATION_TIMEZONE)) {
      return NextResponse.json(
        { error: `Reservation date cannot be in the past (${RESERVATION_TIMEZONE}).` },
        { status: 400 }
      );
    }

    const student = await addStudent(body);
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add student' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await requireAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing student id' }, { status: 400 });
    }

    await deleteStudent(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete student order' }, { status: 500 });
  }
}
