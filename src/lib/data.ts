import { prisma } from './prisma';

export interface Student {
  id: string;
  name: string;
  order: string;
  date: string;
}

interface CreateStudentInput {
  name: string;
  order: string;
  date?: string;
}

function parseDateOnly(dateStr: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateStr.split('-').map(Number);
  return { year, month, day };
}

export const getStudents = async (): Promise<Student[]> => {
  const students = await prisma.student.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return students.map((s: any) => ({
    id: s.id,
    name: s.name,
    order: s.order,
    date: s.createdAt.toISOString(),
  }));
};

export const addStudent = async (student: CreateStudentInput): Promise<Student> => {
  const now = new Date();
  let createdAt = now;

  if (student.date) {
    const { year, month, day } = parseDateOnly(student.date);
    createdAt = new Date(
      year,
      month - 1,
      day,
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds()
    );
  }

  const newStudent = await prisma.student.create({
    data: {
      name: student.name,
      order: student.order,
      createdAt,
    },
  });

  return {
    id: newStudent.id,
    name: newStudent.name,
    order: newStudent.order,
    date: newStudent.createdAt.toISOString(),
  };
};

export const getStudentsByDate = async (dateStr: string): Promise<Student[]> => {
  const { year, month, day } = parseDateOnly(dateStr);
  const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
  const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

  const students = await prisma.student.findMany({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return students.map((s: any) => ({
    id: s.id,
    name: s.name,
    order: s.order,
    date: s.createdAt.toISOString(),
  }));
};

export const deleteStudent = async (studentId: string): Promise<void> => {
  await prisma.student.delete({
    where: {
      id: studentId,
    },
  });
};
