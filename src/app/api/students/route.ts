import { NextResponse } from 'next/server';
import { getStudents, addStudent, getStudentsByDate } from '@/lib/data';

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
    const body = await request.json();
    if (!body.name || !body.class || !body.order) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const student = await addStudent(body);
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add student' }, { status: 500 });
  }
}
